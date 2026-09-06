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

