# Definition of Ready (DoR) for Planning

This document defines the **Definition of Ready (DoR) for Planning**, tailored for our React/Vite/TypeScript/Apollo Client architecture. Before any implementation plan (`plan.md`) is considered ready to be converted into actionable tasks, it must explicitly outline the structural blueprints for each layer it touches.

## Required Blueprints in `plan.md`

All blueprint sub-sections below must be wrapped in a single top-level heading, written **exactly** as `## Definition of Ready (DoR) Blueprints`. `/feature-task` extracts everything between that heading and the next `## ` heading verbatim into per-phase blueprint files — the exact string match is what makes that extraction reliable, so don't rename or reword it.

Your plan must use explicit markdown headings (e.g., `### Component Blueprint`) and define the following structures:

### 1. Component Blueprint

Define the UI surface this feature adds or changes.

- **Component Name(s)** and file path (e.g. `src/components/transaction-filters.tsx`)
- **Props type block:** an actual TypeScript type, not a prose list — copy-paste ready
  ```ts
  type TransactionFiltersProps = {
    value: TransactionFilterState
    onChange: (next: TransactionFilterState) => void
  }
  ```
- **Composition:** which existing components/`shadcn/ui` primitives it renders, and any new primitive that needs adding via the shadcn CLI first
- **States to render:** loading, error, empty, populated — as applicable
- **Figma Fidelity (required if `spec.md` links a `figma.com` design):** the `/figma-fidelity` skill's output — a spec table of exact size/padding/gap/radius/border/color/typography/icon values per element, each mapped to this repo's actual token classes (`src/index.css`) and existing/new component variants. Paste the table; do not summarize it as "matches the design" or "standard spacing" — the whole point is to name the exact values so an implementer isn't guessing or reusing the nearest default by eye.

  Example row:
  ```markdown
  | Element              | Size    | Padding      | Gap | Radius | Border           | BG      | Text                | Font                | Icon        |
  |-----------------------|--------|--------------|-----|--------|-------------------|---------|----------------------|----------------------|-------------|
  | Submit button (`Button` `xl`) | 100%×48px | 16px×12px | 8px | 8px | none | `bg-primary` (#1F6F43) | `text-primary-foreground` (white) | medium/16px/24px | — |
  | Name field icon       | 16×16  | —            | —   | —      | —                 | —       | `text-gray-400` (#9CA3AF) | —                | `User` (lucide) |
  ```

### 2. GraphQL/API Blueprint

Define the data boundary.

- **Query/Mutation name(s)** and the exact `gql` document (copy-paste ready)
- **Variables/Response TS types** — hand-written (no codegen yet), colocated with the document
- **Hook name + signature:** the wrapping hook's exact name and return shape, e.g. `useTransactionsQuery(filters: TransactionFilters): { transactions: Transaction[], isLoading: boolean, error: string | null }`
- **Cache strategy:** for a mutation, state explicitly how the cache stays consistent — `refetchQueries`, a manual `update`, or an optimistic response. For a query, state the `fetchPolicy`
- **Loading/Error handling:** where it's owned (hook vs. component) and what the user sees

### 3. Form & Validation Blueprint

**Omitted:** if the feature has no form, or provide:

- **Zod schema** — exact field list + rules, copy-paste ready
  ```ts
  const transactionFormSchema = z.object({
    amount: z.number().positive(),
    categoryId: z.string().min(1, 'Selecione uma categoria'),
  })
  ```
- **Form component:** which component owns `useForm` + `zodResolver`, and how submit wires into the GraphQL/API Blueprint's mutation

### 4. State Blueprint

**Omitted:** if the feature needs no state beyond component-local `useState`/props, or provide:

- **What state, and why** component-local state isn't enough (shared across siblings, survives unmount, etc.)
- **Where it lives:** React context, a new React Query key, URL search params — name the exact mechanism
- **Shape:** a TypeScript type block, same rule as the other blueprints

## Test Cases

Every plan must include a `## Test Cases` section, sibling to `## Implementation Phases`, using the same `### Phase N: <name>` grouping. This is **not a second design surface** — every entry must already be traceable to something already decided in the Blueprints above: a hook's cache-strategy branch, a component's state (loading/error/empty), a Zod rule.

```markdown
## Test Cases

### Phase 1: Foundation

- [ ] `useTransactionsQuery` passes `filters` through to the query variables
- [ ] `useTransactionsQuery` returns `isLoading: true` while the request is in flight

### Phase 2: Features

- [ ] `TransactionFilters` calls `onChange` with the selected date range
- [ ] `TransactionList` shows the empty state when `transactions` is `[]`
```

May be omitted only if the feature has no Component, GraphQL/API, Form, or State Blueprint requiring test coverage (e.g. a pure config/style change) — state `**Omitted:**` with justification, same as any other blueprint.

---

## 🛑 The Critical Omission Rule

**Not every feature requires every blueprint.** If a blueprint typically required by our architecture is **NOT** needed for the feature being planned, you **MUST explicitly state "Omitted"** in the plan and provide a brief justification.

_Example:_

> ### Form & Validation Blueprint
>
> **Omitted:** This feature only adds filter dropdowns (no free-text input to validate) — filter values are constrained to a fixed enum, not user-typed text.

## Implementation Phases Must Match Task Granularity

`## Implementation Phases` is not a summary — `/feature-task` copies its bullets **verbatim** into `tasks.md`, one bullet per `F-NNN` task, with zero elaboration in between. Whatever granularity you write here is exactly what an implementer (human or agent) receives as its only instruction for that task.

Each phase bullet must therefore be traceable to its Blueprint above and include, inline:

- **Exact file path** (e.g. `src/graphql/hooks/use-transactions-query.ts`)
- **Exact symbol name + signature or prop list** (function/hook names, params, return type — pulled straight from the Blueprint, not paraphrased)
- **Exact test location + enumerated cases**, when the item needs tests

_Weak (rejected — leaves the implementer to invent the shape):_

> - [ ] `useTransactionsQuery` hook (+ unit tests)

_Correct (implementer just implements, doesn't decide):_

> - [ ] Implement `useTransactionsQuery(filters: TransactionFilters)` (`src/graphql/hooks/use-transactions-query.ts`): wraps `useQuery(GET_TRANSACTIONS, { variables: { filters }, fetchPolicy: 'cache-and-network' })`, returns `{ transactions, isLoading, error }`
> - [ ] Unit tests for `useTransactionsQuery`: passes filters through to variables, `isLoading` true while in flight, returns formatted error message on failure

If a bullet can't be written this concretely yet, the Blueprint it comes from is incomplete — finish the Blueprint before writing the phase breakdown.

## Why This Is Required

These blueprints act as a strict guide for whoever executes the tasks. Providing explicit signatures — including exact prop lists, hook return shapes, and Zod schemas — prevents hallucinated component shapes, stops architectural drift, and ensures a clean, predictable implementation phase.
