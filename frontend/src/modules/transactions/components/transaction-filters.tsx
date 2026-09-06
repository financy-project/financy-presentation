import type { JSX } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { CategorySelect } from '@/modules/transactions/components/category-select'
import { PeriodSelect } from '@/modules/transactions/components/period-select'
import { TransactionSearchInput } from '@/modules/transactions/components/transaction-search-input'
import { TransactionTypeSelect } from '@/modules/transactions/components/transaction-type-select'
import type { TransactionFilterValues } from '@/modules/transactions/hooks/use-list-transactions'
import { useCategoriesStore } from '@/modules/transactions/stores/use-categories-store'

export interface TransactionFiltersProps {
  value: TransactionFilterValues
  onChange: (next: TransactionFilterValues) => void
  className?: string
}

export function TransactionFilters({ value, onChange, className }: TransactionFiltersProps): JSX.Element {
  const categoriesError = useCategoriesStore((state) => state.error)

  return (
    <Card className={className}>
      <CardContent className="grid grid-cols-4 gap-4">
        <TransactionSearchInput
          value={value.description}
          onChange={(description) => onChange({ ...value, description })}
        />
        <TransactionTypeSelect
          value={value.type}
          onValueChange={(type) => onChange({ ...value, type })}
        />
        <CategorySelect
          value={value.categoryId}
          onValueChange={(categoryId) => onChange({ ...value, categoryId })}
          placeholder="Todas"
          resettable
          errorMessage={categoriesError ?? undefined}
        />
        <PeriodSelect
          value={value.period}
          onChange={(period) => onChange({ ...value, period })}
        />
      </CardContent>
    </Card>
  )
}
