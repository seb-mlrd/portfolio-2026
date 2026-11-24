import { getQuoteByToken, pdfResponse } from '@/lib/quotes/server'

export async function GET(_: Request, { params }: { params: Promise<{ publicToken: string }> }) {
  const { publicToken } = await params
  const quote = await getQuoteByToken(publicToken)
  if (!quote || quote.status === 'DRAFT') return new Response('PDF indisponible', { status: 404 })
  return pdfResponse(quote.id, quote.number)
}
