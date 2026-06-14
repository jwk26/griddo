# Issues — Phase 16: Quick Capture

## Carryover from Phase 15

### ISSUE-15-01 (carried) — Dexie v3 migration: no automated runtime-verification path

- **Status:** Open (carried from Phase 15)
- **Category:** test-coverage gap / acceptance-criteria accuracy
- **Detail:** The Dexie `version(3).upgrade()` backfill path (T69) has no automated test: the `FakeTable` in-memory harness cannot exercise a real Dexie upgrade transaction. Phase 15 deferred this explicitly to Phase 16 with the resolution: add a `fake-indexeddb`-based real-Dexie migration test. This is a **separate concern** from T74 (Scratch modal behavior) — they happen to share the `fake-indexeddb` tool, but their verification targets are unrelated.
- **Resolution target:** A standalone migration test (`src/lib/db/migration.test.ts` or similar) that boots a real Dexie instance against `fake-indexeddb`, seeds v2-schema rows, runs the upgrade, and asserts the backfill results. Must not be collapsed into T74's Scratch Bit creation test.
- **Disposition:** Carried per Phase 15 explicit deferral. Resolve before Phase 16 close.

---

## Batch Plan

### Original Proposal

| Batch | Tasks | Classification |
|-------|-------|----------------|
| Batch 1 | T73, T76 | ui-heavy |
| Batch 2 | T74 | mixed |
| Batch 3 | T75 | ui-heavy |

### Execution Status

| Batch | Tasks | Status |
|-------|-------|--------|
| Batch 1 | T73, T76 | Complete (approved + committed) |
| Batch 2 | T74 | Implemented |
| Batch 3 | T75 | Pending |

### Deviations

- **Batch 1 trigger ownership: A → B.** The original prompt had Sidebar read the quick-capture store directly. Resolved at prompt preview to **B (prop boundary)**: Sidebar stays a dumb trigger (`isAddActive` prop), GridRuntime is the single owner of overlay state. See skill-audit A6/C8.
- **Batch 1 `handleBitSubmit` guard refine.** The prompt simplified the parent-existence guard, weakening the `/grid/[missing-node]` defense. Restored in Step 6 (`if (nodeId !== null && !node)`) + regression test. See ISSUE-16-01 and skill-audit A8/C10.
- **Batch 2 Codex B test B5 rejected.** Codex B's "always uses Inbox regardless of context" test passed a second `context` argument `{ nodeId, parentId }` to `createScratchBit`. The actual implementation signature is `(title: string)` — 1-arg only. The test would cause a TypeScript compile error. Rejected; the intent (inbox always used) is already covered by Codex A's payload test. One valuable test adopted from Codex B: `inboxNodeId === undefined` state assertion (B's A2), added to `use-inbox.test.tsx`.
- **Batch 2 Codex B Hook 8 tests superseded.** Codex B produced `indexeddb.scratch-inbox.test.ts` (3 tests: sentinel exempt, non-inbox enforced, sentinel exact). Codex A's `grid-uniqueness.test.ts` covers all 3 plus 3 general-uniqueness tests. Codex B file not written to working tree.

---

## Phase 16 Issues

### ISSUE-16-01 — Bit-creation parent-existence guard weakened (regression, resolved)

- **Status:** Resolved (this session, Batch 1 Step 6 refine)
- **Category:** regression / prompt-design
- **Detail:** Implementing T76 (L0 Bit creation via dialog parent selector), the `handleBitSubmit` guard was simplified from `if (!nodeId || !node)` to `if (!effectiveParentId)`. This dropped the UI-layer check that a `/grid/[nodeId]` parent node actually exists — `/grid/[missing-node]` would proceed to `getGridOccupancy`/`createBit` (DataStore would still throw `Node not found`, but the early UI defense was lost). Root cause was the Codex prompt spec (Claude-side), not the Codex implementation.
- **Resolution:** Restored `if (nodeId !== null && !node) setError("Unable to find parent node.")` ahead of the `effectiveParentId` check, preserving L0 (`nodeId === null`) Bit creation. Added a regression test in `grid-runtime.test.tsx` (`/grid/missing-node` + `useNode` null → no `createBit`, error surfaced).
- **Verification:** targeted tests 3 files / 21 passed; full suite 260 passed; build green.
