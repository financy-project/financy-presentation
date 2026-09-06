import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function renderSelect(props: React.ComponentProps<typeof Select> = {}) {
  return render(
    <Select {...props}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione uma opção" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">Option 1</SelectItem>
        <SelectItem value="2">Option 2</SelectItem>
        <SelectItem value="3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  )
}

describe('Select', () => {
  it('renders the placeholder when empty', () => {
    renderSelect()
    expect(screen.getByText('Selecione uma opção')).toBeInTheDocument()
  })

  it('opens the option list when the trigger is clicked', async () => {
    const user = userEvent.setup()
    renderSelect()

    await user.click(screen.getByRole('combobox'))

    expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument()
  })

  it('reflects the selected option in the trigger', async () => {
    const user = userEvent.setup()
    renderSelect()

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Option 2' }))

    expect(screen.getByRole('combobox')).toHaveTextContent('Option 2')
  })

  it('does not open the list when disabled', async () => {
    const user = userEvent.setup()
    renderSelect({ disabled: true })

    await user.click(screen.getByRole('combobox'))

    expect(screen.queryByRole('option', { name: 'Option 1' })).not.toBeInTheDocument()
  })

  it('shows a pointer cursor on the trigger', () => {
    renderSelect()

    expect(screen.getByRole('combobox')).toHaveClass('cursor-pointer')
  })
})
