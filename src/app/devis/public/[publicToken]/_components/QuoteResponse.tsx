'use client'

import { useState, useTransition } from 'react'
import { acceptQuote, refuseQuote } from '@/lib/actions/public-quote'

const input = 'w-full bg-transparent border border-border px-4 py-3 text-base text-foreground focus:outline-none focus:border-accent'

export default function QuoteResponse({ publicToken }: { publicToken: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [refusing, setRefusing] = useState(false)
  const [signerName, setSignerName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [reason, setReason] = useState('')

  function run(action: () => Promise<{ error: string } | { ok: true }>) {
    setError('')
    startTransition(async () => {
      try {
        const result = await action()
        if ('error' in result) setError(result.error)
      } catch {
        setError('Une erreur est survenue. Vérifiez votre connexion puis réessayez.')
      }
    })
  }

  return (
    <section className="border border-border p-6 flex flex-col gap-5">
      {refusing ? (
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            run(() => refuseQuote(publicToken, { reason }))
          }}
        >
          <h2 className="text-lg font-semibold">Refuser le devis</h2>
          <label className="flex flex-col gap-2 text-sm">
            Motif (facultatif)
            <textarea rows={3} maxLength={2000} value={reason} onChange={(e) => setReason(e.target.value)} className={input} />
          </label>
          <div className="flex gap-3 flex-wrap">
            <button disabled={pending} className="px-6 py-3 border border-red-400 text-red-400 disabled:opacity-40">
              {pending ? 'Envoi…' : 'Confirmer le refus'}
            </button>
            <button type="button" disabled={pending} onClick={() => setRefusing(false)} className="px-6 py-3 text-muted hover:text-foreground">
              Retour
            </button>
          </div>
        </form>
      ) : (
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            run(() => acceptQuote(publicToken, { signerName, agreed }))
          }}
        >
          <h2 className="text-lg font-semibold">Accepter le devis</h2>
          <label className="flex flex-col gap-2 text-sm">
            Nom du signataire
            <input required maxLength={120} autoComplete="name" value={signerName} onChange={(e) => setSignerName(e.target.value)} className={input} />
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" required checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-5 h-5 accent-accent" />
            Bon pour accord
          </label>
          <p className="text-xs text-muted">
            La date, l&apos;heure et votre adresse IP sont enregistrées comme preuve de votre accord.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button disabled={pending} className="px-6 py-3 bg-accent text-bg-dark font-semibold disabled:opacity-40">
              {pending ? 'Envoi…' : 'Accepter le devis'}
            </button>
            <button type="button" disabled={pending} onClick={() => setRefusing(true)} className="px-6 py-3 text-muted hover:text-foreground">
              Refuser
            </button>
          </div>
        </form>
      )}
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
    </section>
  )
}
