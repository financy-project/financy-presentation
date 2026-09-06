# Categorias no Dashboard - PM-024 - Test Cases

Generated mechanically from `plan.md`'s `## Test Cases` — one `T-NNN` per bullet, verbatim, organized by phase.

## Phase 1: Foundation

- [x] T-001: `useGetDashboard` returns `categories` equal to the mocked `balanceByCategory` once the query resolves
- [x] T-002: `useGetDashboard` returns `categories: []` before the query resolves and after a network error (mirrors the existing `movement: null` cases)

## Phase 2: Features

- [x] T-003: `DashboardCategoriesCard` renders a `Tag` with the category title, the `"{n} itens"` text, and the absolute-value formatted amount for each entry in `categories`
- [x] T-004: `DashboardCategoriesCard` renders `"Carregando categorias…"` when `isLoading` is `true`
- [x] T-005: `DashboardCategoriesCard` renders `role="alert"` with the `error` text when `error` is set
- [x] T-006: `DashboardCategoriesCard` renders `"Nenhuma categoria com movimentação neste mês."` when `categories` is `[]`, `isLoading` is `false`, and `error` is `null`
- [x] T-007: `DashboardCategoriesCard` renders a "Gerenciar" link pointing to `/categorias`
- [x] T-008: `DashboardHighlights` forwards `categories`/`isLoading`/`error` to `DashboardCategoriesCard` without affecting `RecentTransactionsCard`

## Phase 3: Polish

- [x] T-009: `DashboardPage` passes `categories`/`isLoading`/`error` from `useGetDashboard()` into `DashboardHighlights`
