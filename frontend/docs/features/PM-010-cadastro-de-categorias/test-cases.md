# cadastro-de-categorias - PM-010 - Test Cases

### Phase 1: Foundation

- [x] T-001: `useCreateCategory` resolves with `{ id, title, description, icon, color }` and `isLoading` toggles `true` → `false` around the mutation call
- [x] T-002: `useCreateCategory` maps `extensions.validationErrors` straight to `fieldErrors` when present
- [x] T-003: `useCreateCategory` sets `formError` to the fallback message on a network/unexpected error
- [x] T-004: `IconPicker` renders all 16 icon options
- [x] T-005: `IconPicker` calls `onChange` with an option's name when clicked
- [x] T-006: `IconPicker` marks the option matching `value` with `aria-pressed="true"` and the rest `"false"`
- [x] T-007: `ColorPicker` renders all 7 color options
- [x] T-008: `ColorPicker` calls `onChange` with an option's hex value when clicked
- [x] T-009: `ColorPicker` marks the option matching `value` with `aria-pressed="true"` and the rest `"false"`

### Phase 2: Features

- [x] T-010: `CategoryForm` shows "O título é obrigatório" for an empty title on submit
- [x] T-011: `CategoryForm` disables submit and shows "Salvando…" while `isLoading`
- [x] T-012: `CategoryForm` renders a mocked `fieldErrors` entry under "Título"
- [x] T-013: `CategoryForm` renders the mocked `formError` in the `role="alert"` banner verbatim
- [x] T-014: `CategoryForm` calls `createCategory` with the pre-selected icon (`BriefcaseBusiness`) and color (`#16A34A`) when submitted without changing them
- [x] T-015: `CategoryForm` calls `createCategory` with a newly selected icon/color after the user picks different ones
- [x] T-016: `CategoryForm` calls `onSuccess` after a successful submit
- [x] T-017: `CategoriesPage` renders the page header (title, subtitle, "Nova categoria" button) and the app `Header`'s nav
- [x] T-018: `CategoriesPage` opens the dialog (modal title "Nova categoria" visible) when "Nova categoria" is clicked
- [x] T-019: `CategoriesPage` closes the dialog after a successful category creation
