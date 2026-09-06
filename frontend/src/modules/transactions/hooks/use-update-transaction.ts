import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { useMutation } from '@apollo/client/react'
import { useState } from 'react'
import type { RegisterFieldError } from '@/modules/auth/hooks/use-register-user'
import type { UpdateTransactionData, UpdateTransactionInput } from '@/modules/transactions/graphql/mutations'
import { UPDATE_TRANSACTION } from '@/modules/transactions/graphql/mutations'
import { LIST_TRANSACTIONS } from '@/modules/transactions/graphql/queries'

const FALLBACK_ERROR_MESSAGE = 'Não foi possível atualizar a transação. Tente novamente.'

export interface UseUpdateTransactionResult {
  updateTransaction: (
    id: string,
    input: UpdateTransactionInput,
  ) => Promise<UpdateTransactionData['updateTransaction'] | null>
  isLoading: boolean
  fieldErrors: RegisterFieldError[]
  formError: string | null
}

export function useUpdateTransaction(): UseUpdateTransactionResult {
  // Bare document, not `{ query: LIST_TRANSACTIONS }` — see the comment in
  // use-delete-transaction.ts for why the object form silently fails to
  // refresh the table.
  const [mutate, { loading }] = useMutation<
    UpdateTransactionData,
    { id: string; input: UpdateTransactionInput }
  >(UPDATE_TRANSACTION, { refetchQueries: [LIST_TRANSACTIONS] })
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldError[]>([])
  const [formError, setFormError] = useState<string | null>(null)

  const updateTransaction = async (id: string, input: UpdateTransactionInput) => {
    setFieldErrors([])
    setFormError(null)

    try {
      const { data } = await mutate({ variables: { id, input } })
      return data?.updateTransaction ?? null
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

  return { updateTransaction, isLoading: loading, fieldErrors, formError }
}
