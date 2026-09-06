import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { IconPicker } from '@/modules/categories/components/icon-picker'

describe('IconPicker', () => {
  it('renders all 16 icon options', () => {
    render(<IconPicker value="BriefcaseBusiness" onChange={vi.fn()} />)
    expect(screen.getAllByRole('button')).toHaveLength(16)
  })

  it("calls onChange with an option's name when clicked", async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<IconPicker value="BriefcaseBusiness" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'CarFront' }))

    expect(onChange).toHaveBeenCalledWith('CarFront')
  })

  it('marks the option matching value as pressed and the rest as not', () => {
    render(<IconPicker value="House" onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'House' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'CarFront' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})
