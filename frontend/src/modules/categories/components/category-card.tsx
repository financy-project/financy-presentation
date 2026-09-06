import type { JSX } from 'react'

import { SquarePen, Trash } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { IconButton } from '@/components/ui/icon-button'
import { Tag } from '@/components/ui/tag'
import { CATEGORY_ICON_SQUARE_CLASSES, resolveCategoryColorName, resolveCategoryIcon } from '@/lib/category-visuals'
import { cn } from '@/lib/utils'
import type { Category } from '@/modules/categories/graphql/queries'

interface CategoryCardProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps): JSX.Element {
  const Icon = resolveCategoryIcon(category.icon)
  const colorName = resolveCategoryColorName(category.color)
  const itemsLabel =
    category.transactionsQuantity === 1 ? '1 item' : `${category.transactionsQuantity} itens`

  return (
    <Card data-testid="category-card" className="gap-5 border border-gray-200 p-6 ring-0">
      <div className="flex items-start justify-between">
        <div
          data-testid="category-card-icon"
          className={cn(
            'flex size-10 items-center justify-center rounded-[8px]',
            CATEGORY_ICON_SQUARE_CLASSES[colorName],
          )}
        >
          {/* Picking an existing icon reference from a fixed lookup table, not defining a new component. */}
          {/* oxlint-disable-next-line react/static-components */}
          <Icon className="size-4" />
        </div>
        <div className="flex gap-2">
          <IconButton
            variant="outline"
            size="icon"
            className="border-gray-300"
            icon={<Trash className="text-destructive" />}
            aria-label="Excluir"
            onClick={() => onDelete(category)}
          />
          <IconButton
            variant="outline"
            size="icon"
            className="border-gray-300"
            icon={<SquarePen className="text-gray-700" />}
            aria-label="Editar"
            onClick={() => onEdit(category)}
          />
        </div>
      </div>
      <div className="grid gap-1">
        <h3 className="text-base leading-6 font-semibold text-gray-800">{category.title}</h3>
        {category.description && (
          <p className="text-sm leading-5 text-gray-600">{category.description}</p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <Tag color={colorName}>{category.title}</Tag>
        <span className="text-sm leading-5 text-gray-600">{itemsLabel}</span>
      </div>
    </Card>
  )
}
