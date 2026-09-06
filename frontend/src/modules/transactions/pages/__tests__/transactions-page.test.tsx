import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCreateTransaction } from '@/modules/transactions/hooks/use-create-transaction'
import { useDeleteTransaction } from '@/modules/transactions/hooks/use-delete-transaction'
import { useListTransactions } from '@/modules/transactions/hooks/use-list-transactions'
import { useUpdateTransaction } from '@/modules/transactions/hooks/use-update-transaction'
import { useSyncCategoriesForSelect } from '@/modules/transactions/hooks/use-sync-categories-for-select'
import { TransactionsPage } from '@/modules/transactions/pages/transactions-page'
import { useCategoriesStore } from '@/modules/transactions/stores/use-categories-store'

vi.mock('@/modules/transactions/hooks/use-create-transaction')
vi.mock('@/modules/transactions/hooks/use-update-transaction')
vi.mock('@/modules/transactions/hooks/use-delete-transaction')
vi.mock('@/modules/transactions/hooks/use-list-transactions')
vi.mock('@/modules/transactions/hooks/use-sync-categories-for-select')
vi.mock('@/modules/auth/hooks/use-logout', () => ({
  useLogout: () => ({ logout: vi.fn().mockResolvedValue(undefined), isLoading: false }),
}))

const useCreateTransactionMock = vi.mocked(useCreateTransaction)
const useUpdateTransactionMock = vi.mocked(useUpdateTransaction)
const useDeleteTransactionMock = vi.mocked(useDeleteTransaction)
const useListTransactionsMock = vi.mocked(useListTransactions)
const useSyncCategoriesForSelectMock = vi.mocked(useSyncCategoriesForSelect)

const TRANSACTION = {
  id: 't1',
  type: 'EXPENSE' as const,
  description: 'Almoço no restaurante',
  date: '2025-11-30T00:00:00.000Z',
  value: 8850,
  category: { id: 'cat-1', title: 'Alimentação', color: '#2563EB', icon: 'Utensils' },
}

function renderTransactionsPage() {
  return render(
    <MemoryRouter initialEntries={['/transacoes']}>
      <TransactionsPage />
    </MemoryRouter>,
  )
}

describe('TransactionsPage', () => {
  beforeEach(() => {
    useCreateTransactionMock.mockReturnValue({
      createTransaction: vi.fn().mockResolvedValue(null),
      isLoading: false,
      fieldErrors: [],
      formError: null,
    })
    useUpdateTransactionMock.mockReturnValue({
      updateTransaction: vi.fn().mockResolvedValue(null),
      isLoading: false,
      fieldErrors: [],
      formError: null,
    })
    useDeleteTransactionMock.mockReturnValue({
      deleteTransaction: vi.fn().mockResolvedValue(false),
      isLoading: false,
      error: null,
    })
    useSyncCategoriesForSelectMock.mockReturnValue(undefined)
    useCategoriesStore.setState({ categories: [], isLoading: false, error: null })
    useListTransactionsMock.mockReturnValue({
      transactions: [TRANSACTION],
      isLoading: false,
      error: null,
      page: 1,
      totalPages: 1,
      totalRecord: 1,
      pageSize: 10,
      goToPage: vi.fn(),
    })
  })

  it('renders PageHeader with title "Transações" and its subtitle', () => {
    renderTransactionsPage()

    expect(screen.getByRole('heading', { name: 'Transações' })).toBeInTheDocument()
    expect(screen.getByText('Gerencie todas as suas transações financeiras')).toBeInTheDocument()
  })

  it('opens NewTransactionDialog when "Nova transação" is clicked', async () => {
    const user = userEvent.setup()
    renderTransactionsPage()

    await user.click(screen.getByRole('button', { name: /nova transação/i }))

    expect(screen.getByRole('heading', { name: 'Nova transação' })).toBeInTheDocument()
  })

  it('renders TransactionsTable below PageHeader with values from useListTransactions', () => {
    renderTransactionsPage()

    expect(screen.getByText('Almoço no restaurante')).toBeInTheDocument()
    expect(screen.getByText('- R$ 88,50')).toBeInTheDocument()
  })

  it('opens EditTransactionDialog for the clicked row\'s transaction', async () => {
    const user = userEvent.setup()
    renderTransactionsPage()

    await user.click(screen.getByRole('button', { name: 'Editar' }))

    expect(screen.getByRole('heading', { name: 'Editar transação' })).toBeInTheDocument()
  })

  it('opens DeleteTransactionAlert for the clicked row\'s transaction', async () => {
    const user = userEvent.setup()
    renderTransactionsPage()

    await user.click(screen.getByRole('button', { name: 'Excluir' }))

    expect(screen.getByRole('heading', { name: 'Excluir transação' })).toBeInTheDocument()
  })

  it('renders the filter bar above the table', () => {
    renderTransactionsPage()

    expect(screen.getByLabelText('Buscar')).toBeInTheDocument()
  })

  it('re-queries useListTransactions with the updated filters when a filter changes', async () => {
    const user = userEvent.setup()
    renderTransactionsPage()

    await user.type(screen.getByLabelText('Buscar'), 'a')

    await waitFor(() => {
      const lastCallFilters = useListTransactionsMock.mock.calls.at(-1)?.[0]
      expect(lastCallFilters?.description).toBe('a')
    })
  })

  it('applies search + type filters together, without one overwriting the other', async () => {
    const user = userEvent.setup()
    renderTransactionsPage()

    await user.type(screen.getByLabelText('Buscar'), 'pizza')
    await user.click(screen.getByRole('combobox', { name: 'Tipo' }))
    await user.click(screen.getByRole('option', { name: 'Entrada' }))

    await waitFor(() => {
      const lastCallFilters = useListTransactionsMock.mock.calls.at(-1)?.[0]
      expect(lastCallFilters).toMatchObject({ description: 'pizza', type: 'INCOME' })
    })
  })

  it('shows the table\'s existing empty state when the filtered result is []', () => {
    useListTransactionsMock.mockReturnValue({
      transactions: [],
      isLoading: false,
      error: null,
      page: 1,
      totalPages: 0,
      totalRecord: 0,
      pageSize: 10,
      goToPage: vi.fn(),
    })

    renderTransactionsPage()

    expect(screen.getByText('Nenhuma transação cadastrada ainda.')).toBeInTheDocument()
  })
})
