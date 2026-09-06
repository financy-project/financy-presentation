import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RegisterForm } from '@/modules/auth/components/register-form'
import { useRegisterUser } from '@/modules/auth/hooks/use-register-user'

vi.mock('@/modules/auth/hooks/use-register-user')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const useRegisterUserMock = vi.mocked(useRegisterUser)

function renderRegisterForm() {
  return render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>,
  )
}

const VALID_INPUT = { name: 'Ana Silva', email: 'ana@example.com', password: 'Senha123' }

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/nome/i), VALID_INPUT.name)
  await user.type(screen.getByLabelText(/e-mail/i), VALID_INPUT.email)
  await user.type(screen.getByLabelText(/^senha$/i), VALID_INPUT.password)
}

describe('RegisterForm', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    useRegisterUserMock.mockReturnValue({
      registerUser: vi.fn().mockResolvedValue(null),
      isLoading: false,
      fieldErrors: [],
      formError: null,
    })
  })

  it('shows "O nome é obrigatório" when submitting with an empty name', async () => {
    const user = userEvent.setup()
    renderRegisterForm()

    await user.click(screen.getByRole('button', { name: /cadastrar/i }))

    expect(await screen.findByText('O nome é obrigatório')).toBeInTheDocument()
  })

  it('shows "Informe um e-mail válido" for an invalid email', async () => {
    const user = userEvent.setup()
    renderRegisterForm()

    await user.type(screen.getByLabelText(/nome/i), 'Ana Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'not-an-email')
    await user.click(screen.getByRole('button', { name: /cadastrar/i }))

    expect(await screen.findByText('Informe um e-mail válido')).toBeInTheDocument()
  })

  it('shows "A senha deve ter no mínimo 8 caracteres" for a 7-character password', async () => {
    const user = userEvent.setup()
    renderRegisterForm()

    await user.type(screen.getByLabelText(/nome/i), 'Ana Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'ana@example.com')
    await user.type(screen.getByLabelText(/^senha$/i), 'Abc123x')
    await user.click(screen.getByRole('button', { name: /cadastrar/i }))

    expect(
      await screen.findByText('A senha deve ter no mínimo 8 caracteres'),
    ).toBeInTheDocument()
  })

  it('shows the uppercase/number password messages for a password missing each respectively', async () => {
    const user = userEvent.setup()
    renderRegisterForm()

    await user.type(screen.getByLabelText(/nome/i), 'Ana Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'ana@example.com')
    await user.type(screen.getByLabelText(/^senha$/i), 'senha1234')
    await user.click(screen.getByRole('button', { name: /cadastrar/i }))

    expect(
      await screen.findByText('A senha deve conter ao menos uma letra maiúscula'),
    ).toBeInTheDocument()

    await user.clear(screen.getByLabelText(/^senha$/i))
    await user.type(screen.getByLabelText(/^senha$/i), 'SenhaSenha')
    await user.click(screen.getByRole('button', { name: /cadastrar/i }))

    expect(
      await screen.findByText('A senha deve conter ao menos um número'),
    ).toBeInTheDocument()
  })

  it('toggles password visibility via the show/hide IconButton', async () => {
    const user = userEvent.setup()
    renderRegisterForm()

    const passwordInput = screen.getByLabelText(/^senha$/i)
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: /mostrar senha/i }))
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: /ocultar senha/i }))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('disables submit and shows "Criando conta…" while loading', () => {
    useRegisterUserMock.mockReturnValue({
      registerUser: vi.fn().mockResolvedValue(null),
      isLoading: true,
      fieldErrors: [],
      formError: null,
    })
    renderRegisterForm()

    const button = screen.getByRole('button', { name: /criando conta/i })
    expect(button).toBeDisabled()
  })

  it('renders a mocked fieldErrors entry under the matching field', async () => {
    useRegisterUserMock.mockReturnValue({
      registerUser: vi.fn().mockResolvedValue(null),
      isLoading: false,
      fieldErrors: [{ path: 'email', message: 'E-mail já cadastrado' }],
      formError: null,
    })
    renderRegisterForm()

    expect(await screen.findByText('E-mail já cadastrado')).toBeInTheDocument()
  })

  it('renders the mocked formError in the role="alert" banner verbatim', async () => {
    useRegisterUserMock.mockReturnValue({
      registerUser: vi.fn().mockResolvedValue(null),
      isLoading: false,
      fieldErrors: [],
      formError: 'Este e-mail já está em uso.',
    })
    renderRegisterForm()

    expect(await screen.findByRole('alert')).toHaveTextContent('Este e-mail já está em uso.')
  })

  it('navigates to /login on success', async () => {
    useRegisterUserMock.mockReturnValue({
      registerUser: vi.fn().mockResolvedValue({ id: '1', ...VALID_INPUT }),
      isLoading: false,
      fieldErrors: [],
      formError: null,
    })
    const user = userEvent.setup()
    renderRegisterForm()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /cadastrar/i }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'))
  })
})
