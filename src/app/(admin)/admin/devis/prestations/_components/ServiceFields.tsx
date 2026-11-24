import type { Service } from '@prisma/client'
import { formatHundredths } from '@/lib/quotes/money'
import { Field, TextArea, TextInput } from '../../../_components/FormFields'
import Toggle from '../../_components/Toggle'

export default function ServiceFields({ initial }: { initial?: Service }) {
  return (
    <>
      <Field label="Libellé">
        <TextInput name="label" aria-label="Libellé" required maxLength={200} defaultValue={initial?.label} />
      </Field>
      <Field label="Description">
        <TextArea name="description" aria-label="Description" maxLength={2000} defaultValue={initial?.description ?? ''} />
      </Field>
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Prix unitaire (€)">
          <TextInput name="unitPrice" aria-label="Prix unitaire" required inputMode="decimal" placeholder="350,00" defaultValue={initial ? formatHundredths(initial.unitPriceCents) : ''} />
        </Field>
        <Field label="Unité">
          <TextInput name="unit" aria-label="Unité" required maxLength={30} list="units" defaultValue={initial?.unit ?? 'forfait'} />
          <datalist id="units">{['forfait', 'jour', 'heure', 'page'].map((u) => <option key={u} value={u} />)}</datalist>
        </Field>
      </div>
      <Toggle name="active" label="Proposée dans les devis" initial={initial?.active ?? true} />
    </>
  )
}
