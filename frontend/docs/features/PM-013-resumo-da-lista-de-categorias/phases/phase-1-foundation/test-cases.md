# resumo da lista de categorias - PM-013 - Phase 1: Foundation - Test Cases

- [x] T-001: `CategoriesSummary` renders `categories.length` as card 1's value, labeled "Total de categorias"
- [x] T-002: `CategoriesSummary` renders the sum of every category's `transactionsQuantity` as card 2's value, labeled "Total de transações"
- [x] T-003: `CategoriesSummary` renders card 3 with the title and icon of the category with the highest `transactionsQuantity`, labeled "Categoria mais utilizada"
- [x] T-004: `CategoriesSummary` omits card 3 entirely when `categories` is `[]`
- [x] T-005: `CategoriesSummary` falls back to the most recently created category (last item, since `listCategories` is server-ordered by `createdAt asc`) labeled "Categoria mais recente" when every category has `transactionsQuantity === 0`; card 3 is omitted only when `categories` is `[]`
- [x] T-006: `CategoriesSummary` renders card 1's icon as `Tag` with `text-gray-700`, and card 2's icon as `ArrowUpDown` with `text-purple-base`
- [x] T-007: `CategoriesSummary` tints card 3's icon with the most-used category's own color (e.g. a `color: "#2563EB"` category renders `text-blue-base`), falling back to `TagIcon`/`text-blue-base` when `icon`/`color` don't match any `ICON_OPTIONS`/`COLOR_OPTIONS` entry
