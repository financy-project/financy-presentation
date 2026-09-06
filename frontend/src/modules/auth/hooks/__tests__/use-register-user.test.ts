import { MockedProvider } from '@apollo/client/testing/react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { REGISTER_USER } from '@/modules/auth/graphql/mutations'
import { useRegisterUser } from '@/modules/auth/hooks/use-register-user'

const INPUT = { name: 'Ana Silva', email: 'ana@example.com', password: 'Senha123' }

function renderUseRegisterUser(mocks: React.ComponentProps<typeof MockedProvider>['mocks']) {
  return renderHook(() => useRegisterUser(), {
    wrapper: ({ children }) => createElement(MockedProvider, { mocks }, children),
  })
}

describe('useRegisterUser', () => {
  it('resolves with { id, email, name } and toggles isLoading on success', async () => {
    const mocks = [
      {
        request: { query: REGISTER_USER, variables: { input: INPUT } },
        result: {
          data: {
            registerUser: { id: '1', email: INPUT.email, name: INPUT.name },
          },
        },
      },
    ]

    const { result } = renderUseRegisterUser(mocks)
    expect(result.current.isLoading).toBe(false)

    let response
    await act(async () => {
      response = await result.current.registerUser(INPUT)
    })

    expect(response).toEqual({ id: '1', email: INPUT.email, name: INPUT.name })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('maps extensions.validationErrors straight to fieldErrors when present', async () => {
    const mocks = [
      {
        request: { query: REGISTER_USER, variables: { input: INPUT } },
        result: {
          errors: [{ message: 'Erro de validação' }],
          extensions: {
            validationErrors: [{ path: 'email', message: 'Informe um e-mail válido' }],
          },
        },
      },
    ]

    const { result } = renderUseRegisterUser(mocks)

    await act(async () => {
      await result.current.registerUser(INPUT)
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
        request: { query: REGISTER_USER, variables: { input: INPUT } },
        result: {
          errors: [{ message: 'Este e-mail já está em uso.' }],
        },
      },
    ]

    const { result } = renderUseRegisterUser(mocks)

    await act(async () => {
      await result.current.registerUser(INPUT)
    })

    await waitFor(() => expect(result.current.formError).toBe('Este e-mail já está em uso.'))
    expect(result.current.fieldErrors).toEqual([])
  })

  it('sets formError to a fallback message on a network/unexpected error', async () => {
    const mocks = [
      {
        request: { query: REGISTER_USER, variables: { input: INPUT } },
        error: new Error('Failed to fetch'),
      },
    ]

    const { result } = renderUseRegisterUser(mocks)

    await act(async () => {
      await result.current.registerUser(INPUT)
    })

    await waitFor(() =>
      expect(result.current.formError).toBe('Não foi possível criar a conta. Tente novamente.'),
    )
    expect(result.current.fieldErrors).toEqual([])
  })
})
