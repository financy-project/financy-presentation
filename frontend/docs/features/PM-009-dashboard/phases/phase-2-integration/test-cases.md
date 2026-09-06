# dashboard - PM-009 - Test Cases

### Phase 2: Integration

- [x] T-007: `Header` highlights "Dashboard" as active and the other two items as inactive when mounted at `/dashboard`
- [x] T-008: `Header` highlights "Transações" as active when mounted at `/transacoes`
- [x] T-009: `Header` highlights "Categorias" as active when mounted at `/categorias`
- [x] T-010: Clicking a `Header` nav item navigates to its corresponding route
- [x] T-011: `Header` renders `getInitials(user.name)` in the avatar when `useAuthStore` has a seeded user
- [x] T-012: `LoginForm` calls `navigate('/dashboard')` (not `/`) on a successful submit
- [x] T-013: `LoginForm` populates `useAuthStore`'s `user` with the mutation's result on a successful submit
- [x] T-014: `/dashboard`, `/transacoes`, `/categorias` each render `Header` (smoke test in `App.test.tsx`)
- [x] T-015: `useAuthStore` persists the user to `localStorage` (key `financy:auth-user`) on `setUser`
