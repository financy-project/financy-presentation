import type { JSX } from 'react'

import { CircleArrowDown, CircleArrowUp } from 'lucide-react'
import { Tag } from '@/components/ui/tag'
import {
  CATEGORY_ICON_SQUARE_CLASSES,
  resolveCategoryColorName,
  resolveCategoryIcon,
} from '@/lib/category-visuals'
import { cn } from '@/lib/utils'
import type { DashboardRecentTransaction } from '@/modules/dashboard/graphql/queries'
import {
  formatDashboardTransactionDate,
  formatDashboardTransactionValue,
} from '@/modules/dashboard/utils/format-dashboard-transaction'

export interface DashboardTransactionRowProps {
  transaction: DashboardRecentTransaction
}

export function DashboardTransactionRow({ transaction }: DashboardTransactionRowProps): JSX.Element {
  const { category } = transaction
  const Icon = resolveCategoryIcon(category?.icon)
  const colorName = resolveCategoryColorName(category?.color)

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-[8px]',
            CATEGORY_ICON_SQUARE_CLASSES[colorName],
          )}
        >
          {/* Picking an existing icon reference from a fixed lookup table, not defining a new component. */}
          {/* oxlint-disable-next-line react/static-components */}
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-sm text-gray-800">{transaction.description}</p>
          <p className="text-sm text-gray-600">{formatDashboardTransactionDate(transaction.date)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 pl-6">
        {category ? (
          <Tag color={colorName}>{category.title}</Tag>
        ) : (
          <span className="text-sm text-gray-600">Sem categoria</span>
        )}
        <span className="text-sm text-gray-800">
          {formatDashboardTransactionValue(transaction.value, transaction.type)}
        </span>
        <span data-testid="dashboard-transaction-type-icon">
          {transaction.type === 'INCOME' ? (
            <CircleArrowUp className="size-4 text-green-dark" />
          ) : (
            <CircleArrowDown className="size-4 text-red-dark" />
          )}
        </span>
      </div>
    </div>
  )
}
