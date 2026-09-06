import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CardEyebrow } from '@/components/card-eyebrow'

describe('CardEyebrow', () => {
  it('renders its children', () => {
    render(<CardEyebrow>Saldo Total</CardEyebrow>)
    expect(screen.getByText('Saldo Total')).toBeInTheDocument()
  })

  it('applies the base uppercase gray-500 label classes', () => {
    render(<CardEyebrow>Saldo Total</CardEyebrow>)
    expect(screen.getByText('Saldo Total')).toHaveClass(
      'text-xs',
      'font-medium',
      'tracking-wider',
      'text-gray-500',
      'uppercase',
    )
  })

  it('merges an extra className when provided', () => {
    render(<CardEyebrow className="leading-4">Saldo Total</CardEyebrow>)
    expect(screen.getByText('Saldo Total')).toHaveClass('leading-4')
  })
})
