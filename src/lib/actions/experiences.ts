'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin, str, optStr, optInt, optMonth, list, bool } from './_utils'

function parse(formData: FormData) {
  const startDate = optMonth(formData, 'startDate')
  if (!startDate) throw new Error('Date de début requise')
  return {
    role: str(formData, 'role'),
    company: str(formData, 'company'),
    location: optStr(formData, 'location'),
    contractType: optStr(formData, 'contractType'),
    startDate,
    endDate: optMonth(formData, 'endDate'),
    description: str(formData, 'description'),
    stack: list(formData, 'stack'),
    order: optInt(formData, 'order') ?? 0,
    published: bool(formData, 'published'),
  }
}

function revalidate() {
  revalidatePath('/admin/experiences')
  revalidatePath('/', 'layout')
}

export async function saveExperience(id: string | null, formData: FormData) {
  await requireAdmin()
  const data = parse(formData)
  if (id) await prisma.experience.update({ where: { id }, data })
  else await prisma.experience.create({ data })
  revalidate()
  redirect('/admin/experiences')
}

export async function deleteExperience(id: string) {
  await requireAdmin()
  await prisma.experience.delete({ where: { id } })
  revalidate()
}
