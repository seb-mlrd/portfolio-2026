import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SectionHeader, { revealDelay } from './SectionHeader'

const pad = (n: number) => String(n).padStart(2, '0')

export default async function ProjectsSection() {
  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
  })

  // Le projet mis en avant (ou le premier) ouvre la section en grand, les autres suivent en index.
  const leadIndex = Math.max(
    0,
    projects.findIndex((p) => p.featured),
  )
  const lead = projects[leadIndex]
  const rest = projects.filter((_, i) => i !== leadIndex)

  return (
    <section id="projets" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader index="03" title="Projets" />

        {!lead ? (
          <p className="font-mono text-sm text-muted tracking-wider">Aucun projet publié pour l&apos;instant.</p>
        ) : (
          <>
            {/* Projet principal */}
            <div data-reveal>
              <Link
                href={`/projets/${lead.slug}`}
                className="group relative grid md:grid-cols-[1.1fr_1fr] border border-border bg-bg-light overflow-hidden hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-300 active:translate-y-0 active:scale-[0.995]"
              >
                <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[360px] border-b md:border-b-0 md:border-r border-border flex items-center justify-center overflow-hidden">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                      backgroundImage:
                        'linear-gradient(var(--color-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)',
                      backgroundSize: '40px 40px',
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        'radial-gradient(ellipse 60% 60% at 50% 50%, var(--color-accent-glow) 0%, transparent 70%)',
                    }}
                  />
                  <span
                    aria-hidden="true"
                    className="relative font-mono font-bold leading-none text-accent/15 select-none group-hover:scale-[1.03] transition-transform duration-500"
                    style={{ fontSize: 'clamp(6rem, 16vw, 11rem)' }}
                  >
                    {pad(leadIndex + 1)}
                  </span>
                  <span className="absolute top-4 left-4 w-4 h-4 border-t border-l border-accent" />
                  <span className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-accent" />
                </div>

                <div className="p-8 md:p-12 flex flex-col gap-5 justify-center">
                  <span className="font-mono text-[11px] text-accent tracking-[0.3em] uppercase">
                    {lead.featured ? 'Projet phare' : `Projet ${pad(leadIndex + 1)}`}
                  </span>
                  <h3 className="font-mono text-2xl md:text-3xl font-bold leading-tight group-hover:text-accent transition-colors duration-300">
                    {lead.title}
                  </h3>
                  <p className="text-base text-muted leading-relaxed">{lead.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {lead.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 border border-border text-muted group-hover:border-accent/30 transition-colors duration-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="font-mono text-xs uppercase tracking-[0.25em] text-accent pt-2 inline-flex items-center gap-2">
                    Voir le projet
                    <span className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">
                      ↗
                    </span>
                  </span>
                </div>
              </Link>
            </div>

            {/* Index des autres projets */}
            {rest.length > 0 && (
              <ol className="mt-12 border-t border-border">
                {rest.map((project, i) => {
                  const n = projects.indexOf(project) + 1
                  return (
                    <li key={project.id} data-reveal style={revealDelay(i)} className="border-b border-border">
                      <Link
                        href={`/projets/${project.slug}`}
                        className="group grid grid-cols-[3rem_1fr_auto] md:grid-cols-[4rem_minmax(0,1fr)_minmax(0,1.2fr)_auto] items-baseline gap-x-6 gap-y-2 py-7 px-4 md:px-6 hover:bg-bg-light/60 transition-colors duration-300 active:bg-bg-light"
                      >
                        <span className="font-mono text-[11px] text-accent tracking-widest">{pad(n)}</span>
                        <h3 className="font-mono text-lg font-bold group-hover:text-accent transition-colors duration-300">
                          {project.title}
                        </h3>
                        <p className="col-start-2 col-span-2 md:col-start-auto md:col-span-1 row-start-2 md:row-start-auto text-sm text-muted leading-relaxed">
                          {project.description}
                          {project.tags.length > 0 && (
                            <span className="block font-mono text-[10px] uppercase tracking-widest text-muted mt-2">
                              {project.tags.join(' · ')}
                            </span>
                          )}
                        </p>
                        <span
                          aria-hidden="true"
                          className="col-start-3 row-start-1 md:col-start-auto md:row-start-auto font-mono text-sm text-muted group-hover:text-accent group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300"
                        >
                          ↗
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ol>
            )}
          </>
        )}
      </div>
    </section>
  )
}
