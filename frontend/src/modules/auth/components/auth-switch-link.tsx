import type { JSX, ReactNode } from 'react'

import { Link as RouterLink } from 'react-router-dom'
import { Subtitle } from '@/components/subtitle'
import { Button } from '@/components/ui/button'

interface AuthSwitchLinkProps {
  message: string
  to: string
  label: string
  icon: ReactNode
}

export function AuthSwitchLink({ message, to, label, icon }: AuthSwitchLinkProps): JSX.Element {
  return (
    <div className="grid gap-4">
      <Subtitle className="text-center text-sm">{message}</Subtitle>
      <Button asChild variant="outline" size="xl" className="border-gray-300 text-gray-700">
        <RouterLink to={to}>
          {icon}
          {label}
        </RouterLink>
      </Button>
    </div>
  )
}
