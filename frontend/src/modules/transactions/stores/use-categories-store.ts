import { create } from 'zustand'
import type { CategoryForSelect } from '@/modules/transactions/graphql/queries'

interface CategoriesStoreState {
  categories: CategoryForSelect[]
  isLoading: boolean
  error: string | null
  setCategories: (categories: CategoryForSelect[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

// Populated once (by useSyncCategoriesForSelect, run from TransactionsPage)
// and read from everywhere else (filters, transaction form) that needs the
// id/title category list — avoids each consumer running its own
// listCategories query.
export const useCategoriesStore = create<CategoriesStoreState>((set) => ({
  categories: [],
  isLoading: true,
  error: null,
  setCategories: (categories) => set({ categories }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))
