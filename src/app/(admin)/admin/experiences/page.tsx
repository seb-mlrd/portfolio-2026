import { prisma } from '@/lib/prisma'
import { deleteExperience } from '@/lib/actions/experiences'
import { formatPeriod } from '@/lib/format'
import AdminHeader from '../_components/AdminHeader'
import AdminList from '../_components/AdminList'

export const metadata = { title: 'Expériences — Admin' }

export default async function ExperiencesPage() {
  const experiences = await prisma.experience.findMany({
    orderBy: [{ order: 'asc' }, { startDate: 'desc' }],
  })

  return (
    <div className="p-8">
      <AdminHeader
        title="Expériences"
        subtitle={`${experiences.length} expérience${experiences.length !== 1 ? 's' : ''}`}
        newHref="/admin/experiences/new"
        newLabel="+ Nouvelle expérience"
      />
      <AdminList
        emptyLabel="Aucune expérience pour l'instant."
        items={experiences.map((e) => ({
          id: e.id,
          title: e.role,
          subtitle: [e.company, e.contractType].filter(Boolean).join(' · '),
          meta: formatPeriod(e.startDate, e.endDate),
          published: e.published,
          editHref: `/admin/experiences/${e.id}/edit`,
          onDelete: deleteExperience.bind(null, e.id),
        }))}
      />
    </div>
  )
}
