import type { JSX } from 'react'

import { LogIn } from 'lucide-react'
import logo from '@/assets/logo.svg'
import { Subtitle } from '@/components/subtitle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthDivider } from '@/modules/auth/components/auth-divider'
import { AuthSwitchLink } from '@/modules/auth/components/auth-switch-link'
import { RegisterForm } from '@/modules/auth/components/register-form'

export function RegisterPage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <img src={logo} alt="Financy" className="h-8 w-auto self-center" />
      <Card className="border border-gray-200 ring-0 [--card-spacing:--spacing(8)]">
        <CardHeader className="text-center">
          <CardTitle className="text-xl leading-7 font-bold">Criar conta</CardTitle>
          <Subtitle className="text-base">Comece a controlar suas finanças ainda hoje</Subtitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <RegisterForm />
          <AuthDivider />
          <AuthSwitchLink
            message="Já tem uma conta?"
            to="/login"
            label="Fazer login"
            icon={<LogIn className="size-[18px]" />}
          />
        </CardContent>
      </Card>
    </main>
  )
}
