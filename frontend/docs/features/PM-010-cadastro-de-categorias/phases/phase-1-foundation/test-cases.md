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
