import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { DashboardCategoriesCard } from '@/modules/dashboard/components/dashboard-categories-card'
import { useGetDashboard } from '@/modules/dashboard/hooks/use-get-dashboard'

vi.mock('@/modules/dashboard/hooks/use-get-dashboard')

const useGetDashboardMock = vi.mocked(useGetDashboard)

const CATEGORIES = [
  {
    categoryId: 'cat-1',
    title: 'Alimentação',
    color: '#2563EB',
    transactionCount: 12,
    totalValue: -54230,
  },
  {
    categoryId: 'cat-2',
    title: 'Transporte',
    color: '#9333EA',
    transactionCount: 8,
    totalValue: -38550,
  },
]

function renderCard() {
  return render(
    <MemoryRouter>
      <DashboardCategoriesCard />
    </MemoryRouter>,
  )
}

describe('DashboardCategoriesCard', () => {
  it('renders a row per category with its tag, item count and absolute formatted value', () => {
    useGetDashboardMock.mockReturnValue({
      movement: null,
      recentTransactions: [],
      categories: CATEGORIES,
      isLoading: false,
      error: null,
    })
    renderCard()

    expect(screen.getByText('Alimentação')).toBeInTheDocument()
    expect(screen.getByText('12 itens')).toBeInTheDocument()
    expect(screen.getByText('R$ 542,30')).toBeInTheDocument()

    expect(screen.getByText('Transporte')).toBeInTheDocument()
    expect(screen.getByText('8 itens')).toBeInTheDocument()
    expect(screen.getByText('R$ 385,50')).toBeInTheDocument()
  })

  it('shows a loading message when isLoading is true', () => {
    useGetDashboardMock.mockReturnValue({
      movement: null,
      recentTransactions: [],
      categories: [],
      isLoading: true,
      error: null,
    })
    renderCard()

    expect(screen.getByText('Carregando categorias…')).toBeInTheDocument()
  })

  it('shows the error message with role="alert" when error is set', () => {
    useGetDashboardMock.mockReturnValue({
      movement: null,
      recentTransactions: [],
      categories: [],
      isLoading: false,
      error: 'Não foi possível carregar o resumo do dashboard.',
    })
    renderCard()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível carregar o resumo do dashboard.',
    )
  })

  it('shows an empty-state message when there are no categories', () => {
    useGetDashboardMock.mockReturnValue({
      movement: null,
      recentTransactions: [],
      categories: [],
      isLoading: false,
      error: null,
    })
    renderCard()

    expect(screen.getByText('Nenhuma categoria com movimentação neste mês.')).toBeInTheDocument()
  })

  it('renders a "Gerenciar" link pointing to /categorias', () => {
    useGetDashboardMock.mockReturnValue({
      movement: null,
      recentTransactions: [],
      categories: [],
      isLoading: false,
      error: null,
    })
    renderCard()

    expect(screen.getByRole('link', { name: 'Gerenciar' })).toHaveAttribute('href', '/categorias')
  })
})
