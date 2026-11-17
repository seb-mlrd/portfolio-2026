import ItemActions from './ItemActions'

export type AdminListItem = {
  id: string
  title: string
  subtitle?: string
  meta?: string
  published: boolean
  editHref: string
  onDelete: () => Promise<void>
}

export default function AdminList({ items, emptyLabel }: { items: AdminListItem[]; emptyLabel: string }) {
  if (items.length === 0) {
    return (
      <div className="border border-border p-12 text-center">
        <p className="font-mono text-sm text-muted tracking-wider">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className="border border-border">
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-6 px-6 py-3 bg-bg-light border-b border-border">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">Nom</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">Période</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">Statut</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">Actions</span>
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-[1fr_auto_auto_auto] gap-6 items-center px-6 py-4 border-b border-border last:border-b-0 bg-bg-dark hover:bg-bg-light transition-colors duration-150"
        >
          <div className="min-w-0">
            <p className="font-mono text-sm font-bold text-foreground truncate">{item.title}</p>
            {item.subtitle && <p className="font-mono text-[10px] text-muted mt-0.5 truncate">{item.subtitle}</p>}
          </div>
          <span className="font-mono text-[10px] text-muted whitespace-nowrap">{item.meta ?? '—'}</span>
          <span
            className={`font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 border whitespace-nowrap ${
              item.published ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'border-border text-muted'
            }`}
          >
            {item.published ? 'Publié' : 'Brouillon'}
          </span>
          <ItemActions editHref={item.editHref} onDelete={item.onDelete} />
        </div>
      ))}
    </div>
  )
}
