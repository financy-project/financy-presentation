import type { JSX, ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface CardEyebrowProps {
  children: ReactNode
  className?: string
}

// Shared small uppercase label used above a card's value/title —
// SummaryCard, DashboardCardHeader, CategoriesSummary's inline
// SummaryCard.
export function CardEyebrow({ children, className }: CardEyebrowProps): JSX.Element {
  return (
    <span className={cn('text-xs font-medium tracking-wider text-gray-500 uppercase', className)}>
      {children}
    </span>
  )
}
