import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { useMutation } from '@apollo/client/react'
import { useState } from 'react'
import type { RegisterFieldError } from '@/modules/auth/hooks/use-register-user'
import type { CreateCategoryData, CreateCategoryInput } from '@/modules/categories/graphql/mutations'
import { CREATE_CATEGORY } from '@/modules/categories/graphql/mutations'
import { LIST_CATEGORIES } from '@/modules/categories/graphql/queries'

const FALLBACK_ERROR_MESSAGE = 'Não foi possível criar a categoria. Tente novamente.'

export interface UseCreateCategoryResult {
  createCategory: (
    input: CreateCategoryInput,
  ) => Promise<CreateCategoryData['createCategory'] | null>
  isLoading: boolean
  fieldErrors: RegisterFieldError[]
  formError: string | null
}

export function useCreateCategory(): UseCreateCategoryResult {
  const [mutate, { loading }] = useMutation<CreateCategoryData, { input: CreateCategoryInput }>(
    CREATE_CATEGORY,
    { refetchQueries: [{ query: LIST_CATEGORIES }] },
  )
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldError[]>([])
  const [formError, setFormError] = useState<string | null>(null)

  const createCategory = async (input: CreateCategoryInput) => {
    setFieldErrors([])
    setFormError(null)

    try {
      const { data } = await mutate({ variables: { input } })
      return data?.createCategory ?? null
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

  return { createCategory, isLoading: loading, fieldErrors, formError }
}
