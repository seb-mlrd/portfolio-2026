import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function ProjectsSection() {
  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
  })

  return (
    <section id="projets" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-6 mb-16">
          <span className="font-mono text-xs text-accent tracking-[0.3em]">02.</span>
          <h2 className="font-mono text-2xl md:text-3xl font-bold tracking-tight">Projets</h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        {projects.length === 0 ? (
          <p className="font-mono text-sm text-muted tracking-wider">Aucun projet publié pour l'instant.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, i) => (
              <Link
                key={project.id}
                href={`/projets/${project.slug}`}
                className="group relative border border-border bg-bg-light p-8 hover:border-accent/40 transition-all duration-300 overflow-hidden"
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 0%, var(--color-accent-glow) 0%, transparent 70%)' }}
                />

                <div className="relative z-10">
                  <span className="font-mono text-[11px] text-accent tracking-widest">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-mono text-lg font-bold mt-3 mb-3 group-hover:text-accent transition-colors duration-300">
                    {project.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed mb-6">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 border border-border text-muted group-hover:border-accent/30 transition-colors duration-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <span className="absolute top-8 right-8 text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300 font-mono text-sm">
                  ↗
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
