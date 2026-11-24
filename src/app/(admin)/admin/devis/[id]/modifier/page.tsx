import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/actions/_utils'
import { toDateInput } from '@/lib/format'
import { formatHundredths } from '@/lib/quotes/money'
import { getQuote } from '@/lib/quotes/server'
import { getSettings } from '@/lib/quotes/settings'
import { isEditable } from '@/lib/quotes/status'
import AdminHeader from '../../../_components/AdminHeader'
import QuoteForm from '../../_components/QuoteForm'

export const metadata = { title: 'Modifier le devis — Admin' }

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const quote = await getQuote(id)
  if (!quote) notFound()
  if (!isEditable(quote)) redirect(`/admin/devis/${id}`)
  const [settings, clients, services] = await Promise.all([
    getSettings(),
    prisma.client.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.service.findMany({ where: { active: true }, orderBy: { label: 'asc' }, select: { id: true, label: true, description: true, unitPriceCents: true, unit: true } }),
  ])

  return (
    <div className="p-8">
      <AdminHeader title="Modifier le devis" subtitle={quote.number} backHref={`/admin/devis/${id}`} />
      <QuoteForm
        id={id}
        clients={clients}
        services={services}
        vat={{ enabled: settings.vatEnabled, rateBps: settings.vatRateBps, mention: settings.vatMention }}
        initial={{
          clientId: quote.clientId,
          issueDate: toDateInput(quote.issueDate),
          validUntil: toDateInput(quote.validUntil),
          paymentTerms: quote.paymentTerms,
          depositPercent: String(quote.depositPercent),
          notes: quote.notes ?? '',
          lines: quote.lines.map((l) => ({
            serviceId: l.serviceId,
            label: l.label,
            description: l.description ?? '',
            quantity: formatHundredths(l.quantityHundredths),
            unit: l.unit,
            unitPrice: formatHundredths(l.unitPriceCents),
          })),
        }}
      />
    </div>
  )
}
