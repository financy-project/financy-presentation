import { useQuery } from '@apollo/client/react'
import { useEffect } from 'react'
import type { ListCategoriesForSelectData } from '@/modules/transactions/graphql/queries'
import { LIST_CATEGORIES_FOR_SELECT } from '@/modules/transactions/graphql/queries'
import { useCategoriesStore } from '@/modules/transactions/stores/use-categories-store'

const FALLBACK_ERROR_MESSAGE = 'Não foi possível carregar as categorias.'

// Fetches the categories-for-select list once and syncs it into
// useCategoriesStore — called exactly once, from TransactionsPage. Every
// other consumer (CategorySelect, in the filter bar and TransactionForm)
// reads the store instead of running its own query.
export function useSyncCategoriesForSelect(): void {
  const { data, loading, error } = useQuery<ListCategoriesForSelectData>(LIST_CATEGORIES_FOR_SELECT)
  const setCategories = useCategoriesStore((state) => state.setCategories)
  const setLoading = useCategoriesStore((state) => state.setLoading)
  const setError = useCategoriesStore((state) => state.setError)

  useEffect(() => {
    setLoading(loading)
  }, [loading, setLoading])

  useEffect(() => {
    if (data) setCategories(data.listCategories)
  }, [data, setCategories])

  useEffect(() => {
    setError(error ? FALLBACK_ERROR_MESSAGE : null)
  }, [error, setError])
}
