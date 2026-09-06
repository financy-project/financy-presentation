import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { useMutation } from '@apollo/client/react'
import { useState } from 'react'
import type { LoginData, LoginInput } from '@/modules/auth/graphql/mutations'
import { LOGIN } from '@/modules/auth/graphql/mutations'
import type { RegisterFieldError } from '@/modules/auth/hooks/use-register-user'

const FALLBACK_ERROR_MESSAGE =
  'Não foi possível entrar. Verifique suas credenciais e tente novamente.'

export interface UseLoginUserResult {
  loginUser: (input: LoginInput) => Promise<LoginData['login'] | null>
  isLoading: boolean
  fieldErrors: RegisterFieldError[]
  formError: string | null
}

export function useLoginUser(): UseLoginUserResult {
  const [mutate, { loading }] = useMutation<LoginData, { input: LoginInput }>(LOGIN)
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldError[]>([])
  const [formError, setFormError] = useState<string | null>(null)

  const loginUser = async (input: LoginInput) => {
    setFieldErrors([])
    setFormError(null)

    try {
      const { data } = await mutate({ variables: { input } })
      return data?.login ?? null
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

  return { loginUser, isLoading: loading, fieldErrors, formError }
}
