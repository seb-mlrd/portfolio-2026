'use client'

import { useTransition } from 'react'
import type { Skill } from '@prisma/client'
import { saveSkill } from '@/lib/actions/skills'
import TagInput from '../../_components/TagInput'
import { Field, TextInput, TextArea, PublishedToggle, SubmitButton } from '../../_components/FormFields'

export default function SkillForm({ initial }: { initial?: Skill }) {
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => saveSkill(initial?.id ?? null, formData))
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-2xl">
      <Field label="Titre">
        <TextInput name="title" required defaultValue={initial?.title} placeholder="Concevoir des interfaces accessibles" />
      </Field>
      <Field label="Description">
        <TextArea name="description" required defaultValue={initial?.description} placeholder="Ce que tu sais faire, concrètement..." />
      </Field>
      <Field label="Mots-clés" hint="Facultatif, affichés sous la description">
        <TagInput name="keywords" initialTags={initial?.keywords} placeholder="Ex: RGAA" />
      </Field>
      <Field label="Ordre" hint="Plus petit = affiché en premier">
        <TextInput name="order" type="number" defaultValue={initial?.order ?? 0} />
      </Field>
      <PublishedToggle initial={initial?.published ?? true} />
      <SubmitButton pending={pending} />
    </form>
  )
}
