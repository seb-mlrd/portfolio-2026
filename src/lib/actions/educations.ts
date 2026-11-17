'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin, str, optStr, optInt, bool } from './_utils'

function parse(formData: FormData) {
  const startYear = optInt(formData, 'startYear')
  if (startYear === null) throw new Error('Année de début requise')
  return {
    degree: str(formData, 'degree'),
    school: str(formData, 'school'),
    location: optStr(formData, 'location'),
    startYear,
    endYear: optInt(formData, 'endYear'),
    description: optStr(formData, 'description'),
    order: optInt(formData, 'order') ?? 0,
    published: bool(formData, 'published'),
  }
}

function revalidate() {
  revalidatePath('/admin/educations')
  revalidatePath('/', 'layout')
}

export async function saveEducation(id: string | null, formData: FormData) {
  await requireAdmin()
  const data = parse(formData)
  if (id) await prisma.education.update({ where: { id }, data })
  else await prisma.education.create({ data })
  revalidate()
  redirect('/admin/educations')
}

export async function deleteEducation(id: string) {
  await requireAdmin()
  await prisma.education.delete({ where: { id } })
  revalidate()
}
