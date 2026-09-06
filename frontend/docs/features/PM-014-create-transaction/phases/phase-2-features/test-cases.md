# Phase 2: Features - Test Cases

- [x] T-014: `TransactionForm` shows "A descrição é obrigatória" when `description` is submitted empty
- [x] T-015: `TransactionForm` shows "Selecione uma data" when `date` is submitted unset
- [x] T-016: `TransactionForm` shows "O valor deve ser maior que zero" when `value` is `0`
- [x] T-017: `TransactionForm` shows "Selecione uma categoria" when `categoryId` is submitted empty
- [x] T-018: `TransactionForm`'s type toggle defaults to "Despesa" (`EXPENSE`) selected
- [x] T-019: `TransactionForm`'s type toggle switches `type` to `'INCOME'` when "Receita" is clicked
- [x] T-020: `TransactionForm` calls `onSubmit` with parsed `TransactionFormValues` when all fields are valid
- [x] T-021: `NewTransactionDialog` converts `value` (reais) to cents and `date` to an ISO string before calling `createTransaction`
- [x] T-022: `NewTransactionDialog` shows a success toast and closes on a successful submit
- [x] T-023: `NewTransactionDialog` keeps the dialog open and shows the field error when the server returns a validation error
- [x] T-024: `TransactionsPage` renders `PageHeader` with title "Transações" and subtitle "Gerencie todas as suas transações financeiras"
- [x] T-025: `TransactionsPage` opens `NewTransactionDialog` when "Nova transação" is clicked
- [x] T-026: `TransactionTypeIndicator` renders "Receita" for `type="income"` and "Despesa" for `type="expense"`
