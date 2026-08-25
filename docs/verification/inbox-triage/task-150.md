# Task 150 `P28-04` Canonical Amendment Evidence

> Date: 2026-08-25
> Task state: `[ ]`, implemented; awaiting checkpoint acceptance
> Durable start HEAD: `9b73387e4690e48aba8b0bb293e611c6abc0b792`
> Start-base source tree: `e83086e1044bb2deebc6837f997bebc06b316146`

## Scope Reconciled

Task 150 must realize the accepted `DP-VQ06-EXPLORER` affected-column status
family only. In particular, it must distinguish deleted, archived, moved, and
unreachable path fallbacks and exclude initial hydration, local placement, and
an existing item moving between columns from remote-arrival counts.

The 2026-08-24 user disposition adds only the actual reactive provenance and
stable local-result producer/test owners below. It moves selected-Bit
disappearance realization to Task 151's existing reveal production owner
without starting Search or any Task 151 product behavior.

## `P28-04` Owner Gap

1. `src/hooks/use-grid-data.ts` returns only active per-parent
   `{nodes, bits, isLoading}` snapshots from `getActiveGridContents()`. Removed
   records are absent, so Explorer has no authoritative field or event that
   distinguishes delete/unreachable from archive or move.
2. Local placement creates the result in `src/hooks/use-dnd.ts` and clears its
   pending placement after the write. `HierarchyExplorer` receives only the
   pending target `dropId`; it receives neither the created stable result ID
   nor an authoritative local-operation identity. Snapshot differencing would
   therefore count a local placement as remote, or suppress a concurrent real
   remote insertion if it guessed by timing.
3. No production selected-Bit/reveal owner is connected to Explorer or
   `triage-store` before the separately planned Task 151 search realization.
   A test-only seeded value or an unused setter would not make the required
   disappearance behavior observable.
4. Direct component DataStore reads are not an allowed workaround. The
   Blocking rules in `docs/PLANNING_STANDARD.md` require reactive reads behind
   hook APIs and restrict `triage-store.ts` to declared app-session state; the
   accepted `P27-11` repair removed the same class of component-level direct
   data access.

## Implementation And Verification

| Command/check | Exit | Relevant result |
| --- | ---: | --- |
| Candidate synchronized adapter resolver at `4574df8…`, receipt-less `run-task` | 3 | `approval_required`, `contract_ready=true`; policy/runtime paths resolved read-only |
| Candidate synchronized adapter resolver at `4574df8…` with Phase 28 Gate C receipt as `run-phase` | 0 | `ready`; exact Gate C receipt and current feature worktree validated |
| `git rev-parse HEAD HEAD^ HEAD^{tree}:src` | 0 | `4574df8…`, `b1ff7fe…`, `e83086e…` matched the supplied repair recovery identity |
| Owner and symbol inspection with `rg`/`sed` | 0 | Confirmed the three missing producer projections above |
| Focused Task 150 owners | 0 | 7 files / 175 tests passed: provenance hook, DnD, Workspace, Explorer, store, copy, and GridRuntime compatibility |
| `pnpm test` | 0 | Latest input: 96 files / 1016 tests passed |
| `pnpm lint` | 0 | 0 errors; 11 unchanged warnings outside Task 150 writes |
| `pnpm typecheck` | 0 | Passed |
| `pnpm build` | 0 | Next.js production build compiled, typechecked, and generated every page |
| `git diff --check` | 0 | Passed |

Existing Task 149 evidence was not reused as proof of Task 150 behavior. The
latest-input gates above supersede every earlier Task 150 test input.

## Bounded Repair Record

1. Focused verification caught a misplaced new Workspace projection
   destructure that caused cascading Explorer reference failures; the repair
   restored the projection to the component owner.
2. Focused status/action review caught duplicate destination strips under a
   sentinel/stable-ID collision and non-focusable surviving Bit/drop-only rows;
   destination depth matching plus programmatic-only `tabIndex={-1}` repaired
   the receipt's single-strip and action-focus contract.
3. Type/lint verification caught one invalid test fixture field and React hook
   ref/effect rule violations; the fixture and subscription snapshot ownership
   were corrected without changing product semantics.
4. The first full gate passed 95 files but failed 1/1016 tests because
   `src/components/layout/grid-runtime.test.tsx` manually mocked `useTriageDnd`
   without its new `localPlacementResult` return field. After the user approved
   exactly one fourth cycle, adding only `localPlacementResult: null` made the
   owner test pass 16/16 and the latest full gate pass 96/96 files and
   1016/1016 tests. Canonical impact is `None`; no fifth cycle was used.

## User Disposition And Exact Owner Mapping

| Owner | Exact production/test paths | Authorized projection |
| --- | --- | --- |
| Explorer lifecycle/provenance read owner | Create `src/hooks/use-explorer-remote-status.ts` and `.test.tsx` | One mounted-page reactive projection using existing `getAllActiveNodes()`/`getAllActiveBits()` for the whole-active-tree stable-ID-to-parent baseline and `getNode()`/`getBit()` for watched path records: initial-snapshot exclusion; remote insertion; stable-ID parent move exclusion; exact local-result exclusion; deleted/archived/moved/unreachable path classification. No DataStore API, IndexedDB, schema, persistence, timestamp inference, component repository read, or second provenance owner. |
| Existing placement producer | Modify `src/hooks/use-dnd.ts` and `src/hooks/use-triage-dnd.test.ts` | Capture the stable `Node`/`Bit` identity already returned by successful `createNode`/`createBit` and expose only that identity. Preserve command ordering, confirmation, mutation, cancellation, locking, focus, and failure semantics. |
| Mounted handoff owner | Modify `src/components/triage/triage-workspace.tsx` and `.test.tsx` | Pass the exact local placement result identity from the existing DnD controller to Explorer; add no presentation or product behavior in Workspace. |
| Compatibility-test owner | Modify only `src/components/layout/grid-runtime.test.tsx` | Keep its manual `useTriageDnd` mock conformant by returning `localPlacementResult: null`; canonical product impact `None`. |
| Task 150 presentation | Existing approved Explorer/store/copy/CSS paths and tests | Realize all `DP-VQ06-EXPLORER` states except selected-Bit disappearance, using the authoritative projections above while preserving stable-ID/offset anchoring. |
| Existing Task 151 reveal owner | Task 151's already planned `src/hooks/use-grid-explorer-search.ts` and `.test.tsx`, `src/components/triage/grid-explorer-search-results.tsx` and `.test.tsx`, `src/components/triage/hierarchy-explorer.tsx` and `.test.tsx`, copy, and CSS paths | Realize only selected-Bit disappearance after a real Task 151 Bit reveal: clear that Bit selection/reveal, preserve/focus the valid parent, and reuse the exact parent-column copy/action/lifetime. No new selection/reveal owner and no Task 151 work in this continuation. |

## Historical Receipt And Current Execution Edge

The historical `docs/issues/Issues_Phase_24.Task_113.dp-vq06-explorer.json`
receipt remains byte-for-byte unchanged. Its Task 113 acceptance on 2026-08-10
historically released Task 150 only. The user-approved `P28-04` correction on
2026-08-24 supersedes only the current selected-Bit disappearance realization
edge to Task 151's existing reveal owner; Task 150 retains every other Explorer
realization.

The same distinction is now explicit in all current canonical edge owners in
`docs/EXECUTION_PLAN.md`: the VQ-06 Gate Register, the `DP-VQ06-EXPLORER`
Executable DP Receipt Edge, the completed Task 113 later-execution-correction
note, and the Task 150/151 contracts. `docs/WORKFLOW.md` assigns an
execution-time structural correction to the phase issue ledger and promotion
into the active execution plan; Adapter v2 declares no separate amendment
receipt kind or path. The current user dispositions, `P28-04` ledger entry, and
these plan records are therefore the project-owned durable amendment rather
than a silently reinterpreted or invented JSON receipt.

A subsequent evidence check found one remaining unqualified sentence: Task
113's Verification text still said to verify “only Task 150 release.” The
second targeted checkpoint-review repair now limits that statement to the
historical 2026-08-10 checkpoint verification and explicitly directs current
execution verification to the already-recorded `P28-04` split: Task 150 owns
all Explorer realization except selected-Bit disappearance, and Task 151 owns
only that slice in its existing reveal owner. No receipt or product semantic
changed.

Task 150 and Task 151 remain `[ ]`. Task 150 is implemented and awaiting this
checkpoint; selected-Bit disappearance, Search, and every other Task 151
behavior remain unimplemented.
