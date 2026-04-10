import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EditProjectForm from '../../_components/EditProjectForm'

export const metadata = { title: 'Modifier le projet — Admin' }

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await prisma.project.findUnique({ where: { id } })

  if (!project) notFound()

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-10">
        <Link
          href="/admin/projects"
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted hover:text-accent transition-colors duration-200"
        >
          ← Retour
        </Link>
        <div className="w-px h-4 bg-border" />
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight">Modifier le projet</h1>
          <p className="font-mono text-[11px] text-muted tracking-wider mt-1">{project.title}</p>
        </div>
      </div>

      <EditProjectForm project={project} />
    </div>
  )
}
