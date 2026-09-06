import { MockedProvider } from '@apollo/client/testing/react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { UPDATE_CATEGORY } from '@/modules/categories/graphql/mutations'
import { LIST_CATEGORIES } from '@/modules/categories/graphql/queries'
import { useUpdateCategory } from '@/modules/categories/hooks/use-update-category'

const ID = '1'
const INPUT = { title: 'Alimentação', description: 'Gastos com comida', icon: 'Utensils', color: '#16A34A' }

function renderUseUpdateCategory(mocks: React.ComponentProps<typeof MockedProvider>['mocks']) {
  return renderHook(() => useUpdateCategory(), {
    wrapper: ({ children }) => createElement(MockedProvider, { mocks }, children),
  })
}

describe('useUpdateCategory', () => {
  it('resolves with the updated category and toggles isLoading on success', async () => {
    const mocks = [
      {
        request: { query: UPDATE_CATEGORY, variables: { id: ID, input: INPUT } },
        result: {
          data: {
            updateCategory: { id: ID, ...INPUT, transactionsQuantity: 3 },
          },
        },
      },
      {
        request: { query: LIST_CATEGORIES },
        result: { data: { listCategories: [{ id: ID, ...INPUT, transactionsQuantity: 3 }] } },
      },
    ]

    const { result } = renderUseUpdateCategory(mocks)
    expect(result.current.isLoading).toBe(false)

    let response
    await act(async () => {
      response = await result.current.updateCategory(ID, INPUT)
    })

    expect(response).toEqual({ id: ID, ...INPUT, transactionsQuantity: 3 })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('maps extensions.validationErrors straight to fieldErrors when present', async () => {
    const mocks = [
      {
        request: { query: UPDATE_CATEGORY, variables: { id: ID, input: INPUT } },
        result: {
          errors: [{ message: 'Erro de validação' }],
          extensions: {
            validationErrors: [{ path: 'title', message: 'O título é obrigatório' }],
          },
        },
      },
    ]

    const { result } = renderUseUpdateCategory(mocks)

    await act(async () => {
      await result.current.updateCategory(ID, INPUT)
    })

    await waitFor(() =>
      expect(result.current.fieldErrors).toEqual([
        { path: 'title', message: 'O título é obrigatório' },
      ]),
    )
    expect(result.current.formError).toBeNull()
  })

  it('sets formError to a fallback message on a network/unexpected error', async () => {
    const mocks = [
      {
        request: { query: UPDATE_CATEGORY, variables: { id: ID, input: INPUT } },
        error: new Error('Failed to fetch'),
      },
    ]

    const { result } = renderUseUpdateCategory(mocks)

    await act(async () => {
      await result.current.updateCategory(ID, INPUT)
    })

    await waitFor(() =>
      expect(result.current.formError).toBe(
        'Não foi possível atualizar a categoria. Tente novamente.',
      ),
    )
    expect(result.current.fieldErrors).toEqual([])
  })
})
