import type { JSX, KeyboardEvent } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CurrencyInputProps {
  id: string
  label: string
  value: number // reais, e.g. 1.5 for R$ 1,50
  onChange: (value: number) => void
  errorMessage?: string
}

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function valueToCents(value: number): string {
  return String(Math.round(value * 100))
}

function centsToValue(cents: string): number {
  return cents === '' ? 0 : Number(cents) / 100
}

export function CurrencyInput({
  id,
  label,
  value,
  onChange,
  errorMessage,
}: CurrencyInputProps): JSX.Element {
  const cents = valueToCents(value)

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return

    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault()
      onChange(centsToValue(cents === '0' ? event.key : cents + event.key))
      return
    }

    if (event.key === 'Backspace') {
      event.preventDefault()
      onChange(centsToValue(cents.slice(0, -1)))
      return
    }

    // Block any other printable character (letters, punctuation, etc.) —
    // navigation/control keys (Tab, Arrow*, Enter, ...) have key.length > 1
    // and pass through untouched.
    if (event.key.length === 1) {
      event.preventDefault()
    }
  }

  return (
    <div className="grid gap-2" data-slot="currency-input">
      <Label htmlFor={id} className="text-gray-700">
        {label}
      </Label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 my-auto flex items-center text-base font-medium">
          R$
        </span>
        <Input
          id={id}
          inputMode="numeric"
          aria-invalid={!!errorMessage}
          className="h-12 pl-10 text-base md:text-base"
          value={numberFormatter.format(centsToValue(cents))}
          onKeyDown={handleKeyDown}
          onChange={() => { }}
        />
      </div>
      {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}
    </div>
  )
}
