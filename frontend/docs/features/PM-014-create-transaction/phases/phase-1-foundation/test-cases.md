# Phase 1: Foundation - Test Cases

- [x] T-001: `PageHeader` renders `title` as an `h1`, `subtitle` as body text, and `actionLabel` on the action button
- [x] T-002: `PageHeader` calls `onAction` when the action button is clicked
- [x] T-003: `DialogHeaderWithClose` renders `title`/`subtitle` and its close button triggers `DialogClose`
- [x] T-004: `CurrencyInput` formats "1","5","0" keystrokes into displayed "R$ 1,50" and calls `onChange(1.5)`
- [x] T-005: `CurrencyInput` removes the last digit on Backspace and re-formats
- [x] T-006: `CurrencyInput` ignores non-digit, non-Backspace keys
- [x] T-007: `DatePickerField` shows the "Selecione" placeholder when `value` is `undefined`
- [x] T-008: `DatePickerField` calls `onChange` with the selected date and closes the popover
- [x] T-009: `useCreateTransaction` resolves with the created transaction and toggles `isLoading` on success
- [x] T-010: `useCreateTransaction` maps `extensions.validationErrors` straight to `fieldErrors` when present
- [x] T-011: `useCreateTransaction` sets `formError` to the fallback message on a network/unexpected error
- [x] T-012: `useCategoriesForSelect` resolves with `{ id, title }[]` from `listCategories`
- [x] T-013: `useCategoriesForSelect` sets the fallback error message on a network error
