import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logEvent, publicPdfUrl, rejectUnlessN8n } from '@/lib/quotes/server'

const bodySchema = z.object({ pdfUrl: z.string() })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = rejectUnlessN8n(request)
  if (denied) return denied
  const { id } = await params
  const body = bodySchema.safeParse(await request.json().catch(() => null))
  if (!body.success) return Response.json({ error: 'pdfUrl is required' }, { status: 400 })

  const quote = await prisma.quote.findUnique({ where: { id }, include: { pdf: { select: { quoteId: true } } } })
  if (!quote) return Response.json({ error: 'Not found' }, { status: 404 })
  // Idempotent : ne rétrograde jamais un devis déjà envoyé, accepté ou refusé
  if (quote.status !== 'DRAFT') return Response.json({ ok: true, alreadySent: true })
  if (body.data.pdfUrl !== publicPdfUrl(quote.publicToken) || !quote.pdf) {
    return Response.json({ error: 'Unknown pdfUrl' }, { status: 400 })
  }

  const sentAt = new Date()
  const { count } = await prisma.quote.updateMany({
    where: { id, status: 'DRAFT', sendRequestedAt: { not: null } },
    data: { status: 'SENT', sentAt, pdfUrl: body.data.pdfUrl },
  })
  if (count === 1) {
    await logEvent(id, 'sent', 'Devis envoyé au client')
    revalidatePath('/admin/devis', 'layout')
    return Response.json({ ok: true, sentAt })
  }
  const current = await prisma.quote.findUnique({ where: { id }, select: { status: true } })
  if (current && current.status !== 'DRAFT') return Response.json({ ok: true, alreadySent: true })
  return Response.json({ error: 'Quote is not being sent' }, { status: 409 })
}
