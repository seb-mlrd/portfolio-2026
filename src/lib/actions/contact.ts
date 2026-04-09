'use server'

import { prisma } from '@/lib/prisma'

export async function submitContact(data: {
  name: string
  email: string
  message: string
}) {
  if (!data.name || !data.email || !data.message) {
    throw new Error('Champs manquants')
  }

  await prisma.contactMessage.create({
    data: {
      name: data.name,
      email: data.email,
      message: data.message,
    },
  })
}
