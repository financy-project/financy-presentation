import type { JSX } from 'react'

import { SquarePen, Trash } from 'lucide-react'
import { ErrorMessage } from '@/components/error-message'
import { TransactionTypeIndicator } from '@/components/transaction-type-indicator'
import { IconButton } from '@/components/ui/icon-button'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  CategoryIconSquare,
  TransactionCategoryCell,
} from '@/modules/transactions/components/transaction-category-cell'
import type { TransactionListItem } from '@/modules/transactions/graphql/queries'
import {
  formatTransactionDate,
  formatTransactionValue,
} from '@/modules/transactions/utils/format-transaction'

interface TransactionsTableProps {
  transactions: TransactionListItem[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  totalRecord: number
  pageSize: number
  className?: string
  onEdit: (transaction: TransactionListItem) => void
  onDelete: (transaction: TransactionListItem) => void
}

const HEADER_CELL_CLASS = 'px-6 py-5 text-xs font-medium tracking-wide text-gray-500'
const BODY_CELL_CLASS = 'px-6 py-5 text-sm text-gray-800'

interface TransactionRowPlaceholderProps {
  // "loading": visible pulsing skeleton, shown while a fetch is in flight.
  // "filler": same-sized but invisible row, used to pad a short page (e.g.
  // 1 result) out to `pageSize` rows so the table doesn't shrink.
  variant?: 'loading' | 'filler'
}

function TransactionRowSkeleton({ variant = 'loading' }: TransactionRowPlaceholderProps): JSX.Element {
  return (
    <TableRow
      className={cn('border-gray-200', variant === 'filler' && 'invisible border-transparent')}
      aria-hidden={variant === 'filler' ? true : undefined}
    >
      <TableCell className={BODY_CELL_CLASS}>
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 shrink-0 rounded-[8px]" />
          <Skeleton className="h-4 w-32" />
        </div>
      </TableCell>
      <TableCell className={BODY_CELL_CLASS}>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell className={BODY_CELL_CLASS}>
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 shrink-0 rounded-[8px]" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </TableCell>
      <TableCell className={BODY_CELL_CLASS}>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell className={BODY_CELL_CLASS}>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell className={BODY_CELL_CLASS}>
        <div className="flex gap-2">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
      </TableCell>
    </TableRow>
  )
}

export function TransactionsTable({
  transactions,
  isLoading,
  error,
  page,
  totalPages,
  onPageChange,
  totalRecord,
  pageSize,
  className,
  onEdit,
  onDelete,
}: TransactionsTableProps): JSX.Element {
  if (error) {
    return <ErrorMessage error={error} className={className} />
  }

  // Only the very first fetch (no rows yet to keep showing) falls back to
  // the plain empty state — every subsequent fetch (pagination) keeps the
  // previous rows'/totals' shell and swaps the body for skeleton rows below.
  if (!isLoading && transactions.length === 0) {
    return <p className={cn('text-gray-600', className)}>Nenhuma transação cadastrada ainda.</p>
  }

  // Nothing fetched yet on this first render — there's no previous total to
  // anchor a summary/pagination footer to, so it's left out until data lands.
  const showFooter = !(isLoading && transactions.length === 0)
  const firstItem = (page - 1) * pageSize + 1
  const lastItem = Math.min(page * pageSize, totalRecord)

  return (
    <div className={cn('overflow-hidden rounded-xl border border-gray-200 bg-white', className)}>
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200">
            <TableHead className={HEADER_CELL_CLASS}>Descrição</TableHead>
            <TableHead className={HEADER_CELL_CLASS}>Data</TableHead>
            <TableHead className={HEADER_CELL_CLASS}>Categoria</TableHead>
            <TableHead className={HEADER_CELL_CLASS}>Tipo</TableHead>
            <TableHead className={HEADER_CELL_CLASS}>Valor</TableHead>
            <TableHead className={HEADER_CELL_CLASS}>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody data-testid={isLoading ? 'transactions-skeleton' : undefined}>
          {isLoading
            ? Array.from({ length: pageSize }, (_, i) => <TransactionRowSkeleton key={i} />)
            : transactions.map((transaction) => (
                <TableRow key={transaction.id} className="border-gray-200">
                  <TableCell className={BODY_CELL_CLASS}>
                    <div className="flex items-center gap-3">
                      <CategoryIconSquare
                        category={transaction.category}
                        testId="transaction-description-icon"
                      />
                      {transaction.description}
                    </div>
                  </TableCell>
                  <TableCell className={cn(BODY_CELL_CLASS, 'text-gray-600')}>
                    {formatTransactionDate(transaction.date)}
                  </TableCell>
                  <TableCell className={BODY_CELL_CLASS}>
                    <TransactionCategoryCell category={transaction.category} />
                  </TableCell>
                  <TableCell className={BODY_CELL_CLASS}>
                    <TransactionTypeIndicator
                      type={transaction.type === 'INCOME' ? 'income' : 'expense'}
                    />
                  </TableCell>
                  <TableCell className={BODY_CELL_CLASS}>
                    {formatTransactionValue(transaction.value, transaction.type)}
                  </TableCell>
                  <TableCell className={BODY_CELL_CLASS}>
                    <div className="flex gap-2">
                      <IconButton
                        variant="outline"
                        size="icon"
                        className="border-gray-300"
                        icon={<Trash className="text-destructive" />}
                        aria-label="Excluir"
                        onClick={() => onDelete(transaction)}
                      />
                      <IconButton
                        variant="outline"
                        size="icon"
                        className="border-gray-300"
                        icon={<SquarePen className="text-gray-700" />}
                        aria-label="Editar"
                        onClick={() => onEdit(transaction)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          {!isLoading &&
            Array.from({ length: Math.max(0, pageSize - transactions.length) }, (_, i) => (
              <TransactionRowSkeleton key={`filler-${i}`} variant="filler" />
            ))}
        </TableBody>
      </Table>
      {showFooter && (
        <div className="flex items-center justify-between px-6 py-5">
          <p data-testid="transactions-summary" className="text-sm text-gray-700">
            {firstItem} a {lastItem} | {totalRecord} resultados
          </p>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            disabled={isLoading}
            className="gap-2"
          />
        </div>
      )}
    </div>
  )
}
