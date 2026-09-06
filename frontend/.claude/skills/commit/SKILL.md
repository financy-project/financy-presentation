# Skill: Semantic & Atomic Commit

**ID**: commit

**Version**: 1.0.0

**Type**: utility

**Applicable Packages**: all

## Description

Creates semantic, atomic commits that keep source files and their tests together.

Workflow:

1. Detects changed files via `git diff --name-only`
2. Groups source files with their corresponding tests
3. Stages grouped files together
4. Prompts user for commit type (feat, fix, test, refactor, docs, chore, perf, style)
5. Creates commit with semantic message: `<type>(<scope>): <subject>`

## Usage

```bash
# After making changes to code and tests
python .claude/skills/commit/commit.py
```

## Behavior

**Example scenario:**

You modified:

- `src/components/transaction-filters.tsx`
- `src/components/__tests__/transaction-filters.test.tsx`
- `src/lib/utils.ts`
- `src/lib/__tests__/utils.test.ts`

Skill will:

1. Detect 4 changed files
2. Group into 2 atomic units:
   - `transaction-filters.tsx` + its test
   - `utils.ts` + its test
3. For each group, ask: "Commit type? (feat/fix/test/refactor/docs/chore/perf/style)"
4. Create two commits:
   - `feat(components): add transaction-filters component`
   - `refactor(lib): improve cn() merge behavior`

Scope is inferred from the file path — falls back to the top-level folder under `src/` (`components`, `lib`, `graphql`, `providers`, etc.).

## Exit Codes

- `0`: Success - all commits created
- `1`: Git error or commit failed
- `2`: No changes to commit
- `3`: User cancelled

## Environment Variables

- `WORKSPACE_ROOT` (optional): Root directory for git operations
