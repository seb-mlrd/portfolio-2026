import AdminHeader from '../../_components/AdminHeader'
import SkillForm from '../_components/SkillForm'

export const metadata = { title: 'Nouvelle compétence — Admin' }

export default function NewSkillPage() {
  return (
    <div className="p-8">
      <AdminHeader title="Nouvelle compétence" backHref="/admin/skills" />
      <SkillForm />
    </div>
  )
}
