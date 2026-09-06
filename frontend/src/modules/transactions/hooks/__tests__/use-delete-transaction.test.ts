import { MockedProvider } from '@apollo/client/testing/react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { DELETE_TRANSACTION } from '@/modules/transactions/graphql/mutations'
import { LIST_TRANSACTIONS } from '@/modules/transactions/graphql/queries'
import { useDeleteTransaction } from '@/modules/transactions/hooks/use-delete-transaction'
import type { TransactionFilterValues } from '@/modules/transactions/hooks/use-list-transactions'
import { useListTransactions } from '@/modules/transactions/hooks/use-list-transactions'

const LIST_FILTERS: TransactionFilterValues = {
  description: '',
  type: '',
  categoryId: '',
  period: { month: 9, year: 2026 },
}

const ID = 't1'

const TRANSACTION = {
  id: ID,
  type: 'EXPENSE',
  description: 'Almoço no restaurante',
  date: '2026-09-04T12:00:00.000Z',
  value: 8850,
  category: { id: 'cat-1', title: 'Alimentação', color: '#2563EB', icon: 'Utensils' },
}

function renderUseDeleteTransaction(mocks: React.ComponentProps<typeof MockedProvider>['mocks']) {
  return renderHook(() => useDeleteTransaction(), {
    wrapper: ({ children }) => createElement(MockedProvider, { mocks }, children),
  })
}

describe('useDeleteTransaction', () => {
  it('resolves true and toggles isLoading on success', async () => {
    const mocks = [
      {
        request: { query: DELETE_TRANSACTION, variables: { id: ID } },
        result: { data: { deleteTransaction: true } },
      },
    ]

    const { result } = renderUseDeleteTransaction(mocks)
    expect(result.current.isLoading).toBe(false)

    let response
    await act(async () => {
      response = await result.current.deleteTransaction(ID)
    })

    expect(response).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBeNull()
  })

  it("refetches the active useListTransactions() watcher (with its own variables) after a successful delete, not an isolated no-variables query", async () => {
    const listVariables = {
      first: 10,
      after: undefined,
      description: undefined,
      type: undefined,
      categoryIds: undefined,
      month: 9,
      year: 2026,
    }
    const mocks = [
      {
        request: { query: LIST_TRANSACTIONS, variables: listVariables },
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
        request: { query: DELETE_TRANSACTION, variables: { id: ID } },
        result: { data: { deleteTransaction: true } },
      },
      {
        request: { query: LIST_TRANSACTIONS, variables: listVariables },
        result: {
          data: {
            listTransactions: {
              edges: [],
              pageInfo: { hasNextPage: false, endCursor: null },
              totalRecord: 0,
            },
          },
        },
      },
    ]

    const { result } = renderHook(
      () => ({ list: useListTransactions(LIST_FILTERS), del: useDeleteTransaction() }),
      { wrapper: ({ children }) => createElement(MockedProvider, { mocks }, children) },
    )

    await waitFor(() => expect(result.current.list.transactions).toHaveLength(1))

    await act(async () => {
      await result.current.del.deleteTransaction(ID)
    })

    await waitFor(() => expect(result.current.list.transactions).toHaveLength(0))
    expect(result.current.list.totalRecord).toBe(0)
  })

  it('sets the fallback error message on a network/unexpected error', async () => {
    const mocks = [
      {
        request: { query: DELETE_TRANSACTION, variables: { id: ID } },
        error: new Error('Failed to fetch'),
      },
    ]

    const { result } = renderUseDeleteTransaction(mocks)

    let response
    await act(async () => {
      response = await result.current.deleteTransaction(ID)
    })

    expect(response).toBe(false)
    await waitFor(() =>
      expect(result.current.error).toBe('Não foi possível excluir a transação. Tente novamente.'),
    )
  })
})
