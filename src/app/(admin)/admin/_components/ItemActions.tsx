'use client'

import { useTransition, useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export default function ItemActions({
  editHref,
  onDelete,
  confirmMessage = 'Supprimer cet élément ?',
}: {
  editHref: string
  onDelete: () => Promise<void>
  confirmMessage?: string
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 border border-border text-muted hover:border-accent hover:text-accent transition-all duration-200"
      >
        ···
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 border border-border bg-bg-dark min-w-[130px] flex flex-col">
          <Link
            href={editHref}
            onClick={() => setOpen(false)}
            className="font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-2.5 text-muted hover:text-accent hover:bg-bg-light transition-all duration-150"
          >
            Éditer
          </Link>
          <button
            disabled={pending}
            onClick={() => {
              if (confirm(confirmMessage)) {
                startTransition(() => onDelete())
              }
              setOpen(false)
            }}
            className="font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-2.5 text-muted hover:text-red-400 hover:bg-bg-light transition-all duration-150 disabled:opacity-40 text-left border-t border-border"
          >
            {pending ? '...' : 'Supprimer'}
          </button>
        </div>
      )}
    </div>
  )
}
