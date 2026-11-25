import { quotePayload, rejectUnlessN8n } from '@/lib/quotes/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = rejectUnlessN8n(request)
  if (denied) return denied
  const { id } = await params
  const quote = await quotePayload(id)
  if (!quote) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(quote)
}
