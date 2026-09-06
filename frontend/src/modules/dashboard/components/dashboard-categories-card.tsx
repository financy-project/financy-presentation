import type { JSX } from 'react'

import { ErrorMessage } from '@/components/error-message'
import { Card } from '@/components/ui/card'
import { Tag } from '@/components/ui/tag'
import { DashboardCardHeader } from '@/modules/dashboard/components/dashboard-card-header'
import { useGetDashboard } from '@/modules/dashboard/hooks/use-get-dashboard'
import { formatCurrencyValue } from '@/modules/dashboard/utils/format-currency-value'
import { resolveCategoryColorName } from '@/lib/category-visuals'

export function DashboardCategoriesCard(): JSX.Element {
  const { categories, isLoading, error } = useGetDashboard()

  return (
    <Card className="border border-gray-200 p-6 ring-0">
      <DashboardCardHeader title="Categorias" action={{ label: 'Gerenciar', to: '/categorias' }} />

      <div className="mt-4">
        <ErrorMessage error={error} />

        {!error && isLoading && <p className="text-sm text-gray-400">Carregando categorias…</p>}

        {!error && !isLoading && categories.length === 0 && (
          <p className="text-sm text-gray-600">Nenhuma categoria com movimentação neste mês.</p>
        )}

        {!error && !isLoading && categories.length > 0 && (
          <div className="flex flex-col gap-5">
            {categories.map((category) => (
              <div key={category.categoryId} className="flex items-center justify-between">
                <Tag color={resolveCategoryColorName(category.color)}>{category.title}</Tag>
                <span className="text-sm text-gray-600">{category.transactionCount} itens</span>
                <span className="text-sm font-semibold text-gray-800">
                  {formatCurrencyValue(Math.abs(category.totalValue))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
