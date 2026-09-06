import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DashboardSummary } from '@/modules/dashboard/components/dashboard-summary'

const MOVEMENT = {
  income: 425000,
  expense: 218045,
  totalBalance: 1284732,
}

describe('DashboardSummary', () => {
  it('renders exactly 3 SummaryCards', () => {
    render(<DashboardSummary movement={MOVEMENT} />)

    expect(screen.getAllByTestId(/summary-card-.*-icon/)).toHaveLength(3)
  })

  it('renders each card with the corresponding movement field as value', () => {
    render(<DashboardSummary movement={MOVEMENT} />)

    expect(screen.getByText('Saldo Total')).toBeInTheDocument()
    expect(screen.getByText('R$ 12.847,32')).toBeInTheDocument()

    expect(screen.getByText('Receitas do Mês')).toBeInTheDocument()
    expect(screen.getByText('R$ 4.250,00')).toBeInTheDocument()

    expect(screen.getByText('Despesas do Mês')).toBeInTheDocument()
    expect(screen.getByText('R$ 2.180,45')).toBeInTheDocument()
  })
})
