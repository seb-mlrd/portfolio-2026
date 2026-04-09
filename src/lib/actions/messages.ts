'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function markMessageRead(id: string) {
  const session = await getServerSession(authOptions)
  if (session?.user && (session.user as any).role !== 'ADMIN') throw new Error('Unauthorized')

  await prisma.contactMessage.update({ where: { id }, data: { read: true } })
  revalidatePath('/admin/messages')
}

export async function deleteMessage(id: string) {
  const session = await getServerSession(authOptions)
  if (session?.user && (session.user as any).role !== 'ADMIN') throw new Error('Unauthorized')

  await prisma.contactMessage.delete({ where: { id } })
  revalidatePath('/admin/messages')
}
