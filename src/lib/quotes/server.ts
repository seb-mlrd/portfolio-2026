import 'server-only'
import { prisma } from '@/lib/prisma'
import { createPrintToken, signHmac, verifyBearer, verifyPrintToken } from './crypto'
import { addDays, todayParis } from './dates'
import { quoteInclude } from './view'

function env(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Variable d'environnement ${name} manquante`)
  return value
}

export const getQuote = (id: string) => prisma.quote.findUnique({ where: { id }, include: quoteInclude })

export const getQuoteByToken = (publicToken: string) =>
  prisma.quote.findUnique({ where: { publicToken }, include: quoteInclude })

export const logEvent = (quoteId: string, type: string, message: string) =>
  prisma.quoteEvent.create({ data: { quoteId, type, message } })

const trim = (url: string) => url.replace(/\/+$/, '')

export const publicQuoteUrl = (publicToken: string) => `${trim(env('APP_PUBLIC_URL'))}/devis/public/${publicToken}`
export const publicPdfUrl = (publicToken: string) => `${publicQuoteUrl(publicToken)}/pdf`

export const printPath = (id: string) =>
  `/devis/${id}/print?token=${createPrintToken(id, env('QUOTE_PRINT_SECRET'))}`
export const printUrl = (id: string) => `${trim(env('APP_INTERNAL_URL'))}${printPath(id)}`
export const isPrintTokenValid = (token: string, id: string) => verifyPrintToken(token, id, env('QUOTE_PRINT_SECRET'))

/** Réponse 401 si la requête ne porte pas la clé de n8n, null sinon */
export function rejectUnlessN8n(request: Request): Response | null {
  if (verifyBearer(request.headers.get('authorization'), process.env.N8N_API_KEY)) return null
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}

export type WebhookResult = { ok: true } | { ok: false; timedOut: boolean; error: string }

const WEBHOOKS = {
  'quote.send': 'N8N_WEBHOOK_SEND_QUOTE_URL',
  'quote.accepted': 'N8N_WEBHOOK_QUOTE_ACCEPTED_URL',
} as const

export async function callN8n(event: keyof typeof WEBHOOKS, quoteId: string): Promise<WebhookResult> {
  try {
    const body = JSON.stringify({ quoteId, event, timestamp: Date.now() })
    const res = await fetch(env(WEBHOOKS[event]), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Signature': signHmac(body, env('N8N_WEBHOOK_SECRET')) },
      body,
      redirect: 'error',
      signal: AbortSignal.timeout(10_000),
    })
    if (res.ok) return { ok: true }
    return { ok: false, timedOut: false, error: `n8n a répondu ${res.status}` }
  } catch (e) {
    console.error(`Webhook n8n ${event}`, e)
    const timedOut = e instanceof Error && e.name === 'TimeoutError'
    return { ok: false, timedOut, error: timedOut ? "n8n n'a pas répondu à temps" : 'n8n est injoignable ou mal configuré' }
  }
}

/** Le client a accepté : l'échec du webhook n'annule rien, il se renvoie depuis l'admin */
export async function notifyAccepted(quoteId: string): Promise<WebhookResult> {
  const result = await callN8n('quote.accepted', quoteId)
  await logEvent(
    quoteId,
    result.ok ? 'webhook_accepted_ok' : 'webhook_accepted_failed',
    result.ok ? "Notification d'acceptation transmise à n8n" : `Notification d'acceptation échouée : ${result.error}`,
  )
  return result
}

/** Supprime, un an après l'envoi, les PDF des devis refusés, expirés ou remplacés (jamais les acceptés) */
export async function purgeOldPdfs() {
  const where = {
    sentAt: { lt: addDays(new Date(), -365) },
    OR: [
      { status: 'REFUSED' as const },
      { status: 'SENT' as const, validUntil: { lt: todayParis() } },
      { status: 'SENT' as const, child: { is: { sentAt: { not: null } } } },
    ],
    pdf: { isNot: null },
  }
  const ids = (await prisma.quote.findMany({ where, select: { id: true } })).map((q) => q.id)
  if (ids.length === 0) return
  await prisma.$transaction([
    prisma.quotePdf.deleteMany({ where: { quoteId: { in: ids } } }),
    prisma.quote.updateMany({ where: { id: { in: ids } }, data: { pdfUrl: null } }),
    prisma.quoteEvent.createMany({
      data: ids.map((quoteId) => ({ quoteId, type: 'pdf_purged', message: 'PDF supprimé (plus d’un an après l’envoi)' })),
    }),
  ])
}

export async function pdfResponse(quoteId: string, number: string): Promise<Response> {
  const pdf = await prisma.quotePdf.findUnique({ where: { quoteId } })
  if (!pdf) return new Response('PDF indisponible', { status: 404 })
  return new Response(new Uint8Array(pdf.data), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${number}.pdf"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex',
    },
  })
}
