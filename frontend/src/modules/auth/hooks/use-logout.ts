import { useApolloClient, useMutation } from '@apollo/client/react'
import { useNavigate } from 'react-router-dom'
import type { LogoutData } from '@/modules/auth/graphql/mutations'
import { LOGOUT } from '@/modules/auth/graphql/mutations'
import { useAuthStore } from '@/modules/auth/stores/use-auth-store'

export interface UseLogoutResult {
  logout: () => Promise<void>
  isLoading: boolean
}

export function useLogout(): UseLogoutResult {
  const [mutate, { loading }] = useMutation<LogoutData>(LOGOUT)
  const client = useApolloClient()
  const clearUser = useAuthStore((state) => state.clearUser)
  const navigate = useNavigate()

  const logout = async () => {
    try {
      await mutate()
    } catch {
      // Ignored — the mutation is idempotent/always-true server-side, and
      // the local session cleanup below must happen regardless of whether
      // the network call succeeded (the access_token cookie is httpOnly,
      // so the client can't inspect its state to decide otherwise).
    } finally {
      clearUser()
      await client.clearStore()
      navigate('/login')
    }
  }

  return { logout, isLoading: loading }
}
