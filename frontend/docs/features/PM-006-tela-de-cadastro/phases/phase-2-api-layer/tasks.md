### Phase 2: API Layer

- [x] F-007: Implement `REGISTER_USER` mutation + `RegisterUserInput`/`RegisterUserData` types in `src/modules/auth/graphql/mutations.ts` (exact document and types in the GraphQL/API Blueprint above)
- [x] F-008: Implement `useRegisterUser(): UseRegisterUserResult` in `src/modules/auth/hooks/use-register-user.ts` per the GraphQL/API Blueprint (wraps `useMutation` from `@apollo/client/react`; on a `CombinedGraphQLErrors` from `@apollo/client/errors`, use `extensions.validationErrors` directly as `fieldErrors` when present, otherwise use the error's `message` as-is for `formError` — no `extensions.code` branching, the backend message is already display-ready)
- [x] F-009: Unit tests for `useRegisterUser` in `src/modules/auth/hooks/__tests__/use-register-user.test.ts` using `MockedProvider` from `@apollo/client/testing/react`:
  - [ ] resolves with `{ id, email, name }` and `isLoading` transitions `true` → `false` on a successful mock response
  - [ ] a mocked error with `extensions.validationErrors: [{ path: 'email', message: '...' }]` results in `fieldErrors` containing that exact entry
  - [ ] a mocked error with no `extensions.validationErrors` (e.g. the duplicate-email conflict) results in `formError` equal to that error's `message`, verbatim
  - [ ] a network error (no `CombinedGraphQLErrors`) results in `formError` being set to the fallback message and `fieldErrors` staying empty
