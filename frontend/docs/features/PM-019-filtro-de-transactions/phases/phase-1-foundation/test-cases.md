# Phase 1: Foundation - Test Cases

- [x] T-001: `useCategoriesStore` starts `{ categories: [], isLoading: true, error: null }`; `setCategories`/`setLoading`/`setError` each update their field independently
- [x] T-002: `CategorySelect` renders one option per category from the store; calls `onValueChange` with the selected id; disables while `isLoading`; shows the `resettable` placeholder option when set
- [x] T-003: `TransactionTypeSelect` renders "Todos"/"Entrada"/"Saída"; calls `onValueChange` with `'INCOME'`/`'EXPENSE'`/`''` respectively
- [x] T-004: `TransactionSearchInput` renders the "Buscar" label + placeholder; calls `onChange` with the typed value; reflects the controlled `value`
- [x] T-005: `PeriodSelect` renders the trigger formatted as "Mês / Ano"; lists the current year (through the current month) + all of the previous year, newest first, with no future month; calls `onChange` and closes on selection; loads one more year back on scroll-to-bottom
