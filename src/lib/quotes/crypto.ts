import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

/** Comparaison en temps constant, y compris quand les longueurs diffèrent */
export function safeEqual(a: string, b: string): boolean {
  const hash = (v: string) => createHash('sha256').update(v).digest()
  return timingSafeEqual(hash(a), hash(b))
}

export function signHmac(body: string, secret: string): string {
  if (!secret) throw new Error('Secret HMAC manquant')
  return createHmac('sha256', secret).update(body).digest('hex')
}

export function verifyHmac(body: string, signature: string, secret: string): boolean {
  return safeEqual(signature, signHmac(body, secret))
}

export function verifyBearer(header: string | null, key: string | undefined): boolean {
  if (!key || !header?.startsWith('Bearer ')) return false
  return safeEqual(header.slice(7), key)
}

export const newPublicToken = () => randomBytes(32).toString('base64url')

const PRINT_TTL_MS = 10 * 60_000

export function createPrintToken(quoteId: string, secret: string, now = Date.now()): string {
  const exp = now + PRINT_TTL_MS
  return `${exp}.${signHmac(`print:${quoteId}:${exp}`, secret)}`
}

export function verifyPrintToken(token: string, quoteId: string, secret: string, now = Date.now()): boolean {
  const match = /^(\d{1,15})\.([0-9a-f]{64})$/.exec(token)
  if (!match || Number(match[1]) < now) return false
  return verifyHmac(`print:${quoteId}:${match[1]}`, match[2], secret)
}
