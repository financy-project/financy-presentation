import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { DashboardCardHeader } from '@/modules/dashboard/components/dashboard-card-header'

function renderHeader(props: React.ComponentProps<typeof DashboardCardHeader>) {
  return render(
    <MemoryRouter>
      <DashboardCardHeader {...props} />
    </MemoryRouter>,
  )
}

describe('DashboardCardHeader', () => {
  it('renders the title', () => {
    renderHeader({ title: 'Transações Recentes', action: { label: 'Ver todas', to: '/transacoes' } })

    expect(screen.getByText('Transações Recentes')).toBeInTheDocument()
  })

  it('renders the action link with its label and href', () => {
    renderHeader({ title: 'Transações Recentes', action: { label: 'Ver todas', to: '/transacoes' } })

    expect(screen.getByRole('link', { name: /ver todas/i })).toHaveAttribute('href', '/transacoes')
  })
})
