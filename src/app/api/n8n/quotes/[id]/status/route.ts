import { prisma } from '@/lib/prisma'
import { rejectUnlessN8n } from '@/lib/quotes/server'
import { displayStatus } from '@/lib/quotes/status'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = rejectUnlessN8n(request)
  if (denied) return denied
  const { id } = await params
  const quote = await prisma.quote.findUnique({ where: { id }, include: { child: { select: { sentAt: true } } } })
  if (!quote) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({ id, number: quote.number, status: displayStatus(quote) })
}
