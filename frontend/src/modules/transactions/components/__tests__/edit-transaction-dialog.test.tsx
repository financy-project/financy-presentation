import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EditTransactionDialog } from '@/modules/transactions/components/edit-transaction-dialog'
import { useUpdateTransaction } from '@/modules/transactions/hooks/use-update-transaction'
import { useCategoriesStore } from '@/modules/transactions/stores/use-categories-store'

vi.mock('@/modules/transactions/hooks/use-update-transaction')

const useUpdateTransactionMock = vi.mocked(useUpdateTransaction)

const TRANSACTION = {
  id: 't1',
  type: 'EXPENSE' as const,
  description: 'Almoço no restaurante',
  date: '2026-09-04T12:00:00.000Z',
  value: 8850,
  category: { id: 'cat-1', title: 'Alimentação', color: '#2563EB', icon: 'Utensils' },
}

describe('EditTransactionDialog', () => {
  beforeEach(() => {
    useUpdateTransactionMock.mockReturnValue({
      updateTransaction: vi.fn().mockResolvedValue(null),
      isLoading: false,
      fieldErrors: [],
      formError: null,
    })
    useCategoriesStore.setState({
      categories: [{ id: 'cat-1', title: 'Alimentação' }],
      isLoading: false,
      error: null,
    })
  })

  it('renders nothing when transaction is null', () => {
    render(<EditTransactionDialog transaction={null} open={false} onOpenChange={vi.fn()} />)

    expect(screen.queryByRole('heading', { name: 'Editar transação' })).not.toBeInTheDocument()
  })

  it('renders "Editar transação" and pre-fills the form from the transaction prop', () => {
    render(<EditTransactionDialog transaction={TRANSACTION} open={true} onOpenChange={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Editar transação' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /despesa/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Descrição')).toHaveValue('Almoço no restaurante')
    expect(screen.getByLabelText('Data')).toHaveTextContent('04/09/2026')
    expect(screen.getByLabelText('Valor')).toHaveValue('88,50')
  })

  it('calls updateTransaction(transaction.id, input) with the mapped fields on submit, then toasts and closes on success', async () => {
    const updateTransaction = vi.fn().mockResolvedValue({ ...TRANSACTION })
    useUpdateTransactionMock.mockReturnValue({
      updateTransaction,
      isLoading: false,
      fieldErrors: [],
      formError: null,
    })
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(<EditTransactionDialog transaction={TRANSACTION} open={true} onOpenChange={onOpenChange} />)

    await user.click(screen.getByRole('button', { name: /^salvar$/i }))

    await waitFor(() => expect(updateTransaction).toHaveBeenCalledTimes(1))
    const [id, input] = updateTransaction.mock.calls[0]
    expect(id).toBe('t1')
    expect(input.type).toBe('EXPENSE')
    expect(input.description).toBe('Almoço no restaurante')
    expect(input.value).toBe(8850)
    expect(input.categoryId).toBe('cat-1')
    expect(typeof input.date).toBe('string')
    expect(new Date(input.date).toString()).not.toBe('Invalid Date')

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('keeps the dialog open and shows the field error when the server returns a validation error', () => {
    useUpdateTransactionMock.mockReturnValue({
      updateTransaction: vi.fn().mockResolvedValue(null),
      isLoading: false,
      fieldErrors: [{ path: 'value', message: 'O valor deve ser positivo' }],
      formError: null,
    })
    const onOpenChange = vi.fn()

    render(<EditTransactionDialog transaction={TRANSACTION} open={true} onOpenChange={onOpenChange} />)

    expect(screen.getByText('O valor deve ser positivo')).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalled()
  })
})
