import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PageHeader } from '@/components/page-header'

describe('PageHeader', () => {
  it('renders title as a heading, subtitle as body text, and actionLabel on the action button', () => {
    render(
      <PageHeader
        title="Categorias"
        subtitle="Organize suas transações por categorias"
        actionLabel="Nova categoria"
        onAction={() => {}}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Categorias' })).toBeInTheDocument()
    expect(screen.getByText('Organize suas transações por categorias')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nova categoria' })).toBeInTheDocument()
  })

  it('calls onAction when the action button is clicked', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()

    render(
      <PageHeader
        title="Transações"
        subtitle="Gerencie todas as suas transações financeiras"
        actionLabel="Nova transação"
        onAction={onAction}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Nova transação' }))

    expect(onAction).toHaveBeenCalledTimes(1)
  })
})
