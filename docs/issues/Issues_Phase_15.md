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

### ISSUE-15-01 — Dexie v3 migration: no runtime-verification path; plan cited a non-existent route

- **Status:** Open (runtime-verification method undecided)
- **Category:** plan-vs-reality / acceptance-criteria accuracy + test-coverage gap
- **Detail:** EXECUTION_PLAN T69 acceptance (line 103) said *"verify via `src/app/debug-indexeddb`"*, and T74 (line 183, Phase 16) carries the same reference. That route does not exist — `debug-indexeddb` appears only in `EXECUTION_PLAN.md` and the 2026-06-04 storage-reliability brainstorming docs. Separately, the Dexie `version(3).upgrade()` backfill is unreachable by the in-memory `FakeTable` test harness, so it has no automated coverage.
- **Disposition:** T69 acceptance (line 103) reworded to remove the route and point here (**Reflected**). T74's reference left explicitly **Tagged** for Phase 16 (not edited from the Phase 15 branch). The backfill *code* is statically reviewed + `pnpm test`/`build` green; a method to verify the backfill against real existing IndexedDB data — ① add `fake-indexeddb` for a real-Dexie test, ② a debug/inspection route as its own task, or ③ a one-time manual check recorded at closing — is **deferred: decide at T70 or closing.**

---

## Phase-local Question Resolution

| # | Question | Resolution | Canonical Impact | Status |
|---|----------|------------|------------------|--------|
| 1 | T68 acceptance said `createNodeSchema.parse()` "rejects" system-managed fields; Zod without `.strict()` **strips** (no throw) | EXECUTION_PLAN T68 acceptance (line 91) reworded to "strips … from parsed output"; tests assert the fields are absent | EXECUTION_PLAN T68 acceptance wording | **Reflected** |
| 2 | T69 acceptance cited the non-existent `src/app/debug-indexeddb` route as the verification method (ISSUE-15-01) | EXECUTION_PLAN T69 acceptance (line 103) reworded: route removed, runtime backfill verification pointed to ISSUE-15-01 | EXECUTION_PLAN T69 acceptance wording | **Reflected** |
| 3 | T74 (Phase 16) acceptance also cites `debug-indexeddb` (line 183) | Left explicitly **Tagged** — Phase 16 task, not edited from the Phase 15 branch; correct when Phase 16 is planned/executed | EXECUTION_PLAN T74 acceptance wording | **Tagged** |
| 4 | Should `DatabaseLike` gain a required `scratchBreakdowns` member in Batch A? | Deferred to T70 to avoid growing every `FakeTable` test fixture before any code references the table | None (internal scope decision) | None |
