import { MockedProvider } from '@apollo/client/testing/react'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { LIST_CATEGORIES_FOR_SELECT } from '@/modules/transactions/graphql/queries'
import { useSyncCategoriesForSelect } from '@/modules/transactions/hooks/use-sync-categories-for-select'
import { useCategoriesStore } from '@/modules/transactions/stores/use-categories-store'

const CATEGORIES = [
  { id: '1', title: 'Alimentação' },
  { id: '2', title: 'Mercado' },
]

function renderUseSyncCategoriesForSelect(mocks: React.ComponentProps<typeof MockedProvider>['mocks']) {
  return renderHook(() => useSyncCategoriesForSelect(), {
    wrapper: ({ children }) => createElement(MockedProvider, { mocks }, children),
  })
}

describe('useSyncCategoriesForSelect', () => {
  beforeEach(() => {
    useCategoriesStore.setState({ categories: [], isLoading: true, error: null })
  })

  it('syncs listCategories into useCategoriesStore on success', async () => {
    const mocks = [
      {
        request: { query: LIST_CATEGORIES_FOR_SELECT },
        result: { data: { listCategories: CATEGORIES } },
      },
    ]

    renderUseSyncCategoriesForSelect(mocks)

    await waitFor(() => expect(useCategoriesStore.getState().categories).toEqual(CATEGORIES))
    expect(useCategoriesStore.getState().isLoading).toBe(false)
    expect(useCategoriesStore.getState().error).toBeNull()
  })

  it('isLoading is true before the query resolves', () => {
    const mocks = [
      {
        request: { query: LIST_CATEGORIES_FOR_SELECT },
        result: { data: { listCategories: CATEGORIES } },
      },
    ]

    renderUseSyncCategoriesForSelect(mocks)

    expect(useCategoriesStore.getState().isLoading).toBe(true)
  })

  it('sets the fallback error message in the store on a network error', async () => {
    const mocks = [
      {
        request: { query: LIST_CATEGORIES_FOR_SELECT },
        error: new Error('Failed to fetch'),
      },
    ]

    renderUseSyncCategoriesForSelect(mocks)

    await waitFor(() =>
      expect(useCategoriesStore.getState().error).toBe('Não foi possível carregar as categorias.'),
    )
  })
})
