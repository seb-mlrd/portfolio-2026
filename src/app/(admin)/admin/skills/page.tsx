import { prisma } from '@/lib/prisma'
import { deleteSkill } from '@/lib/actions/skills'
import AdminHeader from '../_components/AdminHeader'
import AdminList from '../_components/AdminList'

export const metadata = { title: 'Compétences — Admin' }

export default async function SkillsPage() {
  const skills = await prisma.skill.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] })

  return (
    <div className="p-8">
      <AdminHeader
        title="Compétences"
        subtitle={`${skills.length} compétence${skills.length !== 1 ? 's' : ''}`}
        newHref="/admin/skills/new"
        newLabel="+ Nouvelle compétence"
      />
      <AdminList
        emptyLabel="Aucune compétence pour l'instant."
        items={skills.map((s) => ({
          id: s.id,
          title: s.title,
          subtitle: s.keywords.join(' · '),
          meta: `#${s.order}`,
          published: s.published,
          editHref: `/admin/skills/${s.id}/edit`,
          onDelete: deleteSkill.bind(null, s.id),
        }))}
      />
    </div>
  )
}
