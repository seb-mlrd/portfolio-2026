'use client'

import { useTransition } from 'react'
import { markMessageRead, deleteMessage } from '@/lib/actions/messages'

export function MarkReadButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => markMessageRead(id))}
      className="font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 border border-border text-muted hover:border-accent hover:text-accent transition-all duration-200 disabled:opacity-40"
    >
      {pending ? '...' : 'Marquer lu'}
    </button>
  )
}

export function DeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm('Supprimer ce message ?')) {
          startTransition(() => deleteMessage(id))
        }
      }}
      className="font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 border border-border text-muted hover:border-red-500/60 hover:text-red-400 transition-all duration-200 disabled:opacity-40"
    >
      {pending ? '...' : 'Supprimer'}
    </button>
  )
}
