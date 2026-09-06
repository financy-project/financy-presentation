import type { JSX } from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerFieldProps {
  id: string
  label: string
  value: Date | undefined
  onChange: (value: Date | undefined) => void
  errorMessage?: string
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR')

export function DatePickerField({
  id,
  label,
  value,
  onChange,
  errorMessage,
}: DatePickerFieldProps): JSX.Element {
  const [open, setOpen] = useState(false)

  return (
    <div className="grid gap-2" data-slot="date-picker-field">
      <Label htmlFor={id} className="text-gray-700">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-invalid={!!errorMessage}
            className={cn(
              'h-12 w-full justify-start text-base font-normal',
              !value && 'text-gray-400',
            )}
          >
            {value ? dateFormatter.format(value) : 'Selecione'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
      {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}
    </div>
  )
}
