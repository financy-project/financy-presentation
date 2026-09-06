import type { JSX } from 'react'

import { SelectField, type SelectFieldOption } from '@/components/ui/select-field'

export type TransactionTypeFilterValue = 'EXPENSE' | 'INCOME' | ''

export interface TransactionTypeSelectProps {
  id?: string
  label?: string
  value: TransactionTypeFilterValue
  onValueChange: (value: TransactionTypeFilterValue) => void
}

const TYPE_OPTIONS: SelectFieldOption[] = [
  { value: 'INCOME', label: 'Entrada' },
  { value: 'EXPENSE', label: 'Saída' },
]

// '' (the resettable "Todos" option) means "no type filter" — omit the
// `type` arg from listTransactions rather than sending it.
export function TransactionTypeSelect({
  id = 'transaction-type-filter',
  label = 'Tipo',
  value,
  onValueChange,
}: TransactionTypeSelectProps): JSX.Element {
  return (
    <SelectField
      id={id}
      label={label}
      value={value}
      onValueChange={(next) => onValueChange(next as TransactionTypeFilterValue)}
      options={TYPE_OPTIONS}
      placeholder="Todos"
      resettable
    />
  )
}
