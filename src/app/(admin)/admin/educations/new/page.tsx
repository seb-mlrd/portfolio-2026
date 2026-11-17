import AdminHeader from '../../_components/AdminHeader'
import EducationForm from '../_components/EducationForm'

export const metadata = { title: 'Nouveau diplôme — Admin' }

export default function NewEducationPage() {
  return (
    <div className="p-8">
      <AdminHeader title="Nouveau diplôme" backHref="/admin/educations" />
      <EducationForm />
    </div>
  )
}
