# dashboard - PM-009 - Implementation Plan

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
import { persist } from 'zustand/middleware'

interface AuthUser {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: AuthUser | null
  setUser: (user: AuthUser) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    { name: 'financy:auth-user' },
  ),
)
```

Written once, in `LoginForm`'s `onSubmit` success branch (`setUser(result)`, where `result` is `LoginData['login']` — same shape as `AuthUser`). Read in `Header` via `useAuthStore((state) => state.user)`. Wrapped in zustand's `persist` middleware (`localStorage`, key `financy:auth-user`) so the avatar survives a page refresh — per user decision (2026-09-03), see Risks & Mitigations for the accepted staleness tradeoff.

**New utility:** `getInitials(name: string): string` — `src/lib/utils.ts` (alongside `cn`). The `LOGIN` mutation only returns a single `name` string (no separate first/last name field), so initials are derived client-side: first letter of the first word + first letter of the last word, uppercased (`"Carlos Teixeira"` → `"CT"`; single-word name → just that initial).

## Architectural Decisions

- **Scope & Requirements:** this ticket covers only the `Header` component and just enough routing/state to make it real and testable — it does **not** implement the Dashboard/Transações/Categorias screens' actual content (placeholder pages only). Confirmed with the user (2026-09-03):
  - Nav items need real routes to exist for "active route highlighting" and "click navigates" to be true, not simulated — placeholder routes are added (`/dashboard`, `/transacoes`, `/categorias`), each rendering `Header` + minimal placeholder content, same pattern `LoginPage` used before PM-007 built it out.
  - Avatar initials come from the real logged-in user (not hardcoded/static prop) — `LoginForm` is wired to set the user into a new Zustand store (`useAuthStore`) on successful login, and `Header` reads from it.
  - As a direct consequence of adding `/dashboard`: fixes a pre-existing bug where `LoginForm`'s `navigate('/')` after a successful login immediately bounced back to `/login` (`App.tsx`'s `/` route is `<Navigate to="/login" replace />`) — the redirect target becomes `/dashboard`.
- **Data & State:** new Zustand dependency + `useAuthStore` (see State Blueprint above) — the first client-side "current user" state in the app; supersedes PM-007's plan.md note that global auth state was "explicitly out of scope" for that ticket. No Apollo cache/`typePolicies` changes.
- **User Experience:** `Header` is presentational/always-available once a route mounts it — no loading or error state of its own. Active nav item uses `text-primary`/`font-semibold` vs. `text-gray-600`/`font-normal` for inactive, per Figma. Avatar renders empty (not a placeholder glyph) when `useAuthStore`'s `user` is `null` (e.g., a placeholder page opened directly without logging in first) — acceptable since these are throwaway placeholder pages, not the final protected-route experience.
- **Testing & Validation:** Vitest + RTL. `Header` gets its own component test (`src/components/__tests__/header.test.tsx`) — renders logo/nav/avatar, highlights the active item per `MemoryRouter` `initialEntries`, shows initials when `useAuthStore` has a user (test seeds the store directly), renders empty avatar when it doesn't. `getInitials` gets a small util test. `LoginForm`'s existing test file is updated (not rewritten) for the two behavior changes: `navigate('/dashboard')` instead of `'/'`, and `useAuthStore`'s `user` is populated after a successful submit. `App.test.tsx` gains one smoke test per new route.
- **Implementation Details:** new dependency — `zustand` (`pnpm add zustand`). New files: `src/components/header.tsx`, `src/modules/auth/stores/use-auth-store.ts`, `src/pages/{dashboard,transactions,categories}-page.tsx`. Modified files: `src/lib/utils.ts` (+`getInitials`), `src/modules/auth/components/login-form.tsx` (+`setUser` call, redirect target), `src/App.tsx` (+3 routes).
- **Security Considerations:** the Zustand store holds only `{ id, email, name }` — the same non-sensitive fields the server already returns from `login`; no token/credential is stored client-side (the session itself stays in the httpOnly cookie, per PM-007). Store uses zustand's `persist` middleware (`localStorage`, key `financy:auth-user`) so a hard refresh (F5) on `/dashboard` etc. doesn't clear the avatar — per user decision (2026-09-03), superseding this ticket's original in-memory-only choice (see Risks).
- **Cross-Cutting Concerns:** no logging/analytics added. No shared error boundary needed — `Header` has no failure mode of its own.
- **Error Scenarios & Failure Modes:** none specific to `Header` (no network calls, no form). `getInitials('')` (edge case: an empty/whitespace-only name, shouldn't happen given the server requires a name at registration) returns an empty string rather than throwing.
- **Performance & Scale:** not applicable — static header, 3 nav items, no lists.
- **Module Composition:** `Header` lives at `src/components/` (app-level, per `CLAUDE.md`'s convention for components used across modules) even though it reads from the auth module's store — same cross-module read pattern already used by `App.tsx` importing `LoginPage`/`RegisterPage` from `src/modules/auth/pages/`.
- **Deployment & Operations:** no new `VITE_*` env var, no feature flag.
- **Backward Compatibility:** `LoginForm`'s redirect target change (`/` → `/dashboard`) is a behavior change but fixes a bug (the old target immediately redirected back to `/login`) — no caller relied on the broken behavior. All other existing routes/components are unmodified.

## Implementation Phases

### Phase 1: Foundation

- [ ] Add `zustand` dependency (`pnpm add zustand`)
- [ ] Implement `useAuthStore` (`src/modules/auth/stores/use-auth-store.ts`): `create<AuthState>` with `user: AuthUser | null` (`{ id: string, email: string, name: string }`) and `setUser: (user: AuthUser) => void`, exact shape above
- [ ] Add `getInitials(name: string): string` to `src/lib/utils.ts`: first letter of first word + first letter of last word, uppercased (`"Carlos Teixeira"` → `"CT"`; single-word name returns just that initial; empty/whitespace name returns `""`)
- [ ] Implement `Header` (`src/components/header.tsx`): `bg-white border-b border-gray-200 px-12 py-4` root, inner `max-w-[1280px] w-full mx-auto flex items-center justify-between` container; logo (`@/assets/logo.svg`, `h-6 w-auto`); centered `nav` (`gap-5 text-sm`) with `NavLink`s to `/dashboard` ("Dashboard"), `/transacoes` ("Transações"), `/categorias` ("Categorias") — active: `text-primary font-semibold`, inactive: `text-gray-600 font-normal`; avatar (`size-9 rounded-full bg-gray-300` circle, `text-sm font-medium text-gray-800` centered) showing `getInitials(user.name)` from `useAuthStore((s) => s.user)`, empty when `user` is `null`

### Phase 2: Integration

- [ ] Wire `LoginForm` (`src/modules/auth/components/login-form.tsx`) success branch: call `useAuthStore.getState().setUser(result)` (or the `setUser` action from the hook) with the mutation's `result`, then `navigate('/dashboard')` instead of `navigate('/')`
- [ ] Add placeholder pages, each rendering `<Header />` plus minimal placeholder content (mirrors `PreviewPage`'s structure): `DashboardPage` (`src/pages/dashboard-page.tsx`, "Dashboard em breve"), `TransactionsPage` (`src/pages/transactions-page.tsx`, "Transações em breve"), `CategoriesPage` (`src/pages/categories-page.tsx`, "Categorias em breve")
- [ ] Add routes to `src/App.tsx`: `/dashboard` → `DashboardPage`, `/transacoes` → `TransactionsPage`, `/categorias` → `CategoriesPage`
- [ ] Component tests for `Header` (`src/components/__tests__/header.test.tsx`, `MemoryRouter`): renders the logo and all three nav labels; `/dashboard` entry highlights "Dashboard" as active (`text-primary`/semibold classes) and the other two as inactive; `/transacoes` and `/categorias` entries highlight their own item instead; clicking a nav item navigates to its route; renders `getInitials(user.name)` in the avatar when `useAuthStore` has a seeded user; renders an empty avatar when the store's `user` is `null`
- [ ] Unit test for `getInitials` (`src/lib/__tests__/utils.test.ts` or alongside existing util tests): two-word name → both initials uppercased; single-word name → one initial; empty string → `""`
- [ ] Update `LoginForm`'s existing test (`src/modules/auth/components/__tests__/login-form.test.tsx`): the "navigates to /" assertions become "navigates to /dashboard"; add a case asserting `useAuthStore.getState().user` is populated with the mutation's result after a successful submit
- [ ] Add one smoke test per new route to `src/App.test.tsx`: `/dashboard`, `/transacoes`, `/categorias` each render `Header`'s "Dashboard" nav label (confirms the route + `Header` mount correctly)

## Test Cases

### Phase 1: Foundation

- [ ] `getInitials` returns the uppercased first+last initials for a two-word name
- [ ] `getInitials` returns one uppercased initial for a single-word name
- [ ] `getInitials` returns `""` for an empty/whitespace-only name
- [ ] `Header` renders the Financy logo
- [ ] `Header` renders all three nav labels: "Dashboard", "Transações", "Categorias"
- [ ] `Header` renders an empty avatar when `useAuthStore`'s `user` is `null`

### Phase 2: Integration

- [ ] `Header` highlights "Dashboard" as active and the other two items as inactive when mounted at `/dashboard`
- [ ] `Header` highlights "Transações" as active when mounted at `/transacoes`
- [ ] `Header` highlights "Categorias" as active when mounted at `/categorias`
- [ ] Clicking a `Header` nav item navigates to its corresponding route
- [ ] `Header` renders `getInitials(user.name)` in the avatar when `useAuthStore` has a seeded user
- [ ] `LoginForm` calls `navigate('/dashboard')` (not `/`) on a successful submit
- [ ] `LoginForm` populates `useAuthStore`'s `user` with the mutation's result on a successful submit
- [ ] `/dashboard`, `/transacoes`, `/categorias` each render `Header` (smoke test in `App.test.tsx`)

## Dependencies

- New npm package: `zustand` (first use in this repo — see State Blueprint).
- Internal: reuses `@/assets/logo.svg` (existing asset), react-router-dom's `NavLink` (already a dependency), the existing `LOGIN` mutation's response shape (`src/modules/auth/graphql/mutations.ts`, PM-007).

## Risks & Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| `useAuthStore`'s `persist` middleware can go stale: `localStorage` still holds `{ id, email, name }` after the httpOnly session cookie expires/is revoked server-side (e.g. logout on another tab, session timeout) — the avatar would show a name for a user who isn't actually authenticated anymore | Medium | Accepted for this ticket — there's no logout flow or session-expiry handling yet to clear it either way. A future "restore/validate session on load" feature (e.g. a `whoami` query, flagged as out-of-scope back in PM-007) is the real fix: validate the persisted user against the server, not just trust `localStorage` |
| Placeholder `DashboardPage`/`TransactionsPage`/`CategoriesPage` live under `src/pages/` (flat), not `src/modules/{dashboard,transactions,categories}/` — future features building out that real content may need to relocate them | Low | Deliberate — avoids scaffolding empty module directories ahead of any real feature for them (YAGNI); relocating 3 small placeholder files later is cheap |
| Nav item routes (`/transacoes`, `/categorias`) don't correspond to any real feature yet — someone could click them expecting real content | Low | Placeholder page text makes this explicit ("em breve"), same pattern already shipped for `LoginPage` before PM-007 |

## Success Criteria

- [ ] All acceptance criteria in `spec.md` met
- [ ] Tests passing (`pnpm test`)
- [ ] `pnpm build` compiles without errors
