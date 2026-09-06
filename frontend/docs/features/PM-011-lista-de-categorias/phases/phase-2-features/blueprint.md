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
