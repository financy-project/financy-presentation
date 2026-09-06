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

