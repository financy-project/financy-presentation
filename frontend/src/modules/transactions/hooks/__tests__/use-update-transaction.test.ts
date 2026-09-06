import { MockedProvider } from '@apollo/client/testing/react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { UPDATE_TRANSACTION } from '@/modules/transactions/graphql/mutations'
import { LIST_TRANSACTIONS } from '@/modules/transactions/graphql/queries'
import { useUpdateTransaction } from '@/modules/transactions/hooks/use-update-transaction'

const ID = 't1'
const INPUT = {
  type: 'EXPENSE' as const,
  description: 'Almoço no restaurante',
  date: '2026-09-04T00:00:00.000Z',
  value: 150,
  categoryId: 'cat-1',
}

function renderUseUpdateTransaction(mocks: React.ComponentProps<typeof MockedProvider>['mocks']) {
  return renderHook(() => useUpdateTransaction(), {
    wrapper: ({ children }) => createElement(MockedProvider, { mocks }, children),
  })
}

describe('useUpdateTransaction', () => {
  it('resolves with the updated transaction and toggles isLoading on success', async () => {
    const mocks = [
      {
        request: { query: UPDATE_TRANSACTION, variables: { id: ID, input: INPUT } },
        result: {
          data: {
            updateTransaction: {
              id: ID,
              ...INPUT,
              category: { id: INPUT.categoryId, title: 'Alimentação', color: '#2563EB' },
            },
          },
        },
      },
      {
        request: { query: LIST_TRANSACTIONS },
        result: { data: { listTransactions: { edges: [], pageInfo: { hasNextPage: false, endCursor: null }, totalRecord: 0 } } },
      },
    ]

    const { result } = renderUseUpdateTransaction(mocks)
    expect(result.current.isLoading).toBe(false)

    let response
    await act(async () => {
      response = await result.current.updateTransaction(ID, INPUT)
    })

    expect(response).toEqual({
      id: ID,
      ...INPUT,
      category: { id: INPUT.categoryId, title: 'Alimentação', color: '#2563EB' },
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('maps extensions.validationErrors straight to fieldErrors when present', async () => {
    const mocks = [
      {
        request: { query: UPDATE_TRANSACTION, variables: { id: ID, input: INPUT } },
        result: {
          errors: [{ message: 'Erro de validação' }],
          extensions: {
            validationErrors: [{ path: 'value', message: 'O valor deve ser positivo' }],
          },
        },
      },
    ]

    const { result } = renderUseUpdateTransaction(mocks)

    await act(async () => {
      await result.current.updateTransaction(ID, INPUT)
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
        request: { query: UPDATE_TRANSACTION, variables: { id: ID, input: INPUT } },
        error: new Error('Failed to fetch'),
      },
    ]

    const { result } = renderUseUpdateTransaction(mocks)

    await act(async () => {
      await result.current.updateTransaction(ID, INPUT)
    })

    await waitFor(() =>
      expect(result.current.formError).toBe(
        'Não foi possível atualizar a transação. Tente novamente.',
      ),
    )
    expect(result.current.fieldErrors).toEqual([])
  })
})
