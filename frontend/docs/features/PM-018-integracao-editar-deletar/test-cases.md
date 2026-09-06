# integracao-editar-deletar - PM-018 - Test Cases

### Phase 1: Foundation

- [x] T-001: `useUpdateTransaction` resolves the updated transaction and sets `isLoading` back to `false` on success
- [x] T-002: `useUpdateTransaction` maps `extensions.validationErrors` onto `fieldErrors` on a GraphQL validation error
- [x] T-003: `useUpdateTransaction` sets the fallback `formError` on a network/unexpected error
- [x] T-004: `useDeleteTransaction` resolves `true` and toggles `isLoading` on success
- [x] T-005: `useDeleteTransaction` sets the fallback error message on a network/unexpected error

### Phase 2: Features

- [x] T-006: `TransactionsTable` calls `onEdit(transaction)` when that row's "Editar" button is clicked
- [x] T-007: `TransactionsTable` calls `onDelete(transaction)` when that row's "Excluir" button is clicked

### Phase 3: Polish

- [x] T-008: `TransactionForm` pre-fills all fields from `defaultValues` when provided
- [x] T-009: `EditTransactionDialog` renders nothing when `transaction` is `null`
- [x] T-010: `EditTransactionDialog` pre-fills the form from the given `transaction`
- [x] T-011: `EditTransactionDialog` calls `updateTransaction(transaction.id, input)` with the mapped fields on submit
- [x] T-012: `EditTransactionDialog` toasts success and calls `onOpenChange(false)` after a successful update
- [x] T-013: `EditTransactionDialog` shows `fieldErrors`/`formError` and stays open on a failed update
- [x] T-014: `DeleteTransactionAlert` shows the transaction's description in the confirmation copy
- [x] T-015: `DeleteTransactionAlert` does not call `deleteTransaction` when "Não" is clicked
- [x] T-016: `DeleteTransactionAlert` calls `deleteTransaction(transaction.id)`, toasts and closes on "Sim" success
- [x] T-017: `DeleteTransactionAlert` stays open and renders the error when the delete fails
- [x] T-018: `TransactionsPage` opens `EditTransactionDialog` for the clicked row's transaction
- [x] T-019: `TransactionsPage` opens `DeleteTransactionAlert` for the clicked row's transaction
