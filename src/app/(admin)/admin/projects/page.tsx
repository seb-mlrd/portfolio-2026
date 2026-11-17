import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { deleteProject } from '@/lib/actions/projects'
import ItemActions from '../_components/ItemActions'

export const metadata = { title: 'Projets — Admin' }

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { order: 'asc' } })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight">Projets</h1>
          <p className="font-mono text-[11px] text-muted tracking-wider mt-1">
            {projects.length} projet{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="font-mono text-xs uppercase tracking-[0.25em] px-6 py-3 border border-accent text-accent hover:bg-accent hover:text-bg-dark transition-all duration-200"
        >
          + Nouveau projet
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="border border-border p-12 text-center">
          <p className="font-mono text-sm text-muted tracking-wider">Aucun projet pour l'instant.</p>
          <Link
            href="/admin/projects/new"
            className="inline-block font-mono text-xs uppercase tracking-[0.25em] px-6 py-3 border border-accent text-accent hover:bg-accent hover:text-bg-dark transition-all duration-200 mt-6"
          >
            + Ajouter le premier projet
          </Link>
        </div>
      ) : (
        <div className="border border-border">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-6 px-6 py-3 bg-bg-light border-b border-border">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">Nom</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">Technologies</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">Statut</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">Actions</span>
          </div>

          {/* Rows */}
          {projects.map((project) => (
            <div
              key={project.id}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-6 items-center px-6 py-4 border-b border-border last:border-b-0 bg-bg-dark hover:bg-bg-light transition-colors duration-150"
            >
              {/* Nom + slug */}
              <div className="min-w-0">
                <p className="font-mono text-sm font-bold text-foreground truncate">{project.title}</p>
                <p className="font-mono text-[10px] text-muted mt-0.5">/{project.slug}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 justify-end max-w-[240px]">
                {project.tags.length > 0 ? project.tags.map((tag) => (
                  <span key={tag} className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border border-border text-muted">
                    {tag}
                  </span>
                )) : (
                  <span className="font-mono text-[10px] text-muted/40">—</span>
                )}
              </div>

              {/* Statut */}
              <span className={`font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 border whitespace-nowrap ${
                project.published
                  ? 'bg-green-500/10 text-green-400 border-green-500/30'
                  : 'border-border text-muted'
              }`}>
                {project.published ? 'Publié' : 'Brouillon'}
              </span>

              {/* Actions */}
              <div className="flex items-center">
                <ItemActions
                  editHref={`/admin/projects/${project.id}/edit`}
                  onDelete={deleteProject.bind(null, project.id)}
                  confirmMessage="Supprimer ce projet ?"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
