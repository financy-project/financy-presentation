import type { JSX } from 'react'

import { SelectField } from '@/components/ui/select-field'
import { useCategoriesStore } from '@/modules/transactions/stores/use-categories-store'

export interface CategorySelectProps {
  id?: string
  label?: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  errorMessage?: string
  // The transaction filters bar needs a "Todas" (no filter) option; the
  // transaction form's categoryId is required, so it omits this.
  resettable?: boolean
}

// Shared between the transactions filter bar and the create/edit
// transaction form: both read the same categories list from
// useCategoriesStore instead of each running its own listCategories query.
export function CategorySelect({
  id = 'category',
  label = 'Categoria',
  value,
  onValueChange,
  placeholder,
  errorMessage,
  resettable = false,
}: CategorySelectProps): JSX.Element {
  const categories = useCategoriesStore((state) => state.categories)
  const isLoading = useCategoriesStore((state) => state.isLoading)

  return (
    <SelectField
      id={id}
      label={label}
      value={value}
      onValueChange={onValueChange}
      options={categories.map((category) => ({ value: category.id, label: category.title }))}
      placeholder={placeholder}
      errorMessage={errorMessage}
      disabled={isLoading}
      resettable={resettable}
    />
  )
}
