import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminHeader from '../../../_components/AdminHeader'
import ExperienceForm from '../../_components/ExperienceForm'

export const metadata = { title: "Modifier l'expérience — Admin" }

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const experience = await prisma.experience.findUnique({ where: { id } })
  if (!experience) notFound()

  return (
    <div className="p-8">
      <AdminHeader
        title="Modifier l'expérience"
        subtitle={`${experience.role} — ${experience.company}`}
        backHref="/admin/experiences"
      />
      <ExperienceForm initial={experience} />
    </div>
  )
}
