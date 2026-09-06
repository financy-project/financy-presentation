import type { DocumentNode } from '@apollo/client'
import type { JSX } from 'react'

import { toast } from 'sonner'
import { DialogHeaderWithClose } from '@/components/dialog-header-with-close'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { TransactionFormValues } from '@/modules/transactions/components/transaction-form'
import { TransactionForm } from '@/modules/transactions/components/transaction-form'
import { useCreateTransaction } from '@/modules/transactions/hooks/use-create-transaction'

interface NewTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Forwarded to useCreateTransaction — lets a caller outside the
  // transactions screen (e.g. the dashboard's RecentTransactionsCard) also
  // refetch its own query on success. See PM-023's plan.md.
  additionalRefetchQueries?: DocumentNode[]
}

export function NewTransactionDialog({
  open,
  onOpenChange,
  additionalRefetchQueries,
}: NewTransactionDialogProps): JSX.Element {
  const { createTransaction, isLoading, fieldErrors, formError } = useCreateTransaction({
    additionalRefetchQueries,
  })

  const handleSubmit = async (values: TransactionFormValues) => {
    const result = await createTransaction({
      type: values.type,
      description: values.description,
      date: values.date.toISOString(),
      value: Math.round(values.value * 100),
      categoryId: values.categoryId,
    })
    if (result) {
      toast.success('Transação criada com sucesso!')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="gap-6 rounded-xl p-6 sm:max-w-md">
        <DialogHeaderWithClose title="Nova transação" subtitle="Registre sua despesa ou receita" />
        <TransactionForm
          isLoading={isLoading}
          fieldErrors={fieldErrors}
          formError={formError}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
