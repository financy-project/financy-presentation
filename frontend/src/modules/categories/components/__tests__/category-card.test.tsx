import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CategoryCard } from '@/modules/categories/components/category-card'

const CATEGORY = {
  id: '1',
  title: 'Alimentação',
  description: 'Restaurantes, delivery e refeições',
  icon: 'Utensils',
  color: '#2563EB',
  transactionsQuantity: 12,
}

describe('CategoryCard', () => {
  it('renders title, description, name badge, and item count', () => {
    render(<CategoryCard category={CATEGORY} onEdit={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Alimentação' })).toBeInTheDocument()
    expect(screen.getByText('Restaurantes, delivery e refeições')).toBeInTheDocument()
    expect(screen.getAllByText('Alimentação')).toHaveLength(2) // title + name badge
    expect(screen.getByText('12 itens')).toBeInTheDocument()
  })

  it('renders the icon square and name badge using the color-family light/base/dark tokens (not inline styles)', () => {
    render(<CategoryCard category={CATEGORY} onEdit={vi.fn()} onDelete={vi.fn()} />)

    const iconWrapper = screen.getByTestId('category-card-icon')
    expect(iconWrapper).toHaveClass('bg-blue-light', 'text-blue-base')
    expect(iconWrapper).not.toHaveAttribute('style')

    const badges = screen.getAllByText('Alimentação')
    const badge = badges.find((el) => el.getAttribute('data-slot') === 'tag')
    expect(badge).toHaveClass('bg-blue-light', 'text-blue-dark')
  })

  it('renders "1 item" (singular) when transactionsQuantity is 1', () => {
    render(
      <CategoryCard category={{ ...CATEGORY, transactionsQuantity: 1 }} onEdit={vi.fn()} onDelete={vi.fn()} />,
    )

    expect(screen.getByText('1 item')).toBeInTheDocument()
  })

  it('falls back to the generic icon for an unrecognized category.icon', () => {
    render(
      <CategoryCard
        category={{ ...CATEGORY, icon: 'SomeUnknownIcon' }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByTestId('category-card-icon')).toBeInTheDocument()
  })

  it("edit/delete buttons call onEdit/onDelete with the category", async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const user = userEvent.setup()
    render(<CategoryCard category={CATEGORY} onEdit={onEdit} onDelete={onDelete} />)

    await user.click(screen.getByRole('button', { name: /editar/i }))
    await user.click(screen.getByRole('button', { name: /excluir/i }))

    expect(onEdit).toHaveBeenCalledWith(CATEGORY)
    expect(onDelete).toHaveBeenCalledWith(CATEGORY)
  })

  it('renders the card with a white background and a visible gray-200 border', () => {
    render(<CategoryCard category={CATEGORY} onEdit={vi.fn()} onDelete={vi.fn()} />)

    const card = screen.getByTestId('category-card')
    expect(card).toHaveClass('bg-card', 'border', 'border-gray-200')
  })

  it('renders Excluir (trash) on the left and Editar (square-pen) on the right, per Figma', () => {
    render(<CategoryCard category={CATEGORY} onEdit={vi.fn()} onDelete={vi.fn()} />)

    const buttons = screen.getAllByRole('button')
    const deleteIndex = buttons.findIndex((b) => b.getAttribute('aria-label') === 'Excluir')
    const editIndex = buttons.findIndex((b) => b.getAttribute('aria-label') === 'Editar')
    expect(deleteIndex).toBeLessThan(editIndex)
  })
})
