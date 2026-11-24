import { formatDay } from '@/lib/quotes/dates'
import { formatCents, formatHundredths } from '@/lib/quotes/money'
import type { QuoteView } from '@/lib/quotes/view'
import './quote-document.css'

const siretFmt = (s: string) => s.replace(/^(\d{3})(\d{3})(\d{3})(\d{5})$/, '$1 $2 $3 $4')

/** Rendu unique du devis (preview admin, page publique, PDF) */
export default function QuoteDocument({ quote }: { quote: QuoteView }) {
  const { issuer, client } = quote
  return (
    <div className="qd-paper">
      <article className="qd">
        <header className="qd-head">
          <div>
            {issuer.logoPath && (
              // eslint-disable-next-line @next/next/no-img-element -- image brute : pas d'optimisation ni de lazy-load dans le PDF
              <img src={issuer.logoPath} alt="" className="qd-logo" />
            )}
            <p className="qd-name">{issuer.name || 'Émetteur à compléter dans les réglages'}</p>
            <p className="qd-pre">{issuer.address}</p>
            {issuer.siret && <p>SIRET {siretFmt(issuer.siret)}</p>}
            <p>{issuer.email}</p>
            {issuer.phone && <p>{issuer.phone}</p>}
          </div>
          <div className="qd-title">
            <h1>Devis</h1>
            <p className="qd-name">{quote.number}</p>
            <p className="qd-muted">Émis le {formatDay(quote.issueDate)}</p>
            <p className="qd-muted">Valable jusqu&apos;au {formatDay(quote.validUntil)}</p>
          </div>
        </header>

        <section className="qd-client">
          <p className="qd-label">Client</p>
          <p className="qd-name">{client.name}</p>
          {client.contactName && <p>{client.contactName}</p>}
          <p className="qd-pre">{client.address}</p>
          <p>{client.email}</p>
          {client.siret && <p>SIRET {siretFmt(client.siret)}</p>}
        </section>

        <table className="qd-table">
          <thead>
            <tr>
              <th>Prestation</th>
              <th className="qd-num">Quantité</th>
              <th className="qd-num">Prix unitaire{quote.vatEnabled ? ' HT' : ''}</th>
              <th className="qd-num">Total{quote.vatEnabled ? ' HT' : ''}</th>
            </tr>
          </thead>
          <tbody>
            {quote.lines.map((line) => (
              <tr key={line.id}>
                <td>
                  <p>{line.label}</p>
                  {line.description && <p className="qd-desc">{line.description}</p>}
                </td>
                <td className="qd-num">{formatHundredths(line.quantityHundredths)} {line.unit}</td>
                <td className="qd-num">{formatCents(line.unitPriceCents)}</td>
                <td className="qd-num">{formatCents(line.totalCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="qd-totals">
          {quote.vatEnabled && (
            <>
              <div><span>Total HT</span><span className="qd-num">{formatCents(quote.subtotalCents)}</span></div>
              <div><span>TVA {formatHundredths(quote.vatRateBps)} %</span><span className="qd-num">{formatCents(quote.vatCents)}</span></div>
            </>
          )}
          <div className="qd-total">
            <span>{quote.vatEnabled ? 'Total TTC' : 'Total net'}</span>
            <span className="qd-num">{formatCents(quote.totalCents)}</span>
          </div>
          {quote.depositPercent > 0 && (
            <div>
              <span>Acompte à la commande ({quote.depositPercent} %)</span>
              <span className="qd-num">{formatCents(quote.depositCents)}</span>
            </div>
          )}
          {!quote.vatEnabled && <p className="qd-vat qd-muted">{quote.vatMention}</p>}
        </div>

        <section className="qd-block">
          <p className="qd-label">Conditions de paiement</p>
          <p className="qd-pre">{quote.paymentTerms}</p>
        </section>
        {quote.notes && (
          <section className="qd-block">
            <p className="qd-label">Notes</p>
            <p className="qd-pre">{quote.notes}</p>
          </section>
        )}

        <section className="qd-sign">
          <div>
            <p className="qd-label">L&apos;émetteur</p>
            <p>{issuer.name}</p>
          </div>
          <div>
            <p className="qd-label">Le client</p>
            <p className="qd-muted">Date, nom, signature et mention « Bon pour accord »</p>
          </div>
        </section>

        {issuer.legalMentions && <footer className="qd-legal">{issuer.legalMentions}</footer>}
      </article>
    </div>
  )
}
