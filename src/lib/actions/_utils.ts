import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if ((session?.user as { role?: string } | undefined)?.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
}

/** Champ texte obligatoire */
export function str(formData: FormData, key: string): string {
  const value = String(formData.get(key) ?? '').trim()
  if (!value) throw new Error(`Champ "${key}" requis`)
  return value
}

/** Champ texte facultatif : chaîne vide → null */
export function optStr(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? '').trim()
  return value || null
}

/** Entier facultatif : vide ou invalide → null */
export function optInt(formData: FormData, key: string): number | null {
  const value = String(formData.get(key) ?? '').trim()
  if (!value) return null
  const n = Number.parseInt(value, 10)
  return Number.isNaN(n) ? null : n
}

/** Mois au format "YYYY-MM" (input type="month") → Date, vide → null */
export function optMonth(formData: FormData, key: string): Date | null {
  const value = String(formData.get(key) ?? '').trim()
  if (!/^\d{4}-\d{2}$/.test(value)) return null
  return new Date(`${value}-01T00:00:00.000Z`)
}

export function list(formData: FormData, key: string): string[] {
  return formData.getAll(key).map((v) => String(v).trim()).filter(Boolean)
}

export function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === 'true'
}
