# Lista de Transações - PM-016 - Implementation Plan

## Definition of Ready (DoR) Blueprints

### Component Blueprint

**Component Name(s) and file paths**

- `src/modules/transactions/components/transactions-table.tsx` — `TransactionsTable`: the whole table (header + body + footer), owns the loading/error/empty/populated branching
- `src/modules/transactions/components/transaction-category-cell.tsx` — `TransactionCategoryCell`: 40×40 tinted icon square + category `Tag`, reused per row
- `src/modules/transactions/utils/format-transaction.ts` — `formatTransactionDate(iso: string): string`, `formatTransactionValue(cents: number, type: TransactionKind): string` (pure functions, not components, colocated here since they're only used by the table)
- `src/modules/transactions/hooks/use-list-transactions.ts` — `useListTransactions()` (see GraphQL/API Blueprint)
- Page wiring: `src/modules/transactions/pages/transactions-page.tsx` (existing file, edited — mount `TransactionsTable` below the existing `PageHeader`)
- Add shadcn `Table` primitive first: `pnpm dlx shadcn@latest add table` (no `-p` flag — per [[apollo-client-v4-gotchas]], `-p` on `add` means destination path, not a style preset, and would misplace the files)

```ts
type TransactionListItem = {
  id: string
  type: 'EXPENSE' | 'INCOME'
  description: string
  date: string // ISO 8601
  value: number // cents
  category: { id: string; title: string; color: string; icon: string } | null
}

type TransactionsTableProps = {
  transactions: TransactionListItem[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  totalRecord: number
  pageSize: number // needed to compute the "X a Y" range shown in the footer summary
}

type TransactionCategoryCellProps = {
  category: TransactionListItem['category']
}
```

**Composition**

- `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell` — new shadcn primitives (added above)
- `TransactionTypeIndicator` (`src/components/transaction-type-indicator.tsx`, existing) — reused as-is for the TIPO column. It already takes lowercase `'income' | 'expense'`, so `TransactionsTable` maps the server's `TransactionKind` (`'INCOME' | 'EXPENSE'`) to it inline: `transaction.type === 'INCOME' ? 'income' : 'expense'`
- `Tag` (`src/components/ui/tag.tsx`, existing) — category badge in `TransactionCategoryCell`, same `TagColor` union as `CategoryCard`
- `IconButton` (`src/components/ui/icon-button.tsx`, existing) — the two non-functional action buttons per row (`Trash`/`SquarePen`, `variant="outline"`, `className="border-gray-300"` — identical to `CategoryCard`'s action buttons)
- `Pagination` (`src/components/ui/pagination.tsx`, existing, currently unused outside `components-preview.tsx`) — reused for the footer's numbered page controls. **Gap found in fidelity check:** Figma's pagination group has `gap-2` (8px) between buttons; `Pagination` currently hardcodes `gap-1` (4px) on its `<nav>`. Fix: add a `className` passthrough prop to `Pagination` (`className?: string`, merged via `cn()`) so `TransactionsTable` can override to `gap-2`, rather than hardcoding a one-off gap change into the shared primitive for every future caller.
- Local `ICON_OPTIONS`-equivalent map in `transaction-category-cell.tsx`, duplicating (not importing) `src/modules/categories/components/icon-picker.tsx`'s icon set and `color-picker.tsx`'s `COLOR_OPTIONS` hex→token mapping — same module-isolation convention already used for `LIST_CATEGORIES_FOR_SELECT` (transactions module never imports from `@/modules/categories`, confirmed via `grep`)

**States to render**

- Loading: text row "Carregando transações…" (same pattern as `CategoriesPage`), no skeleton (no skeleton primitive exists in this repo yet — out of scope to add one)
- Error: `role="alert"` red text (same pattern as `CategoriesPage`/`useListCategories`)
- Empty (`transactions.length === 0`, not loading, no error): message "Nenhuma transação cadastrada ainda." instead of the table
- Populated: full `Table` with header/body/footer

**Figma Fidelity**

Extracted by clicking through the live Figma file in Chrome (the Figma MCP tool quota was exhausted mid-plan — see note at end of this section) against nodes `3104:401` (table), `3104:798` (header), `3104:1498` (body row), `3104:1823` (footer).

| Element | Size (w×h) | Padding | Gap | Radius | Border | BG | Text | Font | Icon |
|---|---|---|---|---|---|---|---|---|---|
| Table container (`3104:401`) | 1182×707 (Fill×Hug) | 0 | 0 | 0 | — | — | — | — | — |
| Header row cells container | 1182×57 (Fill×Hug) | 0 | 0 | 0 | 1px inside, `border-gray-200` (#e5e7eb) | transparent | — | — | — |
| Header cell (e.g. "Descrição") | 414×56 (one column; others narrower — exact per-column width not individually re-verified for all 6, use `flex-1`/`TableHead` default flex behavior instead of fixed px widths) | `px-6 py-5` (24/20) | — | — | none | transparent | `text-gray-500` or `text-gray-600` (fill token truncated in panel as "Grayscale/h…" — **confirm exact shade via computed style once implemented**) | Inter Medium 12px/16px, letter-spacing 0.6px (`tracking-wide`, uppercase visual style but text is NOT literally uppercased — "Descrição" not "DESCRIÇÃO" per the actual glyphs) | — |
| Body row | 1182×72 (Fill×Hug) | 0 (padding lives on cells) | 0 | 0 | — | white | — | — | — |
| Body cell (generic) | — | `px-6 py-5` (24/20), same as header — 72px row height minus 40px vertical padding leaves exactly 32px content height | — | — | — | — | Inter Regular, size TBD (not individually re-measured — reuse `text-sm` `text-gray-800` as the base body-row text style already used elsewhere, e.g. `CategoryCard`'s title) | — |
| Category icon square (`TransactionCategoryCell`) | 40×40 | 0, icon centered | 0 | 8 | none | `Blue/blue-light` variable → `bg-blue-light` (#dbeafe) for this row's category (color varies per category, same 7-color set as `CategoryCard`'s `iconSquareClasses`) | — | — | 16×16, `Icon/utensils` layer → `Utensils` (lucide-react) for this row; **exact glyph is data-driven per category** once the assumed `icon` field lands server-side (see Server Dependency note in spec.md) |
| Category tag | matches existing `Tag` `size="md"` (h-6 px-2.5 text-xs, rounded-full) | — | — | — | none | `bg-blue-light` etc. (same 7-color palette as `Tag`'s `colorClasses`) | `text-blue-dark` etc. | text-xs font-medium | — |
| Type indicator (TIPO column) | — | — | `gap-1.5` | — | — | — | `text-destructive` (Saída) / `text-success` (Entrada) | text-sm font-medium | Small circular icon before the label — **visually looks like a circle-based icon (possibly `CircleMinus`/`CirclePlus`), not the current component's `CircleArrowDown`/`CircleArrowUp`.** Confirm exact lucide export against a full-resolution screenshot during implementation; reuse `TransactionTypeIndicator` as-is if the difference turns out to be a compression artifact (Figma render at low zoom), otherwise swap its icons |
| Value cell | — | — | — | — | — | — | red (`text-destructive`) for `EXPENSE` with `-` prefix, green (`text-success`) for `INCOME` with `+` prefix | text-sm | — |
| Action buttons (per row) | 32×32 (assumed `size-8`, matching `IconButton size="icon"` — same as `CategoryCard`'s action buttons; not independently re-measured in this pass) | — | `gap-2` (8px, same spacing as `CategoryCard`'s action button pair) | — | 1px `border-gray-300` | white | `Trash` icon: `text-destructive`; `SquarePen` icon: `text-gray-700` | — | `Trash`, `SquarePen` (lucide-react) — same icons as `CategoryCard` |
| Footer row | 1182×72 (Fill×Hug) | `px-6 py-5` (24/20) | space-between | 0 | — | white | — | — | — |
| Footer summary text ("1 a 10 \| 27 resultados") | 141×20 (Hug) | — | — | — | — | — | Inter, "Mixed" weight/color in the Figma panel — likely `font-semibold text-gray-800` for the numbers + `text-gray-600` for the rest, matching `PageHeader`'s title/subtitle pairing convention. **Confirm exact split during implementation.** | text-sm (14px/20px) | — |
| Pagination group | 192×32 (Hug), `gap-2` (8px — see `Pagination` gap fix above) | 0 | 8 | — | — | — | — | — | `ChevronLeft`/`ChevronRight` (already in `Pagination`) |
| Pagination active page button | 32×32 | 0 | — | 8 | none | `Brand/brand-base` → `bg-primary` | white | — | — | matches `Pagination`'s existing `variant="default"` `size="icon"` Button exactly, no changes needed |

**Note on tooling:** The Figma MCP `get_design_context`/`get_variable_defs` tools hit the account's Starter-plan rate limit before this table could be built from their structured output. The table above was built by manually inspecting the live Figma file via `claude-in-chrome` (clicking each layer, reading the Design panel's Position/Layout/Fill/Typography sections) — reliable for the values captured, but a few cells are marked "not independently re-measured" where I relied on an existing, already-shipped analogous component (`CategoryCard`) instead of re-clicking every instance. Those are flagged inline above and should get a quick visual diff pass post-implementation per the `/figma-fidelity` skill's step 5.

**Server Dependency:** two fields are assumed to exist server-side (`TransactionCategoryType.icon`, `TransactionConnection.totalRecord`) per the user's explicit instruction — see spec.md's "Server Dependency" section. This plan's GraphQL Blueprint below is written against that assumed shape.

### GraphQL/API Blueprint

**Query:** expand the existing stub in `src/modules/transactions/graphql/queries.ts` (currently id-only, explicitly left as a placeholder for this feature per its own code comment):

```ts
export const LIST_TRANSACTIONS = gql`
  query ListTransactions($first: Int, $after: String) {
    listTransactions(first: $first, after: $after) {
      edges {
        node {
          id
          type
          description
          date
          value
          category {
            id
            title
            color
            icon
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalRecord
    }
  }
`

export interface TransactionListItem {
  id: string
  type: 'EXPENSE' | 'INCOME'
  description: string
  date: string
  value: number
  category: { id: string; title: string; color: string; icon: string } | null
}

export interface ListTransactionsData {
  listTransactions: {
    edges: { node: TransactionListItem }[]
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
    totalRecord: number
  }
}

export interface ListTransactionsVariables {
  first?: number
  after?: string
}
```

`useCreateTransaction`'s `refetchQueries: [{ query: LIST_TRANSACTIONS }]` (`src/modules/transactions/hooks/use-create-transaction.ts`) keeps working unchanged — Apollo refetches the query instance with whatever variables it was last watched with (page 1, `first: PAGE_SIZE, after: undefined`), which is the correct behavior: a newly created transaction should surface by revisiting page 1, not by trying to patch an arbitrary later page.

**Hook:** `useListTransactions()` (`src/modules/transactions/hooks/use-list-transactions.ts`)

```ts
const PAGE_SIZE = 10 // matches Figma's "1 a 10" — no server default assumed

interface UseListTransactionsResult {
  transactions: TransactionListItem[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  totalRecord: number
  pageSize: number
  goToPage: (page: number) => void
}

function useListTransactions(): UseListTransactionsResult
```

Internals:
- `const [page, setPage] = useState(1)`
- `const [cursors, setCursors] = useState<Record<number, string | undefined>>({ 1: undefined })` — page→cursor map, built up as pages are visited (page 1 has no cursor)
- `useQuery(LIST_TRANSACTIONS, { variables: { first: PAGE_SIZE, after: cursors[page] }, fetchPolicy: 'cache-and-network' })`
- On a successful response with `pageInfo.hasNextPage`, store `cursors[page + 1] = pageInfo.endCursor` if not already known (via a `useEffect` keyed on `data`)
- `totalPages = Math.ceil(totalRecord / PAGE_SIZE)` (0 when `totalRecord` is 0)
- `goToPage(n)`: no-ops if `n` isn't yet reachable, i.e. `cursors[n] === undefined && n !== 1` — **this is the progressive-pagination constraint from the grill-me decision**: since the server only exposes forward cursors (no arbitrary-offset jump), a page number becomes clickable only once the user has sequentially reached `n - 1`. In practice, with `totalRecord` known upfront, `TransactionsTable` still renders all `totalPages` number buttons (matching the Figma "1 2 3" look), it just disables the ones beyond `Math.max(...Object.keys(cursors).map(Number))`

**Cache strategy:** `fetchPolicy: 'cache-and-network'` (query) — table should reflect fresh server state on every mount/page change rather than stale cache, consistent with `useListCategories`'s default (`cache-first` there works because that list has no pagination/mutation-heavy churn; this one does). No mutations in this feature (create already handled by `useCreateTransaction`; update/delete explicitly out of scope), so no optimistic response / manual `update` needed here.

**Loading/Error handling:** owned by `useListTransactions` (returns `isLoading`/`error` as a translated string, same shape as `useListCategories`), consumed by `TransactionsTable` for the loading/error branches — mirrors `useListCategories` → `CategoriesPage` exactly.

### Form & Validation Blueprint

**Omitted:** this feature is read-only (a list/table). No form, no user-typed input, no Zod schema. (The existing `TransactionForm` for creation is untouched.)

### State Blueprint

**What state, and why:** the page→cursor map and current page number (see `useListTransactions` above). Component-local `useState` isn't literally enough on its own because the cursor map must persist across page navigations within the same table session (not reset per render) — but it's still plain React state, scoped to `useListTransactions`, not lifted to context or the URL.

**Where it lives:** inside the `useListTransactions` hook (called once from `TransactionsTable`, not shared across components — no context needed since only one table exists on `/transacoes`).

**Shape:**

```ts
type PageCursorMap = Record<number, string | undefined>
// { 1: undefined, 2: "<endCursor after page 1>", 3: "<endCursor after page 2>", ... }
```

**Explicitly not URL-synced:** current page is not reflected in `?page=` search params. Deep-linking to a specific page is a reasonable future enhancement but wasn't requested and adds scope (would need `useSearchParams` wiring + handling an invalid/unreachable page number in the URL on load).

---

## Architectural Decisions

- **Scope & Requirements:** table (header/body/footer) rendering all `listTransactions` rows per Figma, action buttons visually present but inert (no `updateTransaction`/`deleteTransaction` calls), no filters (out of scope — filter bar isn't one of the 4 given Figma nodes anyway).
- **Data & State:** new query `LIST_TRANSACTIONS` (expanded from stub), new hook `useListTransactions` owning pagination state (page-cursor map, see State Blueprint). No new Apollo `typePolicies` needed — `TransactionConnection`/`TransactionEdge` aren't identified types (no `id` field on the connection itself), so Apollo's default cache normalization on `TransactionType.id` is sufficient.
- **User Experience:** happy path = table loads page 1 on mount, user clicks a page number or the next-chevron to move forward. Loading/error/empty states per Component Blueprint. Keyboard/a11y: `Table`'s shadcn primitive already renders semantic `<table>`/`<th>`/`<td>`; `Pagination` already has `aria-label="Paginação"` and per-button `aria-label`s (existing, unchanged); action `IconButton`s need `aria-label="Editar"`/`aria-label="Excluir"` even though inert, same as `CategoryCard`.
- **Testing & Validation:** Vitest + Testing Library, `MockedProvider` for the hook (same pattern as `use-list-categories.test.ts`), RTL render tests for `TransactionsTable`'s four states and for `TransactionCategoryCell`. No e2e (none configured repo-wide).
- **Implementation Details:** components/hooks listed in Component Blueprint; new dependency: none (shadcn `table` addition uses existing Radix/Tailwind stack, no new npm package). `Pagination` gets a `className` prop addition (small, backward-compatible).
- **Security Considerations:** `listTransactions` is already auth-gated server-side (`requireCurrentUser`); no new sensitive data exposed (same fields as the create-transaction flow already renders). No user-typed input is rendered raw (all values come from the authenticated user's own GraphQL response, no `dangerouslySetInnerHTML`).
- **Cross-Cutting Concerns:** no new logging; no toast needed (this is a passive list, not an action with a success/failure to announce). Loading/error handled component-locally, consistent with `CategoriesPage`, not a shared error boundary.
- **Error Scenarios & Failure Modes:** network/GraphQL error → `useListTransactions` sets a fallback error string, same shape as `useListCategories`'s `FALLBACK_ERROR_MESSAGE` pattern ("Não foi possível carregar as transações."). No manual retry button in this feature (matches `CategoriesPage`'s precedent — none there either). Race condition: rapid page-button clicks are safe since Apollo's `useQuery` re-runs on variable change and the last-issued query's result wins by default; no explicit debounce needed for a paginated table with at most a handful of pages.
- **Performance & Scale:** expected volume is "dezenas" of transactions per user (same assumption as PM-011); `first: 10` keeps each page small. No virtualization needed.
- **Module Composition:** all new files live under `src/modules/transactions/`, matching existing module boundaries; no cross-module import from `categories` (icon/color maps duplicated instead, per established convention).
- **Deployment & Operations:** no new env var, no feature flag. Manual post-deploy check: load `/transacoes` with an authenticated user that has 11+ transactions (to exercise pagination beyond page 1) once the server dependency (icon + totalRecord) ships.
- **Backward Compatibility:** `Pagination`'s new `className` prop is optional and additive — no existing caller (`components-preview.tsx`) needs updating. `LIST_TRANSACTIONS`'s shape change is safe since, per its own code comment, no component currently queries it outside `useCreateTransaction`'s `refetchQueries` (which doesn't read the response shape).

## Implementation Phases

### Phase 1: Foundation

- [ ] Add shadcn `Table` primitive: `pnpm dlx shadcn@latest add table` (no `-p` flag)
- [ ] Expand `LIST_TRANSACTIONS` in `src/modules/transactions/graphql/queries.ts` to the full query + `TransactionListItem`/`ListTransactionsData`/`ListTransactionsVariables` types (exact shape in GraphQL/API Blueprint above)
- [ ] Implement `useListTransactions()` in `src/modules/transactions/hooks/use-list-transactions.ts` (signature, `PAGE_SIZE = 10`, page-cursor map, `goToPage` guard — exact behavior in GraphQL/API Blueprint above)
- [ ] Add `className?: string` prop to `Pagination` (`src/components/ui/pagination.tsx`), merged onto the `<nav>` via `cn()`, default unchanged (`gap-1`)

### Phase 2: Features

- [ ] Implement `TransactionCategoryCell` (`src/modules/transactions/components/transaction-category-cell.tsx`): 40×40 `rounded-[8px]` icon square (icon from a local icon-name map duplicating `icon-picker.tsx`'s set, `?? Tag` fallback if `category` is `null` or the icon name isn't in the map) + `Tag` badge, same `iconSquareClasses`/`COLOR_OPTIONS`-equivalent hex→token lookup as `CategoryCard`
- [ ] Implement `formatTransactionDate`/`formatTransactionValue` in `src/modules/transactions/utils/format-transaction.ts` (`Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })` for date; `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` on `value / 100`, prefixed `+`/`-` by `type`)
- [ ] Implement `TransactionsTable` (`src/modules/transactions/components/transactions-table.tsx`): loading/error/empty/populated branches (Component Blueprint), header row (DESCRIÇÃO/DATA/CATEGORIA/TIPO/VALOR/AÇÕES), body rows (`TransactionCategoryCell`, description, formatted date, `TransactionTypeIndicator`, formatted value, two inert `IconButton`s), footer (`Pagination` with `className="gap-2"` + "X a Y | Z resultados" summary text)
- [ ] Wire into `src/modules/transactions/pages/transactions-page.tsx`: call `useListTransactions()`, render `<TransactionsTable {...} className="mt-6" />` below the existing `PageHeader`

### Phase 3: Polish

- [ ] Post-implementation Figma fidelity pass (per `/figma-fidelity` step 5): pull computed styles for one instance of each spec-table row above, diff against the table, resolve the three "confirm during implementation" flags (header text color shade, footer summary text weight split, TIPO icon shape)
- [ ] Accessibility pass: verify `aria-label`s on action `IconButton`s, verify `Pagination`'s existing `aria-label`s still read correctly with the new `gap-2`

## Test Cases

### Phase 1: Foundation

- [ ] `useListTransactions` passes `{ first: 10, after: undefined }` on initial mount
- [ ] `useListTransactions` returns `isLoading: true` before the query resolves, `transactions: []` (mirrors `useListCategories`'s "before resolve" test)
- [ ] `useListTransactions` sets the fallback error message on a network error, `transactions` stays `[]`
- [ ] `useListTransactions.goToPage(2)` after page 1 resolves with `hasNextPage: true` re-queries with `after: <page 1's endCursor>`
- [ ] `useListTransactions.goToPage(n)` is a no-op when page `n`'s cursor isn't yet known (`n > maxVisitedPage + 1`)
- [ ] `useListTransactions.totalPages` computes `Math.ceil(totalRecord / 10)` from the mocked response
- [ ] `Pagination` renders with a custom `className` merged alongside its default classes, unchanged when `className` is omitted

### Phase 2: Features

- [ ] `TransactionCategoryCell` renders the mapped icon + tinted background for a known category color/icon
- [ ] `TransactionCategoryCell` falls back to a generic icon when `category` is `null`
- [ ] `formatTransactionValue` formats `8850`/`EXPENSE` as `"- R$ 88,50"` and `34025`/`INCOME` as `"+ R$ 340,25"`
- [ ] `formatTransactionDate` formats an ISO date as `"30/11/25"` (2-digit year)
- [ ] `TransactionsTable` shows the loading message while `isLoading`
- [ ] `TransactionsTable` shows the error message when `error` is set
- [ ] `TransactionsTable` shows the empty-state message when `transactions` is `[]` and not loading/error
- [ ] `TransactionsTable` renders one row per transaction with description/date/category/type/value, and two inert action buttons (clicking them calls no mutation — assert no `updateTransaction`/`deleteTransaction` mock is triggered)
- [ ] `TransactionsTable` calls `onPageChange` when a page button is clicked
- [ ] `TransactionsPage` renders `TransactionsTable` below `PageHeader` and passes through `useListTransactions`'s values

## Dependencies

- No new npm packages
- Internal: `Table`/`TableHeader`/`TableRow`/`TableHead`/`TableBody`/`TableCell` (new shadcn primitives), `TransactionTypeIndicator`, `Tag`, `IconButton`, `Pagination` (all existing)
- External (separate repo, not implemented by this plan): `../server` adding `TransactionCategoryType.icon` and `TransactionConnection.totalRecord` — see spec.md's Server Dependency section

## Risks & Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Server dependency (`icon`, `totalRecord`) ships with a different field name/shape than assumed | Medium — breaks the query/hook | GraphQL Blueprint's shape is written explicitly in this plan; a schema mismatch fails fast at `pnpm build`/query validation, not silently |
| Progressive-pagination `goToPage` guard feels broken to a user who jumps straight to page 3 in a fresh session | Low — only visible with 3+ pages, and page buttons before that point are simply disabled, not silently failing | Documented behavior, not a bug; revisit if the server later adds arbitrary-offset pagination |
| Three Figma values flagged "confirm during implementation" (header text shade, footer text weight split, TIPO icon shape) turn out wrong | Low — cosmetic only | Phase 3 explicitly budgets a fidelity-verification pass before calling the feature done |

## Success Criteria

- [ ] All acceptance criteria in spec.md met
- [ ] Tests passing (`pnpm test`)
- [ ] `pnpm build` compiles without errors
- [ ] Phase 3's Figma fidelity pass completed with no unresolved flags
