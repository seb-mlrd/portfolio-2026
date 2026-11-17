import { prisma } from '@/lib/prisma'
import { formatPeriod } from '@/lib/format'
import SectionHeader from './SectionHeader'

export default async function ExperienceSection() {
  const experiences = await prisma.experience.findMany({
    where: { published: true },
    orderBy: [{ order: 'asc' }, { startDate: 'desc' }],
  })

  if (experiences.length === 0) return null

  const total = String(experiences.length).padStart(2, '0')

  return (
    <section id="experiences" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader index="02" title="Expériences" />

        <ol className="flex flex-col border-t border-border">
          {experiences.map((exp, i) => (
            <li
              key={exp.id}
              className="group grid md:grid-cols-[200px_1fr] gap-4 md:gap-12 py-10 border-b border-border"
            >
              {/* Période */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[11px] text-accent tracking-widest">
                  {String(i + 1).padStart(2, '0')} / {total}
                </span>
                <span className="font-mono text-xs text-muted tracking-wider">
                  {formatPeriod(exp.startDate, exp.endDate)}
                </span>
              </div>

              {/* Contenu */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-mono text-lg font-bold group-hover:text-accent transition-colors duration-300">
                    {exp.role}
                  </h3>
                  {exp.contractType && (
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 border border-accent/40 text-accent bg-accent/5">
                      {exp.contractType}
                    </span>
                  )}
                </div>
                <p className="font-mono text-sm text-foreground/80">
                  {exp.company}
                  {exp.location && <span className="text-muted"> · {exp.location}</span>}
                </p>
                <p className="text-base leading-relaxed text-muted whitespace-pre-line">{exp.description}</p>
                {exp.stack.length > 0 && (
                  <ul className="flex flex-wrap gap-2 pt-1">
                    {exp.stack.map((tech) => (
                      <li
                        key={tech}
                        className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 border border-border text-muted"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
