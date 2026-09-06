import { useQuery } from '@apollo/client/react'
import type { Category, ListCategoriesData } from '@/modules/categories/graphql/queries'
import { LIST_CATEGORIES } from '@/modules/categories/graphql/queries'

const FALLBACK_ERROR_MESSAGE = 'Não foi possível carregar as categorias.'

export interface UseListCategoriesResult {
  categories: Category[]
  isLoading: boolean
  error: string | null
}

export function useListCategories(): UseListCategoriesResult {
  const { data, loading, error } = useQuery<ListCategoriesData>(LIST_CATEGORIES)

  return {
    categories: data?.listCategories ?? [],
    isLoading: loading,
    error: error ? FALLBACK_ERROR_MESSAGE : null,
  }
}
