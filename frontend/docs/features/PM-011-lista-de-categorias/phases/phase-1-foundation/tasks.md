# lista de categorias - PM-011 - Tasks

### Phase 1: Foundation

- [x] F-001: Add the shadcn `AlertDialog` primitive: `pnpm dlx shadcn@latest add alert-dialog` (no `-p` flag) → `src/components/ui/alert-dialog.tsx`
- [x] F-002: Add `LIST_CATEGORIES` query + `Category`/`ListCategoriesData` types to `src/modules/categories/graphql/queries.ts` (exact `gql` document + types above, including `transactionQuantity`)
- [x] F-003: Add `UPDATE_CATEGORY`/`DELETE_CATEGORY` mutations + `UpdateCategoryInput`/`UpdateCategoryData`/`DeleteCategoryData` types to `src/modules/categories/graphql/mutations.ts` (exact documents + types above)
- [x] F-004: Implement `useListCategories()` (`src/modules/categories/hooks/use-list-categories.ts`): wraps `useQuery<ListCategoriesData>(LIST_CATEGORIES)`; returns `{ categories, isLoading, error }`, `categories` defaults to `[]`, `error` is the fallback message `'Não foi possível carregar as categorias.'` when `useQuery`'s `error` is set
- [x] F-005: Implement `useUpdateCategory()` (`src/modules/categories/hooks/use-update-category.ts`): wraps `useMutation<UpdateCategoryData, { id: string, input: UpdateCategoryInput }>(UPDATE_CATEGORY, { refetchQueries: [{ query: LIST_CATEGORIES }] })`; returns `{ updateCategory, isLoading, fieldErrors, formError }`; error-branching identical to `use-create-category.ts`, fallback message `'Não foi possível atualizar a categoria. Tente novamente.'`
- [x] F-006: Implement `useDeleteCategory()` (`src/modules/categories/hooks/use-delete-category.ts`): wraps `useMutation<DeleteCategoryData, { id: string }>(DELETE_CATEGORY, { refetchQueries: [{ query: LIST_CATEGORIES }] })`; returns `{ deleteCategory, isLoading, error }`; on `CombinedGraphQLErrors` or any other error, sets `error` to the fallback message `'Não foi possível excluir a categoria. Tente novamente.'`
- [x] F-007: Add `refetchQueries: [{ query: LIST_CATEGORIES }]` to `useCreateCategory`'s existing `useMutation(CREATE_CATEGORY)` call (`src/modules/categories/hooks/use-create-category.ts`) so new categories appear in the grid without a manual reload
