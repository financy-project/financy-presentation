# Tela de Login - PM-007 - Phase 1: Foundation - Test Cases

- [x] T-001: `useLoginUser` resolves with `{ id, email, name }` and `isLoading` toggles `true` → `false` around the mutation call
- [x] T-002: `useLoginUser` maps `extensions.validationErrors` straight to `fieldErrors` when present
- [x] T-003: `useLoginUser` sets `formError` to the server's message verbatim when there's no `extensions.validationErrors` (invalid-credentials path)
- [x] T-004: `useLoginUser` sets `formError` to the fallback message on a network/unexpected error
