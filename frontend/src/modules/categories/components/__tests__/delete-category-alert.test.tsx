import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeleteCategoryAlert } from '@/modules/categories/components/delete-category-alert'
import { useDeleteCategory } from '@/modules/categories/hooks/use-delete-category'

vi.mock('@/modules/categories/hooks/use-delete-category')

const useDeleteCategoryMock = vi.mocked(useDeleteCategory)

const CATEGORY = {
  id: '1',
  title: 'Alimentação',
  description: 'Restaurantes e mercado',
  icon: 'Utensils',
  color: '#16A34A',
  transactionsQuantity: 3,
}

describe('DeleteCategoryAlert', () => {
  beforeEach(() => {
    useDeleteCategoryMock.mockReturnValue({
      deleteCategory: vi.fn().mockResolvedValue(false),
      isLoading: false,
      error: null,
    })
  })

  it("renders the category's title in the confirmation copy", () => {
    render(<DeleteCategoryAlert category={CATEGORY} open={true} onOpenChange={vi.fn()} />)

    expect(screen.getByText(/alimentação/i)).toBeInTheDocument()
  })

  it('calls deleteCategory(category.id) only when "Excluir" is confirmed, not on "Cancelar"', async () => {
    const deleteCategory = vi.fn().mockResolvedValue(false)
    useDeleteCategoryMock.mockReturnValue({ deleteCategory, isLoading: false, error: null })
    const user = userEvent.setup()
    render(<DeleteCategoryAlert category={CATEGORY} open={true} onOpenChange={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(deleteCategory).not.toHaveBeenCalled()
  })

  it('closes and toasts on a successful delete', async () => {
    const deleteCategory = vi.fn().mockResolvedValue(true)
    useDeleteCategoryMock.mockReturnValue({ deleteCategory, isLoading: false, error: null })
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(<DeleteCategoryAlert category={CATEGORY} open={true} onOpenChange={onOpenChange} />)

    await user.click(screen.getByRole('button', { name: /^excluir$/i }))

    await waitFor(() => expect(deleteCategory).toHaveBeenCalledWith('1'))
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('stays open and renders the error when the delete fails (Radix Action would otherwise auto-close)', async () => {
    const deleteCategory = vi.fn().mockResolvedValue(false)
    useDeleteCategoryMock.mockReturnValue({
      deleteCategory,
      isLoading: false,
      error: 'Não foi possível excluir a categoria. Tente novamente.',
    })
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(<DeleteCategoryAlert category={CATEGORY} open={true} onOpenChange={onOpenChange} />)

    await user.click(screen.getByRole('button', { name: /^excluir$/i }))

    await waitFor(() => expect(deleteCategory).toHaveBeenCalledWith('1'))
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível excluir a categoria. Tente novamente.',
    )
  })
})
