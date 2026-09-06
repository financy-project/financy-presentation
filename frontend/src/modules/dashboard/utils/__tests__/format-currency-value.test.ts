import { describe, expect, it } from 'vitest'
import { formatCurrencyValue } from '@/modules/dashboard/utils/format-currency-value'

describe('formatCurrencyValue', () => {
  it('formats 0 as "R$ 0,00"', () => {
    expect(formatCurrencyValue(0)).toBe('R$ 0,00')
  })

  it('formats 1284732 as "R$ 12.847,32"', () => {
    expect(formatCurrencyValue(1284732)).toBe('R$ 12.847,32')
  })

  it('formats negative cents with a leading "-"', () => {
    expect(formatCurrencyValue(-500)).toBe('-R$ 5,00')
  })

  it('never contains a U+00A0 no-break space', () => {
    expect(formatCurrencyValue(1284732)).not.toMatch(/ /)
  })
})
