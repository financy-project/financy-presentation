import type { JSX } from 'react'

import { Search } from 'lucide-react'
import { TextInput } from '@/components/ui/text-input'

export interface TransactionSearchInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
}

// Debouncing before it reaches the listTransactions `description` variable
// is the container's job (e.g. TransactionFilters/TransactionsPage) — this
// component only renders the controlled field.
export function TransactionSearchInput({
  id = 'transaction-search',
  value,
  onChange,
}: TransactionSearchInputProps): JSX.Element {
  return (
    <TextInput
      id={id}
      label="Buscar"
      placeholder="Buscar por descrição"
      leftIcon={<Search />}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
