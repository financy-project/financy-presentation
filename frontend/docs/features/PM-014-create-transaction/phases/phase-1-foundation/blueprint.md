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

