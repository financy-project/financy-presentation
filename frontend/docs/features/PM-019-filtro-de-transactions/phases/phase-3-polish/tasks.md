# Phase 3: Polish - Tasks

- [x] F-011: Verify combined-filter behavior end-to-end (manual, per Deployment & Operations): search + type + category + period applied together produce the intersection, not a union.
- [x] F-012: Confirm `TransactionsTable`'s existing empty state reads correctly when a filter combination matches zero transactions (no new empty-state copy needed — reuse what's there).
- [x] F-013: Accessibility pass: `PeriodSelect`'s trigger button keyboard-operable (open via `Enter`/`Space`, per native `<button>` semantics — no custom key handling needed since it's a real `<button>`); confirm `aria-selected` on the current `PeriodSelect` option and that `SelectField`-based fields keep their existing keyboard support (unchanged, Radix `Select`).
- [x] F-014: Visual pass matching `.workspace/image copy 7.png`: `TransactionFilters`'s `Card` padding/gap and the 4-column grid line up with the reference screenshot (no Figma tokens available — eyeball against the image, reusing existing `Card`/spacing tokens already used elsewhere on this page).
