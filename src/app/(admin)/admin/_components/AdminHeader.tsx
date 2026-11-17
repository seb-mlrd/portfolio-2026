import Link from 'next/link'

export default function AdminHeader({
  title,
  subtitle,
  backHref,
  newHref,
  newLabel,
}: {
  title: string
  subtitle?: string
  backHref?: string
  newHref?: string
  newLabel?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 mb-10">
      <div className="flex items-center gap-4">
        {backHref && (
          <>
            <Link
              href={backHref}
              className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted hover:text-accent transition-colors duration-200"
            >
              ← Retour
            </Link>
            <div className="w-px h-4 bg-border" />
          </>
        )}
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="font-mono text-[11px] text-muted tracking-wider mt-1">{subtitle}</p>}
        </div>
      </div>
      {newHref && (
        <Link
          href={newHref}
          className="font-mono text-xs uppercase tracking-[0.25em] px-6 py-3 border border-accent text-accent hover:bg-accent hover:text-bg-dark transition-all duration-200"
        >
          {newLabel ?? '+ Ajouter'}
        </Link>
      )}
    </div>
  )
}
