export default function SectionHeader({ index, title }: { index: string; title: string }) {
  return (
    <div data-reveal className="flex items-center gap-6 mb-16">
      <span className="font-mono text-xs text-accent tracking-[0.3em]">{index}.</span>
      <h2 className="font-mono text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
      <div
        data-reveal="line"
        className="flex-1 h-px bg-border"
        style={{ '--reveal-delay': '250ms' } as React.CSSProperties}
      />
    </div>
  )
}

/** Décalage d'apparition pour l'élément n d'une liste. */
export const revealDelay = (i: number, step = 90) =>
  ({ '--reveal-delay': `${Math.min(i, 6) * step}ms` }) as React.CSSProperties
