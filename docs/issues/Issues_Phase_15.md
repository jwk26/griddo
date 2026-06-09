# Issues — Phase 15: Lifecycle Schema Foundation

## Batch Plan

### Original Proposal

| Batch | Tasks | Classification | Scope |
|-------|-------|----------------|-------|
| Batch A | T68 + T69 | logic-heavy | Lifecycle schema fields + Zod (`archivedAt`/`systemRole`/`hiddenFromGrid`, `scratchBreakdownSchema`) and Dexie `version(3)` migration (new indexes, `scratchBreakdowns` store, backfill upgrade) |
| Batch B | T70 | logic-heavy (behavior-heavy) | DataStore archive/restore cascade (Hooks 10/11) + `scratchBreakdowns` CRUD — isolated for independent verification; parallel test authoring candidate |
| Batch C | T71 | logic-heavy | Active-item archive sweep across hooks/utils — highest omission risk (flow-review D3), isolated for focused review |
| Batch D | T72 | logic-heavy | Default system node seeding (Inbox + Archive View) — idempotency, internal full-`nodeSchema` path |

> Batch structure = the user-approved 4-batch plan (Option 2). Rationale: T70 (archive behavior), T71 (archive-query sweep), and T72 (system seeding) have different failure modes, so each gets an isolated checkpoint; T71 carries the highest omission risk and is isolated. One extra checkpoint is justified because Phase 15 is foundation.

### Execution Status

| Batch | Tasks | Status |
|-------|-------|--------|
| Batch A | T68 + T69 | Implemented |
| Batch B | T70 | Implemented |
| Batch C | T71 | Implemented |
| Batch D | T72 | Implemented |

### Deviations

None. The 4-batch structure was the initial user-approved plan (decided before the Original Proposal was written), not a mid-phase deviation.

> Process note: this `## Batch Plan` section was created at the Batch A checkpoint (Step 9), not at Step 4 of the first batch as the Batch Plan Contract prescribes. The durable record exists before Batch B starts, so continuity intent is satisfied. Logged in `docs/reviews/phase-15-skill-audit.md` (A9).

---

## Execution Log

### Batch A — T68 + T69 execution notes

- **Codex output spec-faithful — no quality-pass edits.** All three expected files (`schema.ts`, `indexeddb.ts`, `schema.test.ts`) written directly to the working tree; spec compliance verified (fields, omits, `scratchBreakdownSchema`, `version(3)` index strings carrying forward existing indexes, backfill `upgrade`). No naming/dead-code/scope issues to refine.
- **Reviewer subagents skipped (Step 7b).** Additive/non-destructive schema+migration, spec-faithful, backfill statically reviewed, `pnpm test`/`pnpm build` green. The only residual risk (real Dexie `upgrade()` runtime backfill on existing IndexedDB data) is a runtime concern unreachable by a code-reading reviewer — so no subagent trigger meaningfully applies.
- **D1 backfill — load-bearing.** The `version(3).upgrade()` backfills `archivedAt`/`systemRole`/`hiddenFromGrid` (nodes) and `archivedAt` (bits). Required because reads are trusted (no Zod on read): an `undefined` `archivedAt` would (a) make `=== null` active checks false → row treated as archived, and (b) be excluded from the new `[parentId+deletedAt+archivedAt]` compound index by Dexie.

### Batch B — T70 execution notes

- (Notes recorded at Batch B checkpoint — see commit b0d3837.)

### Batch C — T71 execution notes

- **Codex output spec-faithful — no quality-pass edits.** All 5 expected files written directly to the working tree: `indexeddb.ts` (14 changes, 11 methods A–N), `use-calendar-data.ts`, `use-global-urgency.ts`, `use-node-urgency.ts`, and new `archive-sweep.test.ts` (13 test cases).
- **Codex also updated 7 existing test files** (`indexeddb.test.ts`, `archive-sweep.test.ts`-adjacent fixtures, `cascade-restore.test.ts`, `deadline-hierarchy.test.ts`, `grid-uniqueness.test.ts`, `indexeddb.migration.test.ts`, `mtime-cascade.test.ts`, `use-calendar-data.test.ts`) to backfill `archivedAt: null` in FakeTable factory boilerplate. Required: active queries now assert `archivedAt === null`, so fixtures missing the field would be treated as archived and break existing tests.
- **Two auditor corrections applied pre-launch:** (1) TableLike description corrected — `filter()`, `count()`, `add()` do not exist on `TableLike`; description now lists only the 6 actual methods. (2) `runBreadcrumbZoneMigration()` (Change K) node filter extended to include `!(parentId === null && node.hiddenFromGrid)` — hiddenFromGrid nodes at L0 must not appear in the relocation target list.
- **HARD constraints verified via `git diff`:** `archiveNode`/`unarchiveBit`/`unarchiveNode`/`archiveBit` and all trash-restore semantics unchanged. Lines with `archivedAt === null` in those methods (L617-618, L692-693) were already present from Batch B.
- **Completeness check clean:** `rg "deletedAt === null"` across `indexeddb.ts`, `src/hooks`, `src/lib/utils` — all bare `deletedAt === null` hits are (a) trash-semantics guards (`if (refreshedNode.deletedAt === null) { return; }` etc.) or (b) multi-line filters with `archivedAt === null` on the continuation line. Zero missed (c) hits.
- **`pnpm test` green:** 52 test files, 242 tests passed (Batch B baseline: 51 files, 229 tests; delta = +1 file, +13 tests — archive-sweep.test.ts exact match).
- **Reviewer subagents skipped (Step 7b).** Mechanical sweep with explicit before/after for each change site; spec-faithful; test coverage independent via 13 new cases; blast radius limited to filter predicates (no structural changes). No trigger threshold met.

### Batch D — T72 execution notes

- **Codex output spec-faithful — no quality-pass edits.** All 5 expected files written directly to the working tree: `datastore.ts` (interface), `indexeddb.ts` (`ensureSystemNodes()` implementation), `use-system-node-seeding.ts` (new hook), `providers.tsx` (wiring), and new `system-nodes.test.ts` (13 test cases).
- **Codex introduced `SYSTEM_NODE_ROLES` / `SYSTEM_NODE_SEEDS` constants** at the top of `indexeddb.ts` rather than inlining seed values — clean extensible pattern, not requested explicitly in the prompt.
- **Dual timestamp variables correct:** `seedTimestamp` (used for `createdAt`/`mtime` of new Case A nodes) and `timestamp` (used for `mtime` in Case B normalization writes) are defined separately, which is correct — created-at semantics differ from normalization-time semantics.
- **HARD constraints verified via `git diff`:** `archiveNode`/`unarchiveBit`/`unarchiveNode`/`archiveBit`, all trash-restore semantics, `scratchBreakdowns` CRUD, `schema.ts` unchanged.
- **`pnpm test` green:** 53 test files, 255 tests passed (Batch C baseline: 52 files, 242 tests; delta = +1 file, +13 tests — system-nodes.test.ts exact match).
- **`pnpm build` green:** TypeScript clean, all 7 routes compile.
- **Reviewer subagents skipped (Step 7b).** Mechanical seeding with explicit per-step algorithm; idempotency and no-partial-write enforced by pre-plan + single `write()` call; 13 test cases cover all invariants including GRID_FULL and drift normalization. No trigger threshold met.

### Open items (carried to checkpoint / closing)

- **Runtime migration verification method undecided.** The Dexie `version(3).upgrade()` is not unit-testable under the current in-memory `FakeTable` test harness, and there is no debug/inspection route in the repo. Batch A verified the upgrade *code* statically + via `pnpm test`/`pnpm build`. A method to verify the backfill against real existing IndexedDB data (a debug route, or a real-Dexie test harness) is deferred — decide at checkpoint/closing.

---

## Issues

### ISSUE-15-01 — Dexie v3 migration: no runtime-verification path; plan cited a non-existent route

- **Status:** Open (runtime-verification method undecided)
- **Category:** plan-vs-reality / acceptance-criteria accuracy + test-coverage gap
- **Detail:** EXECUTION_PLAN T69 acceptance (line 103) said *"verify via `src/app/debug-indexeddb`"*, and T74 (line 183, Phase 16) carries the same reference. That route does not exist — `debug-indexeddb` appears only in `EXECUTION_PLAN.md` and the 2026-06-04 storage-reliability brainstorming docs. Separately, the Dexie `version(3).upgrade()` backfill is unreachable by the in-memory `FakeTable` test harness, so it has no automated coverage.
- **Disposition:** T69 acceptance (line 103) reworded to remove the route and point here (**Reflected**). T74's reference left explicitly **Tagged** for Phase 16 (not edited from the Phase 15 branch). The backfill *code* is statically reviewed + `pnpm test`/`build` green; a method to verify the backfill against real existing IndexedDB data — ① add `fake-indexeddb` for a real-Dexie test, ② a debug/inspection route as its own task, or ③ a one-time manual check recorded at closing — is **deferred: decide at T70 or closing.**

### ISSUE-15-02 — Codex B parallel test authoring: 1st run no-artifact, 2nd run delayed

- **Status:** Open (resolved in practice — Claude-written tests landed and verified; Codex B artifact later compared, no additional coverage)
- **Category:** tooling / parallel-test-authoring workflow
- **Detail:** `omc ask codex` was launched twice for blind test authoring (Batch B). First run (ba6ixezvb) stalled with no artifact for >30 min and was eventually terminated (no output ever produced). Second run / re-request (bns2yulzs) was delayed but did arrive (~50 min after launch).
- **Disposition:** Rather than block, Claude wrote `archive.test.ts` and `scratch-breakdowns.test.ts` directly from the same 9-invariant spec; tests are spec-faithful but not strictly blind (Claude had reviewed Codex A's implementation). When the 2nd Codex B artifact arrived it was compared against Claude's tests — the proposed cases matched 1:1, **no additional invariants were adopted from it.** Note: neither the pre-written 9-invariant list nor the Codex B output independently caught the `unarchiveNode` parent-child consistency gap (ISSUE-15-03); that surfaced only from the Codex implementation review. Logged as a skill-audit candidate: (a) `omc ask codex` timeout/no-artifact handling, and (b) parallel-test-authoring should compare invariant parity against the nearest reference implementation, not just follow a fixed pre-written list.

### ISSUE-15-03 — `unarchiveNode` restored Bits without confirming their parent Node was restored

- **Status:** Resolved (fixed in Batch B before checkpoint)
- **Category:** logic defect / data-layer invariant (parent-child consistency)
- **Detail:** Codex A's first `unarchiveNode` implementation filtered restorable Bits by `subtreeIdSet.has(bit.parentId) && bit.archivedAt !== null && isWithinRestoreWindow(...)` — but omitted the parent-restoration guard that the sibling trash `restoreNode` already carries. A Bit whose `archivedAt` falls inside the ±5s restore window could therefore be un-archived even when its parent Node is outside the window and stays archived, yielding an **archived-Node-with-active-Bit** state. Surfaced by the Codex implementation review (not by the pre-written test invariants nor Codex B). No public-API call sequence was found that reaches this state today (archive cascade re-stamps a subtree to one uniform timestamp, and every unarchive path handles the parent chain first), but this is treated as a **data-layer invariant preservation** issue, not mere defensive code: IndexedDB rows can leave "normal-API-only" states via migration, manual debug, future Phase 19 direct-archive UI, external bugs, or partial writes.
- **Disposition:** `unarchiveNode` now tracks a `restorableNodeIds` set (already-active Nodes + Nodes restored this pass) and the Bit filter requires `restorableNodeIds.has(bit.parentId)` — mirroring trash `restoreNode` and completing the Hook 11 intent for archive restore. Regression test added to `archive.test.ts` ("does not restore a Bit whose parent Node stays archived (outside restore window)"). `pnpm test`/`build` re-run green. This is a completion of the existing pattern, **not a new design.**

---

## Phase-local Question Resolution

| # | Question | Resolution | Canonical Impact | Status |
|---|----------|------------|------------------|--------|
| 1 | T68 acceptance said `createNodeSchema.parse()` "rejects" system-managed fields; Zod without `.strict()` **strips** (no throw) | EXECUTION_PLAN T68 acceptance (line 91) reworded to "strips … from parsed output"; tests assert the fields are absent | EXECUTION_PLAN T68 acceptance wording | **Reflected** |
| 2 | T69 acceptance cited the non-existent `src/app/debug-indexeddb` route as the verification method (ISSUE-15-01) | EXECUTION_PLAN T69 acceptance (line 103) reworded: route removed, runtime backfill verification pointed to ISSUE-15-01 | EXECUTION_PLAN T69 acceptance wording | **Reflected** |
| 3 | T74 (Phase 16) acceptance also cites `debug-indexeddb` (line 183) | Left explicitly **Tagged** — Phase 16 task, not edited from the Phase 15 branch; correct when Phase 16 is planned/executed | EXECUTION_PLAN T74 acceptance wording | **Tagged** |
| 4 | Should `DatabaseLike` gain a required `scratchBreakdowns` member in Batch A? | Deferred to T70 to avoid growing every `FakeTable` test fixture before any code references the table | None (internal scope decision) | None |
| 5 | T70 Hook 11 wording says `restoreNode`/`restoreBit`, which collide with the existing trash-restore API of the same name | Batch B implements archive restore as `unarchiveNode`/`unarchiveBit`; EXECUTION_PLAN T70 (line 113) reworded to match | EXECUTION_PLAN T70 acceptance wording | **Reflected** |
| 6 | The same `restoreNode`/`restoreBit` naming appears in **Phase 19** Task 87 (Single-item restore) / Task 88 (Direct archive references `archiveNode`/`archiveBit`) | Future-phase canonical impact of the T70 rename; **not edited from the Phase 15 branch.** Reconcile to `unarchiveNode`/`unarchiveBit` when Phase 19 is planned/executed | EXECUTION_PLAN Task 87 wording (Phase 19) | **Tagged** |
| 7 | Can the compound index `[parentId+deletedAt+archivedAt]` (added in T69) be used for T71 active-item queries via `.where()`? | No — `DatabaseLike`/`TableLike<T>` exposes only `get()`, `put()`, `bulkPut()`, `delete()`, `bulkDelete()`, `toArray()`; no `.where()`. The compound index benefits Dexie's internal storage/query optimization but is not programmatically accessible through the abstraction. All T71 queries use `toArray() + JS filter`, consistent with the rest of the codebase. | None (internal implementation detail) | **Explicitly Deferred** (won't pursue — toArray+filter is the codebase-wide pattern) |
| 8 | T72 "offer to recreate" — SCHEMA.md says *"If no Node with a required `systemRole` exists, the system offers to recreate it."* Phase 15 is data-layer only, no UI. How should "offer" be interpreted? | Phase 15 = **silent idempotent auto-recreate**. `ensureSystemNodes()` checks each `systemRole` on every startup and creates the missing node if absent. No toast, dialog, or user confirmation. The visual "offer" UX (sidebar prompt, confirmation) is a Phase 17+ concern when the sidebar is implemented. | None — EXECUTION_PLAN T72 "offer to recreate" wording is intentionally data-layer-agnostic; this entry is the Phase 15 interpretation record. | **Reflected** |
