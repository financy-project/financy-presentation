import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { useMutation } from '@apollo/client/react'
import { useState } from 'react'
import type { RegisterFieldError } from '@/modules/auth/hooks/use-register-user'
import { LIST_CATEGORIES } from '@/modules/categories/graphql/queries'
import type { UpdateCategoryData, UpdateCategoryInput } from '@/modules/categories/graphql/mutations'
import { UPDATE_CATEGORY } from '@/modules/categories/graphql/mutations'

const FALLBACK_ERROR_MESSAGE = 'Não foi possível atualizar a categoria. Tente novamente.'

export interface UseUpdateCategoryResult {
  updateCategory: (
    id: string,
    input: UpdateCategoryInput,
  ) => Promise<UpdateCategoryData['updateCategory'] | null>
  isLoading: boolean
  fieldErrors: RegisterFieldError[]
  formError: string | null
}

export function useUpdateCategory(): UseUpdateCategoryResult {
  const [mutate, { loading }] = useMutation<
    UpdateCategoryData,
    { id: string; input: UpdateCategoryInput }
  >(UPDATE_CATEGORY, { refetchQueries: [{ query: LIST_CATEGORIES }] })
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldError[]>([])
  const [formError, setFormError] = useState<string | null>(null)

  const updateCategory = async (id: string, input: UpdateCategoryInput) => {
    setFieldErrors([])
    setFormError(null)

    try {
      const { data } = await mutate({ variables: { id, input } })
      return data?.updateCategory ?? null
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        const validationErrors = error.extensions?.validationErrors as
          | RegisterFieldError[]
          | undefined

        if (validationErrors) {
          setFieldErrors(validationErrors)
        } else {
          setFormError(error.message)
        }
      } else {
        setFormError(FALLBACK_ERROR_MESSAGE)
      }

      return null
    }
  }

  return { updateCategory, isLoading: loading, fieldErrors, formError }
}
