# Phase 1: Foundation - Tasks

- [x] F-001: Extend `GET_DASHBOARD` in `src/modules/dashboard/graphql/queries.ts` to add the `balanceByCategory { categoryId title color transactionCount totalValue }` selection (exact `gql` document in the GraphQL/API Blueprint above); add the `DashboardCategoryBalance` interface and add `balanceByCategory: DashboardCategoryBalance[]` to `GetDashboardData['dashboard']`
- [x] F-002: Update `useGetDashboard()` in `src/modules/dashboard/hooks/use-get-dashboard.ts`: add `categories: DashboardCategoryBalance[]` to `UseGetDashboardResult`, return `data?.dashboard.balanceByCategory ?? []`
- [x] F-003: Update `src/modules/dashboard/hooks/__tests__/use-get-dashboard.test.tsx`: add a `CATEGORIES` fixture array (2+ entries) to the existing mocked `result.data.dashboard`, and assert `result.current.categories` equals it in the "resolves with the mocked movement" case; assert `result.current.categories` is `[]` in the pre-resolution and network-error cases
