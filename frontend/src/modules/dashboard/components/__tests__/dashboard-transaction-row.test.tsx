import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DashboardTransactionRow } from '@/modules/dashboard/components/dashboard-transaction-row'
import {
  formatDashboardTransactionDate,
  formatDashboardTransactionValue,
} from '@/modules/dashboard/utils/format-dashboard-transaction'

const INCOME_TRANSACTION = {
  id: 't1',
  type: 'INCOME' as const,
  description: 'Pagamento de Salário',
  date: '2025-12-01T00:00:00.000Z',
  value: 425000,
  category: { id: 'c1', title: 'Receita', color: '#16A34A', icon: 'BriefcaseBusiness' },
}

const EXPENSE_TRANSACTION = {
  id: 't2',
  type: 'EXPENSE' as const,
  description: 'Jantar no Restaurante',
  date: '2025-11-30T00:00:00.000Z',
  value: 8950,
  category: { id: 'c2', title: 'Alimentação', color: '#2563EB', icon: 'Utensils' },
}

describe('DashboardTransactionRow', () => {
  it("renders the transaction's description, formatted date, category title, and formatted value", () => {
    render(<DashboardTransactionRow transaction={INCOME_TRANSACTION} />)

    expect(screen.getByText('Pagamento de Salário')).toBeInTheDocument()
    expect(screen.getByText(formatDashboardTransactionDate(INCOME_TRANSACTION.date))).toBeInTheDocument()
    expect(screen.getByText('Receita')).toBeInTheDocument()
    expect(
      screen.getByText(formatDashboardTransactionValue(INCOME_TRANSACTION.value, 'INCOME')),
    ).toBeInTheDocument()
  })

  it('renders CircleArrowUp with text-green-dark for an INCOME transaction', () => {
    render(<DashboardTransactionRow transaction={INCOME_TRANSACTION} />)

    expect(screen.getByTestId('dashboard-transaction-type-icon').querySelector('svg')).toHaveClass(
      'lucide-circle-arrow-up',
      'text-green-dark',
    )
  })

  it('renders CircleArrowDown with text-red-dark for an EXPENSE transaction', () => {
    render(<DashboardTransactionRow transaction={EXPENSE_TRANSACTION} />)

    expect(screen.getByTestId('dashboard-transaction-type-icon').querySelector('svg')).toHaveClass(
      'lucide-circle-arrow-down',
      'text-red-dark',
    )
  })

  it('renders without crashing when category is null', () => {
    render(<DashboardTransactionRow transaction={{ ...EXPENSE_TRANSACTION, category: null }} />)

    expect(screen.getByText('Jantar no Restaurante')).toBeInTheDocument()
  })
})
