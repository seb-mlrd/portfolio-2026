import type { DisplayStatus } from '@/lib/quotes/status'

const STYLES: Record<DisplayStatus, string> = {
  brouillon: 'border-border text-muted',
  envoi: 'bg-accent/10 text-accent border-accent/30',
  envoyé: 'bg-accent/10 text-accent border-accent/30',
  accepté: 'bg-green-500/10 text-green-400 border-green-500/30',
  refusé: 'bg-red-500/10 text-red-400 border-red-500/30',
  expiré: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
  remplacé: 'border-border text-muted',
}

export default function StatusBadge({ status }: { status: DisplayStatus }) {
  return (
    <span className={`font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 border whitespace-nowrap ${STYLES[status]}`}>
      {status === 'envoi' ? 'envoi en cours' : status}
    </span>
  )
}
