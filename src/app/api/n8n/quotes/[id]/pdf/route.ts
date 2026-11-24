import { prisma } from '@/lib/prisma'
import { publicPdfUrl, purgeOldPdfs, rejectUnlessN8n } from '@/lib/quotes/server'

const MAX_BYTES = 10 * 1024 * 1024

/** Reçoit le PDF (corps binaire) et renvoie l'URL à transmettre à /sent */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = rejectUnlessN8n(request)
  if (denied) return denied
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BYTES) {
    return Response.json({ error: 'PDF too large' }, { status: 413 })
  }
  const { id } = await params
  const quote = await prisma.quote.findUnique({ where: { id } })
  if (!quote) return Response.json({ error: 'Not found' }, { status: 404 })
  // Une fois le devis parti, son PDF ne change plus
  if (quote.status !== 'DRAFT' || !quote.sendRequestedAt) {
    return Response.json({ error: 'Quote is not being sent' }, { status: 409 })
  }

  const data = new Uint8Array(await request.arrayBuffer())
  if (data.length > MAX_BYTES) return Response.json({ error: 'PDF too large' }, { status: 413 })
  if (new TextDecoder().decode(data.slice(0, 5)) !== '%PDF-') {
    return Response.json({ error: 'Not a PDF' }, { status: 400 })
  }

  await prisma.quotePdf.upsert({ where: { quoteId: id }, update: { data }, create: { quoteId: id, data } })
  await purgeOldPdfs().catch((e) => console.error('Purge des PDF', e))
  return Response.json({ pdfUrl: publicPdfUrl(quote.publicToken) })
}
