import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGetDashboard } from '@/modules/dashboard/hooks/use-get-dashboard'
import { DashboardPage } from '@/modules/dashboard/pages/dashboard-page'
import { useCreateTransaction } from '@/modules/transactions/hooks/use-create-transaction'

vi.mock('@/modules/dashboard/hooks/use-get-dashboard')
vi.mock('@/modules/transactions/hooks/use-create-transaction')
vi.mock('@/modules/auth/hooks/use-logout', () => ({
  useLogout: () => ({ logout: vi.fn().mockResolvedValue(undefined), isLoading: false }),
}))

const useGetDashboardMock = vi.mocked(useGetDashboard)
const useCreateTransactionMock = vi.mocked(useCreateTransaction)

const MOVEMENT = {
  income: 425000,
  expense: 218045,
  totalBalance: 1284732,
}

function renderDashboardPage() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <DashboardPage />
    </MemoryRouter>,
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    useCreateTransactionMock.mockReturnValue({
      createTransaction: vi.fn().mockResolvedValue(null),
      isLoading: false,
      fieldErrors: [],
      formError: null,
    })
  })

  it('shows the loading text while useGetDashboard().isLoading is true', () => {
    useGetDashboardMock.mockReturnValue({
      movement: null,
      recentTransactions: [],
      categories: [],
      isLoading: true,
      error: null,
    })
    renderDashboardPage()

    expect(screen.getByText('Carregando resumo…')).toBeInTheDocument()
  })

  it('shows the role="alert" error message when useGetDashboard().error is set', () => {
    useGetDashboardMock.mockReturnValue({
      movement: null,
      recentTransactions: [],
      categories: [],
      isLoading: false,
      error: 'Não foi possível carregar o resumo do dashboard.',
    })
    renderDashboardPage()

    // DashboardPage's own error paragraph, RecentTransactionsCard's and
    // DashboardCategoriesCard's (each reads the same useGetDashboard()
    // error independently) all render a role="alert" here — redundant but
    // deliberate, see PM-023's and PM-024's plan.md.
    for (const alert of screen.getAllByRole('alert')) {
      expect(alert).toHaveTextContent('Não foi possível carregar o resumo do dashboard.')
    }
  })

  it('renders DashboardSummary with the resolved movement once loaded without error', () => {
    useGetDashboardMock.mockReturnValue({
      movement: MOVEMENT,
      recentTransactions: [],
      categories: [],
      isLoading: false,
      error: null,
    })
    renderDashboardPage()

    expect(screen.getByText('Saldo Total')).toBeInTheDocument()
    expect(screen.getByText('R$ 12.847,32')).toBeInTheDocument()
  })

  it('renders DashboardHighlights regardless of the summary loading state', () => {
    useGetDashboardMock.mockReturnValue({
      movement: null,
      recentTransactions: [],
      categories: [],
      isLoading: true,
      error: null,
    })
    renderDashboardPage()

    // "Categorias" also appears as a nav link in Header, hence scoping to <main>.
    expect(within(screen.getByRole('main')).getByText('Transações Recentes')).toBeInTheDocument()
    expect(within(screen.getByRole('main')).getByText('Categorias')).toBeInTheDocument()
  })

  it('renders DashboardCategoriesCard\'s own loading state via the shared useGetDashboard() data', () => {
    useGetDashboardMock.mockReturnValue({
      movement: null,
      recentTransactions: [],
      categories: [],
      isLoading: true,
      error: null,
    })
    renderDashboardPage()

    expect(
      within(screen.getByRole('main')).getByText('Carregando categorias…'),
    ).toBeInTheDocument()
  })
})
