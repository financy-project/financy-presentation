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

