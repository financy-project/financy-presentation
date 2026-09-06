import { useMutation } from '@apollo/client/react'
import { useState } from 'react'
import type { DeleteTransactionData } from '@/modules/transactions/graphql/mutations'
import { DELETE_TRANSACTION } from '@/modules/transactions/graphql/mutations'
import { LIST_TRANSACTIONS } from '@/modules/transactions/graphql/queries'

const FALLBACK_ERROR_MESSAGE = 'Não foi possível excluir a transação. Tente novamente.'

export interface UseDeleteTransactionResult {
  deleteTransaction: (id: string) => Promise<boolean>
  isLoading: boolean
  error: string | null
}

export function useDeleteTransaction(): UseDeleteTransactionResult {
  // A bare document (not `{ query: LIST_TRANSACTIONS }`) is required here:
  // Apollo only matches this against the *active* useListTransactions()
  // watcher (refetching it with its own current page/cursor variables)
  // when it's a plain document/operation-name string. The `{ query }`
  // object form takes Apollo's "legacy" path instead, which spins up a
  // brand new, disconnected query with no variables — writing to a
  // different cache entry than the one the table is actually watching, so
  // the table never sees the delete.
  const [mutate, { loading }] = useMutation<DeleteTransactionData, { id: string }>(
    DELETE_TRANSACTION,
    { refetchQueries: [LIST_TRANSACTIONS] },
  )
  const [error, setError] = useState<string | null>(null)

  const deleteTransaction = async (id: string) => {
    setError(null)

    try {
      const { data } = await mutate({ variables: { id } })
      return data?.deleteTransaction ?? false
    } catch {
      setError(FALLBACK_ERROR_MESSAGE)
      return false
    }
  }

  return { deleteTransaction, isLoading: loading, error }
}
