import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ErrorMessage } from '@/components/error-message'

describe('ErrorMessage', () => {
  it('renders nothing when error is null', () => {
    const { container } = render(<ErrorMessage error={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the error text with role="alert" when error is set', () => {
    render(<ErrorMessage error="Algo deu errado" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Algo deu errado')
  })

  it('applies the base text-destructive text-sm classes', () => {
    render(<ErrorMessage error="Algo deu errado" />)
    expect(screen.getByRole('alert')).toHaveClass('text-destructive', 'text-sm')
  })

  it('merges an extra className when provided', () => {
    render(<ErrorMessage error="Algo deu errado" className="mt-6" />)
    expect(screen.getByRole('alert')).toHaveClass('mt-6')
  })
})
