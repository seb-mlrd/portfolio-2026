import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Projets — Admin' }

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { order: 'asc' },
  })

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight">Projets</h1>
          <p className="font-mono text-[11px] text-muted tracking-wider mt-1">
            {projects.length} projet{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="border border-border p-12 text-center">
          <p className="font-mono text-sm text-muted tracking-wider">Aucun projet pour l'instant.</p>
          <p className="font-mono text-xs text-muted/60 tracking-wider mt-2">
            Lancez <code className="text-accent">npx prisma db seed</code> pour insérer des données de démo.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-px bg-border">
          {projects.map((project) => (
            <div key={project.id} className="bg-bg-dark p-6">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-sm font-bold text-foreground">{project.title}</span>
                  <span className="font-mono text-[10px] text-muted">/{project.slug}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {project.featured && (
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 bg-accent/10 text-accent border border-accent/30">
                      Featured
                    </span>
                  )}
                  <span className={`font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 border ${
                    project.published
                      ? 'bg-green-500/10 text-green-400 border-green-500/30'
                      : 'border-border text-muted'
                  }`}>
                    {project.published ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
              </div>

              <p className="font-mono text-xs text-muted leading-relaxed mb-3">
                {project.description}
              </p>

              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border border-border text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
