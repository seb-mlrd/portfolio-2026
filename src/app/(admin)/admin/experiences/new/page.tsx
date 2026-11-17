import AdminHeader from '../../_components/AdminHeader'
import ExperienceForm from '../_components/ExperienceForm'

export const metadata = { title: 'Nouvelle expérience — Admin' }

export default function NewExperiencePage() {
  return (
    <div className="p-8">
      <AdminHeader title="Nouvelle expérience" backHref="/admin/experiences" />
      <ExperienceForm />
    </div>
  )
}
