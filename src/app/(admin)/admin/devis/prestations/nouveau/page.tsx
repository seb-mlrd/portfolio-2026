import { requireAdmin } from '@/lib/actions/_utils'
import { saveService } from '@/lib/actions/services'
import AdminHeader from '../../../_components/AdminHeader'
import SimpleForm from '../../_components/SimpleForm'
import ServiceFields from '../_components/ServiceFields'

export const metadata = { title: 'Nouvelle prestation — Admin' }

export default async function NewServicePage() {
  await requireAdmin()
  return (
    <div className="p-8">
      <AdminHeader title="Nouvelle prestation" backHref="/admin/devis/prestations" />
      <SimpleForm action={saveService.bind(null, null)}><ServiceFields /></SimpleForm>
    </div>
  )
}
