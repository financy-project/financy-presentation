import type { JSX } from 'react'

import { CircleArrowDown, CircleArrowUp, Wallet } from 'lucide-react'
import { CardEyebrow } from '@/components/card-eyebrow'
import { Card } from '@/components/ui/card'
import { formatCurrencyValue } from '@/modules/dashboard/utils/format-currency-value'

export type SummaryCardMode = 'income' | 'expense' | 'balance'

export type SummaryCardProps = {
  mode: SummaryCardMode
  title: string
  value: number
}

const modeConfig: Record<SummaryCardMode, { icon: typeof Wallet; className: string }> = {
  balance: { icon: Wallet, className: 'text-purple-base' },
  income: { icon: CircleArrowUp, className: 'text-green-dark' },
  expense: { icon: CircleArrowDown, className: 'text-red-dark' },
}

export function SummaryCard({ mode, title, value }: SummaryCardProps): JSX.Element {
  const { icon: Icon, className } = modeConfig[mode]

  return (
    <Card className="border border-gray-200 p-6 ring-0">
      <div className="flex items-center gap-2">
        <span data-testid={`summary-card-${mode}-icon`} className={className}>
          <Icon className="size-4" />
        </span>
        <CardEyebrow>{title}</CardEyebrow>
      </div>
      <span className="mt-2 text-2xl font-bold text-gray-800">{formatCurrencyValue(value)}</span>
    </Card>
  )
}
