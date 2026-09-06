import { MockedProvider } from '@apollo/client/testing/react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { DELETE_CATEGORY } from '@/modules/categories/graphql/mutations'
import { LIST_CATEGORIES } from '@/modules/categories/graphql/queries'
import { useDeleteCategory } from '@/modules/categories/hooks/use-delete-category'

const ID = '1'

function renderUseDeleteCategory(mocks: React.ComponentProps<typeof MockedProvider>['mocks']) {
  return renderHook(() => useDeleteCategory(), {
    wrapper: ({ children }) => createElement(MockedProvider, { mocks }, children),
  })
}

describe('useDeleteCategory', () => {
  it('resolves true and toggles isLoading on success', async () => {
    const mocks = [
      {
        request: { query: DELETE_CATEGORY, variables: { id: ID } },
        result: { data: { deleteCategory: true } },
      },
      {
        request: { query: LIST_CATEGORIES },
        result: { data: { listCategories: [] } },
      },
    ]

    const { result } = renderUseDeleteCategory(mocks)
    expect(result.current.isLoading).toBe(false)

    let response
    await act(async () => {
      response = await result.current.deleteCategory(ID)
    })

    expect(response).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBeNull()
  })

  it('sets the fallback error message on a network/unexpected error', async () => {
    const mocks = [
      {
        request: { query: DELETE_CATEGORY, variables: { id: ID } },
        error: new Error('Failed to fetch'),
      },
    ]

    const { result } = renderUseDeleteCategory(mocks)

    let response
    await act(async () => {
      response = await result.current.deleteCategory(ID)
    })

    expect(response).toBe(false)
    await waitFor(() =>
      expect(result.current.error).toBe('Não foi possível excluir a categoria. Tente novamente.'),
    )
  })
})
