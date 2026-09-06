import type { JSX } from 'react'

import { cn } from '@/lib/utils'
import { CATEGORY_ICON_OPTIONS } from '@/lib/category-visuals'

interface IconPickerProps {
  value: string
  onChange: (value: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps): JSX.Element {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_ICON_OPTIONS.map(({ name, icon: Icon }) => (
        <button
          key={name}
          type="button"
          aria-label={name}
          aria-pressed={value === name}
          onClick={() => onChange(name)}
          className={cn(
            'flex size-[42px] cursor-pointer items-center justify-center rounded-[8px] border',
            value === name
              ? 'border-primary bg-gray-100 text-primary'
              : 'border-gray-300 text-gray-800',
          )}
        >
          <Icon className="size-5" />
        </button>
      ))}
    </div>
  )
}
