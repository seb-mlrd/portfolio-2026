'use client'

import { useTransition } from 'react'
import type { Education } from '@prisma/client'
import { saveEducation } from '@/lib/actions/educations'
import { Field, TextInput, TextArea, PublishedToggle, SubmitButton } from '../../_components/FormFields'

export default function EducationForm({ initial }: { initial?: Education }) {
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => saveEducation(initial?.id ?? null, formData))
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-2xl">
      <Field label="Diplôme">
        <TextInput name="degree" required defaultValue={initial?.degree} placeholder="Master Expert en développement web" />
      </Field>
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="École">
          <TextInput name="school" required defaultValue={initial?.school} placeholder="Digital Campus" />
        </Field>
        <Field label="Ville">
          <TextInput name="location" defaultValue={initial?.location ?? ''} placeholder="Paris" />
        </Field>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <Field label="Année de début">
          <TextInput name="startYear" type="number" required min={1950} max={2100} defaultValue={initial?.startYear} />
        </Field>
        <Field label="Année de fin" hint="Vide = en cours">
          <TextInput name="endYear" type="number" min={1950} max={2100} defaultValue={initial?.endYear ?? ''} />
        </Field>
        <Field label="Ordre" hint="Plus petit = affiché en premier">
          <TextInput name="order" type="number" defaultValue={initial?.order ?? 0} />
        </Field>
      </div>
      <Field label="Description">
        <TextArea name="description" defaultValue={initial?.description ?? ''} placeholder="Contenu de la formation, spécialité..." />
      </Field>
      <PublishedToggle initial={initial?.published ?? true} />
      <SubmitButton pending={pending} />
    </form>
  )
}
