# dashboard - PM-009 - Tasks

### Phase 1: Foundation

- [x] F-001: Add `zustand` dependency (`pnpm add zustand`)
- [x] F-002: Implement `useAuthStore` (`src/modules/auth/stores/use-auth-store.ts`): `create<AuthState>` with `user: AuthUser | null` (`{ id: string, email: string, name: string }`) and `setUser: (user: AuthUser) => void`, exact shape above
- [x] F-003: Add `getInitials(name: string): string` to `src/lib/utils.ts`: first letter of first word + first letter of last word, uppercased (`"Carlos Teixeira"` → `"CT"`; single-word name returns just that initial; empty/whitespace name returns `""`)
- [x] F-004: Implement `Header` (`src/components/header.tsx`): `bg-white border-b border-gray-200 px-12 py-4` root, inner `max-w-[1280px] w-full mx-auto flex items-center justify-between` container; logo (`@/assets/logo.svg`, `h-6 w-auto`); centered `nav` (`gap-5 text-sm`) with `NavLink`s to `/dashboard` ("Dashboard"), `/transacoes` ("Transações"), `/categorias` ("Categorias") — active: `text-primary font-semibold`, inactive: `text-gray-600 font-normal`; avatar (`size-9 rounded-full bg-gray-300` circle, `text-sm font-medium text-gray-800` centered) showing `getInitials(user.name)` from `useAuthStore((s) => s.user)`, empty when `user` is `null`

### Phase 2: Integration

- [x] F-005: Wire `LoginForm` (`src/modules/auth/components/login-form.tsx`) success branch: call `useAuthStore.getState().setUser(result)` (or the `setUser` action from the hook) with the mutation's `result`, then `navigate('/dashboard')` instead of `navigate('/')`
- [x] F-006: Add placeholder pages, each rendering `<Header />` plus minimal placeholder content (mirrors `PreviewPage`'s structure): `DashboardPage` (`src/pages/dashboard-page.tsx`, "Dashboard em breve"), `TransactionsPage` (`src/pages/transactions-page.tsx`, "Transações em breve"), `CategoriesPage` (`src/pages/categories-page.tsx`, "Categorias em breve")
- [x] F-007: Add routes to `src/App.tsx`: `/dashboard` → `DashboardPage`, `/transacoes` → `TransactionsPage`, `/categorias` → `CategoriesPage`
- [x] F-008: Component tests for `Header` (`src/components/__tests__/header.test.tsx`, `MemoryRouter`): renders the logo and all three nav labels; `/dashboard` entry highlights "Dashboard" as active (`text-primary`/semibold classes) and the other two as inactive; `/transacoes` and `/categorias` entries highlight their own item instead; clicking a nav item navigates to its route; renders `getInitials(user.name)` in the avatar when `useAuthStore` has a seeded user; renders an empty avatar when the store's `user` is `null`
- [x] F-009: Unit test for `getInitials` (`src/lib/__tests__/utils.test.ts` or alongside existing util tests): two-word name → both initials uppercased; single-word name → one initial; empty string → `""`
- [x] F-010: Update `LoginForm`'s existing test (`src/modules/auth/components/__tests__/login-form.test.tsx`): the "navigates to /" assertions become "navigates to /dashboard"; add a case asserting `useAuthStore.getState().user` is populated with the mutation's result after a successful submit
- [x] F-011: Add one smoke test per new route to `src/App.test.tsx`: `/dashboard`, `/transacoes`, `/categorias` each render `Header`'s "Dashboard" nav label (confirms the route + `Header` mount correctly)
- [x] F-012: Wrap `useAuthStore` (`src/modules/auth/stores/use-auth-store.ts`) in zustand's `persist` middleware (`localStorage`, key `financy:auth-user`) so the logged-in user — and the header avatar — survives a page refresh (F5)
