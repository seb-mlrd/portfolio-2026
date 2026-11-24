'use server'

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { newPublicToken } from '@/lib/quotes/crypto'
import { addDays, formatDay, todayParis } from '@/lib/quotes/dates'
import { formatQuoteNumber, nextSequence } from '@/lib/quotes/numbering'
import { fieldErrors, quoteSchema, type QuoteFormData, type QuoteFormInput } from '@/lib/quotes/schema'
import { callN8n, logEvent, notifyAccepted } from '@/lib/quotes/server'
import { getSettings, isIssuerComplete, type Settings } from '@/lib/quotes/settings'
import { isEditable, QuoteLockedError, SEND_TIMEOUT_MS, updateDraft } from '@/lib/quotes/status'
import { computeTotals } from '@/lib/quotes/totals'
import { clientSnapshot, issuerSnapshot } from '@/lib/quotes/view'
import { requireAdmin } from './_utils'

type ActionResult = { error: string } | { ok: true }

const refresh = () => revalidatePath('/admin/devis', 'layout')

function buildQuote(data: QuoteFormData, settings: Settings) {
  const { vatEnabled, vatRateBps, vatMention } = settings
  const lines = data.lines.map((l) => ({ quantityHundredths: l.quantity, unitPriceCents: l.unitPrice }))
  const { lineTotals, ...totals } = computeTotals({ lines, depositPercent: data.depositPercent, vatEnabled, vatRateBps })
  return {
    fields: {
      clientId: data.clientId,
      issueDate: data.issueDate,
      validUntil: data.validUntil,
      paymentTerms: data.paymentTerms,
      depositPercent: data.depositPercent,
      notes: data.notes || null,
      vatEnabled,
      vatRateBps,
      vatMention,
      ...totals,
    },
    lines: data.lines.map((l, position) => ({
      serviceId: l.serviceId,
      label: l.label,
      description: l.description || null,
      quantityHundredths: l.quantity,
      unit: l.unit,
      unitPriceCents: l.unitPrice,
      totalCents: lineTotals[position],
      position,
    })),
  }
}

export async function saveQuote(id: string | null, input: QuoteFormInput): Promise<{ errors: Record<string, string> }> {
  await requireAdmin()
  const parsed = quoteSchema.safeParse(input)
  if (!parsed.success) return { errors: fieldErrors(parsed.error) }
  const { fields, lines } = buildQuote(parsed.data, await getSettings())

  let savedId: string
  try {
    savedId = await prisma.$transaction(async (tx) => {
      if (id) {
        // En premier : verrouille la ligne pour la durée de la transaction
        await updateDraft(tx, id, fields)
        await tx.quoteLine.deleteMany({ where: { quoteId: id } })
        await tx.quoteLine.createMany({ data: lines.map((l) => ({ ...l, quoteId: id })) })
        await tx.quoteEvent.create({ data: { quoteId: id, type: 'updated', message: 'Devis modifié' } })
        return id
      }
      const year = todayParis().getUTCFullYear()
      const sequence = await nextSequence(tx, year)
      const quote = await tx.quote.create({
        data: {
          ...fields,
          number: formatQuoteNumber(year, sequence),
          year,
          sequence,
          publicToken: newPublicToken(),
          lines: { create: lines },
          events: { create: { type: 'created', message: 'Devis créé' } },
        },
      })
      return quote.id
    })
  } catch (e) {
    if (e instanceof QuoteLockedError) return { errors: { form: e.message } }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
      return { errors: { form: 'Le client ou une prestation du catalogue n’existe plus. Recharge la page.' } }
    }
    throw e
  }
  refresh()
  redirect(`/admin/devis/${savedId}`)
}

export async function createVersion(id: string): Promise<ActionResult> {
  await requireAdmin()
  const source = await prisma.quote.findUnique({ where: { id }, include: { lines: true, child: true } })
  if (!source) return { error: 'Devis introuvable' }
  if (source.status === 'DRAFT') return { error: 'Ce devis est encore un brouillon : modifie-le directement.' }
  if (source.child) return { error: `Une version plus récente existe déjà : ${source.child.number}` }

  const settings = await getSettings()
  const issueDate = todayParis()
  const { vatEnabled, vatRateBps, vatMention } = settings
  const { lineTotals, ...totals } = computeTotals({ lines: source.lines, depositPercent: source.depositPercent, vatEnabled, vatRateBps })
  const version = source.version + 1

  let newId: string
  try {
    const quote = await prisma.quote.create({
      data: {
        number: formatQuoteNumber(source.year, source.sequence, version),
        year: source.year,
        sequence: source.sequence,
        version,
        parentId: source.id,
        publicToken: newPublicToken(),
        clientId: source.clientId,
        issueDate,
        validUntil: addDays(issueDate, 30),
        paymentTerms: source.paymentTerms,
        depositPercent: source.depositPercent,
        notes: source.notes,
        vatEnabled,
        vatRateBps,
        vatMention,
        ...totals,
        lines: {
          create: source.lines.map((l, i) => ({
            serviceId: l.serviceId,
            label: l.label,
            description: l.description,
            quantityHundredths: l.quantityHundredths,
            unit: l.unit,
            unitPriceCents: l.unitPriceCents,
            totalCents: lineTotals[i],
            position: l.position,
          })),
        },
        events: { create: { type: 'created', message: `Nouvelle version de ${source.number}` } },
      },
    })
    newId = quote.id
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { error: 'Une version plus récente vient d’être créée.' }
    }
    throw e
  }
  await logEvent(id, 'version_created', `Version ${version} créée`)
  refresh()
  redirect(`/admin/devis/${newId}/modifier`)
}

export async function sendQuote(id: string): Promise<ActionResult> {
  await requireAdmin()
  const [quote, settings] = await Promise.all([
    prisma.quote.findUnique({ where: { id }, include: { client: true } }),
    getSettings(),
  ])
  if (!quote) return { error: 'Devis introuvable' }
  if (!isIssuerComplete(settings)) return { error: 'Complète d’abord tes informations d’émetteur dans les réglages.' }
  if (quote.validUntil < todayParis()) return { error: `La validité (${formatDay(quote.validUntil)}) est dépassée : modifie-la avant l’envoi.` }

  const sendRequestedAt = new Date()
  const stale = new Date(Date.now() - SEND_TIMEOUT_MS)
  // updatedAt : si le devis a été modifié depuis sa lecture, rien ne part
  const { count } = await prisma.quote.updateMany({
    where: {
      id,
      status: 'DRAFT',
      updatedAt: quote.updatedAt,
      OR: [{ sendRequestedAt: null }, { sendRequestedAt: { lt: stale } }],
    },
    data: {
      sendRequestedAt,
      // Une relance garde les copies figées lors du premier envoi
      ...(isEditable(quote) && { issuerSnapshot: issuerSnapshot(settings), clientSnapshot: clientSnapshot(quote.client) }),
    },
  })
  if (count !== 1) return { error: 'Ce devis est déjà envoyé ou en cours d’envoi.' }

  const result = await callN8n('quote.send', id)
  if (result.ok) {
    await logEvent(id, 'send_requested', 'Envoi confié à n8n')
    refresh()
    return { ok: true }
  }
  // Sans réponse (ou lors d'une relance), n8n a pu déjà traiter l'envoi : on garde le verrou
  if (!result.timedOut && isEditable(quote)) {
    await prisma.quote.updateMany({ where: { id, status: 'DRAFT', sendRequestedAt }, data: { sendRequestedAt: null } })
  }
  await logEvent(id, 'send_failed', `Envoi échoué : ${result.error}`)
  refresh()
  return { error: result.timedOut ? `${result.error}. Vérifie n8n ; relance possible dans 10 minutes.` : result.error }
}

/** Rend modifiable un devis dont l'envoi n'a jamais abouti */
export async function cancelSend(id: string): Promise<ActionResult> {
  await requireAdmin()
  const { count } = await prisma.quote.updateMany({
    where: { id, status: 'DRAFT', sendRequestedAt: { lt: new Date(Date.now() - SEND_TIMEOUT_MS) } },
    data: { sendRequestedAt: null },
  })
  if (count !== 1) return { error: 'L’envoi ne peut pas être annulé maintenant.' }
  await prisma.quotePdf.deleteMany({ where: { quoteId: id } })
  await logEvent(id, 'send_cancelled', 'Envoi annulé, devis à nouveau modifiable')
  refresh()
  return { ok: true }
}

export async function markRefused(id: string): Promise<ActionResult> {
  await requireAdmin()
  const { count } = await prisma.quote.updateMany({
    where: { id, status: 'SENT' },
    data: { status: 'REFUSED', refusedAt: new Date() },
  })
  if (count !== 1) return { error: 'Seul un devis envoyé peut être marqué comme refusé.' }
  await logEvent(id, 'refused', 'Marqué comme refusé depuis l’admin')
  refresh()
  return { ok: true }
}

export async function setArchived(id: string, archived: boolean): Promise<ActionResult> {
  await requireAdmin()
  await prisma.quote.update({ where: { id }, data: { archivedAt: archived ? new Date() : null } })
  await logEvent(id, archived ? 'archived' : 'unarchived', archived ? 'Archivé' : 'Désarchivé')
  refresh()
  return { ok: true }
}

export async function resendAcceptedWebhook(id: string): Promise<ActionResult> {
  await requireAdmin()
  const quote = await prisma.quote.findFirst({ where: { id, status: 'ACCEPTED' }, select: { id: true } })
  if (!quote) return { error: 'Ce devis n’est pas accepté.' }
  const result = await notifyAccepted(id)
  refresh()
  return result.ok ? { ok: true } : { error: result.error }
}
