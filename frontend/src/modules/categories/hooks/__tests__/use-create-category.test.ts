import { MockedProvider } from '@apollo/client/testing/react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { CREATE_CATEGORY } from '@/modules/categories/graphql/mutations'
import { LIST_CATEGORIES } from '@/modules/categories/graphql/queries'
import { useCreateCategory } from '@/modules/categories/hooks/use-create-category'

const INPUT = { title: 'Alimentação', description: 'Gastos com comida', icon: 'Utensils', color: '#16A34A' }

function renderUseCreateCategory(mocks: React.ComponentProps<typeof MockedProvider>['mocks']) {
  return renderHook(() => useCreateCategory(), {
    wrapper: ({ children }) => createElement(MockedProvider, { mocks }, children),
  })
}

describe('useCreateCategory', () => {
  it('resolves with { id, title, description, icon, color } and toggles isLoading on success', async () => {
    const mocks = [
      {
        request: { query: CREATE_CATEGORY, variables: { input: INPUT } },
        result: {
          data: {
            createCategory: { id: '1', ...INPUT },
          },
        },
      },
      {
        request: { query: LIST_CATEGORIES },
        result: { data: { listCategories: [{ id: '1', ...INPUT, transactionsQuantity: 0 }] } },
      },
    ]

    const { result } = renderUseCreateCategory(mocks)
    expect(result.current.isLoading).toBe(false)

    let response
    await act(async () => {
      response = await result.current.createCategory(INPUT)
    })

    expect(response).toEqual({ id: '1', ...INPUT })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('maps extensions.validationErrors straight to fieldErrors when present', async () => {
    const mocks = [
      {
        request: { query: CREATE_CATEGORY, variables: { input: INPUT } },
        result: {
          errors: [{ message: 'Erro de validação' }],
          extensions: {
            validationErrors: [{ path: 'title', message: 'O título é obrigatório' }],
          },
        },
      },
    ]

    const { result } = renderUseCreateCategory(mocks)

    await act(async () => {
      await result.current.createCategory(INPUT)
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
        request: { query: CREATE_CATEGORY, variables: { input: INPUT } },
        error: new Error('Failed to fetch'),
      },
    ]

    const { result } = renderUseCreateCategory(mocks)

    await act(async () => {
      await result.current.createCategory(INPUT)
    })

    await waitFor(() =>
      expect(result.current.formError).toBe(
        'Não foi possível criar a categoria. Tente novamente.',
      ),
    )
    expect(result.current.fieldErrors).toEqual([])
  })
})
