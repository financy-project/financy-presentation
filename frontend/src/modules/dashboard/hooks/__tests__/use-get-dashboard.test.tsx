import { MockedProvider } from '@apollo/client/testing/react'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { GET_DASHBOARD } from '@/modules/dashboard/graphql/queries'
import { useGetDashboard } from '@/modules/dashboard/hooks/use-get-dashboard'

const MOVEMENT = {
  income: 425000,
  expense: 218045,
  totalBalance: 1284732,
}

const RECENT_TRANSACTIONS = [
  {
    id: 't1',
    type: 'INCOME',
    description: 'Pagamento de Salário',
    date: '2025-12-01T00:00:00.000Z',
    value: 425000,
    category: { id: 'c1', title: 'Receita', color: '#16A34A', icon: 'BriefcaseBusiness' },
  },
]

const CATEGORIES = [
  {
    categoryId: 'cat-1',
    title: 'Alimentação',
    color: '#2563EB',
    transactionCount: 12,
    totalValue: -54230,
  },
  {
    categoryId: 'cat-2',
    title: 'Transporte',
    color: '#9333EA',
    transactionCount: 8,
    totalValue: -38550,
  },
]

function renderUseGetDashboard(mocks: React.ComponentProps<typeof MockedProvider>['mocks']) {
  return renderHook(() => useGetDashboard(), {
    wrapper: ({ children }) => createElement(MockedProvider, { mocks }, children),
  })
}

describe('useGetDashboard', () => {
  it('resolves with the mocked movement, recentTransactions and categories', async () => {
    const mocks = [
      {
        request: { query: GET_DASHBOARD },
        result: {
          data: {
            dashboard: {
              movement: MOVEMENT,
              recentTransactions: RECENT_TRANSACTIONS,
              balanceByCategory: CATEGORIES,
            },
          },
        },
      },
    ]

    const { result } = renderUseGetDashboard(mocks)

    await waitFor(() => expect(result.current.movement).toEqual(MOVEMENT))
    expect(result.current.recentTransactions).toEqual(RECENT_TRANSACTIONS)
    expect(result.current.categories).toEqual(CATEGORIES)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('movement is null, recentTransactions/categories are [] and isLoading is true before the query resolves', () => {
    const mocks = [
      {
        request: { query: GET_DASHBOARD },
        result: {
          data: {
            dashboard: {
              movement: MOVEMENT,
              recentTransactions: RECENT_TRANSACTIONS,
              balanceByCategory: CATEGORIES,
            },
          },
        },
      },
    ]

    const { result } = renderUseGetDashboard(mocks)

    expect(result.current.movement).toBeNull()
    expect(result.current.recentTransactions).toEqual([])
    expect(result.current.categories).toEqual([])
    expect(result.current.isLoading).toBe(true)
  })

  it('sets the fallback error message on a network error', async () => {
    const mocks = [
      {
        request: { query: GET_DASHBOARD },
        error: new Error('Failed to fetch'),
      },
    ]

    const { result } = renderUseGetDashboard(mocks)

    await waitFor(() =>
      expect(result.current.error).toBe('Não foi possível carregar o resumo do dashboard.'),
    )
    expect(result.current.movement).toBeNull()
    expect(result.current.recentTransactions).toEqual([])
    expect(result.current.categories).toEqual([])
  })
})
