import { prisma } from '@/lib/prisma'
import { deleteEducation } from '@/lib/actions/educations'
import { formatYears } from '@/lib/format'
import AdminHeader from '../_components/AdminHeader'
import AdminList from '../_components/AdminList'

export const metadata = { title: 'Formation — Admin' }

export default async function EducationsPage() {
  const educations = await prisma.education.findMany({
    orderBy: [{ order: 'asc' }, { startYear: 'desc' }],
  })

  return (
    <div className="p-8">
      <AdminHeader
        title="Formation"
        subtitle={`${educations.length} diplôme${educations.length !== 1 ? 's' : ''}`}
        newHref="/admin/educations/new"
        newLabel="+ Nouveau diplôme"
      />
      <AdminList
        emptyLabel="Aucun diplôme pour l'instant."
        items={educations.map((e) => ({
          id: e.id,
          title: e.degree,
          subtitle: [e.school, e.location].filter(Boolean).join(' · '),
          meta: formatYears(e.startYear, e.endYear),
          published: e.published,
          editHref: `/admin/educations/${e.id}/edit`,
          onDelete: deleteEducation.bind(null, e.id),
        }))}
      />
    </div>
  )
}
