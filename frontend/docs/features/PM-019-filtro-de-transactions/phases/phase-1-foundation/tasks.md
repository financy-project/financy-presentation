# Phase 1: Foundation - Tasks

- [x] F-001: `git stash pop` (or `apply`) the `PM-019-filter-field-components-wip` stash to restore:
  - `src/modules/transactions/stores/use-categories-store.ts` — `useCategoriesStore` (Zustand: `categories`, `isLoading`, `error`, `setCategories`, `setLoading`, `setError`)
  - `src/modules/transactions/components/category-select.tsx` — `CategorySelect({ id, label, value, onValueChange, placeholder, errorMessage, resettable })`
  - `src/modules/transactions/components/transaction-type-select.tsx` — `TransactionTypeSelect({ id, label, value, onValueChange })`
  - `src/modules/transactions/components/transaction-search-input.tsx` — `TransactionSearchInput({ id, value, onChange })`
  - `src/modules/transactions/components/period-select.tsx` — `PeriodSelect({ id, label, value, onChange })`
- [x] F-002: Tests for all of the above (already written, restored by the same stash pop): `use-categories-store.test.ts`, `category-select.test.tsx`, `transaction-type-select.test.tsx`, `transaction-search-input.test.tsx`, `period-select.test.tsx` — run `pnpm test` to confirm all pass post-pop.
