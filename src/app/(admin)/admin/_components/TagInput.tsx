'use client'

import { useState } from 'react'

export default function TagInput({
  initialTags = [],
  name = 'tags',
  placeholder = 'Ex: Next.js',
}: {
  initialTags?: string[]
  name?: string
  placeholder?: string
}) {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [input, setInput] = useState('')

  function addTag() {
    const value = input.trim()
    if (!value || tags.includes(value)) return
    setTags((prev) => [...prev, value])
    setInput('')
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Input + bouton */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent border border-border px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent transition-colors duration-200"
        />
        <button
          type="button"
          onClick={addTag}
          disabled={!input.trim()}
          className="font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-2.5 border border-border text-muted hover:border-accent hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
        >
          + Ajouter
        </button>
      </div>

      {/* Tags ajoutés */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border border-accent/40 text-accent bg-accent/5"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-accent/60 hover:text-accent transition-colors leading-none"
                aria-label={`Retirer ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Hidden inputs pour le FormData */}
      {tags.map((tag) => (
        <input key={tag} type="hidden" name={name} value={tag} />
      ))}
    </div>
  )
}
