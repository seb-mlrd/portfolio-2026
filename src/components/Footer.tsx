const socials = [
  { label: 'GitHub', href: 'https://github.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
]

export default function Footer() {
  return (
    <footer className="border-t border-border mt-32">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <span
          className="font-mono text-sm font-bold tracking-[0.3em] text-accent"
          style={{ textShadow: '0 0 15px rgba(0,212,255,0.3)' }}
        >
          S.M_
        </span>

        {/* Copyright */}
        <p className="font-mono text-[11px] text-muted tracking-widest order-last md:order-none">
          © {new Date().getFullYear()} — Tous droits réservés
        </p>

        {/* Socials */}
        <ul className="flex items-center gap-6">
          {socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative font-mono text-[11px] uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors duration-150 active:opacity-60"
              >
                {s.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
