# Bloco de Resumo do Dashboard - PM-021 - Test Cases

## Phase 1: Foundation

- [x] T-001: `useGetDashboard` passes no variables (query takes none) and returns `movement` from `data.dashboard.movement`
- [x] T-002: `useGetDashboard` returns `movement: null` and `isLoading: true` before the query resolves
- [x] T-003: `useGetDashboard` returns the fallback error message and `movement: null` on a network error
- [x] T-004: `formatCurrencyValue(0)` → `"R$ 0,00"`
- [x] T-005: `formatCurrencyValue(1284732)` → `"R$ 12.847,32"`
- [x] T-006: `formatCurrencyValue` output has no `U+00A0` characters (regular space only, same guard as `formatTransactionValue`)

## Phase 2: Features

- [x] T-007: `SummaryCard` with `mode="balance"` renders the `Wallet` icon with `text-purple-base` and the given `title`/formatted `value`
- [x] T-008: `SummaryCard` with `mode="income"` renders the `CircleArrowUp` icon with `text-green-dark`
- [x] T-009: `SummaryCard` with `mode="expense"` renders the `CircleArrowDown` icon with `text-red-dark`
- [x] T-010: `DashboardSummary` renders 3 `SummaryCard`s in order: balance, income, expense, each with the corresponding `movement` field as `value`

## Phase 3: Polish

- [x] T-011: `DashboardPage` shows the loading text while `useGetDashboard().isLoading` is `true`
- [x] T-012: `DashboardPage` shows the `role="alert"` error message when `useGetDashboard().error` is set
- [x] T-013: `DashboardPage` renders `DashboardSummary` with the resolved `movement` once loaded without error
