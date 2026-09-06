# Transações Recentes no Dashboard - PM-023 - Implementation Plan

## Definition of Ready (DoR) Blueprints

This plan must explicitly define the architectural layers per [docs/architecture/dor.md](../../architecture/dor.md). Each blueprint below should be fully specified, or marked `**Omitted:**` with justification.

### Component Blueprint

**Component Name(s) and file paths:**

- `RecentTransactionsCard` — `src/modules/dashboard/components/recent-transactions-card.tsx` (replaces the PM-022 placeholder)
- `DashboardTransactionRow` — `src/modules/dashboard/components/dashboard-transaction-row.tsx` (new, one row)
- `formatDashboardTransactionDate` / `formatDashboardTransactionValue` — `src/modules/dashboard/utils/format-dashboard-transaction.ts` (new)

**Props type block:**

```ts
// src/modules/dashboard/graphql/queries.ts (extended — see GraphQL/API Blueprint)
export interface DashboardRecentTransaction {
  id: string
  type: 'EXPENSE' | 'INCOME'
  description: string
  date: string
  value: number
  category: { id: string; title: string; color: string; icon: string } | null
}

// src/modules/dashboard/components/dashboard-transaction-row.tsx
export interface DashboardTransactionRowProps {
  transaction: DashboardRecentTransaction
}

// src/modules/dashboard/components/recent-transactions-card.tsx
// No props — calls useGetDashboard() itself (see "Why RecentTransactionsCard owns its
// own data fetch" in Architectural Decisions).
export function RecentTransactionsCard(): JSX.Element
```

**Composition:**

- `RecentTransactionsCard`:
  - Wraps in the existing `Card` primitive (`border border-gray-200 p-6 ring-0`, same as the PM-022 placeholder — no need to touch padding, see Figma Fidelity below: Figma's own padding is per-subsection, not on the outer card).
  - Header row: `<span>` "TRANSAÇÕES RECENTES" (unchanged from placeholder) + `Button variant="link"` "Ver todas", `asChild` wrapping a `Link` (`react-router-dom`) to `/transacoes`, trailing `ChevronRight` (lucide) icon — mirrors the existing inline-link precedent `login-form.tsx`'s `Button variant="link" className="h-auto p-0 ..."` for "Recuperar senha".
  - Body: maps `transactions` (from `useGetDashboard()`) to `DashboardTransactionRow`, one per item.
  - Footer: `Button variant="link"` "+ Nova transação" (leading `Plus` icon), `onClick` opens `NewTransactionDialog` (imported from `@/modules/transactions/components/new-transaction-dialog` — see "Cross-module reuse vs. duplication" below), local `useState<boolean>` for `open`.
  - States: loading → 3 `TransactionRowSkeleton`-style placeholder rows (new, local, NOT imported from `transactions-table.tsx`'s own skeleton — see duplication rationale below) so the card doesn't collapse to nothing while `useGetDashboard()` is in flight; error → reuses `useGetDashboard()`'s existing `error` string, `role="alert"` `text-destructive text-sm` (same pattern as `transactions-table.tsx`); empty → `"Nenhuma transação cadastrada ainda."` (`text-gray-600 text-sm`, verbatim string reused from `transactions-table.tsx:106`, not imported — just the literal string, no shared component needed for one `<p>`).
- `DashboardTransactionRow`: `flex items-center justify-between` — left side `flex items-center gap-3` (icon square + description/date stack), right side `flex items-center gap-3` (`Tag` + value + type icon).
  - Category icon square: **duplicated locally** (see rationale below) as a small `CategoryIconSquare`-equivalent inside `dashboard-transaction-row.tsx` — same `ICON_OPTIONS`/`COLOR_OPTIONS` tables as `transaction-category-cell.tsx` (copy, not import).
  - Category tag: reuses `Tag` from `@/components/ui/tag` (shared DS primitive, not domain-module code — safe to import like `Card`/`Button`), same `COLOR_OPTIONS` lookup as above.
  - Type icon: `transaction.type === 'INCOME' ? <CircleArrowUp className="size-4 text-green-dark" /> : <CircleArrowDown className="size-4 text-red-dark" />` — direct `lucide-react` import, no wrapper needed (confirmed via Figma layer name `icon/circle-arrow-up`/`circle-arrow-down`, exact match to the already-used icons/colors in `transaction-type-indicator.tsx`/`summary-card.tsx`).
  - Date/value formatting: `formatDashboardTransactionDate`/`formatDashboardTransactionValue`, duplicated from `src/modules/transactions/utils/format-transaction.ts` (identical `Intl` formatters + the same UTC-timezone and no-break-space fixes already applied there) — not imported, same isolation rationale.

**States to render:**

- `RecentTransactionsCard`: loading (skeleton rows) / error (`role="alert"`) / empty (`"Nenhuma transação cadastrada ainda."`) / populated (list of `DashboardTransactionRow`). The "+ Nova transação" footer button always renders (even while loading/error/empty) — creating a transaction should be possible regardless of the list's current fetch state, matching how `transactions-table.tsx`'s own "Nova transação" trigger lives outside the table body.
- `DashboardTransactionRow`: populated only — pure presentational, one transaction in, one row out.

**Figma Fidelity** (extracted via Claude-in-Chrome + Figma's own Inspect panel numeric fields — the paid `get_design_context`/`get_variable_defs` MCP tools were skipped per the user's no-credits constraint; every value below is either a directly-read Figma field or an explicit "reused as-is from an existing component" call-out):

| Element | Size (w×h) | Padding | Gap | Radius | Border | BG | Text | Font | Icon |
|---|---|---|---|---|---|---|---|---|---|
| Card container | 2/3 col (`col-span-2`, unchanged from PM-022) | `p-6` (24px, existing `Card` override, unchanged) | — | `rounded-xl` (existing `Card` default) | `border border-gray-200` (existing, unchanged) | `bg-card`/white (existing) | — | — | — |
| Header row | Fill × 61px (Hug) | L 24 / T 20 / R 12 / B 20 → maps to existing `p-6` block padding already on the outer `Card`, so **no extra padding needed** on the header row itself beyond the flex row's own layout (the 24/20/12/20 Figma values are relative to the outer card edge, already covered by the Card's `p-6`) | `justify-between` (title left, link right — Figma uses `space-between` alignment, not a fixed gap) | — | — | — | Title: `Grayscale/gray-500`-family text | Inter Medium 12px / 16px line-height / 0.6px letter-spacing → `text-xs font-medium tracking-wider text-gray-500 uppercase` (same class list as `SummaryCard`'s title — `tracking-wider` is Tailwind's closest scale step to 0.6px, already the accepted approximation used by every existing card title in this app) | — |
| "Ver todas" link | 89×20 (Hug) | 0 | `gap-1` (4px) | — | — | — | `Brand/brand-base` → `text-primary` | text-sm (existing `Button variant="link"` default) | `ChevronRight` (lucide), trailing |
| Transaction row | Fill × 80px (Hug) | 0 (row-level; icon square + text carry their own spacing) | `gap-3` (12px, between icon square and text block, and between tag/value/icon) | — | — | — | — | — | — |
| Category icon square | 40×40 | — | — | `rounded-[8px]` | none | category color, `-light` shade (e.g. `bg-green-light`) | icon: category color, `-base` shade | — | category's `icon` field, looked up same as `transaction-category-cell.tsx`'s `ICON_OPTIONS` |
| Description + date | Hug | — | `gap` between the two lines is Figma's default text line-stack (no explicit gap token) | — | — | — | description `text-gray-800`, date `text-gray-600` | description: `text-sm` (existing row-text convention); date: `text-sm` | — |
| Value + type-icon cell | 160×80 | `pl-6` (24px, left inset from the row's vertical divider) | `gap-2` (8px, between value text and icon) | — | — | — | value: `text-gray-800` (no color-by-sign — confirmed in the screenshot, `+`/`-` sign is the only differentiator, not text color) | `text-sm` | `CircleArrowUp`/`CircleArrowDown` (lucide), 16×16 = `size-4`, `text-green-dark`/`text-red-dark` |
| "+ Nova transação" link | 129×20 (Hug) | 0 | `gap-1` (4px) | — | — | — | `Brand/brand-base` → `text-primary` | text-sm | `Plus` (lucide), leading |

New component variant needed: **none** — every element maps to an existing `src/components/ui/*` primitive (`Card`, `Button variant="link"`, `Tag`) or a direct `lucide-react` icon already used elsewhere in the app with the same color tokens.

### GraphQL/API Blueprint

**Query:** `GET_DASHBOARD` — extended in `src/modules/dashboard/graphql/queries.ts` (existing file)

```ts
export const GET_DASHBOARD = gql`
  query GetDashboard {
    dashboard {
      movement {
        income
        expense
        totalBalance
      }
      recentTransactions {
        id
        type
        description
        date
        value
        category {
          id
          title
          color
          icon
        }
      }
    }
  }
`

export interface DashboardRecentTransaction {
  id: string
  type: 'EXPENSE' | 'INCOME'
  description: string
  date: string
  value: number
  category: { id: string; title: string; color: string; icon: string } | null
}

export interface GetDashboardData {
  dashboard: {
    movement: DashboardMovement
    recentTransactions: DashboardRecentTransaction[]
  }
}
```

Backend already returns this field (`server/src/modules/dashboard/types/dashboard.types.ts::DashboardSummary.recentTransactions`, capped at 5 via `TransactionRepository.findAllByUserId(..., { first: 5, after: null })` in `get-dashboard.use-case.ts`) — zero backend changes needed, this is purely a frontend query extension.

**Hook:** `useGetDashboard` — extended in `src/modules/dashboard/hooks/use-get-dashboard.ts` (existing file)

```ts
export interface UseGetDashboardResult {
  movement: DashboardMovement | null
  recentTransactions: DashboardRecentTransaction[]
  isLoading: boolean
  error: string | null
}

export function useGetDashboard(): UseGetDashboardResult
```

Adds `recentTransactions: data?.dashboard.recentTransactions ?? []` to the existing return object. `fetchPolicy: 'cache-and-network'` is unchanged — already the right policy for "always show current data" money screens (per PM-021's rationale), and now also covers the transaction list for the same reason (e.g. user creates a transaction on `/transacoes`, navigates back to `/dashboard` — the list should reflect it, not a stale cache-first read).

**Mutation reuse:** `CREATE_TRANSACTION` — no new mutation. `useCreateTransaction` (`src/modules/transactions/hooks/use-create-transaction.ts`) gets a **new optional parameter**, backward compatible with its existing no-arg callers (`TransactionsPage`, `use-create-transaction.test.ts`):

```ts
import type { DocumentNode } from '@apollo/client'

export interface UseCreateTransactionOptions {
  // Extra queries to refetch alongside LIST_TRANSACTIONS — e.g. GET_DASHBOARD when the
  // create flow is opened from the dashboard, where LIST_TRANSACTIONS isn't an active
  // query so refetching only it would leave RecentTransactionsCard stale. Apollo no-ops
  // a refetchQueries entry for a query that has no active watcher, so passing
  // GET_DASHBOARD here from a screen where it isn't mounted (irrelevant since this
  // option is only ever passed from the dashboard) is never a concern either way.
  additionalRefetchQueries?: DocumentNode[]
}

export function useCreateTransaction(
  options?: UseCreateTransactionOptions,
): UseCreateTransactionResult
```

Internally: `refetchQueries: [LIST_TRANSACTIONS, ...(options?.additionalRefetchQueries ?? [])]`. `RecentTransactionsCard` calls `useCreateTransaction({ additionalRefetchQueries: [GET_DASHBOARD] })`. This keeps the dependency one-directional (`dashboard` module imports from `transactions`; `transactions`'s hook stays unaware of `dashboard`'s query, only accepting an opaque `DocumentNode` list) — see Architectural Decisions for why this direction is the acceptable one.

**Cache strategy:** Query: `fetchPolicy: 'cache-and-network'` (unchanged, see above). Mutation: `refetchQueries` (unchanged mechanism, extended list) — no optimistic response (matches the existing `useCreateTransaction`/`useDeleteTransaction` precedent of refetch-over-optimistic-update for this app).

**Loading/Error handling:** Owned by `RecentTransactionsCard` itself (component layer), reading `isLoading`/`error` straight off its own `useGetDashboard()` call — see Component Blueprint's "States to render".

### Form & Validation Blueprint

**Omitted:** No new form. The "+ Nova transação" button opens the existing `NewTransactionDialog` (`src/modules/transactions/components/new-transaction-dialog.tsx`), which already owns `TransactionForm` + its Zod schema — reused verbatim, zero changes to that flow's validation.

### State Blueprint

**Omitted:** No state beyond `useGetDashboard`'s own Apollo query state (already covered in GraphQL/API Blueprint) and a local `useState<boolean>` in `RecentTransactionsCard` for the dialog's `open` flag (component-local, same pattern as `TransactionsPage`'s `newDialogOpen`). No context, no new React Query key (Apollo-only, per `CLAUDE.md`).

---

## Architectural Decisions

- **Scope & Requirements:** Success criteria and out-of-scope items are enumerated in `spec.md`. No backward-compatibility constraint beyond `useCreateTransaction`'s new parameter being optional (verified against its only existing caller, `TransactionsPage`, and its test file).
- **Data & State:** Reads `dashboard.recentTransactions` (new field on the already-fetched `GET_DASHBOARD` query). No new Apollo `typePolicies` — `recentTransactions` is a plain array under `ROOT_QUERY.dashboard`, refetched wholesale (not paginated), so no normalization/merge policy is needed.
- **User Experience:** Happy path — user opens `/dashboard`, sees the 5 most recent transactions, clicks "Ver todas" to go deep on `/transacoes`, or clicks "+ Nova transação" to add one without leaving the page (toast + list refresh in place). Loading: skeleton rows (not a full-page spinner — keeps the summary cards above visible and stable). Error: inline `role="alert"` text, scoped to this card only (a `recentTransactions` fetch failure doesn't need to blank out `DashboardSummary`, which reads the same query's `movement` field — if the whole query fails both would show their own error text redundantly, which is acceptable and matches how `DashboardSummary`/`RecentTransactionsCard` each already own their slice of `useGetDashboard()`'s result independently). Accessibility: error text keeps `role="alert"`; the "Ver todas"/"+ Nova transação" links are real `<Button>`/`<Link>` elements (keyboard-focusable, no `div`-with-`onClick`).
- **Testing & Validation:** Vitest + RTL. `useGetDashboard` gets new test cases for `recentTransactions` (mirrors its existing `movement` test cases). `DashboardTransactionRow` tested in isolation (icon/tag/value/date rendering per a given transaction, income vs. expense icon color). `RecentTransactionsCard` tested with mocked `useGetDashboard`/`useCreateTransaction` (component-level, same mocking pattern as `transactions-page.test.tsx`): loading/error/empty/populated states, "Ver todas" `href`, dialog open/close, refetch wiring. No E2E (not set up in this repo).
- **Security Considerations:** `dashboard.recentTransactions` is already scoped server-side to `requireCurrentUser(ctx)` (same resolver as `movement`) — no new exposure. Transaction `description` is user-authored free text rendered as plain React children (auto-escaped by JSX, no `dangerouslySetInnerHTML`) — no new XSS surface, same as the existing `transactions-table.tsx` row rendering.
- **Cross-Cutting Concerns:** No new logging. Toast: reused as-is from `NewTransactionDialog` (`toast.success('Transação criada com sucesso!')` already fires on success — no change needed). Loading/error ownership stays component-local to `RecentTransactionsCard`, no shared error boundary introduced.
- **Error Scenarios & Failure Modes:** `useGetDashboard`'s `error` already collapses network/GraphQL errors into one fallback message (existing behavior, unchanged) — `RecentTransactionsCard` just reads it. Nullable-field edge case: `category` is nullable per schema (confirmed via `TransactionResolver.category`'s `Promise<TransactionCategoryType | null>` return), already handled the same way `transaction-category-cell.tsx` handles it. Race condition: creating a transaction while the list is already refetching (e.g. double-click) — `useCreateTransaction`'s `isLoading` (mutation `loading`) already disables `TransactionForm`'s submit button via the existing `isLoading` prop, no new guard needed.
- **Performance & Scale:** List is capped at 5 by the backend (`first: 5`), no client-side pagination/`fetchMore` — matches `spec.md`'s Out of Scope. No `useMemo`/virtualization needed for 5 rows.
- **Module Composition — cross-module reuse vs. duplication:** This codebase has a strict no-cross-domain-module-import convention on the frontend (verified: zero existing imports between `transactions`/`categories`/`dashboard`; explicitly called out in `transaction-category-cell.tsx`'s comment, which duplicates `categories`' icon/color options rather than importing them). This feature makes **one deliberate, documented exception**: `RecentTransactionsCard` imports `NewTransactionDialog` and `useCreateTransaction` from `@/modules/transactions/*`. Rationale — the alternative is duplicating an entire form+Zod-validation+mutation flow (`TransactionForm`, its schema, `CREATE_TRANSACTION`, field-error mapping), which is a correctness/maintenance liability (two forms drifting apart) with no isolation benefit proportional to its cost. Everything smaller stays duplicated per the existing precedent: category icon/color lookup tables, and date/value formatting (both trivial, already-precedented duplications).
- **Why `RecentTransactionsCard` owns its own data fetch (not props from `DashboardPage`):** `DashboardSummary` (PM-021) takes `movement` as a prop from `DashboardPage`. `RecentTransactionsCard` instead calls `useGetDashboard()` directly. This is an intentional, minimal-diff deviation, not an inconsistency oversight: `DashboardHighlights` (PM-022) is a prop-less pure layout component; threading `recentTransactions`/`isLoading`/`error` through it to reach `RecentTransactionsCard` would mean changing its signature for a component that otherwise has zero data needs (`DashboardCategoriesCard` stays a placeholder in this feature). Apollo Client dedupes concurrent `useQuery(GET_DASHBOARD)` calls against the same cache entry — a second call site does not trigger a second network request — so this has no cache-consistency or performance downside, and keeps `DashboardHighlights` unchanged.
- **Deployment & Operations:** No new env var, no feature flag. Manual post-deploy check: open `/dashboard`, confirm the 5 most recent transactions render with correct icons/tags/values; click "Ver todas" (lands on `/transacoes`); click "+ Nova transação", submit, confirm the new transaction appears in the dashboard list and the summary cards update without a page reload.
- **Backward Compatibility:** `useCreateTransaction`'s new parameter is optional — existing callers (`TransactionsPage`, its own test file) keep working unchanged, verified by re-running the existing test suite (no expected changes to `use-create-transaction.test.ts`). `GetDashboardData`/`UseGetDashboardResult` gain a new required field (`recentTransactions`) — `DashboardSummary`'s prop type (`DashboardMovement` only) is untouched, so it's not a breaking change to that component's public props.

## Implementation Phases

### Phase 1: Foundation

- [ ] Extend `GET_DASHBOARD` (`src/modules/dashboard/graphql/queries.ts`) to select `recentTransactions { id type description date value category { id title color icon } }`; add `DashboardRecentTransaction` interface and extend `GetDashboardData` per GraphQL/API Blueprint
- [ ] Extend `useGetDashboard()` (`src/modules/dashboard/hooks/use-get-dashboard.ts`): add `recentTransactions: data?.dashboard.recentTransactions ?? []` to `UseGetDashboardResult` and its return object
- [ ] Unit tests for `useGetDashboard`'s new field (`src/modules/dashboard/hooks/__tests__/use-get-dashboard.test.tsx`): returns `recentTransactions` from mocked `data.dashboard.recentTransactions`; returns `recentTransactions: []` before the query resolves
- [ ] Implement `formatDashboardTransactionDate(iso: string): string` and `formatDashboardTransactionValue(cents: number, type: 'EXPENSE' | 'INCOME'): string` (`src/modules/dashboard/utils/format-dashboard-transaction.ts`) — identical implementation to `src/modules/transactions/utils/format-transaction.ts` (UTC-timezone date formatter, no-break-space normalization on value)
- [ ] Unit tests (`src/modules/dashboard/utils/__tests__/format-dashboard-transaction.test.ts`): same cases as `format-transaction.test.ts` — date formats as `DD/MM/YY` in UTC; value formats with `+`/`-` sign per `type`, no `U+00A0`

### Phase 2: Features

- [ ] Extend `useCreateTransaction` (`src/modules/transactions/hooks/use-create-transaction.ts`) with the optional `UseCreateTransactionOptions` parameter per GraphQL/API Blueprint — `refetchQueries: [LIST_TRANSACTIONS, ...(options?.additionalRefetchQueries ?? [])]`
- [ ] Unit tests for the new parameter (`src/modules/transactions/hooks/__tests__/use-create-transaction.test.ts`): existing no-arg test still passes unmodified; new case — called with `{ additionalRefetchQueries: [SOME_QUERY] }` includes it in the mutation's `refetchQueries`
- [ ] Implement `DashboardTransactionRow` (`src/modules/dashboard/components/dashboard-transaction-row.tsx`), props `DashboardTransactionRowProps` per Component Blueprint — local category icon-square (duplicated `ICON_OPTIONS`/`COLOR_OPTIONS`), `Tag` for the category pill, `CircleArrowUp`/`CircleArrowDown` (`size-4`, `text-green-dark`/`text-red-dark`) per `transaction.type`, `formatDashboardTransactionDate`/`formatDashboardTransactionValue` for text
- [ ] Component tests for `DashboardTransactionRow` (`src/modules/dashboard/components/__tests__/dashboard-transaction-row.test.tsx`): renders description/date/category title/formatted value; renders `CircleArrowUp`+`text-green-dark` for `type: 'INCOME'`; renders `CircleArrowDown`+`text-red-dark` for `type: 'EXPENSE'`; renders correctly when `category` is `null`
- [ ] Replace the placeholder in `RecentTransactionsCard` (`src/modules/dashboard/components/recent-transactions-card.tsx`) with real content per Component Blueprint: header (title + "Ver todas" `Button variant="link"` + `Link to="/transacoes"` + `ChevronRight`), body (`recentTransactions.map` → `DashboardTransactionRow`), footer ("+ Nova transação" `Button variant="link"` + `Plus`, opens `NewTransactionDialog` via local `open` state), calling `useGetDashboard()` and `useCreateTransaction({ additionalRefetchQueries: [GET_DASHBOARD] })` itself

### Phase 3: Polish

- [ ] Component tests for `RecentTransactionsCard` (`src/modules/dashboard/components/__tests__/recent-transactions-card.test.tsx`, mocking `useGetDashboard`/`useCreateTransaction` same as `transactions-page.test.tsx`'s pattern): shows skeleton rows while `isLoading`; shows `role="alert"` error text; shows `"Nenhuma transação cadastrada ainda."` when `recentTransactions` is `[]`; renders one `DashboardTransactionRow` per item when populated; "Ver todas" links to `/transacoes`; clicking "+ Nova transação" opens `NewTransactionDialog`; submitting the dialog calls `createTransaction` and closes it on success
- [ ] Update `dashboard-page.test.tsx`'s existing "renders DashboardHighlights regardless of loading state" test if it now needs to mock `useGetDashboard` differently for the nested `RecentTransactionsCard` call (check whether the existing `vi.mock('@/modules/dashboard/hooks/use-get-dashboard')` + single `mockReturnValue` already covers both call sites, since both `DashboardPage` and `RecentTransactionsCard` call the same mocked hook)
- [ ] Accessibility pass: confirm "Ver todas"/"+ Nova transação" are focusable interactive elements (`Button`/`Link`, not styled `div`s); confirm the error paragraph keeps `role="alert"` — verified in the tests above, no separate manual step

## Test Cases

### Phase 1: Foundation

- [ ] `useGetDashboard` returns `recentTransactions` from `data.dashboard.recentTransactions`
- [ ] `useGetDashboard` returns `recentTransactions: []` before the query resolves
- [ ] `formatDashboardTransactionDate('2025-11-30T00:00:00.000Z')` → `"30/11/25"` (UTC, not shifted by local timezone)
- [ ] `formatDashboardTransactionValue(425000, 'INCOME')` → `"+ R$ 4.250,00"`
- [ ] `formatDashboardTransactionValue(8950, 'EXPENSE')` → `"- R$ 89,50"`
- [ ] `formatDashboardTransactionValue` output has no `U+00A0` characters

### Phase 2: Features

- [ ] `useCreateTransaction()` (no args) still refetches only `LIST_TRANSACTIONS` (existing behavior unchanged)
- [ ] `useCreateTransaction({ additionalRefetchQueries: [X] })` refetches `LIST_TRANSACTIONS` and `X`
- [ ] `DashboardTransactionRow` renders the transaction's `description`, formatted `date`, category `title`, and formatted `value`
- [ ] `DashboardTransactionRow` renders `CircleArrowUp` with `text-green-dark` when `type: 'INCOME'`
- [ ] `DashboardTransactionRow` renders `CircleArrowDown` with `text-red-dark` when `type: 'EXPENSE'`
- [ ] `DashboardTransactionRow` renders without crashing when `category` is `null`
- [ ] `RecentTransactionsCard` renders one `DashboardTransactionRow` per item in `recentTransactions`

### Phase 3: Polish

- [ ] `RecentTransactionsCard` shows skeleton rows while `useGetDashboard().isLoading` is `true`
- [ ] `RecentTransactionsCard` shows the `role="alert"` error text when `useGetDashboard().error` is set
- [ ] `RecentTransactionsCard` shows `"Nenhuma transação cadastrada ainda."` when `recentTransactions` is `[]` and not loading
- [ ] `RecentTransactionsCard`'s "Ver todas" is a link to `/transacoes`
- [ ] Clicking "+ Nova transação" opens `NewTransactionDialog`
- [ ] Submitting the dialog successfully calls `createTransaction` with the form values and closes the dialog
- [ ] `DashboardPage` still renders both `DashboardSummary` and `RecentTransactionsCard` correctly under the shared `useGetDashboard` mock
