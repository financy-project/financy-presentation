import type { JSX } from 'react'

import { Tag } from '@/components/ui/tag'
import {
  CATEGORY_ICON_SQUARE_CLASSES,
  resolveCategoryColorName,
  resolveCategoryIcon,
} from '@/lib/category-visuals'
import { cn } from '@/lib/utils'
import type { TransactionListItem } from '@/modules/transactions/graphql/queries'

interface CategoryIconSquareProps {
  category: TransactionListItem['category']
  className?: string
  testId?: string
}

export function CategoryIconSquare({
  category,
  className,
  testId = 'transaction-category-icon',
}: CategoryIconSquareProps): JSX.Element {
  const Icon = resolveCategoryIcon(category?.icon)
  const colorName = resolveCategoryColorName(category?.color)

  return (
    <div
      data-testid={testId}
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-[8px]',
        CATEGORY_ICON_SQUARE_CLASSES[colorName],
        className,
      )}
    >
      {/* Picking an existing icon reference from a fixed lookup table, not defining a new component. */}
      {/* oxlint-disable-next-line react/static-components */}
      <Icon className="size-4" />
    </div>
  )
}

interface TransactionCategoryCellProps {
  category: TransactionListItem['category']
}

export function TransactionCategoryCell({ category }: TransactionCategoryCellProps): JSX.Element {
  const colorName = resolveCategoryColorName(category?.color)

  return (
    <div className="flex items-center gap-3">
      <CategoryIconSquare category={category} />
      {category ? (
        <Tag color={colorName}>{category.title}</Tag>
      ) : (
        <span className="text-sm text-gray-600">Sem categoria</span>
      )}
    </div>
  )
}
