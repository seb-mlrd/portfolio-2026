'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { optUrl } from './_utils'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function createProject(formData: FormData) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized')

  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string).trim()
  const tags = formData.getAll('tags') as string[]
  const published = formData.get('published') === 'true'
  const githubUrl = optUrl(formData, 'githubUrl')
  const liveUrl = optUrl(formData, 'liveUrl')

  let slug = generateSlug(title)
  const existing = await prisma.project.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now()}`

  await prisma.project.create({ data: { title, slug, description, tags, published, githubUrl, liveUrl } })

  revalidatePath('/admin/projects')
  redirect('/admin/projects')
}

export async function updateProject(id: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized')

  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string).trim()
  const tags = formData.getAll('tags') as string[]
  const published = formData.get('published') === 'true'
  const githubUrl = optUrl(formData, 'githubUrl')
  const liveUrl = optUrl(formData, 'liveUrl')

  await prisma.project.update({ where: { id }, data: { title, description, tags, published, githubUrl, liveUrl } })

  revalidatePath('/admin/projects')
  revalidatePath('/', 'layout')
  redirect('/admin/projects')
}

export async function deleteProject(id: string) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized')

  await prisma.project.delete({ where: { id } })
  revalidatePath('/admin/projects')
}
