import type { JSX } from 'react'

import { useState } from 'react'
import { ErrorMessage } from '@/components/error-message'
import { Header } from '@/components/header'
import { PageHeader } from '@/components/page-header'
import { CategoriesSummary } from '@/modules/categories/components/categories-summary'
import { CategoryCard } from '@/modules/categories/components/category-card'
import { DeleteCategoryAlert } from '@/modules/categories/components/delete-category-alert'
import { EditCategoryDialog } from '@/modules/categories/components/edit-category-dialog'
import { NewCategoryDialog } from '@/modules/categories/components/new-category-dialog'
import type { Category } from '@/modules/categories/graphql/queries'
import { useListCategories } from '@/modules/categories/hooks/use-list-categories'

export function CategoriesPage(): JSX.Element {
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const { categories, isLoading, error } = useListCategories()

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1280px] p-12">
        <PageHeader
          title="Categorias"
          subtitle="Organize suas transações por categorias"
          actionLabel="Nova categoria"
          onAction={() => setNewDialogOpen(true)}
        />
        {isLoading && <p className="mt-6 text-gray-600">Carregando categorias…</p>}
        <ErrorMessage error={error} className="mt-6" />

        {!isLoading && !error && !!categories.length && (
          <div className="mt-6">
            <CategoriesSummary categories={categories} />
          </div>
        )}

        {!isLoading && !error && categories.length === 0 && (
          <p className="mt-6 text-gray-600">Nenhuma categoria cadastrada ainda.</p>
        )}

        {!isLoading && !error && categories.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={setEditingCategory}
                onDelete={setDeletingCategory}
              />
            ))}
          </div>
        )}
      </main>
      <NewCategoryDialog open={newDialogOpen} onOpenChange={setNewDialogOpen} />

      <EditCategoryDialog
        category={editingCategory}
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      />

      <DeleteCategoryAlert
        category={deletingCategory}
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      />
    </>
  )
}
