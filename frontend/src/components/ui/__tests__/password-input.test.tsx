import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PasswordInput } from '@/components/ui/password-input'

describe('PasswordInput', () => {
  it('renders the input with type="password" by default', () => {
    render(<PasswordInput id="password" label="Senha" />)
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
  })

  it('toggles the input type and the toggle button aria-label on click', async () => {
    const user = userEvent.setup()
    render(<PasswordInput id="password" label="Senha" />)

    const input = screen.getByLabelText('Senha')
    await user.click(screen.getByRole('button', { name: /mostrar senha/i }))
    expect(input).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: /ocultar senha/i }))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('forwards errorMessage and leftIcon to the underlying TextInput', () => {
    render(<PasswordInput id="password" label="Senha" errorMessage="Senha inválida" />)
    expect(screen.getByText('Senha inválida')).toBeInTheDocument()
  })

  it('uses the DS eye-closed/eye icon pair, not eye-off, for the visibility toggle', async () => {
    const user = userEvent.setup()
    const { container } = render(<PasswordInput id="password" label="Senha" />)

    expect(container.querySelector('.lucide-eye-closed')).toBeInTheDocument()
    expect(container.querySelector('.lucide-eye-off')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /mostrar senha/i }))

    expect(container.querySelector('.lucide-eye')).toBeInTheDocument()
    expect(container.querySelector('.lucide-eye-closed')).not.toBeInTheDocument()
  })
})
