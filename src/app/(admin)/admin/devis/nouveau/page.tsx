import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/actions/_utils'
import { toDateInput } from '@/lib/format'
import { addDays, todayParis } from '@/lib/quotes/dates'
import { getSettings } from '@/lib/quotes/settings'
import AdminHeader from '../../_components/AdminHeader'
import QuoteForm from '../_components/QuoteForm'

export const metadata = { title: 'Nouveau devis — Admin' }
export const dynamic = 'force-dynamic'

export default async function NewQuotePage() {
  await requireAdmin()
  const [settings, clients, services] = await Promise.all([
    getSettings(),
    prisma.client.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.service.findMany({ where: { active: true }, orderBy: { label: 'asc' }, select: { id: true, label: true, description: true, unitPriceCents: true, unit: true } }),
  ])
  const today = todayParis()

  return (
    <div className="p-8">
      <AdminHeader title="Nouveau devis" backHref="/admin/devis" />
      <QuoteForm
        id={null}
        clients={clients}
        services={services}
        vat={{ enabled: settings.vatEnabled, rateBps: settings.vatRateBps, mention: settings.vatMention }}
        initial={{
          clientId: '',
          issueDate: toDateInput(today),
          validUntil: toDateInput(addDays(today, 30)),
          paymentTerms: settings.paymentTerms,
          depositPercent: String(settings.depositPercent),
          notes: '',
          lines: [{ serviceId: null, label: '', description: '', quantity: '1', unit: 'forfait', unitPrice: '' }],
        }}
      />
    </div>
  )
}
