import { MockedProvider } from '@apollo/client/testing/react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/App'
import { useAuthStore } from '@/modules/auth/stores/use-auth-store'

describe('App', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null })
  })

  it('redirects / to /login when logged out', () => {
    render(
      <MockedProvider>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </MockedProvider>,
    )

    expect(screen.getByText('Fazer login')).toBeInTheDocument()
  })

  it('redirects / to /dashboard when logged in', () => {
    useAuthStore.setState({ user: { id: '1', email: 'ana@example.com', name: 'Ana Silva' } })
    render(
      <MockedProvider>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </MockedProvider>,
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders RegisterPage at /cadastro', () => {
    render(
      <MockedProvider>
        <MemoryRouter initialEntries={['/cadastro']}>
          <App />
        </MemoryRouter>
      </MockedProvider>,
    )

    expect(screen.getByText('Criar conta')).toBeInTheDocument()
  })

  it('renders LoginPage at /login', () => {
    render(
      <MockedProvider>
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      </MockedProvider>,
    )

    expect(screen.getByText('Fazer login')).toBeInTheDocument()
  })

  it('renders PreviewPage at /preview', () => {
    render(
      <MockedProvider>
        <MemoryRouter initialEntries={['/preview']}>
          <App />
        </MemoryRouter>
      </MockedProvider>,
    )

    expect(screen.getByRole('heading', { name: 'Financy' })).toBeInTheDocument()
  })

  it.each(['/dashboard', '/transacoes', '/categorias'])('renders Header at %s', (path) => {
    render(
      <MockedProvider>
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      </MockedProvider>,
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
