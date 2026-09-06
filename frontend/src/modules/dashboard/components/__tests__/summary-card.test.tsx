import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SummaryCard } from '@/modules/dashboard/components/summary-card'

describe('SummaryCard', () => {
  it('renders the title and formatted value', () => {
    render(<SummaryCard mode="balance" title="Saldo Total" value={1284732} />)

    expect(screen.getByText('Saldo Total')).toBeInTheDocument()
    expect(screen.getByText('R$ 12.847,32')).toBeInTheDocument()
  })

  it('renders the Wallet icon with text-purple-base for mode="balance"', () => {
    render(<SummaryCard mode="balance" title="Saldo Total" value={0} />)

    expect(screen.getByTestId('summary-card-balance-icon')).toHaveClass('text-purple-base')
  })

  it('renders the CircleArrowUp icon with text-green-dark for mode="income"', () => {
    render(<SummaryCard mode="income" title="Receitas do Mês" value={0} />)

    expect(screen.getByTestId('summary-card-income-icon')).toHaveClass('text-green-dark')
  })

  it('renders the CircleArrowDown icon with text-red-dark for mode="expense"', () => {
    render(<SummaryCard mode="expense" title="Despesas do Mês" value={0} />)

    expect(screen.getByTestId('summary-card-expense-icon')).toHaveClass('text-red-dark')
  })
})
