# create-transaction - PM-014 - Implementation Plan

## Definition of Ready (DoR) Blueprints

### Component Blueprint

**Component 1 — `PageHeader`** (new, shared) — `src/components/page-header.tsx`

```ts
type PageHeaderProps = {
  title: string
  subtitle: string
  actionLabel: string
  onAction: () => void
}
```

- **Composition:** extracted verbatim from `categories-page.tsx`'s existing header block (no visual change to `/categorias`): `<div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-800">{title}</h1><p className="text-base text-gray-600">{subtitle}</p></div><Button size="xl" className="gap-2 px-3" onClick={onAction}><Plus className="size-4" />{actionLabel}</Button></div>`. Used by both `CategoriesPage` (`title="Categorias"`, `subtitle="Organize suas transações por categorias"`, `actionLabel="Nova categoria"`) and the new `TransactionsPage` (`title="Transações"`, `subtitle="Gerencie todas as suas transações financeiras"`, `actionLabel="Nova transação"`, per `image copy 2.png`).
- **States to render:** single state, no loading/error/empty variant (purely presentational, driven by props).

**Component 2 — `DialogHeaderWithClose`** (renamed from `src/modules/categories/components/category-dialog-header.tsx`, moved to shared) — `src/components/dialog-header-with-close.tsx`

```ts
type DialogHeaderWithCloseProps = {
  title: string
  subtitle: string
}
```

- **Composition:** identical to today's `CategoryDialogHeader` (it is already fully generic — `title`/`subtitle` props, no category-specific logic) — just renamed/relocated out of the categories module so `NewTransactionDialog` (below) can use it without an illegal cross-module import. Update the 3 existing usages (`new-category-dialog.tsx`, `edit-category-dialog.tsx`, and the component's own file) to the new path/name.
- **States to render:** single state (same as today).

**Component 3 — `CurrencyInput`** (new) — `src/modules/transactions/components/currency-input.tsx`

```ts
type CurrencyInputProps = {
  id: string
  label: string
  value: number // reais, e.g. 1.5 for R$ 1,50
  onChange: (value: number) => void
  errorMessage?: string
}
```

- **Composition:** wraps `Input`/`Label` (same shell as `TextInput`) with a fixed "R$" text prefix (`<span className="text-gray-500 text-sm font-medium">R$</span>` positioned like `TextInput`'s `leftIcon` slot, but text instead of an icon since `leftIcon`'s `[&_svg]:size-4` styling assumes an SVG). Cents-first masking: keeps an internal digit string, each numeric keystroke appends a digit and shifts the decimal two places (typing "150" → "R$ 1,50"), Backspace removes the last digit, non-digit keys are ignored (`onKeyDown` filtering `e.key` against `/^[0-9]$/` plus `Backspace`). Formats the display via `new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)`. Calls `onChange(value)` (reais, not cents) on every change — the cents conversion for the GraphQL `Int` happens once, at submit time, in `TransactionForm`.
- **States to render:** single state; `errorMessage` renders the same `<p className="text-destructive text-sm">` as `TextInput`.

**Component 4 — `DatePickerField`** (new) — `src/modules/transactions/components/date-picker-field.tsx`

```ts
type DatePickerFieldProps = {
  id: string
  label: string
  value: Date | undefined
  onChange: (value: Date | undefined) => void
  errorMessage?: string
}
```

- **Composition:** `Popover` + `PopoverTrigger asChild` wrapping a `Button variant="outline"` styled `h-12 w-full justify-start text-base font-normal` (to match `TextInput`'s `h-12` field height) showing `value ? new Intl.DateTimeFormat('pt-BR').format(value) : 'Selecione'` (placeholder text `text-gray-400` when `!value`, per `image copy 3.png`); `PopoverContent className="w-auto p-0"><Calendar mode="single" selected={value} onSelect={onChange} /></PopoverContent>`. Uses `Intl.DateTimeFormat`, not `date-fns` — avoids adding a new npm dependency purely for `dd/MM/yyyy` formatting (see Dependencies).
- **New shadcn primitives needed:** `Popover` and `Calendar` — neither exists in `src/components/ui/` yet. Add via `pnpm dlx shadcn@latest add popover calendar` (no `-p` flag on `add`, per `[[apollo-client-v4-gotchas]]` memory — `components.json`'s `style: "radix-nova"` already governs the preset).
- **States to render:** single state; `errorMessage` renders the same `<p className="text-destructive text-sm">` pattern.

**Component 5 — `TransactionForm`** (new) — `src/modules/transactions/components/transaction-form.tsx` (structure mirrors `category-form.tsx` exactly)

```ts
interface TransactionFormProps {
  isLoading: boolean
  fieldErrors: RegisterFieldError[] // from '@/modules/auth/hooks/use-register-user', same reuse as category-form.tsx
  formError: string | null
  onSubmit: (values: TransactionFormValues) => void | Promise<void>
}
```

- **Composition:** `<form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>` containing: (1) a type toggle — two `<button type="button">`s side by side (`grid grid-cols-2 gap-3`), "Despesa" (`ArrowDown`/`CircleArrowDown` icon) and "Receita" (`ArrowUp`/`CircleArrowUp` icon), selected state `border-destructive text-destructive` for Despesa / `border-success text-success` for Receita, unselected `border-gray-300 text-gray-600`, wired via `Controller` on `type`; (2) `TextInput` for `description` (`label="Descrição"`, `placeholder="Ex. Almoço no restaurante"`); (3) `grid grid-cols-2 gap-4` row with `DatePickerField` (`date`) and `CurrencyInput` (`value`), both via `Controller`; (4) `Select`/`SelectTrigger`/`SelectContent`/`SelectItem` (from `@/components/ui/select`, existing primitive) for `categoryId`, `label="Categoria"`, placeholder "Selecione", options from `useCategoriesForSelect()`, via `Controller`; (5) `formError` banner (`role="alert"`, `text-destructive text-sm`, same as `category-form.tsx`); (6) `Button type="submit" size="xl" className="w-full" disabled={isLoading}` — `{isLoading ? 'Salvando…' : 'Salvar'}`.
- **States to render:** the categories `Select` shows `disabled` while `useCategoriesForSelect()`'s `isLoading` is `true` (no separate skeleton — matches the "no independent loading state" precedent from `CategoriesSummary`, PM-013); no explicit empty-state copy for zero categories (out of scope — a user with no categories yet cannot usefully create a categorized transaction, but blocking that flow entirely is not in this spec, see Architectural Decisions).

**Component 6 — `NewTransactionDialog`** (new) — `src/modules/transactions/components/new-transaction-dialog.tsx` (mirrors `new-category-dialog.tsx` exactly)

```ts
interface NewTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

- **Composition:** `<Dialog open={open} onOpenChange={onOpenChange}><DialogContent showCloseButton={false} className="gap-6 rounded-xl p-6 sm:max-w-md"><DialogHeaderWithClose title="Nova transação" subtitle="Registre sua despesa ou receita" /><TransactionForm ... /></DialogContent></Dialog>`, using `useCreateTransaction()` for `isLoading`/`fieldErrors`/`formError`, `onSubmit` calls `createTransaction(values)` then `toast.success('Transação criada com sucesso!')` + `onOpenChange(false)` on a truthy result (same shape as `NewCategoryDialog`).

**Component 7 — `TransactionsPage`** (moved + rewritten) — `src/modules/transactions/pages/transactions-page.tsx` (replaces `src/pages/transactions-page.tsx`, matching the `src/modules/<name>/pages/` convention already used by `auth`/`categories`)

```ts
// No props — a route component, same shape as CategoriesPage
```

- **Composition:** `<Header /><main className="mx-auto max-w-[1280px] p-12"><PageHeader title="Transações" subtitle="Gerencie todas as suas transações financeiras" actionLabel="Nova transação" onAction={() => setNewDialogOpen(true)} /></main><NewTransactionDialog open={newDialogOpen} onOpenChange={setNewDialogOpen} />`. The transaction list/grid itself is out of scope (spec.md) — the `<main>` renders only the header for now, same placeholder role the current "Transações em breve" text plays today, just with the real header + working "Nova transação" flow above it.
- **States to render:** none beyond the dialog's own open/closed state.

**Component 8 — `CategoriesPage`** (existing, modified) — `src/modules/categories/pages/categories-page.tsx`

- **Composition:** replace the hardcoded header `<div className="flex items-center justify-between">...</div>` block with `<PageHeader title="Categorias" subtitle="Organize suas transações por categorias" actionLabel="Nova categoria" onAction={() => setNewDialogOpen(true)} />` — no visual/behavioral change, `categories-page.test.tsx`'s existing `getByRole('heading', { name: 'Categorias' })`/`getByText('Organize suas transações por categorias')` assertions keep passing unmodified since `PageHeader` renders the identical DOM shape.

**Component 9 — `TransactionTypeIndicator`** (existing, modified) — `src/components/transaction-type-indicator.tsx`

- **Composition:** relabel `config` per the confirmed nomenclature unification: `income: { label: 'Receita', icon: CircleArrowUp, className: 'text-success' }`, `expense: { label: 'Despesa', icon: CircleArrowDown, className: 'text-destructive' }` (was `'Entrada'`/`'Saída'`). Only consumer today is `src/components/components-preview.tsx` (a dev-only preview page) — no production usage yet, so this is a safe, non-breaking rename. Update `src/components/__tests__/transaction-type-indicator.test.tsx`'s label assertions to match.

**Figma Fidelity:** not run — `spec.md` has no `figma.com` link, only reference screenshots (`.workspace/image copy *.png`) supplied directly by the user. Sizing/spacing/color classes above are inferred from those screenshots plus this repo's existing design-system conventions (`TextInput`, `CategoryForm`, `Button` sizes), not extracted numeric Figma values — if a Figma link for this modal becomes available, re-run `/figma-fidelity` against it and reconcile before/while implementing Phase 2.

### GraphQL/API Blueprint

**Mutation — `CREATE_TRANSACTION`** — `src/modules/transactions/graphql/mutations.ts`

```ts
import { gql } from '@apollo/client'

export const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id
      type
      description
      date
      value
      category {
        id
        title
        color
      }
    }
  }
`

export type TransactionKind = 'EXPENSE' | 'INCOME'

export interface CreateTransactionInput {
  type: TransactionKind
  description: string
  date: string // ISO 8601 — type-graphql's Date scalar (de)serializes to/from an ISO string over the wire
  value: number // Int, cents, must be >= 1 (server: Min(1))
  categoryId: string
}

export interface CreateTransactionData {
  createTransaction: {
    id: string
    type: TransactionKind
    description: string
    date: string
    value: number
    category: { id: string; title: string; color: string } | null
  }
}
```

**Query — `LIST_CATEGORIES_FOR_SELECT`** — `src/modules/transactions/graphql/queries.ts`

```ts
import { gql } from '@apollo/client'

export const LIST_CATEGORIES_FOR_SELECT = gql`
  query ListCategoriesForSelect {
    listCategories {
      id
      title
    }
  }
`

export interface CategoryForSelect {
  id: string
  title: string
}

export interface ListCategoriesForSelectData {
  listCategories: CategoryForSelect[]
}
```

Deliberately a **separate, leaner** document from `src/modules/categories/graphql/queries.ts`'s `LIST_CATEGORIES` (which also fetches `description`/`icon`/`color`/`transactionsQuantity`) — confirmed with the user (2026-09-04): the transaction form's category dropdown only needs `id` + `title`. Both documents resolve to the same normalized `Category:<id>` cache entries (Apollo's `InMemoryCache` merges by `__typename`+`id` regardless of which document fetched which subset of fields), so no `typePolicies` changes are needed and there's no risk of the two queries clobbering each other's cached fields.

**Query — `LIST_TRANSACTIONS`** (stub, for `refetchQueries` only — no hook this feature) — same file

```ts
export const LIST_TRANSACTIONS = gql`
  query ListTransactions {
    listTransactions {
      edges {
        node {
          id
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`
```

`listTransactions`'s args (`startDate`/`endDate`/`first`/`after`) are all optional server-side, so calling this with no variables is valid and returns the first page. This document exists solely so `useCreateTransaction`'s `refetchQueries` has a real target to reference now — no component mounts a `useQuery(LIST_TRANSACTIONS)` in this feature (the transaction list screen is out of scope, per spec.md). When that screen is built, expect this minimal `id`-only selection to be superseded/expanded by that feature's own richer query.

**Hook — `useCreateTransaction`** — `src/modules/transactions/hooks/use-create-transaction.ts` (mirrors `use-create-category.ts` exactly)

```ts
export interface UseCreateTransactionResult {
  createTransaction: (
    input: CreateTransactionInput,
  ) => Promise<CreateTransactionData['createTransaction'] | null>
  isLoading: boolean
  fieldErrors: RegisterFieldError[]
  formError: string | null
}

export function useCreateTransaction(): UseCreateTransactionResult
```

- **Cache strategy:** `useMutation<CreateTransactionData, { input: CreateTransactionInput }>(CREATE_TRANSACTION, { refetchQueries: [{ query: LIST_TRANSACTIONS }] })` — same "preventive" pattern the user confirmed (2026-09-04): no active `LIST_TRANSACTIONS` query today, so this is a no-op until the future list feature mounts one, at which point it starts working automatically with zero changes here.
- **Loading/Error handling:** owned by the hook, identical shape to `useCreateCategory` — `CombinedGraphQLErrors.is(error)` → `error.extensions?.validationErrors` maps to `fieldErrors` (path/message pairs, e.g. `{ path: 'description', message: '...' }`), otherwise `formError` = the error message (GraphQL error) or the fallback string (network/unexpected error). Fallback: `'Não foi possível criar a transação. Tente novamente.'`.

**Hook — `useCategoriesForSelect`** — `src/modules/transactions/hooks/use-categories-for-select.ts` (mirrors `use-list-categories.ts`)

```ts
export interface UseCategoriesForSelectResult {
  categories: CategoryForSelect[]
  isLoading: boolean
  error: string | null
}

export function useCategoriesForSelect(): UseCategoriesForSelectResult
```

- **Cache strategy:** `useQuery<ListCategoriesForSelectData>(LIST_CATEGORIES_FOR_SELECT)` — default `fetchPolicy` (`cache-first`), same as `useListCategories`; no need for `cache-and-network` since the dialog is short-lived (opened fresh each time) and category lists change infrequently.
- **Loading/Error handling:** owned by the hook — `error: string | null` set to a fallback message (`'Não foi possível carregar as categorias.'`) on any error, `categories: data?.listCategories ?? []` while loading/on error.

### Form & Validation Blueprint

**Zod schema** — colocated in `src/modules/transactions/components/transaction-form.tsx` (same convention as `category-form.tsx`)

```ts
const transactionFormSchema = z.object({
  type: z.enum(['EXPENSE', 'INCOME']),
  description: z.string().min(1, 'A descrição é obrigatória'),
  date: z.date({ error: 'Selecione uma data' }),
  value: z.number().positive('O valor deve ser maior que zero'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
})

export type TransactionFormValues = z.infer<typeof transactionFormSchema>
```

- **Form component:** `TransactionForm` owns `useForm<TransactionFormValues>({ resolver: zodResolver(transactionFormSchema), defaultValues: { type: 'EXPENSE', description: '', date: undefined, value: 0, categoryId: '' } })`, same `fieldErrors` → `setError(path, { message })` `useEffect` as `category-form.tsx`. On submit, `NewTransactionDialog`'s `handleSubmit` converts `value` (reais) to cents (`Math.round(values.value * 100)`) and `date` (`Date`) to an ISO string (`values.date.toISOString()`) before calling `createTransaction`.

### State Blueprint

**Omitted:** no state beyond component-local `useState` (`newDialogOpen` in `TransactionsPage`, mirroring `CategoriesPage`'s `newDialogOpen`) and React Hook Form's internal form state — no context, no new persisted/shared state, no URL params.

## Architectural Decisions

Cover all applicable areas from `/grill-me`. Mark any area "Not Applicable" with justification rather than omitting it silently.

- **Scope & Requirements:** Matches spec.md's acceptance criteria. Explicitly out of scope: the transaction list/grid itself, edit/delete of transactions, pagination/filters — this feature is the header + creation modal only.
- **Data & State:** New reads: `LIST_CATEGORIES_FOR_SELECT` (id+title only, confirmed with user 2026-09-04). New write: `createTransaction`. No new Apollo `typePolicies` — normalized cache merges `Category` fields from both the lean and full `listCategories` queries automatically by id.
- **User Experience:** Happy path — click "Nova transação" → modal opens with "Despesa" pre-selected → fill Descrição/Data/Valor/Categoria → "Salvar" → toast success → modal closes, dialog unmounts its form state on next open (fresh `useForm` instance each mount, same as `NewCategoryDialog`). Loading: submit button shows "Salvando…" and is disabled (mirrors category flow); category `Select` disabled while `useCategoriesForSelect` is loading. Empty state: if the user has zero categories, the `Select` renders with no options and `categoryId`'s `min(1)` validation blocks submit with "Selecione uma categoria" — no dedicated empty-state copy in the dropdown itself (small gap, acceptable since categories are already required elsewhere in the app before transactions make sense). Accessibility: `Dialog`/`Select`/`Popover` are all Radix primitives with built-in focus trap/keyboard nav; the type toggle buttons get `aria-pressed` reflecting selection state.
- **Testing & Validation:** Vitest + RTL. `PageHeader`/`DialogHeaderWithClose`: pure prop-driven component tests (render + click). `CurrencyInput`: keystroke-by-keystroke masking tests (digit-in → formatted display + `onChange` value), Backspace, non-digit keys ignored. `DatePickerField`: opens popover, selecting a day calls `onChange` and closes the popover, placeholder shown when `value` is `undefined`. `TransactionForm`: Zod validation messages per field, type toggle switches `type`, submit calls `onSubmit` with parsed values. `useCreateTransaction`/`useCategoriesForSelect`: `MockedProvider`-based hook tests mirroring `use-create-category.test.ts`/`use-list-categories.test.ts` (including a `LIST_TRANSACTIONS` refetch mock in the success case, same fix applied to the categories hooks after PM-013). `NewTransactionDialog`/`TransactionsPage`: integration-style RTL tests mirroring `new-category-dialog`/`categories-page` tests. No e2e — none configured in this repo yet.
- **Implementation Details:** `TransactionForm`/`NewTransactionDialog`/hooks structurally mirror `category-form.tsx`/`new-category-dialog.tsx`/`use-create-category.ts` field-for-field, per this repo's established pattern for create-dialogs.
- **Security Considerations:** `createTransaction`/`listCategories` are both already user-scoped server-side (via `requireCurrentUser(ctx)` — confirmed in `../server/src/modules/transaction/resolvers/transaction.resolver.ts`); no new client-side authorization logic needed. No sensitive data logged (same as category flow — errors go to `formError`/`fieldErrors` state, never `console.log`).
- **Cross-Cutting Concerns:** Toast on success (`sonner`, matches category flow) — no toast on validation error (inline field errors instead, same precedent). No logging/analytics infra in this repo yet (Not Applicable beyond that).
- **Error Scenarios & Failure Modes:** Network error / unexpected error → `formError` fallback message. `extensions.validationErrors` (server-side validation, e.g. `Min(1)` on `value`, `Length(1,500)` on `description`) → mapped 1:1 to `fieldErrors` by `path`, same as category mutations. Race condition: submit button `disabled={isLoading}` prevents a double-submit while the mutation is in flight (same guard as `CategoryForm`); navigating away mid-request is not specially handled — same as every other mutation in this repo today (Not a new gap introduced by this feature).
- **Performance & Scale:** Not Applicable — a single create form, no list rendering, no large dataset in this feature.
- **Module Composition:** New `src/modules/transactions/` module (`components/`, `graphql/`, `hooks/`, `pages/`), following the exact `categories`/`auth` module layout. `PageHeader` and `DialogHeaderWithClose` are promoted to `src/components/` (shared, module-agnostic) rather than living in either module, since both are now used by two different modules — same tier as the existing `Header`.
- **Deployment & Operations:** Not Applicable — no new env vars, no feature flag; the server-side mutations/queries already exist and are deployed (verified against `../server`).
- **Backward Compatibility:** `TransactionTypeIndicator`'s label rename (`'Entrada'/'Saída'` → `'Receita'/'Despesa'`) is the only change to an existing component's observable output; its sole consumer (`components-preview.tsx`, dev-only) and its own test are updated in the same phase — no other caller exists to break. `CategoriesPage`'s header swap to `PageHeader` is a pure internal refactor (identical rendered DOM), verified against its existing test assertions.

## Implementation Phases

Each bullet must be traceable to a Blueprint above and carry an exact file path, exact symbol/signature or prop list, and exact test cases inline — see [docs/architecture/dor.md](../../architecture/dor.md)'s granularity rule.

### Phase 1: Foundation

- [ ] `PageHeader` (`src/components/page-header.tsx`): props `{ title: string, subtitle: string, actionLabel: string, onAction: () => void }`, renders the header block described in Component Blueprint 1
- [ ] `DialogHeaderWithClose` (`src/components/dialog-header-with-close.tsx`): move+rename from `src/modules/categories/components/category-dialog-header.tsx` (`CategoryDialogHeader` → `DialogHeaderWithClose`), update imports in `new-category-dialog.tsx` and `edit-category-dialog.tsx`
- [ ] `CurrencyInput` (`src/modules/transactions/components/currency-input.tsx`): props `{ id: string, label: string, value: number, onChange: (value: number) => void, errorMessage?: string }`, cents-first masking behavior per Component Blueprint 3
- [ ] Add `Popover`/`Calendar` shadcn primitives: `pnpm dlx shadcn@latest add popover calendar` (no `-p` flag)
- [ ] `DatePickerField` (`src/modules/transactions/components/date-picker-field.tsx`): props `{ id: string, label: string, value: Date | undefined, onChange: (value: Date | undefined) => void, errorMessage?: string }`, per Component Blueprint 4
- [ ] `src/modules/transactions/graphql/mutations.ts`: `CREATE_TRANSACTION` gql document + `TransactionKind`/`CreateTransactionInput`/`CreateTransactionData` types, per GraphQL Blueprint
- [ ] `src/modules/transactions/graphql/queries.ts`: `LIST_CATEGORIES_FOR_SELECT` + `CategoryForSelect`/`ListCategoriesForSelectData` types, and `LIST_TRANSACTIONS` stub document, per GraphQL Blueprint
- [ ] `useCreateTransaction` (`src/modules/transactions/hooks/use-create-transaction.ts`): signature + behavior per GraphQL Blueprint (mirrors `use-create-category.ts`)
- [ ] `useCategoriesForSelect` (`src/modules/transactions/hooks/use-categories-for-select.ts`): signature + behavior per GraphQL Blueprint (mirrors `use-list-categories.ts`)
- [ ] Tests: `src/components/__tests__/page-header.test.tsx` (renders title/subtitle/actionLabel, calls `onAction` on click), `src/components/__tests__/dialog-header-with-close.test.tsx` (renamed from `category-dialog-header.test.tsx`, update import), `src/modules/transactions/components/__tests__/currency-input.test.tsx` (digit keystrokes format correctly, e.g. "1","5","0" → "R$ 1,50"; Backspace removes last digit; non-digit keys ignored; calls `onChange` with the reais float), `src/modules/transactions/components/__tests__/date-picker-field.test.tsx` (shows "Selecione" placeholder when `value` is `undefined`, opens popover on click, selecting a day calls `onChange`), `src/modules/transactions/hooks/__tests__/use-create-transaction.test.ts` (resolves with created transaction + toggles `isLoading`, maps `extensions.validationErrors` to `fieldErrors`, sets `formError` fallback on network error — including a `LIST_TRANSACTIONS` refetch mock in the success case), `src/modules/transactions/hooks/__tests__/use-categories-for-select.test.ts` (resolves with `{ id, title }[]`, `isLoading`/`error` states)

### Phase 2: Features

- [ ] `TransactionForm` (`src/modules/transactions/components/transaction-form.tsx`): `transactionFormSchema` + `TransactionFormValues` + component per Form & Validation Blueprint and Component Blueprint 5
- [ ] `NewTransactionDialog` (`src/modules/transactions/components/new-transaction-dialog.tsx`): props `{ open: boolean, onOpenChange: (open: boolean) => void }`, per Component Blueprint 6
- [ ] `TransactionsPage` (`src/modules/transactions/pages/transactions-page.tsx`, replacing `src/pages/transactions-page.tsx`): per Component Blueprint 7; update `src/App.tsx`'s import from `@/pages/transactions-page` to `@/modules/transactions/pages/transactions-page`
- [ ] `CategoriesPage` (`src/modules/categories/pages/categories-page.tsx`): replace the hardcoded header block with `<PageHeader title="Categorias" subtitle="Organize suas transações por categorias" actionLabel="Nova categoria" onAction={() => setNewDialogOpen(true)} />`, per Component Blueprint 8
- [ ] `TransactionTypeIndicator` (`src/components/transaction-type-indicator.tsx`): relabel `config` per Component Blueprint 9 (`'Entrada'`→`'Receita'`, `'Saída'`→`'Despesa'`)
- [ ] Tests: `src/modules/transactions/components/__tests__/transaction-form.test.tsx` (required-field validation messages for `description`/`date`/`value`/`categoryId`, type toggle switches `type` between `'EXPENSE'`/`'INCOME'` with `aria-pressed` reflecting selection, submit calls `onSubmit` with parsed `TransactionFormValues`), `src/modules/transactions/components/__tests__/new-transaction-dialog.test.tsx` (submits → calls `useCreateTransaction`'s `createTransaction` with cents-converted `value` and ISO `date` → success toast + closes; server validation error → inline field error, dialog stays open), `src/modules/transactions/pages/__tests__/transactions-page.test.tsx` (renders `PageHeader` with "Transações"/subtitle, clicking "Nova transação" opens `NewTransactionDialog`), update `src/modules/categories/pages/__tests__/categories-page.test.tsx` only if any assertion breaks (none expected — DOM shape unchanged), update `src/components/__tests__/transaction-type-indicator.test.tsx`'s label assertions to `'Receita'`/`'Despesa'`

## Test Cases

Sibling to Implementation Phases, same `### Phase N:` grouping. Every entry must trace to a hook's cache-strategy branch, a component state, or a Zod rule already written above.

### Phase 1: Foundation

- [ ] `PageHeader` renders `title` as an `h1`, `subtitle` as body text, and `actionLabel` on the action button
- [ ] `PageHeader` calls `onAction` when the action button is clicked
- [ ] `DialogHeaderWithClose` renders `title`/`subtitle` and its close button triggers `DialogClose`
- [ ] `CurrencyInput` formats "1","5","0" keystrokes into displayed "R$ 1,50" and calls `onChange(1.5)`
- [ ] `CurrencyInput` removes the last digit on Backspace and re-formats
- [ ] `CurrencyInput` ignores non-digit, non-Backspace keys
- [ ] `DatePickerField` shows the "Selecione" placeholder when `value` is `undefined`
- [ ] `DatePickerField` calls `onChange` with the selected date and closes the popover
- [ ] `useCreateTransaction` resolves with the created transaction and toggles `isLoading` on success
- [ ] `useCreateTransaction` maps `extensions.validationErrors` straight to `fieldErrors` when present
- [ ] `useCreateTransaction` sets `formError` to the fallback message on a network/unexpected error
- [ ] `useCategoriesForSelect` resolves with `{ id, title }[]` from `listCategories`
- [ ] `useCategoriesForSelect` sets the fallback error message on a network error

### Phase 2: Features

- [ ] `TransactionForm` shows "A descrição é obrigatória" when `description` is submitted empty
- [ ] `TransactionForm` shows "Selecione uma data" when `date` is submitted unset
- [ ] `TransactionForm` shows "O valor deve ser maior que zero" when `value` is `0`
- [ ] `TransactionForm` shows "Selecione uma categoria" when `categoryId` is submitted empty
- [ ] `TransactionForm`'s type toggle defaults to "Despesa" (`EXPENSE`) selected
- [ ] `TransactionForm`'s type toggle switches `type` to `'INCOME'` when "Receita" is clicked
- [ ] `TransactionForm` calls `onSubmit` with parsed `TransactionFormValues` when all fields are valid
- [ ] `NewTransactionDialog` converts `value` (reais) to cents and `date` to an ISO string before calling `createTransaction`
- [ ] `NewTransactionDialog` shows a success toast and closes on a successful submit
- [ ] `NewTransactionDialog` keeps the dialog open and shows the field error when the server returns a validation error
- [ ] `TransactionsPage` renders `PageHeader` with title "Transações" and subtitle "Gerencie todas as suas transações financeiras"
- [ ] `TransactionsPage` opens `NewTransactionDialog` when "Nova transação" is clicked
- [ ] `TransactionTypeIndicator` renders "Receita" for `type="income"` and "Despesa" for `type="expense"`

## Dependencies

- New shadcn primitives (no new npm packages beyond what `shadcn add` pulls in): `Popover`, `Calendar` — `pnpm dlx shadcn@latest add popover calendar`. `Calendar` pulls in `react-day-picker` as a transitive dependency (not yet in `package.json`); no `date-fns` needed (see Component Blueprint 4).
- Internal: `Category`-adjacent types (module-isolated, own `CategoryForSelect` — not importing from `src/modules/categories/`, mirroring the server's own `TransactionCategoryType` isolation), `RegisterFieldError` (`src/modules/auth/hooks/use-register-user.ts`, already reused by the categories module), `Select`/`Dialog`/`Button`/`Input`/`Label` UI primitives, `cn` util, `sonner` toast.

## Risks & Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| `CurrencyInput`'s hand-rolled cents-first masking is a new, nontrivial piece of interaction logic (not a shadcn primitive) | Medium — most likely spot for subtle UX bugs (cursor position, paste handling) | Dedicated keystroke-level unit tests (Phase 1 Test Cases); paste handling explicitly out of scope for this pass — flagged as a known gap, not silently untested |
| `LIST_TRANSACTIONS` stub query (id-only) may not match the shape the future transaction-list feature actually needs, causing churn when that feature lands | Low | Explicitly documented in the GraphQL Blueprint as a stub expected to be superseded — not presented as the list feature's real query |
| No Figma link for this modal (screenshots only) means spacing/sizing values are inferred, not extracted numerically | Low-Medium | Documented as a deviation in Component Blueprint's Figma Fidelity note; re-run `/figma-fidelity` if/when a real Figma link is provided |
| Moving `src/pages/transactions-page.tsx` → `src/modules/transactions/pages/` changes an import path consumed by `App.tsx` | Low | Single call site, updated in the same phase/commit as the move (Phase 2) |

## Success Criteria

- [ ] All acceptance criteria in `spec.md` met
- [ ] `pnpm test`, `pnpm lint`, `pnpm tsc -b` all pass
- [ ] `/categorias` renders identically to before (verified by existing `categories-page.test.tsx` assertions passing unmodified)
