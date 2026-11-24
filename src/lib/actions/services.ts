'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { priceField } from '@/lib/quotes/schema'
import { requireAdmin, str, optStr, bool } from './_utils'

export async function saveService(id: string | null, formData: FormData): Promise<{ error: string }> {
  await requireAdmin()
  const price = priceField.safeParse(String(formData.get('unitPrice') ?? ''))
  if (!price.success) return { error: price.error.issues[0].message }
  let data
  try {
    data = {
      label: str(formData, 'label'),
      description: optStr(formData, 'description'),
      unit: str(formData, 'unit'),
      unitPriceCents: price.data,
      active: bool(formData, 'active'),
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erreur inattendue' }
  }
  if (id) await prisma.service.update({ where: { id }, data })
  else await prisma.service.create({ data })
  revalidatePath('/admin/devis', 'layout')
  redirect('/admin/devis/prestations')
}

export async function deleteService(id: string) {
  await requireAdmin()
  await prisma.service.delete({ where: { id } })
  revalidatePath('/admin/devis/prestations')
}
