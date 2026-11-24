'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { parseHundredths } from '@/lib/quotes/money'
import { requireAdmin, str, optStr, optInt, bool } from './_utils'

export async function saveSettings(formData: FormData): Promise<{ error: string } | { ok: true }> {
  await requireAdmin()
  let data
  try {
    const siret = str(formData, 'siret').replace(/\s/g, '')
    if (!/^\d{14}$/.test(siret)) throw new Error('SIRET : 14 chiffres attendus')
    const depositPercent = optInt(formData, 'depositPercent') ?? 0
    if (depositPercent < 0 || depositPercent > 100) throw new Error('Acompte : entre 0 et 100')
    const vatRateBps = parseHundredths(str(formData, 'vatRate'))
    if (vatRateBps === null || vatRateBps > 10_000) throw new Error('Taux de TVA : entre 0 et 100')
    const logoPath = optStr(formData, 'logoPath')
    if (logoPath && !/^\/(?!\/)[\w./-]+$/.test(logoPath)) throw new Error('Logo : chemin dans public/, par exemple /logo.svg')
    data = {
      name: str(formData, 'name'),
      address: str(formData, 'address'),
      siret,
      email: str(formData, 'email'),
      phone: optStr(formData, 'phone'),
      logoPath,
      legalMentions: optStr(formData, 'legalMentions') ?? '',
      paymentTerms: str(formData, 'paymentTerms'),
      depositPercent,
      vatEnabled: bool(formData, 'vatEnabled'),
      vatRateBps,
      vatMention: str(formData, 'vatMention'),
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erreur inattendue' }
  }
  await prisma.businessSettings.upsert({ where: { id: 'default' }, update: data, create: { id: 'default', ...data } })
  revalidatePath('/admin/devis', 'layout')
  return { ok: true }
}
