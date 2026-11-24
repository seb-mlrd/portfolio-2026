import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/actions/_utils'
import { saveClient } from '@/lib/actions/clients'
import AdminHeader from '../../../../_components/AdminHeader'
import ClientFields from '../../../_components/ClientFields'
import SimpleForm from '../../../_components/SimpleForm'

export const metadata = { title: 'Modifier le client — Admin' }

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const client = await prisma.client.findUnique({ where: { id } })
  if (!client) notFound()
  return (
    <div className="p-8">
      <AdminHeader title="Modifier le client" subtitle={client.name} backHref="/admin/devis/clients" />
      <SimpleForm action={saveClient.bind(null, id)}><ClientFields initial={client} /></SimpleForm>
    </div>
  )
}
