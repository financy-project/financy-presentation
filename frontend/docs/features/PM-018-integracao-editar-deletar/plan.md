# integracao-editar-deletar - PM-018 - Implementation Plan

## Definition of Ready (DoR) Blueprints

This plan mirrors an existing, already-shipped pattern in this codebase: `src/modules/categories/` already implements edit (`edit-category-dialog.tsx` + `category-form.tsx`'s `defaultValues` prop + `use-update-category.ts`) and delete (`delete-category-alert.tsx` + `use-delete-category.ts`), wired via `editingCategory`/`deletingCategory` state in `categories-page.tsx`. This plan replicates that exact structure for transactions — no new UI pattern is introduced.

### Component Blueprint

**Component Name(s) and file paths:**

- `TransactionForm` (**modified**) — `src/modules/transactions/components/transaction-form.tsx`
- `EditTransactionDialog` (**new**) — `src/modules/transactions/components/edit-transaction-dialog.tsx`
- `DeleteTransactionAlert` (**new**) — `src/modules/transactions/components/delete-transaction-alert.tsx`
- `TransactionsTable` (**modified**) — `src/modules/transactions/components/transactions-table.tsx`
- `TransactionsPage` (**modified**) — `src/modules/transactions/pages/transactions-page.tsx`

**Props type blocks:**

```ts
// transaction-form.tsx — only new bit is `defaultValues`, mirrors CategoryFormProps
interface TransactionFormProps {
  defaultValues?: Partial<TransactionFormValues>
  isLoading: boolean
  fieldErrors: RegisterFieldError[]
  formError: string | null
  onSubmit: (values: TransactionFormValues) => void | Promise<void>
}

// edit-transaction-dialog.tsx
interface EditTransactionDialogProps {
  transaction: TransactionListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// delete-transaction-alert.tsx
interface DeleteTransactionAlertProps {
  transaction: TransactionListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// transactions-table.tsx — adds two callbacks, everything else unchanged
interface TransactionsTableProps {
  transactions: TransactionListItem[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  totalRecord: number
  pageSize: number
  className?: string
  onEdit: (transaction: TransactionListItem) => void
  onDelete: (transaction: TransactionListItem) => void
}
```

**Composition:**

- `EditTransactionDialog` renders `Dialog`/`DialogContent` (`src/components/ui/dialog.tsx`) + `DialogHeaderWithClose` (`src/components/dialog-header-with-close.tsx`) + `TransactionForm` — identical shell to `NewTransactionDialog`/`EditCategoryDialog`. No new primitive needed.
- `DeleteTransactionAlert` renders `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction` — all already in `src/components/ui/alert-dialog.tsx` and already used by `DeleteCategoryAlert`. No new primitive needed.
- `TransactionsTable`'s existing `IconButton` (`Trash`, `SquarePen`) in the "Ações" column gain `onClick={() => onDelete(transaction)}` / `onClick={() => onEdit(transaction)}` respectively — buttons already render, only the handlers are new.
- No Figma link in `spec.md` for this feature — Figma Fidelity subsection **omitted** (this feature reuses existing rendered UI, no new visual design).

**States to render:**

- `EditTransactionDialog`: not rendered at all when `transaction` is `null` (mirrors `EditCategoryDialog`'s `if (!open || !category) return <></>` guard) → loading (`isLoading`, "Salvando…", disabled submit) → field/form error (`fieldErrors`/`formError`, same as `NewTransactionDialog`) → success (toast + close).
- `DeleteTransactionAlert`: same null-guard → loading (`isLoading`, "Excluindo…", disabled `AlertDialogAction`) → error (`role="alert"` paragraph inside the alert, dialog stays open) → success (toast + close).

### GraphQL/API Blueprint

**Mutations + exact `gql` documents** (added to `src/modules/transactions/graphql/mutations.ts`, alongside the existing `CREATE_TRANSACTION`):

```ts
export const UPDATE_TRANSACTION = gql`
  mutation UpdateTransaction($id: ID!, $input: UpdateTransactionInput!) {
    updateTransaction(id: $id, input: $input) {
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

export interface UpdateTransactionInput {
  type?: TransactionKind
  description?: string
  date?: string
  value?: number
  categoryId?: string
}

export interface UpdateTransactionData {
  updateTransaction: {
    id: string
    type: TransactionKind
    description: string
    date: string
    value: number
    category: { id: string; title: string; color: string } | null
  }
}

export const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`

export interface DeleteTransactionData {
  deleteTransaction: boolean
}
```

**Hook names + signatures** (new files, mirroring `use-create-transaction.ts` / `use-delete-category.ts` exactly):

```ts
// src/modules/transactions/hooks/use-update-transaction.ts
export interface UseUpdateTransactionResult {
  updateTransaction: (
    id: string,
    input: UpdateTransactionInput,
  ) => Promise<UpdateTransactionData['updateTransaction'] | null>
  isLoading: boolean
  fieldErrors: RegisterFieldError[]
  formError: string | null
}
export function useUpdateTransaction(): UseUpdateTransactionResult

// src/modules/transactions/hooks/use-delete-transaction.ts
export interface UseDeleteTransactionResult {
  deleteTransaction: (id: string) => Promise<boolean>
  isLoading: boolean
  error: string | null
}
export function useDeleteTransaction(): UseDeleteTransactionResult
```

- `useUpdateTransaction` wraps `useMutation<UpdateTransactionData, { id: string; input: UpdateTransactionInput }>(UPDATE_TRANSACTION, { refetchQueries: [{ query: LIST_TRANSACTIONS }] })`, with the identical try/catch `CombinedGraphQLErrors` → `fieldErrors`/`formError` split as `useCreateTransaction` (fallback message: `'Não foi possível atualizar a transação. Tente novamente.'`).
- `useDeleteTransaction` wraps `useMutation<DeleteTransactionData, { id: string }>(DELETE_TRANSACTION, { refetchQueries: [{ query: LIST_TRANSACTIONS }] })`, identical shape to `useDeleteCategory` (fallback message: `'Não foi possível excluir a transação. Tente novamente.'`).

**Cache strategy:** `refetchQueries: [{ query: LIST_TRANSACTIONS }]` for both — same as `useCreateTransaction`. Per grill-me decision, no manual `page` adjustment is added: Apollo's imperative `refetchQueries` with only `{ query }` (no `variables`) refetches **all currently active watchers of that query using their own current variables**, so a delete/edit on page 2 refetches page 2 in place — matches the chosen behavior ("mantém a página atual e faz o refetch dessa página"). If that refetch comes back with 0 rows (e.g. last item on a page > 1 was deleted), `TransactionsTable` shows its existing empty-state message for that page; no auto page-decrement is implemented (explicit trade-off, see Risks).

**Loading/Error handling:** owned by the hooks (`isLoading`/`fieldErrors`/`formError` for update; `isLoading`/`error` for delete), rendered by `EditTransactionDialog`/`DeleteTransactionAlert` exactly like `EditCategoryDialog`/`DeleteCategoryAlert` do today.

### Form & Validation Blueprint

- **No new Zod schema.** Reuses `transactionFormSchema` (`type`, `description`, `date`, `value`, `categoryId`) unchanged from `transaction-form.tsx` — same rules for create and edit.
- **Form component:** `TransactionForm` keeps owning `useForm`/`zodResolver`; only change is spreading an optional `defaultValues` prop into `useForm`'s `defaultValues`, identical to `CategoryForm`:
  ```ts
  useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: 'EXPENSE',
      description: '',
      date: undefined,
      value: 0,
      categoryId: '',
      ...defaultValues,
    },
  })
  ```
- `EditTransactionDialog` computes the `defaultValues` passed in from `transaction: TransactionListItem`:
  ```ts
  {
    type: transaction.type,
    description: transaction.description,
    date: new Date(transaction.date),
    value: transaction.value / 100, // server sends cents; CurrencyInput/form work in reais, same conversion NewTransactionDialog does in reverse
    categoryId: transaction.category?.id ?? '',
  }
  ```
- Submit wiring: `EditTransactionDialog.handleSubmit` calls `updateTransaction(transaction.id, { type: values.type, description: values.description, date: values.date.toISOString(), value: Math.round(values.value * 100), categoryId: values.categoryId })` — same field mapping `NewTransactionDialog` already does for `createTransaction`.

### State Blueprint

- **What state:** `editingTransaction: TransactionListItem | null` and `deletingTransaction: TransactionListItem | null` in `TransactionsPage`, mirroring `editingCategory`/`deletingCategory` in `categories-page.tsx`. Component-local `useState` is enough — no context or extra state needed, since only one transaction can be edited/deleted at a time and the data (`TransactionListItem`) is already fully available from the already-fetched table rows (no extra query needed to open the dialogs).
- **Where it lives:** `useState` in `TransactionsPage` only.
- **Shape:**
  ```ts
  const [editingTransaction, setEditingTransaction] = useState<TransactionListItem | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<TransactionListItem | null>(null)
  ```

---

## Architectural Decisions

- **Scope & Requirements:** Success = clicking "Editar"/"Excluir" on any table row opens the corresponding dialog, wired to `updateTransaction`/`deleteTransaction`, list refreshes on success. Out of scope: bulk edit/delete, changes to `TransactionForm`'s fields/validation, changes to the table's columns/layout beyond the `onClick` wiring. No backward-compat constraint beyond not breaking `NewTransactionDialog` (create flow untouched).
- **Data & State:** No new React Query/Apollo cache policies. Reads/mutates the `Transaction` GraphQL entity via `updateTransaction`/`deleteTransaction`. New client state is the two `useState<TransactionListItem | null>` in `TransactionsPage` (see State Blueprint) — nothing persisted, reset to `null` on close.
- **User Experience:** Happy path — click "Editar" → modal pre-filled → "Salvar" → toast "Transação atualizada com sucesso!" → modal closes → table refetches. Click "Excluir" → confirm dialog ("Excluir transação" / "Tem certeza que deseja excluir esta transação? Essa ação não pode ser desfeita.", buttons **"Não"**/**"Sim"** per user decision, "Sim" styled `variant="destructive"`) → toast "Transação excluída com sucesso!" → refetch. Loading: submit/confirm buttons disabled + label swaps to "Salvando…"/"Excluindo…" (existing pattern). Empty state: unaffected (table already handles `transactions.length === 0`). Accessibility: both dialogs are Radix primitives (focus trap + Escape-to-close come free); errors rendered with `role="alert"`; `IconButton`s already carry `aria-label="Editar"`/`aria-label="Excluir"`.
- **Testing & Validation:** Vitest + RTL, mirroring the categories module 1:1 (see Test Cases below). No E2E — none configured for this repo yet, not adding one for this feature.
- **Implementation Details:** Reuses `TransactionForm`, `DialogHeaderWithClose`, `Dialog`/`DialogContent`, `AlertDialog*` — all already exist. New: 2 mutations + 2 hooks + 2 components. No new dependency.
- **Security Considerations:** `updateTransaction`/`deleteTransaction` already scope by `userId` server-side (`requireCurrentUser`) — a user can only mutate their own transactions; no client-side authorization logic needed beyond what Apollo's auth link already attaches. No sensitive data logged; no unescaped user input rendered (React escapes by default, same as the existing create flow).
- **Cross-Cutting Concerns:** Toasts via `sonner` (`toast.success`), same as create/category flows. Errors stay component-local (`role="alert"` text), no shared error boundary needed — consistent with the rest of the app.
- **Error Scenarios & Failure Modes:** GraphQL validation error on update → `fieldErrors` mapped onto form fields via `extensions.validationErrors` (same as create). Network/unexpected error on update → generic `formError`. Delete failure (network or otherwise) → `error` shown inside the alert dialog, **dialog stays open** (requires `event.preventDefault()` in `AlertDialogAction`'s `onClick`, exactly as `DeleteCategoryAlert` already does — Radix's `AlertDialog.Action` auto-closes on click otherwise). Race condition: only one of the two dialogs can be open at a time in practice (opening one doesn't close the other automatically, but a user can't meaningfully trigger both since each opens from its own row action) — not guarded further, consistent with how `categories-page.tsx` handles it today.
- **Performance & Scale:** N/A — no new list/bulk rendering; table already paginated at 10/page.
- **Module Composition:** New components stay inside `src/modules/transactions/`, following the existing `components/`/`hooks/`/`graphql/` split. `EditTransactionDialog`/`DeleteTransactionAlert` are siblings of `NewTransactionDialog`, not a generalized single dialog — this was an explicit choice (see below) to match the already-established `EditCategoryDialog`/`DeleteCategoryAlert`/`NewCategoryDialog` three-sibling pattern in `categories/`, keeping the two modules consistent.
- **Deployment & Operations:** No new env var, no feature flag. Manual post-deploy check: create, edit, and delete a transaction end-to-end against the real list.
- **Backward Compatibility:** `TransactionForm`'s new `defaultValues` prop is optional and additive — `NewTransactionDialog` needs zero changes and keeps compiling/working as-is. `TransactionsTable`'s two new required props (`onEdit`, `onDelete`) are a breaking prop-contract change for that component's only caller, `TransactionsPage`, which is updated in the same phase.

## Implementation Phases

### Phase 1: Foundation

- [ ] Add `UPDATE_TRANSACTION` gql document + `UpdateTransactionInput`/`UpdateTransactionData` types to `src/modules/transactions/graphql/mutations.ts` (exact shapes in GraphQL/API Blueprint above)
- [ ] Add `DELETE_TRANSACTION` gql document + `DeleteTransactionData` type to `src/modules/transactions/graphql/mutations.ts`
- [ ] Implement `useUpdateTransaction()` in `src/modules/transactions/hooks/use-update-transaction.ts`: wraps `useMutation<UpdateTransactionData, { id: string; input: UpdateTransactionInput }>(UPDATE_TRANSACTION, { refetchQueries: [{ query: LIST_TRANSACTIONS }] })`; returns `{ updateTransaction, isLoading, fieldErrors, formError }`; fallback message `'Não foi possível atualizar a transação. Tente novamente.'` — copy `use-create-transaction.ts`'s try/catch structure verbatim
- [ ] Implement `useDeleteTransaction()` in `src/modules/transactions/hooks/use-delete-transaction.ts`: wraps `useMutation<DeleteTransactionData, { id: string }>(DELETE_TRANSACTION, { refetchQueries: [{ query: LIST_TRANSACTIONS }] })`; returns `{ deleteTransaction, isLoading, error }`; fallback message `'Não foi possível excluir a transação. Tente novamente.'` — copy `use-delete-category.ts` verbatim, swapping the mutation/query
- [ ] Unit tests `src/modules/transactions/hooks/__tests__/use-update-transaction.test.ts` (mirrors `use-update-category.test.ts` with `MockedProvider`): (1) resolves the updated transaction and toggles `isLoading` on success; (2) maps `CombinedGraphQLErrors` with `extensions.validationErrors` onto `fieldErrors`; (3) sets the fallback `formError` on a network/unexpected error
- [ ] Unit tests `src/modules/transactions/hooks/__tests__/use-delete-transaction.test.ts` (mirrors `use-delete-category.test.ts`): (1) resolves `true` and toggles `isLoading` on success; (2) sets the fallback error message on a network/unexpected error

### Phase 2: Features

- [ ] Add `defaultValues?: Partial<TransactionFormValues>` to `TransactionFormProps` in `src/modules/transactions/components/transaction-form.tsx`, spread into `useForm`'s `defaultValues` after the existing create defaults (exact code in Form & Validation Blueprint above)
- [ ] Implement `EditTransactionDialog` in `src/modules/transactions/components/edit-transaction-dialog.tsx` per the Component/Form Blueprints above: renders `null` (`<></>`) when `!open || !transaction`; `Dialog`/`DialogContent` + `DialogHeaderWithClose title="Editar transação" subtitle="Atualize os dados da transação"` + `TransactionForm` with computed `defaultValues`; `handleSubmit` calls `updateTransaction(transaction.id, {...})` (exact field mapping in Form & Validation Blueprint), on success `toast.success('Transação atualizada com sucesso!')` + `onOpenChange(false)`
- [ ] Implement `DeleteTransactionAlert` in `src/modules/transactions/components/delete-transaction-alert.tsx` per the Component Blueprint above: renders `null` when `!open || !transaction`; `AlertDialogTitle` "Excluir transação", `AlertDialogDescription` "Tem certeza que deseja excluir esta transação? Essa ação não pode ser desfeita."; `AlertDialogCancel` label **"Não"**; `AlertDialogAction variant="destructive"` label **"Sim"** (or "Excluindo…" while `isLoading`), `onClick` calls `event.preventDefault()` then `deleteTransaction(transaction.id)`, on success `toast.success('Transação excluída com sucesso!')` + `onOpenChange(false)`; renders `error` (if any) as a `role="alert"` paragraph above the footer
- [ ] In `src/modules/transactions/components/transactions-table.tsx`: add `onEdit`/`onDelete` to `TransactionsTableProps`; wire the existing `Trash` `IconButton` to `onClick={() => onDelete(transaction)}` and the existing `SquarePen` `IconButton` to `onClick={() => onEdit(transaction)}` inside the row map (no other change to the component)
- [ ] In `src/modules/transactions/pages/transactions-page.tsx`: add `editingTransaction`/`deletingTransaction` state (State Blueprint above); pass `onEdit={setEditingTransaction}`/`onDelete={setDeletingTransaction}` to `TransactionsTable`; render `<EditTransactionDialog transaction={editingTransaction} open={!!editingTransaction} onOpenChange={(open) => !open && setEditingTransaction(null)} />` and `<DeleteTransactionAlert transaction={deletingTransaction} open={!!deletingTransaction} onOpenChange={(open) => !open && setDeletingTransaction(null)} />` after the existing `NewTransactionDialog`

### Phase 3: Polish

- [ ] Unit tests `src/modules/transactions/components/__tests__/transaction-form.test.tsx` (extend existing file): passing `defaultValues` pre-fills the type toggle, description, date, value and category fields
- [ ] Unit tests `src/modules/transactions/components/__tests__/edit-transaction-dialog.test.tsx` (new, mirrors `edit-category-dialog` behavior — no existing test file to copy 1:1, but same shape as `new-transaction-dialog.test.tsx`): (1) renders nothing when `transaction` is `null`; (2) pre-fills the form from `transaction`; (3) calls `updateTransaction(transaction.id, input)` with the mapped fields on submit; (4) shows toast + calls `onOpenChange(false)` on success; (5) renders `fieldErrors`/`formError` without closing on failure
- [ ] Unit tests `src/modules/transactions/components/__tests__/delete-transaction-alert.test.tsx` (new, copies `delete-category-alert.test.tsx`'s 4 cases): (1) renders the transaction's description in the confirmation copy; (2) clicking "Não" does not call `deleteTransaction`; (3) clicking "Sim" calls `deleteTransaction(transaction.id)`, toasts and closes on success; (4) stays open and renders the error when the delete fails
- [ ] Update `src/modules/transactions/components/__tests__/transactions-table.test.tsx`: clicking the "Editar"/"Excluir" `IconButton` on a row calls `onEdit`/`onDelete` with that row's transaction
- [ ] Update `src/modules/transactions/pages/__tests__/transactions-page.test.tsx`: clicking a row's "Editar" opens `EditTransactionDialog` for that transaction; clicking "Excluir" opens `DeleteTransactionAlert` for that transaction

## Test Cases

### Phase 1: Foundation

- [ ] `useUpdateTransaction` resolves the updated transaction and sets `isLoading` back to `false` on success
- [ ] `useUpdateTransaction` maps `extensions.validationErrors` onto `fieldErrors` on a GraphQL validation error
- [ ] `useUpdateTransaction` sets the fallback `formError` on a network/unexpected error
- [ ] `useDeleteTransaction` resolves `true` and toggles `isLoading` on success
- [ ] `useDeleteTransaction` sets the fallback error message on a network/unexpected error

### Phase 2: Features

- [ ] `TransactionsTable` calls `onEdit(transaction)` when that row's "Editar" button is clicked
- [ ] `TransactionsTable` calls `onDelete(transaction)` when that row's "Excluir" button is clicked

### Phase 3: Polish

- [ ] `TransactionForm` pre-fills all fields from `defaultValues` when provided
- [ ] `EditTransactionDialog` renders nothing when `transaction` is `null`
- [ ] `EditTransactionDialog` pre-fills the form from the given `transaction`
- [ ] `EditTransactionDialog` calls `updateTransaction(transaction.id, input)` with the mapped fields on submit
- [ ] `EditTransactionDialog` toasts success and calls `onOpenChange(false)` after a successful update
- [ ] `EditTransactionDialog` shows `fieldErrors`/`formError` and stays open on a failed update
- [ ] `DeleteTransactionAlert` shows the transaction's description in the confirmation copy
- [ ] `DeleteTransactionAlert` does not call `deleteTransaction` when "Não" is clicked
- [ ] `DeleteTransactionAlert` calls `deleteTransaction(transaction.id)`, toasts and closes on "Sim" success
- [ ] `DeleteTransactionAlert` stays open and renders the error when the delete fails
- [ ] `TransactionsPage` opens `EditTransactionDialog` for the clicked row's transaction
- [ ] `TransactionsPage` opens `DeleteTransactionAlert` for the clicked row's transaction

## Dependencies

- No new external dependencies.
- Internal: `TransactionForm`, `DialogHeaderWithClose`, `Dialog`/`DialogContent`, `AlertDialog*` (`src/components/ui/alert-dialog.tsx`), `IconButton`, `useCategoriesForSelect` (unchanged, already used by `TransactionForm`), `LIST_TRANSACTIONS` query.

## Risks & Mitigations

| Risk                                                                                                   | Impact | Mitigation                                                                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deleting/editing the only item on a page > 1 leaves that page showing the empty state until the user navigates back | Low    | Explicit product decision (grill-me): keep current page + refetch, no auto page-decrement. Documented here and in Architectural Decisions/User Experience.                                    |
| Radix `AlertDialog.Action` auto-closes the dialog before the mutation resolves                          | Medium | `event.preventDefault()` in `onClick` (already proven in `DeleteCategoryAlert`); only call `onOpenChange(false)` manually after a successful `deleteTransaction`                              |
| `TransactionsTable`'s new required `onEdit`/`onDelete` props break any other caller                     | Low    | Grepped: `TransactionsPage` is the only caller; updated in the same phase                                                                                                                      |

## Success Criteria

- [ ] All acceptance criteria in `spec.md` met
- [ ] Tests passing (`pnpm test`)
- [ ] `pnpm build` compiles without errors
