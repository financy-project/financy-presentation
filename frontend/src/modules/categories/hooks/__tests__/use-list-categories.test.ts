import { MockedProvider } from '@apollo/client/testing/react'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { LIST_CATEGORIES } from '@/modules/categories/graphql/queries'
import { useListCategories } from '@/modules/categories/hooks/use-list-categories'

const CATEGORIES = [
  {
    id: '1',
    title: 'Alimentação',
    description: 'Restaurantes e mercado',
    icon: 'Utensils',
    color: '#2563EB',
    transactionsQuantity: 12,
  },
]

function renderUseListCategories(mocks: React.ComponentProps<typeof MockedProvider>['mocks']) {
  return renderHook(() => useListCategories(), {
    wrapper: ({ children }) => createElement(MockedProvider, { mocks }, children),
  })
}

describe('useListCategories', () => {
  it('resolves with the mocked category list', async () => {
    const mocks = [
      {
        request: { query: LIST_CATEGORIES },
        result: { data: { listCategories: CATEGORIES } },
      },
    ]

    const { result } = renderUseListCategories(mocks)

    await waitFor(() => expect(result.current.categories).toEqual(CATEGORIES))
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('categories is [] before the query resolves', () => {
    const mocks = [
      {
        request: { query: LIST_CATEGORIES },
        result: { data: { listCategories: CATEGORIES } },
      },
    ]

    const { result } = renderUseListCategories(mocks)

    expect(result.current.categories).toEqual([])
    expect(result.current.isLoading).toBe(true)
  })

  it('sets the fallback error message on a network error', async () => {
    const mocks = [
      {
        request: { query: LIST_CATEGORIES },
        error: new Error('Failed to fetch'),
      },
    ]

    const { result } = renderUseListCategories(mocks)

    await waitFor(() =>
      expect(result.current.error).toBe('Não foi possível carregar as categorias.'),
    )
    expect(result.current.categories).toEqual([])
  })
})
