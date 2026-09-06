# tela-de-cadastro - PM-006 - Test Cases

### Phase 1: Foundation

- [x] T-001: `App` redirects `/` to `/cadastro`

### Phase 2: API Layer

- [x] T-002: `useRegisterUser` resolves with `{ id, email, name }` on success and toggles `isLoading`
- [x] T-003: `useRegisterUser` maps `extensions.validationErrors` straight to `fieldErrors` when present
- [x] T-004: `useRegisterUser` sets `formError` to the server's message verbatim when there's no `extensions.validationErrors` (e.g. duplicate email)
- [x] T-005: `useRegisterUser` sets `formError` to a fallback message on a network/unexpected error

### Phase 3: Register Screen

- [x] T-006: `RegisterForm` shows the name-required message on empty submit
- [x] T-007: `RegisterForm` shows the invalid-email message
- [x] T-008: `RegisterForm` shows the password min-length message
- [x] T-009: `RegisterForm` shows the password uppercase/number messages
- [x] T-010: `RegisterForm` toggles password visibility via the show/hide `IconButton`
- [x] T-011: `RegisterForm` disables submit and shows "Criando conta…" while loading
- [x] T-012: `RegisterForm` renders a hook `fieldErrors` entry under the matching field
- [x] T-013: `RegisterForm` renders the hook `formError` in the `role="alert"` banner
- [x] T-014: `RegisterForm` navigates to `/login` on success

### Phase 4: Integration & Verification

- [x] T-015: `App` renders `RegisterPage` at `/cadastro`, `LoginPage` at `/login`, and `PreviewPage` at `/preview`
