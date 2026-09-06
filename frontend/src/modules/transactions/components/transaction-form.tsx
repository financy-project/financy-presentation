import type { JSX } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { CircleArrowDown, CircleArrowUp } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { ErrorMessage } from '@/components/error-message'
import { Button } from '@/components/ui/button'
import { TextInput } from '@/components/ui/text-input'
import { cn } from '@/lib/utils'
import type { RegisterFieldError } from '@/modules/auth/hooks/use-register-user'
import { CategorySelect } from '@/modules/transactions/components/category-select'
import { CurrencyInput } from '@/modules/transactions/components/currency-input'
import { DatePickerField } from '@/modules/transactions/components/date-picker-field'

const transactionFormSchema = z.object({
  type: z.enum(['EXPENSE', 'INCOME']),
  description: z.string().min(1, 'A descrição é obrigatória'),
  date: z.date({ error: 'Selecione uma data' }),
  value: z.number().positive('O valor deve ser maior que zero'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
})

export type TransactionFormValues = z.infer<typeof transactionFormSchema>

const TYPE_OPTIONS = [
  { value: 'EXPENSE' as const, label: 'Despesa', icon: CircleArrowDown, selectedClass: 'border-destructive text-destructive' },
  { value: 'INCOME' as const, label: 'Receita', icon: CircleArrowUp, selectedClass: 'border-success text-success' },
]

interface TransactionFormProps {
  defaultValues?: Partial<TransactionFormValues>
  isLoading: boolean
  fieldErrors: RegisterFieldError[]
  formError: string | null
  onSubmit: (values: TransactionFormValues) => void | Promise<void>
}

export function TransactionForm({
  defaultValues,
  isLoading,
  fieldErrors,
  formError,
  onSubmit,
}: TransactionFormProps): JSX.Element {
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: 'EXPENSE',
      description: '',
      date: undefined,
      value: 0,
      categoryId: '',
      ...defaultValues,
    },
  })

  useEffect(() => {
    for (const fieldError of fieldErrors) {
      setError(fieldError.path as keyof TransactionFormValues, { message: fieldError.message })
    }
  }, [fieldErrors, setError])

  return (
    <form className="grid gap-4" onSubmit={handleSubmit((values) => onSubmit(values))} noValidate>
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <div className="grid grid-cols-2 gap-3">
            {TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={field.value === option.value}
                onClick={() => field.onChange(option.value)}
                className={cn(
                  'flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium',
                  field.value === option.value ? option.selectedClass : 'border-gray-300 text-gray-600',
                )}
              >
                <option.icon className="size-4" />
                {option.label}
              </button>
            ))}
          </div>
        )}
      />

      <TextInput
        id="description"
        label="Descrição"
        placeholder="Ex. Almoço no restaurante"
        errorMessage={errors.description?.message}
        {...register('description')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <DatePickerField
              id="date"
              label="Data"
              value={field.value}
              onChange={field.onChange}
              errorMessage={errors.date?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="value"
          render={({ field }) => (
            <CurrencyInput
              id="value"
              label="Valor"
              value={field.value}
              onChange={field.onChange}
              errorMessage={errors.value?.message}
            />
          )}
        />
      </div>

      <Controller
        control={control}
        name="categoryId"
        render={({ field }) => (
          <CategorySelect
            id="categoryId"
            label="Categoria"
            value={field.value}
            onValueChange={field.onChange}
            errorMessage={errors.categoryId?.message}
            resettable
          />
        )}
      />

      <ErrorMessage error={formError} />

      <Button type="submit" size="xl" className="w-full" disabled={isLoading}>
        {isLoading ? 'Salvando…' : 'Salvar'}
      </Button>
    </form>
  )
}
