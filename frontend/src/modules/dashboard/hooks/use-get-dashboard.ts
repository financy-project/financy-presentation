import { useQuery } from '@apollo/client/react'
import type {
  DashboardCategoryBalance,
  DashboardMovement,
  DashboardRecentTransaction,
  GetDashboardData,
} from '@/modules/dashboard/graphql/queries'
import { GET_DASHBOARD } from '@/modules/dashboard/graphql/queries'

const FALLBACK_ERROR_MESSAGE = 'Não foi possível carregar o resumo do dashboard.'

export interface UseGetDashboardResult {
  movement: DashboardMovement | null
  recentTransactions: DashboardRecentTransaction[]
  categories: DashboardCategoryBalance[]
  isLoading: boolean
  error: string | null
}

export function useGetDashboard(): UseGetDashboardResult {
  const { data, loading, error } = useQuery<GetDashboardData>(GET_DASHBOARD, {
    fetchPolicy: 'cache-and-network',
  })

  return {
    movement: data?.dashboard.movement ?? null,
    recentTransactions: data?.dashboard.recentTransactions ?? [],
    categories: data?.dashboard.balanceByCategory ?? [],
    isLoading: loading,
    error: error ? FALLBACK_ERROR_MESSAGE : null,
  }
}
