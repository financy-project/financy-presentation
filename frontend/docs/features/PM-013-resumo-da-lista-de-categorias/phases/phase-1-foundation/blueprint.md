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
  - **No most-used category:** card 3 is omitted entirely (not an empty-state placeholder) when every category has `transactionsQuantity === 0`, or `categories` is empty — per spec.md's acceptance criterion and the "Card 3 não é exibido... quando não há nenhuma categoria com transações" requirement. Decision: **omit**, not "show empty state" (the alternative the spec explicitly allowed) — simpler, and nothing in the Figma design shows an empty-state variant for this card.

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
