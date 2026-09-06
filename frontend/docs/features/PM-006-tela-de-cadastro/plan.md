# tela-de-cadastro - PM-006 - Implementation Plan

## Definition of Ready (DoR) Blueprints

This plan must explicitly define the architectural layers per [docs/architecture/dor.md](../../architecture/dor.md). Each blueprint below is fully specified.

### Component Blueprint

**New module:** `src/modules/auth/` (mirrors the server's `src/modules/user`/`src/modules/auth` split — first feature module in the web app; existing flat `src/components/` files are untouched).

1. **`RegisterPage`** — `src/modules/auth/pages/register-page.tsx`
   ```ts
   export function RegisterPage(): JSX.Element
   ```
   - No props (route-level component, mounted at `/cadastro`).
   - Composition: `Card`/`CardHeader`/`CardTitle`/`CardContent` (`@/components/ui/card`), the Financy logo (`@/assets/logo.svg`), `RegisterForm`, and a react-router `Link` (aliased `RouterLink`) wrapped in `Button` (`asChild`, `variant="outline"`) reading "Fazer login" that routes to `/login`.
   - States: none of its own — loading/error/empty are all owned by `RegisterForm`.

2. **`RegisterForm`** — `src/modules/auth/components/register-form.tsx`
   ```ts
   export function RegisterForm(): JSX.Element
   ```
   - No props — self-contained like `contact-form.tsx`; navigation on success is handled internally via `useNavigate()`.
   - Composition: `Input`, `Label`, `Button` (`@/components/ui/*`), `IconButton` (`@/components/ui/icon-button`) with lucide `Eye`/`EyeOff` for the password show/hide toggle, `useForm` + `zodResolver`, `useRegisterUser` (below), `toast` from `sonner`.
   - States to render:
     - **Populated/idle:** the three fields + "Cadastrar" button enabled.
     - **Loading:** submit button shows "Criando conta…" and is `disabled` (guards double-submit).
     - **Field error:** per-field message under the offending input (name/email/password), same pattern as `contact-form.tsx`'s `errors.name`.
     - **Form-level error:** an inline `<p role="alert" className="text-destructive text-sm">` above the submit button for errors that aren't tied to one field, plus a `toast.error(...)` for the same message.
     - **Success:** `toast.success('Conta criada com sucesso! Faça login para continuar.')` then `navigate('/login')`.

3. **`LoginPage`** — `src/modules/auth/pages/login-page.tsx` (placeholder — full login UX is a separate future feature, out of scope here; this only exists so `/login` is a real route for the "Fazer login" link and the post-registration redirect to land on)
   ```ts
   export function LoginPage(): JSX.Element
   ```
   - No props. Composition: `Card`/`CardHeader`/`CardTitle`/`CardContent`, text "Login em breve" + a `Link`-wrapped `Button` back to `/cadastro`.
   - States: none (static placeholder).

4. **`PreviewPage`** — `src/pages/preview-page.tsx` (new; not part of the auth module — houses the pre-existing stack demo so introducing routing doesn't delete it)
   ```ts
   export function PreviewPage(): JSX.Element
   ```
   - No props. Composition: the exact current body of `App.tsx` — `CountriesList`, `ContactForm`, `ComponentsPreview` — moved verbatim.

### GraphQL/API Blueprint

- **Mutation:** `RegisterUser` — `src/modules/auth/graphql/mutations.ts`
  ```ts
  import { gql } from '@apollo/client'

  export const REGISTER_USER = gql`
    mutation RegisterUser($input: RegisterUserInput!) {
      registerUser(input: $input) {
        id
        email
        name
      }
    }
  `

  export interface RegisterUserInput {
    name: string
    email: string
    password: string
  }

  export interface RegisterUserData {
    registerUser: {
      id: string
      email: string
      name: string
    }
  }
  ```
- **Hook:** `useRegisterUser` — `src/modules/auth/hooks/use-register-user.ts`
  ```ts
  export interface RegisterFieldError {
    path: string
    message: string
  }

  export interface UseRegisterUserResult {
    registerUser: (input: RegisterUserInput) => Promise<RegisterUserData['registerUser'] | null>
    isLoading: boolean
    fieldErrors: RegisterFieldError[]
    formError: string | null
  }

  export function useRegisterUser(): UseRegisterUserResult
  ```
  Implementation wraps `useMutation<RegisterUserData, { input: RegisterUserInput }>(REGISTER_USER)` from `@apollo/client/react`. On catch, it must use `CombinedGraphQLErrors.is(error)` (imported from `@apollo/client/errors` — **v4 does not expose `error.graphQLErrors`**, it wraps server errors in `CombinedGraphQLErrors` with an `.errors` array of `GraphQLFormattedError`). The backend (`../server/src/plugins/format-error.ts`) always returns an already-translated (pt-br), ready-to-display `message` — the client does not need to inspect `extensions.code` or hardcode which error means what:
  - If `extensions.validationErrors` (an array of `{ path, message }`, both already translated server-side) is present → assign it directly to `fieldErrors`.
  - Otherwise → `formError = error.errors[0].message` (this covers the duplicate-email conflict, auth errors, and unexpected/internal errors alike — all arrive as one ready-to-show sentence, so there is nothing to branch on).
  - No `CombinedGraphQLErrors` match at all (network error) → `formError = 'Não foi possível criar a conta. Tente novamente.'`
- **Cache strategy:** no `refetchQueries`/manual `update`/optimistic response needed — no query in this codebase currently lists users or reads a "current user", so there is nothing else for the cache to stay consistent with. Apollo's default `InMemoryCache` normalizes the returned `User` by `id` automatically; that's sufficient. N/A for `fetchPolicy` (this is a mutation, not a query).
- **Loading/Error handling:** fully owned by `useRegisterUser` (`isLoading`, `fieldErrors`, `formError`) — `RegisterForm` only renders what the hook gives it, per the Component Blueprint's states above.

### Form & Validation Blueprint

- **Zod schema** — colocated in `register-form.tsx`, mirroring `../server/src/modules/user/graphql/input-types/register-user.input.ts` exactly:
  ```ts
  const registerFormSchema = z.object({
    name: z
      .string()
      .trim()
      .min(1, 'O nome é obrigatório')
      .max(255, 'O nome deve ter no máximo 255 caracteres'),
    email: z.email('Informe um e-mail válido'),
    password: z
      .string()
      .min(8, 'A senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'A senha deve conter ao menos uma letra maiúscula')
      .regex(/[0-9]/, 'A senha deve conter ao menos um número'),
  })

  type RegisterFormValues = z.infer<typeof registerFormSchema>
  ```
- **Form component:** `RegisterForm` owns `useForm<RegisterFormValues>({ resolver: zodResolver(registerFormSchema) })` (same pattern as `contact-form.tsx`). `onSubmit` calls `registerUser(values)` from `useRegisterUser()`. A `useEffect` watches the hook's `fieldErrors` and calls `setError(path as keyof RegisterFormValues, { message })` for each entry so server-side validation/conflict errors land on the right field; `formError` renders as the inline banner described above.

### State Blueprint

**Omitted:** no state beyond component-local `useForm` state and `useRegisterUser`'s internal `isLoading`/`fieldErrors`/`formError`. No context, no new React Query key, no URL search params — the current route itself (owned by react-router, added in this feature) is the only "shared" state, and it's not custom application state.

---

## Architectural Decisions

- **Scope & Requirements:** Deliver the registration screen per `spec.md`'s acceptance criteria. Building the full login screen is explicitly out of scope — `LoginPage` is a placeholder route only, just enough to satisfy "navigates to the login screen".
- **Data & State:** Reads/writes only the `User`/`Auth` GraphQL entities via `registerUser`. No new Apollo `typePolicies` needed (see GraphQL/API Blueprint's cache strategy).
- **User Experience:** Happy path: fill form → "Cadastrar" → toast success → redirect to `/login`. Loading: button text change + disabled state, no full-page spinner. Error: inline field/form messages (see Component Blueprint). Accessibility: labels tied to inputs via `htmlFor`/`id` (as in `contact-form.tsx`), form-level error uses `role="alert"`, password toggle button has `aria-label` (required by `IconButton`'s type), focus stays on the field after a validation error (RHF default).
- **Testing & Validation:** Vitest + React Testing Library. Unit tests for `useRegisterUser` using `MockedProvider` from `@apollo/client/testing/react` (v4 path — not the old `@apollo/client/testing`). Component tests for `RegisterForm` mocking the hook. No e2e runner exists; this feature does not need to add one — routing is simple enough to cover with RTL + `MemoryRouter`.
- **Implementation Details:** New dependencies: `react-router-dom` (routing, added this feature per user decision) and `sonner` via `pnpm dlx shadcn@latest add sonner` (toast notifications, added this feature). Reuses existing `Card`, `Input`, `Label`, `Button`, `IconButton` primitives — no other new shadcn primitives needed. New query/mutation: yes, `RegisterUser`, response type `RegisterUserData` defined by hand (no codegen yet, per project convention).
- **Security Considerations:** Password value is never logged (unlike `contact-form.tsx`'s demo `console.log`, `RegisterForm` must not log form values). Password input uses `type="password"` by default, toggled to `type="text"` only while the user holds the show toggle active. No sensitive data sent to any analytics call (none exists).
- **Cross-Cutting Concerns:** `sonner`'s `<Toaster />` is mounted once at the app root (`src/App.tsx`), reused by any future feature that needs toasts. Loading/error handling is component-local (via the hook), no shared error boundary introduced by this feature.
- **Error Scenarios & Failure Modes:** GraphQL/network failure → `formError` + toast (see GraphQL/API Blueprint). Duplicate email → `formError` too, since the server sends it as a plain message with no `path` — the client does not guess which field it belongs to (see GraphQL/API Blueprint). Race condition: submit button is `disabled` while `isLoading`, preventing a resubmit before the first mutation resolves; navigating away mid-request is safe since `RegisterForm` unmounting simply abandons the in-flight promise (no cleanup needed, nothing is scheduled after unmount).
- **Performance & Scale:** Not applicable — a single form submission, no lists/pagination involved.
- **Module Composition:** New `src/modules/auth/` module (pages/components/graphql/hooks) established as the pattern the future login/logout/session features will extend.
- **Deployment & Operations:** No new environment variable needed — `VITE_GRAPHQL_URI` already exists; the `registerUser` mutation will only work once it points at the real Financy API instead of the current countries.trevorblades.com placeholder (already documented as a known gap in the project `CLAUDE.md`). No feature flag. Manual verification after deploy: submit the form once the real API is wired and confirm redirect + duplicate-email handling.
- **Backward Compatibility:** `App.tsx`'s public shape changes (it now renders routes instead of the demo scaffold directly), but nothing in this codebase imports `App` other than `main.tsx` — no external callers to update. The demo content itself is preserved, just moved to `PreviewPage` at `/preview`.

## Implementation Phases

### Phase 1: Foundation

- [ ] Add `react-router-dom` as a dependency (`pnpm add react-router-dom`)
- [ ] Add the shadcn `sonner` toast primitive (`pnpm dlx shadcn@latest add sonner`) — generates `src/components/ui/sonner.tsx` exporting `Toaster`
- [ ] Wrap `<App />` with `<BrowserRouter>` in `src/main.tsx`
- [ ] Create `src/pages/preview-page.tsx` exporting `PreviewPage(): JSX.Element` — move the current `App.tsx` body (`<CountriesList/>`, `<ContactForm/>`, `<ComponentsPreview/>` inside the existing `<main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">` wrapper) into it verbatim
- [ ] Rewrite `src/App.tsx` to render `<Toaster />` (from `@/components/ui/sonner`) plus `<Routes>`: `<Route path="/" element={<Navigate to="/cadastro" replace />} />`, `<Route path="/cadastro" element={<RegisterPage />} />`, `<Route path="/login" element={<LoginPage />} />`, `<Route path="/preview" element={<PreviewPage />} />`
- [ ] Scaffold empty module directories: `src/modules/auth/pages/`, `src/modules/auth/components/`, `src/modules/auth/graphql/`, `src/modules/auth/hooks/`

### Phase 2: API Layer

- [ ] Implement `REGISTER_USER` mutation + `RegisterUserInput`/`RegisterUserData` types in `src/modules/auth/graphql/mutations.ts` (exact document and types in the GraphQL/API Blueprint above)
- [ ] Implement `useRegisterUser(): UseRegisterUserResult` in `src/modules/auth/hooks/use-register-user.ts` per the GraphQL/API Blueprint (wraps `useMutation` from `@apollo/client/react`; on a `CombinedGraphQLErrors` from `@apollo/client/errors`, use `extensions.validationErrors` directly as `fieldErrors` when present, otherwise use the error's `message` as-is for `formError` — no `extensions.code` branching, the backend message is already display-ready)
- [ ] Unit tests for `useRegisterUser` in `src/modules/auth/hooks/__tests__/use-register-user.test.ts` using `MockedProvider` from `@apollo/client/testing/react`:
  - [ ] resolves with `{ id, email, name }` and `isLoading` transitions `true` → `false` on a successful mock response
  - [ ] a mocked error with `extensions.validationErrors: [{ path: 'email', message: '...' }]` results in `fieldErrors` containing that exact entry
  - [ ] a mocked error with no `extensions.validationErrors` (e.g. the duplicate-email conflict) results in `formError` equal to that error's `message`, verbatim
  - [ ] a network error (no `CombinedGraphQLErrors`) results in `formError` being set to the fallback message and `fieldErrors` staying empty

### Phase 3: Register Screen

- [ ] Implement `RegisterForm` in `src/modules/auth/components/register-form.tsx` per the Component + Form & Validation Blueprints (schema, `useForm`, `useRegisterUser`, `useNavigate`, `toast`, password show/hide `IconButton`)
- [ ] Implement `RegisterPage` in `src/modules/auth/pages/register-page.tsx` per the Component Blueprint (logo, "Criar conta" heading + subtitle, `RegisterForm`, divider, "Fazer login" link to `/login`)
- [ ] Implement `LoginPage` placeholder in `src/modules/auth/pages/login-page.tsx` per the Component Blueprint
- [ ] Component tests for `RegisterForm` in `src/modules/auth/components/__tests__/register-form.test.tsx` (mocking `useRegisterUser`, rendered inside a `MemoryRouter`):
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

- [ ] `src/App.test.tsx`: renders `RegisterPage` at `/cadastro`, redirects `/` to `/cadastro`, renders `LoginPage` at `/login`, renders `PreviewPage` at `/preview` (using `MemoryRouter`/`initialEntries`)
- [ ] Manual verification: `pnpm dev`, walk the happy path (fill form → submit → toast → redirect) and the duplicate-email path against a mocked/dev GraphQL response, confirm the Figma frame's visual details (logo, spacing, helper text, button copy) match
- [ ] `pnpm lint`, `pnpm build`, `pnpm test` all pass

## Test Cases

### Phase 1: Foundation

- [ ] `App` redirects `/` to `/cadastro`

### Phase 2: API Layer

- [ ] `useRegisterUser` resolves with `{ id, email, name }` on success and toggles `isLoading`
- [ ] `useRegisterUser` maps `extensions.validationErrors` straight to `fieldErrors` when present
- [ ] `useRegisterUser` sets `formError` to the server's message verbatim when there's no `extensions.validationErrors` (e.g. duplicate email)
- [ ] `useRegisterUser` sets `formError` to a fallback message on a network/unexpected error

### Phase 3: Register Screen

- [ ] `RegisterForm` shows the name-required message on empty submit
- [ ] `RegisterForm` shows the invalid-email message
- [ ] `RegisterForm` shows the password min-length message
- [ ] `RegisterForm` shows the password uppercase/number messages
- [ ] `RegisterForm` toggles password visibility via the show/hide `IconButton`
- [ ] `RegisterForm` disables submit and shows "Criando conta…" while loading
- [ ] `RegisterForm` renders a hook `fieldErrors` entry under the matching field
- [ ] `RegisterForm` renders the hook `formError` in the `role="alert"` banner
- [ ] `RegisterForm` navigates to `/login` on success

### Phase 4: Integration & Verification

- [ ] `App` renders `RegisterPage` at `/cadastro`, `LoginPage` at `/login`, and `PreviewPage` at `/preview`

## Dependencies

- **External:** `react-router-dom` (new), `sonner` (new, via shadcn CLI)
- **Internal:** `Card`, `Input`, `Label`, `Button`, `IconButton` (`src/components/ui/`); `@/lib/apollo-client`; existing `CountriesList`/`ContactForm`/`ComponentsPreview` (moved, not modified)

## Risks & Mitigations

| Risk                                                                                     | Impact | Mitigation                                                                                                    |
| ----------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------- |
| `VITE_GRAPHQL_URI` still points at the countries placeholder API, not the real Financy API | High   | Build against the real `registerUser` contract now (per `../server`); mutation will work as soon as `.env` is repointed, no client code change needed |
| Introducing routing changes `App.tsx`'s shape                                            | Low    | No other file imports from `App.tsx` besides `main.tsx`; existing demo content preserved at `/preview`, nothing deleted |
| Apollo Client v4's error API (`CombinedGraphQLErrors`) is easy to get wrong               | Medium | Hook implementation and its shape are fully specified above with the exact import path and `.is()` guard        |

## Success Criteria

- [ ] All acceptance criteria in `spec.md` met
- [ ] Tests passing (`pnpm test`)
- [ ] `pnpm build` compiles without errors
