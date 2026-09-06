import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Link } from '@/components/ui/link'
import { buttonVariants } from '@/components/ui/button'

describe('Link', () => {
  it('renders an <a> element with the received href', () => {
    render(<Link href="/sobre">Sobre</Link>)
    const link = screen.getByRole('link', { name: 'Sobre' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/sobre')
  })

  it('applies the buttonVariants({ variant: "link" }) classes', () => {
    render(<Link href="/sobre">Sobre</Link>)
    const link = screen.getByRole('link', { name: 'Sobre' })
    for (const cls of buttonVariants({ variant: 'link' }).split(' ')) {
      expect(link).toHaveClass(cls)
    }
  })

  it('passes through target/rel when provided', () => {
    render(
      <Link href="https://example.com" target="_blank" rel="noopener noreferrer">
        Externo
      </Link>
    )
    const link = screen.getByRole('link', { name: 'Externo' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
