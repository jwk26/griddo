## Phase 23 — Model, Migration, Transactions, And Retention

### Task 101: [x] Land the authoritative model and typecheck-compatible constructors

**Files and actions**

- Modify `src/lib/db/schema.ts`, `src/types/index.ts`, and `src/lib/db/schema.test.ts`: make `version` a required integer ≥1 on Node, Bit, and ScratchBreakdown; add `pastDeadlineDismissed` to Node/Bit with canonical `false` schema default; add/export `RepositoryOperationId`, exact `StagedCandidate`, exact `CandidateOrphanAuditEvent`, exact `PendingOperationRecovery`, command/result types, and public create/update schemas that omit IDs, creation metadata, lifecycle system fields, and `version`.
- Modify `src/lib/db/indexeddb.ts` and `src/lib/db/indexeddb.test.ts`: make every repository create constructor explicitly write `version: 1`, and every Node/Bit constructor explicitly write `pastDeadlineDismissed: false`, including ordinary create, system-node seed, Scratch Breakdown create, Bit→Node promotion result, and promoted child Bits. Do not rely on a Zod output default to hide a missing repository initializer.
- Update the concrete typed factories found by `rg -l 'function (create|make)(Node|Bit)|function createScratchBreakdown' src --glob '*.test.ts' --glob '*.test.tsx'`, namely: `src/app/calendar/calendar-navigation.test.tsx`; `src/components/bit-detail/bit-detail-popup.test.tsx`; `src/components/calendar/compact-bit-item.test.tsx`; `src/components/calendar/day-column.test.tsx`; `src/components/calendar/parent-node-selector.test.tsx`; `src/components/grid/bit-card.test.tsx`; `src/components/grid/edit-node-dialog.test.tsx`; `src/components/grid/grid-view.test.tsx`; `src/components/grid/node-card.test.tsx`; `src/components/layout/breadcrumb-deadline.test.tsx`; `src/components/layout/breadcrumbs.test.tsx`; `src/components/layout/grid-runtime.test.tsx`; `src/components/layout/sidebar.test.tsx`; `src/components/triage/breakdown-panel.test.tsx`; `src/components/triage/hierarchy-explorer.test.tsx`; `src/components/triage/scratch-pool.test.tsx`; `src/components/triage/triage-workspace.test.tsx`; `src/hooks/use-calendar-data.test.ts`; `src/hooks/use-inbox.test.tsx`; `src/hooks/use-scratch-breakdowns.test.tsx`; `src/lib/db/archive-sweep.test.ts`; `src/lib/db/archive.test.ts`; `src/lib/db/auto-cleanup.test.ts`; `src/lib/db/auto-completion.test.ts`; `src/lib/db/cascade-delete.test.ts`; `src/lib/db/cascade-hard-delete.test.ts`; `src/lib/db/cascade-restore.test.ts`; `src/lib/db/deadline-hierarchy.test.ts`; `src/lib/db/grid-uniqueness.test.ts`; `src/lib/db/indexeddb.migration.test.ts`; `src/lib/db/mtime-cascade.test.ts`; `src/lib/db/promotion.test.ts`; `src/lib/db/scratch-breakdowns.test.ts`; `src/lib/db/system-nodes.test.ts`; and `src/lib/utils/completion.test.ts`. Each factory explicitly defaults `version: 1`; Node/Bit factories also default `pastDeadlineDismissed: false`. Update `src/hooks/use-can-archive-scratch.test.ts` so its asserted ScratchBreakdown fixture is complete rather than hiding missing fields behind a cast. Intentional legacy-migration rows remain `Record<string, unknown>`.

**Dependencies:** plan approval and separately approved execution lifecycle.

**Authority / flows:** SCHEMA object stores, Zod schemas, and operation identities; `AF-01`, `AF-05`–`AF-08`; `NEG-16`.

**Recipe:** Not applicable — data/nonvisual.

**Observable acceptance:** every file changed by the new required fields compiles in this task; public payloads cannot supply/reset versions or system metadata; all repository-created Node/Bit/Breakdown records begin at version 1, Node/Bit records begin with `pastDeadlineDismissed: false`, candidates contain no label/target/pending snapshot, and recovery contains no draft/payload/queue.

**Verification:** first observe fixture/type failures after the schema test change; then run `pnpm test -- src/lib/db/schema.test.ts src/lib/db/indexeddb.test.ts` and `pnpm typecheck`, both with zero failures/errors; rerun the discovery command and inspect every matching concrete factory.

**Commit contract:** only the schema/type exports, repository constructors, schema/constructor tests, and enumerated typed-fixture compatibility edits; `feat(triage): define versioned inbox domain model`.

### Task 102: [x] Install the exact atomic Dexie v4 migration

**Files and actions:** modify `src/lib/db/indexeddb.ts` and `src/lib/db/indexeddb.schema-v3-upgrade.test.ts`; create `src/lib/db/indexeddb.schema-v4-upgrade.test.ts`. Preserve every v3 assertion while converting its intended-success legacy IDs to valid UUIDs (or isolating its v3-only opener) so canonical v4 validation does not turn a v3 fixture artifact into a false migration failure. Declare v4 after v1→v2→v3 with exact stores/indexes: `nodes: "id,parentId,deletedAt,[parentId+deletedAt],level,systemRole,archivedAt,[parentId+deletedAt+archivedAt]"`; `bits: "id,parentId,deletedAt,[parentId+deletedAt],status,deadline,[parentId+status],archivedAt,[parentId+deletedAt+archivedAt]"`; `scratchBreakdowns: "id,scratchBitId,[scratchBitId+order],[scratchBitId+createdAt]"`; `stagedCandidates: "id,&sourceBreakdownId,scratchBitId,lifecycle,[scratchBitId+lifecycle],[scratchBitId+resultType+createdAt]"`; and `candidateOrphanAuditEvents: "id,&candidateId,sourceBreakdownId,scratchBitId,occurredAt,[scratchBitId+occurredAt]"`; retain chunks/settings declarations. In one upgrade transaction, start both new stores empty with no inference; backfill only missing versions to 1 and missing `pastDeadlineDismissed` to false; preserve valid ≥1 revisions, booleans, IDs/content/order/timestamps/lifecycle, and tolerated unknown fields; validate target Zod fields and that each Breakdown owner is a Bit parented by the Inbox system Node. Throw a structured store/id/reason migration error for any invalid required row/reference so the whole upgrade rolls back and reopens at v3 without quarantine, deletion, guessed value, consumption, or candidate manufacture.

**Dependencies:** Task 101.

**Authority / flows:** SCHEMA Dexie Migration Target and invalid-row rollback; `AF-01`, `AF-04`, `AF-08`; `NEG-16`, `NEG-17`.

**Recipe:** Not applicable — data/nonvisual.

**Observable acceptance:** fresh/open-from-v1/v2/v3 databases expose the exact v4 indexes and empty new stores; valid prior revisions/booleans and every unrelated value remain unchanged; each invalid Node, Bit, Breakdown, or non-Inbox owner aborts with structured identity and a byte-for-byte pre-upgrade snapshot after reopening at v3; reopening a successful v4 database is idempotent.

**Verification:** with real `GridDODatabase`, `IDBFactory`, and `IDBKeyRange`, run `pnpm test -- src/lib/db/indexeddb.schema-v3-upgrade.test.ts src/lib/db/indexeddb.schema-v4-upgrade.test.ts`; inspect `db.verno`, store/index schemas, unique-index rejection, empty stores, preservation, and rollback; then `pnpm typecheck`.

**Commit contract:** v4 declaration/upgrade plus the v3 preservation and dedicated v4 tests only; `feat(triage): migrate indexeddb atomically to v4`.

### Task 103: [x] Enforce revisions across every public and repository mutation path

**Files and actions**

- Modify `src/lib/db/datastore.ts` and `src/lib/db/indexeddb.ts`: replace broad `Partial<Node>`/`Partial<Bit>` public patches with repository-owned update inputs excluding IDs, creation metadata, lifecycle-only fields, and `version`; increment a surviving record exactly once for direct title/property/deadline/position/status/lifecycle mutation; never increment on rejection/no-op or parent `mtime`-only touch. Explicitly sweep `createNode`/`createBit`, `updateNode`/`updateBit`, `createChunk`/`updateChunk`/`deleteChunk` under Hooks 1/3, Node/Bit soft delete, restore, hard-delete closure, trash cleanup, archive/unarchive under Hooks 10/11, system-node drift normalization, breadcrumb relocation, Bit→Node promotion, and legacy Breakdown mutations; new records start at v1, hard-deleted records have no surviving revision, and every indirectly touched parent stays revision-neutral unless it is itself directly lifecycle/status mutated.
- Modify `src/hooks/use-grid-actions.ts`, `src/hooks/use-node-actions.ts`, and `src/hooks/use-bit-detail-actions.ts`; create `src/hooks/use-grid-actions.test.ts`, `src/hooks/use-node-actions.test.ts`, and `src/hooks/use-bit-detail-actions.test.ts` with compile-time `@ts-expect-error` and runtime forwarding assertions so public actions cannot set/reset revision/system fields.
- Create `src/lib/db/revision.test.ts` and update these exact regression owners: `src/lib/db/indexeddb.test.ts` (direct Node/Bit create/update and child add/remove); `src/lib/db/mtime-cascade.test.ts` (Hook 1); `src/lib/db/auto-completion.test.ts` (Hook 3); `src/lib/db/cascade-delete.test.ts` and `src/lib/db/cascade-restore.test.ts` (Hooks 4/5); `src/lib/db/cascade-hard-delete.test.ts` and `src/lib/db/auto-cleanup.test.ts` (Hook 6 target absence and revision-neutral parent touch); `src/lib/db/indexeddb.migration.test.ts` (breadcrumb relocation); `src/lib/db/archive.test.ts` (Hooks 10/11 Node cascades and Bit paths); `src/lib/db/system-nodes.test.ts` (drift normalization); `src/lib/db/promotion.test.ts` (source deletion plus new v1 results); `src/lib/db/grid-uniqueness.test.ts` and `src/lib/db/deadline-hierarchy.test.ts` (rejected/accepted moves and deadline writes); and `src/lib/db/scratch-breakdowns.test.ts` (legacy Breakdown direct paths until Task 120 replaces them).
- Assert a restore that changes lifecycle and cell is one logical increment; an archive/soft-delete cascade increments each directly lifecycle-mutated descendant once; Hook 1 parent touches do not increment; Hook 3 increments the Bit only when status actually changes; promotion results begin at v1; no test uses `mtime` as CAS.

**Dependencies:** Task 102.

**Authority / flows:** SCHEMA monotonic version/CAS and Hooks 1, 3, 4–6, 10, 11; `AF-01`, `AF-06`; `NEG-19`.

**Recipe:** Not applicable — data/nonvisual.

**Observable acceptance:** every current direct, breadcrumb, auto-completion, cascade, restore, Archive, system normalization, promotion, and public-action path has an exact version assertion; stale version cannot overwrite a later value even through A→B→A; mtime-only parent refresh remains revision-neutral; Task 103 does not modify `schema.ts`.

**Verification:** run the three new action tests and all exact database tests listed above, then `pnpm typecheck` and `pnpm lint`; expected zero failures/errors and expected compile errors only at annotated forbidden public inputs.

**Commit contract:** revision/public-boundary code and the exact mutation-path tests above only; `feat(db): enforce monotonic record revisions`.

### Task 104: [x] Build a real IndexedDB transaction and fault-injection harness

**Files and actions:** create `src/lib/db/indexeddb.test-utils.ts` and `src/lib/db/indexeddb.transaction.test.ts`; modify `src/lib/db/indexeddb.ts` only for a narrow injectable named-checkpoint test seam. Each test uses a fresh real `GridDODatabase` backed by `fake-indexeddb` `IDBFactory`/`IDBKeyRange`, valid UUID factories, and snapshots of nodes, bits, chunks, settings, scratchBreakdowns, stagedCandidates, and candidateOrphanAuditEvents. Inject a throw after each named store mutation inside the real `rw` Dexie transaction and prove every store matches the prestate. Require every validation and closure read to occur inside the same transaction. Structural FakeTable/FakeDatabase tests may remain unit coverage but cannot satisfy atomic acceptance.

**Dependencies:** Task 102.

**Authority / flows:** SCHEMA Repository Operation Contract and complete-postcondition rule; `AF-01`, `AF-07`; `NEG-18`, `NEG-20`.

**Recipe:** Not applicable — data/nonvisual.

**Observable acceptance:** a real first write followed by an injected failure rolls back all seven domain/integrity stores; the harness can assert complete precondition, complete postcondition, and conflict using stable IDs and versions; transaction scope includes every store required by later commands and introduces no production operation log, outbox, or queue.

**Verification:** `pnpm test -- src/lib/db/indexeddb.transaction.test.ts`; expected zero failures with a control proving the same injected sequence would expose a partial state outside the real transaction; then `pnpm typecheck`.

**Commit contract:** real IndexedDB test utility, transaction test, and smallest named-checkpoint seam only; `test(db): prove real indexeddb rollback`.

### Task 105: [x] Make Scratch aggregate hard-delete atomic and audit-preserving

**Files and actions:** modify `src/lib/db/datastore.ts` and `src/lib/db/indexeddb.ts` to make Node/Bit permanent-delete closures and `cleanupExpiredTrash` use one planned aggregate transaction. When a closure owns a Scratch Bit, delete the Scratch, its Chunks, all owned Breakdown rows, and candidates whose still-present source belongs to the closure; retire/restrict `deleteScratchBreakdownsByScratch` as a public sequencing escape hatch. Never create an orphan event for planned aggregate deletion; retain every pre-existing `candidateOrphanAuditEvents` row indefinitely, including rows naming that Scratch; leave unrelated aggregates untouched. If a candidate already lacks its source before planning, abort the aggregate with a typed integrity-cleanup-required result and leave every store unchanged; Task 122 later consumes that condition through the separately audited confirmed-orphan contract. Create `src/lib/db/scratch-aggregate-hard-delete.test.ts`; update `src/lib/db/cascade-hard-delete.test.ts`, `src/lib/db/auto-cleanup.test.ts`, and `src/lib/db/scratch-breakdowns.test.ts` with real Task 104 checkpoint injection after each store mutation.

**Dependencies:** Tasks 102–104.

**Authority / flows:** SCHEMA Hook 6, Scratch Bit Permanent Deletion, and indefinite orphan-audit retention; `AF-04`, `AF-07`, `AF-08`; `NEG-20`.

**Recipe:** Not applicable — data/nonvisual.

**Observable acceptance:** normal Scratch purge leaves neither Scratch/Chunk/row/candidate nor a new audit event; every prior audit remains byte-for-byte; archive leaves rows/candidates untouched; pre-existing orphans are not disguised as aggregate cleanup; any injected failure restores the entire aggregate and audit store.

**Verification:** `pnpm test -- src/lib/db/scratch-aggregate-hard-delete.test.ts src/lib/db/cascade-hard-delete.test.ts src/lib/db/auto-cleanup.test.ts src/lib/db/scratch-breakdowns.test.ts`; expected zero failures, then `pnpm typecheck`.

**Commit contract:** aggregate hard-delete/cleanup owners and their exact rollback/retention tests only; `feat(db): delete scratch aggregates atomically`.

### Task 105A: [x] Amend the stale Scratch promotion boundary

**Files and actions:** first amend `docs/SCHEMA.md` Hook 9 through a separate
canonical-document gate: a Bit whose parent Node has `systemRole: "inbox"` is
a Scratch and cannot be promoted to a Node, regardless of whether it currently
has Breakdown rows, staged candidates, or Chunks. After that amendment is
explicitly approved, modify `src/lib/db/indexeddb.ts` and
`src/lib/db/promotion.test.ts` so `promoteBitToNode` rejects the Inbox-parented
Bit before allocating IDs or writing any store. Do not infer a Breakdown/
candidate deletion or migration policy, and do not change the visual surface.

**Dependencies:** Task 105 and explicit approval of the Task 105A SCHEMA
amendment. Task 105 must not absorb this work.

**Authority / flows:** SCHEMA dedicated `scratchBreakdowns` ownership and the
stale Hook 9 Bit-to-Node Promotion contract; the explicit 2026-07-28 user
decision recorded in `docs/issues/Issues_Phase_23.md`.

**Recipe:** Not applicable — repository constraint; the intended Scratch UI
already exposes no promotion action under its normal no-Chunk state.

**Observable acceptance:** Inbox-parented Bits reject promotion before any
Node/Bit/Chunk/Breakdown/candidate/audit write, including a defensive fixture
that contains Chunks; ordinary non-Inbox Bits preserve current promotion
behavior. Data presence never toggles the rule.

**Verification:** run `pnpm exec vitest run src/lib/db/promotion.test.ts`,
`pnpm typecheck`, `pnpm lint`, and `git diff --check`; expected zero failures
or errors and no new warning.

**Commit contract:** the approved Hook 9 amendment/receipt is one documentation
commit; the repository guard and exact promotion regression are a later narrow
code commit; `fix(db): reject Scratch bit promotion`.

---

## Phase 23 Close Notes

- Tasks 101–105A were explicitly accepted by the user and completed as one
  phase branch. Task 102 closes Task 101's temporary legacy-row transition
  risk, so the phase must be integrated as a whole rather than cherry-picked
  at an intermediate task commit.
- The finished persistence foundation adds the versioned Inbox/Triage model,
  exact Dexie v4 migration and legacy backfill, monotonic revisions, real
  IndexedDB transaction/fault-injection proof, atomic Scratch aggregate
  hard-delete, indefinite audit retention, and the Inbox Scratch promotion
  guard.

| Task | Implementation / canonical commit | Evidence commit | Acceptance commit |
| --- | --- | --- | --- |
| 101 | `b6bbed8` | `5fdf9aa` | `4a7865a` |
| 102 | `dcdc74d` | `ff56d82` | `c28ea90` |
| 103 | `6b04c61` | `df7d0d1` | `169ffa5` |
| 104 | `055bff0` | `88bc19a` | `bc9d2d7` |
| 105 | `9c078d4` | `4f6d416` | `0faaa70` |
| 105A | SCHEMA `67dbe52`; code `45cfec5` | `76f04f7` | `48e9937` |

- Phase-close evidence at pre-close commit
  `48e9937986bfa46e4cb5ad1201be8d2e1a67e91c`: `pnpm test` passed 80
  files / 554 tests; `pnpm lint` passed with 0 errors and the same 11
  pre-existing warnings; `pnpm typecheck`, `pnpm build` (seven routes),
  and `git diff --check` passed.
- No user-visible surface changed in this phase. User-visible evidence is not
  applicable to Tasks 101–105A; Task 130 owns the later defensive visibility
  guard for the global Bit detail popup.
- `P23-02` is deferred to Task 136, the first task that owns
  `use-scratch-breakdowns.test.tsx`; `P23-03` is promoted to Task 130.
- The live `run-task` pilot exposed runner-specific focused-command,
  wide-sweep checkpoint, dependency-ready sibling, proof-modality,
  adapter/bootstrap, generated-output serialization, and receipt-hash
  validation findings. They are preserved for the post-Phase-23 workflow
  improvement pass and do not alter Phase 23 product semantics.

**Full issue log:** [`docs/issues/Issues_Phase_23.md`](../../issues/Issues_Phase_23.md)
