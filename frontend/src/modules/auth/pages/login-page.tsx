import type { JSX } from 'react'

import { UserRoundPlus } from 'lucide-react'
import logo from '@/assets/logo.svg'
import { Subtitle } from '@/components/subtitle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthDivider } from '@/modules/auth/components/auth-divider'
import { AuthSwitchLink } from '@/modules/auth/components/auth-switch-link'
import { LoginForm } from '@/modules/auth/components/login-form'

export function LoginPage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <img src={logo} alt="Financy" className="h-8 w-auto self-center" />
      <Card className="border border-gray-200 ring-0 [--card-spacing:--spacing(8)]">
        <CardHeader className="text-center">
          <CardTitle className="text-xl leading-7 font-bold">Fazer login</CardTitle>
          <Subtitle className="text-base">Entre na sua conta para continuar</Subtitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <LoginForm />
          <AuthDivider />
          <AuthSwitchLink
            message="Ainda não tem uma conta?"
            to="/cadastro"
            label="Criar conta"
            icon={<UserRoundPlus className="size-[18px]" />}
          />
        </CardContent>
      </Card>
    </main>
  )
}
