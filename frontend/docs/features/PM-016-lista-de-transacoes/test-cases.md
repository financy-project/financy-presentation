# Lista de Transações - PM-016 - Test Cases

### Phase 1: Foundation

- [x] T-001: `useListTransactions` passes `{ first: 10, after: undefined }` on initial mount
- [x] T-002: `useListTransactions` returns `isLoading: true` before the query resolves, `transactions: []` (mirrors `useListCategories`'s "before resolve" test)
- [x] T-003: `useListTransactions` sets the fallback error message on a network error, `transactions` stays `[]`
- [x] T-004: `useListTransactions.goToPage(2)` after page 1 resolves with `hasNextPage: true` re-queries with `after: <page 1's endCursor>`
- [x] T-005: `useListTransactions.goToPage(n)` is a no-op when page `n`'s cursor isn't yet known (`n > maxVisitedPage + 1`)
- [x] T-006: `useListTransactions.totalPages` computes `Math.ceil(totalRecord / 10)` from the mocked response
- [x] T-007: `Pagination` renders with a custom `className` merged alongside its default classes, unchanged when `className` is omitted

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
