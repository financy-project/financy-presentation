import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Mail } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { TextInput } from '@/components/ui/text-input'

describe('TextInput', () => {
  it('associates the label with the input via htmlFor/id', () => {
    render(<TextInput id="email" label="E-mail" />)
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
  })

  it('renders the leftIcon when provided', () => {
    render(<TextInput id="email" label="E-mail" leftIcon={<Mail data-testid="icon" />} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('does not render an icon wrapper when leftIcon/rightIcon are omitted', () => {
    render(<TextInput id="email" label="E-mail" />)
    expect(screen.queryByTestId('icon')).not.toBeInTheDocument()
  })

  it('renders the errorMessage and marks the input as invalid', () => {
    render(<TextInput id="email" label="E-mail" errorMessage="Informe um e-mail válido" />)
    expect(screen.getByText('Informe um e-mail válido')).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not render an error message when none is passed', () => {
    render(<TextInput id="email" label="E-mail" />)
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'false')
  })

  it('forwards native input props such as placeholder and onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <TextInput id="email" label="E-mail" placeholder="mail@exemplo.com" onChange={onChange} />,
    )

    const input = screen.getByPlaceholderText('mail@exemplo.com')
    await user.type(input, 'a')
    expect(onChange).toHaveBeenCalled()
  })

  it('renders the rightIcon when provided', () => {
    render(<TextInput id="email" label="E-mail" rightIcon={<Mail data-testid="icon" />} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})
