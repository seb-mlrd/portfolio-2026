'use client'

import { useTransition, useState } from 'react'
import { createProject } from '@/lib/actions/projects'
import TagInput from './TagInput'

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function ProjectForm() {
  const [pending, startTransition] = useTransition()
  const [title, setTitle] = useState('')
  const [published, setPublished] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => createProject(formData))
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-2xl">
      {/* Titre */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
          Nom du projet
        </label>
        <input
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Mon super projet"
          className="bg-transparent border border-border px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent transition-colors duration-200"
        />
        {title && (
          <p className="font-mono text-[10px] text-muted tracking-wider">
            slug : <span className="text-accent">/{slugify(title)}</span>
          </p>
        )}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
          Description
        </label>
        <textarea
          name="description"
          required
          rows={4}
          placeholder="Une courte description du projet..."
          className="bg-transparent border border-border px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent transition-colors duration-200 resize-none"
        />
      </div>

      {/* Technos */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
          Technologies
        </label>
        <TagInput />
      </div>

      {/* Publié */}
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
          <span className={`absolute top-0.5 w-4 h-4 border transition-all duration-200 ${
            published
              ? 'left-[22px] bg-accent border-accent'
              : 'left-0.5 bg-muted/40 border-border'
          }`} />
        </button>
        <input type="hidden" name="published" value={published ? 'true' : 'false'} />
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="font-mono text-xs uppercase tracking-[0.25em] px-8 py-3 border border-accent text-accent hover:bg-accent hover:text-bg-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        >
          {pending ? 'Création...' : 'Créer le projet'}
        </button>
      </div>
    </form>
  )
}
