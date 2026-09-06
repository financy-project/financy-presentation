# Lista de Transações - PM-016 - Tasks

### Phase 1: Foundation

- [x] F-001: Add shadcn `Table` primitive: `pnpm dlx shadcn@latest add table` (no `-p` flag)
- [x] F-002: Expand `LIST_TRANSACTIONS` in `src/modules/transactions/graphql/queries.ts` to the full query + `TransactionListItem`/`ListTransactionsData`/`ListTransactionsVariables` types (exact shape in GraphQL/API Blueprint above)
- [x] F-003: Implement `useListTransactions()` in `src/modules/transactions/hooks/use-list-transactions.ts` (signature, `PAGE_SIZE = 10`, page-cursor map, `goToPage` guard — exact behavior in GraphQL/API Blueprint above)
- [x] F-004: Add `className?: string` prop to `Pagination` (`src/components/ui/pagination.tsx`), merged onto the `<nav>` via `cn()`, default unchanged (`gap-1`)

### Phase 2: Features

- [x] F-005: Implement `TransactionCategoryCell` (`src/modules/transactions/components/transaction-category-cell.tsx`): 40×40 `rounded-[8px]` icon square (icon from a local icon-name map duplicating `icon-picker.tsx`'s set, `?? Tag` fallback if `category` is `null` or the icon name isn't in the map) + `Tag` badge, same `iconSquareClasses`/`COLOR_OPTIONS`-equivalent hex→token lookup as `CategoryCard`
- [x] F-006: Implement `formatTransactionDate`/`formatTransactionValue` in `src/modules/transactions/utils/format-transaction.ts` (`Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })` for date; `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` on `value / 100`, prefixed `+`/`-` by `type`)
- [x] F-007: Implement `TransactionsTable` (`src/modules/transactions/components/transactions-table.tsx`): loading/error/empty/populated branches (Component Blueprint), header row (DESCRIÇÃO/DATA/CATEGORIA/TIPO/VALOR/AÇÕES), body rows (`TransactionCategoryCell`, description, formatted date, `TransactionTypeIndicator`, formatted value, two inert `IconButton`s), footer (`Pagination` with `className="gap-2"` + "X a Y | Z resultados" summary text)
- [x] F-008: Wire into `src/modules/transactions/pages/transactions-page.tsx`: call `useListTransactions()`, render `<TransactionsTable {...} className="mt-6" />` below the existing `PageHeader`

### Phase 3: Polish

- [x] F-009: Post-implementation Figma fidelity pass (per `/figma-fidelity` step 5): pull computed styles for one instance of each spec-table row above, diff against the table, resolve the three "confirm during implementation" flags (header text color shade, footer summary text weight split, TIPO icon shape)
- [x] F-010: Accessibility pass: verify `aria-label`s on action `IconButton`s, verify `Pagination`'s existing `aria-label`s still read correctly with the new `gap-2`
