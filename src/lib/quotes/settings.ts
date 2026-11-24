import 'server-only'
import { prisma } from '@/lib/prisma'

export const DEFAULT_VAT_MENTION = 'TVA non applicable, art. 293 B du CGI'

/** Valeurs de départ tant que les réglages n'ont pas été enregistrés */
const DEFAULTS = {
  id: 'default',
  name: '',
  address: '',
  siret: '',
  email: '',
  phone: null,
  logoPath: null,
  legalMentions: '',
  paymentTerms: 'Paiement par virement à 30 jours à compter de la date de facture.',
  depositPercent: 30,
  vatEnabled: false,
  vatRateBps: 2000,
  vatMention: DEFAULT_VAT_MENTION,
  updatedAt: new Date(0),
}

export async function getSettings() {
  return (await prisma.businessSettings.findUnique({ where: { id: 'default' } })) ?? DEFAULTS
}

export type Settings = Awaited<ReturnType<typeof getSettings>>

/** Champs d'émetteur obligatoires avant d'envoyer un devis */
export function isIssuerComplete(s: Settings): boolean {
  return Boolean(s.name && s.address && s.siret && s.email)
}
