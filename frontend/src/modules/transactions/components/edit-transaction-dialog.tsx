import type { JSX } from 'react'

import { toast } from 'sonner'
import { DialogHeaderWithClose } from '@/components/dialog-header-with-close'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { TransactionFormValues } from '@/modules/transactions/components/transaction-form'
import { TransactionForm } from '@/modules/transactions/components/transaction-form'
import type { TransactionListItem } from '@/modules/transactions/graphql/queries'
import { useUpdateTransaction } from '@/modules/transactions/hooks/use-update-transaction'

interface EditTransactionDialogProps {
  transaction: TransactionListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
}: EditTransactionDialogProps): JSX.Element {
  const { updateTransaction, isLoading, fieldErrors, formError } = useUpdateTransaction()

  const handleSubmit = async (values: TransactionFormValues) => {
    if (!transaction)
      return

    const result = await updateTransaction(transaction.id, {
      type: values.type,
      description: values.description,
      date: values.date.toISOString(),
      value: Math.round(values.value * 100),
      categoryId: values.categoryId,
    })
    if (result) {
      toast.success('Transação atualizada com sucesso!')
      onOpenChange(false)
    }
  }

  if (!open || !transaction)
    return <></>

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="gap-6 rounded-xl p-6 sm:max-w-md">
        <DialogHeaderWithClose title="Editar transação" subtitle="Atualize os dados da transação" />
        <TransactionForm
          defaultValues={{
            type: transaction.type,
            description: transaction.description,
            date: new Date(transaction.date),
            value: transaction.value / 100,
            categoryId: transaction.category?.id ?? '',
          }}
          isLoading={isLoading}
          fieldErrors={fieldErrors}
          formError={formError}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
