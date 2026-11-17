import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminHeader from '../../../_components/AdminHeader'
import EducationForm from '../../_components/EducationForm'

export const metadata = { title: 'Modifier le diplôme — Admin' }

export default async function EditEducationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const education = await prisma.education.findUnique({ where: { id } })
  if (!education) notFound()

  return (
    <div className="p-8">
      <AdminHeader title="Modifier le diplôme" subtitle={education.degree} backHref="/admin/educations" />
      <EducationForm initial={education} />
    </div>
  )
}
