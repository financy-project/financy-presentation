import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCreateCategory } from '@/modules/categories/hooks/use-create-category'
import { useListCategories } from '@/modules/categories/hooks/use-list-categories'
import { CategoriesPage } from '@/modules/categories/pages/categories-page'

vi.mock('@/modules/categories/hooks/use-create-category')
vi.mock('@/modules/categories/hooks/use-list-categories')
vi.mock('@/modules/categories/hooks/use-update-category', () => ({
  useUpdateCategory: () => ({
    updateCategory: vi.fn().mockResolvedValue(null),
    isLoading: false,
    fieldErrors: [],
    formError: null,
  }),
}))
vi.mock('@/modules/categories/hooks/use-delete-category', () => ({
  useDeleteCategory: () => ({ deleteCategory: vi.fn().mockResolvedValue(false), isLoading: false, error: null }),
}))
vi.mock('@/modules/auth/hooks/use-logout', () => ({
  useLogout: () => ({ logout: vi.fn().mockResolvedValue(undefined), isLoading: false }),
}))

const useCreateCategoryMock = vi.mocked(useCreateCategory)
const useListCategoriesMock = vi.mocked(useListCategories)

const CATEGORY = {
  id: '1',
  title: 'Alimentação',
  description: 'Restaurantes e mercado',
  icon: 'Utensils',
  color: '#2563EB',
  transactionsQuantity: 12,
}

function renderCategoriesPage() {
  return render(
    <MemoryRouter initialEntries={['/categorias']}>
      <CategoriesPage />
    </MemoryRouter>,
  )
}

describe('CategoriesPage', () => {
  beforeEach(() => {
    useCreateCategoryMock.mockReturnValue({
      createCategory: vi.fn().mockResolvedValue(null),
      isLoading: false,
      fieldErrors: [],
      formError: null,
    })
    useListCategoriesMock.mockReturnValue({ categories: [], isLoading: false, error: null })
  })

  it('renders the page header and the app Header nav', () => {
    renderCategoriesPage()

    expect(screen.getByRole('heading', { name: 'Categorias' })).toBeInTheDocument()
    expect(screen.getByText('Organize suas transações por categorias')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /nova categoria/i })).toBeInTheDocument()
    expect(screen.getByText('Transações')).toBeInTheDocument()
  })

  it('opens the dialog when "Nova categoria" is clicked', async () => {
    const user = userEvent.setup()
    renderCategoriesPage()

    await user.click(screen.getByRole('button', { name: /nova categoria/i }))

    expect(screen.getByRole('heading', { name: 'Nova categoria' })).toBeInTheDocument()
  })

  it('closes the dialog after a successful category creation', async () => {
    useCreateCategoryMock.mockReturnValue({
      createCategory: vi.fn().mockResolvedValue({
        id: '1',
        title: 'Alimentação',
        description: null,
        icon: 'BriefcaseBusiness',
        color: '#16A34A',
      }),
      isLoading: false,
      fieldErrors: [],
      formError: null,
    })
    const user = userEvent.setup()
    renderCategoriesPage()

    await user.click(screen.getByRole('button', { name: /nova categoria/i }))
    await user.type(screen.getByLabelText(/título/i), 'Alimentação')
    await user.click(screen.getByRole('button', { name: /^salvar$/i }))

    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Nova categoria' })).not.toBeInTheDocument(),
    )
  })

  it('renders a loading message while useListCategories is loading', () => {
    useListCategoriesMock.mockReturnValue({ categories: [], isLoading: true, error: null })
    renderCategoriesPage()

    expect(screen.getByText(/carregando categorias/i)).toBeInTheDocument()
  })

  it('renders an error banner when useListCategories errors', () => {
    useListCategoriesMock.mockReturnValue({
      categories: [],
      isLoading: false,
      error: 'Não foi possível carregar as categorias.',
    })
    renderCategoriesPage()

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar as categorias.')
  })

  it('renders an empty-state message when there are no categories', () => {
    renderCategoriesPage()

    expect(screen.getByText(/nenhuma categoria cadastrada/i)).toBeInTheDocument()
  })

  it('renders one CategoryCard per category when populated', () => {
    useListCategoriesMock.mockReturnValue({ categories: [CATEGORY], isLoading: false, error: null })
    renderCategoriesPage()

    expect(screen.getByRole('heading', { name: 'Alimentação' })).toBeInTheDocument()
  })

  it("opens EditCategoryDialog for the clicked card's category", async () => {
    useListCategoriesMock.mockReturnValue({ categories: [CATEGORY], isLoading: false, error: null })
    const user = userEvent.setup()
    renderCategoriesPage()

    await user.click(screen.getByRole('button', { name: /editar/i }))

    expect(screen.getByRole('heading', { name: 'Editar categoria' })).toBeInTheDocument()
    expect(screen.getByLabelText(/título/i)).toHaveValue('Alimentação')
  })

  it("opens DeleteCategoryAlert for the clicked card's category", async () => {
    useListCategoriesMock.mockReturnValue({ categories: [CATEGORY], isLoading: false, error: null })
    const user = userEvent.setup()
    renderCategoriesPage()

    await user.click(screen.getByRole('button', { name: /excluir/i }))

    expect(screen.getByText(/alimentação/i, { selector: '[data-slot="alert-dialog-description"]' })).toBeInTheDocument()
  })

  it('renders CategoriesSummary above the category grid once useListCategories resolves with data', () => {
    useListCategoriesMock.mockReturnValue({ categories: [CATEGORY], isLoading: false, error: null })
    renderCategoriesPage()

    expect(screen.getByText('Total de categorias')).toBeInTheDocument()
  })

  it('does not render CategoriesSummary while isLoading is true or while error is present', () => {
    useListCategoriesMock.mockReturnValue({ categories: [], isLoading: true, error: null })
    const { rerender } = renderCategoriesPage()

    expect(screen.queryByText('Total de categorias')).not.toBeInTheDocument()

    useListCategoriesMock.mockReturnValue({
      categories: [],
      isLoading: false,
      error: 'Não foi possível carregar as categorias.',
    })
    rerender(
      <MemoryRouter initialEntries={['/categorias']}>
        <CategoriesPage />
      </MemoryRouter>,
    )

    expect(screen.queryByText('Total de categorias')).not.toBeInTheDocument()
  })
})
