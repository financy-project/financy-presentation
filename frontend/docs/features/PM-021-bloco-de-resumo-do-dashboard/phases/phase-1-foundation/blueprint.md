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
