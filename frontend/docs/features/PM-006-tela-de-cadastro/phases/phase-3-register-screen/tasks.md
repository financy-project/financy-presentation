### Phase 3: Register Screen

- [x] F-010: Implement `RegisterForm` in `src/modules/auth/components/register-form.tsx` per the Component + Form & Validation Blueprints (schema, `useForm`, `useRegisterUser`, `useNavigate`, `toast`, password show/hide `IconButton`)
- [x] F-011: Implement `RegisterPage` in `src/modules/auth/pages/register-page.tsx` per the Component Blueprint (logo, "Criar conta" heading + subtitle, `RegisterForm`, divider, "Fazer login" link to `/login`)
- [x] F-012: Implement `LoginPage` placeholder in `src/modules/auth/pages/login-page.tsx` per the Component Blueprint
- [x] F-013: Component tests for `RegisterForm` in `src/modules/auth/components/__tests__/register-form.test.tsx` (mocking `useRegisterUser`, rendered inside a `MemoryRouter`):
  - [ ] shows "O nome é obrigatório" when submitting with an empty name
  - [ ] shows "Informe um e-mail válido" for an invalid email
  - [ ] shows "A senha deve ter no mínimo 8 caracteres" for a 7-character password
  - [ ] shows the uppercase/number password messages for a password missing each respectively
  - [ ] password field toggles between `type="password"` and `type="text"` when the show/hide `IconButton` is clicked
  - [ ] submit button is disabled and reads "Criando conta…" while `isLoading` is `true`
  - [ ] on a mocked `fieldErrors` entry for `email`, the message renders under the email field
  - [ ] on a mocked `formError` (e.g. the duplicate-email case), the inline `role="alert"` banner renders that message verbatim
  - [ ] on success, `navigate` is called with `/login`
