# dashboard - PM-009 - Tasks

### Phase 2: Integration

- [x] F-005: Wire `LoginForm` (`src/modules/auth/components/login-form.tsx`) success branch: call `useAuthStore.getState().setUser(result)` (or the `setUser` action from the hook) with the mutation's `result`, then `navigate('/dashboard')` instead of `navigate('/')`
- [x] F-006: Add placeholder pages, each rendering `<Header />` plus minimal placeholder content (mirrors `PreviewPage`'s structure): `DashboardPage` (`src/pages/dashboard-page.tsx`, "Dashboard em breve"), `TransactionsPage` (`src/pages/transactions-page.tsx`, "Transações em breve"), `CategoriesPage` (`src/pages/categories-page.tsx`, "Categorias em breve")
- [x] F-007: Add routes to `src/App.tsx`: `/dashboard` → `DashboardPage`, `/transacoes` → `TransactionsPage`, `/categorias` → `CategoriesPage`
- [x] F-008: Component tests for `Header` (`src/components/__tests__/header.test.tsx`, `MemoryRouter`): renders the logo and all three nav labels; `/dashboard` entry highlights "Dashboard" as active (`text-primary`/semibold classes) and the other two as inactive; `/transacoes` and `/categorias` entries highlight their own item instead; clicking a nav item navigates to its route; renders `getInitials(user.name)` in the avatar when `useAuthStore` has a seeded user; renders an empty avatar when the store's `user` is `null`
- [x] F-009: Unit test for `getInitials` (`src/lib/__tests__/utils.test.ts` or alongside existing util tests): two-word name → both initials uppercased; single-word name → one initial; empty string → `""`
- [x] F-010: Update `LoginForm`'s existing test (`src/modules/auth/components/__tests__/login-form.test.tsx`): the "navigates to /" assertions become "navigates to /dashboard"; add a case asserting `useAuthStore.getState().user` is populated with the mutation's result after a successful submit
- [x] F-011: Add one smoke test per new route to `src/App.test.tsx`: `/dashboard`, `/transacoes`, `/categorias` each render `Header`'s "Dashboard" nav label (confirms the route + `Header` mount correctly)
- [x] F-012: Wrap `useAuthStore` (`src/modules/auth/stores/use-auth-store.ts`) in zustand's `persist` middleware (`localStorage`, key `financy:auth-user`) so the logged-in user — and the header avatar — survives a page refresh (F5)
