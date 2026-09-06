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

