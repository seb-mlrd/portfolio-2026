import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import QuoteDocument from '@/components/quote/QuoteDocument'
import { getQuote, isPrintTokenValid } from '@/lib/quotes/server'
import { getSettings } from '@/lib/quotes/settings'
import { toQuoteView } from '@/lib/quotes/view'
import './print.css'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  await params
  return { title: 'Devis', robots: { index: false }, referrer: 'no-referrer' }
}

/** Chaîne CSS sûre : tout caractère hors lettres/chiffres/espaces est échappé */
const cssString = (s: string) =>
  `"${s.replace(/[^\p{L}\p{N} ]/gu, (c) => `\\${c.codePointAt(0)!.toString(16)} `)}"`

export default async function PrintQuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string | string[] }>
}) {
  const { id } = await params
  const { token } = await searchParams
  if (typeof token !== 'string' || !isPrintTokenValid(token, id)) notFound()
  const quote = await getQuote(id)
  if (!quote) notFound()
  const view = toQuoteView(quote, await getSettings())

  const left = [view.issuer.name, view.issuer.siret && `SIRET ${view.issuer.siret}`, !view.vatEnabled && view.vatMention]
    .filter(Boolean)
    .join(' · ')
  const font = 'font: 7.5pt Arial, sans-serif; color: #595959;'
  const footer = `@page {
    @bottom-left { content: ${cssString(left)}; ${font} width: 75%; }
    @bottom-right { content: ${cssString(`${view.number} — `)} counter(page) " / " counter(pages); ${font} white-space: nowrap; }
  }`

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: footer }} />
      <QuoteDocument quote={view} />
    </>
  )
}
