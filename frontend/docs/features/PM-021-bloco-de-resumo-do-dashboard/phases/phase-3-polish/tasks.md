# Phase 3: Polish - Tasks

- [x] F-010: Component tests for `SummaryCard` (`src/modules/dashboard/components/__tests__/summary-card.test.tsx`): renders `title` text; renders `formatCurrencyValue(value)` text; renders the correct icon+color per `mode` (`balance`/`income`/`expense`), via `data-testid` on the icon wrapper (mirroring `categories-summary.tsx`'s `iconTestId` pattern)
- [x] F-011: Component tests for `DashboardSummary` (`src/modules/dashboard/components/__tests__/dashboard-summary.test.tsx`): renders exactly 3 `SummaryCard`s; each card gets the right `mode`/`title`/`value` from a given `movement` object
- [x] F-012: Page tests for `DashboardPage` (`src/modules/dashboard/pages/__tests__/dashboard-page.test.tsx`, `MockedProvider`-wrapped): shows "Carregando resumo…" while loading; shows the `role="alert"` error message on a mocked GraphQL error; renders `DashboardSummary` once `movement` resolves
- [x] F-013: Accessibility pass: confirm error paragraph keeps `role="alert"`; confirm mode icons have no redundant `aria-label` (title text already labels each card) — verified in the tests above, no separate manual step needed
