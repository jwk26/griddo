## Phase 6.5: DataStore Facade Migration

> **Purpose:** Eliminate all remaining direct `indexedDBStore` imports outside `src/lib/db/indexeddb.ts`. Phase 6 enforced the facade for all new code; this phase retrofits the 11 pre-existing files from earlier phases.

### Task 30.5: Migrate Pre-Existing Files to DataStore Facade
- **Status:** `[x]`
- **Files (hooks — read path):** `src/hooks/use-bit-detail.ts`, `src/hooks/use-grid-data.ts`, `src/hooks/use-search.ts`, `src/hooks/use-node-urgency.ts`
- **Files (components — write path):** `src/components/grid/edit-node-dialog.tsx`, `src/components/layout/breadcrumbs.tsx`, `src/components/layout/level-0-shell.tsx`, `src/components/bit-detail/chunk-timeline.tsx`, `src/components/bit-detail/bit-detail-popup.tsx`, `src/components/bit-detail/chunk-pool.tsx`, `src/app/grid/[nodeId]/_components/node-grid-shell.tsx`
- **Dependencies:** Phase 6 (established `getDataStore()` pattern and `useCalendarActions` hook pattern)
- **Actions:**
  - **Hooks (read path):** Replace `indexedDBStore` imports with `getDataStore()` inside `liveQuery` callbacks. Pattern established in `use-calendar-data.ts` and `use-global-urgency.ts`
  - **Components (write path):** Extract mutation calls into dedicated hooks (e.g., `useGridActions`, `useBitDetailActions`) following the `useCalendarActions` pattern. Components import hooks only, not DataStore
  - **Test files:** Update mocks from `indexedDBStore` to the new hook/facade pattern. Affected: `breadcrumbs.test.tsx`, `node-grid-shell.test.tsx`, `chunk-pool.test.tsx`
  - **Verification:** `grep -r "indexedDBStore" src/ --include="*.ts" --include="*.tsx"` should return only `src/lib/db/indexeddb.ts` (the implementation) and `src/lib/db/datastore.ts` (the lazy loader)
- **Acceptance:** Zero `indexedDBStore` imports outside `indexeddb.ts` and `datastore.ts`. All architecture conformance blocking checks pass. Build + test green
- **Commit:** `refactor: complete DataStore facade migration — remove all direct indexedDBStore imports`

#### Phase 6.5 Notes

> **Boundary enforcement is two-layered:** Eliminating `indexedDBStore` imports is necessary but not sufficient. Two components (`breadcrumbs.tsx`, `node-grid-shell.tsx`) still violated the "components import hooks only" rule via `getDataStore()` after the initial Codex pass. Full conformance required a second extraction round creating `useNode` and `useBreadcrumbChain`.

> **Action hook scope:** Each action hook maps to one component's write surface. Don't merge unrelated mutations into a single hook for "convenience" — `useChunkActions`, `useBitDetailActions`, `useNodeActions`, `useGridActions` each have clear ownership.

> **Test mock strategy:** After hook extraction, component tests mock at the hook boundary (not `indexeddb` or `datastore`). The chain-walking logic in `useBreadcrumbChain` is no longer tested at the component level — if needed, add a dedicated hook unit test in a future phase.

> **Full issue log:** `docs/issues/Issues_Phase_6.5.md`

---

