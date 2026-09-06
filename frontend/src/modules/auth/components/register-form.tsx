import type { JSX } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Mail, User } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { ErrorMessage } from '@/components/error-message'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { TextInput } from '@/components/ui/text-input'
import { useRegisterUser } from '@/modules/auth/hooks/use-register-user'

const registerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'O nome é obrigatório')
    .max(255, 'O nome deve ter no máximo 255 caracteres'),
  email: z.email('Informe um e-mail válido'),
  password: z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter ao menos uma letra maiúscula')
    .regex(/[0-9]/, 'A senha deve conter ao menos um número'),
})

type RegisterFormValues = z.infer<typeof registerFormSchema>

export function RegisterForm(): JSX.Element {
  const navigate = useNavigate()
  const { registerUser, isLoading, fieldErrors, formError } = useRegisterUser()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
  })

  useEffect(() => {
    for (const fieldError of fieldErrors) {
      setError(fieldError.path as keyof RegisterFormValues, { message: fieldError.message })
    }
  }, [fieldErrors, setError])

  useEffect(() => {
    if (formError) {
      toast.error(formError)
    }
  }, [formError])

  const onSubmit = async (values: RegisterFormValues) => {
    const result = await registerUser(values)
    if (result) {
      toast.success('Conta criada com sucesso! Faça login para continuar.')
      navigate('/login')
    }
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-4">
        <TextInput
          id="name"
          label="Nome completo"
          placeholder="Seu nome completo"
          leftIcon={<User />}
          errorMessage={errors.name?.message}
          {...register('name')}
        />
        <TextInput
          id="email"
          type="email"
          label="E-mail"
          placeholder="mail@exemplo.com"
          leftIcon={<Mail />}
          errorMessage={errors.email?.message}
          {...register('email')}
        />
        <div className="grid gap-2">
          <PasswordInput
            id="password"
            label="Senha"
            placeholder="Digite sua senha"
            leftIcon={<Lock />}
            errorMessage={errors.password?.message}
            {...register('password')}
          />
          {!errors.password && (
            <p className="text-muted-foreground text-xs">
              A senha deve ter no mínimo 8 caracteres
            </p>
          )}
        </div>
      </div>
      <ErrorMessage error={formError} />
      <Button type="submit" size="xl" disabled={isLoading}>
        {isLoading ? 'Criando conta…' : 'Cadastrar'}
      </Button>
    </form>
  )
}
