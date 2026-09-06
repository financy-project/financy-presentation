import type { JSX, ReactNode } from 'react'

import { ArrowUpDown, Tag as TagIcon } from 'lucide-react'
import { CardEyebrow } from '@/components/card-eyebrow'
import { Card } from '@/components/ui/card'
import type { TagColor } from '@/components/ui/tag'
import { resolveCategoryColorName, resolveCategoryIcon } from '@/lib/category-visuals'
import type { Category } from '@/modules/categories/graphql/queries'

export interface CategoriesSummaryProps {
  categories: Category[]
}

interface SummaryCardProps {
  icon: ReactNode
  iconClassName: string
  iconTestId: string
  value: string | number
  label: string
}

const iconTextClasses: Record<TagColor, string> = {
  blue: 'text-blue-base',
  purple: 'text-purple-base',
  pink: 'text-pink-base',
  red: 'text-red-base',
  orange: 'text-orange-base',
  yellow: 'text-yellow-base',
  green: 'text-green-base',
}

function SummaryCard({ icon, iconClassName, iconTestId, value, label }: SummaryCardProps): JSX.Element {
  return (
    <Card className="flex flex-row items-center gap-4 border border-gray-200 p-6 ring-0">
      <div className="flex size-8 items-center justify-center">
        <span data-testid={iconTestId} className={iconClassName}>
          {icon}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[28px] leading-8 font-bold text-gray-800">{value}</span>
        <CardEyebrow className="leading-4">{label}</CardEyebrow>
      </div>
    </Card>
  )
}

export function CategoriesSummary({ categories }: CategoriesSummaryProps): JSX.Element {
  const totalCategories = categories.length

  const totalTransactions = categories.reduce((sum, category) => sum + category.transactionsQuantity, 0)

  const mostUsedCategory = categories.reduce<Category | null>((max, category) =>
    category.transactionsQuantity > 0 &&
      (!max || category.transactionsQuantity > max.transactionsQuantity) ? category : max, null)

  const mostRecentCategory = categories.length > 0 ? categories[categories.length - 1] : null
  const highlightedCategory = mostUsedCategory ?? mostRecentCategory

  const highlightedLabel = mostUsedCategory ? 'Categoria mais utilizada' : 'Categoria mais recente'

  const HighlightedIcon = highlightedCategory ? resolveCategoryIcon(highlightedCategory.icon) : null

  const highlightedColorName = highlightedCategory
    ? resolveCategoryColorName(highlightedCategory.color)
    : null

  return (
    <div className="grid grid-cols-3 gap-6">
      <SummaryCard
        icon={<TagIcon className="size-6" />}
        iconClassName="text-gray-700"
        iconTestId="summary-card-total-categories-icon"
        value={totalCategories}
        label="Total de categorias"
      />
      <SummaryCard
        icon={<ArrowUpDown className="size-6" />}
        iconClassName="text-purple-base"
        iconTestId="summary-card-total-transactions-icon"
        value={totalTransactions}
        label="Total de transações"
      />

      {highlightedCategory && HighlightedIcon && highlightedColorName && (
        <SummaryCard
          // Picking an existing icon reference from a fixed lookup table, not defining a new component.
          // oxlint-disable-next-line react/static-components
          icon={<HighlightedIcon className="size-6" />}
          iconClassName={iconTextClasses[highlightedColorName]}
          iconTestId="summary-card-most-used-icon"
          value={highlightedCategory.title}
          label={highlightedLabel}
        />
      )}
    </div>
  )
}
