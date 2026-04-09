'use client'

import { useState } from 'react'
import { submitContact } from '@/lib/actions/contact'

export default function ContactSection() {
  const [fields, setFields] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      await submitContact(fields)
      setStatus('sent')
      setFields({ name: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-6 mb-16">
          <span className="font-mono text-xs text-accent tracking-[0.3em]">04.</span>
          <h2 className="font-mono text-2xl md:text-3xl font-bold tracking-tight">Contact</h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left — tagline */}
          <div>
            <p className="font-mono text-xl md:text-2xl leading-relaxed text-foreground mb-6">
              Un projet en tête ?<br />
              <span className="text-accent">Discutons-en.</span>
            </p>
            <p className="text-sm text-muted leading-relaxed">
              Je suis disponible pour des missions freelance, des collaborations ou simplement pour échanger sur vos idées.
            </p>
          </div>

          {/* Right — form */}
          {status === 'sent' ? (
            <div className="flex flex-col items-start gap-4 py-8">
              <span className="font-mono text-4xl text-accent">✓</span>
              <p className="font-mono text-sm text-muted tracking-wider">Message envoyé. Je reviens vers vous rapidement.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {[
                { name: 'name', label: 'Nom', type: 'text', placeholder: 'Votre nom' },
                { name: 'email', label: 'Email', type: 'email', placeholder: 'votre@email.com' },
              ].map((field) => (
                <div key={field.name} className="flex flex-col gap-2">
                  <label className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={(fields as any)[field.name]}
                    onChange={handleChange}
                    required
                    placeholder={field.placeholder}
                    className="bg-transparent border border-border px-4 py-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent transition-colors duration-300 placeholder:text-muted/40"
                  />
                </div>
              ))}

              <div className="flex flex-col gap-2">
                <label className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
                  Message
                </label>
                <textarea
                  name="message"
                  value={fields.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Décrivez votre projet..."
                  className="bg-transparent border border-border px-4 py-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent transition-colors duration-300 resize-none placeholder:text-muted/40"
                />
              </div>

              {status === 'error' && (
                <p className="font-mono text-xs text-red-400 tracking-wider">
                  Une erreur s'est produite. Veuillez réessayer.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="self-start font-mono text-xs uppercase tracking-[0.25em] px-8 py-3 border border-accent text-accent hover:bg-accent hover:text-[var(--color-bg-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {status === 'sending' ? 'Envoi...' : 'Envoyer'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
