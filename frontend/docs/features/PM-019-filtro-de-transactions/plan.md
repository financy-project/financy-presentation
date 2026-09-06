# filtro-de-transactions - PM-019 - Implementation Plan

## Definition of Ready (DoR) Blueprints

### Component Blueprint

**1. `TransactionSearchInput`** — `src/modules/transactions/components/transaction-search-input.tsx` *(already implemented, stashed as `PM-019-filter-field-components-wip`)*

```ts
export interface TransactionSearchInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
}
```

- Composition: `TextInput` (`@/components/ui/text-input`) with `leftIcon={<Search />}` (lucide-react), label "Buscar", placeholder "Buscar por descrição". Purely controlled — no debounce here (owned by `useListTransactions`, see GraphQL/API Blueprint).
- States: none beyond the controlled value — no loading/error/empty for a plain text field.

**2. `TransactionTypeSelect`** — `src/modules/transactions/components/transaction-type-select.tsx` *(already implemented, stashed)*

```ts
export type TransactionTypeFilterValue = 'EXPENSE' | 'INCOME' | ''

export interface TransactionTypeSelectProps {
  id?: string
  label?: string
  value: TransactionTypeFilterValue
  onValueChange: (value: TransactionTypeFilterValue) => void
}
```

- Composition: `SelectField` (`@/components/ui/select-field`) with fixed options `[{value:'INCOME',label:'Entrada'},{value:'EXPENSE',label:'Saída'}]`, `placeholder="Todos"`, `resettable` (reuses `SelectField`'s existing reset-to-`''` affordance — no new primitive needed).
- States: none — options are static, no fetch involved.

**3. `CategorySelect`** — `src/modules/transactions/components/category-select.tsx` *(already implemented, stashed)*

```ts
export interface CategorySelectProps {
  id?: string
  label?: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  errorMessage?: string
  resettable?: boolean
}
```

- Composition: `SelectField` fed by `useCategoriesStore` (State Blueprint) — `options = categories.map(c => ({ value: c.id, label: c.title }))`, `disabled = isLoading`. Shared verbatim between the filter bar (`resettable`, `placeholder="Todas"`) and `TransactionForm` (`resettable={false}`, required field).
- States: `disabled` while `isLoading`; `errorMessage` pass-through (filter bar wires the store's `error`, per Cross-Cutting Concerns below; `TransactionForm` keeps wiring its own Zod `errors.categoryId?.message` instead).

**4. `PeriodSelect`** — `src/modules/transactions/components/period-select.tsx` *(already implemented, stashed)*

```ts
export interface PeriodValue {
  month: number // 1-12
  year: number
}

export interface PeriodSelectProps {
  id?: string
  label?: string
  value: PeriodValue
  onChange: (value: PeriodValue) => void
}
```

- Composition: `Popover`/`PopoverTrigger`/`PopoverContent` (`@/components/ui/popover`) + a custom `role="listbox"` scrollable list of plain buttons (`role="option"`) — not Radix `Select`, since infinite-scroll-on-scroll needs a raw `onScroll` handler Radix's `Select` viewport doesn't expose. Trigger button is styled to match `SelectField`'s trigger classes (`h-12 w-full ... rounded-lg border border-input px-3 py-3.5 text-base`) for visual consistency with the other three fields.
- List content: descending `{month, year}` options from the current month back through January of `oldestYear` (starts at `currentYear - 1`); reaching the bottom of the scrollable list (`scrollTop + clientHeight >= scrollHeight - 24px`) decrements `oldestYear` by 1, appending 12 more months. Never generates a future month (grill-me: period only looks backward).
- States: always has a concrete value (no "Todos os períodos" — grill-me confirmed the field always shows a specific month/year, defaulting to the current one).

**5. `TransactionFilters`** *(new, not yet implemented)* — `src/modules/transactions/components/transaction-filters.tsx`

```ts
export interface TransactionFilterValues {
  description: string
  type: TransactionTypeFilterValue
  categoryId: string // '' = "Todas"
  period: PeriodValue // always set — defaults to the current month/year
}

export interface TransactionFiltersProps {
  value: TransactionFilterValues
  onChange: (next: TransactionFilterValues) => void
  className?: string
}
```

- Composition: `Card` (`@/components/ui/card`) wrapping a 4-column grid (`grid grid-cols-4 gap-4` — matches `.workspace/image copy 7.png`'s single-row layout) of `TransactionSearchInput`, `TransactionTypeSelect`, `CategorySelect` (`resettable`, `placeholder="Todas"`, `errorMessage={categoriesError}` from `useCategoriesStore`), `PeriodSelect`. Fully controlled (`value`/`onChange`) — no internal state, no debounce (see GraphQL/API Blueprint for where debounce lives).
- States: populated only — loading/error for the categories list is delegated to `CategorySelect`'s own `disabled`/`errorMessage`.

**Modified: `TransactionForm`** — `src/modules/transactions/components/transaction-form.tsx`

- Swap the existing `Controller name="categoryId"` block (currently an inline `SelectField` fed by `useCategoriesForSelect()`) for `<CategorySelect id="categoryId" label="Categoria" value={field.value} onValueChange={field.onChange} errorMessage={errors.categoryId?.message} />`. `resettable` stays `false` (default) — the field is required.
- Remove the `useCategoriesForSelect()` call and `categoriesLoading` local variable — `CategorySelect` owns its own loading state via `useCategoriesStore`.
- No other prop or behavior changes — `TransactionFormProps` is unchanged.

**Modified: `TransactionsPage`** — `src/modules/transactions/pages/transactions-page.tsx`

- Add local state `const [filters, setFilters] = useState<TransactionFilterValues>(...)` defaulting `period` to the current month/year (`new Date()`).
- Call `useSyncCategoriesForSelect()` once on mount (populates `useCategoriesStore` — see State Blueprint).
- Render `<TransactionFilters value={filters} onChange={setFilters} className="mt-6" />` between `PageHeader` and `TransactionsTable`.
- Pass `filters` into `useListTransactions(filters)` (signature change — see GraphQL/API Blueprint).

### GraphQL/API Blueprint

**Query:** `listTransactions` — updated `gql` document, `src/modules/transactions/graphql/queries.ts`:

```graphql
query ListTransactions(
  $first: Int
  $after: String
  $description: String
  $type: TransactionKind
  $categoryIds: [ID!]
  $month: Int
  $year: Int
) {
  listTransactions(
    first: $first
    after: $after
    description: $description
    type: $type
    categoryIds: $categoryIds
    month: $month
    year: $year
  ) {
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
```

```ts
export interface ListTransactionsVariables {
  first?: number
  after?: string
  description?: string
  type?: 'EXPENSE' | 'INCOME'
  categoryIds?: string[]
  month?: number
  year?: number
}
```

`month`/`year` are always sent together (grill-me: period always has a value); `description`/`type`/`categoryIds` are omitted (`undefined`) rather than sent empty, matching the server's optional-arg validation (`server/src/modules/transaction/graphql/args/list-transactions.args.ts` — confirmed via the server repo: `month`+`year` must both be present or both absent, and are mutually exclusive with `startDate`/`endDate`, which this feature never sends).

**Hook:** `useListTransactions(filters: TransactionFilterValues): UseListTransactionsResult` — `src/modules/transactions/hooks/use-list-transactions.ts`, signature change (was `useListTransactions()`):

- `const debouncedDescription = useDebouncedValue(filters.description, 400)` (new hook, see below) — only the description reaches the network debounced; `type`/`categoryId`/`period` changes apply immediately.
- Builds `variables: ListTransactionsVariables` from `{ first: PAGE_SIZE, after: cursors[page], description: debouncedDescription || undefined, type: filters.type || undefined, categoryIds: filters.categoryId ? [filters.categoryId] : undefined, month: filters.period.month, year: filters.period.year }`.
- Pagination reset: compute `filtersKey = JSON.stringify({ description: debouncedDescription, type: filters.type, categoryId: filters.categoryId, period: filters.period })`; track it in a `lastFiltersKey` state var. When `filtersKey !== lastFiltersKey`, reset `page` to `1`, `cursors` to `{ 1: undefined }`, `seenData` to `undefined`, and update `lastFiltersKey` — during render, same "adjust state during render" idiom the hook already uses for the cursor map (not a `useEffect`).
- **Request cancellation:** an `AbortController` (kept in a `useRef<AbortController | null>`) is recreated every time `filtersKey` changes (same render branch as the pagination reset, above) — the *previous* controller's `.abort()` is called first, then a fresh `AbortController` is stored and its `.signal` is threaded into this render's `useQuery` call via `context: { fetchOptions: { signal: abortControllerRef.current.signal } }` (Apollo's `HttpLink` forwards `context.fetchOptions` into the underlying `fetch` call, so this actually cancels the in-flight HTTP request — Apollo's own variable-change handling only *ignores* a stale response, it doesn't cancel the network request). Also abort on unmount via a `useEffect(() => () => abortControllerRef.current?.abort(), [])` cleanup.
- **Swallowing the abort as an error:** cancelling a request rejects its promise with an `AbortError`, which Apollo surfaces as a `networkError` on that `ApolloError` — since this is an intentional cancellation (not a real failure), the hook's returned `error` computation checks `error?.networkError?.name === 'AbortError'` and treats it as no error (`null`) rather than the fallback message, so changing a filter never flashes an error for the request it just cancelled.
- `fetchPolicy: 'cache-and-network'` — unchanged.
- Return shape (`UseListTransactionsResult`) — unchanged.

**New hook:** `useDebouncedValue<T>(value: T, delayMs: number): T` — `src/modules/transactions/hooks/use-debounced-value.ts`. Generic `useState` + `useEffect(() => { const t = setTimeout(...); return () => clearTimeout(t) }, [value, delayMs])`.

**New hook:** `useSyncCategoriesForSelect(): void` — `src/modules/transactions/hooks/use-sync-categories-for-select.ts`. Runs `useQuery<ListCategoriesForSelectData>(LIST_CATEGORIES_FOR_SELECT)` (existing document, unchanged) and syncs `data`/`loading`/`error` into `useCategoriesStore` via `useEffect`s calling `setCategories`/`setLoading`/`setError`. Called exactly once, from `TransactionsPage`. `fetchPolicy` left at Apollo's default (`cache-first`) — categories rarely change mid-session.

**Removed:** `useCategoriesForSelect` (`src/modules/transactions/hooks/use-categories-for-select.ts`) and its test — superseded by `CategorySelect` reading `useCategoriesStore` directly plus `useSyncCategoriesForSelect` owning the fetch. It has exactly one caller today (`TransactionForm`), which migrates to `<CategorySelect />` in this feature (see Component Blueprint), so nothing else breaks.

**Loading/Error handling:** owned the same way as today — `useListTransactions`'s `error: string | null` still drives `TransactionsTable`'s existing error UI; `useCategoriesStore`'s `error` now drives `CategorySelect`'s `errorMessage` in the filter bar (new) instead of a per-consumer Apollo `error` (old).

### Form & Validation Blueprint

**Omitted:** the filters are live-applied controlled inputs (search/selects/dropdown), not a submitted form — there's no Zod schema or RHF wiring for them. `TransactionForm`'s existing Zod schema (`transactionFormSchema`) is unchanged; only its category field's rendering is swapped for the shared `CategorySelect` (see Component Blueprint).

### State Blueprint

**`useCategoriesStore`** (Zustand) — `src/modules/transactions/stores/use-categories-store.ts` *(already implemented, stashed)*:

```ts
interface CategoriesStoreState {
  categories: CategoryForSelect[]
  isLoading: boolean
  error: string | null
  setCategories: (categories: CategoryForSelect[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}
```

- Why not component-local: the category list must be shared between `TransactionsPage`'s filter bar and `NewTransactionDialog`'s `TransactionForm` (a sibling subtree, opened on demand) without either re-querying `listCategories`.
- Populated by `useSyncCategoriesForSelect` (called once, in `TransactionsPage`); read by `CategorySelect` (used in both places).
- No `persist` middleware (unlike `useAuthStore`) — categories should always reflect a fresh fetch, never stale localStorage data.

**`TransactionFilterValues`** (component-local `useState` in `TransactionsPage`) — see Component Blueprint's `TransactionFilters` for the type. Not URL/localStorage-persisted (explicitly out of scope, per `spec.md`).

---

## Architectural Decisions

- **Scope & Requirements:** 4 filters (description, type, category, period) on `TransactionsPage`; shared `CategorySelect` + `useCategoriesStore` between the filter bar and `TransactionForm`. Out of scope (per `spec.md`): `startDate`/`endDate` filtering, multi-category selection, filter persistence (URL/localStorage), any other `TransactionForm` change.
- **Data & State:** New client state: `TransactionFilterValues` (page-local) and `useCategoriesStore` (module-level Zustand, shared). GraphQL entities read: `listTransactions` (extra args), `listCategories` (unchanged document, new caller). No Apollo `typePolicies` changes — both queries already resolve to normalized `Category:<id>`/`Transaction:<id>` entries.
- **User Experience:** Happy path — user types/selects a filter, the table (and its pagination) updates to page 1 with matching results. Loading: `CategorySelect` disables while `useCategoriesStore.isLoading`; the table keeps its existing skeleton/error/empty states from `useListTransactions`. Accessibility: `PeriodSelect`'s list uses `role="listbox"`/`role="option"`/`aria-selected`; all four fields keep visible `<Label htmlFor>` associations (via `SelectField`/`TextInput`/`PeriodSelect`'s own `Label`).
- **Testing & Validation:** Vitest + RTL for all 4 field components (done, stashed) plus `useCategoriesStore` (done, stashed); new tests needed for `useDebouncedValue`, `useSyncCategoriesForSelect` (mock `LIST_CATEGORIES_FOR_SELECT` via `MockedProvider`, assert store sync), `useListTransactions`'s new filter variables + pagination-reset behavior, `TransactionFilters` (renders all 4 fields, calls `onChange`), and `TransactionsPage`/`TransactionForm` integration. No e2e runner exists — manual verification noted under Deployment & Operations.
- **Implementation Details:** Reuses `SelectField`, `TextInput`, `Popover`, `Card` — no new shadcn primitive needed. New query variables on an existing query (no new query/mutation); response shape (`TransactionListItem`) is unchanged.
- **Security Considerations:** No new sensitive data surfaced — `description`/`type`/`categoryIds`/`month`/`year` are the same non-sensitive fields already shown in the table. Nothing new logged to the console.
- **Cross-Cutting Concerns:** No toast — filters are a read-only, immediately-visible list refinement, not a mutation. Error display: table errors stay component-local (`TransactionsTable`'s existing error prop); categories-store errors surface inline via `CategorySelect`'s `errorMessage` in the filter bar only (not in `TransactionForm`, to keep that modal's behavior unchanged per `spec.md`'s Out of Scope).
- **Error Scenarios & Failure Modes:** `listTransactions` network/GraphQL error → existing `useListTransactions` error message, unchanged. `listCategories` failure → `useCategoriesStore.error` set, filter bar's `CategorySelect` shows the fallback message and empty options (no retry button — matches today's `useCategoriesForSelect`/`useListCategories` pattern, no retry anywhere in the codebase yet). Race: user changes a filter while a previous `listTransactions` request is in flight — Apollo/React's normal re-render-with-new-variables behavior applies; the pagination-reset-during-render logic (State/GraphQL Blueprint) ensures the *next* render's variables are always for page 1 of the *latest* filters, so a stale in-flight response for old filters/old page never gets displayed as current (React Query/Apollo key on variables).
- **Performance & Scale:** `listTransactions` is already paginated (cursor, `first`/`after`) — filters just narrow the same paginated query, no new scale concern. `PeriodSelect`'s list grows by 12 items per scroll-to-bottom rather than rendering years of options upfront (grill-me decision).
- **Module Composition:** New components live in `src/modules/transactions/` (not `src/modules/categories/`) per grill-me — smaller diff, matches where the current (only) consumer and the existing `LIST_CATEGORIES_FOR_SELECT` document already live. Clear boundary: `CategorySelect`/`useCategoriesStore` own category data; `TransactionFilters` owns filter composition/layout; `TransactionsPage`/`TransactionForm` own wiring into the page/modal.
- **Deployment & Operations:** No new env vars, no feature flag. Manual verification after deploy: apply each filter individually and combined (search + type + category + period), confirm Network tab shows the expected `listTransactions` variables and omits unset ones; open "Nova transação" and confirm its category dropdown still lists categories and validates as before; scroll `PeriodSelect`'s list to the bottom and confirm one more year of months appears with no future month ever shown.
- **Backward Compatibility:** `TransactionFormProps` is unchanged (no breaking prop change). `useCategoriesForSelect` is removed — its only caller (`TransactionForm`) is migrated in this same feature, so no other code breaks.

## Implementation Phases

### Phase 1: Foundation (component library — already implemented this session, stashed as `PM-019-filter-field-components-wip`; this phase is popping that stash and landing it as F-NNN tasks)

- [ ] `git stash pop` (or `apply`) the `PM-019-filter-field-components-wip` stash to restore:
  - `src/modules/transactions/stores/use-categories-store.ts` — `useCategoriesStore` (Zustand: `categories`, `isLoading`, `error`, `setCategories`, `setLoading`, `setError`)
  - `src/modules/transactions/components/category-select.tsx` — `CategorySelect({ id, label, value, onValueChange, placeholder, errorMessage, resettable })`
  - `src/modules/transactions/components/transaction-type-select.tsx` — `TransactionTypeSelect({ id, label, value, onValueChange })`
  - `src/modules/transactions/components/transaction-search-input.tsx` — `TransactionSearchInput({ id, value, onChange })`
  - `src/modules/transactions/components/period-select.tsx` — `PeriodSelect({ id, label, value, onChange })`
- [ ] Tests for all of the above (already written, restored by the same stash pop): `use-categories-store.test.ts`, `category-select.test.tsx`, `transaction-type-select.test.tsx`, `transaction-search-input.test.tsx`, `period-select.test.tsx` — run `pnpm test` to confirm all pass post-pop.

### Phase 2: Features (data wiring + page/form integration)

- [ ] Implement `useDebouncedValue<T>(value: T, delayMs: number): T` (`src/modules/transactions/hooks/use-debounced-value.ts`). Tests (`__tests__/use-debounced-value.test.ts`, fake timers): returns the initial value immediately; does not update before `delayMs` elapses; updates to the latest value after `delayMs`; resets the timer on rapid successive changes (only the final value is committed).
- [ ] Implement `useSyncCategoriesForSelect(): void` (`src/modules/transactions/hooks/use-sync-categories-for-select.ts`) per GraphQL/API Blueprint. Tests (`__tests__/use-sync-categories-for-select.test.ts`, `MockedProvider` mocking `LIST_CATEGORIES_FOR_SELECT`): on success, `useCategoriesStore.getState().categories` matches the resolved `listCategories`; `isLoading` is `true` then `false`; on a mocked GraphQL error, `useCategoriesStore.getState().error` is set to the fallback message.
- [ ] Update `LIST_TRANSACTIONS` (`src/modules/transactions/graphql/queries.ts`) to the new document + `ListTransactionsVariables` type from the GraphQL/API Blueprint.
- [ ] Update `useListTransactions(filters: TransactionFilterValues)` (`src/modules/transactions/hooks/use-list-transactions.ts`) per the GraphQL/API Blueprint (debounced description, full variables mapping, pagination reset on filter change, `AbortController`-based cancellation of the previous in-flight request). Tests (extend `__tests__/use-list-transactions.test.ts`): passes `type`/`categoryIds`/`month`/`year` through as query variables when set; omits `description`/`type`/`categoryIds` from variables when they're `''`; debounces `description` (fake timers — variables don't update before the delay); changing any filter resets `page` to `1` and clears prior cursors; changing a filter before the in-flight request for the previous filters resolves calls `.abort()` on that request's `AbortController` signal; an aborted request's `AbortError` is not surfaced as the hook's `error` (stays `null`).
- [ ] Implement `TransactionFilters` (`src/modules/transactions/components/transaction-filters.tsx`) per the Component Blueprint. Tests (`__tests__/transaction-filters.test.tsx`): renders all 4 fields with their labels ("Buscar", "Tipo", "Categoria", "Período"); calls `onChange` with the updated `TransactionFilterValues` when each field changes, leaving the other fields untouched.
- [ ] Wire into `TransactionsPage` (`src/modules/transactions/pages/transactions-page.tsx`): add `filters` state (default `period` = current month/year), call `useSyncCategoriesForSelect()`, render `<TransactionFilters value={filters} onChange={setFilters} className="mt-6" />` above `TransactionsTable`, pass `filters` into `useListTransactions(filters)`. Tests (extend `__tests__/transactions-page.test.tsx`): filter bar renders above the table; changing a filter re-issues `listTransactions` with the matching variables (via `MockedProvider`).
- [ ] Migrate `TransactionForm` (`src/modules/transactions/components/transaction-form.tsx`): replace the inline `Controller`+`SelectField`+`useCategoriesForSelect()` block with `<CategorySelect id="categoryId" label="Categoria" value={field.value} onValueChange={field.onChange} errorMessage={errors.categoryId?.message} />` inside the existing `Controller name="categoryId"`. Remove the `useCategoriesForSelect` import/call. Update `__tests__/transaction-form.test.tsx` to seed `useCategoriesStore.setState({ categories: [...], isLoading: false, error: null })` instead of mocking `LIST_CATEGORIES_FOR_SELECT` via `MockedProvider`.
- [ ] Delete `use-categories-for-select.ts` and its test (superseded — see GraphQL/API Blueprint's "Removed" note).

### Phase 3: Polish

- [ ] Verify combined-filter behavior end-to-end (manual, per Deployment & Operations): search + type + category + period applied together produce the intersection, not a union.
- [ ] Confirm `TransactionsTable`'s existing empty state reads correctly when a filter combination matches zero transactions (no new empty-state copy needed — reuse what's there).
- [ ] Accessibility pass: `PeriodSelect`'s trigger button keyboard-operable (open via `Enter`/`Space`, per native `<button>` semantics — no custom key handling needed since it's a real `<button>`); confirm `aria-selected` on the current `PeriodSelect` option and that `SelectField`-based fields keep their existing keyboard support (unchanged, Radix `Select`).
- [ ] Visual pass matching `.workspace/image copy 7.png`: `TransactionFilters`'s `Card` padding/gap and the 4-column grid line up with the reference screenshot (no Figma tokens available — eyeball against the image, reusing existing `Card`/spacing tokens already used elsewhere on this page).

## Test Cases

### Phase 1: Foundation

- [ ] `useCategoriesStore` starts `{ categories: [], isLoading: true, error: null }`; `setCategories`/`setLoading`/`setError` each update their field independently
- [ ] `CategorySelect` renders one option per category from the store; calls `onValueChange` with the selected id; disables while `isLoading`; shows the `resettable` placeholder option when set
- [ ] `TransactionTypeSelect` renders "Todos"/"Entrada"/"Saída"; calls `onValueChange` with `'INCOME'`/`'EXPENSE'`/`''` respectively
- [ ] `TransactionSearchInput` renders the "Buscar" label + placeholder; calls `onChange` with the typed value; reflects the controlled `value`
- [ ] `PeriodSelect` renders the trigger formatted as "Mês / Ano"; lists the current year (through the current month) + all of the previous year, newest first, with no future month; calls `onChange` and closes on selection; loads one more year back on scroll-to-bottom

### Phase 2: Features

- [ ] `useDebouncedValue` returns the initial value immediately, holds it until `delayMs` elapses, then commits the latest value; resets on rapid changes
- [ ] `useSyncCategoriesForSelect` syncs `listCategories` success/loading/error into `useCategoriesStore`
- [ ] `useListTransactions` maps `type`/`categoryId`/`period` into `type`/`categoryIds`/`month`/`year` variables (omitting unset ones), debounces `description`, and resets pagination to page 1 when any filter changes
- [ ] `useListTransactions` aborts the previous request's `AbortController` when the filters change before it resolves, and does not surface the resulting `AbortError` as `error`
- [ ] `TransactionFilters` renders all 4 labeled fields and calls `onChange` with a correctly-updated `TransactionFilterValues` per field
- [ ] `TransactionsPage` renders the filter bar above the table and re-queries `listTransactions` with the right variables when a filter changes
- [ ] `TransactionForm` still validates and submits `categoryId` correctly using the shared `CategorySelect` (store-seeded categories, not a mocked query)

### Phase 3: Polish

- [ ] Combined filters (search + type + category + period) narrow results as an intersection (manual/integration check via `TransactionsPage`'s test)
- [ ] Zero-result filter combination shows the table's existing empty state

## Dependencies

- No new external packages — `zustand` is already a dependency (used by `useAuthStore`); no new shadcn primitive needed (`Popover`, `Select`/`SelectField`, `TextInput`, `Card` already exist).
- Internal: `TransactionFilters` depends on the Phase 1 field components; `useListTransactions`'s new signature is a breaking internal change consumed only by `TransactionsPage`; `TransactionForm`'s migration depends on `CategorySelect`/`useCategoriesStore` (Phase 1) being in place first.

## Risks & Mitigations

| Risk                                                                                                    | Impact | Mitigation                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TransactionForm` opened before `TransactionsPage`'s `useSyncCategoriesForSelect` resolves (store still `isLoading`)         | Medium | Already handled — `CategorySelect` disables while `isLoading`, same UX as today's `categoriesLoading` gate; the dialog can only be opened from `TransactionsPage`, which mounts the sync hook on its own mount, before any dialog opens. |
| Removing `useCategoriesForSelect` breaks an untracked caller outside the modules searched                                    | Low    | Confirmed via repo-wide search: only `TransactionForm` calls it; this feature migrates that one caller in the same phase.                                                                                                      |
| `PeriodSelect`'s scroll-based "load more" firing unreliably in some browsers/zoom levels (subpixel scroll math)              | Low    | 24px threshold gives slack; worst case the user scrolls slightly further to trigger it — no functional break, just a minor UX nit to watch for in Phase 3's manual pass.                                                       |
| Aborting a stale `listTransactions` request surfaces its `AbortError` as the hook's `error`, flashing an error on every filter change | Medium | `useListTransactions`'s `error` computation explicitly checks for `networkError?.name === 'AbortError'` and treats it as no error — covered by a dedicated test case (Phase 2). |

## Success Criteria

- [ ] All acceptance criteria in `spec.md` met
- [ ] Tests passing (`pnpm test`)
- [ ] `pnpm build` compiles without errors
