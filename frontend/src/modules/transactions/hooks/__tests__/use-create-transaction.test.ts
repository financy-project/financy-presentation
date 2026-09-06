import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { MockedProvider } from '@apollo/client/testing/react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { CREATE_TRANSACTION } from '@/modules/transactions/graphql/mutations'
import { LIST_TRANSACTIONS } from '@/modules/transactions/graphql/queries'
import { useCreateTransaction } from '@/modules/transactions/hooks/use-create-transaction'
import type { TransactionFilterValues } from '@/modules/transactions/hooks/use-list-transactions'
import { useListTransactions } from '@/modules/transactions/hooks/use-list-transactions'

// Stands in for a caller-supplied query (e.g. dashboard's GET_DASHBOARD) — the
// hook only needs an opaque DocumentNode, so a throwaway query keeps this
// test from depending on another module's document.
interface SomeOtherQueryData {
  someOtherQuery: { id: string }
}

const SOME_OTHER_QUERY = gql`
  query SomeOtherQuery {
    someOtherQuery {
      id
    }
  }
`

const LIST_FILTERS: TransactionFilterValues = {
  description: '',
  type: '',
  categoryId: '',
  period: { month: 9, year: 2026 },
}

const INPUT = {
  type: 'EXPENSE' as const,
  description: 'Almoço no restaurante',
  date: '2026-09-04T00:00:00.000Z',
  value: 150,
  categoryId: 'cat-1',
}

function renderUseCreateTransaction(mocks: React.ComponentProps<typeof MockedProvider>['mocks']) {
  return renderHook(() => useCreateTransaction(), {
    wrapper: ({ children }) => createElement(MockedProvider, { mocks }, children),
  })
}

describe('useCreateTransaction', () => {
  it('resolves with the created transaction and toggles isLoading on success', async () => {
    const mocks = [
      {
        request: { query: CREATE_TRANSACTION, variables: { input: INPUT } },
        result: {
          data: {
            createTransaction: {
              id: 't1',
              ...INPUT,
              category: { id: INPUT.categoryId, title: 'Alimentação', color: '#2563EB' },
            },
          },
        },
      },
    ]

    const { result } = renderUseCreateTransaction(mocks)
    expect(result.current.isLoading).toBe(false)

    let response
    await act(async () => {
      response = await result.current.createTransaction(INPUT)
    })

    expect(response).toEqual({
      id: 't1',
      ...INPUT,
      category: { id: INPUT.categoryId, title: 'Alimentação', color: '#2563EB' },
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it("refetches the active useListTransactions() watcher (with its own variables) after a successful create, not an isolated no-variables query", async () => {
    const listVariables = {
      first: 10,
      after: undefined,
      description: undefined,
      type: undefined,
      categoryIds: undefined,
      month: 9,
      year: 2026,
    }
    const createdTransaction = {
      id: 't1',
      ...INPUT,
      category: { id: INPUT.categoryId, title: 'Alimentação', color: '#2563EB' },
    }

    const mocks = [
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
      {
        request: { query: CREATE_TRANSACTION, variables: { input: INPUT } },
        result: { data: { createTransaction: createdTransaction } },
      },
      {
        request: { query: LIST_TRANSACTIONS, variables: listVariables },
        result: {
          data: {
            listTransactions: {
              edges: [{ node: { ...createdTransaction, date: INPUT.date } }],
              pageInfo: { hasNextPage: false, endCursor: null },
              totalRecord: 1,
            },
          },
        },
      },
    ]

    const { result } = renderHook(
      () => ({ list: useListTransactions(LIST_FILTERS), create: useCreateTransaction() }),
      { wrapper: ({ children }) => createElement(MockedProvider, { mocks }, children) },
    )

    await waitFor(() => expect(result.current.list.totalRecord).toBe(0))

    await act(async () => {
      await result.current.create.createTransaction(INPUT)
    })

    // Chains 3 sequential mocked network round trips (initial fetch ->
    // mutation -> refetch) — the default waitFor (1000ms) and Vitest's
    // default per-test timeout (5000ms) are usually enough but flake under
    // the CPU contention of a full parallel test-suite run (confirmed: a
    // first bump to only the waitFor's timeout still failed, capped by the
    // test's own 5000ms ceiling — both need raising, with headroom between
    // them). Not a race condition in the hook, just a tight margin for how
    // much chained async work happens before the assertion can pass.
    await waitFor(() => expect(result.current.list.transactions).toHaveLength(1), { timeout: 10000 })
    expect(result.current.list.totalRecord).toBe(1)
  }, 15000)

  it('also refetches an active query passed via additionalRefetchQueries', async () => {
    const createdTransaction = {
      id: 't1',
      ...INPUT,
      category: { id: INPUT.categoryId, title: 'Alimentação', color: '#2563EB' },
    }

    const mocks = [
      {
        request: { query: SOME_OTHER_QUERY },
        result: { data: { someOtherQuery: { id: 'before' } } },
      },
      {
        request: { query: CREATE_TRANSACTION, variables: { input: INPUT } },
        result: { data: { createTransaction: createdTransaction } },
      },
      {
        request: { query: SOME_OTHER_QUERY },
        result: { data: { someOtherQuery: { id: 'after' } } },
      },
    ]

    const { result } = renderHook(
      () => ({
        other: useQuery<SomeOtherQueryData>(SOME_OTHER_QUERY),
        create: useCreateTransaction({ additionalRefetchQueries: [SOME_OTHER_QUERY] }),
      }),
      { wrapper: ({ children }) => createElement(MockedProvider, { mocks }, children) },
    )

    await waitFor(() => expect(result.current.other.data?.someOtherQuery.id).toBe('before'))

    await act(async () => {
      await result.current.create.createTransaction(INPUT)
    })

    await waitFor(() => expect(result.current.other.data?.someOtherQuery.id).toBe('after'))
  })

  it('maps extensions.validationErrors straight to fieldErrors when present', async () => {
    const mocks = [
      {
        request: { query: CREATE_TRANSACTION, variables: { input: INPUT } },
        result: {
          errors: [{ message: 'Erro de validação' }],
          extensions: {
            validationErrors: [{ path: 'value', message: 'O valor deve ser positivo' }],
          },
        },
      },
    ]

    const { result } = renderUseCreateTransaction(mocks)

    await act(async () => {
      await result.current.createTransaction(INPUT)
    })

    await waitFor(() =>
      expect(result.current.fieldErrors).toEqual([
        { path: 'value', message: 'O valor deve ser positivo' },
      ]),
    )
    expect(result.current.formError).toBeNull()
  })

  it('sets formError to a fallback message on a network/unexpected error', async () => {
    const mocks = [
      {
        request: { query: CREATE_TRANSACTION, variables: { input: INPUT } },
        error: new Error('Failed to fetch'),
      },
    ]

    const { result } = renderUseCreateTransaction(mocks)

    await act(async () => {
      await result.current.createTransaction(INPUT)
    })

    await waitFor(() =>
      expect(result.current.formError).toBe(
        'Não foi possível criar a transação. Tente novamente.',
      ),
    )
    expect(result.current.fieldErrors).toEqual([])
  })
})
