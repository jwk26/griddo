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
| Batch B | T70 | Pending |
| Batch C | T71 | Pending |
| Batch D | T72 | Pending |

### Deviations

None. The 4-batch structure was the initial user-approved plan (decided before the Original Proposal was written), not a mid-phase deviation.

> Process note: this `## Batch Plan` section was created at the Batch A checkpoint (Step 9), not at Step 4 of the first batch as the Batch Plan Contract prescribes. The durable record exists before Batch B starts, so continuity intent is satisfied. Logged in `docs/reviews/phase-15-skill-audit.md` (A9).

---

## Execution Log

### Batch A — T68 + T69 execution notes

- **Codex output spec-faithful — no quality-pass edits.** All three expected files (`schema.ts`, `indexeddb.ts`, `schema.test.ts`) written directly to the working tree; spec compliance verified (fields, omits, `scratchBreakdownSchema`, `version(3)` index strings carrying forward existing indexes, backfill `upgrade`). No naming/dead-code/scope issues to refine.
- **Reviewer subagents skipped (Step 7b).** Additive/non-destructive schema+migration, spec-faithful, backfill statically reviewed, `pnpm test`/`pnpm build` green. The only residual risk (real Dexie `upgrade()` runtime backfill on existing IndexedDB data) is a runtime concern unreachable by a code-reading reviewer — so no subagent trigger meaningfully applies.
- **D1 backfill — load-bearing.** The `version(3).upgrade()` backfills `archivedAt`/`systemRole`/`hiddenFromGrid` (nodes) and `archivedAt` (bits). Required because reads are trusted (no Zod on read): an `undefined` `archivedAt` would (a) make `=== null` active checks false → row treated as archived, and (b) be excluded from the new `[parentId+deletedAt+archivedAt]` compound index by Dexie.

### Open items (carried to checkpoint / closing)

- **Runtime migration verification method undecided.** The Dexie `version(3).upgrade()` is not unit-testable under the current in-memory `FakeTable` test harness, and there is no debug/inspection route in the repo. Batch A verified the upgrade *code* statically + via `pnpm test`/`pnpm build`. A method to verify the backfill against real existing IndexedDB data (a debug route, or a real-Dexie test harness) is deferred — decide at checkpoint/closing.

---

## Issues

### ISSUE-15-01 — Plan acceptance references a non-existent `debug-indexeddb` route

- **Status:** Open (canonical wording correction deferred to closing)
- **Category:** plan-vs-reality / acceptance-criteria accuracy
- **Detail:** EXECUTION_PLAN T69 acceptance says *"verify via `src/app/debug-indexeddb`"*; T68 and T74 carry similar references. That route does not exist in the repo — `debug-indexeddb` appears only in `EXECUTION_PLAN.md` and the 2026-06-04 storage-reliability brainstorming docs.
- **Disposition:** Removed from the Batch A prompt/acceptance; runtime-verification method deferred (see Open items). EXECUTION_PLAN T68/T69/T74 acceptance wording should be corrected at closing.

---

## Phase-local Question Resolution

| # | Question | Resolution | Canonical Impact | Status |
|---|----------|------------|------------------|--------|
| 1 | T68 acceptance says `createNodeSchema.parse()` "rejects" system-managed fields; Zod without `.strict()` **strips** (no throw) | Implemented strip semantics (matches existing schema convention); tests assert the fields are absent from parsed output | EXECUTION_PLAN T68 acceptance wording ("rejects" → "strips") | Tagged |
| 2 | T68/T69/T74 acceptance cite `src/app/debug-indexeddb`, which does not exist (ISSUE-15-01) | Removed from Batch A acceptance; runtime-verification method deferred to checkpoint/closing | EXECUTION_PLAN T68/T69/T74 acceptance wording | Tagged |
| 3 | Should `DatabaseLike` gain a required `scratchBreakdowns` member in Batch A? | Deferred to T70 to avoid growing every `FakeTable` test fixture before any code references the table | None (internal scope decision) | None |
