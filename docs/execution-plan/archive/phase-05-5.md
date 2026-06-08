## Phase 5.5: DataStore Facade Cleanup

> **Origin:** Architecture Conformance Review — Phase 5 close-out (2026-03-28).
> `use-node-urgency.ts` and `use-global-urgency.ts` bypass the DataStore facade by importing `{ db }` directly and calling Dexie table methods inside `liveQuery`. The established pattern (confirmed in `use-grid-data.ts`) is `liveQuery(() => indexedDBStore.someMethod())`. The facade must be consistent across all reactive hooks.

### Task 25.5: DataStore Read Methods + Urgency Hook Refactor
- **Status:** `[x]`
- **Files:** `src/lib/db/datastore.ts` (update), `src/lib/db/indexeddb.ts` (update), `src/hooks/use-node-urgency.ts` (update), `src/hooks/use-global-urgency.ts` (update)
- **Dependencies:** Task 24 (use-node-urgency, use-global-urgency)
- **Actions:**
  - `datastore.ts`: Add two read methods to the `DataStore` interface:
    - `getBitsForNode(nodeId: string): Promise<Bit[]>` — returns all non-deleted Bits with `parentId === nodeId`
    - `getAllActiveBits(): Promise<Bit[]>` — returns all non-deleted Bits across the project
  - `indexeddb.ts`: Implement both methods in `IndexedDBDataStore`
  - `use-node-urgency.ts`: Replace `db.bits.where("parentId").equals(nodeId).toArray()` with `indexedDBStore.getBitsForNode(nodeId)` inside `liveQuery`. Remove `import { db }` — use `indexedDBStore` only
  - `use-global-urgency.ts`: Replace direct db query with `indexedDBStore.getAllActiveBits()` inside `liveQuery`. Remove `import { db }`
  - Grep for any remaining `import { db }` in hooks or components — fix any found
- **Acceptance:**
  - No hook or component imports `{ db }` from `indexeddb.ts`
  - `liveQuery` in all hooks calls `indexedDBStore` methods, not raw Dexie table methods
  - Architecture Conformance — Blocking (DataStore facade) passes cleanly
  - `pnpm test && pnpm build` pass
- **Commit:** `refactor: DataStore facade — add read methods, remove direct db access from urgency hooks`

#### Phase 5.5 Notes

> **vi.hoisted() for mocks:** Variables used inside a `vi.mock()` factory must be declared with `vi.hoisted()`, not `const`. `vi.mock` is hoisted to the top of the file; a plain `const` is initialized after the factory runs, causing a ReferenceError at test time. Pattern: `const myMock = vi.hoisted(() => vi.fn(...))`.

> **eslint-disable exhaustive-deps placement:** The `react-hooks/exhaustive-deps` disable comment must go on the line immediately before the closing `}, [deps])` of the useEffect — not inside the effect body. Placing it on a line inside the body (e.g., before a setState call) silences a nonexistent rule and leaves the actual warning unfixed.

> **Full issue log:** `docs/issues/Issues_Phase_5.5.md`

---

