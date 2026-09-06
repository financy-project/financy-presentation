import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NewTransactionDialog } from '@/modules/transactions/components/new-transaction-dialog'
import { useCreateTransaction } from '@/modules/transactions/hooks/use-create-transaction'
import { useCategoriesStore } from '@/modules/transactions/stores/use-categories-store'

vi.mock('@/modules/transactions/hooks/use-create-transaction')

const useCreateTransactionMock = vi.mocked(useCreateTransaction)

describe('NewTransactionDialog', () => {
  beforeEach(() => {
    useCreateTransactionMock.mockReturnValue({
      createTransaction: vi.fn().mockResolvedValue(null),
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

  it('converts value (reais) to cents and date to an ISO string before calling createTransaction, then toasts and closes on success', async () => {
    const createTransaction = vi.fn().mockResolvedValue({
      id: 't1',
      type: 'EXPENSE',
      description: 'Almoço no restaurante',
      date: '2026-09-04T00:00:00.000Z',
      value: 150,
      category: { id: 'cat-1', title: 'Alimentação', color: '#2563EB' },
    })
    useCreateTransactionMock.mockReturnValue({
      createTransaction,
      isLoading: false,
      fieldErrors: [],
      formError: null,
    })
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(<NewTransactionDialog open onOpenChange={onOpenChange} />)

    await user.type(screen.getByLabelText('Descrição'), 'Almoço no restaurante')

    await user.click(screen.getByLabelText('Data'))
    const dayButtons = document.querySelectorAll<HTMLButtonElement>('button[data-day]')
    await user.click(dayButtons[10])

    await user.type(screen.getByLabelText('Valor'), '150')

    await user.click(await screen.findByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Alimentação' }))

    await user.click(screen.getByRole('button', { name: /^salvar$/i }))

    await waitFor(() => expect(createTransaction).toHaveBeenCalledTimes(1))
    const input = createTransaction.mock.calls[0][0]
    expect(input.type).toBe('EXPENSE')
    expect(input.description).toBe('Almoço no restaurante')
    expect(input.value).toBe(150)
    expect(input.categoryId).toBe('cat-1')
    expect(typeof input.date).toBe('string')
    expect(new Date(input.date).toString()).not.toBe('Invalid Date')

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('keeps the dialog open and shows the field error when the server returns a validation error', () => {
    useCreateTransactionMock.mockReturnValue({
      createTransaction: vi.fn().mockResolvedValue(null),
      isLoading: false,
      fieldErrors: [{ path: 'value', message: 'O valor deve ser positivo' }],
      formError: null,
    })
    const onOpenChange = vi.fn()

    render(<NewTransactionDialog open onOpenChange={onOpenChange} />)

    expect(screen.getByText('O valor deve ser positivo')).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalled()
  })
})
