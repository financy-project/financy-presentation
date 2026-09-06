import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { useMutation } from '@apollo/client/react'
import { useState } from 'react'
import type { RegisterUserData, RegisterUserInput } from '@/modules/auth/graphql/mutations'
import { REGISTER_USER } from '@/modules/auth/graphql/mutations'

const FALLBACK_ERROR_MESSAGE = 'Não foi possível criar a conta. Tente novamente.'

export interface RegisterFieldError {
  path: string
  message: string
}

export interface UseRegisterUserResult {
  registerUser: (input: RegisterUserInput) => Promise<RegisterUserData['registerUser'] | null>
  isLoading: boolean
  fieldErrors: RegisterFieldError[]
  formError: string | null
}

export function useRegisterUser(): UseRegisterUserResult {
  const [mutate, { loading }] = useMutation<RegisterUserData, { input: RegisterUserInput }>(
    REGISTER_USER,
  )
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldError[]>([])
  const [formError, setFormError] = useState<string | null>(null)

  const registerUser = async (input: RegisterUserInput) => {
    setFieldErrors([])
    setFormError(null)

    try {
      const { data } = await mutate({ variables: { input } })
      return data?.registerUser ?? null
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

  return { registerUser, isLoading: loading, fieldErrors, formError }
}
