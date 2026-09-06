import type { JSX } from 'react'

import { DashboardCategoriesCard } from '@/modules/dashboard/components/dashboard-categories-card'
import { RecentTransactionsCard } from '@/modules/dashboard/components/recent-transactions-card'

// Mirrors DashboardSummary's 3-column/gap-6 grid so the left item (2
// columns) lines up under "Saldo Total" + "Receitas do Mês" and the right
// item (1 column) lines up under "Despesas do Mês" — see PM-022 spec.
export function DashboardHighlights(): JSX.Element {
  return (
    <section className="mt-6 grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <RecentTransactionsCard />
      </div>
      <div className="col-span-1">
        <DashboardCategoriesCard />
      </div>
    </section>
  )
}
