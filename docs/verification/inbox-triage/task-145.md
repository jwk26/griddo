# Task 145 Verification — Stage/Unstage Interaction Adapters

## Scope and provenance

- Recovery anchor: `cdc02433a049cf109e07010ccd309801de2961f0`.
- Approved entrypoint `src` tree: `0f7b18f359e9c433bc217136ed0f24bd66cb74a7`.
- Candidate-pinned workflow: `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`.
- Durable start: `373b3f5d85e5ffbe360cdb808bfd37b96dd2c4a6`.
- Implementation: `21d87bd9e02633e309cda0e989d0d87cfb4aaba3`.
- Implemented `src` tree: `923050fab27a61d186c0e45c8f3026f3c29f3b5a`.
- The run-phase Gate C receipt was not passed to the run-task resolver. The
  receipt-less pinned resolver returned `contract_ready=true` and
  `approval_required`; the user's Task 145-only work order supplied write
  authority.

Production ownership is limited to the canonical Breakdown, Staging,
Workspace, staged-candidate, and existing DnD owners. Task 146 remote/orphan
reconciliation, Task 147 `DP-VQ06-STAGING`, permanent Unstage controls, success
toasts, `P27-06`, and unrelated behavior remain unchanged.

## Realized contract

- A current compatible Stage or Unstage drop creates the exact Task 121 command
  from the captured source/candidate/version/type identity only after the shared
  lock is acquired synchronously. The previous in-memory Stage/Unstage mutation
  path is no longer used.
- The same `stage`/`unstage` owner remains visible to every existing shared-lock
  consumer through pending, unknown, and reconciling. Unknown is reconciled
  once with the same command identity before any later retry opportunity; a
  second unknown retains the lock with no queue or replay.
- Matching staged drags expose both the existing Staging strip and a transient
  whole-Breakdown return target. Candidate drag roots and all existing competing
  controls are disabled while any shared operation owns the lock.
- Exact terminal `applied`, `already_applied`, `not_applied`, `rejected`, and
  `conflict` results release only the matching identity. Confirmed Unstage
  restores focus to the surviving source grip while the authoritative
  created-at ordering remains unchanged.
- No permanent Unstage button or success toast was added.

## TDD and bounded review

| Evidence | RED | GREEN |
| --- | --- | --- |
| Adapter/target/focus contract | Eight selected assertions failed against legacy in-memory Stage/Unstage behavior, missing durable lock/reconciliation, missing transient Breakdown target, and unlocked candidate roots. | Durable commands, synchronous acquisition, both targets, operation-disabled roots, and confirmed focus passed. |
| Reconciliation projection | A focused assertion failed because `reconcilingOperations` was absent. | Stage reconciliation now projects a distinct reconciling phase while retaining the operation identity. |
| Terminal matrix | Review expanded the DnD owner test to cover both Stage and Unstage across all five terminal statuses. | Final focused run passed 7 files / 255 tests. |
| Whole-module mock compatibility | The first full run exposed one existing `grid-runtime` failure because a whole-module mock did not provide a newly imported collision export. | Collision ownership was kept inside `useTriageDnd` and returned with the controller; the existing external test remained unchanged and the final full run passed. |

Final diff review found no remaining Critical or Important Task 145 issue. The
new collision filter adds only the Task 145 Breakdown target to the existing
Staging/hierarchy target set. The existing Task 146 orphan-cleanup adapters and
tests were not changed.

## Canonical Chrome evidence

- Local Playwright Core with system Google Chrome `151.0.7922.140`, at
  `1440×900`, used the actual canonical `/grid/<id>` route and `GridDO`
  IndexedDB schema. The browser skill's in-app Node REPL was unavailable in
  this environment, so its documented local Playwright fallback was used.
- Dragging the older Breakdown source to Node Staging produced one durable
  candidate and disabled its source grip.
- During candidate drag, both `Return staged item to Breakdown` and
  `Remove from staging` were simultaneously visible.
- Confirmed Unstage removed the candidate, retained the exact
  `Newer source` → `Older source` order, and focused the older source's
  `Drag breakdown` grip.
- Permanent Unstage buttons: 0. Success toasts: 0. Browser console/page errors:
  0.
- Machine-readable evidence:
  `captures/task-145-browser-report.json` — SHA-256
  `dd934d017dde6d859c03a674e4d75682230da3c1100367f0c190975549ee7661`.

## Verification commands

| Command | Exit | Relevant result |
| --- | ---: | --- |
| Focused Task 145 `pnpm exec vitest run` | 0 | Final fresh run: 7 files / 255 tests passed |
| Changed-file `pnpm exec eslint` | 0 | No errors or warnings in Task 145 TypeScript/TSX paths |
| `pnpm typecheck` | 0 | TypeScript passed |
| `git diff --check` | 0 | No whitespace errors |
| `pnpm test` | 0 | Final fresh full run: 94 files / 940 tests passed |
| `pnpm lint` | 0 | 0 errors; the same 11 existing warnings outside Task 145 paths |
| `pnpm typecheck` | 0 | Fresh full-gate typecheck passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven routes generated |
| Local Playwright/system Chrome | 0 | Stage, both transient targets, confirmed Unstage order/focus, prohibited-control absence, and zero browser errors passed |

## Checkpoint buckets

- Visible now: current-snapshot durable Stage/Unstage dispatch, complete shared
  lock behavior, transient Staging/Breakdown targets, same-identity unknown
  reconciliation, and confirmed Unstage order/focus restoration.
- Review now: Task 145 implementation and evidence acceptance. Task 145 remains
  `[ ]` until explicit user acceptance.
- Planned later: Task 146 remote candidate/orphan reconciliation and Task 147
  `DP-VQ06-STAGING` realization under separate future lifecycles.
- Unowned: None.
