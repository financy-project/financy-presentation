import type { JSX, MouseEvent } from 'react'

import { toast } from 'sonner'
import { ErrorMessage } from '@/components/error-message'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { TransactionListItem } from '@/modules/transactions/graphql/queries'
import { useDeleteTransaction } from '@/modules/transactions/hooks/use-delete-transaction'

interface DeleteTransactionAlertProps {
  transaction: TransactionListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteTransactionAlert({
  transaction,
  open,
  onOpenChange,
}: DeleteTransactionAlertProps): JSX.Element {
  const { deleteTransaction, isLoading, error } = useDeleteTransaction()

  const handleDelete = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    if (!transaction)
      return

    const result = await deleteTransaction(transaction.id)
    if (result) {
      toast.success('Transação excluída com sucesso!')
      onOpenChange(false)
    }
  }

  if (!open || !transaction)
    return <></>

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir transação</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir esta transação? Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ErrorMessage error={error} />
        <AlertDialogFooter>
          <AlertDialogCancel>Não</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isLoading} onClick={handleDelete}>
            {isLoading ? 'Excluindo…' : 'Sim'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
