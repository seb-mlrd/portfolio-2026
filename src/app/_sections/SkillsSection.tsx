import { prisma } from '@/lib/prisma'
import { revealDelay } from './SectionHeader'

export default async function SkillsSection() {
  const skills = await prisma.skill.findMany({
    where: { published: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })

  if (skills.length === 0) return null

  return (
    <section id="competences" className="py-32 px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-12 lg:gap-16">
        {/* En-tête collant à gauche */}
        <div data-reveal="left" className="lg:sticky lg:top-24 self-start flex flex-col gap-6">
          <span className="font-mono text-xs text-accent tracking-[0.3em]">05.</span>
          <h2 className="font-mono text-2xl md:text-3xl font-bold tracking-tight">Compétences</h2>
          <div className="w-16 h-px bg-accent" />
          <p className="font-mono text-sm text-muted leading-relaxed">
            {`${String(skills.length).padStart(2, '0')} domaines, du back-end à l'interface.`}
          </p>
        </div>

        {/* Cartes */}
        <div className="grid sm:grid-cols-2 gap-px bg-border border border-border">
          {skills.map((skill, i) => (
            <article key={skill.id} data-reveal style={revealDelay(i)} className="group bg-bg-dark p-8 flex flex-col gap-4 hover:bg-bg-light transition-colors duration-300">
              <span className="font-mono text-[11px] text-accent tracking-widest">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-mono text-base font-bold leading-snug group-hover:text-accent transition-colors duration-300">
                {skill.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted whitespace-pre-line">{skill.description}</p>
              {skill.keywords.length > 0 && (
                <ul className="flex flex-wrap gap-2 mt-auto pt-2">
                  {skill.keywords.map((kw) => (
                    <li
                      key={kw}
                      className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border border-border text-muted"
                    >
                      {kw}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
          {/* Cellule de remplissage : évite que le bg-border de la grille apparaisse quand le nombre est impair */}
          {skills.length % 2 === 1 && <div aria-hidden className="hidden sm:block bg-bg-dark" />}
        </div>
      </div>
    </section>
  )
}
