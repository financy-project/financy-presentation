import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CategoryForm } from '@/modules/categories/components/category-form'

function renderCategoryForm(props: Partial<React.ComponentProps<typeof CategoryForm>> = {}) {
  return render(
    <CategoryForm
      isLoading={false}
      fieldErrors={[]}
      formError={null}
      onSubmit={vi.fn()}
      {...props}
    />,
  )
}

describe('CategoryForm', () => {
  it('shows "O título é obrigatório" for an empty title on submit', async () => {
    const user = userEvent.setup()
    renderCategoryForm()

    await user.click(screen.getByRole('button', { name: /^salvar$/i }))

    expect(await screen.findByText('O título é obrigatório')).toBeInTheDocument()
  })

  it('disables submit and shows "Salvando…" while loading', () => {
    renderCategoryForm({ isLoading: true })

    const button = screen.getByRole('button', { name: /salvando/i })
    expect(button).toBeDisabled()
  })

  it('renders a mocked fieldErrors entry under Título', async () => {
    renderCategoryForm({ fieldErrors: [{ path: 'title', message: 'Título inválido' }] })

    expect(await screen.findByText('Título inválido')).toBeInTheDocument()
  })

  it('renders the mocked formError in the role="alert" banner verbatim', async () => {
    renderCategoryForm({ formError: 'Não foi possível criar a categoria.' })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível criar a categoria.',
    )
  })

  it('calls onSubmit with the pre-selected icon/color when submitted without changing them', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    renderCategoryForm({ onSubmit })

    await user.type(screen.getByLabelText(/título/i), 'Alimentação')
    await user.click(screen.getByRole('button', { name: /^salvar$/i }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Alimentação',
        description: '',
        icon: 'BriefcaseBusiness',
        color: '#16A34A',
      }),
    )
  })

  it('calls onSubmit with a newly selected icon/color after the user picks different ones', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    renderCategoryForm({ onSubmit })

    await user.type(screen.getByLabelText(/título/i), 'Transporte')
    await user.click(screen.getByRole('button', { name: 'CarFront' }))
    await user.click(screen.getByRole('button', { name: 'blue' }))
    await user.click(screen.getByRole('button', { name: /^salvar$/i }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Transporte',
        description: '',
        icon: 'CarFront',
        color: '#2563EB',
      }),
    )
  })

  it('pre-fills title/description and pre-selects icon/color from a defaultValues prop', () => {
    renderCategoryForm({
      defaultValues: {
        title: 'Saúde',
        description: 'Consultas e exames',
        icon: 'HeartPulse',
        color: '#DC2626',
      },
    })

    expect(screen.getByLabelText(/título/i)).toHaveValue('Saúde')
    expect(screen.getByLabelText(/descrição/i)).toHaveValue('Consultas e exames')
    expect(screen.getByRole('button', { name: 'HeartPulse' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'red' })).toHaveAttribute('aria-pressed', 'true')
  })
})
