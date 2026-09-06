# filtro-de-transactions - PM-019 - Test Cases

## Phase 1: Foundation

- [x] T-001: `useCategoriesStore` starts `{ categories: [], isLoading: true, error: null }`; `setCategories`/`setLoading`/`setError` each update their field independently
- [x] T-002: `CategorySelect` renders one option per category from the store; calls `onValueChange` with the selected id; disables while `isLoading`; shows the `resettable` placeholder option when set
- [x] T-003: `TransactionTypeSelect` renders "Todos"/"Entrada"/"Saída"; calls `onValueChange` with `'INCOME'`/`'EXPENSE'`/`''` respectively
- [x] T-004: `TransactionSearchInput` renders the "Buscar" label + placeholder; calls `onChange` with the typed value; reflects the controlled `value`
- [x] T-005: `PeriodSelect` renders the trigger formatted as "Mês / Ano"; lists the current year (through the current month) + all of the previous year, newest first, with no future month; calls `onChange` and closes on selection; loads one more year back on scroll-to-bottom

## Phase 2: Features

- [x] T-006: `useDebouncedValue` returns the initial value immediately, holds it until `delayMs` elapses, then commits the latest value; resets on rapid changes
- [x] T-007: `useSyncCategoriesForSelect` syncs `listCategories` success/loading/error into `useCategoriesStore`
- [x] T-008: `useListTransactions` maps `type`/`categoryId`/`period` into `type`/`categoryIds`/`month`/`year` variables (omitting unset ones), debounces `description`, and resets pagination to page 1 when any filter changes
- [x] T-009: `useListTransactions` aborts the previous request's `AbortController` when the filters change before it resolves, and does not surface the resulting `AbortError` as `error`
- [x] T-010: `TransactionFilters` renders all 4 labeled fields and calls `onChange` with a correctly-updated `TransactionFilterValues` per field
- [x] T-011: `TransactionsPage` renders the filter bar above the table and re-queries `listTransactions` with the right variables when a filter changes
- [x] T-012: `TransactionForm` still validates and submits `categoryId` correctly using the shared `CategorySelect` (store-seeded categories, not a mocked query)

## Phase 3: Polish

- [x] T-013: Combined filters (search + type + category + period) narrow results as an intersection (manual/integration check via `TransactionsPage`'s test)
- [x] T-014: Zero-result filter combination shows the table's existing empty state
