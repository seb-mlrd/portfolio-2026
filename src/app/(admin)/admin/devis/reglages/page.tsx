import { requireAdmin } from '@/lib/actions/_utils'
import { saveSettings } from '@/lib/actions/settings'
import { formatHundredths } from '@/lib/quotes/money'
import { getSettings } from '@/lib/quotes/settings'
import AdminHeader from '../../_components/AdminHeader'
import { Field, TextArea, TextInput } from '../../_components/FormFields'
import SimpleForm from '../_components/SimpleForm'
import Toggle from '../_components/Toggle'

export const metadata = { title: 'Réglages des devis — Admin' }

export default async function SettingsPage() {
  await requireAdmin()
  const s = await getSettings()
  return (
    <div className="p-8">
      <AdminHeader title="Réglages" subtitle="Émetteur et valeurs par défaut des devis" />
      <SimpleForm action={saveSettings}>
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Nom" hint="Micro-entreprise : ajoute « EI » après ton nom">
            <TextInput name="name" aria-label="Nom" required defaultValue={s.name} />
          </Field>
          <Field label="SIRET">
            <TextInput name="siret" aria-label="SIRET" required inputMode="numeric" defaultValue={s.siret} />
          </Field>
          <Field label="Email">
            <TextInput name="email" aria-label="Email" type="email" required defaultValue={s.email} />
          </Field>
          <Field label="Téléphone">
            <TextInput name="phone" aria-label="Téléphone" type="tel" defaultValue={s.phone ?? ''} />
          </Field>
        </div>
        <Field label="Adresse">
          <TextArea name="address" aria-label="Adresse" required rows={3} defaultValue={s.address} />
        </Field>
        <Field label="Logo" hint="Chemin d'un fichier de public/, par exemple /logo.svg">
          <TextInput name="logoPath" aria-label="Logo" defaultValue={s.logoPath ?? ''} />
        </Field>
        <Field label="Conditions de paiement par défaut">
          <TextArea name="paymentTerms" aria-label="Conditions de paiement" required defaultValue={s.paymentTerms} />
        </Field>
        <Field label="Mentions légales" hint="Affichées en bas du devis (assurance, pénalités de retard…)">
          <TextArea name="legalMentions" aria-label="Mentions légales" defaultValue={s.legalMentions} />
        </Field>
        <Field label="Acompte par défaut (%)">
          <TextInput name="depositPercent" aria-label="Acompte" type="number" min={0} max={100} required defaultValue={s.depositPercent} />
        </Field>
        <Toggle name="vatEnabled" label="Facturer la TVA" initial={s.vatEnabled} />
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Taux de TVA (%)" hint="Utilisé seulement si la TVA est activée">
            <TextInput name="vatRate" aria-label="Taux de TVA" required inputMode="decimal" defaultValue={formatHundredths(s.vatRateBps)} />
          </Field>
          <Field label="Mention de franchise" hint="Affichée seulement sans TVA">
            <TextInput name="vatMention" aria-label="Mention de franchise" required defaultValue={s.vatMention} />
          </Field>
        </div>
      </SimpleForm>
    </div>
  )
}
