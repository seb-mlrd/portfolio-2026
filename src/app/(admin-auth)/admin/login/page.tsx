'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import NextAuthProvider from '@/components/SessionProvider'

function LoginForm() {
  const [fields, setFields] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email: fields.email,
      password: fields.password,
      redirect: false,
    })

    if (result?.error) {
      setError('Identifiants incorrects.')
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-10">
          <span
            className="font-mono text-xl font-bold tracking-[0.3em] text-accent block mb-2"
            style={{ textShadow: '0 0 20px var(--color-accent-halo)' }}
          >
            S.M_
          </span>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
            Accès administration
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {[
            { name: 'email',    label: 'Email',       type: 'email',    placeholder: 'test@test.fr' },
            { name: 'password', label: 'Mot de passe', type: 'password', placeholder: '••••••••' },
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

          {error && (
            <p className="font-mono text-xs text-red-400 tracking-wider">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 font-mono text-xs uppercase tracking-[0.25em] px-8 py-3 border border-accent text-accent hover:bg-accent hover:text-[var(--color-bg-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Back to portfolio */}
        <a
          href="/"
          className="mt-8 inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors duration-200"
        >
          ← Retour au portfolio
        </a>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <NextAuthProvider>
      <LoginForm />
    </NextAuthProvider>
  )
}
