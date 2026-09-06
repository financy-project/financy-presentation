import { MockedProvider } from '@apollo/client/testing/react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LOGOUT } from '@/modules/auth/graphql/mutations'
import { useLogout } from '@/modules/auth/hooks/use-logout'
import { useAuthStore } from '@/modules/auth/stores/use-auth-store'

const navigateSpy = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => navigateSpy }
})

function renderUseLogout(mocks: React.ComponentProps<typeof MockedProvider>['mocks']) {
  return renderHook(() => useLogout(), {
    wrapper: ({ children }) =>
      createElement(
        MockedProvider,
        { mocks },
        createElement(
          MemoryRouter,
          null,
          createElement(Routes, null, createElement(Route, { path: '*', element: children })),
        ),
      ),
  })
}

describe('useLogout', () => {
  beforeEach(() => {
    navigateSpy.mockClear()
    useAuthStore.setState({ user: { id: '1', email: 'ana@example.com', name: 'Ana Silva' } })
  })

  it('calls the logout mutation, clears the user, resets the Apollo cache, and navigates to /login', async () => {
    const mocks = [{ request: { query: LOGOUT }, result: { data: { logout: true } } }]

    const { result } = renderUseLogout(mocks)

    await act(async () => {
      await result.current.logout()
    })

    expect(useAuthStore.getState().user).toBeNull()
    expect(navigateSpy).toHaveBeenCalledWith('/login')
  })

  it('still clears the user and navigates to /login even if the mutation fails', async () => {
    const mocks = [{ request: { query: LOGOUT }, error: new Error('Failed to fetch') }]

    const { result } = renderUseLogout(mocks)

    await act(async () => {
      await result.current.logout()
    })

    await waitFor(() => expect(useAuthStore.getState().user).toBeNull())
    expect(navigateSpy).toHaveBeenCalledWith('/login')
  })
})
