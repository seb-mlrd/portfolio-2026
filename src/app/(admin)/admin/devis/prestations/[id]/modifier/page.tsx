import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/actions/_utils'
import { saveService } from '@/lib/actions/services'
import AdminHeader from '../../../../_components/AdminHeader'
import SimpleForm from '../../../_components/SimpleForm'
import ServiceFields from '../../_components/ServiceFields'

export const metadata = { title: 'Modifier la prestation — Admin' }

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const service = await prisma.service.findUnique({ where: { id } })
  if (!service) notFound()
  return (
    <div className="p-8">
      <AdminHeader title="Modifier la prestation" subtitle={service.label} backHref="/admin/devis/prestations" />
      <SimpleForm action={saveService.bind(null, id)}><ServiceFields initial={service} /></SimpleForm>
    </div>
  )
}
