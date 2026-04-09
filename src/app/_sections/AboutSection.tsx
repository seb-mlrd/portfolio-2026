export default function AboutSection() {
  return (
    <section id="presentation" className="py-32 px-6 border-t border-[#1e1e1e]">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-6 mb-16">
          <span className="font-mono text-xs text-accent tracking-[0.3em]">01.</span>
          <h2 className="font-mono text-2xl md:text-3xl font-bold tracking-tight">Présentation</h2>
          <div className="flex-1 h-px bg-[#1e1e1e]" />
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="flex flex-col gap-6">
            <p className="text-base leading-relaxed text-[#b0b0b0]">
              Développeur full stack passionné par la création d'expériences web modernes, performantes et élégantes. J'interviens de la conception de l'architecture jusqu'au déploiement.
            </p>
            <p className="text-base leading-relaxed text-[#b0b0b0]">
              Mon approche combine rigueur technique et sens du détail pour livrer des produits qui fonctionnent bien et qui ont l'air bien.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-px bg-[#1e1e1e] mt-4">
              {[
                { value: '3+', label: 'Années' },
                { value: '15+', label: 'Projets' },
                { value: '100%', label: 'Impliqué' },
              ].map((stat) => (
                <div key={stat.label} className="bg-bg-dark px-6 py-5 text-center">
                  <p className="font-mono text-2xl font-bold text-accent mb-1">{stat.value}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual placeholder */}
          <div className="relative aspect-square max-w-sm mx-auto md:mx-0">
            <div className="w-full h-full border border-[#1e1e1e] flex items-center justify-center">
              <span
                className="font-mono text-7xl font-bold text-accent/10 select-none"
                style={{ textShadow: '0 0 60px rgba(0,212,255,0.1)' }}
              >
                S.M
              </span>
            </div>
            {/* Corner accents */}
            <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-accent" />
            <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-accent" />
            <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-accent" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-accent" />
          </div>
        </div>
      </div>
    </section>
  )
}
