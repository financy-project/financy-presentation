import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from '@/components/ui/pagination'

describe('Pagination', () => {
  it('renders one button per page from 1 to totalPages', () => {
    render(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument()
  })

  it('calls onPageChange with the correct number when a page is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination page={1} totalPages={3} onPageChange={onPageChange} />)

    await user.click(screen.getByRole('button', { name: '2' }))

    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('disables the previous button when page is 1', () => {
    render(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled()
  })

  it('disables the next button when page is totalPages', () => {
    render(<Pagination page={3} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled()
  })

  it('disables every control when disabled is true', () => {
    render(<Pagination page={2} totalPages={3} onPageChange={vi.fn()} disabled />)
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '1' })).toBeDisabled()
  })

  it('marks the current page with variant="default" and the rest with variant="ghost"', () => {
    render(<Pagination page={2} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('data-variant', 'default')
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('data-variant', 'ghost')
    expect(screen.getByRole('button', { name: '3' })).toHaveAttribute('data-variant', 'ghost')
  })

  it('merges a custom className onto the nav alongside its default classes', () => {
    render(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} className="gap-2" />)
    const nav = screen.getByRole('navigation', { name: 'Paginação' })
    expect(nav).toHaveClass('flex', 'items-center', 'gap-2')
    expect(nav).not.toHaveClass('gap-1')
  })

  it('keeps the default gap-1 class when className is omitted', () => {
    render(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />)
    const nav = screen.getByRole('navigation', { name: 'Paginação' })
    expect(nav).toHaveClass('gap-1')
  })

  it('shows at most 3 page numbers, sliding the window as the current page changes', () => {
    const { rerender } = render(<Pagination page={1} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '4' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '5' })).not.toBeInTheDocument()

    rerender(<Pagination page={3} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.queryByRole('button', { name: '1' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument()

    rerender(<Pagination page={5} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '1' })).not.toBeInTheDocument()
  })

  it('renders the previous/next controls with a gray-300 border, not the primary color', () => {
    render(<Pagination page={2} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Página anterior' })).toHaveClass(
      'border-gray-300'
    )
    expect(screen.getByRole('button', { name: 'Próxima página' })).toHaveClass(
      'border-gray-300'
    )
  })
})
