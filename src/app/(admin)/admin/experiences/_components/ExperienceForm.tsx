'use client'

import { useTransition } from 'react'
import type { Experience } from '@prisma/client'
import { saveExperience } from '@/lib/actions/experiences'
import { toMonthInput } from '@/lib/format'
import TagInput from '../../_components/TagInput'
import { Field, TextInput, TextArea, PublishedToggle, SubmitButton } from '../../_components/FormFields'

const CONTRACT_TYPES = ['CDI', 'CDD', 'Alternance', 'Stage', 'Freelance']

export default function ExperienceForm({ initial }: { initial?: Experience }) {
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => saveExperience(initial?.id ?? null, formData))
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-2xl">
      <Field label="Poste">
        <TextInput name="role" required defaultValue={initial?.role} placeholder="Développeur full stack" />
      </Field>
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Entreprise">
          <TextInput name="company" required defaultValue={initial?.company} placeholder="Acme" />
        </Field>
        <Field label="Ville">
          <TextInput name="location" defaultValue={initial?.location ?? ''} placeholder="Nice" />
        </Field>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Type de contrat" hint="Choisis dans la liste ou saisis le tien">
          <TextInput name="contractType" list="contract-types" defaultValue={initial?.contractType ?? ''} placeholder="CDI" />
          <datalist id="contract-types">
            {CONTRACT_TYPES.map((c) => <option key={c} value={c} />)}
          </datalist>
        </Field>
        <Field label="Ordre" hint="Plus petit = affiché en premier">
          <TextInput name="order" type="number" defaultValue={initial?.order ?? 0} />
        </Field>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Début">
          <TextInput name="startDate" type="month" required defaultValue={toMonthInput(initial?.startDate)} />
        </Field>
        <Field label="Fin" hint="Vide = poste actuel">
          <TextInput name="endDate" type="month" defaultValue={toMonthInput(initial?.endDate)} />
        </Field>
      </div>
      <Field label="Description">
        <TextArea name="description" required rows={5} defaultValue={initial?.description} placeholder="Missions principales, réalisations..." />
      </Field>
      <Field label="Stack">
        <TagInput name="stack" initialTags={initial?.stack} />
      </Field>
      <PublishedToggle initial={initial?.published ?? true} />
      <SubmitButton pending={pending} />
    </form>
  )
}
