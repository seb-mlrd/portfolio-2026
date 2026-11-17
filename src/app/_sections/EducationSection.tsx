import { prisma } from '@/lib/prisma'
import { formatYears } from '@/lib/format'
import SectionHeader from './SectionHeader'

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

        <div className="grid md:grid-cols-2 gap-px bg-border border border-border">
          {educations.map((edu) => (
            <article key={edu.id} className="bg-bg-dark p-8 flex flex-col gap-4">
              <span className="font-mono text-[11px] text-accent tracking-widest">
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
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
