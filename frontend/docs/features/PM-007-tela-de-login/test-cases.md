# Tela de Login - PM-007 - Test Cases

### Phase 1: Foundation

- [x] T-001: `useLoginUser` resolves with `{ id, email, name }` and `isLoading` toggles `true` → `false` around the mutation call
- [x] T-002: `useLoginUser` maps `extensions.validationErrors` straight to `fieldErrors` when present
- [x] T-003: `useLoginUser` sets `formError` to the server's message verbatim when there's no `extensions.validationErrors` (invalid-credentials path)
- [x] T-004: `useLoginUser` sets `formError` to the fallback message on a network/unexpected error

### Phase 2: Features

- [x] T-005: `LoginForm` shows "Informe um e-mail válido" for an invalid email on submit
- [x] T-006: `LoginForm` shows "A senha é obrigatória" for an empty password on submit
- [x] T-007: `LoginForm` toggles password visibility via the show/hide `IconButton`
- [x] T-008: `LoginForm` disables submit and shows "Entrando…" while `isLoading`
- [x] T-009: `LoginForm` renders a mocked `fieldErrors` entry under the matching field
- [x] T-010: `LoginForm` renders the mocked `formError` in the `role="alert"` banner verbatim
- [x] T-011: `LoginForm` calls `loginUser({ email, password })` (rememberMe excluded) and navigates to `/` on success
- [x] T-012: `LoginForm` persists the submitted email to `localStorage['financy:remembered-email']` when "Lembrar-me" is checked on a successful submit, and clears it when unchecked
- [x] T-013: `LoginForm` pre-fills the email field and pre-checks "Lembrar-me" on mount when a remembered email exists in `localStorage`
