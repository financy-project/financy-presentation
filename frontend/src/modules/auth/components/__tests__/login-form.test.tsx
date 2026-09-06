import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginForm } from '@/modules/auth/components/login-form'
import { useLoginUser } from '@/modules/auth/hooks/use-login-user'
import { useAuthStore } from '@/modules/auth/stores/use-auth-store'

vi.mock('@/modules/auth/hooks/use-login-user')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const useLoginUserMock = vi.mocked(useLoginUser)

const REMEMBERED_EMAIL_KEY = 'financy:remembered-email'

function renderLoginForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>,
  )
}

const VALID_INPUT = { email: 'ana@example.com', password: 'Senha123' }

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/e-mail/i), VALID_INPUT.email)
  await user.type(screen.getByLabelText(/^senha$/i), VALID_INPUT.password)
}

describe('LoginForm', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    localStorage.clear()
    useAuthStore.setState({ user: null })
    useLoginUserMock.mockReturnValue({
      loginUser: vi.fn().mockResolvedValue(null),
      isLoading: false,
      fieldErrors: [],
      formError: null,
    })
  })

  it('shows "Informe um e-mail válido" for an invalid email', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText(/e-mail/i), 'not-an-email')
    await user.type(screen.getByLabelText(/^senha$/i), VALID_INPUT.password)
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    expect(await screen.findByText('Informe um e-mail válido')).toBeInTheDocument()
  })

  it('shows "A senha é obrigatória" for an empty password', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText(/e-mail/i), VALID_INPUT.email)
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    expect(await screen.findByText('A senha é obrigatória')).toBeInTheDocument()
  })

  it('toggles password visibility via the show/hide IconButton', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    const passwordInput = screen.getByLabelText(/^senha$/i)
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: /mostrar senha/i }))
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: /ocultar senha/i }))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('disables submit and shows "Entrando…" while loading', () => {
    useLoginUserMock.mockReturnValue({
      loginUser: vi.fn().mockResolvedValue(null),
      isLoading: true,
      fieldErrors: [],
      formError: null,
    })
    renderLoginForm()

    const button = screen.getByRole('button', { name: /entrando/i })
    expect(button).toBeDisabled()
  })

  it('renders a mocked fieldErrors entry under the matching field', async () => {
    useLoginUserMock.mockReturnValue({
      loginUser: vi.fn().mockResolvedValue(null),
      isLoading: false,
      fieldErrors: [{ path: 'email', message: 'E-mail ou senha inválidos' }],
      formError: null,
    })
    renderLoginForm()

    expect(await screen.findByText('E-mail ou senha inválidos')).toBeInTheDocument()
  })

  it('renders the mocked formError in the role="alert" banner verbatim', async () => {
    useLoginUserMock.mockReturnValue({
      loginUser: vi.fn().mockResolvedValue(null),
      isLoading: false,
      fieldErrors: [],
      formError: 'E-mail ou senha inválidos.',
    })
    renderLoginForm()

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.')
  })

  it('calls loginUser with { email, password } (no rememberMe) and navigates to /dashboard on success', async () => {
    const loginUser = vi.fn().mockResolvedValue({ id: '1', ...VALID_INPUT, name: 'Ana Silva' })
    useLoginUserMock.mockReturnValue({
      loginUser,
      isLoading: false,
      fieldErrors: [],
      formError: null,
    })
    const user = userEvent.setup()
    renderLoginForm()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    await waitFor(() => expect(loginUser).toHaveBeenCalledWith(VALID_INPUT))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'))
  })

  it('populates useAuthStore with the logged-in user on a successful submit', async () => {
    const loggedInUser = { id: '1', ...VALID_INPUT, name: 'Ana Silva' }
    useLoginUserMock.mockReturnValue({
      loginUser: vi.fn().mockResolvedValue(loggedInUser),
      isLoading: false,
      fieldErrors: [],
      formError: null,
    })
    const user = userEvent.setup()
    renderLoginForm()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    await waitFor(() => expect(useAuthStore.getState().user).toEqual(loggedInUser))
  })

  it('persists the submitted email to localStorage when "Lembrar-me" is checked on success', async () => {
    useLoginUserMock.mockReturnValue({
      loginUser: vi.fn().mockResolvedValue({ id: '1', ...VALID_INPUT, name: 'Ana Silva' }),
      isLoading: false,
      fieldErrors: [],
      formError: null,
    })
    const user = userEvent.setup()
    renderLoginForm()

    await fillValidForm(user)
    await user.click(screen.getByRole('checkbox', { name: /lembrar-me/i }))
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    await waitFor(() =>
      expect(localStorage.getItem(REMEMBERED_EMAIL_KEY)).toBe(VALID_INPUT.email),
    )
  })

  it('clears the remembered email when "Lembrar-me" is unchecked on success', async () => {
    localStorage.setItem(REMEMBERED_EMAIL_KEY, 'stale@example.com')
    useLoginUserMock.mockReturnValue({
      loginUser: vi.fn().mockResolvedValue({ id: '1', ...VALID_INPUT, name: 'Ana Silva' }),
      isLoading: false,
      fieldErrors: [],
      formError: null,
    })
    const user = userEvent.setup()
    renderLoginForm()

    await user.clear(screen.getByLabelText(/e-mail/i))
    await user.type(screen.getByLabelText(/e-mail/i), VALID_INPUT.email)
    await user.type(screen.getByLabelText(/^senha$/i), VALID_INPUT.password)
    await user.click(screen.getByRole('checkbox', { name: /lembrar-me/i }))
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    await waitFor(() => expect(localStorage.getItem(REMEMBERED_EMAIL_KEY)).toBeNull())
  })

  it('pre-fills the email field and pre-checks "Lembrar-me" on mount when a remembered email exists', () => {
    localStorage.setItem(REMEMBERED_EMAIL_KEY, VALID_INPUT.email)
    renderLoginForm()

    expect(screen.getByLabelText(/e-mail/i)).toHaveValue(VALID_INPUT.email)
    expect(screen.getByRole('checkbox', { name: /lembrar-me/i })).toBeChecked()
  })
})
