# resumo da lista de categorias - PM-013 - Phase 2: Features - Tasks

- [x] F-003: Wire into `src/modules/categories/pages/categories-page.tsx`: render `<CategoriesSummary categories={categories} />` immediately after the header/"Nova categoria" button row and before the `isLoading`/`error`/empty/populated conditional block, gated on `!isLoading && !error` (so it never renders alongside the loading text or the error banner)
