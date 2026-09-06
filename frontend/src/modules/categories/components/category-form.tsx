import type { JSX } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { ErrorMessage } from '@/components/error-message'
import { Button } from '@/components/ui/button'
import { TextInput } from '@/components/ui/text-input'
import { CATEGORY_COLOR_OPTIONS, CATEGORY_ICON_OPTIONS } from '@/lib/category-visuals'
import type { RegisterFieldError } from '@/modules/auth/hooks/use-register-user'
import { ColorPicker } from '@/modules/categories/components/color-picker'
import { IconPicker } from '@/modules/categories/components/icon-picker'

const categoryFormSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  description: z.string().optional(),
  icon: z.string().min(1, 'Selecione um ícone'),
  color: z.string().min(1, 'Selecione uma cor'),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>

interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormValues>
  isLoading: boolean
  fieldErrors: RegisterFieldError[]
  formError: string | null
  onSubmit: (values: CategoryFormValues) => void | Promise<void>
}

export function CategoryForm({
  defaultValues,
  isLoading,
  fieldErrors,
  formError,
  onSubmit,
}: CategoryFormProps): JSX.Element {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      title: '',
      description: '',
      icon: CATEGORY_ICON_OPTIONS[0].name,
      color: CATEGORY_COLOR_OPTIONS[0].value,
      ...defaultValues,
    },
  })

  useEffect(() => {
    for (const fieldError of fieldErrors) {
      setError(fieldError.path as keyof CategoryFormValues, { message: fieldError.message })
    }
  }, [fieldErrors, setError])

  return (
    <form
      className="grid gap-4"
      onSubmit={handleSubmit((values) => onSubmit(values))}
      noValidate
    >
      <TextInput
        id="title"
        label="Título"
        placeholder="Ex. Alimentação"
        errorMessage={errors.title?.message}
        {...register('title')}
      />
      <div className="grid gap-2">
        <TextInput
          id="description"
          label="Descrição"
          placeholder="Descrição da categoria"
          errorMessage={errors.description?.message}
          {...register('description')}
        />
        <p className="text-xs text-gray-500">Opcional</p>
      </div>
      <div className="grid gap-2">
        <span className="text-sm font-medium text-gray-700">Ícone</span>
        <Controller
          control={control}
          name="icon"
          render={({ field }) => <IconPicker value={field.value} onChange={field.onChange} />}
        />
      </div>
      <div className="grid gap-2">
        <span className="text-sm font-medium text-gray-700">Cor</span>
        <Controller
          control={control}
          name="color"
          render={({ field }) => <ColorPicker value={field.value} onChange={field.onChange} />}
        />
      </div>
      <ErrorMessage error={formError} />
      <Button type="submit" size="xl" className="w-full" disabled={isLoading}>
        {isLoading ? 'Salvando…' : 'Salvar'}
      </Button>
    </form>
  )
}
