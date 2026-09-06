# Phase 2: Features - Test Cases

- [x] T-003: `DashboardCategoriesCard` renders a `Tag` with the category title, the `"{n} itens"` text, and the absolute-value formatted amount for each entry in `categories`
- [x] T-004: `DashboardCategoriesCard` renders `"Carregando categorias…"` when `isLoading` is `true`
- [x] T-005: `DashboardCategoriesCard` renders `role="alert"` with the `error` text when `error` is set
- [x] T-006: `DashboardCategoriesCard` renders `"Nenhuma categoria com movimentação neste mês."` when `categories` is `[]`, `isLoading` is `false`, and `error` is `null`
- [x] T-007: `DashboardCategoriesCard` renders a "Gerenciar" link pointing to `/categorias`
- [x] T-008: `DashboardHighlights` forwards `categories`/`isLoading`/`error` to `DashboardCategoriesCard` without affecting `RecentTransactionsCard`
