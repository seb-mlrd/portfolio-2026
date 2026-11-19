const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric', timeZone: 'UTC' })

export function formatMonth(date: Date): string {
  return monthFormatter.format(date)
}

/** "janv. 2023 — Aujourd'hui" */
export function formatPeriod(start: Date, end: Date | null): string {
  return `${formatMonth(start)} — ${end ? formatMonth(end) : "Aujourd'hui"}`
}

/** "2018 — 2023", "2023 — En cours" */
export function formatYears(start: number, end: number | null): string {
  if (end === start) return String(start)
  return `${start} — ${end ?? 'En cours'}`
}

/** Date → "YYYY-MM-DD" pour un <input type="date"> */
export function toDateInput(date: Date | null | undefined): string {
  return date ? date.toISOString().slice(0, 10) : ''
}
