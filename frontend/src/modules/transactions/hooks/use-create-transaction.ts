import type { DocumentNode } from '@apollo/client'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { useMutation } from '@apollo/client/react'
import { useState } from 'react'
import type { RegisterFieldError } from '@/modules/auth/hooks/use-register-user'
import type { CreateTransactionData, CreateTransactionInput } from '@/modules/transactions/graphql/mutations'
import { CREATE_TRANSACTION } from '@/modules/transactions/graphql/mutations'
import { LIST_TRANSACTIONS } from '@/modules/transactions/graphql/queries'

const FALLBACK_ERROR_MESSAGE = 'Não foi possível criar a transação. Tente novamente.'

export interface UseCreateTransactionOptions {
  // Extra queries to refetch alongside LIST_TRANSACTIONS — e.g. the
  // dashboard's GET_DASHBOARD when this hook is used from a screen where
  // LIST_TRANSACTIONS isn't an active query. Apollo no-ops a refetchQueries
  // entry for a document with no active watcher, so this is safe to pass
  // even when the extra query isn't mounted.
  additionalRefetchQueries?: DocumentNode[]
}

export interface UseCreateTransactionResult {
  createTransaction: (
    input: CreateTransactionInput,
  ) => Promise<CreateTransactionData['createTransaction'] | null>
  isLoading: boolean
  fieldErrors: RegisterFieldError[]
  formError: string | null
}

export function useCreateTransaction(
  options?: UseCreateTransactionOptions,
): UseCreateTransactionResult {
  // Bare documents, not `{ query: ... }` — see the comment in
  // use-delete-transaction.ts for why the object form silently fails to
  // refresh the table.
  const [mutate, { loading }] = useMutation<CreateTransactionData, { input: CreateTransactionInput }>(
    CREATE_TRANSACTION,
    { refetchQueries: [LIST_TRANSACTIONS, ...(options?.additionalRefetchQueries ?? [])] },
  )
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldError[]>([])
  const [formError, setFormError] = useState<string | null>(null)

  const createTransaction = async (input: CreateTransactionInput) => {
    setFieldErrors([])
    setFormError(null)

    try {
      const { data } = await mutate({ variables: { input } })
      return data?.createTransaction ?? null
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

  return { createTransaction, isLoading: loading, fieldErrors, formError }
}
