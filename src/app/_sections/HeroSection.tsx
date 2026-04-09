import DonutAnimation from '@/components/DonutAnimation'

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center px-6 overflow-hidden"
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#00d4ff 1px, transparent 1px), linear-gradient(90deg, #00d4ff 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 60% at 75% 50%, rgba(0,212,255,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-12 py-24 md:py-0">

        {/* Left — text */}
        <div className="flex flex-col items-start gap-6 md:max-w-sm">
          <p
            className="font-mono text-[11px] uppercase tracking-[0.4em] text-accent"
            style={{ animationName: 'fade-up', animationDuration: '0.6s', animationDelay: '0.1s', animationFillMode: 'both' }}
          >
            Portfolio — Full Stack
          </p>

          <h1
            className="font-mono font-bold leading-none select-none"
            style={{
              fontSize: 'clamp(3.5rem, 10vw, 7rem)',
              letterSpacing: '-0.02em',
              color: '#f0f0f0',
              textShadow: '0 0 40px var(--color-accent-glow)',
              animationName: 'fade-up, glow-pulse',
              animationDuration: '0.6s, 3s',
              animationDelay: '0.25s, 1.5s',
              animationTimingFunction: 'ease, ease-in-out',
              animationFillMode: 'both, forwards',
              animationIterationCount: '1, infinite',
            }}
          >
            S.M
          </h1>

          <p
            className="font-mono text-sm text-muted tracking-[0.1em] leading-relaxed"
            style={{ animationName: 'fade-up', animationDuration: '0.6s', animationDelay: '0.4s', animationFillMode: 'both' }}
          >
            Conception d'interfaces &<br />d'architectures modernes
          </p>

          <div
            className="flex flex-col sm:flex-row items-start gap-4 pt-2"
            style={{ animationName: 'fade-up', animationDuration: '0.6s', animationDelay: '0.55s', animationFillMode: 'both' }}
          >
            <a
              href="#projets"
              className="font-mono text-xs uppercase tracking-[0.25em] px-7 py-3 border border-accent text-accent hover:bg-accent hover:text-[#080808] transition-all duration-300"
            >
              Voir les projets
            </a>
            <a
              href="#contact"
              className="font-mono text-xs uppercase tracking-[0.25em] px-7 py-3 border border-[#1e1e1e] text-muted hover:border-accent hover:text-accent transition-all duration-300"
            >
              Contact
            </a>
          </div>
        </div>

        {/* Right — donut */}
        <div
          className="shrink-0"
          style={{ animationName: 'fade-up', animationDuration: '0.8s', animationDelay: '0.2s', animationFillMode: 'both' }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted text-center mb-3">
            Cliquer pour changer de couleur
          </p>
          <DonutAnimation size={440} />
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ animationName: 'fade-up', animationDuration: '0.6s', animationDelay: '1s', animationFillMode: 'both' }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-accent to-transparent" />
      </div>
    </section>
  )
}
