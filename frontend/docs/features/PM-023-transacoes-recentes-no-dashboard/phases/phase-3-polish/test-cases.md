# Phase 3: Polish

- [x] T-014: `RecentTransactionsCard` shows skeleton rows while `useGetDashboard().isLoading` is `true`
- [x] T-015: `RecentTransactionsCard` shows the `role="alert"` error text when `useGetDashboard().error` is set
- [x] T-016: `RecentTransactionsCard` shows `"Nenhuma transação cadastrada ainda."` when `recentTransactions` is `[]` and not loading
- [x] T-017: `RecentTransactionsCard`'s "Ver todas" is a link to `/transactions`
- [x] T-018: Clicking "+ Nova transação" opens `NewTransactionDialog`
- [x] T-019: Submitting the dialog successfully calls `createTransaction` with the form values and closes the dialog
- [x] T-020: `DashboardPage` still renders both `DashboardSummary` and `RecentTransactionsCard` correctly under the shared `useGetDashboard` mock
