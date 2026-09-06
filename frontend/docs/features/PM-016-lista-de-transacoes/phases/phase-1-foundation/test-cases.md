### Phase 1: Foundation

- [x] T-001: `useListTransactions` passes `{ first: 10, after: undefined }` on initial mount
- [x] T-002: `useListTransactions` returns `isLoading: true` before the query resolves, `transactions: []` (mirrors `useListCategories`'s "before resolve" test)
- [x] T-003: `useListTransactions` sets the fallback error message on a network error, `transactions` stays `[]`
- [x] T-004: `useListTransactions.goToPage(2)` after page 1 resolves with `hasNextPage: true` re-queries with `after: <page 1's endCursor>`
- [x] T-005: `useListTransactions.goToPage(n)` is a no-op when page `n`'s cursor isn't yet known (`n > maxVisitedPage + 1`)
- [x] T-006: `useListTransactions.totalPages` computes `Math.ceil(totalRecord / 10)` from the mocked response
- [x] T-007: `Pagination` renders with a custom `className` merged alongside its default classes, unchanged when `className` is omitted
