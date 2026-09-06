import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Subtitle } from '@/components/subtitle'

describe('Subtitle', () => {
  it('renders its children', () => {
    render(<Subtitle>Organize suas categorias</Subtitle>)
    expect(screen.getByText('Organize suas categorias')).toBeInTheDocument()
  })

  it('applies the base text-gray-600 class', () => {
    render(<Subtitle>Organize suas categorias</Subtitle>)
    expect(screen.getByText('Organize suas categorias')).toHaveClass('text-gray-600')
  })

  it('merges an extra className when provided', () => {
    render(<Subtitle className="text-base">Organize suas categorias</Subtitle>)
    expect(screen.getByText('Organize suas categorias')).toHaveClass('text-gray-600', 'text-base')
  })
})
