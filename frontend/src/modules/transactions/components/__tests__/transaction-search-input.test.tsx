import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TransactionSearchInput } from '@/modules/transactions/components/transaction-search-input'

describe('TransactionSearchInput', () => {
  it('renders the "Buscar" label and description placeholder', () => {
    render(<TransactionSearchInput value="" onChange={vi.fn()} />)

    expect(screen.getByLabelText('Buscar')).toHaveAttribute(
      'placeholder',
      'Buscar por descrição',
    )
  })

  it('calls onChange with the typed value', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<TransactionSearchInput value="" onChange={onChange} />)

    await user.type(screen.getByLabelText('Buscar'), 'a')

    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('reflects the controlled value', () => {
    render(<TransactionSearchInput value="mercado" onChange={vi.fn()} />)

    expect(screen.getByLabelText('Buscar')).toHaveValue('mercado')
  })
})
