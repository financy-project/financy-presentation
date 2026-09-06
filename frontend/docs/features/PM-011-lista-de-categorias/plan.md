# lista de categorias - PM-011 - Implementation Plan

## Definition of Ready (DoR) Blueprints

### Component Blueprint

**Component Name(s) and file paths:**

- `CategoryCard` — `src/modules/categories/components/category-card.tsx` (new)
- `EditCategoryDialog` — `src/modules/categories/components/edit-category-dialog.tsx` (new)
- `DeleteCategoryAlert` — `src/modules/categories/components/delete-category-alert.tsx` (new)
- `CategoryForm` — `src/modules/categories/components/category-form.tsx` (**refactored**, breaking prop change — see Architectural Decisions)
- `NewCategoryDialog` — `src/modules/categories/components/new-category-dialog.tsx` (**refactored** to match `CategoryForm`'s new contract, PM-010)
- `CategoriesPage` — `src/modules/categories/pages/categories-page.tsx` (**modified** — replaces the "Lista de categorias em breve" placeholder with the real grid)
- `AlertDialog` (+ `AlertDialogContent`/`AlertDialogHeader`/`AlertDialogTitle`/`AlertDialogDescription`/`AlertDialogFooter`/`AlertDialogAction`/`AlertDialogCancel`) — `src/components/ui/alert-dialog.tsx` (new shadcn primitive; add via `pnpm dlx shadcn@latest add alert-dialog` — no `-p` flag, see memory note from PM-010)

**Props type block:**

```ts
function CategoriesPage(): JSX.Element // no props

interface CategoryCardProps {
  category: Category // { id, title, description, icon, color, transactionQuantity }
}
function CategoryCard(props: CategoryCardProps): JSX.Element

interface EditCategoryDialogProps {
  category: Category
  open: boolean
  onOpenChange: (open: boolean) => void
}
function EditCategoryDialog(props: EditCategoryDialogProps): JSX.Element

interface DeleteCategoryAlertProps {
  category: Category
  open: boolean
  onOpenChange: (open: boolean) => void
}
function DeleteCategoryAlert(props: DeleteCategoryAlertProps): JSX.Element

// CategoryForm no longer owns a mutation hook itself (was create-only in
// PM-010) — the parent dialog (New/Edit) now owns the hook and passes its
// state down, so both dialogs render the exact same form (per user
// decision, 2026-09-03: "um novo modal, mas com o mesmo render").
interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormValues> // omitted (create): ICON_OPTIONS[0]/COLOR_OPTIONS[0].value defaults, per PM-010
  isLoading: boolean
  fieldErrors: RegisterFieldError[]
  formError: string | null
  onSubmit: (values: CategoryFormValues) => void | Promise<void>
}
function CategoryForm(props: CategoryFormProps): JSX.Element

interface NewCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}
function NewCategoryDialog(props: NewCategoryDialogProps): JSX.Element // unchanged signature, internals updated
```

**Composition:**

- `CategoryCard` reuses `Card` (`border border-gray-200 ring-0`, matches the auth-screen override pattern from PM-006/007) and `IconButton` (edit: `variant="ghost"`; delete: `variant="ghost"`, opens `DeleteCategoryAlert`). Icon square and colored badge are **not** existing DS primitives — category `color` is an arbitrary per-row hex string from the database, not one of the 7 fixed swatches as a Tailwind class, so both use inline `style` (`backgroundColor`, `color`) rather than a static utility class — a genuinely new pattern in this repo (documented in Figma Fidelity below).
- `CategoryCard` looks up the icon component via `ICON_OPTIONS` (exported from `icon-picker.tsx`, PM-010) — `ICON_OPTIONS.find((o) => o.name === category.icon)?.icon` — reusing the existing 16-icon table instead of importing all of `lucide-react` dynamically. Falls back to a generic icon (`Tag` from lucide-react) if `category.icon` doesn't match any known option (defensive — the server doesn't enforce an enum, see PM-010's Risks).
- `EditCategoryDialog` and `NewCategoryDialog` are separate components (both render `Dialog`/`DialogContent` + `CategoryForm`) rather than one dialog with a mode prop — per user decision, keeps each dialog's title/copy/mutation wiring independently simple, at the cost of some duplicated dialog chrome (header markup) between the two. `EditCategoryDialog` seeds `CategoryForm`'s `defaultValues` from its `category` prop and wires `onSubmit` to `useUpdateCategory`.
- `DeleteCategoryAlert` is a new `AlertDialog`-based component (shadcn primitive added this phase) — title "Excluir categoria?", description naming the category, `AlertDialogAction` (destructive) wired to `useDeleteCategory`, `AlertDialogCancel`.
- `CategoriesPage` renders a responsive grid (`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4`, matching the Figma screenshot's 4-column layout at the page's existing `max-w-[1280px]` width) of `CategoryCard`s from `useListCategories()`, with loading (simple "Carregando categorias…" text, no skeleton — matches this repo's current no-skeleton convention, see Risks), error (reuses the `role="alert"` banner pattern), and empty ("Nenhuma categoria cadastrada ainda." — no Figma reference for this state, placeholder copy) states.

**States to render:** `CategoriesPage`/grid — loading, error, empty, populated (all four, per DoR). `CategoryCard` — populated only (no loading/error of its own; parent owns the query). `CategoryForm` — idle, submitting, field errors, form error (unchanged from PM-010, now shared by both dialogs). `DeleteCategoryAlert` — idle, deleting (`AlertDialogAction` disabled + "Excluindo…" while `useDeleteCategory().isLoading`).

**Figma Fidelity:**

Source: https://www.figma.com/design/ZF0QlJlYLMEUz6DH93SwbK/Financy--Community-?node-id=3104-2627 ("category cards grid", node `3104:2627`).

**Figma MCP quota exhausted this session** (Starter plan: 20 tool calls/month, hard monthly cap — confirmed via the server's own `rate-limits-access.md`, not a transient rate limit that resets soon). Only a screenshot (`get_screenshot`) was available before hitting the cap — `get_design_context`/`get_variable_defs` (exact px/hex per element) could not be pulled for this node. The table below is a **best-effort estimate from the screenshot**, cross-referenced against tokens/spacing this repo already uses for near-identical elements (the 7 badge/icon colors visually match the exact `green/blue/purple/pink/red/orange/yellow-base` swatches already wired in `ColorPicker`, PM-010 — high confidence on those). **This is a deviation from the mandatory `/figma-fidelity` process** — flag explicitly per its own rules rather than silently proceeding as if verified. Re-run `/figma-fidelity` on this node once the Figma MCP quota resets (next calendar month) and reconcile any drift before/soon after this ships.

| Element | Best-effort estimate | Confidence |
|---|---|---|
| Grid | 4 columns, `gap-4` (16px), same `max-w-[1280px]` container as the rest of `/categorias` | Medium — column count read directly off the screenshot at this container width; gap estimated |
| Card | `Card` reused, `border-gray-200`, `rounded-xl`, white bg, `p-4`-ish internal spacing | Medium — matches the existing auth-screen `Card` override closely in the screenshot |
| Icon square | ~40×40px, `rounded-lg`, bg = `category.color` at low opacity, icon = `category.color` at full opacity | Medium-low — exact size/opacity not pixel-measured |
| Title | `text-gray-800`, semibold, ~16px | Medium |
| Description | `text-gray-600`, ~14px, up to 2 lines | Medium |
| Name badge | pill shape, bg = `category.color` at low opacity, text = `category.color`, small/medium text | Medium — same color family confirmed against `ColorPicker`'s 7 swatches |
| "N itens" | `text-gray-500`, small, right-aligned within the card's bottom row | Medium |
| Edit/Delete icon buttons | small ghost/outline icon buttons, top-right of the card | Medium — exact variant/size not confirmed, using `IconButton` `size="icon-sm"` as a reasonable default |

### GraphQL/API Blueprint

**Query** (new file `src/modules/categories/graphql/queries.ts`):

```ts
export const LIST_CATEGORIES = gql`
  query ListCategories {
    listCategories {
      id
      title
      description
      icon
      color
      transactionQuantity
    }
  }
`

export interface Category {
  id: string
  title: string
  description: string | null
  icon: string
  color: string
  transactionQuantity: number
}

export interface ListCategoriesData {
  listCategories: Category[]
}
```

**`transactionQuantity` is an external server dependency, not yet implemented** — per user decision (2026-09-03, see `spec.md`), it's being added to `CategoryType` in `../server` (separate repository) as this ticket is implemented. This query assumes it exists by the time this feature is manually verified end-to-end; until then, `pnpm test`'s `MockedProvider`-based tests (which don't hit a real server) are unaffected, but the app will only actually render item counts once the server ships the field.

**Mutations** (added to the existing `src/modules/categories/graphql/mutations.ts`, alongside `CREATE_CATEGORY`):

```ts
export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      title
      description
      icon
      color
      transactionQuantity
    }
  }
`

export interface UpdateCategoryInput {
  title?: string
  description?: string | null
  icon?: string
  color?: string
}

export interface UpdateCategoryData {
  updateCategory: Category
}

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`

export interface DeleteCategoryData {
  deleteCategory: boolean
}
```

Confirmed field-for-field against `../server/src/modules/category/{resolvers/category.resolver.ts,graphql/input-types/update-category.input.ts}` — `updateCategory`/`deleteCategory` already exist and are unchanged by this ticket (only `transactionQuantity` on `CategoryType`/`listCategories` is new, pending server-side).

**Hooks:**

- `useListCategories(): { categories: Category[], isLoading: boolean, error: string | null }` — `src/modules/categories/hooks/use-list-categories.ts`. Wraps `useQuery<ListCategoriesData>(LIST_CATEGORIES)` (from `@apollo/client/react`). `categories` defaults to `[]` while loading/on error (never `undefined`, so `CategoriesPage` doesn't need a null-check before mapping). `error` is a generic fallback message (`'Não foi possível carregar as categorias.'`) when `useQuery`'s `error` is set — no field-level errors possible for a query with no input.
- `useUpdateCategory(): { updateCategory: (id: string, input: UpdateCategoryInput) => Promise<Category | null>, isLoading: boolean, fieldErrors: RegisterFieldError[], formError: string | null }` — `src/modules/categories/hooks/use-update-category.ts`, structural copy of `use-create-category.ts`, fallback message `'Não foi possível atualizar a categoria. Tente novamente.'`.
- `useDeleteCategory(): { deleteCategory: (id: string) => Promise<boolean>, isLoading: boolean, error: string | null }` — `src/modules/categories/hooks/use-delete-category.ts`. Simpler than the others (no form/field errors — nothing to validate, the mutation only takes an `id`): wraps `useMutation<DeleteCategoryData, { id: string }>(DELETE_CATEGORY)`, returns `false` and sets a fallback `error` message (`'Não foi possível excluir a categoria. Tente novamente.'`) on any thrown error.

**Cache strategy:** all three mutation hooks (`useCreateCategory` — **modified**, `useUpdateCategory`, `useDeleteCategory`) pass `refetchQueries: [{ query: LIST_CATEGORIES }]` to their `useMutation` call — simplest correct option given `listCategories` takes no arguments (a single query variant to refetch, no cache-key permutations to worry about) and the server's own plan already documents category counts as low-volume ("realistically dozens, not thousands" — PM-003 `plan.md`), so a refetch's cost is negligible. Rejected manual cache surgery (`cache.modify`/`evict`) as unnecessary complexity for this volume.

**Loading/Error handling:** `useListCategories` owns the grid's loading/error state (`CategoriesPage` renders accordingly). Mutation hooks follow the established `fieldErrors`/`formError` pattern (`useDeleteCategory` uses a single flat `error` instead, since it has no fields to map errors onto).

### Form & Validation Blueprint

```ts
// Unchanged from PM-010 — same schema, now shared by both New/EditCategoryDialog
const categoryFormSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  description: z.string().optional(),
  icon: z.string().min(1, 'Selecione um ícone'),
  color: z.string().min(1, 'Selecione uma cor'),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>
```

**Form component:** `CategoryForm` (refactored) still owns `useForm<CategoryFormValues>({ resolver: zodResolver(categoryFormSchema), defaultValues: { title: '', description: '', icon: ICON_OPTIONS[0].name, color: COLOR_OPTIONS[0].value, ...defaultValues } })` — merges the caller's `defaultValues` prop over the create-mode fallback, so `EditCategoryDialog` passing `{ title: category.title, description: category.description ?? '', icon: category.icon, color: category.color }` pre-fills correctly, while `NewCategoryDialog` passing nothing keeps PM-010's original pre-selected-first-option behavior. On valid submit, calls the `onSubmit` prop with the form values (no longer calls a mutation hook itself) — `NewCategoryDialog`/`EditCategoryDialog` each own calling their respective hook, toasting, and closing on success.

### State Blueprint

**What state, and why:** `CategoriesPage` now also owns which category is being edited/deleted (beyond PM-010's create-dialog `open` boolean) — the edit/delete dialogs need to know *which* category, not just whether they're open. Component-local `useState` is enough (no cross-page/cross-route sharing needed, same reasoning as PM-010's `open` state).

**Where it lives:** `CategoriesPage`'s own `useState`.

**Shape:**

```ts
const [newDialogOpen, setNewDialogOpen] = useState(false)
const [editingCategory, setEditingCategory] = useState<Category | null>(null) // non-null = EditCategoryDialog open, for this category
const [deletingCategory, setDeletingCategory] = useState<Category | null>(null) // non-null = DeleteCategoryAlert open, for this category
```

`CategoryCard`'s edit/delete `IconButton`s call `onEdit(category)`/`onDelete(category)` props (passed down from `CategoriesPage`, which set the corresponding state) rather than each card owning its own dialog instance — avoids mounting N dialogs for N cards.

## Architectural Decisions

- **Scope & Requirements:** confirmed with the user (2026-09-03):
  - Editing opens a **separate** dialog component (`EditCategoryDialog`, not a mode-toggled `NewCategoryDialog`) that renders the same `CategoryForm`.
  - Deleting requires a confirmation `AlertDialog` before calling `deleteCategory` (not immediate on click).
  - The "N itens" count depends on a `transactionQuantity` field the user is adding to the server's `CategoryType` separately (external dependency, tracked in `spec.md`).
  - **Figma fidelity is incomplete** — MCP quota exhausted (Starter plan, 20 calls/month, hard cap) after only a screenshot pull. Proceeding with a best-effort, explicitly-flagged estimate (see Figma Fidelity table) rather than blocking the whole feature on a monthly quota reset.
- **Data & State:** `CategoriesPage` gains two more pieces of local state (which category is being edited/deleted) beyond PM-010's single `open` boolean — still page-local, no new global store.
- **User Experience:** happy path — grid loads, cards show icon/title/description/badge/count, edit pre-fills the same form UI as create, delete asks for confirmation first. Loading — plain text, no skeleton (matches this repo's current state — no skeleton primitive exists yet; introducing one is out of scope for this ticket). Error — `listCategories` failure shows a `role="alert"` banner in place of the grid; mutation failures reuse each dialog's existing field/form-error rendering. Empty — a plain message, no illustration (Figma didn't provide this state).
- **Testing & Validation:** Vitest + RTL. `useListCategories`/`useUpdateCategory`/`useDeleteCategory` get hook tests (`MockedProvider`-based, mirror `use-create-category.test.ts`). `CategoryForm`'s existing test file is updated for its new prop contract (no more internal `useCreateCategory` mock — tests now pass `onSubmit` directly and assert it's called with form values, rather than asserting a specific mutation call). `NewCategoryDialog` gains a wrapper test using the refactored contract. `CategoryCard`, `EditCategoryDialog`, `DeleteCategoryAlert` each get their own component tests. `CategoriesPage` gets tests for all four grid states (loading/error/empty/populated) plus opening each dialog from a card.
- **Implementation Details:** new dependency: none (`AlertDialog` ships inside the already-installed `radix-ui` package via the shadcn CLI — remember: **no `-p` flag** on `add`, per the PM-010 memory note). Modified files: `src/modules/categories/graphql/mutations.ts` (+`UPDATE_CATEGORY`/`DELETE_CATEGORY`), `src/modules/categories/hooks/use-create-category.ts` (+`refetchQueries`), `src/modules/categories/components/category-form.tsx` (prop contract change), `src/modules/categories/components/new-category-dialog.tsx` (updated to own the hook call), `src/modules/categories/pages/categories-page.tsx` (real grid), plus their test files.
- **Security Considerations:** no new concerns beyond PM-010 — `title`/`description` render as plain text (React escaping), `icon`/`color` on existing categories are already-validated server data (not free user input at render time). Delete is a destructive action gated behind an explicit confirmation dialog.
- **Cross-Cutting Concerns:** toast on successful create/update/delete (mirrors PM-010's pattern: `'Categoria criada com sucesso!'` / `'Categoria atualizada com sucesso!'` / `'Categoria excluída com sucesso!'`). No logging/analytics added.
- **Error Scenarios & Failure Modes:** `listCategories` network/server error → `role="alert"` banner replacing the grid, no retry button (reload the page). `updateCategory`/`deleteCategory` errors → rendered in their respective dialog, dialog stays open so the user can retry (same pattern as create). Deleting a category that has transactions: per the server's Prisma schema, `Transaction.categoryId` is `onDelete: SetNull` — transactions survive uncategorized, not blocked/cascaded; no special client-side warning copy for this (out of scope — could be a future "N transações ficarão sem categoria" confirmation-copy enhancement).
- **Performance & Scale:** matches the server's own stated assumption (tens of categories per user, not thousands) — no pagination/virtualization on the grid.
- **Module Composition:** all new/changed files stay within `src/modules/categories/` (or its own new `src/components/ui/alert-dialog.tsx` shadcn primitive) — no other module's files change.
- **Deployment & Operations:** no new `VITE_*` env var, no feature flag. Manual post-deploy check once the server ships `transactionQuantity`: confirm `listCategories` returns it and cards render real counts instead of erroring/showing `undefined`.
- **Backward Compatibility:** **`CategoryForm`'s prop contract changes** (no longer calls `useCreateCategory` internally) — `NewCategoryDialog` (its only existing caller, PM-010) is updated in this same ticket, so no dangling caller. This is the one intentional breaking change in this plan.

## Implementation Phases

### Phase 1: Foundation

- [ ] Add the shadcn `AlertDialog` primitive: `pnpm dlx shadcn@latest add alert-dialog` (no `-p` flag) → `src/components/ui/alert-dialog.tsx`
- [ ] Add `LIST_CATEGORIES` query + `Category`/`ListCategoriesData` types to `src/modules/categories/graphql/queries.ts` (exact `gql` document + types above, including `transactionQuantity`)
- [ ] Add `UPDATE_CATEGORY`/`DELETE_CATEGORY` mutations + `UpdateCategoryInput`/`UpdateCategoryData`/`DeleteCategoryData` types to `src/modules/categories/graphql/mutations.ts` (exact documents + types above)
- [ ] Implement `useListCategories()` (`src/modules/categories/hooks/use-list-categories.ts`): wraps `useQuery<ListCategoriesData>(LIST_CATEGORIES)`; returns `{ categories, isLoading, error }`, `categories` defaults to `[]`, `error` is the fallback message `'Não foi possível carregar as categorias.'` when `useQuery`'s `error` is set
- [ ] Implement `useUpdateCategory()` (`src/modules/categories/hooks/use-update-category.ts`): wraps `useMutation<UpdateCategoryData, { id: string, input: UpdateCategoryInput }>(UPDATE_CATEGORY, { refetchQueries: [{ query: LIST_CATEGORIES }] })`; returns `{ updateCategory, isLoading, fieldErrors, formError }`; error-branching identical to `use-create-category.ts`, fallback message `'Não foi possível atualizar a categoria. Tente novamente.'`
- [ ] Implement `useDeleteCategory()` (`src/modules/categories/hooks/use-delete-category.ts`): wraps `useMutation<DeleteCategoryData, { id: string }>(DELETE_CATEGORY, { refetchQueries: [{ query: LIST_CATEGORIES }] })`; returns `{ deleteCategory, isLoading, error }`; on `CombinedGraphQLErrors` or any other error, sets `error` to the fallback message `'Não foi possível excluir a categoria. Tente novamente.'`
- [ ] Add `refetchQueries: [{ query: LIST_CATEGORIES }]` to `useCreateCategory`'s existing `useMutation(CREATE_CATEGORY)` call (`src/modules/categories/hooks/use-create-category.ts`) so new categories appear in the grid without a manual reload

### Phase 2: Features

- [ ] Refactor `CategoryForm` (`src/modules/categories/components/category-form.tsx`) to the new contract above: drop the internal `useCreateCategory()` call, accept `defaultValues`/`isLoading`/`fieldErrors`/`formError`/`onSubmit` as props, merge `defaultValues` over the create-mode fallback (`ICON_OPTIONS[0].name`/`COLOR_OPTIONS[0].value`)
- [ ] Update `NewCategoryDialog` (`src/modules/categories/components/new-category-dialog.tsx`) to own the `useCreateCategory()` call itself, build the `onSubmit` handler (call `createCategory`, on success `toast.success('Categoria criada com sucesso!')` + `onOpenChange(false)`), pass its state down to `CategoryForm`
- [ ] Implement `EditCategoryDialog` (`src/modules/categories/components/edit-category-dialog.tsx`): same `Dialog`/`DialogContent` chrome as `NewCategoryDialog` but title "Editar categoria", subtitle "Atualize os dados da categoria"; owns `useUpdateCategory()`, `defaultValues` from its `category` prop (`{ title, description: description ?? '', icon, color }`), `onSubmit` calls `updateCategory(category.id, values)`, on success `toast.success('Categoria atualizada com sucesso!')` + `onOpenChange(false)`
- [ ] Implement `DeleteCategoryAlert` (`src/modules/categories/components/delete-category-alert.tsx`): `AlertDialog` with title "Excluir categoria?", description naming `category.title`, `AlertDialogCancel` ("Cancelar"), `AlertDialogAction` (destructive style, label "Excluir"/"Excluindo…" while `useDeleteCategory().isLoading`) calling `deleteCategory(category.id)`, on success `toast.success('Categoria excluída com sucesso!')` + `onOpenChange(false)`
- [ ] Implement `CategoryCard` (`src/modules/categories/components/category-card.tsx`): `Card` (`border-gray-200 ring-0`) containing icon square (inline `style` bg/color from `category.color`, icon from `ICON_OPTIONS.find((o) => o.name === category.icon)?.icon` falling back to `Tag`), edit/delete `IconButton`s (top-right, calling `onEdit`/`onDelete` props with the category), title, description, colored name badge (inline `style`), and "`{transactionQuantity}` item(s)" text (singular when `1`)
- [ ] Wire the grid into `CategoriesPage` (`src/modules/categories/pages/categories-page.tsx`): `useListCategories()`; loading → "Carregando categorias…" text; error → `role="alert"` banner; empty (`categories.length === 0`) → "Nenhuma categoria cadastrada ainda." text; populated → `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4` of `CategoryCard`s; owns `editingCategory`/`deletingCategory` state, renders `EditCategoryDialog`/`DeleteCategoryAlert` conditionally when set
- [ ] Unit tests for `useListCategories` (`src/modules/categories/hooks/__tests__/use-list-categories.test.ts`, `MockedProvider`): resolves with the mocked category list; `categories` is `[]` before resolution; sets the fallback `error` message on a network error
- [ ] Unit tests for `useUpdateCategory` (`src/modules/categories/hooks/__tests__/use-update-category.test.ts`, `MockedProvider`): mirrors `use-create-category.test.ts`'s three cases (resolves + `isLoading` toggles, `validationErrors` → `fieldErrors`, fallback `formError` on network error)
- [ ] Unit tests for `useDeleteCategory` (`src/modules/categories/hooks/__tests__/use-delete-category.test.ts`, `MockedProvider`): resolves `true` and toggles `isLoading`; sets the fallback `error` message on a network error
- [ ] Update `CategoryForm`'s existing test (`src/modules/categories/components/__tests__/category-form.test.tsx`) for the new prop contract: pass `onSubmit`/`isLoading`/`fieldErrors`/`formError` directly instead of mocking `useCreateCategory`; assert `onSubmit` is called with the form values instead of asserting a specific mutation call; add a case asserting a passed `defaultValues` prop pre-fills the title/description fields and pre-selects the given icon/color
- [ ] Update `NewCategoryDialog`'s tests (`src/modules/categories/components/__tests__/new-category-dialog.test.tsx` — new file, this component had no dedicated test in PM-010, only indirect coverage via `CategoriesPage`): mocks `useCreateCategory`, asserts the dialog closes and toasts on a successful submit
- [ ] Component tests for `EditCategoryDialog` (`src/modules/categories/components/__tests__/edit-category-dialog.test.tsx`, mocks `useUpdateCategory`): renders "Editar categoria" title; pre-fills the form from the `category` prop; calls `updateCategory(category.id, values)` on submit; closes and toasts on success
- [ ] Component tests for `DeleteCategoryAlert` (`src/modules/categories/components/__tests__/delete-category-alert.test.tsx`, mocks `useDeleteCategory`): renders the category's title in the confirmation copy; calls `deleteCategory(category.id)` when "Excluir" is confirmed; does not call it if "Cancelar" is clicked instead; closes and toasts on success
- [ ] Component tests for `CategoryCard` (`src/modules/categories/components/__tests__/category-card.test.tsx`): renders title/description/badge/item count; renders the icon matching `category.icon`; falls back to the generic icon for an unrecognized `category.icon`; clicking edit/delete calls the respective `onEdit`/`onDelete` prop with the category
- [ ] Component tests for `CategoriesPage` (`src/modules/categories/pages/__tests__/categories-page.test.tsx`, mocks `useListCategories`, `MemoryRouter`): renders "Carregando categorias…" while loading; renders the error banner on error; renders the empty-state message when `categories` is `[]`; renders one `CategoryCard` per category when populated; clicking a card's edit/delete opens the matching dialog for that category

## Test Cases

### Phase 1: Foundation

- [ ] `useListCategories` resolves with the mocked category list
- [ ] `useListCategories`'s `categories` is `[]` before the query resolves
- [ ] `useListCategories` sets the fallback error message on a network error
- [ ] `useUpdateCategory` resolves with the updated category and `isLoading` toggles `true` → `false` around the mutation call
- [ ] `useUpdateCategory` maps `extensions.validationErrors` straight to `fieldErrors` when present
- [ ] `useUpdateCategory` sets `formError` to the fallback message on a network/unexpected error
- [ ] `useDeleteCategory` resolves `true` and `isLoading` toggles `true` → `false` around the mutation call
- [ ] `useDeleteCategory` sets the fallback error message on a network/unexpected error

### Phase 2: Features

- [ ] `CategoryForm` calls `onSubmit` with the form values on a valid submit (no longer asserts a specific mutation)
- [ ] `CategoryForm` pre-fills title/description and pre-selects icon/color from a passed `defaultValues` prop
- [ ] `NewCategoryDialog` closes and toasts on a successful `createCategory` call
- [ ] `EditCategoryDialog` renders "Editar categoria" and pre-fills the form from its `category` prop
- [ ] `EditCategoryDialog` calls `updateCategory(category.id, values)` on submit and closes + toasts on success
- [ ] `DeleteCategoryAlert` renders the category's title in its confirmation copy
- [ ] `DeleteCategoryAlert` calls `deleteCategory(category.id)` only when "Excluir" is confirmed, not on "Cancelar"
- [ ] `DeleteCategoryAlert` closes and toasts on a successful delete
- [ ] `CategoryCard` renders title, description, name badge, and "N itens"/"N item" text
- [ ] `CategoryCard` renders the icon matching `category.icon`, falling back to a generic icon for an unrecognized value
- [ ] `CategoryCard`'s edit/delete buttons call `onEdit`/`onDelete` with the category
- [ ] `CategoriesPage` renders a loading message while `useListCategories` is loading
- [ ] `CategoriesPage` renders an error banner when `useListCategories` errors
- [ ] `CategoriesPage` renders an empty-state message when there are no categories
- [ ] `CategoriesPage` renders one `CategoryCard` per category when populated
- [ ] `CategoriesPage` opens `EditCategoryDialog`/`DeleteCategoryAlert` for the correct category when a card's edit/delete is clicked

## Dependencies

- No new npm packages — `AlertDialog` comes from the already-installed `radix-ui` package via the shadcn CLI.
- **External, unimplemented dependency:** `transactionQuantity` field on the server's `CategoryType` (`../server`, separate repository) — being added by the user alongside this ticket. Blocks real end-to-end verification of the item count, not the client code itself (mocked tests are unaffected).
- Depends on the server's existing `listCategories`/`updateCategory`/`deleteCategory` (already implemented, PM-010/PM-003).
- Internal: reuses `Card`, `IconButton`, `Dialog` (PM-006/007/010), `ICON_OPTIONS`/`COLOR_OPTIONS` (PM-010's `icon-picker.tsx`/`color-picker.tsx`).

## Risks & Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Figma Fidelity table is a best-effort estimate, not a verified spec (Figma MCP quota exhausted for the month) | Medium | Explicitly flagged in this plan rather than silently proceeding; re-run `/figma-fidelity` on node `3104:2627` once quota resets and reconcile |
| `transactionQuantity` doesn't exist on the server yet — if it lands with a different name/type than assumed, `LIST_CATEGORIES`'s query and `CategoryCard`'s render break | Medium | Confirmed the exact field name (`transactionQuantity`) with the user before writing this plan; a mismatch is a quick fix (rename in `queries.ts`) once the real server schema is available |
| `CategoryForm`'s prop contract change could silently break `NewCategoryDialog` if the update is incomplete | Low | Both are updated together in this same phase/ticket, plus `pnpm build`'s type-check will fail loudly on any prop mismatch |
| Icon square/badge use inline `style` for arbitrary per-category hex colors — first place in this repo doing that instead of static Tailwind classes | Low | Necessary (colors are dynamic DB values, not one of a fixed token set) and self-contained to `CategoryCard`; doesn't affect any shared primitive |

## Success Criteria

- [ ] All acceptance criteria in `spec.md` met (item-count criterion verified once the server ships `transactionQuantity`)
- [ ] Tests passing (`pnpm test`)
- [ ] `pnpm build` compiles without errors
