const skillGroups = [
  {
    category: 'Frontend',
    skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'HTML / CSS'],
  },
  {
    category: 'Backend',
    skills: ['Node.js', 'Prisma', 'REST API', 'PostgreSQL', 'NextAuth'],
  },
  {
    category: 'Outils',
    skills: ['Git', 'Docker', 'VS Code', 'Figma', 'Linux'],
  },
]

export default function SkillsSection() {
  return (
    <section id="competences" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-6 mb-16">
          <span className="font-mono text-xs text-accent tracking-[0.3em]">03.</span>
          <h2 className="font-mono text-2xl md:text-3xl font-bold tracking-tight">Compétences</h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Skills grid */}
        <div className="grid md:grid-cols-3 gap-px bg-border">
          {skillGroups.map((group) => (
            <div key={group.category} className="bg-bg-dark p-8">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent mb-8">
                {group.category}
              </h3>
              <ul className="flex flex-col gap-4">
                {group.skills.map((skill) => (
                  <li key={skill} className="flex items-center gap-3 group">
                    <span className="w-1.5 h-1.5 bg-accent/40 group-hover:bg-accent transition-colors duration-300 shrink-0" />
                    <span className="font-mono text-sm text-muted group-hover:text-foreground transition-colors duration-300">
                      {skill}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
