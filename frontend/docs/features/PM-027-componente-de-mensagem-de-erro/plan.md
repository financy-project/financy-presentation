# Componente de mensagem de erro - PM-027 - Implementation Plan

## Definition of Ready (DoR) Blueprints

This plan must explicitly define the architectural layers per [docs/architecture/dor.md](../../architecture/dor.md). Each blueprint below should be fully specified, or marked `**Omitted:**` with justification.

### Component Blueprint

**Omitted:** or provide:

- **Component Name(s)** and file path
- **Props type block** (an actual TypeScript type)
- **Composition:** existing components/shadcn primitives reused, new primitives needed
- **States to render:** loading, error, empty, populated

### GraphQL/API Blueprint

**Omitted:** or provide:

- **Query/Mutation name(s)** + exact `gql` document
- **Variables/Response TS types**
- **Hook name + signature**
- **Cache strategy:** `refetchQueries` / manual `update` / optimistic response (mutations); `fetchPolicy` (queries)
- **Loading/Error handling:** owner + user-facing behavior

### Form & Validation Blueprint

**Omitted:** or provide:

- **Zod schema** (exact field list + rules)
- **Form component:** owner of `useForm`/`zodResolver`, wiring to the mutation

### State Blueprint

**Omitted:** or provide:

- **What state, and why** component-local state isn't enough
- **Where it lives:** context / React Query key / URL params
- **Shape:** TypeScript type block

---

## Architectural Decisions

Cover all applicable areas from `/grill-me`. Mark any area "Not Applicable" with justification rather than omitting it silently.

- **Scope & Requirements:**
- **Data & State:**
- **User Experience:**
- **Testing & Validation:**
- **Implementation Details:**
- **Security Considerations:**
- **Cross-Cutting Concerns:**
- **Error Scenarios & Failure Modes:**
- **Performance & Scale** (if applicable):
- **Module Composition** (if applicable):
- **Deployment & Operations:**
- **Backward Compatibility** (if applicable):

## Implementation Phases

Each bullet must be traceable to a Blueprint above and carry an exact file path, exact symbol/signature or prop list, and exact test cases inline — see [docs/architecture/dor.md](../../architecture/dor.md)'s granularity rule.

### Phase 1: Foundation

- [ ] GraphQL document + types
- [ ] API hook

### Phase 2: Features

- [ ] Component(s)
- [ ] Wiring into the app
- [ ] Tests

### Phase 3: Polish

- [ ] Edge case handling (loading/error/empty states)
- [ ] Accessibility pass

## Test Cases

Sibling to Implementation Phases, same `### Phase N:` grouping. Every entry must trace to a hook's cache-strategy branch, a component state, or a Zod rule already written above.

### Phase 1: Foundation

- [ ] (test case)

### Phase 2: Features

- [ ] (test case)

## Dependencies

- List any external dependencies
- List any internal component/hook dependencies

## Risks & Mitigations

| Risk   | Impact | Mitigation      |
| ------ | ------ | --------------- |
| Risk 1 | High   | Mitigation plan |

## Success Criteria

- [ ] All acceptance criteria met
- [ ] Tests passing (`pnpm test`)
- [ ] `pnpm build` compiles without errors
