# GridDO Codex Workflow Phase 29 Pilot Audit

> Status: Phase 29 pilot active
> Created: 2026-08-26 during the Phase 28 close preview
> Evidence role: Phase 29 workflow experiment continuity and comparison owner
> Authority: Not product, plan, skill, Adapter, receipt, or acceptance authority

## Authority

This file owns Phase 29 experiment evidence only. Product contracts and the
two-track gate remain in `docs/EXECUTION_PLAN.md`; execution state and issue
disposition remain in the future Phase 29 ledger; lifecycle authority remains
in exact whole-file receipts. This file cannot mark a task `[x]`, change the
workflow candidate, modify the Project Adapter, or authorize publication.

The audit was created by the Phase 28 close and activated by the separately
approved Phase 29 Gate C on 2026-08-28. Phase 29 uses the unchanged candidate
commit:

`94e89782f7fe2cdbdd035e842ca6881b4a87ce49`

Terminal Phase 28 baseline:

- Path: `docs/verification/inbox-triage/phase-28-workflow-pilot-audit.md`
- Close-preview Git blob: `59948cc5ec3891babc6b14f859d1608697c0c2bd`

Phase 29 kickoff identity:

- Gate C receipt: `docs/issues/Issues_Phase_29.gate-c.json`; user statement
  `내 승인합니다`; disposition `approved`; first sequential batch Task 155 only.
- Integration, approved base, and pre-document kickoff HEAD:
  `f3c2be6b2afa2da51cde39d22c13eabf2286f296`; no base exception.
- Feature branch: `phase-29/mounted-page-newly-placed-undo`.
- Linked worktree:
  `/Users/jwk/Documents/griddo2-codex-phase-29-mounted-page-newly-placed-undo`;
  new worktree, no reuse.
- Candidate: branch `post-v1/workflow-candidate-low-cost`, commit
  `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`.
- Adapter blob: `7903892c04c4eb6fcd694712d5a01fdb608e183f`.
- This pre-kickoff audit blob:
  `21a1a8b6e23c4aef22bf360961bf7b4235563aa2`.
- Original Phase 28 Final Close receipt:
  `docs/issues/Final_Close_Phase_28.json`, SHA-256
  `d9b844a4ec666c9de759ca439f22cf1f2d3e51e9829ca07ffc82bf0882b46cbb`,
  receipt commit `5595e96ef3414143219af1e239918c34456ad0f9`, merge
  `3b2782287bc12fa6595427254cd4c698d60e5105`, PR #43.
- Merged Phase 28 audit blob:
  `59948cc5ec3891babc6b14f859d1608697c0c2bd`.
- Phase 28 post-close smoke repair Final Close receipt:
  `docs/issues/Final_Close_Phase_28_Post_Close_Smoke_Repair.json`, SHA-256
  `0d90eaf5d058c2d33cee7c1f42df9d463d378f40c334254a679eaa6894712aba`,
  receipt commit `7a2d2df26e8db0269788e50bd73b3ce8fb6c624d`, merge
  `f3c2be6b2afa2da51cde39d22c13eabf2286f296`, PR #44.

No Task 155 measurement row or relevant-input fingerprint exists at kickoff.
The pinned `run-task` constructs those only from its exact approved worktree
inputs after the separate Task 155 lifecycle starts.

During Phase 29 the candidate skill and Project Adapter are read-only. Any
candidate or Adapter improvement requires a separate user-approved lifecycle
after Phase 29 publication and cleanup, pinned to the exact merged Phase 29
audit blob and Final Close receipt.

## Two-track invariant

- Track A owns Tasks 155–158 product implementation and user acceptance.
- Track B owns unchanged-candidate replication, measurements, comparative
  workflow audit, verdicts, limitations, and the exact unapplied change plan.
- Track A and Track B have equal weight at every implementation checkpoint and
  at phase close.
- An audit row never marks a task `[x]`; product acceptance never manufactures
  an audit verdict.
- A Task 155–158 implementation checkpoint is incomplete unless both its
  product evidence and matching audit row are committed.
- Acceptance-only commits record only minimum acceptance/disposition and do
  not alter the audit.
- Phase 29 cannot close without the completed comparative audit.

## Owner separation

| Owner | Owns | Does not own |
| --- | --- | --- |
| `docs/EXECUTION_PLAN.md` | Product contracts and the Phase 29 two-track gate | Measurement detail or audit verdicts |
| Phase 29 issue ledger | Execution state, issue disposition, and next action | Product contract duplication or measurement tables |
| `docs/verification/inbox-triage/task-NNN.md` | Commands and detailed product results | Workflow verdicts or task acceptance |
| This audit | Measurements, Phase 28/29 comparison, findings, limitations, and skill verdicts | Product authority or `[x]` |
| Acceptance-only commit | Minimum acceptance and issue disposition | Audit-row edits or repeated product evidence |

After Gate C, the execution header is exactly `Phase 29 pilot active` without a
task number. Only the Phase 29 `end-phase` session may replace it with the
terminal header.

## Session continuity

Every fresh Control Tower or lifecycle handoff must include:

- candidate pin;
- Phase 29 branch, worktree, base, and HEAD;
- Adapter and Gate C identity;
- this audit path and current blob;
- last accepted Task and last committed audit row;
- next product action and next audit action;
- open audit hypotheses and findings;
- exact relevant-input fingerprint;
- Control Tower and Working-session maintain/rollover judgment;
- duplicate-session prohibition; and
- exactly one next legal action or user gate.

Same-Task prompts remain delta-only and include the audit-row delta. The
Control Tower must not approve an implementation checkpoint if the row is
missing or disagrees with product evidence.

## Measurements

Record actual values only for Tasks 155–158 and for every repair or durable
stop. Never estimate or backfill a missing value.

Required fields:

- risk tier;
- focused result, count, and elapsed;
- full gate run/reuse and elapsed;
- exact relevant-input fingerprint;
- token/accounting, or `not measured`;
- prompt modality/count and size only when mechanically available;
- Control Tower/Working-session create, maintain, or rollover and duplicate
  count;
- browser modality and the exact claimed invariant;
- owner-test substitution invariant;
- documentation paths/count and line delta when available;
- owner-discovery stops;
- repair cycles and extra-cycle gates;
- concrete review findings and outcome;
- gate reuse, rerun, and invalidation;
- scope stop and `Unowned` result;
- escaped defect.

### Task measurement rows

| Task | Risk | Focused result/count/elapsed | Full gate run/reuse/elapsed | Relevant-input fingerprint | Token/accounting | Prompt/session | Browser / owner-test invariant | Docs | Stops / repairs / review | Gate lifecycle | Escaped defect | Outcome |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 155 | High | Latest focused passed 5 files / 161 tests in `3.30s` | Latest-input full gate run, not reused: test 99 files / 1,154 tests `20.16s`; lint 0 errors, 11 unchanged warnings `6.16s`; typecheck `1.18s`; build `9.06s`; serial total `36.56s` | `1a491bbd2bda0fb26c9af723704ed657a47399472053d8d5d9700500549e8821`; implementation `0bdd1a88e1eb3c455ff8b156318f18ab7ca3b449`, `src` tree `4c20c83e393e76a10528606637a3a9be88f92183`, 99-test manifest `a011caccb51fef23f48c1cbc412568e393f987addc78170dfbbfae44a447bc8b`, exact 10-path manifest `a616930e6ebbfa9fcb63564dbdf337804b60dcb89b75ec2e3deb60e559701804`, config/command manifest `74ee27da90dc45cf1aa210c279e471a73aaf257a5ee35b4f1fcecbea06d74647` | Runtime token/accounting `not measured` | One exact Task 155 work-order prompt; prompt bytes `not measured`; Control Tower maintained, Working session maintained, duplicate count 0 | No browser run; mounted Workspace/Explorer/Card owners directly prove authoritative local result → actual typed card, independent marker/type pinning, Scratch/path/theme preservation, and remount clearing; no computed-style claim | 3 paths; `+132/-7` lines | Two bounded repair cycles; zero owner/scope stops or extra-cycle gates; review repaired scroll-identity divergence and missing immutable source/candidate Undo snapshots; final High-risk review found no remaining concrete issue | Gate C baseline not reused; first Task 155 full gate `37.25s` invalidated by snapshot repair; all focused/full inputs rerun | None observed at checkpoint | Implemented awaiting review; marker `[ ]`; Tasks 156–158 held; no final workflow verdict |
| 156 |  |  |  |  |  |  |  |  |  |  |  |  |
| 157 |  |  |  |  |  |  |  |  |  |  |  |  |
| 158 |  |  |  |  |  |  |  |  |  |  |  |  |

### Repair and stop rows

| Task / cycle | Actual trigger or finding | Owner discovery / `Unowned` | Focused evidence | Full-gate reuse/rerun/invalidation | Browser or owner-test evidence | Scope disposition | Outcome |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 155 / cycle 1 | Initial hook/card/Explorer/Workspace REDs plus Motion DOM-prop typecheck failure and diff-review scroll identity finding | No owner stop; all writes stayed in the 10 approved product/test paths; `Unowned: None` | Final cycle-1 focused passed 5 files / 161 tests | Full gate passed on then-current input (`37.25s`) but was invalidated by cycle 2 | Mounted owner tests proved actual-card marker/pinning/lifetime; no browser-only claim | Implementation-local API and shared projection repairs | Proceeded to High-risk review |
| 155 / cycle 2 | High-risk review found IDs/versions could not supply future Undo's immutable source/candidate snapshots after candidate deletion | No expansion: Workspace and canonical Newly hook are approved owners; `Unowned: None` | Snapshot RED failed 3/3 hook tests; final focused passed 5 files / 161 tests in `3.30s` | Cycle-1 full gate invalidated; latest full gate reran all four commands and passed in `36.56s` | Mounted Workspace captured exact pre-dispatch authoritative snapshots; hook tests proved direct/staged provenance | Repaired within Task 155 future-Undo provenance boundary | Implemented awaiting checkpoint; no third cycle |

## Carried post-close findings

These findings have no Phase 29 verdict at kickoff. Tasks 155–158 measure and
disposition them without treating audit evidence as product authority.

1. The original workflow had no legal post-close repair receipt lifecycle.
2. One-off workflow-support candidate
   `fbd1a1995b50c26c3e669bdb5243cec3ca324bb8` and an Adapter extension were
   required for repair publication.
3. That support candidate is historical evidence, not the Phase 29 candidate
   or a preselected permanent improvement.
4. The post-close product repair used explicitly approved repair cycle `4/4`.
5. A permanent `.next`/Turbopack stale generated-output safeguard is
   `Unowned`.
6. The `test-task4-craft-docs` stale SUT evidence hash failure already exists
   at candidate base `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`.
7. Do not regenerate that unrelated stale evidence without separate owner
   approval.
8. Evaluate lifecycle coverage, bounded repair budgets, browser evidence,
   escaped-smoke handling, session rollover, and durable evidence ownership.
9. Keep the already implemented one-off receipt compatibility support
   separate from Phase 29's future audit verdict.

## Carried hypotheses

No carried item has a final verdict at baseline. Phase 29 must replicate and
compare each item before assigning `retain`, `change`, `reject`, or
`insufficient evidence`.

| ID | Carried hypothesis | Phase 29 revalidation |
| --- | --- | --- |
| `WF28-01` | Risk-tiered TDD | Test whether the High-risk three-cycle budget is appropriate and identify the evidence-confirmed minimum repair class. |
| `WF28-02` | Content-addressed evidence reuse | Test exact relevant-input reuse and invalidation without stale evidence. |
| `WF28-03` | Focused per-task gates and clustered full gates | Compare focused/full coverage, elapsed time, and defects found only by full gates. |
| `WF28-04` | Separate end-phase audit from TDD | Keep product repair in `run-task` while end-phase owns completion/conformance/transaction audit. |
| `WF28-05` | Reduce canonical and ledger duplication | Revalidate documentation-owner separation and contradictory-state cost. |
| `WF28-06` | Early owner discovery and bounded repair authority | Discover producer, mounted owner, consumer, and direct-test seams before locking scope. |
| `WF28-07` | Shift blocking conformance earlier | Record where concrete conformance findings first arise and which review caused an actual repair. |
| `WF28-08` | Delta-only continuation prompts | Measure lifecycle continuity, rollover judgment, and duplicate-session prevention. |
| `WF28-09` | Risk-matched browser evidence | Use proportional browser evidence only for the exact browser-only invariant. |
| `WF28-10` | Compact checkpoints and review proportionality | Separate review that changed product evidence from review that added no finding. |
| `WF28-11` | Separate publication guards from repeated verification | Keep product evidence lifetime distinct from volatile transaction-state guards. |

Tasks 155–158 are expected to be primarily High risk. Medium- and Low-risk
relaxations may therefore remain unvalidated; record that as a limitation
rather than inferring a result.

## Seven decision questions

All seven questions remain open at kickoff.

1. Which candidates reduced elapsed time or tokens without an escaped defect?
2. Which safeguards detected a real defect and must remain mandatory?
3. Which repeated gates had identical relevant input fingerprints?
4. Which documentation fields had more than one competing owner?
5. Which scope stops represented a real user decision versus a discoverable
   implementation owner?
6. What belongs in `run-task`, `end-phase`, the Project Adapter, or only the
   Control Tower operating policy?
7. What exact candidate skill tests must change before rollout?

## Required terminal outputs

Phase 29 `end-phase` must provide all of the following before close:

- Phase 28/29 comparison;
- a `retain` / `change` / `reject` / `insufficient evidence` verdict for every
  `WF28-01`–`WF28-11` item;
- answers to all seven decision questions;
- mandatory safeguards that must remain;
- the `run-task`, `end-phase`, Adapter, or Control Tower owner for each
  improvement;
- an exact skill/reference/test/scenario change plan that was not applied
  during Phase 29;
- every insufficient-evidence limitation; and
- a post-Phase-29 handoff pinned to the merged audit blob and Final Close
  receipt.

Phase 29 does not modify the candidate skill or Adapter and does not
automatically extend the experiment into a third pilot.
