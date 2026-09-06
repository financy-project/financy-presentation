import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CategoriesSummary } from '@/modules/categories/components/categories-summary'
import type { Category } from '@/modules/categories/graphql/queries'

function buildCategory(overrides: Partial<Category>): Category {
  return {
    id: '1',
    title: 'Alimentação',
    description: 'Restaurantes, delivery e refeições',
    icon: 'Utensils',
    color: '#2563EB',
    transactionsQuantity: 0,
    ...overrides,
  }
}

describe('CategoriesSummary', () => {
  it('renders the total category count labeled "Total de categorias"', () => {
    const categories = [
      buildCategory({ id: '1', transactionsQuantity: 3 }),
      buildCategory({ id: '2', transactionsQuantity: 5 }),
    ]

    render(<CategoriesSummary categories={categories} />)

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Total de categorias')).toBeInTheDocument()
  })

  it('renders the sum of every category\'s transactionsQuantity labeled "Total de transações"', () => {
    const categories = [
      buildCategory({ id: '1', transactionsQuantity: 3 }),
      buildCategory({ id: '2', transactionsQuantity: 5 }),
      buildCategory({ id: '3', transactionsQuantity: 12 }),
    ]

    render(<CategoriesSummary categories={categories} />)

    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('Total de transações')).toBeInTheDocument()
  })

  it('renders the most-used category\'s title and icon labeled "Categoria mais utilizada"', () => {
    const categories = [
      buildCategory({ id: '1', title: 'Alimentação', transactionsQuantity: 3 }),
      buildCategory({ id: '2', title: 'Mercado', icon: 'ShoppingCart', transactionsQuantity: 12 }),
    ]

    render(<CategoriesSummary categories={categories} />)

    expect(screen.getByText('Mercado')).toBeInTheDocument()
    expect(screen.getByText('Categoria mais utilizada')).toBeInTheDocument()
  })

  it('omits card 3 entirely when categories is empty', () => {
    render(<CategoriesSummary categories={[]} />)

    expect(screen.getAllByText('0')).toHaveLength(2) // total de categorias + total de transações
    expect(screen.queryByText('Categoria mais utilizada')).not.toBeInTheDocument()
    expect(screen.queryByText('Categoria mais recente')).not.toBeInTheDocument()
  })

  it('falls back to the most recently created category labeled "Categoria mais recente" when every category has transactionsQuantity === 0', () => {
    const categories = [
      buildCategory({ id: '1', title: 'Alimentação', transactionsQuantity: 0 }),
      buildCategory({ id: '2', title: 'Mercado', transactionsQuantity: 0 }),
    ]

    render(<CategoriesSummary categories={categories} />)

    expect(screen.queryByText('Categoria mais utilizada')).not.toBeInTheDocument()
    expect(screen.getByText('Mercado')).toBeInTheDocument()
    expect(screen.getByText('Categoria mais recente')).toBeInTheDocument()
  })

  it('renders card 1\'s icon in gray-700 and card 2\'s icon in purple-base', () => {
    const categories = [buildCategory({ transactionsQuantity: 1 })]

    render(<CategoriesSummary categories={categories} />)

    expect(screen.getByTestId('summary-card-total-categories-icon')).toHaveClass('text-gray-700')
    expect(screen.getByTestId('summary-card-total-transactions-icon')).toHaveClass('text-purple-base')
  })

  it('tints card 3\'s icon with the most-used category\'s own color', () => {
    const categories = [buildCategory({ color: '#2563EB', transactionsQuantity: 5 })]

    render(<CategoriesSummary categories={categories} />)

    expect(screen.getByTestId('summary-card-most-used-icon')).toHaveClass('text-blue-base')
  })

  it('falls back to TagIcon/text-blue-base when the most-used category has an unrecognized icon/color', () => {
    const categories = [
      buildCategory({ icon: 'SomeUnknownIcon', color: '#000000', transactionsQuantity: 5 }),
    ]

    render(<CategoriesSummary categories={categories} />)

    expect(screen.getByTestId('summary-card-most-used-icon')).toHaveClass('text-blue-base')
  })
})
