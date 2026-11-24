import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/actions/_utils'
import QuoteDocument from '@/components/quote/QuoteDocument'
import { formatDateTime } from '@/lib/quotes/dates'
import { getQuote } from '@/lib/quotes/server'
import { getSettings } from '@/lib/quotes/settings'
import { displayStatus, isSendStale } from '@/lib/quotes/status'
import { toQuoteView } from '@/lib/quotes/view'
import AdminHeader from '../../_components/AdminHeader'
import StatusBadge from '../_components/StatusBadge'
import QuoteActions from './_components/QuoteActions'

export const metadata = { title: 'Devis — Admin' }

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const quote = await getQuote(id)
  if (!quote) notFound()
  const [settings, events, pdf] = await Promise.all([
    getSettings(),
    prisma.quoteEvent.findMany({ where: { quoteId: id }, orderBy: { createdAt: 'desc' } }),
    prisma.quotePdf.findUnique({ where: { quoteId: id }, select: { quoteId: true } }),
  ])
  const status = displayStatus(quote)
  const view = toQuoteView(quote, settings)
  // Non confirmée : échec enregistré, ou aucune trace (serveur arrêté juste après l'acceptation)
  const lastWebhook = events.find((e) => e.type.startsWith('webhook_accepted'))

  return (
    <div className="p-8">
      <AdminHeader title={quote.number} subtitle={view.client.name} backHref="/admin/devis" />
      <div className="flex items-center gap-4 mb-6 font-mono text-xs text-muted">
        <StatusBadge status={status} />
        {quote.archivedAt && <span>Archivé</span>}
        {quote.child && <Link href={`/admin/devis/${quote.child.id}`} className="hover:text-accent underline">Version suivante : {quote.child.number}</Link>}
        {quote.parentId && <Link href={`/admin/devis/${quote.parentId}`} className="hover:text-accent underline">Version précédente</Link>}
        {status !== 'brouillon' && status !== 'envoi' && (
          <a href={`/devis/public/${quote.publicToken}`} target="_blank" rel="noreferrer" className="hover:text-accent underline">Page client ↗</a>
        )}
      </div>

      <QuoteActions
        id={id}
        status={status}
        clientEmail={view.client.email}
        hasChild={quote.child !== null}
        hasPdf={pdf !== null && quote.status !== 'DRAFT'}
        sendStale={quote.sendRequestedAt !== null && isSendStale(quote.sendRequestedAt)}
        archived={quote.archivedAt !== null}
        canResendWebhook={quote.status === 'ACCEPTED' && lastWebhook?.type !== 'webhook_accepted_ok'}
      />

      <div className="flex flex-col 2xl:flex-row gap-10 items-start">
        <div className="qd-scroll max-w-full border border-border">
          <QuoteDocument quote={view} />
        </div>
        <section className="w-full 2xl:w-80 shrink-0">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent mb-4">Historique</h2>
          <ol className="flex flex-col gap-4 border-l border-border pl-4">
            {events.map((e) => (
              <li key={e.id} className="font-mono text-xs">
                <p>{e.message}</p>
                <p className="text-[10px] text-muted mt-0.5">{formatDateTime(e.createdAt)}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}
