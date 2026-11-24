import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/actions/_utils'
import { deleteClient } from '@/lib/actions/clients'
import AdminHeader from '../../_components/AdminHeader'
import ItemActions from '../../_components/ItemActions'

export const metadata = { title: 'Clients — Admin' }

export default async function ClientsPage() {
  await requireAdmin()
  const clients = await prisma.client.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { quotes: true } } } })
  const editHref = (id: string) => `/admin/devis/clients/${id}/modifier`

  return (
    <div className="p-8">
      <AdminHeader title="Clients" subtitle={`${clients.length} client${clients.length !== 1 ? 's' : ''}`} newHref="/admin/devis/clients/nouveau" newLabel="+ Nouveau client" />
      {clients.length === 0 && <p className="border border-border p-12 text-center font-mono text-sm text-muted">Aucun client pour l&apos;instant.</p>}
      <ul className="flex flex-col gap-px">
        {clients.map((c) => (
          <li key={c.id} className="flex items-center gap-6 border border-border px-6 py-4">
            <div className="min-w-0 flex-1">
              <Link href={editHref(c.id)} className="font-mono text-sm font-bold hover:text-accent">{c.name}</Link>
              <p className="font-mono text-[10px] text-muted mt-0.5 truncate">{[c.contactName, c.email].filter(Boolean).join(' · ')}</p>
            </div>
            <span className="font-mono text-[10px] text-muted whitespace-nowrap">{c._count.quotes} devis</span>
            {c._count.quotes === 0 ? (
              <ItemActions editHref={editHref(c.id)} onDelete={deleteClient.bind(null, c.id)} />
            ) : (
              <Link href={editHref(c.id)} className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted hover:text-accent">Éditer</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
