'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import {
  cancelSend, createVersion, markRefused, resendAcceptedWebhook, sendQuote, setArchived,
} from '@/lib/actions/quotes'
import type { DisplayStatus } from '@/lib/quotes/status'

const btn = 'font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-2.5 border border-border text-muted hover:border-accent hover:text-accent transition-colors duration-200 disabled:opacity-40'
const primary = 'font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-2.5 border border-accent text-accent hover:bg-accent hover:text-bg-dark transition-colors duration-200 disabled:opacity-40'

export default function QuoteActions({
  id,
  status,
  clientEmail,
  hasChild,
  hasPdf,
  sendStale,
  archived,
  canResendWebhook,
}: {
  id: string
  status: DisplayStatus
  clientEmail: string
  hasChild: boolean
  hasPdf: boolean
  sendStale: boolean
  archived: boolean
  canResendWebhook: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [running, setRunning] = useState('')
  const [error, setError] = useState('')

  function run(name: string, action: () => Promise<{ error: string } | { ok: true }>, confirmMessage?: string) {
    if (confirmMessage && !confirm(confirmMessage)) return
    setError('')
    setRunning(name)
    startTransition(async () => {
      try {
        const result = await action()
        if (result && 'error' in result) setError(result.error)
      } catch {
        setError('Une erreur est survenue, réessaie.')
      }
    })
  }
  const label = (name: string, text: string, busy: string) => (pending && running === name ? busy : text)

  return (
    <div className="flex flex-col gap-3 mb-8">
      <div className="flex flex-wrap gap-3">
        {status === 'brouillon' && (
          <>
            <Link href={`/admin/devis/${id}/modifier`} className={btn}>Modifier</Link>
            <button disabled={pending} className={primary} onClick={() => run('send', () => sendQuote(id), `Envoyer ce devis à ${clientEmail} ? Il ne sera plus modifiable.`)}>
              {label('send', 'Envoyer au client', 'Envoi…')}
            </button>
          </>
        )}
        {status === 'envoi' && sendStale && (
          <>
            <button disabled={pending} className={primary} onClick={() => run('send', () => sendQuote(id), 'n8n n’a pas confirmé l’envoi. Vérifie ses exécutions : si le mail est déjà parti, le client le recevra deux fois. Relancer ?')}>
              {label('send', 'Relancer l’envoi', 'Envoi…')}
            </button>
            <button disabled={pending} className={btn} onClick={() => run('cancel', () => cancelSend(id), 'Vérifie dans n8n que le mail n’est pas parti. Rendre le devis modifiable ?')}>
              {label('cancel', 'Annuler l’envoi', 'Annulation…')}
            </button>
          </>
        )}
        {status !== 'brouillon' && status !== 'envoi' && !hasChild && (
          <button disabled={pending} className={btn} onClick={() => run('version', () => createVersion(id))}>
            {label('version', 'Créer une nouvelle version', 'Création…')}
          </button>
        )}
        {(status === 'envoyé' || status === 'expiré') && (
          <button disabled={pending} className={btn} onClick={() => run('refuse', () => markRefused(id), 'Marquer ce devis comme refusé ?')}>
            {label('refuse', 'Marquer comme refusé', '…')}
          </button>
        )}
        {canResendWebhook && (
          <button disabled={pending} className={primary} onClick={() => run('webhook', () => resendAcceptedWebhook(id))}>
            {label('webhook', 'Renvoyer la notification', 'Envoi…')}
          </button>
        )}
        {hasPdf ? (
          <a href={`/admin/devis/${id}/pdf`} className={btn}>Télécharger le PDF</a>
        ) : (
          <a href={`/admin/devis/${id}/imprimer`} target="_blank" rel="noreferrer" className={btn}>Imprimer / PDF</a>
        )}
        {status !== 'envoi' && (
          <button disabled={pending} className={btn} onClick={() => run('archive', () => setArchived(id, !archived))}>
            {archived ? 'Désarchiver' : 'Archiver'}
          </button>
        )}
      </div>
      {error && <p role="alert" className="font-mono text-xs text-red-400">{error}</p>}
    </div>
  )
}
