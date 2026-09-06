# Phase 1: Foundation - Test Cases

- [x] T-001: `useGetDashboard` passes no variables (query takes none) and returns `movement` from `data.dashboard.movement`
- [x] T-002: `useGetDashboard` returns `movement: null` and `isLoading: true` before the query resolves
- [x] T-003: `useGetDashboard` returns the fallback error message and `movement: null` on a network error
- [x] T-004: `formatCurrencyValue(0)` → `"R$ 0,00"`
- [x] T-005: `formatCurrencyValue(1284732)` → `"R$ 12.847,32"`
- [x] T-006: `formatCurrencyValue` output has no `U+00A0` characters (regular space only, same guard as `formatTransactionValue`)
