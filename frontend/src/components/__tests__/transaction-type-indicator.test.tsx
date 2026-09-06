import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TransactionTypeIndicator } from '@/components/transaction-type-indicator'

describe('TransactionTypeIndicator', () => {
  it('renders "Entrada" with the correct icon and color for type="income"', () => {
    render(<TransactionTypeIndicator type="income" />)
    const label = screen.getByText('Entrada')
    expect(label).toBeInTheDocument()
    expect(label.closest('[data-slot="transaction-type-indicator"]')).toHaveClass('text-green-dark')
    expect(
      label.closest('[data-slot="transaction-type-indicator"]')?.querySelector('svg')
    ).toHaveClass('lucide-circle-arrow-up')
  })

  it('renders "Saída" with the correct icon and color for type="expense"', () => {
    render(<TransactionTypeIndicator type="expense" />)
    const label = screen.getByText('Saída')
    expect(label).toBeInTheDocument()
    expect(label.closest('[data-slot="transaction-type-indicator"]')).toHaveClass(
      'text-red-dark'
    )
    expect(
      label.closest('[data-slot="transaction-type-indicator"]')?.querySelector('svg')
    ).toHaveClass('lucide-circle-arrow-down')
  })
})
