# cadastro-de-categorias - PM-010 - Implementation Plan

## Definition of Ready (DoR) Blueprints

### Component Blueprint

**Component Name(s) and file paths:**

- `CategoriesPage` — `src/modules/categories/pages/categories-page.tsx` (**moves** the placeholder from `src/pages/categories-page.tsx`, created in PM-009, into the new `categories` module — real implementation, not a placeholder anymore)
- `NewCategoryDialog` — `src/modules/categories/components/new-category-dialog.tsx` (new)
- `CategoryForm` — `src/modules/categories/components/category-form.tsx` (new)
- `IconPicker` — `src/modules/categories/components/icon-picker.tsx` (new)
- `ColorPicker` — `src/modules/categories/components/color-picker.tsx` (new)
- `Dialog` (+ `DialogContent`/`DialogHeader`/`DialogTitle`/`DialogTrigger`) — `src/components/ui/dialog.tsx` (new shadcn primitive, doesn't exist yet)

**Props type block:**

```ts
function CategoriesPage(): JSX.Element // no props, owns the Dialog's open state

interface NewCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}
function NewCategoryDialog(props: NewCategoryDialogProps): JSX.Element

interface CategoryFormProps {
  onSuccess: () => void // called after a successful createCategory, so the parent Dialog can close
}
function CategoryForm(props: CategoryFormProps): JSX.Element

interface IconPickerProps {
  value: string // lucide-react export name, e.g. "BriefcaseBusiness"
  onChange: (value: string) => void
}
function IconPicker(props: IconPickerProps): JSX.Element

interface ColorPickerProps {
  value: string // hex, e.g. "#16A34A"
  onChange: (value: string) => void
}
function ColorPicker(props: ColorPickerProps): JSX.Element
```

**Composition:**

- Reused as-is: `Header` (app nav, PM-009), `Button` (`src/components/ui/button.tsx`), `IconButton` (`src/components/ui/icon-button.tsx`), `TextInput` (`src/components/ui/text-input.tsx`, reused for both "Título" and "Descrição" — neither needs `leftIcon`).
- **New primitive needed:** `Dialog` — nothing in `src/components/ui/` covers a modal. Add via the shadcn CLI: `pnpm dlx shadcn@latest add dialog -p radix-nova`. After generating, check `DialogContent`'s default padding/gap/close-button against the Figma Fidelity table below — override to match (`p-6 gap-6`; if the generated version ships its own top-right close `X`, replace it with the styled `IconButton` below via `showCloseButton={false}` — check the generated prop name — rather than stacking two close buttons).
- **New compositions (feature-specific, not shared DS primitives — icon/color pickers are specific to categories, not used anywhere else yet):** `IconPicker`, `ColorPicker`. Both are controlled single-select "swatch grid" components, structurally similar to each other but visually distinct (icon-in-box vs. color-chip-in-box) — kept as two small components rather than one over-parametrized one.
- `NewCategoryDialog` is a thin composition: `Dialog` (controlled `open`/`onOpenChange`) wrapping `DialogContent` (header: title/subtitle/close) + `CategoryForm`.
- `CategoryForm` owns the Zod schema, `useForm`, and the `useCreateCategory` hook call — same ownership split as `LoginForm`/`RegisterForm`.
- `CategoriesPage` owns the `open` boolean (`useState`) for the dialog and renders the page header (title/subtitle/"Nova categoria" trigger button) inline — not extracted into its own component, mirrors how `LoginPage`'s `CardHeader` isn't extracted either (single-use, page-specific).

**States to render:** `CategoryForm` — idle, submitting (`isLoading`, "Salvar"/"Salvando…"), field errors (per-field, under "Título"/"Descrição"), form error (`role="alert"` banner, mirrors `LoginForm`/`RegisterForm`), success (calls `onSuccess`, parent closes the dialog — no separate "success" visual state inside the form itself). `IconPicker`/`ColorPicker` — each option is either selected (`border-primary bg-gray-100`) or not (`border-gray-300`); no loading/error/empty states (static option lists).

**Figma Fidelity:**

Sources:
- Header: https://www.figma.com/design/ZF0QlJlYLMEUz6DH93SwbK/Financy--Community-?node-id=3104-2181 (node `3104:2181`, "Header")
- Modal: https://www.figma.com/design/ZF0QlJlYLMEUz6DH93SwbK/Financy--Community-?node-id=3107-4607 (node `3107:4607`, "Modal")

`get_variable_defs` on both nodes returned named tokens, all defined 1:1 in `src/index.css`: `Grayscale/gray-800 #111827`, `gray-700 #374151`, `gray-600 #4B5563`, `gray-500 #6B7280`, `gray-400 #9CA3AF`, `gray-300 #D1D5DB`, `gray-200 #E5E7EB`, `gray-100 #F8F9FA`, `Neutral/white #FFFFFF`, `Brand/brand-base #1F6F43`, and — new to this feature — the 7 category color swatches: `Green/green-base #16A34A`, `Blue/blue-base #2563EB`, `Purple/purple-base #9333EA`, `Pink/pink-base #DB2777`, `Red/red-base #DC2626`, `Orange/orange-base #EA580C`, `Yellow/yellow-base #CA8A04` — all exact matches to this repo's `bg-{color}-base` Tailwind utilities (verified against `src/index.css`).

Icon layer names map 1:1 to `lucide-react` exports (verified all 16 + `X` + `UserRoundPlus` exist as named exports): `briefcase-business`→`BriefcaseBusiness`, `car-front`→`CarFront`, `heart-pulse`→`HeartPulse`, `piggy-bank`→`PiggyBank`, `shopping-cart`→`ShoppingCart`, `ticket`→`Ticket`, `tool-case`→`ToolCase`, `utensils`→`Utensils`, `paw-print`→`PawPrint`, `house`→`House`, `gift`→`Gift`, `dumbbell`→`Dumbbell`, `book-open`→`BookOpen`, `baggage-claim`→`BaggageClaim`, `mailbox`→`Mailbox`, `receipt-text`→`ReceiptText`.

| Element | Size (w×h) | Padding | Gap | Radius | Border | BG | Text | Font (weight/size/line-height) | Icon |
|---|---|---|---|---|---|---|---|---|---|
| Page header "Categorias" title | full×auto | — | — | — | — | — | `text-gray-800` | bold/24px/32px → `text-2xl font-bold` | — |
| Page header subtitle | full×auto | — | — | — | — | — | `text-gray-600` | regular/16px/24px → `text-base font-normal` | — |
| "Nova categoria" button | auto×36px | `px-12 py-8` (Figma) | `gap-8` | 8px¹ | none | `bg-primary` | white | medium/14px/20px | `UserRoundPlus` 16×16 (default size, no override needed) |
| Modal container | 448×auto | `p-[25px]` (≈24px, rounding artifact) | `gap-6` (24px) | 12px¹ | 1px `border-gray-200` | `bg-white` | — | — | — |
| Modal title "Nova categoria" | full×auto | — | — | — | — | — | `text-gray-800` | semibold/16px/24px | — |
| Modal subtitle | full×auto | — | — | — | — | — | `text-gray-600` | regular/14px/20px | — |
| Close button | 32×32 | `p-2` | — | 8px¹ | 1px `border-gray-300` | `bg-white` | — | — | `X` 16×16 (default size) |
| "Título"/"Descrição" inputs | full×48px | same as `TextInput` (13px×15px absorbed by `h-12`) | 12px | 8px² | `border-gray-300` (`border-input`) | `bg-white` | placeholder `text-gray-400` | regular/16px | — (no `leftIcon`) |
| "Opcional" caption (under Descrição) | full×auto | — | — | — | — | — | `text-gray-500` | regular/12px/16px → `text-xs` | — |
| Icon/color field labels ("Título"/"Descrição"/"Ícone"/"Cor") | full×auto | — | — | — | — | — | `text-gray-700` | medium/14px/20px | — |
| Icon option box | 42×42 | — | — | 8px³ | `border-gray-300`, selected: `border-primary` | selected: `bg-gray-100` | — | — | 20×20 (`size-5`) |
| Icon grid | full×auto | — | `gap-2` (8px), `flex-wrap` | — | — | — | — | — | — |
| Color option box | flex-1×auto | `p-[5px]` | — | 8px³ | `border-gray-300`, selected: `border-primary` | selected: `bg-gray-100` | — | — | — |
| Color chip (inside box) | full×20px | — | — | 4px³ | none | `bg-{color}-base` | — | — | — |
| Color row | full×auto | — | `gap-2` (8px) | — | — | — | — | — | — |
| "Salvar" button | full×48px | `px-4 py-3` | `gap-2` | 8px¹ | none | `bg-primary` | white | medium/16px/24px | — → `Button size="xl"` (`h-12 gap-2 px-4 text-base`), default variant, `w-full` — **exact match, no override** |

¹ Repo's `rounded-lg` = `--radius` = 10px vs. Figma's 8px — same pre-existing, already-shipped/accepted drift documented in PM-007's plan (footnote ¹/²). Not fixed here for the reused `Button`/`IconButton`/`Dialog` primitives.

² `TextInput`'s input box already carries this exact drift too (PM-007 footnote ²) — reused unmodified.

³ `IconPicker`/`ColorPicker` are **new** components with no existing default to inherit — use explicit `rounded-[8px]` (option boxes) and `rounded-[4px]` (color chip) to match Figma exactly, same reasoning PM-007 used for the new `Checkbox` primitive.

**"Nova categoria" button sizing:** `lg` (`h-9 gap-1.5 px-2.5`) is the only existing size matching Figma's 36px height; its `gap`/`px` don't match exactly (6px/10px vs. Figma's 8px/12px) — override via `className="gap-2 px-3"` on top of `size="lg"`, same override pattern PM-007 used for "Recuperar senha".

**Icon/color option lists (exact order, per Figma):**

```ts
const ICON_OPTIONS = [
  'BriefcaseBusiness', 'CarFront', 'HeartPulse', 'PiggyBank', 'ShoppingCart', 'Ticket',
  'ToolCase', 'Utensils', 'PawPrint', 'House', 'Gift', 'Dumbbell', 'BookOpen',
  'BaggageClaim', 'Mailbox', 'ReceiptText',
] as const

const COLOR_OPTIONS = [
  { value: '#16A34A', className: 'bg-green-base' },
  { value: '#2563EB', className: 'bg-blue-base' },
  { value: '#9333EA', className: 'bg-purple-base' },
  { value: '#DB2777', className: 'bg-pink-base' },
  { value: '#DC2626', className: 'bg-red-base' },
  { value: '#EA580C', className: 'bg-orange-base' },
  { value: '#CA8A04', className: 'bg-yellow-base' },
] as const
```

### GraphQL/API Blueprint

**Mutation** (new file `src/modules/categories/graphql/mutations.ts` — server already implements this, `../server/src/modules/category/resolvers/category.resolver.ts`, confirmed field-for-field):

```ts
export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      title
      description
      icon
      color
    }
  }
`

export interface CreateCategoryInput {
  title: string
  description?: string | null
  icon: string
  color: string
}

export interface CreateCategoryData {
  createCategory: {
    id: string
    title: string
    description: string | null
    icon: string
    color: string
  }
}
```

**Hook:** `useCreateCategory(): { createCategory: (input: CreateCategoryInput) => Promise<CreateCategoryData['createCategory'] | null>, isLoading: boolean, fieldErrors: RegisterFieldError[], formError: string | null }` — `src/modules/categories/hooks/use-create-category.ts`, structural copy of `use-register-user.ts`/`use-login-user.ts`: wraps `useMutation<CreateCategoryData, { input: CreateCategoryInput }>(CREATE_CATEGORY)`; `CombinedGraphQLErrors` with `extensions.validationErrors` → `fieldErrors` (server validates `title` 1-100 chars, `description` ≤500 chars, `icon` 1-100 chars, `color` matches `^#[0-9A-Fa-f]{6}$` — all defensive here since the UI only ever sends values from fixed pickers or a length-bounded text field); without `validationErrors` or on network error → `formError`, fallback message `'Não foi possível criar a categoria. Tente novamente.'`. Reuses `RegisterFieldError` type from `@/modules/auth/hooks/use-register-user` (already a generic `{ path, message }` shape, not auth-specific despite the file location — imported as-is rather than duplicated).

**Cache strategy:** **Omitted.** No `listCategories` query is wired up anywhere in the client yet (no categories list UI exists — out of scope, see spec.md). Nothing to refetch or update. A future "list categories" feature will add the query and decide the `createCategory` cache/refetch strategy then.

**Loading/Error handling:** owned by `useCreateCategory` (returns `isLoading`/`fieldErrors`/`formError`); `CategoryForm` renders field errors inline under "Título"/"Descrição" and `formError` in a `role="alert"` banner, same as `LoginForm`/`RegisterForm`.

### Form & Validation Blueprint

```ts
const categoryFormSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  description: z.string().optional(),
  icon: z.string().min(1, 'Selecione um ícone'),
  color: z.string().min(1, 'Selecione uma cor'),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>
```

**Form component:** `CategoryForm` owns `useForm<CategoryFormValues>({ resolver: zodResolver(categoryFormSchema), defaultValues: { title: '', description: '', icon: ICON_OPTIONS[0], color: COLOR_OPTIONS[0].value } })` — per user decision (2026-09-03), the first icon (`BriefcaseBusiness`) and first color (`#16A34A`, green) come pre-selected, matching the Figma mock. `icon`/`color` are wired via `Controller` (both `IconPicker`/`ColorPicker` are controlled `value`/`onChange` components, not native inputs — same reason `rememberMe`/`Checkbox` needed `Controller` in PM-007). On submit: calls `useCreateCategory().createCategory({ title, description: description || undefined, icon, color })`; on success, `toast.success('Categoria criada com sucesso!')` and calls the `onSuccess` prop (parent `NewCategoryDialog`/`CategoriesPage` closes the dialog — no local "success" UI state, no manual `reset()` needed since the `Dialog`'s content unmounts on close, so the next open gets fresh `defaultValues`).

### State Blueprint

**What state, and why:** only the dialog's open/closed state, which is genuinely more than `CategoryForm`-local (the trigger button lives in `CategoriesPage`'s header, the close action lives inside `NewCategoryDialog`/`CategoryForm` on success) — `useState<boolean>` in `CategoriesPage`, passed down as controlled `open`/`onOpenChange` to `NewCategoryDialog`/`Dialog`. Nothing else needs state beyond `CategoryForm`'s own `useForm` (title/description/icon/color are all form-local).

**Where it lives:** `CategoriesPage`'s own `useState` — no context, no new Zustand store, no URL param. Scoped to this one page; not shared across routes.

**Shape:**

```ts
const [open, setOpen] = useState(false) // CategoriesPage
```

## Architectural Decisions

- **Scope & Requirements:** this ticket covers the `/categorias` page header + "create category" modal only — confirmed with the user (2026-09-03):
  - Icon value stored/sent to the server is the `lucide-react` PascalCase export name (e.g. `"BriefcaseBusiness"`), not the Figma layer's kebab-case name — a future category-list feature can render it via a direct `{ [name]: LucideIcon }` lookup, no conversion needed.
  - The form's icon/color fields come **pre-selected** (first option each — `BriefcaseBusiness` / green `#16A34A`), matching the Figma mock exactly, rather than starting empty/unselected.
  - Listing categories on `/categorias` remains a "em breve" placeholder below the header (unchanged from PM-009) — this ticket does not query `listCategories` or render any list/table.
- **Data & State:** no new global state — the dialog's open/closed boolean is page-local (`CategoriesPage`). No Apollo cache/`typePolicies` changes (see GraphQL/API Blueprint — no query exists yet to update).
- **User Experience:** happy path — click "Nova categoria", modal opens pre-filled with the first icon/color, fill "Título" (required), optionally "Descrição", optionally change icon/color, click "Salvar", toast success, modal closes. Loading — "Salvar" shows "Salvando…" and is disabled (mirrors `LoginForm`'s "Entrando…" pattern). Error — "Título" field error inline (client Zod, mirrors server's message wording); `formError` in a `role="alert"` banner, modal stays open with all fields (including icon/color selection) intact so the user can retry without re-entering everything. Accessibility: `IconPicker`/`ColorPicker` options are `<button type="button">` with `aria-pressed` (selected state) and `aria-label` (icon's PascalCase name / color's Tailwind name) — keyboard-operable and screen-reader-announced, unlike a purely visual `div`-based swatch grid.
- **Testing & Validation:** Vitest + RTL, same split as PM-006/PM-007: a hook test (`use-create-category.test.ts`, `MockedProvider`-based, mirrors `use-register-user.test.ts`), and component tests for `CategoryForm` (mocks `useCreateCategory`), `IconPicker`, `ColorPicker` (both trivial controlled-selection tests), and `CategoriesPage` (mounts `Header` + opens/closes the dialog via the trigger button — `MemoryRouter` needed since `Header` uses `NavLink`). No e2e runner exists — same caveat as prior features, manual verification once the real GraphQL API is wired in.
- **Implementation Details:** new dependency: none (`Dialog` ships inside the already-installed `radix-ui` package, only a new shadcn-generated file). New module: `src/modules/categories/` (`graphql/`, `hooks/`, `components/`, `pages/`), first feature-owned content in it (PM-009 only left a flat placeholder page). `src/pages/categories-page.tsx` is deleted; `src/App.tsx`'s `/categorias` route import path updates to `@/modules/categories/pages/categories-page`.
- **Security Considerations:** `title`/`description` are rendered as plain text (React's default escaping) — no risk of injection. `icon` is validated client-side against the fixed `ICON_OPTIONS` list (via the picker UI, not a free-text field) before being sent, so it can't carry arbitrary strings from user input even though the server's own validation is permissive (`@Length(1,100)`, no enum). Same reasoning for `color` against the fixed `COLOR_OPTIONS` list (though the server does additionally enforce the `^#[0-9A-Fa-f]{6}$` hex format).
- **Cross-Cutting Concerns:** toast on success only (mirrors register/login's pattern). No logging/analytics added.
- **Error Scenarios & Failure Modes:** empty "Título" → client Zod error, no mutation call. Server validation error (defensive, e.g. a >100-char title somehow submitted) → `fieldErrors`, same rendering as register/login. Network/unexpected error → fallback `formError`. Double-submit prevented by disabling "Salvar" while `isLoading`. Closing the dialog mid-submit (e.g. pressing Escape) is a no-op on the in-flight promise — same accepted behavior as `LoginForm` today (unmounting doesn't cancel the mutation, but nothing reads its result after unmount either).
- **Performance & Scale:** not applicable — a static 16-icon/7-color picker, no lists/pagination/virtualization needed.
- **Module Composition:** `CategoriesPage` composes the app-level `Header` (PM-009, cross-module reuse, same pattern as `DashboardPage`/`TransactionsPage`) with the new `categories`-module content. `NewCategoryDialog`/`CategoryForm`/`IconPicker`/`ColorPicker` are all `categories`-module-internal — nothing outside this module imports them.
- **Deployment & Operations:** no new `VITE_*` env var, no feature flag. Depends on the real GraphQL API being wired in (`VITE_GRAPHQL_URI` still points at the placeholder public API — same accepted state as every auth-module ticket so far).
- **Backward Compatibility:** deletes `src/pages/categories-page.tsx` and updates its one import site (`src/App.tsx`) — no other file references it (confirmed via grep). `Header`/`Button`/`IconButton`/`TextInput` are reused unmodified, no prop/behavior changes affecting existing callers (`LoginPage`/`RegisterPage`/`DashboardPage`/`TransactionsPage`).

## Implementation Phases

### Phase 1: Foundation

- [ ] Add the shadcn `Dialog` primitive: `pnpm dlx shadcn@latest add dialog -p radix-nova` (`src/components/ui/dialog.tsx`); check generated `DialogContent` padding/gap/close-button against the Figma Fidelity table and override to `p-6 gap-6` if it differs, and reconcile its default close button with the custom `IconButton`-styled one (disable the generated default via its close-button prop if present, or restyle it — do not stack two close controls)
- [ ] Add `CREATE_CATEGORY`, `CreateCategoryInput`, `CreateCategoryData` to `src/modules/categories/graphql/mutations.ts` (exact `gql` document + types above)
- [ ] Implement `useCreateCategory()` (`src/modules/categories/hooks/use-create-category.ts`): wraps `useMutation<CreateCategoryData, { input: CreateCategoryInput }>(CREATE_CATEGORY)`; returns `{ createCategory, isLoading, fieldErrors, formError }`; error-branching logic exactly as `use-register-user.ts`, fallback message `'Não foi possível criar a categoria. Tente novamente.'`, reuses `RegisterFieldError` from `@/modules/auth/hooks/use-register-user`
- [ ] Implement `IconPicker` (`src/modules/categories/components/icon-picker.tsx`): controlled `value`/`onChange`, renders the 16 `ICON_OPTIONS` (exact order above) as `<button type="button">` in a `flex flex-wrap gap-2` grid, each `size-[42px] rounded-[8px] border` (`border-gray-300` default, `border-primary bg-gray-100` when selected), icon rendered at `size-5`, `aria-pressed`/`aria-label` per option
- [ ] Implement `ColorPicker` (`src/modules/categories/components/color-picker.tsx`): controlled `value`/`onChange`, renders the 7 `COLOR_OPTIONS` (exact order above) as `<button type="button">` in a `flex gap-2` row, each `flex-1 rounded-[8px] border p-[5px]` (`border-gray-300` default, `border-primary bg-gray-100` when selected) containing a `h-5 rounded-[4px]` chip in the option's `bg-{color}-base` class, `aria-pressed`/`aria-label` per option

### Phase 2: Features

- [ ] Implement `CategoryForm` (`src/modules/categories/components/category-form.tsx`): `useForm<CategoryFormValues>` with `categoryFormSchema` (exact schema above) and `zodResolver`, `defaultValues` pre-selecting `ICON_OPTIONS[0]`/`COLOR_OPTIONS[0].value`; renders `TextInput` (Título, no icon), `TextInput` (Descrição, no icon, "Opcional" caption below), `Controller`-wired `IconPicker`, `Controller`-wired `ColorPicker`, submit `Button` (`size="xl"`, `w-full`, label `"Salvar"`/`"Salvando…"` while `isLoading`); on submit calls `useCreateCategory().createCategory(...)`, and on success `toast.success('Categoria criada com sucesso!')` + calls the `onSuccess` prop
- [ ] Implement `NewCategoryDialog` (`src/modules/categories/components/new-category-dialog.tsx`): controlled `Dialog` (`open`/`onOpenChange` props), `DialogContent` with header (title "Nova categoria" `text-gray-800 font-semibold text-base`, subtitle "Organize suas transações com categorias" `text-gray-600 text-sm`, close `IconButton` `variant="outline" size="icon" className="border-gray-300"` wired to close the dialog) and `CategoryForm` (`onSuccess={() => onOpenChange(false)}`)
- [ ] Move `CategoriesPage` from `src/pages/categories-page.tsx` to `src/modules/categories/pages/categories-page.tsx`: keeps rendering `Header`, replaces the "Categorias em breve" placeholder with the real page header (title "Categorias" `text-2xl font-bold text-gray-800`, subtitle "Organize suas transações por categorias" `text-base text-gray-600`, trigger `Button size="lg" className="gap-2 px-3"` containing `<UserRoundPlus className="size-4" />` + "Nova categoria" that opens the dialog) plus `NewCategoryDialog` (controlled by the page's own `useState<boolean>`); keeps a placeholder note below for the (out-of-scope) category list
- [ ] Delete `src/pages/categories-page.tsx`; update `src/App.tsx`'s `/categorias` route to import `CategoriesPage` from `@/modules/categories/pages/categories-page`
- [ ] Unit tests for `useCreateCategory` (`src/modules/categories/hooks/__tests__/use-create-category.test.ts`, `MockedProvider`): resolves `{ id, title, description, icon, color }` and toggles `isLoading`; maps `extensions.validationErrors` to `fieldErrors`; sets fallback `formError` on a non-validation/network error
- [ ] Component tests for `IconPicker`/`ColorPicker` (`src/modules/categories/components/__tests__/icon-picker.test.tsx`, `color-picker.test.tsx`): renders all options; clicking an option calls `onChange` with its value; the option matching the current `value` prop has `aria-pressed="true"`, others `"false"`
- [ ] Component tests for `CategoryForm` (`src/modules/categories/components/__tests__/category-form.test.tsx`, mocks `useCreateCategory`): shows "O título é obrigatório" for an empty title on submit; disables submit and shows "Salvando…" while `isLoading`; renders a mocked `fieldErrors` entry under "Título"; renders the mocked `formError` in the `role="alert"` banner verbatim; calls `createCategory` with the pre-selected icon/color when submitted without changing them; calls `createCategory` with a newly selected icon/color when the user picks different ones; calls `onSuccess` after a successful submit
- [ ] Component tests for `CategoriesPage` (`src/modules/categories/pages/__tests__/categories-page.test.tsx`, `MemoryRouter`): renders the page header (title/subtitle/button) and `Header`'s nav; clicking "Nova categoria" opens the dialog (modal title visible); a successful `CategoryForm` submit (mocked `useCreateCategory`) closes the dialog

## Test Cases

### Phase 1: Foundation

- [ ] `useCreateCategory` resolves with `{ id, title, description, icon, color }` and `isLoading` toggles `true` → `false` around the mutation call
- [ ] `useCreateCategory` maps `extensions.validationErrors` straight to `fieldErrors` when present
- [ ] `useCreateCategory` sets `formError` to the fallback message on a network/unexpected error
- [ ] `IconPicker` renders all 16 icon options
- [ ] `IconPicker` calls `onChange` with an option's name when clicked
- [ ] `IconPicker` marks the option matching `value` with `aria-pressed="true"` and the rest `"false"`
- [ ] `ColorPicker` renders all 7 color options
- [ ] `ColorPicker` calls `onChange` with an option's hex value when clicked
- [ ] `ColorPicker` marks the option matching `value` with `aria-pressed="true"` and the rest `"false"`

### Phase 2: Features

- [ ] `CategoryForm` shows "O título é obrigatório" for an empty title on submit
- [ ] `CategoryForm` disables submit and shows "Salvando…" while `isLoading`
- [ ] `CategoryForm` renders a mocked `fieldErrors` entry under "Título"
- [ ] `CategoryForm` renders the mocked `formError` in the `role="alert"` banner verbatim
- [ ] `CategoryForm` calls `createCategory` with the pre-selected icon (`BriefcaseBusiness`) and color (`#16A34A`) when submitted without changing them
- [ ] `CategoryForm` calls `createCategory` with a newly selected icon/color after the user picks different ones
- [ ] `CategoryForm` calls `onSuccess` after a successful submit
- [ ] `CategoriesPage` renders the page header (title, subtitle, "Nova categoria" button) and the app `Header`'s nav
- [ ] `CategoriesPage` opens the dialog (modal title "Nova categoria" visible) when "Nova categoria" is clicked
- [ ] `CategoriesPage` closes the dialog after a successful category creation

## Dependencies

- No new npm packages — `Dialog` comes from the already-installed `radix-ui` package via the shadcn CLI.
- Depends on the server's `createCategory` mutation (`../server/src/modules/category/resolvers/category.resolver.ts`) — already implemented, schema confirmed (`CreateCategoryInput { title, description?, icon, color }` → `CategoryType { id, title, description, icon, color }`).
- Internal: reuses `Header` (PM-009), `Button`, `IconButton`, `TextInput` (PM-005/PM-006/PM-007); reuses `RegisterFieldError` type from the auth module; follows the `LoginForm`/`RegisterForm`+`use-login-user`/`use-register-user` structural pattern.

## Risks & Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| `VITE_GRAPHQL_URI` still points at the placeholder public API, so `createCategory` can't be manually end-to-end tested against the real server yet | Medium | Same accepted state as every prior auth-module ticket — build against the real schema (confirmed by reading the server source directly), verify via unit/component tests + `MockedProvider` |
| No `listCategories` UI exists — a user who creates a category via this modal has no visual confirmation it persisted beyond the success toast | Low | Explicitly scoped out in `spec.md`/Architectural Decisions; a near-future feature building the categories list is the natural, expected follow-up (tracked separately) |
| `IconPicker`'s 16 options and `ColorPicker`'s 7 options are hardcoded arrays, not server-driven — if the server ever changes what icons/colors are valid, the client list goes stale silently (server only validates `icon` as 1-100 chars, `color` as hex format, not against an enum) | Low | Accepted for this ticket — matches the server's own permissive validation; revisit if/when the server introduces a `category-icon`/`category-color` enum or lookup endpoint |

## Success Criteria

- [ ] All acceptance criteria in `spec.md` met
- [ ] Tests passing (`pnpm test`)
- [ ] `pnpm build` compiles without errors
