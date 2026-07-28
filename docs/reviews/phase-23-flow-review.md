# Flow-Trace Review — Phase 23: Inbox / Triage Persistence & Atomic Command Foundation

> **Historical / superseded review.** This file reviewed the retired pre-Fresh
> Phase 23 plan and must not be used as current canonical or conformance
> evidence. In particular, its unversioned-Node and old Task 101–105 ownership
> statements conflict with the approved SCHEMA and the completed clean plan.
> Current planning-flow authority is
> [`inbox-triage-promotion-flow-review.md`](inbox-triage-promotion-flow-review.md);
> completion-time Phase 23 conformance is recorded in
> [`Issues_Phase_23.md#phase-23-close-audit`](../issues/Issues_Phase_23.md#phase-23-close-audit)
> and the [Phase 23 archive](../execution-plan/archive/phase-23.md).

**Reviewed:** 2026-07-25  
**Reviewer:** Fresh read-only Codex review, with the findings independently checked against source by the primary Codex session  
**Inputs:** `docs/PLANNING_STANDARD.md` §§3–4; `docs/SCHEMA.md`; `docs/SPEC.md`; Phase 23 / Tasks 101–105 in `docs/EXECUTION_PLAN.md`; current source and focused tests named by those tasks

## UI-less adaptation

Phase 23 owns persistence primitives, not user-facing behavior (`EXECUTION_PLAN.md`, Phase 23 Notes). Following the established Phase 15 review pattern, the user-flow table is empty and the substantive review traces data-layer contracts, dependency order, and buildability. Planned files that do not exist yet are planned work, not drift.

## User-visible flow table

| # | User Flow | Trigger | Intended Outcome | Owning Task | Boundary Cases | Status |
|---|-----------|---------|------------------|-------------|----------------|--------|

User-visible flows traced: **0**.

Status: ✅ Owned | ⚠️ Weak | ❌ Gap | ⏸️ Deferred

## Dependency graph

```text
Phase 15 lifecycle baseline + approved SCHEMA/SPEC amendments
                             |
                           T101
                          /    \
                       T102    T104
                         |
                       T103
                          \    /
                           T105
                             |
                    Later Triage phases
```

Declared edges are `T101 → T102 → T103`, `T101 → T104`, and `{T101, T102, T103, T104} → T105`. There is no cycle.

## Data-layer dependency and buildability trace

| ID | Contract or risk | Authority / evidence | Owner and required outcome | Status |
|----|------------------|----------------------|----------------------------|--------|
| D1 | v3→v4 preserves records and indexes while backfilling only missing Bit/Breakdown revisions to `1`. | `SCHEMA.md:230-245`; current DB ends at v3 in `src/lib/db/indexeddb.ts`. | T101 owns the real-v3 migration and preservation tests. | ✅ Owned |
| D2 | Candidate storage needs stable primary/query keys and global source-row uniqueness. | `SCHEMA.md:199-226,236-240,706-707`. | T101 creates the store/indexes; T105 gates uniqueness. | ✅ Owned |
| D3 | Nodes remain outside the revision model. | `SCHEMA.md:69-73`; SPEC Decision 19. | T101 and T104 explicitly preserve this boundary. | ✅ Owned |
| D4 | New Bits, Breakdowns, and candidates start at version `1`; callers cannot supply it; retry IDs are preallocated. | `SCHEMA.md:106,181,207-212,322-339,577-579,605-607`. | T101 owns defaults/input guards; T102/T103 own stable command IDs. | ✅ Owned |
| D5 | Adding Bit revision must not let `updateBit` callers set it. | Current update schema derives from the full Bit schema. | T101 acceptance requires write-boundary omission/runtime rejection; T102 can narrow types. | ✅ Owned |
| D6 | Required revision fields may temporarily break typed fixtures before the T102 build gate. | Existing test fixtures omit `version`; T104 owns most behavioral fixture updates. | T101/T102/T104 own the final state. Implementers should keep each commit buildable by updating constructor fixtures as fields become required. | ⚠️ Weak |
| D7 | One storage-neutral command/result boundary carries operation metadata, predicates, preallocated IDs, five result variants, and reconciliation data. | `SCHEMA.md:563-592`; SPEC Decisions 19–20. | T102 owns the shared types and Dexie-free boundary. | ✅ Owned |
| D8 | Drafts, pending intent, interrupted search, and Newly Placed metadata never become persistent records. | `SPEC.md` Decisions 19–20; `SCHEMA.md:573-575,589-592`. | T102 explicitly excludes them and requires type rejection. | ✅ Owned |
| D9 | Shared types must not advertise unimplemented repository methods. | Current DataStore has no Triage command family. | T102 adds types only; each concrete method arrives with its implementation. | ✅ Owned |
| D10 | Scratch-title save re-reads base title/version and active lifecycle in one transaction, then increments once. | `SCHEMA.md:565-575,708`; current generic update is last-write-wins. | T103 owns the conditional command and authoritative result. | ✅ Owned |
| D11 | A successful title edit preserves `mtime` semantics, but `mtime` is never the CAS token. | `SCHEMA.md:133,423-440,569,573-574`; current title edits touch `mtime`. | T103 owns title mutation; T104 broadly preserves `mtime`. Add a focused assertion during implementation if not already covered. | ⚠️ Weak |
| D12 | Breakdown Add validates an active Scratch, allocates order transactionally, inserts a preallocated ID at version `1`, and retries idempotently. | `SCHEMA.md:577-583,605-607`; current create generates its own UUID. | T102 owns metadata; T103 owns command and postcondition behavior. | ✅ Owned |
| D13 | Breakdown Edit compares version/content, requires unconsumed/unstaged state and an active parent, then increments once. | `SCHEMA.md:570,594-611,708`; current edit is unconditional. | T103 owns transactional compare-and-set. | ✅ Owned |
| D14 | Breakdown Delete revalidates revision, lifecycle, candidate absence, and active parent without deleting unrelated rows. | `SCHEMA.md:600-611`; current delete is unconditional. | T103 owns conditional, retry-safe Delete. | ✅ Owned |
| D15 | Failed predicates return deterministic conflict/invalid/not-found outcomes rather than expected throws. | `SCHEMA.md:581-587`. | T102/T103 own the result family. A table-driven reason matrix is a useful implementation strengthening, not a missing architecture decision. | ⚠️ Weak |
| D16 | Unknown transport outcomes remain unresolved until stable-ID postconditions are queried. | `SCHEMA.md:577-592,633-636,708-709`. | T102 owns reconciliation payloads; T103 owns postcondition reads/tests. | ✅ Owned |
| D17 | Predicate checks, writes, revision changes, and result determination are one transaction; failure leaves all stores unchanged. | `SCHEMA.md:573-575,619-626`. | T103 implements; T105 integration-tests no partial success. | ✅ Owned |
| D18 | No public last-write-wins route may bypass Scratch-title or Breakdown Add/Edit/Delete commands. | DataStore currently exposes generic `updateBit` and unconditional Breakdown mutation methods; SCHEMA requires CAS. | **Resolved in T103 amendment:** conditional commands are the sole public route, generic Scratch-title writes are rejected, legacy Breakdown bypasses are removed/narrowed, and current callers migrate in the same task. | ✅ Owned |
| D19 | Every Bit creation path, including promotion and future placement helpers, starts at version `1`. | `SCHEMA.md:106,133`; direct/promotion paths exist today. | T104 names all creation paths and tests missing/double increments. | ✅ Owned |
| D20 | Direct Bit content/property/status/move writes increment exactly once while preserving `mtime` rules. | `SCHEMA.md:133,425-440`; current direct update path. | T104 owns the complete direct-write sweep. | ✅ Owned |
| D21 | Breadcrumb-zone relocation increments each moved Bit once without touching `mtime`. | Existing migration bulk-writes relocated Bits. | T104's every-write-path acceptance owns it, though naming the helper in focused assertions would improve discoverability. | ⚠️ Weak |
| D22 | Chunk Add/Edit/Delete and auto-completion may change several fields but increment each affected parent Bit once. | `SCHEMA.md:461-472`; current chunk/auto-completion paths. | T104 owns Hook 1/3 cascades and focused tests. | ✅ Owned |
| D23 | Direct Bit delete and Node delete cascades increment each affected Bit once; Nodes stay unversioned. | `SCHEMA.md:474-486`; current lifecycle paths. | T104 owns direct/cascade revisions. | ✅ Owned |
| D24 | Direct/cascade restore, including BFS relocation, increments each restored Bit once. | `SCHEMA.md:488-497`; current restore paths. | T104 owns restore and multi-field single increments. | ✅ Owned |
| D25 | Archive/unarchive increments each changed Bit once and avoids double increments during position repair. | `SCHEMA.md:523-553`; current archive paths. | T104 owns Hooks 10/11 and archive tests. | ✅ Owned |
| D26 | Direct and retention-triggered Scratch hard-delete atomically remove Breakdowns and durable candidates. | `SCHEMA.md:555-561`; current hard delete has no candidate table yet. | **Resolved in T104 amendment:** both entry paths clean Bit/Chunks/Breakdowns/candidates in one transaction, preserve archive/unrelated rows, and prove rollback/no orphans. | ✅ Owned |
| D27 | Revision work must not alter ordinary Node writes or add a Node revision indirectly. | `SCHEMA.md:69-73`; SPEC Decision 19. | T104 explicitly preserves Node behavior. | ✅ Owned |
| D28 | Phase closure integrates migration, monotonicity, uniqueness, idempotency, postconditions, rollback, DB tests, and production build. | `PLANNING_STANDARD.md:120-128`; T105 gate. | T105 owns the contract suite, full DB group, and build. | ✅ Owned |
| D29 | Command contracts remain substitutable by a future BaaS rather than only passing against Dexie internals. | SPEC Decision 20; DataStore boundary. | T105 owns substitution semantics. A factory-driven interface-only harness would make the proof stronger. | ⚠️ Weak |
| D30 | Stage/Unstage, candidate presentation, Placement, Undo, Archive UI, hooks, focus, and feedback are not Phase 23 implementations. | Phase 23 Notes; later phases own these flows. | Explicitly deferred downstream; Phase 23 exposes only its schema/result primitives and T103 commands. | ⏸️ Deferred |

## Resolution pass

The first independent pass found two blocking ownership gaps. Both were checked against the live code and authoritative SCHEMA before the plan was changed.

| Gap | Verified problem | Plan resolution | Re-review disposition |
|-----|------------------|-----------------|-----------------------|
| G1 — public non-CAS bypass | `updateBit` and legacy Breakdown mutation methods could remain callable after safe commands were added. | T103 now closes those public routes, migrates the current Breakdown hook and Bit-detail Scratch-title caller in the same commit, and leaves richer Scratch-title presentation to Task 109 and Breakdown presentation to Task 111. | Resolved; D18 is owned. |
| G2 — hard-delete candidate cleanup | T101 creates durable candidates, but no task previously required direct/retention Scratch deletion to remove them. | T104 now owns atomic Bit/Chunk/Breakdown/candidate cleanup, archive preservation, unrelated-row preservation, and rollback/no-orphan tests. | Resolved; D26 is owned. |

No SCHEMA or SPEC change was required: both gaps were missing execution ownership, so the authority-preserving fix was to strengthen the execution plan under `PLANNING_STANDARD.md` §4.

## Non-blocking watch items

The five ⚠️ items are implementation-proof improvements, not unresolved product, persistence, architecture, or scope decisions:

- Keep typed fixtures buildable as revision fields become required (D6).
- Assert title `mtime` changes only on an applied title mutation (D11).
- Prefer a table-driven stable status/reason mapping (D15).
- Name the breadcrumb migration in the revision test sweep (D21).
- Run the final command contract through the DataStore interface/factory where practical (D29).

They remain visible for implementation review and do not weaken the now-explicit Task 101–105 ownership.

## Downstream boundaries

- Phase 23 has no user-facing UI, focus, DnD, theme, or feedback ownership.
- The T103 caller migration is compatibility work required to close unsafe public methods; Phase 25 still owns authoritative pending/reconciling/conflict presentation and Breakdown interaction reliability.
- Public candidate projections, Stage/Unstage, Placement, Undo, Inbox Archive, and reactive UI orchestration remain in their later phases.
- General Node-title CAS remains out of scope. Nodes receive neither revision nor a conditional title command.
- Actual BaaS implementation is future work; T105 owns only storage-neutral contract substitutability.

## Summary

- User-visible flows traced: **0**
- Data-layer contracts/risks traced: **30**
- Fully owned: **24**
- Weak, non-blocking: **5**
- Gaps: **0**
- Deferred: **1**
- Status: **PASS**

Phase 23 is code-ready after the two plan amendments. All persistence and concurrency contracts have an owning task and acceptance boundary; the remaining watch items can be verified during implementation without a new product or architecture decision.
