import type { JSX } from 'react'

import type { DashboardMovement } from '@/modules/dashboard/graphql/queries'
import { SummaryCard } from '@/modules/dashboard/components/summary-card'

export type DashboardSummaryProps = {
  movement: DashboardMovement
}

export function DashboardSummary({ movement }: DashboardSummaryProps): JSX.Element {
  return (
    <div className="grid grid-cols-3 gap-6">
      <SummaryCard mode="balance" title="Saldo Total" value={movement.totalBalance} />
      <SummaryCard mode="income" title="Receitas do Mês" value={movement.income} />
      <SummaryCard mode="expense" title="Despesas do Mês" value={movement.expense} />
    </div>
  )
}
