import { requireAdmin } from '@/lib/actions/_utils'
import { saveClient } from '@/lib/actions/clients'
import AdminHeader from '../../../_components/AdminHeader'
import ClientFields from '../../_components/ClientFields'
import SimpleForm from '../../_components/SimpleForm'

export const metadata = { title: 'Nouveau client — Admin' }

export default async function NewClientPage() {
  await requireAdmin()
  return (
    <div className="p-8">
      <AdminHeader title="Nouveau client" backHref="/admin/devis/clients" />
      <SimpleForm action={saveClient.bind(null, null)}><ClientFields /></SimpleForm>
    </div>
  )
}
