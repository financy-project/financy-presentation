import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CurrencyInput } from '@/modules/transactions/components/currency-input'

function TestHarness({ onChange }: { onChange: (value: number) => void }) {
  const [value, setValue] = useState(0)
  return (
    <CurrencyInput
      id="value"
      label="Valor"
      value={value}
      onChange={(next) => {
        setValue(next)
        onChange(next)
      }}
    />
  )
}

describe('CurrencyInput', () => {
  it('formats "1", "5", "0" keystrokes into "1,50" and calls onChange with 1.5', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<TestHarness onChange={onChange} />)

    const input = screen.getByLabelText('Valor')
    expect(screen.getByText('R$')).toBeInTheDocument()

    await user.type(input, '150')

    expect(input).toHaveValue('1,50')
    expect(onChange).toHaveBeenLastCalledWith(1.5)
  })

  it('removes the last digit on Backspace and re-formats', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<TestHarness onChange={onChange} />)

    const input = screen.getByLabelText('Valor')
    await user.type(input, '150')
    expect(input).toHaveValue('1,50')

    await user.type(input, '{Backspace}')

    expect(input).toHaveValue('0,15')
    expect(onChange).toHaveBeenLastCalledWith(0.15)
  })

  it('ignores non-digit, non-Backspace keys', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<CurrencyInput id="value" label="Valor" value={0} onChange={onChange} />)

    const input = screen.getByLabelText('Valor')
    await user.type(input, 'abc-.,')

    expect(input).toHaveValue('0,00')
    expect(onChange).not.toHaveBeenCalled()
  })
})
