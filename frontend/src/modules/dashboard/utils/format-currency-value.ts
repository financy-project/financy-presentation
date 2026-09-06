const VALUE_FORMATTER = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatCurrencyValue(cents: number): string {
  // Intl.NumberFormat's pt-BR currency output uses U+00A0 (no-break space)
  // between "R$" and the amount — normalize to a regular space so the
  // string is predictable to test against and to copy/search.
  return VALUE_FORMATTER.format(cents / 100).replace(/ /g, ' ')
}
