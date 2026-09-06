import type { JSX } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Mail } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { ErrorMessage } from '@/components/error-message'
import { Button } from '@/components/ui/button'
import { CheckboxField } from '@/components/ui/checkbox-field'
import { PasswordInput } from '@/components/ui/password-input'
import { TextInput } from '@/components/ui/text-input'
import { useLoginUser } from '@/modules/auth/hooks/use-login-user'
import { useAuthStore } from '@/modules/auth/stores/use-auth-store'

const REMEMBERED_EMAIL_KEY = 'financy:remembered-email'

const loginFormSchema = z.object({
  email: z.email('Informe um e-mail válido'),
  password: z.string().min(1, 'A senha é obrigatória'),
  rememberMe: z.boolean(),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

export function LoginForm(): JSX.Element {
  const navigate = useNavigate()
  const { loginUser, isLoading, fieldErrors, formError } = useLoginUser()
  const setUser = useAuthStore((state) => state.setUser)

  const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY)

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: rememberedEmail ?? '',
      password: '',
      rememberMe: !!rememberedEmail,
    },
  })

  useEffect(() => {
    for (const fieldError of fieldErrors) {
      setError(fieldError.path as keyof LoginFormValues, { message: fieldError.message })
    }
  }, [fieldErrors, setError])

  const onSubmit = async (values: LoginFormValues) => {
    const result = await loginUser({ email: values.email, password: values.password })
    if (result) {
      if (values.rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, values.email)
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY)
      }
      setUser(result)
      toast.success('Login realizado com sucesso!')
      navigate('/dashboard')
    }
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-4">
        <TextInput
          id="email"
          type="email"
          label="E-mail"
          placeholder="mail@exemplo.com"
          leftIcon={<Mail />}
          errorMessage={errors.email?.message}
          {...register('email')}
        />
        <PasswordInput
          id="password"
          label="Senha"
          placeholder="Digite sua senha"
          leftIcon={<Lock />}
          errorMessage={errors.password?.message}
          {...register('password')}
        />
      </div>
      <div className="flex items-center justify-between">
        <Controller
          control={control}
          name="rememberMe"
          render={({ field }) => (
            <CheckboxField
              id="rememberMe"
              label="Lembrar-me"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Button type="button" variant="link" disabled className="h-auto p-0 text-sm font-medium">
          Recuperar senha
        </Button>
      </div>
      <ErrorMessage error={formError} />
      <Button type="submit" size="xl" disabled={isLoading}>
        {isLoading ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  )
}
