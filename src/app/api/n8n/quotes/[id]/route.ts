import { getQuote, printUrl, publicQuoteUrl, rejectUnlessN8n } from '@/lib/quotes/server'
import { getSettings } from '@/lib/quotes/settings'
import { displayStatus } from '@/lib/quotes/status'
import { toQuoteView } from '@/lib/quotes/view'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = rejectUnlessN8n(request)
  if (denied) return denied
  const { id } = await params
  const quote = await getQuote(id)
  if (!quote) return Response.json({ error: 'Not found' }, { status: 404 })

  return Response.json({
    id: quote.id,
    status: displayStatus(quote),
    sentAt: quote.sentAt,
    acceptedAt: quote.acceptedAt,
    signerName: quote.signerName,
    ...toQuoteView(quote, await getSettings()),
    printUrl: printUrl(quote.id),
    publicUrl: publicQuoteUrl(quote.publicToken),
  })
}
