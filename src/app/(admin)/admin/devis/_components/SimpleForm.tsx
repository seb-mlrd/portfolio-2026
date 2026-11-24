'use client'

import { useState, useTransition } from 'react'
import { SubmitButton } from '../../_components/FormFields'

/** Formulaire FormData → action serveur, avec message d'erreur ou de succès */
export default function SimpleForm({
  action,
  children,
}: {
  action: (formData: FormData) => Promise<{ error: string } | { ok: true }>
  children: React.ReactNode
}) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null)

  return (
    <form
      className="flex flex-col gap-8 max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        setMessage(null)
        startTransition(async () => {
          const result = await action(formData)
          if (!result) return // redirection
          setMessage('error' in result ? { error: true, text: result.error } : { error: false, text: 'Enregistré.' })
        })
      }}
    >
      {children}
      {message && (
        <p role={message.error ? 'alert' : 'status'} className={`font-mono text-xs ${message.error ? 'text-red-400' : 'text-accent'}`}>
          {message.text}
        </p>
      )}
      <SubmitButton pending={pending} />
    </form>
  )
}
