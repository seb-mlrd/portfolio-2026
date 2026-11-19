import { prisma } from '@/lib/prisma'
import { formatYears } from '@/lib/format'
import SectionHeader, { revealDelay } from './SectionHeader'

export default async function EducationSection() {
  const educations = await prisma.education.findMany({
    where: { published: true },
    orderBy: [{ order: 'asc' }, { startYear: 'desc' }],
  })

  if (educations.length === 0) return null

  return (
    <section id="formation" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader index="04" title="Formation" />

        {/* Frise : verticale sur mobile, horizontale dès md */}
        <ol className="relative grid gap-12 md:gap-10 md:grid-flow-col md:auto-cols-fr pl-8 md:pl-0 md:pt-10">
          {/* Ligne de la frise */}
          <span
            aria-hidden="true"
            className="absolute left-[5px] top-2 bottom-2 w-px md:left-0 md:right-0 md:top-[5px] md:bottom-auto md:w-auto md:h-px bg-gradient-to-b md:bg-gradient-to-r from-accent via-border to-border"
          />

          {educations.map((edu, i) => (
            <li key={edu.id} data-reveal style={revealDelay(i, 140)} className="group relative flex flex-col gap-4">
              {/* Jalon */}
              <span
                aria-hidden="true"
                className="absolute -left-8 top-1.5 md:left-0 md:-top-10 w-[11px] h-[11px] border border-accent bg-bg-dark group-hover:bg-accent transition-colors duration-300"
              />

              <span className="font-mono text-2xl md:text-3xl font-bold text-accent/90 tracking-tight leading-none">
                {formatYears(edu.startYear, edu.endYear)}
              </span>
              <h3 className="font-mono text-lg font-bold leading-snug">{edu.degree}</h3>
              <p className="font-mono text-sm text-foreground/80">
                {edu.school}
                {edu.location && <span className="text-muted"> · {edu.location}</span>}
              </p>
              {edu.description && (
                <p className="text-sm leading-relaxed text-muted whitespace-pre-line">{edu.description}</p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
