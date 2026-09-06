import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DatePickerField } from '@/modules/transactions/components/date-picker-field'

describe('DatePickerField', () => {
  it('shows the "Selecione" placeholder when value is undefined', () => {
    render(<DatePickerField id="date" label="Data" value={undefined} onChange={() => {}} />)

    expect(screen.getByLabelText('Data')).toHaveTextContent('Selecione')
  })

  it('calls onChange with the selected date and closes the popover', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<DatePickerField id="date" label="Data" value={undefined} onChange={onChange} />)

    await user.click(screen.getByLabelText('Data'))

    const dayButtons = document.querySelectorAll<HTMLButtonElement>('button[data-day]')
    expect(dayButtons.length).toBeGreaterThan(0)

    await user.click(dayButtons[10])

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toBeInstanceOf(Date)
    expect(document.querySelectorAll('button[data-day]')).toHaveLength(0)
  })
})
