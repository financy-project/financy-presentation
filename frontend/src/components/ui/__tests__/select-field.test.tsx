import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SelectField } from '@/components/ui/select-field'

const OPTIONS = [
  { value: 'cat-1', label: 'Alimentação' },
  { value: 'cat-2', label: 'Mercado' },
]

describe('SelectField', () => {
  it('associates the label with the trigger via htmlFor/id', () => {
    render(<SelectField id="categoryId" label="Categoria" value="" onValueChange={vi.fn()} options={OPTIONS} />)

    expect(screen.getByLabelText('Categoria')).toBeInTheDocument()
  })

  it('shows the placeholder ("Selecione" by default) when value is empty', () => {
    render(<SelectField id="categoryId" label="Categoria" value="" onValueChange={vi.fn()} options={OPTIONS} />)

    expect(screen.getByRole('combobox')).toHaveTextContent('Selecione')
  })

  it('renders every option and calls onValueChange when one is picked', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <SelectField id="categoryId" label="Categoria" value="" onValueChange={onValueChange} options={OPTIONS} />,
    )

    await user.click(screen.getByRole('combobox'))
    expect(screen.getByRole('option', { name: 'Alimentação' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Mercado' })).toBeInTheDocument()

    await user.click(screen.getByRole('option', { name: 'Mercado' }))

    expect(onValueChange).toHaveBeenCalledWith('cat-2')
  })

  it('renders the errorMessage and marks the trigger as invalid', () => {
    render(
      <SelectField
        id="categoryId"
        label="Categoria"
        value=""
        onValueChange={vi.fn()}
        options={OPTIONS}
        errorMessage="Selecione uma categoria"
      />,
    )

    expect(screen.getByText('Selecione uma categoria')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('gives the trigger 12px horizontal / 14px vertical padding and 48px height', () => {
    render(<SelectField id="categoryId" label="Categoria" value="" onValueChange={vi.fn()} options={OPTIONS} />)

    const combobox = screen.getByRole('combobox')
    expect(combobox).toHaveClass('px-3', 'py-3.5', 'data-[size=default]:h-12')
    expect(combobox).not.toHaveClass('data-[size=default]:h-8')
  })

  it('disables the trigger when disabled is true', () => {
    render(
      <SelectField id="categoryId" label="Categoria" value="" onValueChange={vi.fn()} options={OPTIONS} disabled />,
    )

    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('omits the reset option when resettable is false (default), even with a value selected', async () => {
    const user = userEvent.setup()
    render(
      <SelectField id="categoryId" label="Categoria" value="cat-1" onValueChange={vi.fn()} options={OPTIONS} />,
    )

    await user.click(screen.getByRole('combobox'))

    expect(screen.queryByRole('option', { name: 'Selecione' })).not.toBeInTheDocument()
  })

  it('offers a reset option back to the placeholder when resettable and a value is selected', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <SelectField
        id="categoryId"
        label="Categoria"
        value="cat-1"
        onValueChange={onValueChange}
        options={OPTIONS}
        resettable
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Selecione' }))

    expect(onValueChange).toHaveBeenCalledWith('')
  })

  it('shows the reset option even before any value is selected, when resettable', async () => {
    const user = userEvent.setup()
    render(
      <SelectField id="categoryId" label="Categoria" value="" onValueChange={vi.fn()} options={OPTIONS} resettable />,
    )

    await user.click(screen.getByRole('combobox'))

    expect(screen.getByRole('option', { name: 'Selecione' })).toBeInTheDocument()
  })
})
