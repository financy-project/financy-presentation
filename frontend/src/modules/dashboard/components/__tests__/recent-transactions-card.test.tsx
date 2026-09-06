import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RecentTransactionsCard } from '@/modules/dashboard/components/recent-transactions-card'
import { useGetDashboard } from '@/modules/dashboard/hooks/use-get-dashboard'
import { useCreateTransaction } from '@/modules/transactions/hooks/use-create-transaction'
import { useCategoriesStore } from '@/modules/transactions/stores/use-categories-store'

vi.mock('@/modules/dashboard/hooks/use-get-dashboard')
vi.mock('@/modules/transactions/hooks/use-create-transaction')

const useGetDashboardMock = vi.mocked(useGetDashboard)
const useCreateTransactionMock = vi.mocked(useCreateTransaction)

const TRANSACTIONS = [
  {
    id: 't1',
    type: 'INCOME' as const,
    description: 'Pagamento de Salário',
    date: '2025-12-01T00:00:00.000Z',
    value: 425000,
    category: { id: 'c1', title: 'Receita', color: '#16A34A', icon: 'BriefcaseBusiness' },
  },
  {
    id: 't2',
    type: 'EXPENSE' as const,
    description: 'Jantar no Restaurante',
    date: '2025-11-30T00:00:00.000Z',
    value: 8950,
    category: { id: 'c2', title: 'Alimentação', color: '#2563EB', icon: 'Utensils' },
  },
]

function renderCard() {
  return render(
    <MemoryRouter>
      <RecentTransactionsCard />
    </MemoryRouter>,
  )
}

describe('RecentTransactionsCard', () => {
  beforeEach(() => {
    useCreateTransactionMock.mockReturnValue({
      createTransaction: vi.fn().mockResolvedValue(null),
      isLoading: false,
      fieldErrors: [],
      formError: null,
    })
    useCategoriesStore.setState({
      categories: [{ id: 'c1', title: 'Receita' }],
      isLoading: false,
      error: null,
    })
  })

  it('renders one DashboardTransactionRow per item in recentTransactions', () => {
    useGetDashboardMock.mockReturnValue({
      movement: null,
      recentTransactions: TRANSACTIONS,
      categories: [],
      isLoading: false,
      error: null,
    })

    renderCard()

    expect(screen.getByText('Pagamento de Salário')).toBeInTheDocument()
    expect(screen.getByText('Jantar no Restaurante')).toBeInTheDocument()
  })

  it('shows skeleton rows while useGetDashboard().isLoading is true', () => {
    useGetDashboardMock.mockReturnValue({
      movement: null,
      recentTransactions: [],
      categories: [],
      isLoading: true,
      error: null,
    })

    const { container } = renderCard()

    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
    expect(screen.queryByText('Nenhuma transação cadastrada ainda.')).not.toBeInTheDocument()
  })

  it('shows the role="alert" error text when useGetDashboard().error is set', () => {
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

  it('shows "Nenhuma transação cadastrada ainda." when recentTransactions is empty and not loading', () => {
    useGetDashboardMock.mockReturnValue({
      movement: null,
      recentTransactions: [],
      categories: [],
      isLoading: false,
      error: null,
    })

    renderCard()

    expect(screen.getByText('Nenhuma transação cadastrada ainda.')).toBeInTheDocument()
  })

  it('"Ver todas" links to /transacoes', () => {
    useGetDashboardMock.mockReturnValue({
      movement: null,
      recentTransactions: [],
      categories: [],
      isLoading: false,
      error: null,
    })

    renderCard()

    expect(screen.getByRole('link', { name: /ver todas/i })).toHaveAttribute('href', '/transacoes')
  })

  it('clicking "+ Nova transação" opens NewTransactionDialog', async () => {
    useGetDashboardMock.mockReturnValue({
      movement: null,
      recentTransactions: [],
      categories: [],
      isLoading: false,
      error: null,
    })
    const user = userEvent.setup()
    renderCard()

    expect(screen.queryByText('Registre sua despesa ou receita')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /nova transação/i }))

    expect(await screen.findByText('Registre sua despesa ou receita')).toBeInTheDocument()
  })

  it('submitting the dialog successfully calls createTransaction and closes it', async () => {
    useGetDashboardMock.mockReturnValue({
      movement: null,
      recentTransactions: [],
      categories: [],
      isLoading: false,
      error: null,
    })
    const createTransaction = vi.fn().mockResolvedValue({
      id: 't3',
      type: 'EXPENSE',
      description: 'Compras no Mercado',
      date: '2026-09-04T00:00:00.000Z',
      value: 15680,
      category: { id: 'c1', title: 'Receita', color: '#16A34A' },
    })
    useCreateTransactionMock.mockReturnValue({
      createTransaction,
      isLoading: false,
      fieldErrors: [],
      formError: null,
    })
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /nova transação/i }))
    await screen.findByText('Registre sua despesa ou receita')

    await user.type(screen.getByLabelText('Descrição'), 'Compras no Mercado')
    await user.click(screen.getByLabelText('Data'))
    const dayButtons = document.querySelectorAll<HTMLButtonElement>('button[data-day]')
    await user.click(dayButtons[10])
    await user.type(screen.getByLabelText('Valor'), '156.80')
    await user.click(await screen.findByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Receita' }))
    await user.click(screen.getByRole('button', { name: /^salvar$/i }))

    expect(createTransaction).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByText('Registre sua despesa ou receita'),
    ).not.toBeInTheDocument()
  })
})
