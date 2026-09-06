# Project Constitution (Web)

## Philosophy

We believe in **Specification-Driven Development (SDD)**: features are defined by written specifications before implementation begins. This ensures clarity, reduces rework, and makes edge cases explicit.

We value **testability, clarity, and maintainability** over cleverness. Code should be easy to reason about.

## Tech Stack

- **React 19** + **Vite** + **TypeScript**
- **Apollo Client v4** for GraphQL
- **TanStack React Query** for async state outside GraphQL
- **React Hook Form** + **Zod** for forms and validation
- **Tailwind CSS v4** + **shadcn/ui** (style `radix-nova`) for UI
- **Lucide** for icons
- **Vitest** + **React Testing Library** for unit/component tests
- **pnpm** as package manager

## Architectural Principles

### Plain Components + Hooks

No MVVM, no global client-state store (Zustand or otherwise), no Atomic Design hierarchy. Composition is: **component (view + local state) + hooks (data/behavior)**. Server state lives in the Apollo cache / React Query cache — reach for those before introducing any new client-side store, and treat adding one as an architectural decision that belongs in a `plan.md`, not something introduced silently mid-task.

### Layer Responsibilities

- **GraphQL documents** (`src/graphql/*.ts`) — `gql` tag exports, no logic
- **API hooks** — wrap `useQuery`/`useMutation`, own the cache-update strategy, expose a small typed return value (never the raw Apollo result shape)
- **Validation schemas** — Zod, colocated with the form component; `zodResolver` wires it into `react-hook-form`, no hand-rolled validation
- **Components** — `src/components/ui/` for shadcn primitives (CLI-generated, never hand-written), `src/components/` for everything else

### Project Structure

See [`CLAUDE.md`](./CLAUDE.md) for the current directory layout and provider wiring — not duplicated here to avoid drift between the two files.

## Testing Philosophy

- Unit/component tests: Vitest + React Testing Library, `jsdom` environment (`pnpm test`).
- Test hooks in isolation where practical (e.g. `MockedProvider` for Apollo hooks) rather than only through a mounted component.
- One `describe` block per test file, under a sibling `__tests__/` directory.
- No e2e runner is set up yet. If a feature's plan needs e2e coverage, `/grill-me` should surface that explicitly rather than assuming it exists.

## Code Conventions

- **File naming**: kebab-case filename, PascalCase export for components; hooks are `use-<thing>.ts` → `useThing`.
- **Path alias**: `@/*` → `src/*`, never deep relative paths across feature boundaries.
- **ESLint/oxlint compliance**: all code must pass `pnpm lint` before committing.
- **TypeScript strict mode**: per `tsconfig.app.json`.

## API Layer Pattern

GraphQL access goes through Apollo Client hooks (`useQuery`/`useMutation`), wrapped in a project-owned hook that decides the cache strategy and exposes a minimal typed return value — components never call `useQuery`/`useMutation` directly against a raw `gql` string. Anything not GraphQL-backed (e.g. a future REST integration) goes through TanStack React Query instead.

## Validation Pattern

Zod schema colocated with the form component (`<form>.schema.ts`), wired via `zodResolver` into `react-hook-form`. The schema is the single source of truth for a form's shape and rules.

## Specification-Driven Development (SDD)

Features are driven by specifications, not by tickets. See `.claude/skills` (and `CLAUDE.md`) for the SDD workflow scripts.

**Core rules:**
- Write the spec first (user stories, acceptance criteria)
- Use `/grill-me` to surface edge cases before planning
- Write the plan with the DoR blueprints (see [docs/architecture/dor.md](docs/architecture/dor.md))
- Break the plan into tasks (`F-NNN` prefix for frontend tasks)
- Implement task-by-task, checking off as you go
- Use `/feature-status` to track real-time progress

## No Half-Finished Code

- Don't add components beyond what the task requires
- Don't refactor or add abstractions for hypothetical future requirements
- Don't add error handling for scenarios that can't happen
- Three similar lines is better than a premature abstraction

**Why:** Incomplete work becomes technical debt. Keep scope tight and explicit.
