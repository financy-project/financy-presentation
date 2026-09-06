import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ColorPicker } from '@/modules/categories/components/color-picker'

describe('ColorPicker', () => {
  it('renders all 7 color options', () => {
    render(<ColorPicker value="#16A34A" onChange={vi.fn()} />)
    expect(screen.getAllByRole('button')).toHaveLength(7)
  })

  it("calls onChange with an option's hex value when clicked", async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<ColorPicker value="#16A34A" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'blue' }))

    expect(onChange).toHaveBeenCalledWith('#2563EB')
  })

  it('marks the option matching value as pressed and the rest as not', () => {
    render(<ColorPicker value="#DC2626" onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'red' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'blue' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})
