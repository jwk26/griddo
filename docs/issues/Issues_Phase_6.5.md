# Issues — Phase 6.5

## Issue 1: Acceptance criteria understated the boundary violation

- **Problem:** The task's acceptance criterion was "Zero `indexedDBStore` imports outside `indexeddb.ts` and `datastore.ts`." The initial Codex pass satisfied this check exactly — but two components (`breadcrumbs.tsx`, `node-grid-shell.tsx`) still imported `getDataStore` directly for their read paths. This satisfied the grep check while violating the "components import hooks only, not DataStore" architecture rule.
- **Root Cause:** The acceptance criterion was written around the surface symptom (direct `indexedDBStore` imports) rather than the full architecture boundary. The boundary rule in PLANNING_STANDARD.md is broader: components must not import from DataStore at all.
- **Solution:** Second cleanup pass created `useNode` and `useBreadcrumbChain` hooks; updated components and test mocks to use the new hooks. Verified with `grep -r 'from "@/lib/db/datastore"' src/**/*.tsx` returning zero results.
- **Learning:** When writing acceptance criteria for facade/boundary migrations, also include a negative check on the facade itself: "No component imports `getDataStore` directly." Grep for both `indexedDBStore` and `getDataStore` in `.tsx` files.

## Issue 2: Codex prompt only specified `indexedDBStore` elimination

- **Problem:** The Codex prompt correctly described both hook patterns (read path: `getDataStore()` inside liveQuery; write path: action hooks), but for breadcrumbs and node-grid-shell it instructed Codex to add `getDataStore` to the component directly rather than extract into a hook. This was technically consistent with the prompt but violated the stricter interpretation of the architecture rule.
- **Root Cause:** The prompt's instruction for breadcrumbs said "make the liveQuery callback async, add `getDataStore()`" — which put `getDataStore` in the component rather than moving it to a hook.
- **Solution:** Extracted `useBreadcrumbChain(nodeId): Node[]` and `useNode(nodeId): Node | null` as reactive hooks following the same liveQuery pattern as existing hooks.
- **Learning:** For future migration phases, the Codex prompt should include: "After migration, no component file (`.tsx`) may import `getDataStore` directly. If a read path is currently in a component, extract it to a dedicated hook first."

## Issue 3: Test mock strategy changes when hook boundary moves

- **Problem:** After extracting `useBreadcrumbChain`, the existing `breadcrumbs.test.tsx` mocked `dexie` (liveQuery) and `@/lib/db/datastore` (getDataStore) to simulate the chain walking. These mocks became obsolete once the chain walking moved into the hook.
- **Root Cause:** When a component's internal data-fetching logic is extracted into a hook, the component test's mock target changes from the underlying infrastructure to the hook itself.
- **Solution:** Replaced dexie and datastore mocks with a direct `useBreadcrumbChain` mock returning the chain synchronously. Test became simpler — no async `waitFor` needed since the mock is synchronous.
- **Learning:** Chain-walking logic in `useBreadcrumbChain` is now untested at the component level. If coverage is needed, add `use-breadcrumb-chain.test.ts` in a future phase (similar to existing `use-global-urgency` or `use-node-urgency` test patterns).

## Summary

| # | Issue | Resolution |
|---|-------|------------|
| 1 | Acceptance criteria only checked `indexedDBStore`, missed `getDataStore` in components | Added second cleanup pass; verify `.tsx` files have zero DataStore imports |
| 2 | Codex prompt left `getDataStore` in breadcrumbs/node-grid-shell components | Extracted `useNode` and `useBreadcrumbChain` hooks |
| 3 | Test mocks became stale after hook extraction | Updated tests to mock at hook boundary, not infrastructure |
