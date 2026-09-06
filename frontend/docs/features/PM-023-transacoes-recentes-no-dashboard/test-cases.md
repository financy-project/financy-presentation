# Transações Recentes no Dashboard - PM-023 - Test Cases

## Phase 1: Foundation

- [x] T-001: `useGetDashboard` returns `recentTransactions` from `data.dashboard.recentTransactions`
- [x] T-002: `useGetDashboard` returns `recentTransactions: []` before the query resolves
- [x] T-003: `formatDashboardTransactionDate('2025-11-30T00:00:00.000Z')` → `"30/11/25"` (UTC, not shifted by local timezone)
- [x] T-004: `formatDashboardTransactionValue(425000, 'INCOME')` → `"+ R$ 4.250,00"`
- [x] T-005: `formatDashboardTransactionValue(8950, 'EXPENSE')` → `"- R$ 89,50"`
- [x] T-006: `formatDashboardTransactionValue` output has no `U+00A0` characters

## Phase 2: Features

- [x] T-007: `useCreateTransaction()` (no args) still refetches only `LIST_TRANSACTIONS` (existing behavior unchanged)
- [x] T-008: `useCreateTransaction({ additionalRefetchQueries: [X] })` refetches `LIST_TRANSACTIONS` and `X`
- [x] T-009: `DashboardTransactionRow` renders the transaction's `description`, formatted `date`, category `title`, and formatted `value`
- [x] T-010: `DashboardTransactionRow` renders `CircleArrowUp` with `text-green-dark` when `type: 'INCOME'`
- [x] T-011: `DashboardTransactionRow` renders `CircleArrowDown` with `text-red-dark` when `type: 'EXPENSE'`
- [x] T-012: `DashboardTransactionRow` renders without crashing when `category` is `null`
- [x] T-013: `RecentTransactionsCard` renders one `DashboardTransactionRow` per item in `recentTransactions`

## Phase 3: Polish

- [x] T-014: `RecentTransactionsCard` shows skeleton rows while `useGetDashboard().isLoading` is `true`
- [x] T-015: `RecentTransactionsCard` shows the `role="alert"` error text when `useGetDashboard().error` is set
- [x] T-016: `RecentTransactionsCard` shows `"Nenhuma transação cadastrada ainda."` when `recentTransactions` is `[]` and not loading
- [x] T-017: `RecentTransactionsCard`'s "Ver todas" is a link to `/transactions`
- [x] T-018: Clicking "+ Nova transação" opens `NewTransactionDialog`
- [x] T-019: Submitting the dialog successfully calls `createTransaction` with the form values and closes the dialog
- [x] T-020: `DashboardPage` still renders both `DashboardSummary` and `RecentTransactionsCard` correctly under the shared `useGetDashboard` mock
