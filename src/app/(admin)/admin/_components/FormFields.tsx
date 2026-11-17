'use client'

import { useState } from 'react'

const inputClass =
  'bg-transparent border border-border px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent transition-colors duration-200'

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">{label}</label>
      {children}
      {hint && <p className="font-mono text-[10px] text-muted/60 tracking-wider">{hint}</p>}
    </div>
  )
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClass} />
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={4} {...props} className={`${inputClass} resize-none`} />
}

export function PublishedToggle({ initial = true }: { initial?: boolean }) {
  const [published, setPublished] = useState(initial)

  return (
    <div className="flex items-center justify-between border border-border px-4 py-3">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">Publié</p>
        <p className="font-mono text-[10px] text-muted/60 mt-0.5">
          {published ? 'Visible sur le portfolio' : 'Brouillon — non visible'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setPublished((v) => !v)}
        className={`relative w-11 h-6 border transition-colors duration-200 ${
          published ? 'bg-accent/20 border-accent' : 'bg-transparent border-border'
        }`}
        aria-pressed={published}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 border transition-all duration-200 ${
            published ? 'left-[22px] bg-accent border-accent' : 'left-0.5 bg-muted/40 border-border'
          }`}
        />
      </button>
      <input type="hidden" name="published" value={published ? 'true' : 'false'} />
    </div>
  )
}

export function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <div className="pt-2">
      <button
        type="submit"
        disabled={pending}
        className="font-mono text-xs uppercase tracking-[0.25em] px-8 py-3 border border-accent text-accent hover:bg-accent hover:text-bg-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        {pending ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </div>
  )
}
