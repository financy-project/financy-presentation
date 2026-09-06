# tela-de-cadastro - PM-006 - Tasks

### Phase 1: Foundation

- [x] F-001: Add `react-router-dom` as a dependency (`pnpm add react-router-dom`)
- [x] F-002: Add the shadcn `sonner` toast primitive (`pnpm dlx shadcn@latest add sonner`) — generates `src/components/ui/sonner.tsx` exporting `Toaster`
- [x] F-003: Wrap `<App />` with `<BrowserRouter>` in `src/main.tsx`
- [x] F-004: Create `src/pages/preview-page.tsx` exporting `PreviewPage(): JSX.Element` — move the current `App.tsx` body (`<CountriesList/>`, `<ContactForm/>`, `<ComponentsPreview/>` inside the existing `<main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">` wrapper) into it verbatim
- [x] F-005: Rewrite `src/App.tsx` to render `<Toaster />` (from `@/components/ui/sonner`) plus `<Routes>`: `<Route path="/" element={<Navigate to="/cadastro" replace />} />`, `<Route path="/cadastro" element={<RegisterPage />} />`, `<Route path="/login" element={<LoginPage />} />`, `<Route path="/preview" element={<PreviewPage />} />`
- [x] F-006: Scaffold empty module directories: `src/modules/auth/pages/`, `src/modules/auth/components/`, `src/modules/auth/graphql/`, `src/modules/auth/hooks/`

### Phase 2: API Layer

- [x] F-007: Implement `REGISTER_USER` mutation + `RegisterUserInput`/`RegisterUserData` types in `src/modules/auth/graphql/mutations.ts` (exact document and types in the GraphQL/API Blueprint above)
- [x] F-008: Implement `useRegisterUser(): UseRegisterUserResult` in `src/modules/auth/hooks/use-register-user.ts` per the GraphQL/API Blueprint (wraps `useMutation` from `@apollo/client/react`; on a `CombinedGraphQLErrors` from `@apollo/client/errors`, use `extensions.validationErrors` directly as `fieldErrors` when present, otherwise use the error's `message` as-is for `formError` — no `extensions.code` branching, the backend message is already display-ready)
- [x] F-009: Unit tests for `useRegisterUser` in `src/modules/auth/hooks/__tests__/use-register-user.test.ts` using `MockedProvider` from `@apollo/client/testing/react`:
  - [ ] resolves with `{ id, email, name }` and `isLoading` transitions `true` → `false` on a successful mock response
  - [ ] a mocked error with `extensions.validationErrors: [{ path: 'email', message: '...' }]` results in `fieldErrors` containing that exact entry
  - [ ] a mocked error with no `extensions.validationErrors` (e.g. the duplicate-email conflict) results in `formError` equal to that error's `message`, verbatim
  - [ ] a network error (no `CombinedGraphQLErrors`) results in `formError` being set to the fallback message and `fieldErrors` staying empty

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

### Phase 4: Integration & Verification

- [x] F-014: `src/App.test.tsx`: renders `RegisterPage` at `/cadastro`, redirects `/` to `/cadastro`, renders `LoginPage` at `/login`, renders `PreviewPage` at `/preview` (using `MemoryRouter`/`initialEntries`)
- [x] F-015: Manual verification: `pnpm dev`, walk the happy path (fill form → submit → toast → redirect) and the duplicate-email path against a mocked/dev GraphQL response, confirm the Figma frame's visual details (logo, spacing, helper text, button copy) match
- [x] F-016: `pnpm lint`, `pnpm build`, `pnpm test` all pass
