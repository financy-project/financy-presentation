const DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
  // The server sends date-only values as midnight-UTC ISO strings; reading
  // them back in the viewer's local timezone can shift the calendar date
  // by a day (e.g. UTC-3 turns "2025-11-30T00:00:00.000Z" into "29/11/25").
  timeZone: 'UTC',
})

const VALUE_FORMATTER = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatDashboardTransactionDate(iso: string): string {
  return DATE_FORMATTER.format(new Date(iso))
}

export function formatDashboardTransactionValue(cents: number, type: 'EXPENSE' | 'INCOME'): string {
  const sign = type === 'EXPENSE' ? '-' : '+'
  // Intl.NumberFormat's pt-BR currency output uses U+00A0 (no-break space)
  // between "R$" and the amount — normalize to a regular space so the
  // string is predictable to test against and to copy/search.
  const amount = VALUE_FORMATTER.format(cents / 100).replace(/ /g, ' ')
  return `${sign} ${amount}`
}
