const projects = [
  {
    number: '01',
    title: 'Projet Alpha',
    description: 'Application web full stack avec Next.js, Prisma et PostgreSQL.',
    tags: ['Next.js', 'TypeScript', 'Prisma'],
    href: '#',
  },
  {
    number: '02',
    title: 'Projet Beta',
    description: 'Interface responsive avec animations et design system personnalisé.',
    tags: ['React', 'Tailwind', 'Framer Motion'],
    href: '#',
  },
  {
    number: '03',
    title: 'Projet Gamma',
    description: 'API REST sécurisée avec authentification et gestion des rôles.',
    tags: ['Node.js', 'PostgreSQL', 'JWT'],
    href: '#',
  },
]

export default function ProjectsSection() {
  return (
    <section id="projets" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-6 mb-16">
          <span className="font-mono text-xs text-accent tracking-[0.3em]">02.</span>
          <h2 className="font-mono text-2xl md:text-3xl font-bold tracking-tight">Projets</h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Projects grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {projects.map((project) => (
            <a
              key={project.number}
              href={project.href}
              className="group relative bg-bg-dark p-8 hover:bg-bg-light transition-colors duration-300 overflow-hidden"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 0%, rgba(0,212,255,0.04) 0%, transparent 70%)' }}
              />

              <div className="relative z-10">
                <span className="font-mono text-[11px] text-accent tracking-widest">{project.number}</span>
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
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
