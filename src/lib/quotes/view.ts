import type { Client, Prisma } from '@prisma/client'
import type { Settings } from './settings'

export type IssuerSnapshot = Pick<Settings, 'name' | 'address' | 'siret' | 'email' | 'phone' | 'logoPath' | 'legalMentions'>
export type ClientSnapshot = Pick<Client, 'name' | 'contactName' | 'email' | 'address' | 'siret'>

export const quoteInclude = {
  client: true,
  lines: { orderBy: { position: 'asc' } },
  child: { select: { id: true, number: true, sentAt: true } },
} satisfies Prisma.QuoteInclude

export type FullQuote = Prisma.QuoteGetPayload<{ include: typeof quoteInclude }>

export function issuerSnapshot(s: Settings): IssuerSnapshot {
  const { name, address, siret, email, phone, logoPath, legalMentions } = s
  return { name, address, siret, email, phone, logoPath, legalMentions }
}

export function clientSnapshot(c: Client): ClientSnapshot {
  const { name, contactName, email, address, siret } = c
  return { name, contactName, email, address, siret }
}

/** Données affichées par QuoteDocument : copies figées si le devis est parti, données actuelles sinon */
export function toQuoteView(quote: FullQuote, settings: Settings) {
  const frozen = quote.sendRequestedAt !== null || quote.status !== 'DRAFT'
  return {
    number: quote.number,
    issueDate: quote.issueDate,
    validUntil: quote.validUntil,
    paymentTerms: quote.paymentTerms,
    depositPercent: quote.depositPercent,
    depositCents: quote.depositCents,
    notes: quote.notes,
    vatEnabled: quote.vatEnabled,
    vatRateBps: quote.vatRateBps,
    vatMention: quote.vatMention,
    subtotalCents: quote.subtotalCents,
    vatCents: quote.vatCents,
    totalCents: quote.totalCents,
    lines: quote.lines,
    issuer: frozen && quote.issuerSnapshot ? (quote.issuerSnapshot as IssuerSnapshot) : issuerSnapshot(settings),
    client: frozen && quote.clientSnapshot ? (quote.clientSnapshot as ClientSnapshot) : clientSnapshot(quote.client),
  }
}

export type QuoteView = ReturnType<typeof toQuoteView>
