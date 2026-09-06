import { describe, expect, it } from 'vitest'
import { formatTransactionDate, formatTransactionValue } from '@/modules/transactions/utils/format-transaction'

describe('formatTransactionValue', () => {
  it('formats 8850/EXPENSE as "- R$ 88,50"', () => {
    expect(formatTransactionValue(8850, 'EXPENSE')).toBe('- R$ 88,50')
  })

  it('formats 34025/INCOME as "+ R$ 340,25"', () => {
    expect(formatTransactionValue(34025, 'INCOME')).toBe('+ R$ 340,25')
  })
})

describe('formatTransactionDate', () => {
  it('formats an ISO date as "30/11/25" (2-digit year)', () => {
    expect(formatTransactionDate('2025-11-30T00:00:00.000Z')).toBe('30/11/25')
  })
})
