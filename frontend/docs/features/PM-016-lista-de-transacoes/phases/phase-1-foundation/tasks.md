### Phase 1: Foundation

- [x] F-001: Add shadcn `Table` primitive: `pnpm dlx shadcn@latest add table` (no `-p` flag)
- [x] F-002: Expand `LIST_TRANSACTIONS` in `src/modules/transactions/graphql/queries.ts` to the full query + `TransactionListItem`/`ListTransactionsData`/`ListTransactionsVariables` types (exact shape in GraphQL/API Blueprint above)
- [x] F-003: Implement `useListTransactions()` in `src/modules/transactions/hooks/use-list-transactions.ts` (signature, `PAGE_SIZE = 10`, page-cursor map, `goToPage` guard — exact behavior in GraphQL/API Blueprint above)
- [x] F-004: Add `className?: string` prop to `Pagination` (`src/components/ui/pagination.tsx`), merged onto the `<nav>` via `cn()`, default unchanged (`gap-1`)
