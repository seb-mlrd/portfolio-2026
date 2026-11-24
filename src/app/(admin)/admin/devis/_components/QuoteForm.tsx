'use client'

import { useRef, useState, useTransition } from 'react'
import { createClientQuick } from '@/lib/actions/clients'
import { saveQuote } from '@/lib/actions/quotes'
import { formatCents, formatHundredths, parseHundredths } from '@/lib/quotes/money'
import { fieldErrors, quoteSchema, type QuoteFormInput } from '@/lib/quotes/schema'
import { computeTotals, lineTotal } from '@/lib/quotes/totals'
import { Field, SubmitButton, TextArea, TextInput } from '../../_components/FormFields'
import ClientFields from './ClientFields'

type Line = QuoteFormInput['lines'][number] & { key: number }
type CatalogItem = { id: string; label: string; description: string | null; unitPriceCents: number; unit: string }

const small = 'font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-2 border border-border text-muted hover:border-accent hover:text-accent disabled:opacity-30'
const select = 'bg-bg-dark border border-border px-4 py-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent'

function ErrorText({ children }: { children?: string }) {
  return children ? <p role="alert" className="font-mono text-[11px] text-red-400">{children}</p> : null
}

export default function QuoteForm({
  id,
  initial,
  clients: initialClients,
  services,
  vat,
}: {
  id: string | null
  initial: QuoteFormInput
  clients: { id: string; name: string }[]
  services: CatalogItem[]
  vat: { enabled: boolean; rateBps: number; mention: string }
}) {
  const [pending, startTransition] = useTransition()
  const [clients, setClients] = useState(initialClients)
  const [values, setValues] = useState(initial)
  const [lines, setLines] = useState<Line[]>(() => initial.lines.map((l, key) => ({ ...l, key })))
  const nextKey = useRef(initial.lines.length)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [addingClient, setAddingClient] = useState(false)
  const [clientError, setClientError] = useState('')
  const clientBox = useRef<HTMLDivElement>(null)

  const set = (key: keyof Omit<QuoteFormInput, 'lines'>) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }))
  const setLine = (key: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)))

  function addLine(item?: CatalogItem) {
    const line: Line = {
      key: nextKey.current++,
      serviceId: item?.id ?? null,
      label: item?.label ?? '',
      description: item?.description ?? '',
      quantity: '1',
      unit: item?.unit ?? 'forfait',
      unitPrice: item ? formatHundredths(item.unitPriceCents) : '',
    }
    setLines((ls) => [...ls, line])
  }

  function move(index: number, delta: number) {
    setErrors({}) // les erreurs sont indexées par position
    setLines((ls) => {
      const copy = [...ls]
      ;[copy[index], copy[index + delta]] = [copy[index + delta], copy[index]]
      return copy
    })
  }

  function quickClient() {
    const formData = new FormData()
    const fields = clientBox.current!.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[name]')
    fields.forEach((f) => formData.set(f.name, f.value))
    setClientError('')
    startTransition(async () => {
      const result = await createClientQuick(formData)
      if ('error' in result) return setClientError(result.error ?? 'Erreur inattendue')
      setClients((cs) => [...cs, result.client])
      setValues((v) => ({ ...v, clientId: result.client.id }))
      setAddingClient(false)
    })
  }

  // Saisies invalides comptées à 0 pendant la frappe
  const parsed = lines.map((l) => ({
    quantityHundredths: parseHundredths(l.quantity) ?? 0,
    unitPriceCents: parseHundredths(l.unitPrice) ?? 0,
  }))
  const depositPercent = Math.min(100, Number.parseInt(values.depositPercent, 10) || 0)
  const totals = computeTotals({ lines: parsed, depositPercent, vatEnabled: vat.enabled, vatRateBps: vat.rateBps })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const input: QuoteFormInput = {
      ...values,
      lines: lines.map(({ serviceId, label, description, quantity, unit, unitPrice }) => ({
        serviceId, label, description, quantity, unit, unitPrice,
      })),
    }
    const check = quoteSchema.safeParse(input)
    if (!check.success) return setErrors(fieldErrors(check.error))
    setErrors({})
    startTransition(async () => {
      const result = await saveQuote(id, input)
      if (result) setErrors(result.errors)
    })
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8 max-w-4xl">
      <section className="flex flex-col gap-4">
        <Field label="Client">
          <div className="flex gap-3">
            <select aria-label="Client" value={values.clientId} onChange={set('clientId')} className={`${select} flex-1 min-w-0`}>
              <option value="">Choisir…</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button type="button" className={small} aria-expanded={addingClient} onClick={() => setAddingClient((v) => !v)}>
              {addingClient ? 'Annuler' : '+ Nouveau'}
            </button>
          </div>
        </Field>
        <ErrorText>{errors.clientId}</ErrorText>
        {addingClient && (
          <div ref={clientBox} className="border border-border p-5 flex flex-col gap-6">
            <ClientFields />
            <ErrorText>{clientError}</ErrorText>
            <button type="button" disabled={pending} onClick={quickClient} className={`${small} self-start`}>
              {pending ? 'Création…' : 'Créer le client'}
            </button>
          </div>
        )}
      </section>

      <div className="grid md:grid-cols-3 gap-6">
        <Field label="Émission">
          <TextInput type="date" aria-label="Émission" value={values.issueDate} onChange={set('issueDate')} />
          <ErrorText>{errors.issueDate}</ErrorText>
        </Field>
        <Field label="Valable jusqu'au">
          <TextInput type="date" aria-label="Valable jusqu'au" value={values.validUntil} onChange={set('validUntil')} />
          <ErrorText>{errors.validUntil}</ErrorText>
        </Field>
        <Field label="Acompte (%)">
          <TextInput inputMode="numeric" aria-label="Acompte" value={values.depositPercent} onChange={set('depositPercent')} />
          <ErrorText>{errors.depositPercent}</ErrorText>
        </Field>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">Lignes</h2>
        {lines.map((line, i) => (
          <fieldset key={line.key} className="border border-border p-4 flex flex-col gap-3">
            <legend className="sr-only">Ligne {i + 1}</legend>
            <TextInput aria-label={`Libellé, ligne ${i + 1}`} placeholder="Libellé" value={line.label} onChange={(e) => setLine(line.key, { label: e.target.value })} />
            <ErrorText>{errors[`lines.${i}.label`]}</ErrorText>
            <TextArea aria-label={`Description, ligne ${i + 1}`} placeholder="Description (facultative)" rows={2} value={line.description} onChange={(e) => setLine(line.key, { description: e.target.value })} />
            <ErrorText>{errors[`lines.${i}.description`]}</ErrorText>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 [&_input]:min-w-0">
              <Field label="Quantité">
                <TextInput inputMode="decimal" aria-label={`Quantité, ligne ${i + 1}`} value={line.quantity} onChange={(e) => setLine(line.key, { quantity: e.target.value })} />
                <ErrorText>{errors[`lines.${i}.quantity`]}</ErrorText>
              </Field>
              <Field label="Unité">
                <TextInput list="quote-units" aria-label={`Unité, ligne ${i + 1}`} value={line.unit} onChange={(e) => setLine(line.key, { unit: e.target.value })} />
                <ErrorText>{errors[`lines.${i}.unit`]}</ErrorText>
              </Field>
              <Field label="Prix unitaire (€)">
                <TextInput inputMode="decimal" aria-label={`Prix unitaire, ligne ${i + 1}`} value={line.unitPrice} onChange={(e) => setLine(line.key, { unitPrice: e.target.value })} />
                <ErrorText>{errors[`lines.${i}.unitPrice`]}</ErrorText>
              </Field>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className={small} disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Monter la ligne ${i + 1}`}>↑</button>
              <button type="button" className={small} disabled={i === lines.length - 1} onClick={() => move(i, 1)} aria-label={`Descendre la ligne ${i + 1}`}>↓</button>
              <button
                type="button"
                className={small}
                onClick={() => {
                  setErrors({})
                  setLines((ls) => ls.filter((l) => l.key !== line.key))
                }}
                aria-label={`Supprimer la ligne ${i + 1}`}
              >
                Supprimer
              </button>
              <span className="ml-auto font-mono text-sm tabular-nums">
                {formatCents(lineTotal(parsed[i].quantityHundredths, parsed[i].unitPriceCents))}
              </span>
            </div>
          </fieldset>
        ))}
        <datalist id="quote-units">{['forfait', 'jour', 'heure', 'page'].map((u) => <option key={u} value={u} />)}</datalist>
        <ErrorText>{errors.lines}</ErrorText>
        <div className="flex flex-wrap gap-3">
          <button type="button" className={small} onClick={() => addLine()}>+ Ligne libre</button>
          {services.length > 0 && (
            <select
              aria-label="Insérer depuis le catalogue"
              value=""
              onChange={(e) => addLine(services.find((s) => s.id === e.target.value))}
              className={select}
            >
              <option value="" disabled>+ Depuis le catalogue</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.label} — {formatCents(s.unitPriceCents)} / {s.unit}</option>)}
            </select>
          )}
        </div>
      </section>

      <dl className="self-end w-full max-w-sm border border-border p-5 font-mono text-sm flex flex-col gap-2 [&>div]:flex [&>div]:justify-between [&>div]:gap-4">
        {vat.enabled && (
          <>
            <div><dt className="text-muted">Total HT</dt><dd>{formatCents(totals.subtotalCents)}</dd></div>
            <div><dt className="text-muted">TVA {formatHundredths(vat.rateBps)} %</dt><dd>{formatCents(totals.vatCents)}</dd></div>
          </>
        )}
        <div className="font-bold"><dt>{vat.enabled ? 'Total TTC' : 'Total net'}</dt><dd>{formatCents(totals.totalCents)}</dd></div>
        <div><dt className="text-muted">Acompte</dt><dd>{formatCents(totals.depositCents)}</dd></div>
        {!vat.enabled && <p className="text-[10px] text-muted">{vat.mention}</p>}
      </dl>

      <Field label="Conditions de paiement">
        <TextArea aria-label="Conditions de paiement" value={values.paymentTerms} onChange={set('paymentTerms')} />
        <ErrorText>{errors.paymentTerms}</ErrorText>
      </Field>
      <Field label="Notes" hint="Affichées sur le devis">
        <TextArea aria-label="Notes" value={values.notes} onChange={set('notes')} />
        <ErrorText>{errors.notes}</ErrorText>
      </Field>

      <ErrorText>{errors.form ?? (Object.keys(errors).length > 0 ? 'Corrige les champs signalés.' : undefined)}</ErrorText>
      <SubmitButton pending={pending} />
    </form>
  )
}
