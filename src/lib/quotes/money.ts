/** « 1 234,5 » → 123450 : décimal saisi vers centièmes entiers, sans passer par un flottant. */
export function parseHundredths(input: string): number | null {
  const value = input.replace(/[\s\u00a0\u202f]/g, '').replace(',', '.')
  const match = /^(\d{1,9})(?:\.(\d{1,2}))?$/.exec(value)
  if (!match) return null
  return Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'))
}

/** 123450 → « 1234,5 » (valeur d'un champ de saisie) */
export function formatHundredths(value: number): string {
  const cents = String(value % 100).padStart(2, '0').replace(/0+$/, '')
  return `${Math.floor(value / 100)}${cents ? `,${cents}` : ''}`
}

const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

/** Affichage uniquement */
export function formatCents(cents: number): string {
  return eur.format(cents / 100)
}
