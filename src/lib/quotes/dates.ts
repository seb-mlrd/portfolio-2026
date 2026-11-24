const parisDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })

/** Jour courant à Paris, en Date UTC à minuit (même forme que les colonnes @db.Date) */
export function todayParis(now = new Date()): Date {
  return new Date(`${parisDay.format(now)}T00:00:00.000Z`)
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000)
}

const day = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
const dateTime = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Paris' })

export const formatDay = (d: Date) => day.format(d)
export const formatDateTime = (d: Date) => dateTime.format(d)
