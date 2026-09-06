import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TransactionForm } from '@/modules/transactions/components/transaction-form'
import { useCategoriesStore } from '@/modules/transactions/stores/use-categories-store'

function renderTransactionForm(props: Partial<React.ComponentProps<typeof TransactionForm>> = {}) {
  return render(
    <TransactionForm isLoading={false} fieldErrors={[]} formError={null} onSubmit={vi.fn()} {...props} />,
  )
}

async function openCategorySelect(user: ReturnType<typeof userEvent.setup>) {
  const combobox = screen.getByRole('combobox')
  await user.click(combobox)
  return combobox
}

describe('TransactionForm', () => {
  beforeEach(() => {
    useCategoriesStore.setState({
      categories: [{ id: 'cat-1', title: 'Alimentação' }],
      isLoading: false,
      error: null,
    })
  })

  it('shows "A descrição é obrigatória" when description is submitted empty', async () => {
    const user = userEvent.setup()
    renderTransactionForm()

    await user.click(screen.getByRole('button', { name: /^salvar$/i }))

    expect(await screen.findByText('A descrição é obrigatória')).toBeInTheDocument()
  })

  it('shows "Selecione uma data" when date is submitted unset', async () => {
    const user = userEvent.setup()
    renderTransactionForm()

    await user.click(screen.getByRole('button', { name: /^salvar$/i }))

    expect(await screen.findByText('Selecione uma data')).toBeInTheDocument()
  })

  it('shows "O valor deve ser maior que zero" when value is 0', async () => {
    const user = userEvent.setup()
    renderTransactionForm()

    await user.click(screen.getByRole('button', { name: /^salvar$/i }))

    expect(await screen.findByText('O valor deve ser maior que zero')).toBeInTheDocument()
  })

  it('shows "Selecione uma categoria" when categoryId is submitted empty', async () => {
    const user = userEvent.setup()
    renderTransactionForm()

    await user.click(screen.getByRole('button', { name: /^salvar$/i }))

    expect(await screen.findByText('Selecione uma categoria')).toBeInTheDocument()
  })

  it('defaults the type toggle to "Despesa" (EXPENSE) selected', () => {
    renderTransactionForm()

    expect(screen.getByRole('button', { name: /despesa/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /receita/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows a pointer cursor on the Despesa/Receita toggle buttons', () => {
    renderTransactionForm()

    expect(screen.getByRole('button', { name: /despesa/i })).toHaveClass('cursor-pointer')
    expect(screen.getByRole('button', { name: /receita/i })).toHaveClass('cursor-pointer')
  })

  it('switches the type toggle to "Receita" (INCOME) when clicked', async () => {
    const user = userEvent.setup()
    renderTransactionForm()

    await user.click(screen.getByRole('button', { name: /receita/i }))

    expect(screen.getByRole('button', { name: /receita/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /despesa/i })).toHaveAttribute('aria-pressed', 'false')
  })

  // The category select's own padding/height/reset-option behavior is
  // generic to SelectField/CategorySelect now — covered by
  // select-field.test.tsx/category-select.test.tsx. This file only needs
  // to prove TransactionForm wires it correctly (options from the store,
  // not resettable, submits the picked categoryId).

  it('pre-fills all fields from defaultValues when provided', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderTransactionForm({
      defaultValues: {
        type: 'INCOME',
        description: 'Salário',
        date: new Date(2026, 5, 15),
        value: 340.25,
        categoryId: 'cat-1',
      },
      onSubmit,
    })

    expect(screen.getByRole('button', { name: /receita/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /despesa/i })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByLabelText('Descrição')).toHaveValue('Salário')
    expect(screen.getByLabelText('Data')).toHaveTextContent('15/06/2026')
    expect(screen.getByLabelText('Valor')).toHaveValue('340,25')

    await user.click(screen.getByRole('button', { name: /^salvar$/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const values = onSubmit.mock.calls[0][0]
    expect(values.type).toBe('INCOME')
    expect(values.categoryId).toBe('cat-1')
  })

  it('calls onSubmit with parsed values when all fields are valid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderTransactionForm({ onSubmit })

    await user.type(screen.getByLabelText('Descrição'), 'Almoço no restaurante')

    await user.click(screen.getByLabelText('Data'))
    const dayButtons = document.querySelectorAll<HTMLButtonElement>('button[data-day]')
    await user.click(dayButtons[10])

    await user.type(screen.getByLabelText('Valor'), '150')

    await openCategorySelect(user)
    await user.click(await screen.findByRole('option', { name: 'Alimentação' }))

    await user.click(screen.getByRole('button', { name: /^salvar$/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const values = onSubmit.mock.calls[0][0]
    expect(values.type).toBe('EXPENSE')
    expect(values.description).toBe('Almoço no restaurante')
    expect(values.date).toBeInstanceOf(Date)
    expect(values.value).toBe(1.5)
    expect(values.categoryId).toBe('cat-1')
  })
})
