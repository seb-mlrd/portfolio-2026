import { prisma } from '@/lib/prisma'
import SectionHeader from './SectionHeader'

export default async function SkillsSection() {
  const skills = await prisma.skill.findMany({
    where: { published: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })

  if (skills.length === 0) return null

  return (
    <section id="competences" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader index="05" title="Compétences" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
          {skills.map((skill, i) => (
            <article key={skill.id} className="group bg-bg-dark p-8 flex flex-col gap-4">
              <span className="font-mono text-[11px] text-accent tracking-widest">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-mono text-base font-bold leading-snug group-hover:text-accent transition-colors duration-300">
                {skill.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted whitespace-pre-line">{skill.description}</p>
              {skill.keywords.length > 0 && (
                <p className="font-mono text-[11px] text-muted/80 tracking-wider mt-auto pt-2">
                  {skill.keywords.join(' · ')}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
