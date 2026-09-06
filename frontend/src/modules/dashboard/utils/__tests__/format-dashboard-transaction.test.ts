import { describe, expect, it } from 'vitest'
import {
  formatDashboardTransactionDate,
  formatDashboardTransactionValue,
} from '@/modules/dashboard/utils/format-dashboard-transaction'

describe('formatDashboardTransactionValue', () => {
  it('formats 425000/INCOME as "+ R$ 4.250,00"', () => {
    expect(formatDashboardTransactionValue(425000, 'INCOME')).toBe('+ R$ 4.250,00')
  })

  it('formats 8950/EXPENSE as "- R$ 89,50"', () => {
    expect(formatDashboardTransactionValue(8950, 'EXPENSE')).toBe('- R$ 89,50')
  })

  it('has no U+00A0 (no-break space) characters', () => {
    expect(formatDashboardTransactionValue(425000, 'INCOME')).not.toMatch(/ /)
  })
})

describe('formatDashboardTransactionDate', () => {
  it('formats an ISO date as "30/11/25" (2-digit year) in UTC', () => {
    expect(formatDashboardTransactionDate('2025-11-30T00:00:00.000Z')).toBe('30/11/25')
  })
})
