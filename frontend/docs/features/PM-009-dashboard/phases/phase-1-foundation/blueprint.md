## Definition of Ready (DoR) Blueprints

### Component Blueprint

**Component Name(s) and file paths:**

- `Header` — `src/components/header.tsx` (new, app-level — not auth-module-specific, reused by every authenticated screen)
- `DashboardPage` — `src/pages/dashboard-page.tsx` (new, placeholder — real dashboard content is a future feature)
- `TransactionsPage` — `src/pages/transactions-page.tsx` (new, placeholder)
- `CategoriesPage` — `src/pages/categories-page.tsx` (new, placeholder)

**Props type block:**

```ts
// Header takes no props — reads the logged-in user from useAuthStore internally
function Header(): JSX.Element

// Placeholder pages take no props, same as PreviewPage
function DashboardPage(): JSX.Element
function TransactionsPage(): JSX.Element
function CategoriesPage(): JSX.Element
```

**Composition:**

- `Header` is net-new — no existing `Navbar`/`Header`/`Avatar` component or `NavLink` usage in the repo (confirmed via grep).
- Nav highlighting uses react-router-dom's `NavLink` (already a dependency, `^7.18.3`) — its `className` render-prop gives `isActive` for free, no manual `useLocation` comparison needed.
- Avatar (circle with initials) is **not** extracted into `src/components/ui/` — it appears exactly once in this feature. Per the "3+ occurrences" rule, it stays inline inside `Header`. Revisit if a second usage appears.
- Reuses the existing `@/assets/logo.svg` (see Figma Fidelity below) — no new asset download.
- Reads `useAuthStore` (see State Blueprint) for the logged-in user's `name`, converted to initials via a new `getInitials` util (see below).

**States to render:** logged-in (initials shown) vs. no user in the store yet (empty avatar — a placeholder page can be opened directly without going through login; not a real product state, just doesn't crash). No loading/error state — this is a pure render of already-available client state, no data fetching.

**Figma Fidelity:**

Source: https://www.figma.com/design/ZF0QlJlYLMEUz6DH93SwbK/Financy--Community-?node-id=3103-2033 ("Navbar", node `3103:2033`).

`get_variable_defs` returned named tokens, all defined 1:1 in `src/index.css`: `Brand/brand-base #1F6F43`, `Grayscale/gray-800 #111827`, `gray-600 #4B5563`, `gray-300 #D1D5DB`, `gray-200 #E5E7EB`, `Neutral/white #FFFFFF`. `text-primary` is used for the active nav color instead of `text-brand-base` — confirmed exact alias match (`--primary: var(--brand-base)` in `src/index.css`), and `text-primary` is already the convention other primitives use (`button.tsx`, `checkbox.tsx`).

| Element | Size (w×h) | Padding | Gap | Radius | Border | BG | Text | Font (weight/size/line-height) | Asset |
|---|---|---|---|---|---|---|---|---|---|
| `Header` (root) | full width | `px-12 py-4` (48px/16px — Figma exported `pb-17px`, 1px rounding artifact, not a deliberate asymmetry) | — | — | 1px `border-b border-gray-200` | `bg-white` | — | — | — |
| Inner container | `max-w-[1280px] w-full`, centered | — | — | — | — | — | — | — | — |
| Logo | ~100×24 | — | — | — | — | — | — | — | `@/assets/logo.svg` (existing, viewBox 134×32 ≈ same 4.19 aspect ratio as Figma's 100×24 box) → render `h-6 w-auto` |
| Nav | absolutely centered (`left-1/2 -translate-x-1/2`) | — | `gap-5` (20px) | — | — | — | — | `text-sm leading-5` (14px/20px) | — |
| Nav item, active ("Dashboard" when on `/dashboard`) | — | — | — | — | — | — | `text-primary` | `font-semibold` | — |
| Nav item, inactive | — | — | — | — | — | — | `text-gray-600` | `font-normal` | — |
| Avatar | `size-9` (36px) | — | — | `rounded-full` | — | `bg-gray-300` | `text-gray-800` | `text-sm font-medium leading-5`, centered | — |

### GraphQL/API Blueprint

**Omitted.** No new query/mutation. The user data rendered in the avatar comes from the existing `LOGIN` mutation's response (`{ id, email, name }`, `src/modules/auth/graphql/mutations.ts`), captured into the new `useAuthStore` (State Blueprint) at the point `LoginForm` already calls `loginUser(...)` — no additional network call.

### Form & Validation Blueprint

**Omitted.** No new form. `LoginForm` (`src/modules/auth/components/login-form.tsx`) is modified, not rebuilt: its existing `onSubmit` success branch gains one line (`setUser(result)`) and its post-success `navigate('/')` target changes to `navigate('/dashboard')` (see Architectural Decisions — this also fixes a pre-existing bounce-back bug).

### State Blueprint

**What state, and why:** the header's avatar needs the logged-in user's name app-wide, outside the auth module's own tree (`Header` is mounted on `DashboardPage`/`TransactionsPage`/`CategoriesPage`, siblings of `LoginPage`). This is genuinely cross-component state, not something `useState`/prop-drilling from `LoginForm` can reach. Per user decision (2026-09-03), a new **Zustand** store holds it — first use of Zustand in this repo (`CLAUDE.md`'s architecture notes only mention Apollo Client + React Query; this adds a third, minimal state tool for pure client-side session data that doesn't belong in either).

**Where it lives:** `src/modules/auth/stores/use-auth-store.ts` (auth module owns "who is the current user", same as it owns the `LOGIN` mutation/types) — new `src/modules/auth/stores/` directory, sibling to `graphql/`/`hooks/`/`components/`/`pages/`.

**Shape:**

```ts
import { create } from 'zustand'

interface AuthUser {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: AuthUser | null
  setUser: (user: AuthUser) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
```

Written once, in `LoginForm`'s `onSubmit` success branch (`setUser(result)`, where `result` is `LoginData['login']` — same shape as `AuthUser`). Read in `Header` via `useAuthStore((state) => state.user)`.

**New utility:** `getInitials(name: string): string` — `src/lib/utils.ts` (alongside `cn`). The `LOGIN` mutation only returns a single `name` string (no separate first/last name field), so initials are derived client-side: first letter of the first word + first letter of the last word, uppercased (`"Carlos Teixeira"` → `"CT"`; single-word name → just that initial).
