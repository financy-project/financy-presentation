import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Trash2 } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { IconButton } from '@/components/ui/icon-button'

describe('IconButton', () => {
  it('renders the icon passed via the icon prop', () => {
    render(<IconButton icon={<Trash2 data-testid="icon" />} aria-label="Excluir" />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('applies the received aria-label', () => {
    render(<IconButton icon={<Trash2 />} aria-label="Excluir" />)
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument()
  })

  it('is disabled when the disabled prop is passed', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<IconButton icon={<Trash2 />} aria-label="Excluir" disabled onClick={onClick} />)

    const button = screen.getByRole('button', { name: 'Excluir' })
    expect(button).toBeDisabled()

    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  // `aria-label` is a required prop on IconButtonProps (see icon-button.tsx) —
  // omitting it is a TypeScript compile error, not a runtime one, so there is
  // no runtime test for it. `pnpm build`'s type-check is what enforces this.
})
