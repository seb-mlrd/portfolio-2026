import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import QuoteDocument from '@/components/quote/QuoteDocument'
import { formatDateTime, formatDay } from '@/lib/quotes/dates'
import { getQuoteByToken } from '@/lib/quotes/server'
import { getSettings } from '@/lib/quotes/settings'
import { displayStatus, type DisplayStatus } from '@/lib/quotes/status'
import { toQuoteView, type FullQuote } from '@/lib/quotes/view'
import QuoteResponse from './_components/QuoteResponse'

export const metadata: Metadata = {
  title: 'Votre devis',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

function closedMessage(status: DisplayStatus, quote: FullQuote): string {
  switch (status) {
    case 'accepté':
      return `Ce devis a été accepté par ${quote.signerName} le ${formatDateTime(quote.acceptedAt!)}. Merci !`
    case 'refusé':
      return 'Ce devis a été refusé. Contactez-moi si vous souhaitez en reparler.'
    case 'expiré':
      return `Ce devis a expiré le ${formatDay(quote.validUntil)}. Contactez-moi pour en recevoir un nouveau.`
    case 'remplacé':
      return 'Ce devis a été remplacé par une version plus récente. Utilisez le lien du dernier mail reçu.'
    default:
      return 'Ce devis est en cours d’envoi. Rechargez la page dans quelques instants.'
  }
}

export default async function PublicQuotePage({ params }: { params: Promise<{ publicToken: string }> }) {
  const { publicToken } = await params
  const quote = await getQuoteByToken(publicToken)
  // Un brouillon n'est jamais visible, sauf pendant l'envoi (le mail peut précéder /sent de quelques secondes)
  if (!quote) notFound()
  const status = displayStatus(quote)
  if (status === 'brouillon') notFound()
  const view = toQuoteView(quote, await getSettings())

  return (
    <main className="mx-auto w-full max-w-[210mm] px-4 py-8 md:px-0 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-xl font-semibold">Devis {quote.number}</h1>
        {quote.pdfUrl && (
          <a
            href={`/devis/public/${publicToken}/pdf`}
            className="text-sm px-5 py-3 border border-border hover:border-accent hover:text-accent transition-colors duration-200"
          >
            Télécharger le PDF
          </a>
        )}
      </div>
      {status !== 'envoyé' && (
        <p role="status" className="border border-border border-l-2 border-l-accent bg-bg-light px-5 py-4 text-sm">
          {closedMessage(status, quote)}
        </p>
      )}
      <div className="qd-scroll border border-border">
        <QuoteDocument quote={view} />
      </div>
      {status === 'envoyé' && <QuoteResponse publicToken={publicToken} />}
    </main>
  )
}
