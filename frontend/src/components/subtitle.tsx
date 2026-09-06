import type { JSX, ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface SubtitleProps {
  children: ReactNode
  className?: string
}

// Shared between PageHeader and DialogHeaderWithClose — both render a
// subtitle in the same gray-600 color, differing only in text size
// (merged in via className, e.g. text-base vs text-sm).
export function Subtitle({ children, className }: SubtitleProps): JSX.Element {
  return <p className={cn('text-gray-600', className)}>{children}</p>
}
