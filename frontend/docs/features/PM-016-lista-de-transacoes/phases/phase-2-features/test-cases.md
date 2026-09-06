### Phase 2: Features

- [x] T-008: `TransactionCategoryCell` renders the mapped icon + tinted background for a known category color/icon
- [x] T-009: `TransactionCategoryCell` falls back to a generic icon when `category` is `null`
- [x] T-010: `formatTransactionValue` formats `8850`/`EXPENSE` as `"- R$ 88,50"` and `34025`/`INCOME` as `"+ R$ 340,25"`
- [x] T-011: `formatTransactionDate` formats an ISO date as `"30/11/25"` (2-digit year)
- [x] T-012: `TransactionsTable` shows the loading message while `isLoading`
- [x] T-013: `TransactionsTable` shows the error message when `error` is set
- [x] T-014: `TransactionsTable` shows the empty-state message when `transactions` is `[]` and not loading/error
- [x] T-015: `TransactionsTable` renders one row per transaction with description/date/category/type/value, and two inert action buttons (clicking them calls no mutation — assert no `updateTransaction`/`deleteTransaction` mock is triggered)
- [x] T-016: `TransactionsTable` calls `onPageChange` when a page button is clicked
- [x] T-017: `TransactionsPage` renders `TransactionsTable` below `PageHeader` and passes through `useListTransactions`'s values
