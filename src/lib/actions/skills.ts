'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin, str, optInt, list, bool } from './_utils'

function parse(formData: FormData) {
  return {
    title: str(formData, 'title'),
    description: str(formData, 'description'),
    keywords: list(formData, 'keywords'),
    order: optInt(formData, 'order') ?? 0,
    published: bool(formData, 'published'),
  }
}

function revalidate() {
  revalidatePath('/admin/skills')
  revalidatePath('/', 'layout')
}

export async function saveSkill(id: string | null, formData: FormData) {
  await requireAdmin()
  const data = parse(formData)
  if (id) await prisma.skill.update({ where: { id }, data })
  else await prisma.skill.create({ data })
  revalidate()
  redirect('/admin/skills')
}

export async function deleteSkill(id: string) {
  await requireAdmin()
  await prisma.skill.delete({ where: { id } })
  revalidate()
}
