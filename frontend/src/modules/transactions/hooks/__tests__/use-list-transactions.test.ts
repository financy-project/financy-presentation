import { MockedProvider } from '@apollo/client/testing/react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { LIST_TRANSACTIONS } from '@/modules/transactions/graphql/queries'
import type { TransactionFilterValues } from '@/modules/transactions/hooks/use-list-transactions'
import { useListTransactions } from '@/modules/transactions/hooks/use-list-transactions'

const TRANSACTION = {
  id: 't1',
  type: 'EXPENSE' as const,
  description: 'Almoço no restaurante',
  date: '2026-09-04T00:00:00.000Z',
  value: 8850,
  category: { id: 'cat-1', title: 'Alimentação', color: '#2563EB', icon: 'Utensils' },
}

const BASE_FILTERS: TransactionFilterValues = {
  description: '',
  type: '',
  categoryId: '',
  period: { month: 9, year: 2026 },
}

const BASE_VARIABLES = {
  first: 10,
  after: undefined,
  description: undefined,
  type: undefined,
  categoryIds: undefined,
  month: 9,
  year: 2026,
}

function renderUseListTransactions(
  mocks: React.ComponentProps<typeof MockedProvider>['mocks'],
  initialFilters: TransactionFilterValues = BASE_FILTERS,
) {
  return renderHook(({ filters }) => useListTransactions(filters), {
    wrapper: ({ children }) => createElement(MockedProvider, { mocks }, children),
    initialProps: { filters: initialFilters },
  })
}

describe('useListTransactions', () => {
  it('passes filters through as query variables on initial mount, omitting unset ones', async () => {
    const mocks = [
      {
        request: { query: LIST_TRANSACTIONS, variables: BASE_VARIABLES },
        result: {
          data: {
            listTransactions: {
              edges: [{ node: TRANSACTION }],
              pageInfo: { hasNextPage: false, endCursor: null },
              totalRecord: 1,
            },
          },
        },
      },
    ]

    const { result } = renderUseListTransactions(mocks)

    await waitFor(() => expect(result.current.transactions).toEqual([TRANSACTION]))
  })

  it('passes type/categoryIds/month/year through as variables when set', async () => {
    const filters: TransactionFilterValues = {
      description: '',
      type: 'INCOME',
      categoryId: 'cat-1',
      period: { month: 3, year: 2025 },
    }
    const mocks = [
      {
        request: {
          query: LIST_TRANSACTIONS,
          variables: {
            ...BASE_VARIABLES,
            type: 'INCOME',
            categoryIds: ['cat-1'],
            month: 3,
            year: 2025,
          },
        },
        result: {
          data: {
            listTransactions: {
              edges: [{ node: TRANSACTION }],
              pageInfo: { hasNextPage: false, endCursor: null },
              totalRecord: 1,
            },
          },
        },
      },
    ]

    const { result } = renderUseListTransactions(mocks, filters)

    await waitFor(() => expect(result.current.transactions).toEqual([TRANSACTION]))
  })

  it('returns isLoading: true before the query resolves, transactions: []', () => {
    const mocks = [
      {
        request: { query: LIST_TRANSACTIONS, variables: BASE_VARIABLES },
        result: {
          data: {
            listTransactions: {
              edges: [{ node: TRANSACTION }],
              pageInfo: { hasNextPage: false, endCursor: null },
              totalRecord: 1,
            },
          },
        },
      },
    ]

    const { result } = renderUseListTransactions(mocks)

    expect(result.current.isLoading).toBe(true)
    expect(result.current.transactions).toEqual([])
  })

  it('sets the fallback error message on a network error, transactions stays []', async () => {
    const mocks = [
      {
        request: { query: LIST_TRANSACTIONS, variables: BASE_VARIABLES },
        error: new Error('Failed to fetch'),
      },
    ]

    const { result } = renderUseListTransactions(mocks)

    await waitFor(() =>
      expect(result.current.error).toBe('Não foi possível carregar as transações.'),
    )
    expect(result.current.transactions).toEqual([])
  })

  it('goToPage(2) after page 1 resolves with hasNextPage: true re-queries with after: <page 1 endCursor>', async () => {
    const mocks = [
      {
        request: { query: LIST_TRANSACTIONS, variables: BASE_VARIABLES },
        result: {
          data: {
            listTransactions: {
              edges: [{ node: TRANSACTION }],
              pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
              totalRecord: 15,
            },
          },
        },
      },
      {
        request: { query: LIST_TRANSACTIONS, variables: { ...BASE_VARIABLES, after: 'cursor-1' } },
        result: {
          data: {
            listTransactions: {
              edges: [{ node: { ...TRANSACTION, id: 't2' } }],
              pageInfo: { hasNextPage: false, endCursor: null },
              totalRecord: 15,
            },
          },
        },
      },
    ]

    const { result } = renderUseListTransactions(mocks)

    await waitFor(() => expect(result.current.transactions).toEqual([TRANSACTION]))

    act(() => {
      result.current.goToPage(2)
    })

    await waitFor(() =>
      expect(result.current.transactions).toEqual([{ ...TRANSACTION, id: 't2' }]),
    )
    expect(result.current.page).toBe(2)
  })

  it("goToPage(n) walks forward through the intermediate pages to resolve page n's cursor when it isn't yet known", async () => {
    const page2 = { ...TRANSACTION, id: 't2' }
    const page3 = { ...TRANSACTION, id: 't3' }
    const mocks = [
      {
        request: { query: LIST_TRANSACTIONS, variables: BASE_VARIABLES },
        result: {
          data: {
            listTransactions: {
              edges: [{ node: TRANSACTION }],
              pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
              totalRecord: 25,
            },
          },
        },
      },
      {
        request: { query: LIST_TRANSACTIONS, variables: { ...BASE_VARIABLES, after: 'cursor-1' } },
        result: {
          data: {
            listTransactions: {
              edges: [{ node: page2 }],
              pageInfo: { hasNextPage: true, endCursor: 'cursor-2' },
              totalRecord: 25,
            },
          },
        },
      },
      {
        request: { query: LIST_TRANSACTIONS, variables: { ...BASE_VARIABLES, after: 'cursor-2' } },
        result: {
          data: {
            listTransactions: {
              edges: [{ node: page3 }],
              pageInfo: { hasNextPage: false, endCursor: null },
              totalRecord: 25,
            },
          },
        },
      },
    ]

    const { result } = renderUseListTransactions(mocks)

    await waitFor(() => expect(result.current.transactions).toEqual([TRANSACTION]))

    await act(async () => {
      await result.current.goToPage(3)
    })

    expect(result.current.page).toBe(3)
    await waitFor(() => expect(result.current.transactions).toEqual([page3]))
  })

  it('goToPage(n) is a no-op when n is beyond the last page (no further hasNextPage)', async () => {
    const mocks = [
      {
        request: { query: LIST_TRANSACTIONS, variables: BASE_VARIABLES },
        result: {
          data: {
            listTransactions: {
              edges: [{ node: TRANSACTION }],
              pageInfo: { hasNextPage: false, endCursor: null },
              totalRecord: 5,
            },
          },
        },
      },
    ]

    const { result } = renderUseListTransactions(mocks)

    await waitFor(() => expect(result.current.transactions).toEqual([TRANSACTION]))

    await act(async () => {
      await result.current.goToPage(3)
    })

    expect(result.current.page).toBe(1)
  })

  it('keeps the previous page\'s transactions/totalRecord visible (isLoading: true) while the next page fetches', async () => {
    const mocks = [
      {
        request: { query: LIST_TRANSACTIONS, variables: BASE_VARIABLES },
        result: {
          data: {
            listTransactions: {
              edges: [{ node: TRANSACTION }],
              pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
              totalRecord: 15,
            },
          },
        },
      },
      {
        request: { query: LIST_TRANSACTIONS, variables: { ...BASE_VARIABLES, after: 'cursor-1' } },
        result: {
          data: {
            listTransactions: {
              edges: [{ node: { ...TRANSACTION, id: 't2' } }],
              pageInfo: { hasNextPage: false, endCursor: null },
              totalRecord: 15,
            },
          },
        },
        delay: 20,
      },
    ]

    const { result } = renderUseListTransactions(mocks)

    await waitFor(() => expect(result.current.transactions).toEqual([TRANSACTION]))

    act(() => {
      result.current.goToPage(2)
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.transactions).toEqual([TRANSACTION])
    expect(result.current.totalRecord).toBe(15)

    await waitFor(() =>
      expect(result.current.transactions).toEqual([{ ...TRANSACTION, id: 't2' }]),
    )
  })

  it('totalPages computes Math.ceil(totalRecord / 10) from the mocked response', async () => {
    const mocks = [
      {
        request: { query: LIST_TRANSACTIONS, variables: BASE_VARIABLES },
        result: {
          data: {
            listTransactions: {
              edges: [{ node: TRANSACTION }],
              pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
              totalRecord: 27,
            },
          },
        },
      },
    ]

    const { result } = renderUseListTransactions(mocks)

    await waitFor(() => expect(result.current.totalPages).toBe(3))
  })

  it('resets page to 1 and clears prior cursors when a filter changes', async () => {
    const incomeVariables = { ...BASE_VARIABLES, type: 'INCOME' }
    const mocks = [
      {
        request: { query: LIST_TRANSACTIONS, variables: BASE_VARIABLES },
        result: {
          data: {
            listTransactions: {
              edges: [{ node: TRANSACTION }],
              pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
              totalRecord: 15,
            },
          },
        },
      },
      {
        request: { query: LIST_TRANSACTIONS, variables: { ...BASE_VARIABLES, after: 'cursor-1' } },
        result: {
          data: {
            listTransactions: {
              edges: [{ node: { ...TRANSACTION, id: 't2' } }],
              pageInfo: { hasNextPage: false, endCursor: null },
              totalRecord: 15,
            },
          },
        },
      },
      {
        request: { query: LIST_TRANSACTIONS, variables: incomeVariables },
        result: {
          data: {
            listTransactions: {
              edges: [{ node: { ...TRANSACTION, id: 't3', type: 'INCOME' } }],
              pageInfo: { hasNextPage: false, endCursor: null },
              totalRecord: 1,
            },
          },
        },
      },
    ]

    const { result, rerender } = renderUseListTransactions(mocks)

    await waitFor(() => expect(result.current.transactions).toEqual([TRANSACTION]))

    act(() => {
      result.current.goToPage(2)
    })
    await waitFor(() => expect(result.current.page).toBe(2))

    rerender({ filters: { ...BASE_FILTERS, type: 'INCOME' } })

    expect(result.current.page).toBe(1)
    await waitFor(() =>
      expect(result.current.transactions).toEqual([{ ...TRANSACTION, id: 't3', type: 'INCOME' }]),
    )
  })

  it("aborts the previous request's AbortController when filters change before it resolves", () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort')
    const mocks = [
      { request: { query: LIST_TRANSACTIONS, variables: BASE_VARIABLES }, delay: 1000 },
      {
        request: { query: LIST_TRANSACTIONS, variables: { ...BASE_VARIABLES, type: 'INCOME' } },
        delay: 1000,
      },
    ]

    const { rerender } = renderUseListTransactions(mocks)

    expect(abortSpy).not.toHaveBeenCalled()

    rerender({ filters: { ...BASE_FILTERS, type: 'INCOME' } })

    expect(abortSpy).toHaveBeenCalledTimes(1)

    abortSpy.mockRestore()
  })

  it("does not surface an aborted request's AbortError as the hook's error", async () => {
    const abortError = Object.assign(new Error('The operation was aborted'), {
      name: 'AbortError',
    })
    const mocks = [
      { request: { query: LIST_TRANSACTIONS, variables: BASE_VARIABLES }, error: abortError },
    ]

    const { result } = renderUseListTransactions(mocks)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBeNull()
  })

  it('debounces the description filter before it reaches the query variables', async () => {
    const mocks = [
      {
        request: { query: LIST_TRANSACTIONS, variables: BASE_VARIABLES },
        result: {
          data: {
            listTransactions: {
              edges: [{ node: TRANSACTION }],
              pageInfo: { hasNextPage: false, endCursor: null },
              totalRecord: 1,
            },
          },
        },
      },
      {
        request: { query: LIST_TRANSACTIONS, variables: { ...BASE_VARIABLES, description: 'pizza' } },
        result: {
          data: {
            listTransactions: {
              edges: [{ node: { ...TRANSACTION, id: 't2', description: 'Pizzaria' } }],
              pageInfo: { hasNextPage: false, endCursor: null },
              totalRecord: 1,
            },
          },
        },
      },
    ]

    const { result, rerender } = renderUseListTransactions(mocks)
    await waitFor(() => expect(result.current.transactions).toEqual([TRANSACTION]))

    rerender({ filters: { ...BASE_FILTERS, description: 'pizza' } })

    // Real-time wait, well under the 400ms debounce — variables shouldn't
    // have changed yet.
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(result.current.transactions).toEqual([TRANSACTION])

    await waitFor(
      () =>
        expect(result.current.transactions).toEqual([
          { ...TRANSACTION, id: 't2', description: 'Pizzaria' },
        ]),
      { timeout: 2000 },
    )
  })
})
