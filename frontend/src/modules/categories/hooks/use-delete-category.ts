import { useMutation } from '@apollo/client/react'
import { useState } from 'react'
import { LIST_CATEGORIES } from '@/modules/categories/graphql/queries'
import type { DeleteCategoryData } from '@/modules/categories/graphql/mutations'
import { DELETE_CATEGORY } from '@/modules/categories/graphql/mutations'

const FALLBACK_ERROR_MESSAGE = 'Não foi possível excluir a categoria. Tente novamente.'

export interface UseDeleteCategoryResult {
  deleteCategory: (id: string) => Promise<boolean>
  isLoading: boolean
  error: string | null
}

export function useDeleteCategory(): UseDeleteCategoryResult {
  const [mutate, { loading }] = useMutation<DeleteCategoryData, { id: string }>(DELETE_CATEGORY, {
    refetchQueries: [{ query: LIST_CATEGORIES }],
  })
  const [error, setError] = useState<string | null>(null)

  const deleteCategory = async (id: string) => {
    setError(null)

    try {
      const { data } = await mutate({ variables: { id } })
      return data?.deleteCategory ?? false
    } catch {
      setError(FALLBACK_ERROR_MESSAGE)
      return false
    }
  }

  return { deleteCategory, isLoading: loading, error }
}
