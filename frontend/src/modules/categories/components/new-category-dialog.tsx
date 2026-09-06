import type { JSX } from 'react'

import { toast } from 'sonner'
import { DialogHeaderWithClose } from '@/components/dialog-header-with-close'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { CategoryFormValues } from '@/modules/categories/components/category-form'
import { CategoryForm } from '@/modules/categories/components/category-form'
import { useCreateCategory } from '@/modules/categories/hooks/use-create-category'

interface NewCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewCategoryDialog({ open, onOpenChange }: NewCategoryDialogProps): JSX.Element {
  const { createCategory, isLoading, fieldErrors, formError } = useCreateCategory()

  const handleSubmit = async (values: CategoryFormValues) => {
    const result = await createCategory(values)
    if (result) {
      toast.success('Categoria criada com sucesso!')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="gap-6 rounded-xl p-6 sm:max-w-md">
        <DialogHeaderWithClose
          title="Nova categoria"
          subtitle="Organize suas transações com categorias"
        />
        <CategoryForm
          isLoading={isLoading}
          fieldErrors={fieldErrors}
          formError={formError}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
