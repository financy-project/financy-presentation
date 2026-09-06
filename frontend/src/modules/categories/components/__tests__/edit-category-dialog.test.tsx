import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EditCategoryDialog } from '@/modules/categories/components/edit-category-dialog'
import { useUpdateCategory } from '@/modules/categories/hooks/use-update-category'

vi.mock('@/modules/categories/hooks/use-update-category')

const useUpdateCategoryMock = vi.mocked(useUpdateCategory)

const CATEGORY = {
  id: '1',
  title: 'Alimentação',
  description: 'Restaurantes e mercado',
  icon: 'Utensils',
  color: '#16A34A',
  transactionsQuantity: 3,
}

describe('EditCategoryDialog', () => {
  beforeEach(() => {
    useUpdateCategoryMock.mockReturnValue({
      updateCategory: vi.fn().mockResolvedValue(null),
      isLoading: false,
      fieldErrors: [],
      formError: null,
    })
  })

  it('renders "Editar categoria" and pre-fills the form from the category prop', () => {
    render(<EditCategoryDialog category={CATEGORY} open={true} onOpenChange={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Editar categoria' })).toBeInTheDocument()
    expect(screen.getByLabelText(/título/i)).toHaveValue('Alimentação')
    expect(screen.getByLabelText(/descrição/i)).toHaveValue('Restaurantes e mercado')
    expect(screen.getByRole('button', { name: 'Utensils' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'green' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls updateCategory(category.id, values) on submit and closes + toasts on success', async () => {
    const updateCategory = vi.fn().mockResolvedValue({ ...CATEGORY, title: 'Alimentação e bebidas' })
    useUpdateCategoryMock.mockReturnValue({
      updateCategory,
      isLoading: false,
      fieldErrors: [],
      formError: null,
    })
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(<EditCategoryDialog category={CATEGORY} open={true} onOpenChange={onOpenChange} />)

    await user.clear(screen.getByLabelText(/título/i))
    await user.type(screen.getByLabelText(/título/i), 'Alimentação e bebidas')
    await user.click(screen.getByRole('button', { name: /^salvar$/i }))

    await waitFor(() =>
      expect(updateCategory).toHaveBeenCalledWith('1', {
        title: 'Alimentação e bebidas',
        description: 'Restaurantes e mercado',
        icon: 'Utensils',
        color: '#16A34A',
      }),
    )
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })
})
