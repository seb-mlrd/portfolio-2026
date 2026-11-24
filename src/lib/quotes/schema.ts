import { z } from 'zod'
import { parseHundredths } from './money.ts'
import { computeTotals } from './totals.ts'

const MAX_TOTAL_CENTS = 2_000_000_000 // tient dans un INTEGER Postgres

const text = (label: string, max = 200) =>
  z.string().trim().min(1, `${label} : champ requis`).max(max, `${label} : ${max} caractères maximum`)

const day = (label: string) =>
  z.iso.date(`${label} : date invalide`).transform((v) => new Date(`${v}T00:00:00.000Z`))

const hundredths = (label: string, max: number) =>
  z.string().transform((value, ctx) => {
    const n = parseHundredths(value)
    if (n === null || n > max) {
      ctx.addIssue({ code: 'custom', message: `${label} : valeur invalide` })
      return z.NEVER
    }
    return n
  })

export const priceField = hundredths('Prix', 100_000_000)

export const quoteLineSchema = z.object({
  serviceId: z.string().nullable(),
  label: text('Libellé'),
  description: z.string().trim().max(2000, '2000 caractères maximum'),
  quantity: hundredths('Quantité', 1_000_000).refine((n) => n > 0, 'La quantité doit être supérieure à 0'),
  unit: text('Unité', 30),
  unitPrice: priceField,
})

/** Partagé par le formulaire (client) et l'action serveur */
export const quoteSchema = z
  .object({
    clientId: z.string().min(1, 'Choisis un client'),
    issueDate: day('Émission'),
    validUntil: day('Validité'),
    paymentTerms: text('Conditions de paiement', 2000),
    depositPercent: z
      .string()
      .regex(/^\d{1,3}$/, 'Acompte : entier entre 0 et 100')
      .transform(Number)
      .refine((n) => n <= 100, 'Acompte : entier entre 0 et 100'),
    notes: z.string().trim().max(5000, '5000 caractères maximum'),
    lines: z.array(quoteLineSchema).min(1, 'Ajoute au moins une ligne').max(100, '100 lignes maximum'),
  })
  .refine((q) => q.validUntil >= q.issueDate, {
    path: ['validUntil'],
    message: "La validité doit suivre la date d'émission",
  })
  .refine(
    (q) =>
      computeTotals({
        lines: q.lines.map((l) => ({ quantityHundredths: l.quantity, unitPriceCents: l.unitPrice })),
        depositPercent: 0,
        vatEnabled: true,
        vatRateBps: 10_000,
      }).totalCents <= MAX_TOTAL_CENTS,
    { path: ['lines'], message: 'Montant total trop élevé' },
  )

export type QuoteFormInput = z.input<typeof quoteSchema>
export type QuoteFormData = z.output<typeof quoteSchema>

/** { "lines.0.label": "message" } — première erreur de chaque champ */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) errors[issue.path.join('.')] ??= issue.message
  return errors
}

export const acceptSchema = z.object({
  signerName: text('Nom du signataire', 120),
  agreed: z.literal(true, 'Coche la case « Bon pour accord »'),
})

export const refuseSchema = z.object({ reason: z.string().trim().max(2000, '2000 caractères maximum') })
