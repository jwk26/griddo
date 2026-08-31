# Phase 29 — Mounted-Page Newly Placed And Undo

## Completion Summary

Tasks 155–158 were explicitly accepted on the isolated
`phase-29/mounted-page-newly-placed-undo` branch. The phase delivers
mounted-page local placement provenance, actual-card Newly markers and
source-aware Undo, the complete `DP-VQ10` state realization, and Search-result
Undo composition. Its equal-weight workflow pilot closes with a revised
comparative audit and an unapplied post-publication improvement handoff.
Phases 30–31 remain unstarted.

| Task | Accepted deliverable | Implementation / evidence | Acceptance |
| --- | --- | --- | --- |
| 155 | Mounted-page Newly provenance over actual Node/Bit cards | `0bdd1a8` → `638789c` | `2dfab80` |
| 156 | Ordinary-card source-aware Undo independent of Search | `5b37084` + `b81bd44` → `bd93576` | `d0bb079` |
| 157 | `DP-VQ10` Newly/Undo state realization | `86f2ea5` + `61c6b03` + `489f6a0` → `fef2c01` | `57afa67` |
| 158 | Explorer Search-result Undo composition | `f041af0` + `81c2f1e` → `0ccbae0` | `197e2dc` |

The final accepted product `src` tree is
`36a32647ec8fd7587e0942960f948881d819f624`. Task evidence blobs are
`826065b13667680a62919790961f17eaa95ca4c2`,
`5c9369e6c407631d72f7f2d6c5583bd6d25dda2a`,
`a713032fc6c92cb2eb0421c96b834a814242b735`, and
`60808058ce5f5f631cd333c0117778791abfc727`.

## Accepted Foundation

- Only results created by the mounted Inbox page receive in-memory Newly and
  Undo provenance; Scratch/path/theme changes preserve it and route exit or
  reload ends it.
- NodeCard and BitCard remain the actual card owners. Selection, Newly,
  eligibility, operation state, and focus are independent semantic states.
- Ordinary Undo validates exact result, source, candidate, descendants,
  placement lock, shared operation lock, and edit intent before the single
  authoritative command. Pending/unknown/reconciling retain provenance and
  terminal success restores the correct source/candidate semantics.
- `DP-VQ10` checking, available, re-enabled, unavailable, pending, unknown,
  reconciling, not-applied, conflict, Retry, and success mappings are reflected
  in the approved recipe and design-token owners.
- Search-result Undo reuses the ordinary model without becoming a DnD source,
  retains query/scroll for non-success, removes only the successful result,
  and focuses the current next result at the removed index or the input.

These accepted behavioral and DOM/state contracts do not establish prototype
or theme visual fidelity.

## Verification And Acceptance

Every task has committed product evidence, workflow measurement, and explicit
user acceptance in
[`docs/issues/Issues_Phase_29.md`](../../issues/Issues_Phase_29.md). The fresh
candidate-pinned end-phase terminal gate ran at clean pre-close
`197e2dc92c39b85d6b62319ae7f18edbd73c15ce`; no superseded Candidate A result
was reused:

| Command | Exit | Result | Elapsed |
| --- | ---: | --- | ---: |
| `git diff --check` | 0 | no whitespace errors | `0.00s` |
| focused `pnpm typecheck` | 0 | TypeScript passed | `3.95s` |
| `pnpm test` | 0 | 99 files / 1,196 tests | `23.26s` |
| `pnpm lint` | 0 | 0 errors / 11 unchanged warnings | `8.57s` |
| `pnpm typecheck` | 0 | TypeScript passed | `1.28s` |
| `pnpm build` | 0 | Next.js 16.2.1; seven routes | `11.40s` |

The full four-command total was `44.51s`. Runtime token/accounting and prompt
bytes were `not measured`. Task owner tests remain evidence only for their
declared DOM/state/interaction invariants; no Phase 29 browser visual-fidelity
comparison was run.

## Visual Finding And Explicit Deferral

After stale `.next` output was cleared and fresh development output was
generated, the user manually observed that ordinary Explorer Node/Bit cards no
longer resemble the theme-specific compact card/list treatment in the eight
Inbox prototypes. The broader latest Inbox surface also remains materially
distant in theme-specific typography, borders, section treatment, Breakdown
Edit/Delete controls, Node/Bit card shapes, and related visual details.

This is one `Advisory`, user-approved `Explicitly Deferred` issue (`P29-01`),
not visual acceptance. Exact route, viewport, capture ID, theme/mode,
interaction/focus metadata are `not captured`; elapsed time and token usage are
`not measured`. Read-only source inspection confirms only that ordinary
Explorer rows compose shared `NodeCard`/`BitCard` owners. The Phase 29
Explorer-card gap remains distinct from broader campaign-wide eight-theme
fidelity debt.

No Phase 29 product repair occurs before close. The resume owner is Phase 31,
after Task 163 integration and before Task 164 repair work: a read-only audit
against the eight prototype routes and canonical recipes must name exact
owners, paths, affected tasks, and follow-up scope. The audit grants no repair,
task reopening, owner expansion, product/design decision, or new-task
authority. Task 164 owns only its canonical conformance/fidelity contract and
any separately approved follow-up plan.

## Phase 30 Browser-Evidence Handoff

- Do not run an eight-theme × light/dark × multi-viewport Phase 30 fidelity
  matrix; Task 164 owns the aggregate comparison.
- Task 159 keeps its current canonical visual authority and receives bounded
  running-app evidence for eligibility transition, Cancel/Reopen, withdrawal,
  and focus. It does not start a visual redesign or overall-fidelity repair.
- Task 160 receives one bounded representative check for fixed Context
  geometry and blocker placement, not a full theme matrix.
- Tasks 161–162 may share one final-input browser session for real
  `sessionStorage`, reload/reconciliation ordering, and browser
  focus/lifecycle invariants not established by owner tests.
- Newly observed mismatches are recorded and not silently repaired outside the
  active task contract.
- Task 164 retains the full eight-theme, light/dark, viewport, motion,
  accessibility, and prototype/recipe comparison required by its canonical
  contract.

## Canonical, Issue, And Conformance Reconciliation

- Tasks 155, 156, and 158 have canonical impact `None`. Task 157 is
  `Reflected` only in its approved Newly/Undo recipe and
  `docs/DESIGN_TOKENS.md`. No unresolved `Tagged` item remains.
- Active Phase 29 issues: `0`. Blocking conformance violations: `0`.
  Advisory conformance findings: `1`, `P29-01`, terminally Deferred.
- `docs/issues/Issues_Deferred.md` contains the synchronized navigation pointer
  and explicitly grants no implementation authority.
- The Task 158 acceptance message omitted the requested word `checkpoint`.
  Parent/tree/scope/acceptance are exact, so the audit records it as a
  non-material workflow variance and does not rewrite history.
- The revised workflow audit retains all actual measurements, supplies all 11
  hypothesis verdicts and seven decision answers, and records safeguards,
  limitations, owner classification, and the exact unapplied change/test plan.
- No new entry is added to `docs/execution-plan/LEARNINGS.md`: the experiment
  remains owned by its audit and post-publication handoff. Phase Notes are
  `not used` by Adapter policy.

## Integration And Workflow Handoff

The primary integration worktree is clean on `main` at
`f3c2be6b2afa2da51cde39d22c13eabf2286f296`, equal to fresh `origin/main`.
The earlier user-owned integration changes remain preserved, untouched, in
stash `fbc33307802ca8a1baa334eb3f20507f39c86c9d` and preservation branch
`wip/storage-reliability-cloud-sync-2026-08-26` at
`f92189d3a698cce2fab98b1d8fb981647f387771`; unrelated stash
`de07832a8b4150203b663349a1eaf220bfd4b1a6` also remains untouched. The stale
primary-integration blocker is resolved by that verified preservation state.

The final workflow recommendation is not the one-off support commit
`fbd1a1995b50c26c3e669bdb5243cec3ca324bb8`. That commit stays historical and
read-only. After Phase 29 publication, integration sync, and cleanup, a
separate workflow-improvement lifecycle may start only when pinned to the
merged Phase 29 audit blob, exact Final Close receipt blob/SHA-256, and
candidate `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`.

The Final Close receipt remains absent. No push, PR, merge, integration sync,
cleanup, or Phase 30–31 implementation occurred during candidate preparation.

**Full issue log:**
[`docs/issues/Issues_Phase_29.md`](../../issues/Issues_Phase_29.md)

**Comparative workflow audit:**
[`docs/verification/inbox-triage/phase-29-workflow-pilot-audit.md`](../../verification/inbox-triage/phase-29-workflow-pilot-audit.md)
