---
name: feature-task
id: feature-task
version: 1.0.0
type: planning
---

# Skill: Generate Feature Tasks

Break down the implementation plan into a flat, phase-organized task file.

## Usage

```bash
/feature-task
```

## What it does

1. Auto-detects current feature from git branch
2. **Validates `plan.md` against DoR** — before generating tasks, verify the plan contains all sections required by `docs/architecture/dor.md`:
   - **Component Blueprint** ✓
   - **GraphQL/API Blueprint** (query/mutation, hook, cache/loading/error handling) ✓
   - **Form & Validation Blueprint** (if the feature has a form) ✓
   - **State Blueprint** (if the feature needs state beyond component-local) ✓
   - Each section either fully specified or explicitly marked `**Omitted:**`. If any required section is missing entirely (not even marked Omitted), stop and report which section(s) are missing.
3. Reads `plan.md` to understand what work needs to be done
4. Generates task file: `tasks.md` with tasks `F-NNN`, organized by phase. This step is purely mechanical — it copies each `## Implementation Phases` bullet from `plan.md` **verbatim**, prefixed with an `F-NNN` id. No elaboration happens here.
   - **Soft granularity check:** after generating `tasks.md`, warns (does not block) on any task with no backtick-quoted file path/symbol.
5. Generates `test-cases.md` the same mechanical way, from `plan.md`'s `## Test Cases` section, with `T-NNN` ids. Comments it on the matching GitHub issue if one exists and `gh` is available.
6. **Slices `tasks.md` and `test-cases.md` by phase** into `docs/features/PM-NNN-*/phases/phase-N-slug/{tasks.md,test-cases.md}`.
7. **Copies the `## Definition of Ready (DoR) Blueprints` section verbatim into every phase folder** as `phases/phase-N-slug/blueprint.md` — identical content in every phase, since Blueprints are organized by layer, not by phase. Byte-identical across phases by design, so it hits Anthropic's prompt cache from the second phase onward.
8. Each task: `- [ ] F-NNN: Description` (F = frontend, NNN = sequence number)
9. **Task layers** typically follow this order (skip layers a feature doesn't need):
   - GraphQL query/mutation document + generated/manual types
   - API hook wrapping it (cache update, loading/error handling) + hook tests
   - Zod validation schema (if the feature has a form) + schema tests
   - Component(s) (props, composition) + component tests
   - Wiring into the app (route/parent component)
   - E2E/interaction tests

## Requirements

- Must be on a feature branch: `PM-NNN/slug`
- `plan.md` must exist and describe the changes
- `plan.md` must meet the Definition of Ready (DoR): see `docs/architecture/dor.md` for blueprint requirements

## Output

- `tasks.md` and `test-cases.md` in the feature directory (flat, all phases — `test-cases.md` also commented on the matching GitHub issue, if any)
- `phases/phase-N-slug/tasks.md`, `test-cases.md`, and `blueprint.md` — per-phase slices `/workflow` reads instead of the flat files
- Each task ready to implement

## Example

```bash
git checkout PM-001/transaction-list-filters
/feature-task

# Reads: docs/features/PM-001-transaction-list-filters/plan.md
# Creates:
#   docs/features/PM-001-transaction-list-filters/tasks.md
#   docs/features/PM-001-transaction-list-filters/test-cases.md
#   docs/features/PM-001-transaction-list-filters/phases/phase-1-foundation/{tasks.md,test-cases.md,blueprint.md}
#   ... one phases/phase-N-slug/ folder per phase
#
# tasks.md contains:
#   - [ ] F-001: Add `GET_TRANSACTIONS` query with filter args (`src/graphql/queries.ts`)
#   - [ ] F-002: Implement `useTransactionsQuery` hook (`src/graphql/hooks/use-transactions-query.ts`)
#   - [ ] F-003: Implement `TransactionFilters` component (`src/components/transaction-filters.tsx`)
#   - [ ] F-004: Wire filters into `TransactionList`
#
# test-cases.md contains:
#   - [ ] T-001: useTransactionsQuery passes filter args through to the query variables
#   - [ ] T-002: TransactionFilters emits onChange with the selected date range
```

## See Also

- `/feature-plan` — write the implementation plan
- `/feature-status` — view task progress
