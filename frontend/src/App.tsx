import type { JSX } from 'react'

import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { useAuthStore } from '@/modules/auth/stores/use-auth-store'
import { LoginPage } from '@/modules/auth/pages/login-page'
import { RegisterPage } from '@/modules/auth/pages/register-page'
import { CategoriesPage } from '@/modules/categories/pages/categories-page'
import { DashboardPage } from '@/modules/dashboard/pages/dashboard-page'
import { TransactionsPage } from '@/modules/transactions/pages/transactions-page'
import { PreviewPage } from '@/pages/preview-page'

// The root route has no page of its own — it just resolves to whichever
// of the two existing pages applies, based on whether a user is currently
// persisted in useAuthStore.
function RootRoute(): JSX.Element {
  const user = useAuthStore((state) => state.user)
  return <Navigate to={user ? '/dashboard' : '/login'} replace />
}

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transacoes" element={<TransactionsPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/preview" element={<PreviewPage />} />
      </Routes>
    </>
  )
}

export default App
