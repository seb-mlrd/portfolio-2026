import type { Prisma, QuoteStatus } from '@prisma/client'
import { todayParis } from './dates.ts'

export type DisplayStatus = 'brouillon' | 'envoi' | 'envoyé' | 'accepté' | 'refusé' | 'expiré' | 'remplacé'

type StatusInput = {
  status: QuoteStatus
  validUntil: Date
  sendRequestedAt: Date | null
  child?: { sentAt: Date | null } | null
}

/** Statut affiché : ajoute aux statuts stockés ceux qui se déduisent (expiré, remplacé, envoi en cours) */
export function displayStatus(quote: StatusInput, today = todayParis()): DisplayStatus {
  switch (quote.status) {
    case 'DRAFT':
      return quote.sendRequestedAt ? 'envoi' : 'brouillon'
    case 'ACCEPTED':
      return 'accepté'
    case 'REFUSED':
      return 'refusé'
    case 'SENT':
      if (quote.child?.sentAt) return 'remplacé'
      return quote.validUntil < today ? 'expiré' : 'envoyé'
  }
}

export function isEditable(quote: Pick<StatusInput, 'status' | 'sendRequestedAt'>): boolean {
  return quote.status === 'DRAFT' && quote.sendRequestedAt === null
}

export class QuoteLockedError extends Error {
  constructor() {
    super('Ce devis est verrouillé : il a été envoyé ou est en cours d’envoi. Crée une nouvelle version.')
  }
}

/** Écrit sur un brouillon seulement. Le filtre fait partie de l'UPDATE : aucun envoi ne peut s'intercaler. */
export async function updateDraft(
  tx: Prisma.TransactionClient,
  id: string,
  data: Prisma.QuoteUncheckedUpdateManyInput,
): Promise<void> {
  const { count } = await tx.quote.updateMany({ where: { id, status: 'DRAFT', sendRequestedAt: null }, data })
  if (count !== 1) throw new QuoteLockedError()
}

/** Devis que le client peut encore accepter ou refuser */
export function openQuoteWhere(today = todayParis()): Prisma.QuoteWhereInput {
  return {
    status: 'SENT',
    validUntil: { gte: today },
    OR: [{ child: { is: null } }, { child: { is: { sentAt: null } } }],
  }
}

/** Un envoi resté sans réponse de n8n peut être relancé ou annulé passé ce délai */
export const SEND_TIMEOUT_MS = 10 * 60_000

export function isSendStale(sendRequestedAt: Date, now = Date.now()): boolean {
  return now - sendRequestedAt.getTime() > SEND_TIMEOUT_MS
}
