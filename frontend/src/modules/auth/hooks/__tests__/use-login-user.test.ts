import { MockedProvider } from '@apollo/client/testing/react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { LOGIN } from '@/modules/auth/graphql/mutations'
import { useLoginUser } from '@/modules/auth/hooks/use-login-user'

const INPUT = { email: 'ana@example.com', password: 'Senha123' }

function renderUseLoginUser(mocks: React.ComponentProps<typeof MockedProvider>['mocks']) {
  return renderHook(() => useLoginUser(), {
    wrapper: ({ children }) => createElement(MockedProvider, { mocks }, children),
  })
}

describe('useLoginUser', () => {
  it('resolves with { id, email, name } and toggles isLoading on success', async () => {
    const mocks = [
      {
        request: { query: LOGIN, variables: { input: INPUT } },
        result: {
          data: {
            login: { id: '1', email: INPUT.email, name: 'Ana Silva' },
          },
        },
      },
    ]

    const { result } = renderUseLoginUser(mocks)
    expect(result.current.isLoading).toBe(false)

    let response
    await act(async () => {
      response = await result.current.loginUser(INPUT)
    })

    expect(response).toEqual({ id: '1', email: INPUT.email, name: 'Ana Silva' })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('maps extensions.validationErrors straight to fieldErrors when present', async () => {
    const mocks = [
      {
        request: { query: LOGIN, variables: { input: INPUT } },
        result: {
          errors: [{ message: 'Erro de validação' }],
          extensions: {
            validationErrors: [{ path: 'email', message: 'Informe um e-mail válido' }],
          },
        },
      },
    ]

    const { result } = renderUseLoginUser(mocks)

    await act(async () => {
      await result.current.loginUser(INPUT)
    })

    await waitFor(() =>
      expect(result.current.fieldErrors).toEqual([
        { path: 'email', message: 'Informe um e-mail válido' },
      ]),
    )
    expect(result.current.formError).toBeNull()
  })

  it("sets formError to the server's message verbatim when there's no extensions.validationErrors", async () => {
    const mocks = [
      {
        request: { query: LOGIN, variables: { input: INPUT } },
        result: {
          errors: [{ message: 'E-mail ou senha inválidos.' }],
        },
      },
    ]

    const { result } = renderUseLoginUser(mocks)

    await act(async () => {
      await result.current.loginUser(INPUT)
    })

    await waitFor(() => expect(result.current.formError).toBe('E-mail ou senha inválidos.'))
    expect(result.current.fieldErrors).toEqual([])
  })

  it('sets formError to a fallback message on a network/unexpected error', async () => {
    const mocks = [
      {
        request: { query: LOGIN, variables: { input: INPUT } },
        error: new Error('Failed to fetch'),
      },
    ]

    const { result } = renderUseLoginUser(mocks)

    await act(async () => {
      await result.current.loginUser(INPUT)
    })

    await waitFor(() =>
      expect(result.current.formError).toBe(
        'Não foi possível entrar. Verifique suas credenciais e tente novamente.',
      ),
    )
    expect(result.current.fieldErrors).toEqual([])
  })
})
