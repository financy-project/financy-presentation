import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TransactionCategoryCell } from '@/modules/transactions/components/transaction-category-cell'

describe('TransactionCategoryCell', () => {
  it('renders the mapped icon + tinted background for a known category color/icon', () => {
    render(
      <TransactionCategoryCell
        category={{ id: 'cat-1', title: 'Alimentação', color: '#2563EB', icon: 'Utensils' }}
      />,
    )

    const icon = screen.getByTestId('transaction-category-icon')
    expect(icon).toHaveClass('bg-blue-light', 'text-blue-base')
    expect(screen.getByText('Alimentação')).toBeInTheDocument()
  })

  it('falls back to a generic icon when category is null', () => {
    render(<TransactionCategoryCell category={null} />)

    const icon = screen.getByTestId('transaction-category-icon')
    expect(icon).toHaveClass('bg-blue-light', 'text-blue-base')
    expect(screen.getByText('Sem categoria')).toBeInTheDocument()
  })
})
