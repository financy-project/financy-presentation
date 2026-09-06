import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CategorySelect } from '@/modules/transactions/components/category-select'
import { useCategoriesStore } from '@/modules/transactions/stores/use-categories-store'

const CATEGORIES = [
  { id: '1', title: 'Alimentação' },
  { id: '2', title: 'Mercado' },
]

describe('CategorySelect', () => {
  beforeEach(() => {
    useCategoriesStore.setState({ categories: CATEGORIES, isLoading: false, error: null })
  })

  it('renders one option per category from the store', async () => {
    const user = userEvent.setup()
    render(<CategorySelect value="" onValueChange={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))

    expect(screen.getByRole('option', { name: 'Alimentação' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Mercado' })).toBeInTheDocument()
  })

  it('calls onValueChange with the selected category id', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(<CategorySelect value="" onValueChange={onValueChange} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Mercado' }))

    expect(onValueChange).toHaveBeenCalledWith('2')
  })

  it('disables the select while the store is loading', () => {
    useCategoriesStore.setState({ isLoading: true })
    render(<CategorySelect value="" onValueChange={vi.fn()} />)

    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('shows a resettable "Todas" option when resettable is set', async () => {
    const user = userEvent.setup()
    render(
      <CategorySelect value="1" onValueChange={vi.fn()} placeholder="Todas" resettable />,
    )

    await user.click(screen.getByRole('combobox'))

    expect(screen.getByRole('option', { name: 'Todas' })).toBeInTheDocument()
  })
})
