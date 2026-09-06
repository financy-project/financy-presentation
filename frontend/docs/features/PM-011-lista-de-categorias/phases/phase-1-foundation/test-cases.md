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
