import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await prisma.project.findUnique({ where: { slug, published: true } })
  if (!project) return {}
  return { title: `${project.title} — Portfolio`, description: project.description }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await prisma.project.findUnique({ where: { slug, published: true } })

  if (!project) notFound()

  return (
    <main className="min-h-screen px-6 py-24">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link
          href="/#projets"
          className="inline-block font-mono text-[10px] uppercase tracking-[0.3em] text-muted hover:text-accent transition-colors duration-150 active:opacity-60 mb-16"
        >
          ← Projets
        </Link>

        {/* Header */}
        <div className="mb-12">
          <p className="font-mono text-xs text-accent tracking-[0.3em] mb-4">Projet</p>
          <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-tight leading-none mb-6">
            {project.title}
          </h1>
          <div className="w-16 h-px bg-accent" />
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-12">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border border-border text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <div className="border-l-2 border-accent/30 pl-6 mb-12">
          <p className="font-mono text-sm text-muted leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Content */}
        {project.content && (
          <div className="font-mono text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-12">
            {project.content}
          </div>
        )}

        {/* Links */}
        {(project.githubUrl || project.liveUrl) && (
          <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs uppercase tracking-[0.25em] px-6 py-3 border border-accent text-accent hover:bg-accent hover:text-bg-dark transition-all duration-150 active:scale-[0.97] active:duration-75"
              >
                Voir le projet ↗
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs uppercase tracking-[0.25em] px-6 py-3 border border-border text-muted hover:border-accent hover:text-accent transition-all duration-150 active:scale-[0.97] active:duration-75"
              >
                GitHub ↗
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
