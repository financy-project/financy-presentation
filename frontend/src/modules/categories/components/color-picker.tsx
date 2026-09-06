import type { JSX } from 'react'

import { cn } from '@/lib/utils'
import { CATEGORY_COLOR_OPTIONS } from '@/lib/category-visuals'

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps): JSX.Element {
  return (
    <div className="flex gap-2">
      {CATEGORY_COLOR_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-label={option.name}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'flex flex-1 cursor-pointer items-center justify-center rounded-[8px] border p-[5px]',
            value === option.value ? 'border-primary bg-gray-100' : 'border-gray-300',
          )}
        >
          <span className={cn('h-5 w-full rounded-[4px]', option.className)} />
        </button>
      ))}
    </div>
  )
}
