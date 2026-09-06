import type { JSX } from 'react'

import { toast } from 'sonner'
import { DialogHeaderWithClose } from '@/components/dialog-header-with-close'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { CategoryFormValues } from '@/modules/categories/components/category-form'
import { CategoryForm } from '@/modules/categories/components/category-form'
import type { Category } from '@/modules/categories/graphql/queries'
import { useUpdateCategory } from '@/modules/categories/hooks/use-update-category'

interface EditCategoryDialogProps {
  category: Category | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditCategoryDialog({
  category,
  open,
  onOpenChange,
}: EditCategoryDialogProps): JSX.Element {
  const { updateCategory, isLoading, fieldErrors, formError } = useUpdateCategory()

  const handleSubmit = async (values: CategoryFormValues) => {
    if (!category)
      return

    const result = await updateCategory(category.id, values)
    if (result) {
      toast.success('Categoria atualizada com sucesso!')
      onOpenChange(false)
    }
  }

  if (!open || !category)
    return <></>

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="gap-6 rounded-xl p-6 sm:max-w-md">
        <DialogHeaderWithClose title="Editar categoria" subtitle="Atualize os dados da categoria" />
        <CategoryForm
          defaultValues={{
            title: category.title,
            description: category.description ?? '',
            icon: category.icon,
            color: category.color,
          }}
          isLoading={isLoading}
          fieldErrors={fieldErrors}
          formError={formError}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
