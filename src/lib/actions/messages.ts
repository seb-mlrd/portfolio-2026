'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from './_utils'

export async function markMessageRead(id: string) {
  await requireAdmin()

  await prisma.contactMessage.update({ where: { id }, data: { read: true } })
  revalidatePath('/admin/messages')
}

export async function deleteMessage(id: string) {
  await requireAdmin()

  await prisma.contactMessage.delete({ where: { id } })
  revalidatePath('/admin/messages')
}
