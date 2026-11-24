import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/actions/_utils'
import { deleteService } from '@/lib/actions/services'
import { formatCents } from '@/lib/quotes/money'
import AdminHeader from '../../_components/AdminHeader'
import ItemActions from '../../_components/ItemActions'

export const metadata = { title: 'Prestations — Admin' }

export default async function ServicesPage() {
  await requireAdmin()
  const services = await prisma.service.findMany({ orderBy: [{ active: 'desc' }, { label: 'asc' }] })
  const editHref = (id: string) => `/admin/devis/prestations/${id}/modifier`

  return (
    <div className="p-8">
      <AdminHeader title="Prestations" subtitle={`${services.length} au catalogue`} newHref="/admin/devis/prestations/nouveau" newLabel="+ Nouvelle prestation" />
      {services.length === 0 && <p className="border border-border p-12 text-center font-mono text-sm text-muted">Aucune prestation pour l&apos;instant.</p>}
      <ul className="flex flex-col gap-px">
        {services.map((s) => (
          <li key={s.id} className={`flex items-center gap-6 border border-border px-6 py-4 ${s.active ? '' : 'opacity-60'}`}>
            <div className="min-w-0 flex-1">
              <Link href={editHref(s.id)} className="font-mono text-sm font-bold hover:text-accent">{s.label}</Link>
              {!s.active && <span className="font-mono text-[10px] text-muted ml-3">inactive</span>}
              {s.description && <p className="font-mono text-[10px] text-muted mt-0.5 truncate">{s.description}</p>}
            </div>
            <span className="font-mono text-xs whitespace-nowrap">{formatCents(s.unitPriceCents)} / {s.unit}</span>
            <ItemActions editHref={editHref(s.id)} onDelete={deleteService.bind(null, s.id)} confirmMessage="Supprimer cette prestation ? Les devis existants ne changent pas." />
          </li>
        ))}
      </ul>
    </div>
  )
}
