import Link from 'next/link'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/actions/_utils'
import { formatDay, todayParis } from '@/lib/quotes/dates'
import { formatCents } from '@/lib/quotes/money'
import { displayStatus, openQuoteWhere } from '@/lib/quotes/status'
import AdminHeader from '../_components/AdminHeader'
import StatusBadge from './_components/StatusBadge'

export const metadata = { title: 'Devis — Admin' }

const superseded: Prisma.QuoteWhereInput = { child: { is: { sentAt: { not: null } } } }

const FILTERS: { key: string; label: string; where: () => Prisma.QuoteWhereInput }[] = [
  { key: 'brouillon', label: 'Brouillons', where: () => ({ status: 'DRAFT' }) },
  { key: 'envoye', label: 'Envoyés', where: () => openQuoteWhere() },
  { key: 'accepte', label: 'Acceptés', where: () => ({ status: 'ACCEPTED' }) },
  { key: 'refuse', label: 'Refusés', where: () => ({ status: 'REFUSED' }) },
  { key: 'expire', label: 'Expirés', where: () => ({ status: 'SENT', validUntil: { lt: todayParis() }, NOT: superseded }) },
  { key: 'remplace', label: 'Remplacés', where: () => ({ status: 'SENT', ...superseded }) },
]

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string | string[]; q?: string | string[] }>
}) {
  await requireAdmin()
  const params = await searchParams
  const statut = typeof params.statut === 'string' ? params.statut : ''
  const q = typeof params.q === 'string' ? params.q.trim() : ''
  const archived = statut === 'archive'

  const and: Prisma.QuoteWhereInput[] = [{ archivedAt: archived ? { not: null } : null }]
  const filter = FILTERS.find((f) => f.key === statut)
  if (filter) and.push(filter.where())
  if (q) {
    const contains = { contains: q, mode: 'insensitive' as const }
    and.push({ OR: [{ number: contains }, { client: { name: contains } }, { client: { contactName: contains } }] })
  }

  const quotes = await prisma.quote.findMany({
    where: { AND: and },
    orderBy: [{ year: 'desc' }, { sequence: 'desc' }, { version: 'desc' }],
    include: { client: { select: { name: true } }, child: { select: { sentAt: true } } },
  })

  const href = (key: string) => {
    const sp = new URLSearchParams()
    if (key) sp.set('statut', key)
    if (q) sp.set('q', q)
    return `/admin/devis${sp.size ? `?${sp}` : ''}`
  }
  const tabs = [{ key: '', label: 'Tous' }, ...FILTERS, { key: 'archive', label: 'Archivés' }]

  return (
    <div className="p-8">
      <AdminHeader title="Devis" subtitle={`${quotes.length} devis`} newHref="/admin/devis/nouveau" newLabel="+ Nouveau devis" />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <nav aria-label="Filtrer par statut" className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={href(t.key)}
              aria-current={statut === t.key ? 'page' : undefined}
              className={`font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-2 border transition-colors duration-200 ${
                statut === t.key ? 'border-accent text-accent' : 'border-border text-muted hover:text-foreground'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <form action="/admin/devis" className="flex gap-2">
          {statut && <input type="hidden" name="statut" value={statut} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            aria-label="Rechercher un devis"
            placeholder="Numéro ou client"
            className="bg-transparent border border-border px-4 py-2 font-mono text-sm focus:outline-none focus:border-accent"
          />
          <button className="font-mono text-[10px] uppercase tracking-[0.2em] px-4 border border-border text-muted hover:border-accent hover:text-accent">
            Chercher
          </button>
        </form>
      </div>

      {quotes.length === 0 ? (
        <p className="border border-border p-12 text-center font-mono text-sm text-muted">Aucun devis ici.</p>
      ) : (
        <div className="border border-border overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead className="bg-bg-light text-[10px] uppercase tracking-[0.2em] text-muted">
              <tr className="border-b border-border text-left">
                {['Numéro', 'Client', 'Émis le', 'Valable jusqu’au', 'Statut'].map((h) => (
                  <th key={h} className="px-5 py-3 font-normal whitespace-nowrap">{h}</th>
                ))}
                <th className="px-5 py-3 font-normal text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id} className="border-b border-border last:border-b-0 hover:bg-bg-light">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <Link href={`/admin/devis/${quote.id}`} className="font-bold hover:text-accent">{quote.number}</Link>
                  </td>
                  <td className="px-5 py-4">{quote.client.name}</td>
                  <td className="px-5 py-4 text-muted">{formatDay(quote.issueDate)}</td>
                  <td className="px-5 py-4 text-muted">{formatDay(quote.validUntil)}</td>
                  <td className="px-5 py-4"><StatusBadge status={displayStatus(quote)} /></td>
                  <td className="px-5 py-4 text-right whitespace-nowrap tabular-nums">{formatCents(quote.totalCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
