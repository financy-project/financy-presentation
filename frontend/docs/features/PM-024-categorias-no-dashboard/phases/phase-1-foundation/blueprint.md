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

