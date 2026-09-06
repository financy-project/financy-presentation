import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeleteTransactionAlert } from '@/modules/transactions/components/delete-transaction-alert'
import { useDeleteTransaction } from '@/modules/transactions/hooks/use-delete-transaction'

vi.mock('@/modules/transactions/hooks/use-delete-transaction')

const useDeleteTransactionMock = vi.mocked(useDeleteTransaction)

const TRANSACTION = {
  id: 't1',
  type: 'EXPENSE' as const,
  description: 'Almoço no restaurante',
  date: '2026-09-04T00:00:00.000Z',
  value: 8850,
  category: { id: 'cat-1', title: 'Alimentação', color: '#2563EB', icon: 'Utensils' },
}

describe('DeleteTransactionAlert', () => {
  beforeEach(() => {
    useDeleteTransactionMock.mockReturnValue({
      deleteTransaction: vi.fn().mockResolvedValue(false),
      isLoading: false,
      error: null,
    })
  })

  it("renders the transaction's description in the confirmation copy", () => {
    render(<DeleteTransactionAlert transaction={TRANSACTION} open={true} onOpenChange={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Excluir transação' })).toBeInTheDocument()
  })

  it('calls deleteTransaction(transaction.id) only when "Sim" is confirmed, not on "Não"', async () => {
    const deleteTransaction = vi.fn().mockResolvedValue(false)
    useDeleteTransactionMock.mockReturnValue({ deleteTransaction, isLoading: false, error: null })
    const user = userEvent.setup()
    render(<DeleteTransactionAlert transaction={TRANSACTION} open={true} onOpenChange={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /^não$/i }))
    expect(deleteTransaction).not.toHaveBeenCalled()
  })

  it('closes and toasts on a successful delete', async () => {
    const deleteTransaction = vi.fn().mockResolvedValue(true)
    useDeleteTransactionMock.mockReturnValue({ deleteTransaction, isLoading: false, error: null })
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(<DeleteTransactionAlert transaction={TRANSACTION} open={true} onOpenChange={onOpenChange} />)

    await user.click(screen.getByRole('button', { name: /^sim$/i }))

    await waitFor(() => expect(deleteTransaction).toHaveBeenCalledWith('t1'))
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('stays open and renders the error when the delete fails (Radix Action would otherwise auto-close)', async () => {
    const deleteTransaction = vi.fn().mockResolvedValue(false)
    useDeleteTransactionMock.mockReturnValue({
      deleteTransaction,
      isLoading: false,
      error: 'Não foi possível excluir a transação. Tente novamente.',
    })
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(<DeleteTransactionAlert transaction={TRANSACTION} open={true} onOpenChange={onOpenChange} />)

    await user.click(screen.getByRole('button', { name: /^sim$/i }))

    await waitFor(() => expect(deleteTransaction).toHaveBeenCalledWith('t1'))
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível excluir a transação. Tente novamente.',
    )
  })
})
