### Phase 2: API Layer

- [x] T-002: `useRegisterUser` resolves with `{ id, email, name }` on success and toggles `isLoading`
- [x] T-003: `useRegisterUser` maps `extensions.validationErrors` straight to `fieldErrors` when present
- [x] T-004: `useRegisterUser` sets `formError` to the server's message verbatim when there's no `extensions.validationErrors` (e.g. duplicate email)
- [x] T-005: `useRegisterUser` sets `formError` to a fallback message on a network/unexpected error
