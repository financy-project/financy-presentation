import type { JSX } from 'react'

import { LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import logo from '@/assets/logo.svg'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn, getInitials } from '@/lib/utils'
import { useLogout } from '@/modules/auth/hooks/use-logout'
import { useAuthStore } from '@/modules/auth/stores/use-auth-store'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Transações', to: '/transacoes' },
  { label: 'Categorias', to: '/categorias' },
]

export function Header(): JSX.Element {
  const user = useAuthStore((state) => state.user)
  const { logout } = useLogout()

  return (
    <header className="bg-white border-b border-gray-200 px-12 py-4">
      <div className="max-w-[1280px] w-full mx-auto flex items-center justify-between relative">
        <img src={logo} alt="Financy" className="h-6 w-auto" />
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-5 text-sm">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn('leading-5', isActive ? 'font-semibold text-primary' : 'font-normal text-gray-600')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              data-testid="header-avatar"
              className="size-9 cursor-pointer rounded-full bg-gray-300 flex items-center justify-center"
            >
              <span className="text-sm font-medium leading-5 text-gray-800">
                {user ? getInitials(user.name) : ''}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-40 p-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              onClick={() => logout()}
            >
              <LogOut className="size-4" />
              Sair
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
