import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Tag } from '@/components/ui/tag'

describe('Tag', () => {
  it('renders the passed children text', () => {
    render(<Tag>Alimentação</Tag>)
    expect(screen.getByText('Alimentação')).toBeInTheDocument()
  })

  it.each([
    ['blue', 'bg-blue-light', 'text-blue-dark'],
    ['purple', 'bg-purple-light', 'text-purple-dark'],
    ['pink', 'bg-pink-light', 'text-pink-dark'],
    ['red', 'bg-red-light', 'text-red-dark'],
    ['orange', 'bg-orange-light', 'text-orange-dark'],
    ['yellow', 'bg-yellow-light', 'text-yellow-dark'],
    ['green', 'bg-green-light', 'text-green-dark'],
  ] as const)('applies the correct background/text classes for color=%s', (color, bg, text) => {
    render(<Tag color={color}>Tag</Tag>)
    const tag = screen.getByText('Tag')
    expect(tag).toHaveClass(bg)
    expect(tag).toHaveClass(text)
  })

  it('applies the correct size classes', () => {
    render(<Tag size="sm">Sm</Tag>)
    expect(screen.getByText('Sm')).toHaveAttribute('data-size', 'sm')
  })

  it('defaults to color="blue" and size="md" when omitted', () => {
    render(<Tag>Default</Tag>)
    const tag = screen.getByText('Default')
    expect(tag).toHaveClass('bg-blue-light')
    expect(tag).toHaveClass('text-blue-dark')
    expect(tag).toHaveAttribute('data-size', 'md')
  })
})
