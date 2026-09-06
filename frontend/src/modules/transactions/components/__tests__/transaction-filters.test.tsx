import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TransactionFilters } from '@/modules/transactions/components/transaction-filters'
import type { TransactionFilterValues } from '@/modules/transactions/hooks/use-list-transactions'
import { useCategoriesStore } from '@/modules/transactions/stores/use-categories-store'

const CATEGORIES = [
  { id: '1', title: 'Alimentação' },
  { id: '2', title: 'Mercado' },
]

const BASE_VALUE: TransactionFilterValues = {
  description: '',
  type: '',
  categoryId: '',
  period: { month: 11, year: 2025 },
}

describe('TransactionFilters', () => {
  beforeEach(() => {
    useCategoriesStore.setState({ categories: CATEGORIES, isLoading: false, error: null })
  })

  it('renders all 4 labeled fields', () => {
    render(<TransactionFilters value={BASE_VALUE} onChange={vi.fn()} />)

    expect(screen.getByLabelText('Buscar')).toBeInTheDocument()
    expect(screen.getByText('Tipo')).toBeInTheDocument()
    expect(screen.getByText('Categoria')).toBeInTheDocument()
    expect(screen.getByText('Período')).toBeInTheDocument()
  })

  it('calls onChange with the updated description, leaving other fields untouched', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<TransactionFilters value={BASE_VALUE} onChange={onChange} />)

    await user.type(screen.getByLabelText('Buscar'), 'a')

    expect(onChange).toHaveBeenCalledWith({ ...BASE_VALUE, description: 'a' })
  })

  it('calls onChange with the updated type, leaving other fields untouched', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<TransactionFilters value={BASE_VALUE} onChange={onChange} />)

    await user.click(screen.getByRole('combobox', { name: 'Tipo' }))
    await user.click(screen.getByRole('option', { name: 'Entrada' }))

    expect(onChange).toHaveBeenCalledWith({ ...BASE_VALUE, type: 'INCOME' })
  })

  it('calls onChange with the updated categoryId, leaving other fields untouched', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<TransactionFilters value={BASE_VALUE} onChange={onChange} />)

    await user.click(screen.getByRole('combobox', { name: 'Categoria' }))
    await user.click(screen.getByRole('option', { name: 'Mercado' }))

    expect(onChange).toHaveBeenCalledWith({ ...BASE_VALUE, categoryId: '2' })
  })

  it('calls onChange with the updated period, leaving other fields untouched', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<TransactionFilters value={BASE_VALUE} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Período' }))
    await user.click(screen.getByRole('option', { name: 'Outubro / 2025' }))

    expect(onChange).toHaveBeenCalledWith({ ...BASE_VALUE, period: { month: 10, year: 2025 } })
  })

  it('surfaces the categories store error on the Categoria field', () => {
    useCategoriesStore.setState({ error: 'Não foi possível carregar as categorias.' })
    render(<TransactionFilters value={BASE_VALUE} onChange={vi.fn()} />)

    expect(screen.getByText('Não foi possível carregar as categorias.')).toBeInTheDocument()
  })
})
