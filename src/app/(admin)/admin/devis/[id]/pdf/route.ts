import { requireAdmin } from '@/lib/actions/_utils'
import { getQuote, pdfResponse } from '@/lib/quotes/server'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const quote = await getQuote(id)
  if (!quote) return new Response('Devis introuvable', { status: 404 })
  return pdfResponse(quote.id, quote.number)
}
