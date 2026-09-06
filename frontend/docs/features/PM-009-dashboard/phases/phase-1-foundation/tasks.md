# dashboard - PM-009 - Tasks

### Phase 1: Foundation

- [x] F-001: Add `zustand` dependency (`pnpm add zustand`)
- [x] F-002: Implement `useAuthStore` (`src/modules/auth/stores/use-auth-store.ts`): `create<AuthState>` with `user: AuthUser | null` (`{ id: string, email: string, name: string }`) and `setUser: (user: AuthUser) => void`, exact shape above
- [x] F-003: Add `getInitials(name: string): string` to `src/lib/utils.ts`: first letter of first word + first letter of last word, uppercased (`"Carlos Teixeira"` → `"CT"`; single-word name returns just that initial; empty/whitespace name returns `""`)
- [x] F-004: Implement `Header` (`src/components/header.tsx`): `bg-white border-b border-gray-200 px-12 py-4` root, inner `max-w-[1280px] w-full mx-auto flex items-center justify-between` container; logo (`@/assets/logo.svg`, `h-6 w-auto`); centered `nav` (`gap-5 text-sm`) with `NavLink`s to `/dashboard` ("Dashboard"), `/transacoes` ("Transações"), `/categorias` ("Categorias") — active: `text-primary font-semibold`, inactive: `text-gray-600 font-normal`; avatar (`size-9 rounded-full bg-gray-300` circle, `text-sm font-medium text-gray-800` centered) showing `getInitials(user.name)` from `useAuthStore((s) => s.user)`, empty when `user` is `null`
