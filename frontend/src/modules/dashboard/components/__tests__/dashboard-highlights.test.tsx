import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DashboardHighlights } from '@/modules/dashboard/components/dashboard-highlights'
import { useGetDashboard } from '@/modules/dashboard/hooks/use-get-dashboard'
import { useCreateTransaction } from '@/modules/transactions/hooks/use-create-transaction'

vi.mock('@/modules/dashboard/hooks/use-get-dashboard')
vi.mock('@/modules/transactions/hooks/use-create-transaction')

const useGetDashboardMock = vi.mocked(useGetDashboard)
const useCreateTransactionMock = vi.mocked(useCreateTransaction)

function renderDashboardHighlights() {
  return render(
    <MemoryRouter>
      <DashboardHighlights />
    </MemoryRouter>,
  )
}

describe('DashboardHighlights', () => {
  beforeEach(() => {
    useGetDashboardMock.mockReturnValue({
      movement: null,
      recentTransactions: [],
      categories: [],
      isLoading: false,
      error: null,
    })
    useCreateTransactionMock.mockReturnValue({
      createTransaction: vi.fn().mockResolvedValue(null),
      isLoading: false,
      fieldErrors: [],
      formError: null,
    })
  })

  it('renders both the recent-transactions and categories blocks', () => {
    renderDashboardHighlights()

    expect(screen.getByText('Transações Recentes')).toBeInTheDocument()
    expect(screen.getByText('Categorias')).toBeInTheDocument()
  })

  it("lays out the two blocks in a 2/3 + 1/3 grid, matching DashboardSummary's 3-column grid", () => {
    renderDashboardHighlights()

    expect(screen.getByText('Transações Recentes').closest('section')).toHaveClass(
      'grid',
      'grid-cols-3',
      'gap-6',
    )
    expect(screen.getByText('Transações Recentes').closest('.col-span-2')).not.toBeNull()
    expect(screen.getByText('Categorias').closest('.col-span-1')).not.toBeNull()
  })
})
