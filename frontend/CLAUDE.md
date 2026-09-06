# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install     # Install dependencies
pnpm dev         # Start Vite dev server (falls back to another port if 5173 is taken)
pnpm build       # Type-check via project references (tsc -b) then bundle (vite build)
pnpm lint        # oxlint
pnpm preview     # Serve the production build locally
pnpm test        # Run Vitest unit/component tests (headless, jsdom)
pnpm test:watch  # Vitest in watch mode
```

There is no e2e runner configured yet.

## Architecture

This is the **frontend** of the Financy project. The sibling `../server` directory is a separate git repository/GraphQL API (Apollo Server + TypeGraphQL + Prisma) with its own `CLAUDE.md` — the two are developed independently.

Stack: React 19 + Vite + TypeScript, Apollo Client v4 for GraphQL, TanStack React Query for other async/local state, React Hook Form + Zod for forms, Tailwind CSS v4 + shadcn/ui for UI.

- Path alias `@/*` → `src/*`, configured in both `tsconfig.app.json`/`tsconfig.json` and `vite.config.ts` — keep them in sync if it ever changes.
- `src/main.tsx` renders `<AppProviders>` (`src/providers/app-providers.tsx`), which nests `ApolloProvider` (`src/lib/apollo-client.ts`) inside `QueryClientProvider` (`src/lib/query-client.ts`). Both clients are plain singletons — there's no per-domain split yet.
- The GraphQL endpoint comes from `VITE_BACKEND_URL` (see `.env.example`), pointing at the Financy GraphQL API in `../server`.
- shadcn/ui primitives live in `src/components/ui/` and are added via the shadcn CLI, not written by hand. `components.json` config: style `radix-nova`, baseColor `neutral`, icon library `lucide`, aliases `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`.
- App-specific components (e.g. `contact-form.tsx`, `countries-list.tsx`) live directly in `src/components/`, one per file, kebab-case filename / PascalCase export.
- GraphQL documents live in `src/graphql/` as `gql` tag exports (see `queries.ts`).

## Design system (Figma)

Source: Figma file "Financy (Community)" — Style Guide page.

- **Font**: Inter, via `@fontsource-variable/inter`, imported in `src/index.css` and mapped to `--font-sans`.
- **Icons**: Lucide (`lucide-react`). Icon names in the Figma style guide match `lucide-react` export names 1:1 — import icons as components rather than adding static SVGs.
- **Logo**: `src/assets/logo.svg` (brand wordmark + mark).
- **Colors**: the full brand palette (brand, gray, blue, purple, pink, red, orange, yellow, green — each with `dark`/`base`/`light`, plus `danger`/`success`) is defined as CSS custom properties in `src/index.css` and exposed as Tailwind utilities through the `@theme inline` block (e.g. `bg-blue-base`, `text-purple-dark`). `--primary` is mapped to brand-base (`#1F6F43`).
- Figma's Style Guide only defines light-mode colors; the `.dark` values in `src/index.css` were derived from the same scale rather than pulled from Figma — double-check against design before relying on them for dark-mode work.
- Before implementing or auditing any screen against a Figma link, run `/figma-fidelity` — it extracts a full numeric spec (sizing, spacing, colors, typography, icons) and maps every value to this repo's tokens/components instead of relying on a screenshot by eye. `/feature-plan` invokes it automatically when `spec.md` links a Figma design.

## Spec Driven Development (SDD)

Features are driven by specifications, not tickets. All feature work must align with [constitution.md](constitution.md). Use the feature-* skills to plan and track work:

### Workflow

1. **`/feature-new "Feature Name"`** — Create a new feature with PM-NNN numbering
   - Numbers itself off the dedicated [financy-project/features](https://github.com/financy-project/features) repo's GitHub issues (or `docs/features/` locally if no remote/gh) — the PM-NNN sequence is shared across every project in the org
   - Creates `docs/features/PM-NNN-slug/` with `spec.md` and `plan.md` **in this repo**
   - Creates git branch `PM-NNN/slug`
   - Optionally creates a GitHub milestone + issue **in `financy-project/features`** with `--milestone "v1.0"`, linked back to this repo/branch/files

2. **Fill `spec.md`** — Write requirements and acceptance criteria (user story format), or use the `product-owner` agent to collaborate on it

3. **`/feature-plan`** — Plan the implementation
   - Reads `spec.md`
   - Invokes `/grill-me` to surface edge cases across all 13 planning areas, including the Apollo Client-specific additions (cache strategy, optimistic UI, loading/error UX)
   - Writes `plan.md` with the [DoR Blueprints](docs/architecture/dor.md) (Component, GraphQL/API, Form & Validation, State) and the Architectural Decisions section

4. **`/feature-task`** — Break down the plan into tasks
   - Generates `tasks.md` (flat) + `test-cases.md`, sliced per-phase under `phases/phase-N-slug/`
   - Each task: `- [ ] F-NNN: Description`, organized by phase

5. **`/workflow [max_iterations]`** — Run the full iterative TDD implementation phase-by-phase, creating stacked branches and PRs autonomously (or implement manually, checking off tasks as `[x]`)

6. **`/feature-status`** — Track progress; **`/feature-list`** — see all features at a glance

### Key Points

- **Spec before code** — Never code without a written spec
- **Constitution alignment** — All plans and tasks must respect [constitution.md](constitution.md)
- **Planning is comprehensive** — Cover all applicable planning areas in `plan.md`, explicitly marking any as "Not Applicable" rather than omitting them silently
- **Dedicated tracking repo** — like the sibling `server` project this workflow was adapted from, issues/milestones live in the centralized [financy-project/features](https://github.com/financy-project/features) repo, shared across `server`, `client`, and any future project in the org. Only `spec.md`/`plan.md`/`tasks.md` stay local, in `docs/features/` of this repo.

### Skills Reference

- `/commit` — Create atomic, semantic commits (source + test grouped together)
- `/grill-me` — Interactively clarify requirements across all 13 planning areas
- `/figma-fidelity` — Extract a full numeric Figma spec and map it to this repo's tokens/components before (or after) implementing a screen; invoked automatically by `/feature-plan` when `spec.md` links a Figma design
- `/feature-new`, `/feature-plan`, `/feature-task`, `/feature-status`, `/feature-list` — SDD workflow
- `/workflow` — Autonomous phase-by-phase stacked implementation
