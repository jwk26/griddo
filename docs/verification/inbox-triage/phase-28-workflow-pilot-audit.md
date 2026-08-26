# GridDO Codex Workflow Phase 28 Pilot Audit

> Status: Phase 28 pilot active; Task 149 implementation checkpoint recorded
> Created: 2026-08-24
> Scope: Workflow cost, speed, verification, and documentation efficiency
> Evidence role: Tracked Phase 28 experiment evidence
> Authority: Not canonical product, design, policy, plan, or workflow authority

## Purpose

Phase 27 used the candidate Codex workflow derived from the earlier Claude
workflow. It produced strong traceability and verification, but the user
observed three material operating costs:

1. Task execution was too slow.
2. Token consumption was too high.
3. Document consistency work consumed disproportionate effort.

Phase 27 will finish under the currently pinned workflow. Phase 28 will pilot
lower-cost operating rules during real task execution. At Phase 28 close, the
pilot evidence will be used to decide and implement changes to the candidate
workflow skill and, where necessary, the Project Adapter.

This document records candidates and observations as they arise so the Phase
28 skill decision does not depend on conversation memory.

## Current anchors

- Workflow candidate commit:
  `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`
- Candidate branch: `post-v1/workflow-candidate-low-cost`
- Phase 27 accepted pre-close anchor:
  `983595cd40f491a40bb4c1a474058596b061d01e`
- Phase 27 accepted `src` tree:
  `7b831a941d40631c2212d07a010f3c6b4a00e01a`
- Phase 27 candidate A:
  `6d854c0dc2f2a61e32a0796877cac8a7ce32b4ba`
- Phase 27 receipt B:
  `04301a816ca75501e0d499b70af3be2e48374488`
- Phase 27 integration merge:
  `8cb2d904a55c136ca319e7bdf619d8e5d962fce8`
- Phase 27 publication: GitHub PR `#42`, merged on 2026-08-24; local and
  remote `main` synchronized at the merge commit; feature/preview branches and
  worktrees cleaned

## User decisions already made

- Do not retrofit the lower-cost experiment into the remaining Phase 27
  lifecycle.
- Start the experiment with Phase 28 task execution.
- Evaluate the experiment at Phase 28 close before changing the workflow
  candidate itself.
- Prefer delta-only prompts when an existing Working session already holds the
  relevant repository, scope, and recovery context.
- Do not repeat verification merely because a checkpoint or acceptance-only
  commit was created. Reuse successful evidence when its relevant inputs are
  unchanged.
- Automatically continue evidence-confirmed, minimum, semantics-preserving
  scope repairs when they fall under an explicit pre-approved repair class.
  Escalate actual product, design, policy, data, or lifecycle decisions.
- Keep browser evidence proportional to canonical interaction requirements;
  do not repeat unrelated edge, cross-tab, theme, or reduced-motion matrices.

## Audit candidates

### `WF28-01` — Risk-tiered TDD

**Phase 27 observation:** The workflow applied a similar RED-to-GREEN ceremony
to changes with very different risk. Small class, copy, or deterministic
handoff corrections paid much of the same process cost as async data and DnD
state-machine work.

**Phase 28 pilot:**

- High risk: retain test-first behavior for persistence, concurrency,
  reconciliation, destructive commands, focus/lifecycle coordination, DnD
  mutation, and shared APIs.
- Medium risk: require focused behavioral coverage, but allow an existing
  failing test or direct reproduction to serve as RED evidence.
- Low risk: allow implementation plus focused regression assertion without a
  separately committed or separately reported RED stage for localized style,
  copy, or deterministic presentation changes.
- Never use the lower tier to bypass missing product authority or user-visible
  evidence.

**Measure:** repair cycles, tests added or modified, defects caught before the
checkpoint, elapsed gate time, and tokens spent describing the TDD loop.

### `WF28-02` — Content-addressed evidence reuse

**Phase 27 observation:** The `P27-12/P27-13` implementation passed the full
95-file/982-test gate at `c56439a…`. The acceptance commit `983595c…` changed
only the issue ledger and preserved the exact `src` tree, yet the current
end-phase contract still requests a fresh terminal product gate.

**Phase 28 pilot:** Record the relevant input fingerprint for each successful
gate: at minimum source tree, test tree, build/config inputs, command identity,
and environment requirements. Reuse the result only when all relevant inputs
match. Always refresh temporally unstable external evidence such as fetched
integration state and mergeability.

**Measure:** reused versus rerun gates, avoided wall time, stale-evidence
mistakes, and repairs that invalidated only part of a gate set.

### `WF28-03` — Focused per-task gates and clustered full gates

**Phase 27 observation:** Many adjacent tasks repeatedly ran the complete test,
lint, typecheck, and build suite even though their changes formed one coherent
interaction cluster and later tasks superseded the same inputs.

**Phase 28 pilot:** Run focused gates for every task. Run a full gate at a
declared risk boundary, shared-owner/API change, cluster checkpoint, or phase
close. A failed focused gate or widened blast radius promotes the current task
to a full gate immediately.

**Measure:** number of full gates per task and per cluster, failures found only
by the full gate, and total verification time.

### `WF28-04` — Separate end-phase audit from TDD

**Phase 27 observation:** Wording such as “audit is green” made the close
process sound like another TDD loop. End-phase does not implement product
behavior; a product failure must return to a bounded `run-task` repair.

**Phase 28 pilot:** Define end-phase as transaction and conformance audit, not
TDD. Before candidate A, verify acceptance, issue disposition, canonical
impact, clean identity, current integration state, and required close content.
Do not create failing product tests or repair product code inside end-phase.

If candidate A is close-doc-only and product/test/build input fingerprints are
unchanged, run close-artifact validation instead of repeating the product full
gate. Any product-input change requires the appropriate terminal gate before
candidate A.

**Measure:** duplicate end-phase gates avoided, close defects, and repair
lifecycle escapes from end-phase.

### `WF28-05` — Reduce canonical and ledger duplication

**Phase 27 observation:** The same task state, verification counts, SHAs,
scope, exclusions, and next action were repeated in the execution plan, issue
ledger, evidence document, checkpoint report, and acceptance commit.

**Phase 28 pilot:**

- Keep product/task contracts in the canonical plan.
- Change the plan only for a real contract or authority change.
- Keep execution state, issues, disposition, and next action in the ledger.
- Keep commands and detailed results in one evidence record.
- Let checkpoint reports reference those committed sources instead of copying
  their full contents.
- Acceptance-only commits should change only the minimum durable state owner.

**Measure:** documentation paths and lines changed per task, contradictory
state corrections, and tokens used to restate committed information.

### `WF28-06` — Early owner discovery and bounded repair authority

**Phase 27 observation:** Task 147 stopped separately for `P27-07`, `P27-08`,
and `P27-09`; Task 148 stopped for `P27-10`. Several stops resulted from the
canonical owner list excluding an already-existing mounted state owner or a
read-only projection required by the accepted behavior.

**Phase 28 pilot:** At task start, inspect the actual producer, mounted owner,
consumer, and test seams before locking the final write set. The Phase 28
kickoff may pre-authorize narrowly defined repairs that:

- add only the demonstrated existing owner/test pair;
- preserve the accepted semantics;
- introduce no new product, design, policy, persistence, or lifecycle choice;
  and
- are recorded durably at the next checkpoint.

Anything outside that class still stops for the user.

**Measure:** scope-drift stops, separately committed reflection-only steps,
incorrect automatic expansions, and elapsed time to first production write.

### `WF28-07` — Shift blocking conformance earlier

**Phase 27 observation:** `P27-11` found a blocking component-level
`liveQuery`/direct DataStore read only during end-phase, after Task 141 had
already been accepted. Repair required reopening product work and invalidated
the initial close audit.

**Phase 28 pilot:** Resolve task-relevant Blocking conformance rules during
owner discovery and diff review. Run full semantic conformance only at the
cluster or phase boundary. Advisory rules remain packet-visible and do not
create routine task gates.

**Measure:** blocking findings first discovered at end-phase, false-positive
conformance effort, and reopened accepted work.

### `WF28-08` — Delta-only continuation prompts

**Phase 27 observation:** Existing Working sessions were sometimes asked to
re-read or re-verify identity and context they already held. This increased
tokens and created confusion between resuming a Working session and opening a
new Control Tower.

**Phase 28 pilot:**

- Fresh task sessions receive complete candidate and recovery identity.
- Same-task repair, verification continuation, and acceptance-only prompts
  contain only the new checkpoint, approved delta, prohibited delta, and stop
  gate.
- Do not create a duplicate session while the existing owner remains alive and
  coherent.
- At every checkpoint, evaluate both the Control Tower's accumulated context
  and the active `run-phase`/`run-task`/`end-phase` session's context. Report
  Control Tower stay/rollover and lifecycle-session stay/fresh explicitly.
- When rollover is indicated, provide the durable authority summary, existing
  prompt/session state, duplicate-session prohibition, next legal action, and
  a copy-ready fresh-session handoff without waiting for another user request.
- Apply `leave what the skill could do`: prompts provide fixed identity,
  user-approved scope and prohibitions, current durable state/blocker, and the
  next user gate, while leaving repository discovery, readiness, TDD order,
  verification sequencing, resolver/checkpoint templates, and general stop
  rules to the pinned lifecycle skill.
- Treat a user-pasted lifecycle checkpoint as a request for narrow acceptance
  review. If committed state and required evidence have no material finding,
  treat the user as approving that checkpoint and immediately provide the
  acceptance-only or next-legal-action prompt without asking for a duplicate
  approval sentence. Final Close and any genuine product/design/policy/data or
  lifecycle expansion remain explicit user gates.

**Measure:** prompt size, repeated identity blocks, duplicate sessions, and
recovery mistakes.

### `WF28-09` — Risk-matched browser evidence

**Phase 27 observation:** Browser evidence was valuable for real drag, focus,
signal lifetime, hydration, theme, and reduced-motion claims, but repeating
complete matrices after unrelated or narrowly scoped changes would add little
confidence.

**Phase 28 pilot:** Use browser evidence only for canonical behavior that
cannot be established by owner tests, such as actual pointer DnD, browser
focus, route lifecycle, computed style, or visual/theme acceptance. Re-run only
modalities whose input or claimed invariant changed. Allow one user-owned
phase smoke to combine accepted task evidence.

**Measure:** browser runs, repeated unchanged matrices, browser-only defects,
and manual smoke repairs.

### `WF28-10` — Compact checkpoints and review proportionality

**Phase 27 observation:** Checkpoints and independent reviews sometimes
repeated the committed evidence rather than adding a new risk judgment.

**Phase 28 pilot:** Checkpoints report exact SHA/tree, clean state, write set,
gate summary, remaining material risk, and next legal action. Use independent
review only for shared state/API, async lifecycle, destructive behavior,
complex interaction, weak coverage, or material blast radius. A low-risk
localized change receives direct diff review.

**Measure:** checkpoint tokens, review findings that caused a change, reviews
with no additional evidence, and escaped defects.

### `WF28-11` — Separate publication guards from repeated verification

**Phase 27 observation:** After the exact Final Close packet was reviewed, the
execution message said it would revalidate every pin and provider state before
the A-to-B transaction. This sounded like another complete verification pass
immediately after tests, conformance, smoke, candidate, and integration review.

**Required distinction:** Product evidence and transaction state have different
lifetimes. Tests, lint, typecheck, build, conformance, browser evidence, and
candidate content remain reusable while their relevant inputs are unchanged.
Remote branch/PR state, integration head, provider checks, current worktree
cleanliness, and expected head are volatile and require compare-and-swap-style
guards immediately before the external action they protect.

**Phase 28 pilot:**

- Run one compact preflight before the first mutation: active HEAD/cleanliness,
  candidate parent/tree/diff hash, exact receipt payload hash, pinned
  integration head, and conflicting PR/remote-ref state.
- Do not rerun tests, lint, typecheck, build, conformance, browser smoke, or
  regenerate candidate A when their input fingerprints still match the
  approved packet.
- After receipt commit B, verify only the new invariant: `B^ == A`, receipt-only
  delta, exact payload, and clean B.
- Immediately before merge, verify only provider head `B`, required checks,
  mergeability, and expected-head protection.
- Immediately before cleanup, verify only merge proof, integration sync, exact
  cleanup targets, worktree cleanliness, and remote tip.
- Do not repeatedly recompute immutable pins at every later boundary unless an
  intervening operation could have changed them.

**Measure:** preflight duration, repeated immutable checks, stale remote-state
stops, avoided gate reruns, and unsafe publication/cleanup attempts prevented.

## Phase 27 close observation

The approved Phase 27 packet completed without pin drift:

- the post-approval preflight retained candidate A and the exact receipt
  payload;
- receipt B had candidate A as its parent and added only
  `docs/issues/Final_Close_Phase_27.json`;
- GitHub merged PR `#42` with head B into the pinned `main` base;
- local and remote `main` converged at merge commit `8cb2d904…` with the exact
  accepted `src` tree;
- cleanup occurred only after merge and integration proof.

This supports retaining the transaction guards in `WF28-11`. The Phase 28
cost experiment should target repeated product gates and redundant immutable
checks, not remove expected-head, provider-state, integration, or cleanup
guards. No duration or token saving is inferred from this observation.

## Phase 28 experiment record

Add one row per task or repair. Do not backfill estimates as measured facts.

| Task/repair | Risk tier | Focused gate | Full gate | Evidence reused | Browser modality | Docs changed | Stops/repairs | Outcome |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Task 149 + five bounded repairs | High | TDD RED reproduced the approved behavior and each repair; latest focused gate passed 3 files / 113 tests | Latest-input full gate run, not reused: test 95 files / 1001 tests, lint 0 errors with 11 unchanged warnings, typecheck and build passed | `WF28-02` deterministic record: `task-149.md` § “Deterministic Product Evidence Fingerprint”, composite `a2da7ab6f49ba50d9fba9d3ea5e3fb568990e05f264891844e2534e2e00dfdd8`; earlier 95 / 990, 95 / 995, and pre-harness-repair 95 / 1001 inputs were invalidated | Chromium mouse: actual pointer DnD, stationary multi-frame edge scroll, no-move release geometry, and blur/exit/Escape/end lifecycle; stationary touch and remote invalidation covered by mounted owner tests | `docs/issues/Issues_Phase_28.md`; `docs/verification/inbox-triage/task-149.md`; `docs/verification/inbox-triage/phase-28-workflow-pilot-audit.md` (plus the committed baseline copy itself) | Five implementation-local repair cycles stayed inside the approved six code/test owners; the fifth repaired P28-02/P28-03 and no sixth cycle or scope expansion was needed | P28-01/P28-02/P28-03 repaired awaiting checkpoint; final High-risk review found no Critical or Important issue and independently passed 3 files / 113 tests |
| Task 150 pre-start owner discovery + docs-only amendment/repair | High | Not run: lifecycle stopped before durable start; the approved continuations changed canonical docs only | Not run; no Task 150 product/test input changed | Task 149 evidence not reused for Task 150 behavior | Not run | `docs/EXECUTION_PLAN.md`; `docs/issues/Issues_Phase_28.md`; `docs/verification/inbox-triage/task-150.md`; this measured row | One owner-discovery stop, one targeted user disposition, two targeted checkpoint-review docs repair cycles, zero implementation repair cycles, and zero product/test writes | `P28-04` exact producer/test owners and all current canonical release edges, including Task 113 Verification, are aligned; the historical receipt is unchanged and Tasks 150/151 remain unstarted |
| Task 150 implementation + six bounded repairs | High | Sixth-cycle production-owner RED failed 2/2 because final focus returned to `<body>` after the actual Radix close; latest focused gate passed 7 files / 179 tests, including both close-lifecycle destinations and all prior Task 150 owners | Latest-input full gate run, not reused: test 96 files / 1020 tests, lint 0 errors with 11 unchanged warnings, typecheck and build passed | Earlier focused/full stale-focus inputs were invalidated; fifth-cycle browser evidence was not reused for the changed close/focus input; Task 149 evidence was not reused | No sixth-cycle browser run: mounted Workspace/Radix regressions directly proved the user-conditional actual dialog-close modality. Fifth-cycle Chromium theme/focus-visible/reduced-motion evidence remains historical only for unchanged CSS inputs | `docs/issues/Issues_Phase_28.md`; `docs/verification/inbox-triage/task-150.md`; this measured row; canonical Task 150 contract unchanged | Six implementation repair cycles; the explicitly approved sixth coordinated stale-placement fallback with existing `DialogContent.onCloseAutoFocus` inside Explorer/Workspace owners; no shared dialog expansion and no seventh cycle | Task 150 implemented awaiting implementation checkpoint with both Task 150/151 markers `[ ]`; selected-Bit/Search remained unstarted and no authority/product-semantic change occurred |
| Task 151 implementation + three bounded repairs | High | Third-cycle RED produced 16 expected behavior failures plus one jsdom scroll-spy setup error, then one same-call-stack Scratch invalidation failure; latest focused gate passed 5 files / 82 tests | Latest-input full gate run, not reused: test 97 files / 1060 tests, lint 0 errors with 11 unchanged warnings, typecheck and build passed | Earlier 65-test/1043-test inputs and pre-ARIA/synchronous-Scratch browser measurements were invalidated; Task 135 utility reran on current input; no Task 150 evidence reused | Fresh current-build Chrome 151: input `2px` focus-visible ring; result viewport `0→1354` while window/document/Explorer shell stayed `0`; stored Star/color; eight distinct computed entry/field/status/result/reveal signatures; static reduced-motion geometry parity; 0 console errors | `docs/issues/Issues_Phase_28.md`; `docs/verification/inbox-triage/task-151.md`; this measured row | Three implementation-local cycles. The final user-approved cycle repaired the seven checkpoint findings; review additionally tightened synchronous Scratch invalidation and lint aligned focus-only results to a native-button list. No fourth cycle or scope expansion | Task 151 implemented awaiting checkpoint with marker `[ ]`; final review has no remaining Critical/Important finding and Tasks 152–154 remain unstarted |

## End-of-Phase-28 decision questions

1. Which candidates reduced elapsed time or tokens without an escaped defect?
2. Which safeguards detected a real defect and must remain mandatory?
3. Which repeated gates had identical relevant input fingerprints?
4. Which documentation fields had more than one competing owner?
5. Which scope stops represented a real user decision versus a discoverable
   implementation owner?
6. What belongs in `run-task`, `end-phase`, the Project Adapter, or only the
   Control Tower operating policy?
7. What exact candidate skill tests must change before rollout?

## Promotion boundary

This working audit does not change the pinned Phase 27 workflow candidate,
Phase 27 product authority, or any lifecycle gate. At Phase 28 kickoff, copy or
move it into the approved Phase 28 tracked documentation scope and commit it as
the pilot baseline before task execution. At Phase 28 close, convert accepted
findings into an explicit skill/Adapter change plan, test those changes, and
obtain the required rollout approval separately.
