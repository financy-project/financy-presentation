# Bloco de Resumo do Dashboard - PM-021 - Implementation Plan

## Definition of Ready (DoR) Blueprints

This plan must explicitly define the architectural layers per [docs/architecture/dor.md](../../architecture/dor.md). Each blueprint below should be fully specified, or marked `**Omitted:**` with justification.

### Component Blueprint

**Component Name(s) and file paths:**

- `SummaryCard` — `src/modules/dashboard/components/summary-card.tsx` (new)
- `DashboardSummary` — `src/modules/dashboard/components/dashboard-summary.tsx` (new)
- `DashboardPage` — moved from `src/pages/dashboard-page.tsx` to `src/modules/dashboard/pages/dashboard-page.tsx` (see Backward Compatibility below for why)

**Props type block:**

```ts
// src/modules/dashboard/components/summary-card.tsx
export type SummaryCardMode = "income" | "expense" | "balance"

export type SummaryCardProps = {
  mode: SummaryCardMode
  title: string
  value: number // cents, same convention as formatTransactionValue
}
```

```ts
// src/modules/dashboard/components/dashboard-summary.tsx
export type DashboardSummaryProps = {
  movement: DashboardMovement // from src/modules/dashboard/graphql/queries.ts
}
```

**Composition:**

- `SummaryCard` renders `Card` from `@/components/ui/card`, with the same flat-card override already used by the analogous `CategoriesSummary` (PM-013): `className="border border-gray-200 p-6 ring-0"`.
  - Top row: mode icon + `title`, `flex items-center gap-2`.
    - `mode: "balance"` → `Wallet` (lucide-react), `className="size-4 text-purple-base"`
    - `mode: "income"` → `CircleArrowUp` (lucide-react), `className="size-4 text-green-dark"` — same icon+color already used for `income` in `src/components/transaction-type-indicator.tsx`
    - `mode: "expense"` → `CircleArrowDown` (lucide-react), `className="size-4 text-red-dark"` — same icon+color already used for `expense` in `transaction-type-indicator.tsx`
    - `title` text: `text-xs font-medium tracking-wider text-gray-500 uppercase` (matches `format`/token used by `CategoriesSummary`'s label — `gray-500` = `#6B7280`, matches spec)
  - Bottom row: `value`, formatted via a new `formatCurrencyValue(cents: number): string` helper (see below) — `text-2xl font-bold text-gray-800`
- `DashboardSummary` is a pure layout component: `<div className="grid grid-cols-3 gap-6">` rendering 3 `SummaryCard`s from `movement`:
  - `<SummaryCard mode="balance" title="Saldo Total" value={movement.totalBalance} />`
  - `<SummaryCard mode="income" title="Receitas do Mês" value={movement.income} />`
  - `<SummaryCard mode="expense" title="Despesas do Mês" value={movement.expense} />`
- No new shadcn primitive needed — `Card` already exists.
- New currency helper: `formatCurrencyValue` — `src/modules/dashboard/utils/format-currency-value.ts`. Not reused from `src/modules/transactions/utils/format-transaction.ts::formatTransactionValue` because that function always prefixes a `+`/`-` sign derived from a transaction `type` (`'EXPENSE' | 'INCOME'`), which doesn't apply here (`totalBalance` isn't typed as income/expense, and the cards show a plain masked value, no sign, per the reference image). Both helpers share the same `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` formatter shape.

**States to render:**

- `SummaryCard` / `DashboardSummary`: **populated only** — pure presentational components, no internal loading/error/empty state. They only render once `DashboardPage` has resolved `movement` (see GraphQL/API Blueprint's Loading/Error handling — same ownership pattern as `CategoriesPage` → `CategoriesSummary`).
- `DashboardPage` owns loading / error / populated, mirroring `CategoriesPage`:
  - loading: `<p className="mt-6 text-gray-600">Carregando resumo…</p>`
  - error: `<p role="alert" className="text-destructive mt-6 text-sm">{error}</p>`
  - populated: renders `<DashboardSummary movement={movement} />`
  - No distinct "empty" state: `movement.{income,expense,totalBalance}` are always-present `Int` fields (never null/undefined per the `DashboardMovementType` GraphQL schema) — a zero-value month is a normal populated state (`R$ 0,00`), not an empty state.

**Figma Fidelity:** Not applicable — `spec.md` has no `figma.com` link, only a reference screenshot (`.workspace/image copy 8.png`). Values above (colors, icon choice, layout) are read directly off that image and cross-checked against tokens already in `src/index.css` and existing components (`transaction-type-indicator.tsx`, `categories-summary.tsx`), not from a `/figma-fidelity` spec table.

### GraphQL/API Blueprint

**Query name:** `GET_DASHBOARD` — `src/modules/dashboard/graphql/queries.ts` (new)

```ts
import { gql } from '@apollo/client'

export const GET_DASHBOARD = gql`
  query GetDashboard {
    dashboard {
      movement {
        income
        expense
        totalBalance
      }
    }
  }
`

export interface DashboardMovement {
  income: number
  expense: number
  totalBalance: number
}

export interface GetDashboardData {
  dashboard: {
    movement: DashboardMovement
  }
}
```

Only `movement` is selected — `dashboard.recentTransactions` and `dashboard.balanceByCategory` exist on the server (`DashboardType`) but belong to future dashboard blocks explicitly out of scope for PM-021 (see spec.md). Those features will extend this query (or add their own) when built; no speculative fields added now.

**Hook:** `useGetDashboard` — `src/modules/dashboard/hooks/use-get-dashboard.ts` (new)

```ts
export interface UseGetDashboardResult {
  movement: DashboardMovement | null
  isLoading: boolean
  error: string | null
}

export function useGetDashboard(): UseGetDashboardResult
```

Mirrors `useListCategories` (`src/modules/categories/hooks/use-list-categories.ts`) exactly: `const { data, loading, error } = useQuery<GetDashboardData>(GET_DASHBOARD, { fetchPolicy: 'cache-and-network' })`, returns `{ movement: data?.dashboard.movement ?? null, isLoading: loading, error: error ? FALLBACK_ERROR_MESSAGE : null }` with `FALLBACK_ERROR_MESSAGE = 'Não foi possível carregar o resumo do dashboard.'`.

**Cache strategy:** `fetchPolicy: 'cache-and-network'` (not the codebase's usual default `cache-first`, used by `useListCategories`) — deliberate deviation: this is money data the user expects to be current every time they land on `/dashboard` (e.g. after adding a transaction on `/transacoes` and navigating back), so we trade one extra background request for freshness. No mutation touches this query in this feature, so no `refetchQueries`/`update`/optimistic response is needed.

**Loading/Error handling:** owned by `DashboardPage` (component layer), not the hook — same split as `CategoriesPage`/`useListCategories`. See Component Blueprint's "States to render" above for the exact markup.

### Form & Validation Blueprint

**Omitted:** This feature is read-only display of server-computed values — no form, no user-typed input anywhere in this block.

### State Blueprint

**Omitted:** No state beyond the `useGetDashboard` Apollo Client query hook's own internal state (loading/error/data). No component-local `useState`, no shared context, no new React Query key (this project uses Apollo Client, not React Query, for GraphQL data — React Query is reserved for non-GraphQL async/local state per `CLAUDE.md`, not needed here).

---

## Architectural Decisions

- **Scope & Requirements:** Success criteria and out-of-scope items are fully enumerated in `spec.md`'s Acceptance Criteria / Out of Scope sections. No backward-compatibility constraint beyond keeping `/dashboard` reachable at the same route.
- **Data & State:** Reads `dashboard.movement` (`income`, `expense`, `totalBalance`, all `Int`/cents) via `GET_DASHBOARD`. No mutation, no client-only state. Apollo cache: default `InMemoryCache` normalization is sufficient — `dashboard` has no `id`/`__typename` key fields relevant here, cached under `ROOT_QUERY.dashboard`; `fetchPolicy: 'cache-and-network'` handles freshness (see GraphQL/API Blueprint), no custom `typePolicies` needed.
- **User Experience:** Happy path — user opens `/dashboard`, sees "Carregando resumo…" briefly, then the 3 cards populated with the current month's balance/income/expense. No interaction on the cards (purely informational, confirmed in spec's Out of Scope). Accessibility: icons are decorative (paired with visible text labels, so no separate `aria-label` needed on the icon itself); error text uses `role="alert"` so it's announced by screen readers, matching `CategoriesPage`'s existing pattern.
- **Testing & Validation:** Vitest + React Testing Library. `useGetDashboard` tested with `MockedProvider` from `@apollo/client/testing/react` (same pattern as `use-list-categories.test.ts`). `SummaryCard` and `DashboardSummary` tested with RTL render + `screen.getByText`/`getByTestId`. No E2E — not set up in this repo yet, not introduced by this feature.
- **Implementation Details:** New module `src/modules/dashboard/` (`graphql/`, `hooks/`, `components/`, `pages/`, `utils/`), mirroring `src/modules/categories/`. No new dependency to add — `lucide-react`, `@apollo/client`, `Card` primitive all already present.
- **Security Considerations:** `dashboard` is already server-side auth-gated (`requireCurrentUser(ctx)` in `dashboard.resolver.ts`) and scoped to the current user (`GetDashboardUseCase.getDashboard(userId)`) — no new exposure. Nothing logged to console. No user-generated input is rendered by this feature (values are server-computed sums), so no XSS surface. Client-side route protection for `/dashboard` remains explicitly out of scope, same as it was for PM-009 — not solved here.
- **Cross-Cutting Concerns:** No new logging. No toast (matches `CategoriesPage`, informational cards don't need a success/failure toast — only the `error` paragraph, on a genuine fetch failure). Loading/error ownership is component-local to `DashboardPage`, no shared error boundary introduced.
- **Error Scenarios & Failure Modes:** Both network errors and GraphQL errors from `useQuery` collapse to the same generic `FALLBACK_ERROR_MESSAGE` (matches `useListCategories`'s handling, not distinguishing error types — established codebase precedent). No nullable-field edge case: `DashboardMovementType`'s 3 fields are all non-null `Int` on the schema. No manual retry button (no existing page in this codebase has one); user can navigate away and back, or reload. No mutation involved, so no race condition to handle.
- **Performance & Scale:** Not applicable — 3 scalar values, no list, no pagination, no `fetchMore`.
- **Module Composition:** Two components with a clear boundary: `SummaryCard` (presentational, reusable across the 3 modes) and `DashboardSummary` (layout/composition, maps `movement` → 3 `SummaryCard`s). `DashboardPage` owns data fetching and loading/error, exactly like `CategoriesPage` → `CategoriesSummary`.
- **Deployment & Operations:** No new env var, no feature flag. Manual post-deploy check: open `/dashboard` while authenticated, confirm the 3 cards render with real backend numbers matching the current month's transactions.
- **Backward Compatibility:** `src/pages/dashboard-page.tsx` moves to `src/modules/dashboard/pages/dashboard-page.tsx` to match the module convention already established by `categories`/`transactions` (both moved their page component into `modules/*/pages/` — `dashboard-page.tsx` was the only page still left behind at the top level, from PM-009 before this module existed). `src/App.tsx`'s import updates from `@/pages/dashboard-page` to `@/modules/dashboard/pages/dashboard-page`; no other file imports `DashboardPage`, so this is a contained rename, not a breaking change to any public API.

## Implementation Phases

### Phase 1: Foundation

- [ ] Add `GET_DASHBOARD` query + `DashboardMovement`/`GetDashboardData` types (`src/modules/dashboard/graphql/queries.ts`) — exact `gql` document and types per GraphQL/API Blueprint above
- [ ] Implement `useGetDashboard()` (`src/modules/dashboard/hooks/use-get-dashboard.ts`): wraps `useQuery<GetDashboardData>(GET_DASHBOARD, { fetchPolicy: 'cache-and-network' })`, returns `{ movement: data?.dashboard.movement ?? null, isLoading: loading, error: error ? 'Não foi possível carregar o resumo do dashboard.' : null }`
- [ ] Unit tests for `useGetDashboard` (`src/modules/dashboard/hooks/__tests__/use-get-dashboard.test.tsx`, `MockedProvider` pattern from `use-list-categories.test.ts`): resolves with mocked `movement`; `movement` is `null` and `isLoading` is `true` before the query resolves; sets the fallback error message on a network error
- [ ] Implement `formatCurrencyValue(cents: number): string` (`src/modules/dashboard/utils/format-currency-value.ts`): `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)`, normalize `U+00A0` → regular space (same fix already applied in `format-transaction.ts`)
- [ ] Unit tests for `formatCurrencyValue` (`src/modules/dashboard/utils/__tests__/format-currency-value.test.ts`): `0` → `"R$ 0,00"`; `1284732` → `"R$ 12.847,32"`; negative cents (e.g. a month with `expense > income`, `totalBalance < 0`) → `"-R$ ..."` (`Intl.NumberFormat` default sign placement, not custom-handled)

### Phase 2: Features

- [ ] Implement `SummaryCard` (`src/modules/dashboard/components/summary-card.tsx`), props `SummaryCardProps` per Component Blueprint — renders `Card` (`border border-gray-200 p-6 ring-0`), mode→icon/color map (`balance`→`Wallet`/`text-purple-base`, `income`→`CircleArrowUp`/`text-green-dark`, `expense`→`CircleArrowDown`/`text-red-dark`), title row (`text-xs font-medium tracking-wider text-gray-500 uppercase`), value row (`formatCurrencyValue(value)`, `text-2xl font-bold text-gray-800`)
- [ ] Implement `DashboardSummary` (`src/modules/dashboard/components/dashboard-summary.tsx`), props `DashboardSummaryProps` per Component Blueprint — `grid grid-cols-3 gap-6` rendering the 3 `SummaryCard`s with `mode`/`title`/`value` wired from `movement` exactly as listed in the Component Blueprint's Composition section
- [ ] Move `src/pages/dashboard-page.tsx` → `src/modules/dashboard/pages/dashboard-page.tsx`; wire `useGetDashboard()` + loading/error/populated states per Component Blueprint's "States to render" (loading: `"Carregando resumo…"`; error: `role="alert"`, `text-destructive`; populated: `<DashboardSummary movement={movement} />`), replacing the `"Dashboard em breve"` placeholder
- [ ] Update `src/App.tsx`'s import from `@/pages/dashboard-page` to `@/modules/dashboard/pages/dashboard-page`

### Phase 3: Polish

- [ ] Component tests for `SummaryCard` (`src/modules/dashboard/components/__tests__/summary-card.test.tsx`): renders `title` text; renders `formatCurrencyValue(value)` text; renders the correct icon+color per `mode` (`balance`/`income`/`expense`), via `data-testid` on the icon wrapper (mirroring `categories-summary.tsx`'s `iconTestId` pattern)
- [ ] Component tests for `DashboardSummary` (`src/modules/dashboard/components/__tests__/dashboard-summary.test.tsx`): renders exactly 3 `SummaryCard`s; each card gets the right `mode`/`title`/`value` from a given `movement` object
- [ ] Page tests for `DashboardPage` (`src/modules/dashboard/pages/__tests__/dashboard-page.test.tsx`, `MockedProvider`-wrapped): shows "Carregando resumo…" while loading; shows the `role="alert"` error message on a mocked GraphQL error; renders `DashboardSummary` once `movement` resolves
- [ ] Accessibility pass: confirm error paragraph keeps `role="alert"`; confirm mode icons have no redundant `aria-label` (title text already labels each card) — verified in the tests above, no separate manual step needed

## Test Cases

### Phase 1: Foundation

- [ ] `useGetDashboard` passes no variables (query takes none) and returns `movement` from `data.dashboard.movement`
- [ ] `useGetDashboard` returns `movement: null` and `isLoading: true` before the query resolves
- [ ] `useGetDashboard` returns the fallback error message and `movement: null` on a network error
- [ ] `formatCurrencyValue(0)` → `"R$ 0,00"`
- [ ] `formatCurrencyValue(1284732)` → `"R$ 12.847,32"`
- [ ] `formatCurrencyValue` output has no `U+00A0` characters (regular space only, same guard as `formatTransactionValue`)

### Phase 2: Features

- [ ] `SummaryCard` with `mode="balance"` renders the `Wallet` icon with `text-purple-base` and the given `title`/formatted `value`
- [ ] `SummaryCard` with `mode="income"` renders the `CircleArrowUp` icon with `text-green-dark`
- [ ] `SummaryCard` with `mode="expense"` renders the `CircleArrowDown` icon with `text-red-dark`
- [ ] `DashboardSummary` renders 3 `SummaryCard`s in order: balance, income, expense, each with the corresponding `movement` field as `value`

### Phase 3: Polish

- [ ] `DashboardPage` shows the loading text while `useGetDashboard().isLoading` is `true`
- [ ] `DashboardPage` shows the `role="alert"` error message when `useGetDashboard().error` is set
- [ ] `DashboardPage` renders `DashboardSummary` with the resolved `movement` once loaded without error

## Dependencies

- No new external dependency — `lucide-react`, `@apollo/client`, `@apollo/client/testing/react` already installed and in use elsewhere in the codebase.
- Internal: `Card` (`@/components/ui/card`), icon/color convention from `src/components/transaction-type-indicator.tsx`, currency-formatting convention from `src/modules/transactions/utils/format-transaction.ts`, page loading/error convention from `src/modules/categories/pages/categories-page.tsx`.
- Backend: `dashboard { movement { income, expense, totalBalance } }`, already implemented and merged (`server/src/modules/dashboard`) — no backend work needed for this feature.

## Risks & Mitigations

| Risk                                                                                   | Impact | Mitigation                                                                                                                      |
| --------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Moving `dashboard-page.tsx` touches `App.tsx`'s import and could silently break the route if missed | Medium | Single grep for `dashboard-page` after the move (`App.tsx` is the only consumer, confirmed during planning); `pnpm build`'s `tsc -b` catches a stale import immediately |
| `totalBalance` can be negative (expense > income for the month) — `formatCurrencyValue` sign placement not explicitly designed against the reference image (which only shows positive values) | Low | Covered by an explicit negative-cents test case in Phase 1; `Intl.NumberFormat` handles the `-` sign natively, no custom logic needed |

## Success Criteria

- [ ] All acceptance criteria in `spec.md` met
- [ ] Tests passing (`pnpm test`)
- [ ] `pnpm build` compiles without errors
