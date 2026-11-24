import type { Client } from '@prisma/client'
import { Field, TextArea, TextInput } from '../../_components/FormFields'

export default function ClientFields({ initial }: { initial?: Client }) {
  return (
    <>
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Nom / raison sociale">
          <TextInput name="name" aria-label="Nom / raison sociale" required maxLength={200} defaultValue={initial?.name} />
        </Field>
        <Field label="Contact">
          <TextInput name="contactName" aria-label="Contact" maxLength={200} defaultValue={initial?.contactName ?? ''} />
        </Field>
        <Field label="Email">
          <TextInput name="email" aria-label="Email" type="email" required defaultValue={initial?.email} />
        </Field>
        <Field label="SIRET" hint="Facultatif, 14 chiffres">
          <TextInput name="siret" aria-label="SIRET" inputMode="numeric" defaultValue={initial?.siret ?? ''} />
        </Field>
      </div>
      <Field label="Adresse">
        <TextArea name="address" aria-label="Adresse" required rows={3} defaultValue={initial?.address} />
      </Field>
      <Field label="Notes" hint="Internes, jamais affichées sur le devis">
        <TextArea name="notes" aria-label="Notes" rows={2} defaultValue={initial?.notes ?? ''} />
      </Field>
    </>
  )
}
