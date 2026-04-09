'use client'

import { useState } from 'react'

export default function ContactSection() {
  const [fields, setFields] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    // TODO: wire up to Server Action or API route
    await new Promise((r) => setTimeout(r, 800))
    setStatus('sent')
    setFields({ name: '', email: '', message: '' })
  }

  return (
    <section id="contact" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-6 mb-16">
          <span className="font-mono text-xs text-accent tracking-[0.3em]">04.</span>
          <h2 className="font-mono text-2xl md:text-3xl font-bold tracking-tight">Contact</h2>
          <div className="flex-1 h-px bg-[#1e1e1e]" />
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left — tagline */}
          <div>
            <p className="font-mono text-xl md:text-2xl leading-relaxed text-[#f0f0f0] mb-6">
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
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
                  Nom
                </label>
                <input
                  type="text"
                  name="name"
                  value={fields.name}
                  onChange={handleChange}
                  required
                  className="bg-transparent border border-[#1e1e1e] px-4 py-3 font-mono text-sm text-[#f0f0f0] focus:outline-none focus:border-accent transition-colors duration-300 placeholder:text-[#333]"
                  placeholder="Votre nom"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={fields.email}
                  onChange={handleChange}
                  required
                  className="bg-transparent border border-[#1e1e1e] px-4 py-3 font-mono text-sm text-[#f0f0f0] focus:outline-none focus:border-accent transition-colors duration-300 placeholder:text-[#333]"
                  placeholder="votre@email.com"
                />
              </div>

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
                  className="bg-transparent border border-[#1e1e1e] px-4 py-3 font-mono text-sm text-[#f0f0f0] focus:outline-none focus:border-accent transition-colors duration-300 resize-none placeholder:text-[#333]"
                  placeholder="Décrivez votre projet..."
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="self-start font-mono text-xs uppercase tracking-[0.25em] px-8 py-3 border border-accent text-accent hover:bg-accent hover:text-[#080808] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
