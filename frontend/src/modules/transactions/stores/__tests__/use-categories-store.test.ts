import { beforeEach, describe, expect, it } from 'vitest'
import { useCategoriesStore } from '@/modules/transactions/stores/use-categories-store'

describe('useCategoriesStore', () => {
  beforeEach(() => {
    useCategoriesStore.setState({ categories: [], isLoading: true, error: null })
  })

  it('starts empty and loading, with no error', () => {
    const state = useCategoriesStore.getState()

    expect(state.categories).toEqual([])
    expect(state.isLoading).toBe(true)
    expect(state.error).toBeNull()
  })

  it('setCategories replaces the category list', () => {
    const categories = [
      { id: '1', title: 'Alimentação' },
      { id: '2', title: 'Mercado' },
    ]

    useCategoriesStore.getState().setCategories(categories)

    expect(useCategoriesStore.getState().categories).toEqual(categories)
  })

  it('setLoading toggles the loading flag', () => {
    useCategoriesStore.getState().setLoading(false)

    expect(useCategoriesStore.getState().isLoading).toBe(false)
  })

  it('setError sets and clears the error message', () => {
    useCategoriesStore.getState().setError('Não foi possível carregar as categorias.')
    expect(useCategoriesStore.getState().error).toBe('Não foi possível carregar as categorias.')

    useCategoriesStore.getState().setError(null)
    expect(useCategoriesStore.getState().error).toBeNull()
  })
})
