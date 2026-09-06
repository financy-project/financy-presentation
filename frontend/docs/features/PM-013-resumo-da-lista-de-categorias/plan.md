# resumo da lista de categorias - PM-013 - Implementation Plan

## Definition of Ready (DoR) Blueprints

This plan must explicitly define the architectural layers per [docs/architecture/dor.md](../../architecture/dor.md). Each blueprint below should be fully specified, or marked `**Omitted:**` with justification.

### Component Blueprint

- **Component Name(s) and file path:**
  - `CategoriesSummary` — `src/modules/categories/components/categories-summary.tsx` (exported)
  - `SummaryCard` — same file, module-private (not exported), the shared card shell used by all 3 cards

- **Props type block:**

```ts
import type { ReactNode } from 'react'
import type { Category } from '@/modules/categories/graphql/queries'

export interface CategoriesSummaryProps {
  categories: Category[]
}

interface SummaryCardProps {
  icon: ReactNode
  iconClassName: string
  value: string | number
  label: string
}
```

- **Composition:** `CategoriesSummary` computes 3 derived values from `categories` (no new GraphQL call — see GraphQL/API Blueprint) and renders up to 3 `SummaryCard`s in a 3-column grid. `SummaryCard` reuses the existing `cn` helper (`@/lib/utils`) and the existing `ICON_OPTIONS`/`COLOR_OPTIONS` lookup tables (`icon-picker.tsx`/`color-picker.tsx`) for card 3's dynamic icon/color — the exact same lookup-with-fallback pattern `category-card.tsx` already uses (`ICON_OPTIONS.find(...)?.icon ?? TagIcon`, `COLOR_OPTIONS.find(...)?.name ?? 'blue'`). No new shadcn primitive needed — `SummaryCard`'s shell reuses `Card` from `@/components/ui/card` (same primitive `CategoryCard` uses), just with a different internal layout (row instead of column).

- **States to render:** No independent loading/error state — `CategoriesSummary` is a pure presentational component driven entirely by the `categories` array already loaded by `useListCategories()` in `categories-page.tsx`. Two content states:
  - **Populated:** always renders card 1 (total) and card 2 (sum), computed from `categories` (including when `categories` is empty → shows "0" / "0").
  - **No most-used category:** card 3 falls back to the most recently created category (`categories[categories.length - 1]`, since `listCategories` is server-ordered by `createdAt asc`) when every category has `transactionsQuantity === 0`, labeled "Categoria mais recente" instead of "Categoria mais utilizada" — per spec.md's acceptance criterion. Card 3 is omitted entirely only when `categories` is empty (nothing to fall back to).
  - **Correction (2026-09-04):** an earlier version of this plan chose to omit card 3 entirely in the no-most-used case; that missed a requirement the user had already given during planning. Corrected per spec.md.

#### Figma Fidelity

Source: [node 3104-2499](https://www.figma.com/design/ZF0QlJlYLMEUz6DH93SwbK/Financy--Community-?node-id=3104-2499), inspected via the Figma web app (MCP quota exhausted this cycle — browser inspection used instead, per `apollo_client_v4_gotchas`/`figma_fidelity_skill` memory).

| Element | Size (w×h) | Padding | Gap | Radius | Border | BG | Text | Font | Icon |
|---|---|---|---|---|---|---|---|---|---|
| Row container | 1184×106 (fill×hug) | 0 | 24 | – | – | *(see deviation below)* | – | – | – |
| Summary card (×3, identical) | 378.67×106 (fill×hug — i.e. 3 equal columns) | 24 | 16 (icon↔text, horizontal) | 12 | 1px solid Grayscale/gray-200 | Neutral/white | – | – | – |
| Icon wrapper | 32×32, no fill/radius (just centers the icon) | – | – | – | – | none | – | – | – |
| Icon, card 1 | 24×24 | – | – | – | – | – | Grayscale/gray-700 | – | `tag` |
| Icon, card 2 | 24×24 | – | – | – | – | – | Purple/purple-base | – | `arrow-up-down` |
| Icon, card 3 | 24×24 | – | – | – | – | – | *(sample: Blue/blue-base)* — bound to the category's own color at runtime | – | `utensils` (sample — actually `category.icon`) |
| Value/title text (vertical stack, gap 8 to label) | hug | – | – | – | – | – | Grayscale/gray-800 | Inter Bold 28/32, 0 letter-spacing | – |
| Label text | fill×hug | – | – | – | – | – | *(hex `#6B7280`, see deviation below)* | Inter Medium 12/16, 0.6px letter-spacing, uppercase | – |

**Token mapping (repo classes):**
- Card shell: `rounded-xl border border-gray-200 bg-card p-6` (shadcn `Card`'s own `rounded-xl`/`bg-card` already equal 12px/white; add `border border-gray-200`, override default `ring-1` with `ring-0`, override default `flex-col` with a row layout — identical override pattern to `category-card.tsx`'s `<Card className="... ring-0">`)
- Icon↔text gap: `gap-4` (16px)
- Icon wrapper: `flex size-8 items-center justify-center` (32px, no bg/radius — explicitly different from `CategoryCard`'s colored `size-10 rounded-[8px]` icon square, per spec.md's acceptance criterion)
- Icon: `size-6` (24px)
- Card 1 icon: `text-gray-700`, `Tag` from `lucide-react` (already imported as `TagIcon` in `category-card.tsx` — reuse the same import alias)
- Card 2 icon: `text-purple-base`, `ArrowUpDown` from `lucide-react` (new import)
- Card 3 icon: dynamic — looked up via `ICON_OPTIONS`/`COLOR_OPTIONS` exactly like `CategoryCard`; color applied as **text** color only (`text-{color}-base`, no background), unlike `CategoryCard`'s `bg-{color}-light text-{color}-base` square
- Value/title text: `text-[28px] leading-8 font-bold text-gray-800` (28/32 isn't on Tailwind's default scale — `text-2xl`=24/32, `text-3xl`=30/36 — so an arbitrary value is the correct mapping, not an approximation to the nearest scale step)
- Label text: `text-xs leading-4 font-medium tracking-wider text-gray-500 uppercase` (`text-xs`=12/16 exact match; `tracking-wider`=0.05em, which at 12px = 0.6px, exact match; source Figma text is lowercase with a visual uppercase transform, so JSX keeps normal-case Portuguese strings and `uppercase` does the transform, same as the Figma layer)
- Row/grid: `grid grid-cols-3 gap-6` (24px gap, 3 equal columns — matches the fill×hug row exactly since all 3 cards are equal width)

**Documented deviations:**
1. **Label text color** — Figma's fill for both label texts ("total de categorias", "categoria mais utilizada", and by inspection also card 2's label) is bound to a variable literally named `h` in the file's Grayscale group, which is *not* one of the defined tokens (`gray-800/700/600/400/300/200/100` — note **no `gray-500` exists as a named Figma variable** in this file). Its resolved hex is `#6B7280`, which is an exact match for this repo's own `--gray-500: #6b7280` (`src/index.css:96`, already exposed as `text-gray-500`). Treating this as a broken/mistyped variable reference in the Figma file rather than a real "no token" case, and mapping it to `text-gray-500` since the hex match is exact.
2. **Row container background** — the row's own frame has a `Grayscale/gray-100` fill, but this is not implemented: the identical wrapping frame around the category grid below it (already shipped in PM-011) has the same `gray-100` fill in Figma and was correctly *not* implemented (the grid has no background in `categories-page.tsx` today) — this is a default/incidental Figma layout-frame fill, not a deliberate design element, consistent with the precedent already set for this file.
3. **Card 3's specific icon/color in the inspected node** (`utensils`/blue-base, an "Alimentação" sample) is mock data baked into the Figma frame — the real implementation renders whichever category is actually most-used, via `category.icon`/`category.color`, not a hardcoded icon.

### GraphQL/API Blueprint

**Omitted:** No new query/mutation/hook. `CategoriesSummary` takes the already-fetched `categories: Category[]` array as a prop (the same array `categories-page.tsx` already gets from `useListCategories()`, PM-011) and derives all 3 values from it in-component. `transactionsQuantity` (per category) is already part of `LIST_CATEGORIES`'s selection set — no field addition needed. Per spec.md's "Decisão — total de transações", the total-transactions figure is the client-side sum of `transactionsQuantity` across `categories`, specifically because `listTransactions` has no `totalCount`/`categoryId` filter on the server (confirmed by reading `../server`'s schema during PM-011/PM-013 planning) — computing it from `listCategories` avoids a new server dependency entirely.

### Form & Validation Blueprint

**Omitted:** No form, no user input — the feature is a read-only summary row (see spec.md's "Out of Scope": no click/navigation, no filters).

### State Blueprint

**Omitted:** No state beyond component-local derivation. `totalCategories`, `totalTransactions`, and `mostUsedCategory` are plain `const`s computed with `Array.prototype.reduce`/`.length` on every render from the `categories` prop — no `useMemo` needed at the expected scale (a handful to a few dozen categories per user), no context, no new React Query/Apollo cache key.

---

## Architectural Decisions

Cover all applicable areas from `/grill-me`. Mark any area "Not Applicable" with justification rather than omitting it silently.

- **Scope & Requirements:** Matches spec.md's 3 acceptance criteria + the total-transactions client-side-sum decision already recorded there.
  - **Correction (2026-09-04):** an earlier version of this plan rendered the summary row even when `categories` is empty (showing "0"/"0"). Reverted: `categories-page.tsx` now gates `CategoriesSummary` on `!!categories.length` too, so the whole row is hidden alongside the grid's "Nenhuma categoria cadastrada ainda." empty-state message rather than showing "0 categorias, 0 transações".
- **Data & State:** Purely derived from `useListCategories()`'s existing result (PM-011) — no new fetch, no new cache entry, no staleness beyond what that hook's `refetchQueries` already guarantees after create/update/delete mutations (summary numbers update on the same refetch that updates the grid).
- **User Experience:** No independent loading skeleton for the summary — it mounts once the page's existing `isLoading`/`error` branches have already resolved, same as the grid below it. No interactivity (confirmed out-of-scope): no hover/click/navigation on any of the 3 cards.
- **Testing & Validation:** Vitest + RTL component tests. Because `CategoriesSummary` takes `categories` as a plain prop (no direct Apollo hook usage), tests need no `MockedProvider` — pass fixture arrays directly, per Test Cases below.
- **Implementation Details:** Card 3's icon/color lookup reuses the exact fallback pattern already established in `category-card.tsx` (`ICON_OPTIONS.find(...)?.icon ?? TagIcon`, `COLOR_OPTIONS.find(...)?.name ?? 'blue'`) so an unrecognized `category.icon`/`category.color` degrades the same way everywhere in the module, not a one-off.
- **Security Considerations:** Not Applicable — no new user input, no new data exposure; renders fields already fetched and displayed elsewhere on the same page.
- **Cross-Cutting Concerns:** Not Applicable — no i18n/logging/analytics infrastructure exists in this repo yet.
- **Error Scenarios & Failure Modes:** Delegated entirely to `useListCategories()`'s existing error handling, already surfaced by `categories-page.tsx`'s `role="alert"` banner. `CategoriesSummary` itself has no independent failure mode — worst case with malformed data is `NaN`/`0` from `reduce` on an empty array, which is a defined, harmless result (not a crash).
- **Performance & Scale** (if applicable): Not Applicable — `reduce`/`.length` over an in-memory array already sized for on-screen grid rendering (a handful to a few dozen categories); no memoization warranted.
- **Module Composition** (if applicable): New file lives in `src/modules/categories/components/`, alongside `category-card.tsx`/`icon-picker.tsx`/`color-picker.tsx` — no new module boundary, follows the existing categories-module layout.
- **Deployment & Operations:** Not Applicable — pure frontend rendering addition, no env vars, no feature flag, no backend dependency.
- **Backward Compatibility** (if applicable): Not Applicable — additive UI only; no prop/type/API signature changes to existing exports.

## Implementation Phases

Each bullet must be traceable to a Blueprint above and carry an exact file path, exact symbol/signature or prop list, and exact test cases inline — see [docs/architecture/dor.md](../../architecture/dor.md)'s granularity rule.

### Phase 1: Foundation

- [ ] `SummaryCard` module-private component (`src/modules/categories/components/categories-summary.tsx`): props `{ icon: ReactNode, iconClassName: string, value: string | number, label: string }`, renders the Figma-fidelity card shell (`rounded-xl border border-gray-200 bg-card p-6`, row layout `flex items-center gap-4`, icon wrapper `flex size-8 items-center justify-center` wrapping `icon` (rendered at `size-6` by the caller), text stack `flex flex-col gap-2` with value (`text-[28px] leading-8 font-bold text-gray-800`) and label (`text-xs leading-4 font-medium tracking-wider text-gray-500 uppercase`)
- [ ] `CategoriesSummary` component (same file): props `{ categories: Category[] }`; computes `totalCategories = categories.length`, `totalTransactions = categories.reduce((sum, c) => sum + c.transactionsQuantity, 0)`, `mostUsedCategory = categories.reduce<Category | null>((max, c) => (c.transactionsQuantity > 0 && (!max || c.transactionsQuantity > max.transactionsQuantity) ? c : max), null)`; renders `<div className="grid grid-cols-3 gap-6">` with `SummaryCard` for card 1 (`Tag` icon, `text-gray-700`, `totalCategories`, `"Total de categorias"`) and card 2 (`ArrowUpDown` icon, `text-purple-base`, `totalTransactions`, `"Total de transações"`) always, and card 3 (`ICON_OPTIONS.find((o) => o.name === mostUsedCategory.icon)?.icon ?? TagIcon`, `` text-${colorName}-base `` where `colorName = COLOR_OPTIONS.find((o) => o.value.toLowerCase() === mostUsedCategory.color.toLowerCase())?.name ?? 'blue'`, `mostUsedCategory.title`, `"Categoria mais utilizada"`) only `if (mostUsedCategory)`

### Phase 2: Features

- [ ] Wire into `src/modules/categories/pages/categories-page.tsx`: render `<CategoriesSummary categories={categories} />` immediately after the header/"Nova categoria" button row and before the `isLoading`/`error`/empty/populated conditional block, gated on `!isLoading && !error` (so it never renders alongside the loading text or the error banner)

## Test Cases

Sibling to Implementation Phases, same `### Phase N:` grouping. Every entry must trace to a hook's cache-strategy branch, a component state, or a Zod rule already written above.

### Phase 1: Foundation

- [ ] `CategoriesSummary` renders `categories.length` as card 1's value, labeled "Total de categorias"
- [ ] `CategoriesSummary` renders the sum of every category's `transactionsQuantity` as card 2's value, labeled "Total de transações"
- [ ] `CategoriesSummary` renders card 3 with the title and icon of the category with the highest `transactionsQuantity`, labeled "Categoria mais utilizada"
- [ ] `CategoriesSummary` omits card 3 entirely when `categories` is `[]`
- [ ] `CategoriesSummary` omits card 3 entirely when every category has `transactionsQuantity === 0`
- [ ] `CategoriesSummary` renders card 1's icon as `Tag` with `text-gray-700`, and card 2's icon as `ArrowUpDown` with `text-purple-base`
- [ ] `CategoriesSummary` tints card 3's icon with the most-used category's own color (e.g. a `color: "#2563EB"` category renders `text-blue-base`), falling back to `TagIcon`/`text-blue-base` when `icon`/`color` don't match any `ICON_OPTIONS`/`COLOR_OPTIONS` entry

### Phase 2: Features

- [ ] `CategoriesPage` renders `CategoriesSummary` above the category grid once `useListCategories()` resolves with data
- [ ] `CategoriesPage` does not render `CategoriesSummary` while `isLoading` is `true` or while `error` is present

## Dependencies

- No new npm packages — `ArrowUpDown`/`Tag` already ship in the installed `lucide-react` version (already used elsewhere in this module)
- Internal: `Category` type + `useListCategories` (`PM-011`), `ICON_OPTIONS`/`COLOR_OPTIONS` (`PM-011`/`PM-010`), `Card` UI primitive, `cn` util

## Risks & Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Tie in "most-used category" (two categories share the max `transactionsQuantity`) picks whichever the array's `reduce` happens to keep, which depends on server ordering | Low — spec.md explicitly marks tie behavior as out-of-scope/implementation's choice | `reduce`'s "first max wins" behavior documented inline as the deliberate, if arbitrary, resolution; no test asserts a specific winner in a tie |
| `text-[28px]`/arbitrary Tailwind values drift from the design system's normal type scale if a "display number" scale is added later | Low | Documented as a deliberate Figma-fidelity mapping (not on Tailwind's default scale) in the Figma Fidelity subsection above, so a future scale addition has a clear pointer to update |

## Success Criteria

- [ ] All acceptance criteria met
- [ ] Tests passing (`pnpm test`)
- [ ] `pnpm build` compiles without errors
