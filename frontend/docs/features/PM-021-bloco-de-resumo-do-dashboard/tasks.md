# Bloco de Resumo do Dashboard - PM-021 - Tasks

## Phase 1: Foundation

- [x] F-001: Add `GET_DASHBOARD` query + `DashboardMovement`/`GetDashboardData` types (`src/modules/dashboard/graphql/queries.ts`) — exact `gql` document and types per GraphQL/API Blueprint above
- [x] F-002: Implement `useGetDashboard()` (`src/modules/dashboard/hooks/use-get-dashboard.ts`): wraps `useQuery<GetDashboardData>(GET_DASHBOARD, { fetchPolicy: 'cache-and-network' })`, returns `{ movement: data?.dashboard.movement ?? null, isLoading: loading, error: error ? 'Não foi possível carregar o resumo do dashboard.' : null }`
- [x] F-003: Unit tests for `useGetDashboard` (`src/modules/dashboard/hooks/__tests__/use-get-dashboard.test.tsx`, `MockedProvider` pattern from `use-list-categories.test.ts`): resolves with mocked `movement`; `movement` is `null` and `isLoading` is `true` before the query resolves; sets the fallback error message on a network error
- [x] F-004: Implement `formatCurrencyValue(cents: number): string` (`src/modules/dashboard/utils/format-currency-value.ts`): `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)`, normalize `U+00A0` → regular space (same fix already applied in `format-transaction.ts`)
- [x] F-005: Unit tests for `formatCurrencyValue` (`src/modules/dashboard/utils/__tests__/format-currency-value.test.ts`): `0` → `"R$ 0,00"`; `1284732` → `"R$ 12.847,32"`; negative cents (e.g. a month with `expense > income`, `totalBalance < 0`) → `"-R$ ..."` (`Intl.NumberFormat` default sign placement, not custom-handled)

## Phase 2: Features

- [x] F-006: Implement `SummaryCard` (`src/modules/dashboard/components/summary-card.tsx`), props `SummaryCardProps` per Component Blueprint — renders `Card` (`border border-gray-200 p-6 ring-0`), mode→icon/color map (`balance`→`Wallet`/`text-purple-base`, `income`→`CircleArrowUp`/`text-green-dark`, `expense`→`CircleArrowDown`/`text-red-dark`), title row (`text-xs font-medium tracking-wider text-gray-500 uppercase`), value row (`formatCurrencyValue(value)`, `text-2xl font-bold text-gray-800`)
- [x] F-007: Implement `DashboardSummary` (`src/modules/dashboard/components/dashboard-summary.tsx`), props `DashboardSummaryProps` per Component Blueprint — `grid grid-cols-3 gap-6` rendering the 3 `SummaryCard`s with `mode`/`title`/`value` wired from `movement` exactly as listed in the Component Blueprint's Composition section
- [x] F-008: Move `src/pages/dashboard-page.tsx` → `src/modules/dashboard/pages/dashboard-page.tsx`; wire `useGetDashboard()` + loading/error/populated states per Component Blueprint's "States to render" (loading: `"Carregando resumo…"`; error: `role="alert"`, `text-destructive`; populated: `<DashboardSummary movement={movement} />`), replacing the `"Dashboard em breve"` placeholder
- [x] F-009: Update `src/App.tsx`'s import from `@/pages/dashboard-page` to `@/modules/dashboard/pages/dashboard-page`

## Phase 3: Polish

- [x] F-010: Component tests for `SummaryCard` (`src/modules/dashboard/components/__tests__/summary-card.test.tsx`): renders `title` text; renders `formatCurrencyValue(value)` text; renders the correct icon+color per `mode` (`balance`/`income`/`expense`), via `data-testid` on the icon wrapper (mirroring `categories-summary.tsx`'s `iconTestId` pattern)
- [x] F-011: Component tests for `DashboardSummary` (`src/modules/dashboard/components/__tests__/dashboard-summary.test.tsx`): renders exactly 3 `SummaryCard`s; each card gets the right `mode`/`title`/`value` from a given `movement` object
- [x] F-012: Page tests for `DashboardPage` (`src/modules/dashboard/pages/__tests__/dashboard-page.test.tsx`, `MockedProvider`-wrapped): shows "Carregando resumo…" while loading; shows the `role="alert"` error message on a mocked GraphQL error; renders `DashboardSummary` once `movement` resolves
- [x] F-013: Accessibility pass: confirm error paragraph keeps `role="alert"`; confirm mode icons have no redundant `aria-label` (title text already labels each card) — verified in the tests above, no separate manual step needed
