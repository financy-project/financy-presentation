# Categorias no Dashboard - PM-024 - Implementation Plan

## Definition of Ready (DoR) Blueprints

This plan must explicitly define the architectural layers per [docs/architecture/dor.md](../../architecture/dor.md). Each blueprint below should be fully specified, or marked `**Omitted:**` with justification.

### Component Blueprint

- **Component Name(s) / file path:** `DashboardCategoriesCard` — `src/modules/dashboard/components/dashboard-categories-card.tsx` (replaces the PM-022 placeholder). No change to `DashboardHighlights` structure/layout, only its props.

  ```ts
  export interface DashboardCategoriesCardProps {
    categories: DashboardCategoryBalance[]
    isLoading: boolean
    error: string | null
  }
  ```

  `DashboardHighlights` (`src/modules/dashboard/components/dashboard-highlights.tsx`) gains a matching prop type and forwards it to `DashboardCategoriesCard` only — `RecentTransactionsCard` (PM-023, out of scope) keeps taking no props:

  ```ts
  export interface DashboardHighlightsProps {
    categories: DashboardCategoryBalance[]
    isLoading: boolean
    error: string | null
  }
  ```

- **Composition:**
  - `Card` (`@/components/ui/card`) — bare, with `p-0` override (its default `py-(--card-spacing)` conflicts with the header/body having their own distinct padding — see Figma Fidelity below), `border border-gray-200 ring-0` (same override already used by the PM-022 placeholder and `SummaryCard`/`RecentTransactionsCard`).
  - `Tag` (`@/components/ui/tag`) — one per category row, `color` resolved from `category.color` (hex) via a **new module-local** `COLOR_OPTIONS` hex→`TagColor` lookup in `dashboard-categories-card.tsx` itself. Not imported from `@/modules/categories` or duplicated from `transaction-category-cell.tsx` — this repeats the existing module-isolation convention (`transaction-category-cell.tsx`'s comment: "the transactions module never imports from `@/modules/categories`"); the dashboard module gets its own copy the same way.
  - `formatCurrencyValue` (`@/modules/dashboard/utils/format-currency-value`) for the amount column.
  - `ChevronRight` (`lucide-react`, `size-4`) for the "Gerenciar" affordance — same icon already used in `pagination.tsx`.
  - `Link` from `react-router-dom` (not `@/components/ui/link.tsx` — see Figma Fidelity gap below) pointing to `/categorias`.
  - No new shadcn primitive needs adding via the CLI.

- **States to render:**
  - **Loading** (`isLoading === true`): body shows `Carregando categorias…` (same phrasing convention as `dashboard-page.tsx`'s `Carregando resumo…`), no rows.
  - **Error** (`error` non-null): body shows `<p role="alert">{error}</p>`, no rows.
  - **Empty** (`!isLoading && !error && categories.length === 0`): body shows `Nenhuma categoria com movimentação neste mês.` — distinct from the old "Em construção." placeholder text (that string must not remain, since the existing placeholder test asserts it and will be replaced).
  - **Populated**: one row per entry in `categories`, in the order the API returns them (no client-side sort — confirmed with the user: the Figma order isn't a simple value/count sort, so this plan does not invent one).

- **Figma Fidelity** (source: https://www.figma.com/design/ZF0QlJlYLMEUz6DH93SwbK/Financy--Community-?node-id=3103-2350 — extracted via Figma-in-Chrome inspection; the Figma MCP tool hit the Starter-plan rate limit, so the design panel's numeric fields were read directly instead of via `get_design_context`):

  | Element | Size (w×h) | Padding | Gap | Radius | Border | BG | Text color | Font (weight/size/line-height) | Icon |
  |---|---|---|---|---|---|---|---|---|---|
  | Outer card (`Card`) | `col-span-1` fill × hug | `0` (padding lives in Header/Body below, not on `Card`) | `0` (vertical stack) | 12px → `rounded-xl` (Card default) | 1px solid `gray-200` (`border border-gray-200`, matches existing override) | `white`/`bg-card` | — | — | — |
  | Header row (title + link) | fill × hug (61px) | `px-6 py-5` (24px/20px) | `justify-between` | — | `border-b border-gray-200` (bottom divider only) | transparent | — | — | — |
  | "CATEGORIAS" title | hug | `0` | — | — | — | — | `text-gray-500` | Inter Medium 12px/16px, `tracking-wider` (0.05em = 0.6px measured — matches Tailwind's `tracking-wider` exactly), `uppercase` | — |
  | "Gerenciar" link | hug (66×20) | `0` | `gap-1` (4px, text→icon) | — | — | — | `text-primary` (Brand/brand-base, `#1F6F43`) | Inter Medium 14px/20px | `ChevronRight` (`lucide-react`), `size-4` |
  | Body (rows container) | fill × hug | `p-6` (24px all sides) | `gap-5` (20px, vertical, between rows) | — | — | transparent | — | — | — |
  | Category row | fill × hug (28px) | `0` | `justify-between` (row is `Tag` on the left, `{count} itens` + value grouped on the right) | — | — | — | — | — | — |
  | Category `Tag` | hug × 24px (Tag `md` default) | Tag component default (`h-6 px-2.5`) | — | `rounded-full` (Tag default) | — | `bg-{color}-light` (Tag default) | `text-{color}-dark` (Tag default) | Tag default (`text-xs` / medium) | — |
  | "{count} itens" | hug | `0` | — | — | — | — | `text-gray-600` | Inter Regular 14px/20px | — |
  | Value (e.g. "R$ 542,30") | ~88px hug, right-aligned | `0` | — | — | — | — | `text-gray-800` | Inter **Semi Bold** 14px/20px | — |

  **Component-library gap found:** `@/components/ui/link.tsx` wraps `buttonVariants`, whose smallest `size` is still `h-7`/padded (`sm`) — none matches this row's `H 20 Hug`/`padding 0` spec. Rather than force-fit the boxed `Link` primitive (which would add unwanted height/padding) or add a new `buttonVariants` size for a single one-off usage, "Gerenciar" is built directly from `react-router-dom`'s `Link` with `inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline` — reusing the same color/hover convention as the `link` cva variant (`src/components/ui/button.tsx`) without its sizing. Value column width (~88px in Figma) is replicated with `text-right` in a flex row rather than a hard-coded pixel width, so it doesn't clip longer currency strings.

### GraphQL/API Blueprint

- **Query:** extend the existing `GET_DASHBOARD` (`src/modules/dashboard/graphql/queries.ts`) — no new query, the field already exists on the backend's `DashboardType` (`balanceByCategory`, see `../server/src/modules/dashboard/graphql/object-types/dashboard.object-type.ts`):

  ```ts
  export const GET_DASHBOARD = gql`
    query GetDashboard {
      dashboard {
        movement {
          income
          expense
          totalBalance
        }
        balanceByCategory {
          categoryId
          title
          color
          transactionCount
          totalValue
        }
      }
    }
  `
  ```

- **Types** (`src/modules/dashboard/graphql/queries.ts`):

  ```ts
  export interface DashboardMovement {
    income: number
    expense: number
    totalBalance: number
  }

  export interface DashboardCategoryBalance {
    categoryId: string
    title: string
    color: string
    transactionCount: number
    totalValue: number
  }

  export interface GetDashboardData {
    dashboard: {
      movement: DashboardMovement
      balanceByCategory: DashboardCategoryBalance[]
    }
  }
  ```

- **Hook:** `useGetDashboard()` (`src/modules/dashboard/hooks/use-get-dashboard.ts`) — signature grows a `categories` field, everything else unchanged:

  ```ts
  export interface UseGetDashboardResult {
    movement: DashboardMovement | null
    categories: DashboardCategoryBalance[]
    isLoading: boolean
    error: string | null
  }

  export function useGetDashboard(): UseGetDashboardResult {
    const { data, loading, error } = useQuery<GetDashboardData>(GET_DASHBOARD, {
      fetchPolicy: 'cache-and-network',
    })

    return {
      movement: data?.dashboard.movement ?? null,
      categories: data?.dashboard.balanceByCategory ?? [],
      isLoading: loading,
      error: error ? FALLBACK_ERROR_MESSAGE : null,
    }
  }
  ```

- **Cache strategy:** read-only query, unchanged `fetchPolicy: 'cache-and-network'` — no mutation, no `update`/`refetchQueries`/optimistic response needed.
- **Loading/Error handling:** owned by `useGetDashboard` (single source for both `movement` and `categories`, since both come from the same `dashboard` query) and surfaced by `DashboardPage` → `DashboardHighlights` → `DashboardCategoriesCard` as props, exactly like `movement`/`isLoading`/`error` already flow to `DashboardSummary` today.

### Form & Validation Blueprint

**Omitted:** this feature is read-only display (no form, no user input to validate).

### State Blueprint

**Omitted:** no state beyond the existing Apollo Client cache entry for `GET_DASHBOARD` (already covered by the GraphQL/API Blueprint) and component props — no new context, no new React Query key, no URL params.

---

## Architectural Decisions

- **Scope & Requirements:** Implement `DashboardCategoriesCard`'s real content (category rows + "Gerenciar" link to `/categorias`) per the Figma "CATEGORIAS" card. Out of scope: `RecentTransactionsCard` (PM-023, owned separately), any backend/GraphQL schema change (field already exists), any change to `Header`'s global nav (already has "Categorias" → `/categorias`, confirmed working).
- **Data & State:** No new client state. `balanceByCategory` is added to the existing `GET_DASHBOARD` query/cache entry — no new Apollo `typePolicies` needed (list is returned inline, not paginated/normalized by id in this view).
- **User Experience:** Happy path — user opens `/dashboard`, sees "CATEGORIAS" card populate below the summary cards with one row per category that had movement this month. Loading — `Carregando categorias…` text (mirrors `dashboard-page.tsx`'s existing pattern). Error — `role="alert"` with the same fallback message already used by `DashboardSummary`'s sibling. Empty — explicit "Nenhuma categoria com movimentação neste mês." message (never falls back to the old "Em construção." string). Accessibility: rows are plain text/`Tag` content (no interactive controls per row), the one interactive element is the "Gerenciar" `Link`, which is natively keyboard-reachable and has visible focus via the browser's default `:focus-visible` outline (no custom focus ring was in the Figma spec, so none is added).
- **Testing & Validation:** Vitest + RTL, mirroring `dashboard-categories-card.test.tsx`'s existing structure (replace the placeholder assertions) and `use-get-dashboard.test.tsx`'s `MockedProvider` pattern (`@apollo/client/testing/react`) extended with `balanceByCategory` in the mocked response. No e2e runner exists; manual verification is to load `/dashboard` against the real GraphQL API and confirm the card matches the Figma screenshot (colors, spacing, "Gerenciar" navigation).
- **Implementation Details:** Touches `src/modules/dashboard/graphql/queries.ts`, `src/modules/dashboard/hooks/use-get-dashboard.ts`, `src/modules/dashboard/components/dashboard-categories-card.tsx`, `src/modules/dashboard/components/dashboard-highlights.tsx`, `src/modules/dashboard/pages/dashboard-page.tsx`, plus their `__tests__`. No new dependency to add. No new query/mutation (existing query extended); response shape does require a new `DashboardCategoryBalance` type (see GraphQL/API Blueprint) — no mutation, so no optimistic response/cache update question applies.
- **Security Considerations:** `dashboard` query already requires an authenticated user server-side (`requireCurrentUser`); no new auth surface. `category.title`/`color` are rendered as plain React text/props (React escapes by default) — no `dangerouslySetInnerHTML`, no XSS risk. Nothing here is logged.
- **Cross-Cutting Concerns:** No new logging. Loading/error handling stays component-local (prop-driven), consistent with `DashboardSummary` — no shared error boundary introduced. No toast/notification — this is a passive read, not an action with a success/failure to announce.
- **Error Scenarios & Failure Modes:** GraphQL network error or GraphQL error on `dashboard` → `useGetDashboard` already coalesces both into the same fallback string (existing behavior, unchanged). `balanceByCategory` empty array (schema field is non-nullable `[DashboardCategoryBalanceType!]!`, so no null-per-item case) → empty state, not a crash. No retry button today (matches the existing `DashboardSummary` behavior — `fetchPolicy: 'cache-and-network'` will retry on next mount/refetch, no manual "tentar novamente" UI exists elsewhere in this module to be consistent with). No mutation, so no race condition on resubmission applies.
- **Performance & Scale:** Per the user's decision, the card renders every entry `balanceByCategory` returns (no client-side cap/pagination) — a user with many active categories in a month gets a taller card than the Figma mock (5 rows), which is an accepted, documented deviation rather than an invented truncation rule.
- **Module Composition:** Single component change (`DashboardCategoriesCard`) plus a narrow prop-threading change through `DashboardHighlights`/`DashboardPage` — no new component boundary needed beyond what exists.
- **Deployment & Operations:** No new env var (uses the existing `VITE_GRAPHQL_URI`). No feature flag. Manual post-deploy check: load `/dashboard` and confirm the categories card renders real data instead of "Em construção.".
- **Backward Compatibility:** `DashboardCategoriesCard` and `DashboardHighlights` gain required props — this is a breaking change to their prop contracts, but both have exactly one caller each (`DashboardHighlights` and `DashboardPage` respectively), both updated in this same feature. `dashboard-categories-card.test.tsx` and `dashboard-page.test.tsx` (the "renders DashboardHighlights regardless of the summary loading state" case) currently call these without the new props and must be updated as part of this work, not left broken.

## Implementation Phases

### Phase 1: Foundation

- [ ] Extend `GET_DASHBOARD` in `src/modules/dashboard/graphql/queries.ts` to add the `balanceByCategory { categoryId title color transactionCount totalValue }` selection (exact `gql` document in the GraphQL/API Blueprint above); add the `DashboardCategoryBalance` interface and add `balanceByCategory: DashboardCategoryBalance[]` to `GetDashboardData['dashboard']`
- [ ] Update `useGetDashboard()` in `src/modules/dashboard/hooks/use-get-dashboard.ts`: add `categories: DashboardCategoryBalance[]` to `UseGetDashboardResult`, return `data?.dashboard.balanceByCategory ?? []`
- [ ] Update `src/modules/dashboard/hooks/__tests__/use-get-dashboard.test.tsx`: add a `CATEGORIES` fixture array (2+ entries) to the existing mocked `result.data.dashboard`, and assert `result.current.categories` equals it in the "resolves with the mocked movement" case; assert `result.current.categories` is `[]` in the pre-resolution and network-error cases

### Phase 2: Features

- [ ] Implement `DashboardCategoriesCard({ categories, isLoading, error }: DashboardCategoriesCardProps)` in `src/modules/dashboard/components/dashboard-categories-card.tsx` per the Component Blueprint: `Card` (`border border-gray-200 p-0 ring-0`) containing a header (`flex items-center justify-between border-b border-gray-200 px-6 py-5`) with the `text-xs font-medium tracking-wider text-gray-500 uppercase` "CATEGORIAS" title (unchanged from the placeholder) and the `react-router-dom` `Link to="/categorias"` "Gerenciar" + `ChevronRight` (`size-4`) per the Figma Fidelity table, and a body (`p-6`) that renders: `Carregando categorias…` when `isLoading`; `<p role="alert">{error}</p>` when `error`; `"Nenhuma categoria com movimentação neste mês."` when `!isLoading && !error && categories.length === 0`; otherwise a `flex flex-col gap-5` list of rows (`flex items-center justify-between`), each with a module-local `COLOR_OPTIONS`-resolved `<Tag color={...}>{category.title}</Tag>`, a `text-sm text-gray-600` `"{category.transactionCount} itens"`, and a `text-sm font-semibold text-gray-800 text-right` `formatCurrencyValue(Math.abs(category.totalValue))`
- [ ] Add the module-local `COLOR_OPTIONS` (hex → `TagColor`) lookup at the top of `dashboard-categories-card.tsx`, copied in shape from `transaction-category-cell.tsx`'s (not imported — module-isolation convention)
- [ ] Update `DashboardHighlightsProps`/`DashboardHighlights` in `src/modules/dashboard/components/dashboard-highlights.tsx` to accept `{ categories, isLoading, error }` and forward them to `<DashboardCategoriesCard categories={categories} isLoading={isLoading} error={error} />` (no change to `<RecentTransactionsCard />`)
- [ ] Update `DashboardPage` in `src/modules/dashboard/pages/dashboard-page.tsx`: destructure `categories` from `useGetDashboard()` alongside `movement`/`isLoading`/`error`, and pass `categories`, `isLoading`, `error` to `<DashboardHighlights>`
- [ ] Rewrite `src/modules/dashboard/components/__tests__/dashboard-categories-card.test.tsx` (replacing the placeholder test) with cases: renders one row per category with its `Tag` label, `"{n} itens"`, and `formatCurrencyValue(Math.abs(totalValue))`; renders `Carregando categorias…` when `isLoading`; renders the `role="alert"` error text when `error` is set; renders the empty-state message when `categories` is `[]` and not loading/erroring; renders a `Link` to `/categorias` with the accessible name "Gerenciar" (wrap in `MemoryRouter` per the existing `dashboard-page.test.tsx` convention)

### Phase 3: Polish

- [ ] Update `src/modules/dashboard/pages/__tests__/dashboard-page.test.tsx`'s `useGetDashboardMock.mockReturnValue` calls to include `categories: []` (or a fixture) in every case so the mock satisfies the new `UseGetDashboardResult` shape; extend the "renders DashboardHighlights regardless of the summary loading state" case (or add a new one) to assert the categories card's own loading/empty text renders correctly when `categories: [], isLoading: true`
- [ ] Manual verification against the running app (`pnpm dev`) with the real GraphQL API: confirm spacing/colors/typography against the Figma Fidelity table row-by-row (per `/figma-fidelity`'s mandatory post-implementation check) and confirm clicking "Gerenciar" navigates to `/categorias`

## Test Cases

### Phase 1: Foundation

- [ ] `useGetDashboard` returns `categories` equal to the mocked `balanceByCategory` once the query resolves
- [ ] `useGetDashboard` returns `categories: []` before the query resolves and after a network error (mirrors the existing `movement: null` cases)

### Phase 2: Features

- [ ] `DashboardCategoriesCard` renders a `Tag` with the category title, the `"{n} itens"` text, and the absolute-value formatted amount for each entry in `categories`
- [ ] `DashboardCategoriesCard` renders `"Carregando categorias…"` when `isLoading` is `true`
- [ ] `DashboardCategoriesCard` renders `role="alert"` with the `error` text when `error` is set
- [ ] `DashboardCategoriesCard` renders `"Nenhuma categoria com movimentação neste mês."` when `categories` is `[]`, `isLoading` is `false`, and `error` is `null`
- [ ] `DashboardCategoriesCard` renders a "Gerenciar" link pointing to `/categorias`
- [ ] `DashboardHighlights` forwards `categories`/`isLoading`/`error` to `DashboardCategoriesCard` without affecting `RecentTransactionsCard`

### Phase 3: Polish

- [ ] `DashboardPage` passes `categories`/`isLoading`/`error` from `useGetDashboard()` into `DashboardHighlights`

## Dependencies

- No new external dependencies.
- Internal: `@/components/ui/card`, `@/components/ui/tag`, `lucide-react`'s `ChevronRight`, `react-router-dom`'s `Link`, `@/modules/dashboard/utils/format-currency-value`.

## Risks & Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Card grows much taller than the Figma mock for users with many active categories (no cap, per the "mostrar todas" decision) | Medium — could visually dwarf `RecentTransactionsCard` in the 2-col/1-col grid | Accepted deviation, documented here; revisit with a cap/"ver mais" only if real usage shows it's a problem |
| `DashboardCategoriesCard`/`DashboardHighlights` prop contract change breaks callers silently | Low — both callers are updated in this same PR | `pnpm build`'s type-check (`tsc -b`) will fail the build if any caller is missed |

## Success Criteria

- [ ] All acceptance criteria in `spec.md` met
- [ ] Tests passing (`pnpm test`)
- [ ] `pnpm build` compiles without errors
