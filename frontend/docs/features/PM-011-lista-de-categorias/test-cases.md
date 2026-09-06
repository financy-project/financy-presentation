# lista de categorias - PM-011 - Test Cases

### Phase 1: Foundation

- [x] T-001: `useListCategories` resolves with the mocked category list
- [x] T-002: `useListCategories`'s `categories` is `[]` before the query resolves
- [x] T-003: `useListCategories` sets the fallback error message on a network error
- [x] T-004: `useUpdateCategory` resolves with the updated category and `isLoading` toggles `true` → `false` around the mutation call
- [x] T-005: `useUpdateCategory` maps `extensions.validationErrors` straight to `fieldErrors` when present
- [x] T-006: `useUpdateCategory` sets `formError` to the fallback message on a network/unexpected error
- [x] T-007: `useDeleteCategory` resolves `true` and `isLoading` toggles `true` → `false` around the mutation call
- [x] T-008: `useDeleteCategory` sets the fallback error message on a network/unexpected error

### Phase 2: Features

- [x] T-009: `CategoryForm` calls `onSubmit` with the form values on a valid submit (no longer asserts a specific mutation)
- [x] T-010: `CategoryForm` pre-fills title/description and pre-selects icon/color from a passed `defaultValues` prop
- [x] T-011: `NewCategoryDialog` closes and toasts on a successful `createCategory` call
- [x] T-012: `EditCategoryDialog` renders "Editar categoria" and pre-fills the form from its `category` prop
- [x] T-013: `EditCategoryDialog` calls `updateCategory(category.id, values)` on submit and closes + toasts on success
- [x] T-014: `DeleteCategoryAlert` renders the category's title in its confirmation copy
- [x] T-015: `DeleteCategoryAlert` calls `deleteCategory(category.id)` only when "Excluir" is confirmed, not on "Cancelar"
- [x] T-016: `DeleteCategoryAlert` closes and toasts on a successful delete
- [x] T-017: `CategoryCard` renders title, description, name badge, and "N itens"/"N item" text
- [x] T-018: `CategoryCard` renders the icon matching `category.icon`, falling back to a generic icon for an unrecognized value
- [x] T-019: `CategoryCard`'s edit/delete buttons call `onEdit`/`onDelete` with the category
- [x] T-020: `CategoriesPage` renders a loading message while `useListCategories` is loading
- [x] T-021: `CategoriesPage` renders an error banner when `useListCategories` errors
- [x] T-022: `CategoriesPage` renders an empty-state message when there are no categories
- [x] T-023: `CategoriesPage` renders one `CategoryCard` per category when populated
- [x] T-024: `CategoriesPage` opens `EditCategoryDialog`/`DeleteCategoryAlert` for the correct category when a card's edit/delete is clicked
