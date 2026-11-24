import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/actions/_utils'
import { printPath } from '@/lib/quotes/server'

/** Ouvre la page d'impression avec un token fraîchement signé */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  redirect(printPath(id))
}
