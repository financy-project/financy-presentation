import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TransactionsTable } from '@/modules/transactions/components/transactions-table'
import type { TransactionListItem } from '@/modules/transactions/graphql/queries'

const TRANSACTION: TransactionListItem = {
  id: 't1',
  type: 'EXPENSE',
  description: 'Almoço no restaurante',
  date: '2025-11-30T00:00:00.000Z',
  value: 8850,
  category: { id: 'cat-1', title: 'Alimentação', color: '#2563EB', icon: 'Utensils' },
}

const DEFAULT_PROPS = {
  isLoading: false,
  error: null,
  page: 1,
  totalPages: 1,
  onPageChange: vi.fn(),
  totalRecord: 1,
  pageSize: 10,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
}

describe('TransactionsTable', () => {
  it('shows skeleton rows (not a full-page message) on the first fetch', () => {
    render(<TransactionsTable {...DEFAULT_PROPS} transactions={[]} isLoading />)
    const skeletonBody = screen.getByTestId('transactions-skeleton')
    expect(skeletonBody.querySelectorAll('tr')).toHaveLength(DEFAULT_PROPS.pageSize)
    expect(screen.getByText('Descrição')).toBeInTheDocument()
    expect(screen.queryByTestId('transactions-summary')).not.toBeInTheDocument()
  })

  it('keeps showing the previous rows and footer, with skeleton rows and disabled pagination, while a later page fetches', () => {
    render(
      <TransactionsTable
        {...DEFAULT_PROPS}
        transactions={[TRANSACTION]}
        isLoading
        totalPages={3}
        totalRecord={27}
      />,
    )

    expect(screen.getByTestId('transactions-skeleton')).toBeInTheDocument()
    expect(screen.queryByText('Almoço no restaurante')).not.toBeInTheDocument()
    expect(screen.getByTestId('transactions-summary')).toHaveTextContent('1 a 10 | 27 resultados')
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled()
  })

  it('shows the error message when error is set', () => {
    render(
      <TransactionsTable
        {...DEFAULT_PROPS}
        transactions={[]}
        error="Não foi possível carregar as transações."
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar as transações.')
  })

  it('shows the empty-state message when transactions is [] and not loading/error', () => {
    render(<TransactionsTable {...DEFAULT_PROPS} transactions={[]} />)
    expect(screen.getByText('Nenhuma transação cadastrada ainda.')).toBeInTheDocument()
  })

  it('renders one row per transaction with description/date/category/type/value', () => {
    render(<TransactionsTable {...DEFAULT_PROPS} transactions={[TRANSACTION]} />)

    expect(screen.getByText('Almoço no restaurante')).toBeInTheDocument()
    expect(screen.getByText('30/11/25')).toBeInTheDocument()
    expect(screen.getByText('Alimentação')).toBeInTheDocument()
    expect(screen.getByText('Saída')).toBeInTheDocument()
    expect(screen.getByText('- R$ 88,50')).toBeInTheDocument()
  })

  it('calls onDelete(transaction) when the row\'s "Excluir" button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(<TransactionsTable {...DEFAULT_PROPS} transactions={[TRANSACTION]} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: 'Excluir' }))

    expect(onDelete).toHaveBeenCalledWith(TRANSACTION)
  })

  it('calls onEdit(transaction) when the row\'s "Editar" button is clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()

    render(<TransactionsTable {...DEFAULT_PROPS} transactions={[TRANSACTION]} onEdit={onEdit} />)
    await user.click(screen.getByRole('button', { name: 'Editar' }))

    expect(onEdit).toHaveBeenCalledWith(TRANSACTION)
  })

  it('calls onPageChange when a page button is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(
      <TransactionsTable
        {...DEFAULT_PROPS}
        transactions={[TRANSACTION]}
        page={1}
        totalPages={2}
        totalRecord={11}
        onPageChange={onPageChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: '2' }))

    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('pads a short page with invisible filler rows so the table always holds pageSize rows', () => {
    render(<TransactionsTable {...DEFAULT_PROPS} transactions={[TRANSACTION]} />)

    // Filler rows are aria-hidden (excluded from getByRole by default), so
    // include hidden elements to count the full body: 1 real + 9 filler.
    const rows = screen.getAllByRole('row', { hidden: true })
    expect(rows).toHaveLength(1 + DEFAULT_PROPS.pageSize)
    expect(screen.getAllByRole('row')).toHaveLength(2) // header + the 1 real row, filler excluded
  })

  it('renders no filler rows when the page is already full', () => {
    const fullPage = Array.from({ length: 10 }, (_, i) => ({ ...TRANSACTION, id: `t${i}` }))
    render(<TransactionsTable {...DEFAULT_PROPS} transactions={fullPage} totalRecord={10} />)

    const rows = screen.getAllByRole('row', { hidden: true })
    expect(rows).toHaveLength(1 + 10)
  })

  it('shows the "X a Y | Z resultados" summary text in a single uniform color', () => {
    render(
      <TransactionsTable
        {...DEFAULT_PROPS}
        transactions={[TRANSACTION]}
        page={1}
        totalPages={3}
        totalRecord={27}
      />,
    )

    const summary = screen.getByTestId('transactions-summary')
    expect(summary).toHaveTextContent('1 a 10 | 27 resultados')
    expect(summary).toHaveClass('text-gray-700')
    expect(summary.querySelectorAll('span')).toHaveLength(0)
  })
})
