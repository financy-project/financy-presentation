import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TransactionTypeSelect } from '@/modules/transactions/components/transaction-type-select'

describe('TransactionTypeSelect', () => {
  it('renders "Entrada" and "Saída" options plus the "Todos" reset option', async () => {
    const user = userEvent.setup()
    render(<TransactionTypeSelect value="" onValueChange={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))

    expect(screen.getByRole('option', { name: 'Todos' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Entrada' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Saída' })).toBeInTheDocument()
  })

  it('calls onValueChange with INCOME when "Entrada" is selected', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(<TransactionTypeSelect value="" onValueChange={onValueChange} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Entrada' }))

    expect(onValueChange).toHaveBeenCalledWith('INCOME')
  })

  it('calls onValueChange with EXPENSE when "Saída" is selected', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(<TransactionTypeSelect value="" onValueChange={onValueChange} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Saída' }))

    expect(onValueChange).toHaveBeenCalledWith('EXPENSE')
  })

  it('calls onValueChange with \'\' when "Todos" is selected back', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(<TransactionTypeSelect value="INCOME" onValueChange={onValueChange} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Todos' }))

    expect(onValueChange).toHaveBeenCalledWith('')
  })
})
