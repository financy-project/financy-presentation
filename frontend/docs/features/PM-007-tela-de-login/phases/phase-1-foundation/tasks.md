# Tela de Login - PM-007 - Phase 1: Foundation - Tasks

- [x] F-001: Add `LOGIN`, `LoginInput`, `LoginData` to `src/modules/auth/graphql/mutations.ts` (exact `gql` document + types above)
- [x] F-002: Add `credentials: 'include'` to the `HttpLink` config in `src/lib/apollo-client.ts`
- [x] F-003: Implement `useLoginUser()` (`src/modules/auth/hooks/use-login-user.ts`): wraps `useMutation<LoginData, { input: LoginInput }>(LOGIN)`; returns `{ loginUser, isLoading, fieldErrors, formError }`; error-branching logic exactly as `use-register-user.ts` (see GraphQL/API Blueprint), fallback message `'Não foi possível entrar. Verifique suas credenciais e tente novamente.'`
- [x] F-004: Add the `Checkbox` primitive via `pnpm dlx shadcn@latest add checkbox -p radix-nova` (`src/components/ui/checkbox.tsx`); adjust generated radius to `rounded-[4px]` and border to `border-gray-300` per the Figma Fidelity table if the generated defaults differ
