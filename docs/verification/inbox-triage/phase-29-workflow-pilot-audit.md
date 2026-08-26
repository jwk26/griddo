# GridDO Codex Workflow Phase 29 Pilot Audit

> Status: Inactive until the separately approved Phase 29 Gate C
> Created: 2026-08-26 during the Phase 28 close preview
> Evidence role: Phase 29 workflow experiment continuity and comparison owner
> Authority: Not product, plan, skill, Adapter, receipt, or acceptance authority

## Authority

This file owns Phase 29 experiment evidence only. Product contracts and the
two-track gate remain in `docs/EXECUTION_PLAN.md`; execution state and issue
disposition remain in the future Phase 29 ledger; lifecycle authority remains
in exact whole-file receipts. This file cannot mark a task `[x]`, change the
workflow candidate, modify the Project Adapter, or authorize publication.

The audit is created by the Phase 28 close but remains inactive until Phase 29
receives its own Gate C. Phase 29 must use the unchanged candidate commit:

`94e89782f7fe2cdbdd035e842ca6881b4a87ce49`

Terminal Phase 28 baseline:

- Path: `docs/verification/inbox-triage/phase-28-workflow-pilot-audit.md`
- Close-preview Git blob: `59948cc5ec3891babc6b14f859d1608697c0c2bd`

At Phase 29 kickoff, record the exact merged Phase 28 commit, merged Phase 28
audit blob, Phase 28 Final Close receipt, Phase 29 Gate C, branch, worktree,
base, and kickoff HEAD. None exists in this inactive baseline, so no SHA or
receipt placeholder is used as evidence.

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
| 155 |  |  |  |  |  |  |  |  |  |  |  |  |
| 156 |  |  |  |  |  |  |  |  |  |  |  |  |
| 157 |  |  |  |  |  |  |  |  |  |  |  |  |
| 158 |  |  |  |  |  |  |  |  |  |  |  |  |

### Repair and stop rows

| Task / cycle | Actual trigger or finding | Owner discovery / `Unowned` | Focused evidence | Full-gate reuse/rerun/invalidation | Browser or owner-test evidence | Scope disposition | Outcome |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |

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
