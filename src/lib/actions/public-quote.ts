'use server'

// Actions publiques : le publicToken (256 bits) fait office d'autorisation
import { headers } from 'next/headers'
import { after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { isIP } from 'node:net'
import { prisma } from '@/lib/prisma'
import { formatDateTime } from '@/lib/quotes/dates'
import { acceptSchema, refuseSchema } from '@/lib/quotes/schema'
import { logEvent, notifyAccepted } from '@/lib/quotes/server'
import { openQuoteWhere } from '@/lib/quotes/status'

type Result = { error: string } | { ok: true }

const CLOSED = 'Ce devis n’est plus disponible à la signature. Rechargez la page pour voir son statut.'

/** IP posée par le reverse proxy, qui doit écraser toute valeur envoyée par le visiteur */
async function clientIp(): Promise<string | null> {
  const value = (await headers()).get(process.env.CLIENT_IP_HEADER || 'x-real-ip')?.trim() ?? ''
  return isIP(value) ? value : null
}

const findOpen = (publicToken: string) =>
  prisma.quote.findFirst({ where: { publicToken, ...openQuoteWhere() }, select: { id: true } })

export async function acceptQuote(publicToken: string, input: { signerName: string; agreed: boolean }): Promise<Result> {
  const parsed = acceptSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const quote = typeof publicToken === 'string' ? await findOpen(publicToken) : null
  if (!quote) return { error: CLOSED }

  const acceptedAt = new Date()
  const signerIp = await clientIp()
  const { signerName } = parsed.data
  // Le filtre est répété dans l'UPDATE : un double clic ou un refus simultané ne passe qu'une fois
  const { count } = await prisma.quote.updateMany({
    where: { id: quote.id, ...openQuoteWhere() },
    data: { status: 'ACCEPTED', acceptedAt, signerName, signerIp },
  })
  if (count !== 1) return { error: CLOSED }

  await logEvent(quote.id, 'accepted', `Bon pour accord de ${signerName} le ${formatDateTime(acceptedAt)}, IP ${signerIp ?? 'inconnue'}`)
  after(() => notifyAccepted(quote.id))
  revalidatePath('/admin/devis', 'layout')
  revalidatePath(`/devis/public/${publicToken}`)
  return { ok: true }
}

export async function refuseQuote(publicToken: string, input: { reason: string }): Promise<Result> {
  const parsed = refuseSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const quote = typeof publicToken === 'string' ? await findOpen(publicToken) : null
  if (!quote) return { error: CLOSED }

  const reason = parsed.data.reason || null
  const { count } = await prisma.quote.updateMany({
    where: { id: quote.id, ...openQuoteWhere() },
    data: { status: 'REFUSED', refusedAt: new Date(), refusalReason: reason },
  })
  if (count !== 1) return { error: CLOSED }

  await logEvent(quote.id, 'refused', reason ? `Refusé par le client : ${reason}` : 'Refusé par le client')
  revalidatePath('/admin/devis', 'layout')
  revalidatePath(`/devis/public/${publicToken}`)
  return { ok: true }
}
