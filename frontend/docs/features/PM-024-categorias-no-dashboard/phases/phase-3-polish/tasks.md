# Phase 3: Polish - Tasks

- [x] F-009: Update `src/modules/dashboard/pages/__tests__/dashboard-page.test.tsx`'s `useGetDashboardMock.mockReturnValue` calls to include `categories: []` (or a fixture) in every case so the mock satisfies the new `UseGetDashboardResult` shape; extend the "renders DashboardHighlights regardless of the summary loading state" case (or add a new one) to assert the categories card's own loading/empty text renders correctly when `categories: [], isLoading: true`
- [x] F-010: Manual verification against the running app (`pnpm dev`) with the real GraphQL API: confirm spacing/colors/typography against the Figma Fidelity table row-by-row (per `/figma-fidelity`'s mandatory post-implementation check) and confirm clicking "Gerenciar" navigates to `/categorias`
