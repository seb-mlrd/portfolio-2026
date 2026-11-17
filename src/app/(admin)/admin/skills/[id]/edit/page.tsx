import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminHeader from '../../../_components/AdminHeader'
import SkillForm from '../../_components/SkillForm'

export const metadata = { title: 'Modifier la compétence — Admin' }

export default async function EditSkillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const skill = await prisma.skill.findUnique({ where: { id } })
  if (!skill) notFound()

  return (
    <div className="p-8">
      <AdminHeader title="Modifier la compétence" subtitle={skill.title} backHref="/admin/skills" />
      <SkillForm initial={skill} />
    </div>
  )
}
