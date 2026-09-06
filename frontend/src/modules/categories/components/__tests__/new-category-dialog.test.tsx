import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NewCategoryDialog } from '@/modules/categories/components/new-category-dialog'
import { useCreateCategory } from '@/modules/categories/hooks/use-create-category'

vi.mock('@/modules/categories/hooks/use-create-category')

const useCreateCategoryMock = vi.mocked(useCreateCategory)

describe('NewCategoryDialog', () => {
  beforeEach(() => {
    useCreateCategoryMock.mockReturnValue({
      createCategory: vi.fn().mockResolvedValue(null),
      isLoading: false,
      fieldErrors: [],
      formError: null,
    })
  })

  it('closes and toasts on a successful createCategory call', async () => {
    const createCategory = vi.fn().mockResolvedValue({
      id: '1',
      title: 'Alimentação',
      description: null,
      icon: 'BriefcaseBusiness',
      color: '#16A34A',
    })
    useCreateCategoryMock.mockReturnValue({
      createCategory,
      isLoading: false,
      fieldErrors: [],
      formError: null,
    })
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(<NewCategoryDialog open={true} onOpenChange={onOpenChange} />)

    await user.type(screen.getByLabelText(/título/i), 'Alimentação')
    await user.click(screen.getByRole('button', { name: /^salvar$/i }))

    await waitFor(() => expect(createCategory).toHaveBeenCalledWith({
      title: 'Alimentação',
      description: '',
      icon: 'BriefcaseBusiness',
      color: '#16A34A',
    }))
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })
})
