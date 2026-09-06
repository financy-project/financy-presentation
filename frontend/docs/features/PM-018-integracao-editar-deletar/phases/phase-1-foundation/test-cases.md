### Phase 1: Foundation

- [x] T-001: `useUpdateTransaction` resolves the updated transaction and sets `isLoading` back to `false` on success
- [x] T-002: `useUpdateTransaction` maps `extensions.validationErrors` onto `fieldErrors` on a GraphQL validation error
- [x] T-003: `useUpdateTransaction` sets the fallback `formError` on a network/unexpected error
- [x] T-004: `useDeleteTransaction` resolves `true` and toggles `isLoading` on success
- [x] T-005: `useDeleteTransaction` sets the fallback error message on a network/unexpected error
