import type { JSX } from 'react'

import { ErrorMessage } from '@/components/error-message'
import { Header } from '@/components/header'
import { DashboardHighlights } from '@/modules/dashboard/components/dashboard-highlights'
import { DashboardSummary } from '@/modules/dashboard/components/dashboard-summary'
import { useGetDashboard } from '@/modules/dashboard/hooks/use-get-dashboard'

export function DashboardPage(): JSX.Element {
  const { movement, isLoading, error } = useGetDashboard()

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1280px] p-12">
        {isLoading && <p className="text-gray-600">Carregando resumo…</p>}
        <ErrorMessage error={error} />

        {!isLoading && !error && movement && <DashboardSummary movement={movement} />}
        <DashboardHighlights />
      </main>
    </>
  )
}
