# Phase 2: Features

- [x] T-007: `useCreateTransaction()` (no args) still refetches only `LIST_TRANSACTIONS` (existing behavior unchanged)
- [x] T-008: `useCreateTransaction({ additionalRefetchQueries: [X] })` refetches `LIST_TRANSACTIONS` and `X`
- [x] T-009: `DashboardTransactionRow` renders the transaction's `description`, formatted `date`, category `title`, and formatted `value`
- [x] T-010: `DashboardTransactionRow` renders `CircleArrowUp` with `text-green-dark` when `type: 'INCOME'`
- [x] T-011: `DashboardTransactionRow` renders `CircleArrowDown` with `text-red-dark` when `type: 'EXPENSE'`
- [x] T-012: `DashboardTransactionRow` renders without crashing when `category` is `null`
- [x] T-013: `RecentTransactionsCard` renders one `DashboardTransactionRow` per item in `recentTransactions`
