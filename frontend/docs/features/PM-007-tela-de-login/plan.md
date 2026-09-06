# Tela de Login - PM-007 - Implementation Plan

## Definition of Ready (DoR) Blueprints

### Component Blueprint

**Component Name(s) and file paths:**

- `LoginForm` — `src/modules/auth/components/login-form.tsx` (new, mirrors `register-form.tsx`)
- `LoginPage` — `src/modules/auth/pages/login-page.tsx` (rewrite of the current "Login em breve" placeholder)
- `Checkbox` — `src/components/ui/checkbox.tsx` (new shadcn primitive, doesn't exist yet)

**Props type block:**

```ts
// LoginForm and LoginPage take no props — self-contained, same as RegisterForm/RegisterPage
function LoginForm(): JSX.Element
function LoginPage(): JSX.Element
```

**Composition:**

- Reused as-is (already Figma-fidelity-verified on the register screen, PM-006): `Card`, `CardHeader`, `CardTitle`, `CardContent` (`src/components/ui/card.tsx`), `Button` (`src/components/ui/button.tsx`), `TextInput` (`src/components/ui/text-input.tsx`), `PasswordInput` (`src/components/ui/password-input.tsx`).
- **New primitive needed:** `Checkbox` — nothing in `src/components/ui/` covers it. Add via the shadcn CLI: `pnpm dlx shadcn@latest add checkbox -p radix-nova` (per `components.json`'s `radix-nova` style/preset). Radix's `Checkbox.Root` fires `onCheckedChange`, not a native `onChange`, so it must be wired into React Hook Form with `Controller`, not `register()`.
- "Recuperar senha" is **not** the `Link` component (`src/components/ui/link.tsx`) as-is — its default `size` variant adds `h-8 px-2.5` button chrome that breaks the plain inline-text look Figma wants. Render it as `<Button type="button" variant="link" disabled className="h-auto p-0 text-sm font-medium">Recuperar senha</Button>` — reuses the `link` variant's `text-primary underline-offset-4` styling and the existing `disabled:opacity-50 disabled:pointer-events-none` treatment to visually communicate "not available yet" (see Architectural Decisions — no recovery flow exists yet).

**States to render:** loading (submit button label + disabled state, same pattern as `RegisterForm`), error (field-level via Zod/server `validationErrors`, form-level via `role="alert"` banner for invalid-credentials), no empty/populated distinction (it's a static form).

**Figma Fidelity:**

Source: https://www.figma.com/design/ZF0QlJlYLMEUz6DH93SwbK/Financy--Community-?node-id=3101-373 ("Tela de Login" container, node `3101:373`).

Colors returned by `get_variable_defs` are all named tokens already defined 1:1 in `src/index.css`: `Grayscale/gray-800 #111827`, `gray-700 #374151`, `gray-600 #4B5563`, `gray-500 #6B7280`, `gray-400 #9CA3AF`, `gray-300 #D1D5DB`, `gray-200 #E5E7EB`, `Neutral/white #FFFFFF`, `Brand/brand-base #1F6F43`. **Do not use `text-muted-foreground`/`text-foreground` aliases** except where the table below explicitly says so — `muted-foreground` resolves to `gray-500`, which is right for the "ou" divider text but wrong for the header subtitle (`gray-600`).

| Element | Size (w×h) | Padding | Gap | Radius | Border | BG | Text | Font (weight/size/line-height) | Icon |
|---|---|---|---|---|---|---|---|---|---|
| Container (`Card`) | 448×auto (max-w-md) | 32px (Figma: 33px, rounding artifact) | 32px | 12px¹ | 1px `border-gray-200` (#E5E7EB) | `bg-white`/`bg-card` | — | — | — |
| Header group | full×auto | — | 4px | — | — | — | — | — | — |
| "Fazer login" title | full×auto | — | — | — | — | — | `text-gray-800` (inherited via `text-card-foreground`) | bold/20px/28px → `text-xl leading-7 font-bold` | — |
| "Entre na sua conta para continuar" subtitle | full×auto | — | — | — | — | — | `text-gray-600` (NOT `text-muted-foreground`) | regular/16px/24px → `text-base font-normal text-gray-600` | — |
| Form group (`CardContent`) | full×auto | — | 24px → `gap-6` | — | — | — | — | — | — |
| Inputs group | full×auto | — | 16px → `gap-4` | — | — | — | — | — | — |
| "E-mail" / "Senha" labels | full×auto | — | — | — | — | — | `text-gray-700` | medium/14px/20px | — |
| Email/password input box | full×48px | 13px×15px (≈ `h-12` fixed height absorbs the vertical value) | 12px (icon-to-text) | 8px → `rounded-lg`² | 1px `border-gray-300` (#D1D5DB) via `border-input` | `bg-white` | placeholder `text-gray-400` | regular/16px/18px → `text-base` | `Mail` (email), `Lock` (password), size 16px — both `[&_svg]:size-4` via `TextInput`'s icon slot |
| Password reveal icon | 16×16 | — | — | — | — | — | — | — | Figma layer named "chevron-down" but the asset is a closed eye → `EyeClosed` (lucide), already used this way in `PasswordInput` |
| Links row | full×auto | — | — (space-between) | — | — | — | — | — | — |
| "Lembrar-me" checkbox | 16×16 | — | — | 4px → `rounded-[4px]` (new primitive, no reason to inherit `rounded-sm`'s 6px) | 1px `border-gray-300` | `bg-white` | — | — | — |
| "Lembrar-me" caption | auto | — | 8px (checkbox-to-text) → `gap-2` | — | — | — | `text-gray-700` | **regular**/14px/20px → override `Label`'s default `font-medium` with `font-normal` (`cn`/`twMerge` lets a passed `className="font-normal"` win) | — |
| "Recuperar senha" | auto | 0 (no button chrome) | — | — | — | — | `text-primary` (brand-base) | medium/14px/20px (Button `link` variant's `text-sm` default) | — |
| "Entrar" submit button | full×48px | 16px×12px | 8px | 8px | none | `bg-primary` (#1F6F43) | `text-primary-foreground` (white) | medium/16px/24px | — → `Button` `size="xl"` (`h-12 gap-2 px-4 text-base`), default variant |
| Divider | full×auto | — | 12px → `gap-3` | — | — | — | — | — | `<hr className="flex-1 border-gray-300" />` ×2 |
| "ou" | auto | — | — | — | — | — | `text-muted-foreground` (= gray-500, matches here) | regular/14px/20px → `text-sm` | — |
| Sign-up group | full×auto | — | 16px → `gap-4` | — | — | — | — | — | — |
| "Ainda não tem uma conta?" | full×auto | — | — | — | — | — | `text-gray-600` | regular/14px/20px → `text-sm text-gray-600 text-center` | — |
| "Criar conta" button | full×48px | 16px×12px | 8px | 8px | 1px `border-gray-300` | `bg-white` | `text-gray-700` | medium/16px/24px | `UserRoundPlus` at **18×18** (Figma explicit), so `<UserRoundPlus className="size-[18px]" />` — Button's default icon rule forces 16px otherwise → `Button variant="outline" size="xl" className="border-gray-300 text-gray-700"` (exact pattern already used for the mirrored button on `register-page.tsx:30`) |

¹ Card's hardcoded `rounded-xl` resolves to **14px** in this repo's token scale (`--radius-xl: calc(var(--radius) * 1.4)` with `--radius: 0.625rem`), not Figma's 12px. This same 2px drift already exists, unaddressed, on the sibling `register-page.tsx` Card. Recommendation: keep `Card`'s default (`rounded-xl`) for visual consistency between the two auth screens rather than one-off `rounded-[12px]`-ing only the login screen — documented deviation, not a fix for this ticket.

² `TextInput`'s email/password box uses `Input`'s base `rounded-lg` = `--radius` = 10px in this repo's scale, vs. Figma's 8px. Same pre-existing, already-shipped deviation as ¹ — not introduced by this feature, not fixed here (would require changing the shared `Input`/`TextInput` primitive and re-touching the already-shipped register screen).

### GraphQL/API Blueprint

**Mutation** (add to existing `src/modules/auth/graphql/mutations.ts`, alongside `REGISTER_USER` — matches the real server schema at `../server/src/modules/auth/resolvers/auth.resolver.ts`):

```ts
export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      id
      email
      name
    }
  }
`

export interface LoginInput {
  email: string
  password: string
}

export interface LoginData {
  login: {
    id: string
    email: string
    name: string
  }
}
```

Note: the server sets an **httpOnly session cookie** (`ACCESS_TOKEN_COOKIE_NAME`) as a side effect of the `login` mutation — there is no token in the response payload to store client-side. `src/lib/apollo-client.ts`'s `HttpLink` currently has no `credentials` option; add `credentials: 'include'` so the cookie round-trips once `VITE_GRAPHQL_URI` points at the real API (it currently points at the placeholder `countries.trevorblades.com`, same caveat `REGISTER_USER` already ships under).

**Hook:** `useLoginUser(): { loginUser: (input: LoginInput) => Promise<LoginData['login'] | null>, isLoading: boolean, fieldErrors: RegisterFieldError[], formError: string | null }` — `src/modules/auth/hooks/use-login-user.ts`, a direct structural copy of `use-register-user.ts`:
- Wraps `useMutation<LoginData, { input: LoginInput }>(LOGIN)`.
- On `CombinedGraphQLErrors` with `extensions.validationErrors` present (malformed email / empty password caught by the server's `class-validator` rules before hitting the DB) → `fieldErrors`.
- On `CombinedGraphQLErrors` without `validationErrors` (wrong email/password → server's `InvalidCredentialsError`, `extensions.code: 'UNAUTHENTICATED'`, already-translated `message`) → `formError = error.message`.
- On any other/network error → `formError = FALLBACK_ERROR_MESSAGE` (`'Não foi possível entrar. Verifique suas credenciais e tente novamente.'`).

**Cache strategy:** no cache update/refetch needed — `login` isn't a list-mutating operation and this feature builds no client-side "current user" cache entry (see State Blueprint / Architectural Decisions on auth-state scope).

**Loading/Error handling:** owned by `useLoginUser` (returns `isLoading`/`fieldErrors`/`formError`); `LoginForm` renders field errors inline (same as `RegisterForm`) and `formError` in a `role="alert"` banner.

### Form & Validation Blueprint

```ts
const loginFormSchema = z.object({
  email: z.email('Informe um e-mail válido'),
  password: z.string().min(1, 'A senha é obrigatória'),
  rememberMe: z.boolean(),
})

type LoginFormValues = z.infer<typeof loginFormSchema>
```

Note: unlike registration, login's password rule is only "required" — the uppercase/number/length rules are a *registration* policy, not a login-time check.

**Form component:** `LoginForm` owns `useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema), defaultValues: { email: rememberedEmail ?? '', password: '', rememberMe: !!rememberedEmail } })` and `handleSubmit`. The `rememberMe` field is bound via `Controller` (Radix `Checkbox` uses `onCheckedChange`, not a native `onChange`). On submit, calls `useLoginUser().loginUser({ email, password })` (rememberMe is **not** sent to the server — see below), and on success:
- writes/clears `localStorage['financy:remembered-email']` per the `rememberMe` decision (State Blueprint),
- `toast.success('Login realizado com sucesso!')`,
- `navigate('/')`.

### State Blueprint

**What state, and why:** the server's `LoginInput` has no `rememberMe` field and the session cookie's `maxAge` is fixed server-side (`Environments.jwtExpiry`) — the checkbox cannot extend the actual session today. Per product decision, "Lembrar-me" is controlled entirely on the frontend: when checked at a successful login, the email is remembered locally so it's pre-filled (and the box pre-checked) on a future visit; unchecking and logging in again clears it. This is genuinely more than component-local state — it must survive a full page reload/new session, which `useState` can't do.

**Where it lives:** `localStorage`, key `financy:remembered-email` (string, absent = not remembered). Read once on `LoginForm` mount to compute `useForm`'s `defaultValues`; written/cleared inside `LoginForm`'s `onSubmit` success branch.

**Shape:**

```ts
// localStorage["financy:remembered-email"]: string | undefined (absent when not remembered)
```

## Architectural Decisions

- **Scope & Requirements:** this ticket covers the login form, its mutation/hook, and post-success redirect only. Confirmed with the user (2026-09-03):
  - Redirect target: `/` (no `/dashboard` route exists yet — same placeholder `App.tsx` already uses for its root redirect).
  - "Lembrar-me": frontend-only control (see State Blueprint) — no server field exists for it.
  - "Recuperar senha": visible but disabled/no-op — no recovery flow/route exists yet.
  - Global auth state (who's logged in app-wide, protected routes): explicitly **out of scope** — this ticket only implements the mutation call, form, and redirect. A future feature can back a "current user" check with a `whoami` query, since the server already sets an httpOnly cookie.
- **Data & State:** no new Apollo cache entities or `typePolicies` — `login`'s response isn't cached or reused elsewhere in this ticket. Only new state is the `localStorage` remembered-email key above.
- **User Experience:** happy path — fill email/password, submit, toast success, redirect to `/`. Loading — submit button shows "Entrando…" and is disabled (mirrors `RegisterForm`'s "Criando conta…"). Error — field-level Zod/server errors inline under each input; invalid-credentials shown as a `role="alert"` banner (mirrors `RegisterForm`'s `formError` banner). Accessibility: `TextInput`/`PasswordInput`/`Checkbox` all wire `htmlFor`/`id` via existing primitives; submit button disabled state prevents double-submit; the disabled "Recuperar senha" button is `disabled` (not just styled), so it's correctly excluded from the tab order's actionable state and announced as unavailable.
- **Testing & Validation:** Vitest + RTL, same two-file split as PM-006: a hook test (`use-login-user.test.ts`, `MockedProvider`-based, mirrors `use-register-user.test.ts`) and a component test (`login-form.test.tsx`, mocks `useLoginUser`, mirrors `register-form.test.tsx`). No e2e runner exists — manual verification happens through the app once the real GraphQL API is wired in (out of this ticket's control, same caveat as PM-006).
- **Implementation Details:** see Component/GraphQL/Form/State Blueprints above for the full component/hook/module list. New dependency: none (Radix `Checkbox` ships inside the already-installed `radix-ui` package; only a new shadcn-generated file, not a new package).
- **Security Considerations:** password value is never logged or sent anywhere but the mutation variables. The server already returns a translated, generic "invalid credentials" message (not "wrong password" vs. "no such user") — the client must render `formError` verbatim, not infer or split it into a more specific message, to avoid user enumeration. `credentials: 'include'` on `HttpLink` is required for the httpOnly cookie to be set/sent — this is additive to `apollo-client.ts` and doesn't weaken anything, since the cookie itself is `httpOnly`/`secure`/`sameSite: 'lax'` server-side.
- **Cross-Cutting Concerns:** logging — none beyond existing Apollo/console defaults; no analytics call in this ticket. Toast on success only (mirrors register's pattern of toasting on the "next step" transition). Error display is component-local (inline field errors + `role="alert"` banner), no shared error boundary needed for a single form.
- **Error Scenarios & Failure Modes:** GraphQL validation error (malformed email/empty password server-side, redundant with but not replacing client Zod validation) → `fieldErrors`. Invalid credentials → `formError` banner, generic message, form stays filled so the user can retry. Network error → fallback `formError`. No retry button — user resubmits via the same "Entrar" button. Race condition: submit button `disabled` while `isLoading`, preventing a duplicate in-flight mutation from a double-click; no explicit abandon-navigation handling needed (unmounting the form while a promise is in flight is a no-op, same as `RegisterForm` today).
- **Performance & Scale:** not applicable — single static form, no lists/pagination.
- **Module Composition:** two components (`LoginPage` orchestrates layout/navigation-after-success wiring boundary via `LoginForm`'s internal `navigate` call, same split as `RegisterPage`/`RegisterForm`); no new shared state crosses component boundaries beyond the `localStorage` key, which each `LoginForm` mount reads independently.
- **Deployment & Operations:** no new `VITE_*` env var. No feature flag. Manual post-deploy check: once `VITE_GRAPHQL_URI` is switched to the real server, log in with a seeded user and confirm the session cookie is set (`Set-Cookie` in Network tab) and `credentials: 'include'` is actually sending it back on subsequent requests.
- **Backward Compatibility:** `Card`/`Button`/`TextInput`/`PasswordInput`/`Label` are reused unmodified (no prop/behavior changes) — no existing callers affected. `LoginPage`'s current placeholder content (`"Login em breve"` + back-to-register button) is fully replaced; nothing else in the app renders it or depends on its current contents (confirmed via `App.tsx` — it's only reached via the `/login` route).

## Implementation Phases

### Phase 1: Foundation

- [ ] Add `LOGIN`, `LoginInput`, `LoginData` to `src/modules/auth/graphql/mutations.ts` (exact `gql` document + types above)
- [ ] Add `credentials: 'include'` to the `HttpLink` config in `src/lib/apollo-client.ts`
- [ ] Implement `useLoginUser()` (`src/modules/auth/hooks/use-login-user.ts`): wraps `useMutation<LoginData, { input: LoginInput }>(LOGIN)`; returns `{ loginUser, isLoading, fieldErrors, formError }`; error-branching logic exactly as `use-register-user.ts` (see GraphQL/API Blueprint), fallback message `'Não foi possível entrar. Verifique suas credenciais e tente novamente.'`
- [ ] Add the `Checkbox` primitive via `pnpm dlx shadcn@latest add checkbox -p radix-nova` (`src/components/ui/checkbox.tsx`); adjust generated radius to `rounded-[4px]` and border to `border-gray-300` per the Figma Fidelity table if the generated defaults differ

### Phase 2: Features

- [ ] Implement `LoginForm` (`src/modules/auth/components/login-form.tsx`): `useForm<LoginFormValues>` with `loginFormSchema` (exact schema above) and `zodResolver`; reads `localStorage['financy:remembered-email']` on mount for `defaultValues.email`/`defaultValues.rememberMe`; renders `TextInput` (email, `Mail` icon), `PasswordInput` (password, `Lock` icon), Links row (`Controller`-wired `Checkbox` + "Lembrar-me" caption, disabled "Recuperar senha" `Button`), submit `Button` (`size="xl"`, label `"Entrar"`/`"Entrando…"` while `isLoading`); on submit success writes/clears the `localStorage` key, `toast.success('Login realizado com sucesso!')`, `navigate('/')`
- [ ] Rewrite `LoginPage` (`src/modules/auth/pages/login-page.tsx`): same layout/structure as `RegisterPage` — logo, `Card` (`border-gray-200 ring-0 [--card-spacing:--spacing(8)]`), `CardHeader` ("Fazer login" title `text-xl leading-7 font-bold`, subtitle `text-base font-normal text-gray-600`), `CardContent` (`grid gap-6`: `LoginForm`, divider `"ou"` row, sign-up group with "Ainda não tem uma conta?" + `Button variant="outline" size="xl" className="border-gray-300 text-gray-700"` containing `<UserRoundPlus className="size-[18px]" />` + "Criar conta", `RouterLink to="/cadastro"`)
- [ ] Unit tests for `useLoginUser` (`src/modules/auth/hooks/__tests__/use-login-user.test.ts`, `MockedProvider`): resolves `{ id, email, name }` and toggles `isLoading`; maps `extensions.validationErrors` to `fieldErrors`; sets `formError` to the server's message verbatim on invalid credentials (no `validationErrors`); sets fallback `formError` on network error
- [ ] Component tests for `LoginForm` (`src/modules/auth/components/__tests__/login-form.test.tsx`, mocks `useLoginUser`): shows "Informe um e-mail válido" for invalid email; shows "A senha é obrigatória" for empty password; toggles password visibility via the show/hide `IconButton`; disables submit and shows "Entrando…" while `isLoading`; renders a mocked `fieldErrors` entry under the matching field; renders the mocked `formError` in the `role="alert"` banner verbatim; navigates to `/` and calls `loginUser` with `{ email, password }` (no `rememberMe`) on valid submit; when `rememberMe` is checked on a successful submit, `localStorage.getItem('financy:remembered-email')` equals the submitted email; when unchecked, the key is cleared; on mount with an existing remembered email, the email field is pre-filled and the checkbox pre-checked

## Test Cases

### Phase 1: Foundation

- [ ] `useLoginUser` resolves with `{ id, email, name }` and `isLoading` toggles `true` → `false` around the mutation call
- [ ] `useLoginUser` maps `extensions.validationErrors` straight to `fieldErrors` when present
- [ ] `useLoginUser` sets `formError` to the server's message verbatim when there's no `extensions.validationErrors` (invalid-credentials path)
- [ ] `useLoginUser` sets `formError` to the fallback message on a network/unexpected error

### Phase 2: Features

- [ ] `LoginForm` shows "Informe um e-mail válido" for an invalid email on submit
- [ ] `LoginForm` shows "A senha é obrigatória" for an empty password on submit
- [ ] `LoginForm` toggles password visibility via the show/hide `IconButton`
- [ ] `LoginForm` disables submit and shows "Entrando…" while `isLoading`
- [ ] `LoginForm` renders a mocked `fieldErrors` entry under the matching field
- [ ] `LoginForm` renders the mocked `formError` in the `role="alert"` banner verbatim
- [ ] `LoginForm` calls `loginUser({ email, password })` (rememberMe excluded) and navigates to `/` on success
- [ ] `LoginForm` persists the submitted email to `localStorage['financy:remembered-email']` when "Lembrar-me" is checked on a successful submit, and clears it when unchecked
- [ ] `LoginForm` pre-fills the email field and pre-checks "Lembrar-me" on mount when a remembered email exists in `localStorage`

## Dependencies

- No new npm packages — `Checkbox` comes from the already-installed `radix-ui` package via the shadcn CLI.
- Depends on the server's `login` mutation (`../server/src/modules/auth/resolvers/auth.resolver.ts`) — already implemented there, schema confirmed (`LoginInput { email, password }` → `UserType { id, email, name }` + httpOnly cookie side effect).
- Internal: reuses `Card`, `Button`, `TextInput`, `PasswordInput`, `Label` (all shipped in PM-006/PM-005) and the `RegisterForm`/`RegisterPage`/`use-register-user` pattern as the structural template.

## Risks & Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| `VITE_GRAPHQL_URI` still points at the placeholder public API, so `login`/`credentials: 'include'` can't be manually end-to-end tested against a real session cookie yet | Medium | Same accepted state as PM-006's `REGISTER_USER` — build against the real schema, verify via unit/component tests + `MockedProvider`; manual cookie verification happens once the real API is wired in (tracked as a Deployment & Operations follow-up, not blocking) |
| Two pre-existing token drifts (Card radius 14px vs Figma 12px; input radius 10px vs Figma 8px) get silently "fixed" only on this screen, causing the two auth screens to visually diverge | Low | Explicitly documented as deliberate, matched deviations in the Figma Fidelity table (footnotes ¹ ²) — not touched by this ticket |
| `rememberMe` UX (frontend-only, no real session extension) could read as a bug if a PM/QA expects the checkbox to actually keep the user logged in longer | Low | Documented in Architectural Decisions and this plan's Scope section — surfaced to the user during grill-me and confirmed before writing this plan |

## Success Criteria

- [ ] All acceptance criteria in `spec.md` met
- [ ] Tests passing (`pnpm test`)
- [ ] `pnpm build` compiles without errors
