export type TotalsInput = {
  lines: { quantityHundredths: number; unitPriceCents: number }[]
  depositPercent: number
  vatEnabled: boolean
  vatRateBps: number
}

/** Centimes, arrondi au centime le plus proche */
export function lineTotal(quantityHundredths: number, unitPriceCents: number): number {
  return Math.round((quantityHundredths * unitPriceCents) / 100)
}

export function computeTotals({ lines, depositPercent, vatEnabled, vatRateBps }: TotalsInput) {
  const lineTotals = lines.map((l) => lineTotal(l.quantityHundredths, l.unitPriceCents))
  const subtotalCents = lineTotals.reduce((sum, t) => sum + t, 0)
  const vatCents = vatEnabled ? Math.round((subtotalCents * vatRateBps) / 10_000) : 0
  const totalCents = subtotalCents + vatCents
  const depositCents = Math.round((totalCents * depositPercent) / 100)
  return { lineTotals, subtotalCents, vatCents, totalCents, depositCents }
}
