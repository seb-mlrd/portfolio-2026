'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin, str, optStr } from './_utils'

function parse(formData: FormData) {
  const email = str(formData, 'email')
  if (!/^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/.test(email)) throw new Error('Email invalide')
  const siret = optStr(formData, 'siret')?.replace(/\s/g, '') ?? null
  if (siret && !/^\d{14}$/.test(siret)) throw new Error('SIRET : 14 chiffres attendus')
  return {
    name: str(formData, 'name'),
    contactName: optStr(formData, 'contactName'),
    email,
    address: str(formData, 'address'),
    siret,
    notes: optStr(formData, 'notes'),
  }
}

const message = (e: unknown) => (e instanceof Error ? e.message : 'Erreur inattendue')

export async function saveClient(id: string | null, formData: FormData): Promise<{ error: string }> {
  await requireAdmin()
  let data
  try {
    data = parse(formData)
  } catch (e) {
    return { error: message(e) }
  }
  if (id) await prisma.client.update({ where: { id }, data })
  else await prisma.client.create({ data })
  revalidatePath('/admin/devis', 'layout')
  redirect('/admin/devis/clients')
}

/** Création depuis le formulaire de devis : renvoie le client sans quitter la page */
export async function createClientQuick(formData: FormData) {
  await requireAdmin()
  let data
  try {
    data = parse(formData)
  } catch (e) {
    return { error: message(e) }
  }
  const client = await prisma.client.create({ data, select: { id: true, name: true } })
  revalidatePath('/admin/devis/clients')
  return { client }
}

export async function deleteClient(id: string) {
  await requireAdmin()
  // Un client lié à un devis est conservé (la liste ne propose pas sa suppression)
  await prisma.client.deleteMany({ where: { id, quotes: { none: {} } } })
  revalidatePath('/admin/devis/clients')
}
