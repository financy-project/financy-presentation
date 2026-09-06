---
name: grill-me
id: grill-me
version: 1.0.0
type: planning
---

# Skill: Grill Me

Ask probing questions about a feature to validate the plan and uncover edge cases.

## Usage

```bash
/grill-me
```

## What it does

Interactively asks clarifying questions about the current feature being planned, covering 13 areas organized into always-asked and optional groups.

## Always-Asked Areas (all features)

1. **Scope & Requirements**
   - What are the success criteria?
   - What is explicitly out of scope?
   - Any backward compatibility constraints?

2. **Data & State**
   - What new client-side state is introduced (component state, React Query keys)?
   - Which GraphQL entities does this read or mutate?
   - Data lifecycle in the Apollo cache (normalized fields, `typePolicies`, TTL)?

3. **User Experience**
   - What's the happy-path interaction?
   - What does the user see while loading, on error, and in the empty state?
   - Accessibility considered (keyboard, screen readers, focus management)?

4. **Testing & Validation**
   - Unit test strategy (Vitest + React Testing Library) for hooks/components?
   - Happy-path and sad-path test cases?
   - Any manual/E2E verification needed (no e2e runner set up yet — note if this feature is the one that needs it)?

5. **Implementation Details**
   - Which components/hooks/modules are involved?
   - Dependencies to add?
   - Existing components/hooks to reuse (check `src/components/ui/` first)?
   - **Does this add a new query or mutation? Does the response shape require a new type/interface?**
   - **Does a mutation need an optimistic response or manual cache update (`update`/`refetchQueries`)?**

6. **Security Considerations** ⚠️ (always asked)
   - Any data shown here that requires auth/permission checks?
   - Sensitive data ever logged to the console or sent to an analytics call?
   - Any user input rendered without escaping (XSS risk)?

7. **Cross-Cutting Concerns** ⚠️ (always asked)
   - Logging strategy (what, where — console only, or a monitoring service)?
   - Loading/error boundary strategy — component-local or a shared wrapper?
   - Does this need a toast/notification on success or failure?

8. **Error Scenarios & Failure Modes** ⚠️ (always asked)
   - What if the GraphQL request fails (network error vs. GraphQL error)?
   - What if the response is empty / has fewer fields than expected (nullable schema fields)?
   - Retry strategy — Apollo's built-in retry, or a manual "try again" button?
   - Race condition: what if the user navigates away or resubmits before a mutation resolves?

## Optional Areas (triggered by keywords in spec)

9. **Complex Workflows** (triggered if spec mentions: multi-step, wizard, async, long-running)
   - Is this multi-step or async?
   - Where does in-progress state live between steps (URL, local state, context)?
   - What happens if the user abandons the flow halfway?

10. **Performance & Scale** (triggered if spec mentions: bulk, list, infinite scroll, large dataset)
    - Expected list size — does it need pagination or `fetchMore`?
    - Any expensive re-renders to guard against (`useMemo`/`useCallback`, list virtualization)?
    - Caching strategy for repeated queries (`fetchPolicy`)?

11. **Module Composition** (triggered if spec spans multiple components or shared state)
    - Should this be one component or several?
    - Shared state via props, context, or a query cache lookup?
    - Clear component boundaries and prop contracts?

12. **Deployment & Operations** ⚠️ (always asked)
    - Any new environment variable needed (`VITE_*`)?
    - Feature flag or gradual rollout needed?
    - Anything to verify manually after deploy (since there's no e2e suite yet)?

13. **Backward Compatibility** (triggered if spec touches an existing component's props or a shared GraphQL fragment)
    - Breaking changes to a shared component's public props?
    - Existing callers of the changed component/hook to update?

## Output

- Comprehensive list of answered questions
- Identified gaps or assumptions
- Action items to clarify before coding

## Example

```
/grill-me
? Feature name: Transaction List Filters
? Success criteria: Users can filter the transaction list by category and date range
? Does this add a new query? → yes, `GET_TRANSACTIONS` gains `category` and `dateRange` args
? Does a mutation need an optimistic response? → n/a, read-only feature
? What does the user see while loading? → skeleton rows in the existing table, no full-page spinner
...
```
