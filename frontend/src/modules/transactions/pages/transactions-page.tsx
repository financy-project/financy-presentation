import type { JSX } from 'react'

import { useState } from 'react'
import { Header } from '@/components/header'
import { PageHeader } from '@/components/page-header'
import { DeleteTransactionAlert } from '@/modules/transactions/components/delete-transaction-alert'
import { EditTransactionDialog } from '@/modules/transactions/components/edit-transaction-dialog'
import { NewTransactionDialog } from '@/modules/transactions/components/new-transaction-dialog'
import { TransactionFilters } from '@/modules/transactions/components/transaction-filters'
import { TransactionsTable } from '@/modules/transactions/components/transactions-table'
import type { TransactionListItem } from '@/modules/transactions/graphql/queries'
import type { TransactionFilterValues } from '@/modules/transactions/hooks/use-list-transactions'
import { useListTransactions } from '@/modules/transactions/hooks/use-list-transactions'
import { useSyncCategoriesForSelect } from '@/modules/transactions/hooks/use-sync-categories-for-select'

function currentPeriod(): TransactionFilterValues['period'] {
  const now = new Date()
  return { month: now.getMonth() + 1, year: now.getFullYear() }
}

export function TransactionsPage(): JSX.Element {
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<TransactionListItem | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<TransactionListItem | null>(null)
  const [filters, setFilters] = useState<TransactionFilterValues>(() => ({
    description: '',
    type: '',
    categoryId: '',
    period: currentPeriod(),
  }))

  useSyncCategoriesForSelect()

  const { transactions, isLoading, error, page, totalPages, totalRecord, pageSize, goToPage } =
    useListTransactions(filters)

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1280px] p-12">
        <PageHeader
          title="Transações"
          subtitle="Gerencie todas as suas transações financeiras"
          actionLabel="Nova transação"
          onAction={() => setNewDialogOpen(true)}
        />
        <TransactionFilters value={filters} onChange={setFilters} className="mt-6" />
        <TransactionsTable
          transactions={transactions}
          isLoading={isLoading}
          error={error}
          page={page}
          totalPages={totalPages}
          onPageChange={goToPage}
          totalRecord={totalRecord}
          pageSize={pageSize}
          className="mt-6"
          onEdit={setEditingTransaction}
          onDelete={setDeletingTransaction}
        />
      </main>
      <NewTransactionDialog open={newDialogOpen} onOpenChange={setNewDialogOpen} />

      <EditTransactionDialog
        transaction={editingTransaction}
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
      />

      <DeleteTransactionAlert
        transaction={deletingTransaction}
        open={!!deletingTransaction}
        onOpenChange={(open) => !open && setDeletingTransaction(null)}
      />
    </>
  )
}
