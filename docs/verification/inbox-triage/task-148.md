# Task 148 Verification — Authoritative Add/Unstage Success Signal

## Scope and provenance

- Recovery anchor: `841d6cc129db40b37fd1388498fabc7b7adf8358`.
- Accepted entrypoint `src` tree: `a94b637c16cb407879cc7fa5736e900edb909580`.
- Candidate-pinned workflow: `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`.
- Durable repaired-scope start: `ab1fce1b16a2a8f1efb6f69c63f44aa5c8dc211a`.
- Implementation: `47f44d78af2ca0c9eb46ea647351d1224a92827a`.
- Implemented `src` tree: `94f2d3cd08ba62d01ea00f77e5cb8362dc47e174`.

The Gate C run-phase receipt was not passed to the run-task resolver. Its
receipt-less `approval_required`, `contract_ready=true` result was treated as
compatibility evidence only. The user's Task 148 work order and targeted
`P27-10` scope-repair approval supply write authority. Task 146/147 semantics
and evidence, `P27-06`, `P27-08`, `use-dnd`, hooks, datastore/repository
semantics, and later tasks remain unchanged.

## Realized contract

- BreakdownPanel consumes a newly observed local authoritative Add identity
  and Workspace projects only `{kind, operationId, sourceBreakdownId}` from a
  local Unstage callback's direct or reconciled `applied`/current-operation
  `already_applied` terminal result. The Workspace boundary maps the source ID
  to the shared target-row identity; no Staging disappearance is authority.
- Each `{kind, operationId, target row ID}` is remembered once for the current
  page mount. Rerender, same-identity reconciliation, Scratch switch-away/back,
  reload, and remote projection do not replay it. A different identity clears
  the prior signal and starts one new timeline.
- A qualifying identity is retained without starting its timer while its Add
  row is absent or its Unstage source is still staged. The full 1600ms timeline
  begins only after the target is mounted as an active Breakdown row.
- The reserved non-interactive slot before the stable action cluster renders
  exact `✓ Added.` or `✓ Returned to Breakdown.` copy. The literal check is
  `aria-hidden`; the exact copy is announced by one polite atomic row-local
  status. Inline edit preserves the same slot, signal, and remaining lifetime.
- Ordinary motion applies the theme success surface/border treatment and a
  600ms `ease-out` wash. Reduced motion skips animation and holds the static
  theme distinction for the same 1600ms. No toast, global success status,
  permanent Unstage/Retry control, or replay path was added.

## TDD and review repair

| Cycle | RED | GREEN / result |
| --- | --- | --- |
| Identity and lifetime | Focused tests failed for missing copy, row state, identity deduplication, interruption, 1600ms removal, focus, and Scratch-switch non-replay. | Add and direct/reconciled Unstage identities drive the shared one-shot signal once; different identities interrupt and same identities are ignored. |
| Projection authority | Workspace tests failed because the mounted Unstage terminal callback did not expose its authoritative identity to Breakdown. | The approved `P27-10` owner projects only local terminal success and leaves Stage/failure/disappearance paths unchanged. |
| Review repair | Three focused regressions failed: a staged source started the timer early, a delayed Add lost lifetime, and inline edit removed the status early. | Identity consumption queues until the target is mounted active, then receives the full 1600ms; inline edit renders the same signal slot. Follow-up review found no remaining Critical, Important, or Minor issue in these repairs. |

## Verification commands

| Command | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm exec vitest run` over BreakdownPanel, Workspace, StagingZone, and centralized-copy Task 148 files | 0 | 4 files / 188 tests passed |
| `pnpm test` | 0 | 94 files / 974 tests passed |
| `pnpm lint` | 0 | 0 errors; the same 11 existing warnings outside Task 148 paths |
| `pnpm typecheck` | 0 | TypeScript passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven routes generated |
| `git diff --check` | 0 | No whitespace errors |

## Browser modality evidence

Local Chromium exercised the actual production build at `1440x900` through
the visible application controls and real pointer DnD.

- Add kept focus in the Add input, rendered one row-local `Added.` status with
  the hidden literal check, applied exact `data-triage-state="success"` and
  `data-triage-success-kind="add"`, retained copy through 1600ms, then cleared
  it. Reload did not replay it.
- A real Breakdown → Node Staging pointer drop produced no Unstage success.
  Dragging that candidate back rendered `Returned to Breakdown.` only after
  the candidate projection was gone and the source row was active with its
  grip enabled. Exactly one row-local status appeared, no Staging alert/toast
  appeared, focus was on the restored grip, and reload did not replay it.
- GridDO, Tiny Desk, New Morphism, 3D Clay, Origami, Terminal, Retro Mac, and
  Graphite were each selected through the theme UI with a fresh success. Every
  computed style exposed `breakdown-success-wash`, `0.6s`, and its semantic
  surface/border/shadow realization without geometry movement.
- Under `prefers-reduced-motion: reduce` in Graphite, computed animation was
  `none`; the static success background, border, and editorial rule remained
  for the same 1600ms before clearing in one step.

Durable PNGs:

- `task-148-add-griddo.png`
- `task-148-unstage-graphite.png`
- `task-148-reduced-motion-graphite.png`

## Checkpoint buckets

- Visible now: authoritative Add/Unstage row signal, exact copy, focus,
  announcement, interruption, active-row gating, eight themes, ordinary
  motion, reduced motion, and reload non-replay.
- Review now: Task 148 implementation and evidence acceptance. Task 148 remains
  `[ ]` until explicit user acceptance.
- Planned later: `P27-08` confirmed-orphan production/browser reachability
  remains deferred and untouched.
- Blocker: none.
