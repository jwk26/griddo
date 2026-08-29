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
| 156 | High | Latest focused passed 6 files / 168 tests in `4.05s` | Latest-input exact serial full gate run, not reused: test 99 files / 1,171 tests `25.74s`; lint 0 errors, 11 unchanged warnings `6.55s`; typecheck `1.56s`; build `10.68s`; serial total `44.53s` | Replacement `f397bf954ca3fe3c8e424b31d60cab928964d628baac0711b1aea69ff7d29558`; repair implementation `b81bd442d8df72824345827977e8a28ecad4cbf7`, `src` tree `7b6c5b510a6c619d99491c3cc29c1d081c685b3f`, 99-test manifest `dc15509d720a1688df9a9c706a0eb788c6136e7779c68ef8888e89f5aea081fc`, exact 11-path manifest `8e23b48630e0bea577870d1b70340d468b0f70bf67c4a6c6deedfe366855e5fe`, config/command manifest `111450e6805057e33bc917444dcb1e86baf893a55e711e03634c9bc0f4d0a3fd`; supersedes `8c9c042d4d91227f07becdeb14872ba6326ca48be66ce8140878da45ca192423` | Runtime token/accounting `not measured` | Two exact Task 156 work-order prompts (initial plus delta-only cycle 3); prompt bytes `not measured`; Control Tower maintained; previous Task 155 Working session closed/archive-only; same coherent Task 156 Working session maintained after its fresh rollover; duplicate-session count 0 | No browser run; hook/Explorer/actual Card owners directly prove exact source/candidate truth, synchronous lock, no-bubble/no-replay, ambiguous retention, complete mounted title/row dirty/conflict blocking, pristine/resolved re-enable, and terminal focus; no visual/copy claim | 3 paths; `+63/-36` lines | Three bounded cycles (`3/3`); one owner-discovery stop and user gate expanded only the scratch-breakdowns hook/test; final review found no remaining concrete issue, extra path, or `Unowned` item | Gate C/Task 155 evidence not reused; prior checkpoint `fb4b361ba6b71c93db9b45cc3f8ce3a820d1f85a`, fingerprint, and `44.22s` gate invalidated by cycle 3; all focused/full inputs rerun on `b81bd442d8df72824345827977e8a28ecad4cbf7` | None observed at repaired checkpoint | Repaired awaiting review; marker `[ ]`; Tasks 157–158 not started; all hypotheses and decision questions remain open |
| 157 | High | Latest focused passed 6 files / 207 tests in `4.23s`; focused diff check `<0.01s` and typecheck `1.55s` passed | Latest-input exact serial full gate run, not reused: test 99 files / 1,187 tests `25.83s`; lint 0 errors, 11 unchanged warnings `7.24s`; typecheck `1.35s`; build `12.58s`; four-command total `47.00s` | Replacement `2081f807dbb4d15d52a8fd4a893fd3599ee023628893babc324df9fcecfa7697`; repair/reflection `489f6a08686f44a5323c112e62703b48dee68968`, `src` tree `92b1bd0222e08e2733a28f471bca5b78ad046c62`, 99-test manifest `ee666b766660a41c09eb0194e14323e2428cd7c80ad5544a2c7eef070a748fc8`, exact 14-path manifest `d01769b05db0b45859978ffb52a6e3d5d3e6278d6df477cf59d0ab78817ae469`, config/command manifest `111450e6805057e33bc917444dcb1e86baf893a55e711e03634c9bc0f4d0a3fd`; supersedes cycle-6 `8df72a88bf391b0b66c470a18ed74b8fc6eab053820908449dc32c3432fb7d30` | Runtime token/accounting `not measured` | Initial exact Task 157 work order plus four delta continuations authorizing cycles `4/4`–`7/7`; prompt bytes `not measured`; Control Tower maintained; same coherent Task 157 Working session maintained; previous Task 155/156 sessions closed/archive-only; duplicate-session count 0 | No browser run; hook/Explorer/Card/Workspace/copy/CSS owner tests prove exact checking/shared-lock separation, focusable `aria-disabled` suppression, no acquire/dispatch/navigation/replay/focus movement, suspended-render purity, committed blocker lifetime, success ownership, trailing action, and prior mounted semantics; no browser-computed, pixel, viewport, physical pointer/touch, or runtime media-query claim | 5 documentation paths; `+79/-43` lines from the cycle-6 checkpoint | Seven cycles (`7/7`); cycle 7 had an explicit user gate for choice A and canonical reflection; one intermediate lint error removed a redundant effect update; final review found no remaining concrete issue, extra path, or `Unowned` item | Cycle-6 checkpoint/fingerprint/full gate and all intermediate cycle-7 results invalidated; exact focused plus every catalog full command rerun on final repair input; Gate C and Tasks 155–156 evidence not reused | Cycle-6 checkpoint escaped missing checking authority and render-time ref mutation; both reproduced and repaired in cycle 7; none observed after final review | Repaired awaiting review; canonical impact `Reflected`; marker `[ ]`; Task 158 unstarted; all hypotheses and seven decision questions remain open |
| 158 | High | Latest focused passed 4 files / 145 tests in `3.37s`; focused diff check `0.01s` and typecheck `1.53s` passed | Latest-input exact serial full gate run, not reused: test 99 files / 1,196 tests `21.50s`; lint 0 errors, 11 unchanged warnings `6.68s`; typecheck `1.24s`; build `9.91s`; four-command total `39.33s` | Replacement `4616261c3066cd220583e34b1628045ff622c2863fe4d6b8e3e3880b10de50bc`; repair implementation `81c2f1e1f1229d79b0e32e08e300024853469324`, `src` tree `36a32647ec8fd7587e0942960f948881d819f624`, lexicographically path-ordered 99-test manifest `5f7629e1261deb4ef795ce2ae6cee568a0809b0f0d6631c8d5f6e6167bd64d2f`, exact 8-path manifest `2259f694e1f5ea74b95033cbf42a0a8157c3d49cf9235fee8d1bc6825629a24e`, config/command manifest `111450e6805057e33bc917444dcb1e86baf893a55e711e03634c9bc0f4d0a3fd`; old-commit path-sorted check `ac757dff…` proves `0c6d86a7…` used the wrong order | Runtime token/accounting `not measured` | Initial exact Task 158 work order plus one delta-only cycle 3 continuation; prompt bytes `not measured`; Control Tower maintained; same coherent Task 158 Working session maintained; Task 157 Working session closed/archive-only; duplicate-session count `0` | No browser run; result/Search/Newly/Explorer owner tests prove exact Search-owned plus realization role binding, sibling controls, no drag/reveal bubbling, shared state/command substitution, retained non-success, active query/recorded-scroll retention, exact removal/status, latest-index next-result/input focus, and ordinary-column regression; no browser-computed, pixel, physical pointer/touch, viewport-geometry, or runtime media-query claim | 3 documentation paths; `+52/-30` lines | Three cycles (`3/3`); zero owner/scope stops, path expansions, or fourth-cycle gates; cycle 3 repaired both checkpoint findings; final review found no remaining concrete issue or `Unowned` item | Gate C, Tasks 155–157, and all earlier Task 158 evidence not reused; cycle-2 `38.59s` gate and `15f4a0ee…` fingerprint invalidated by implementation role repair plus incorrect manifest ordering; every focused/full command reran on latest input | Checkpoint review found the missing Search role and non-reproducible fingerprint; both repaired in cycle 3, none observed after final review | Repaired awaiting review; canonical impact `None`; marker `[ ]`; Phase 30–31 not started; WF28-01–WF28-11, seven decision questions, comparison, limitations, safeguards, owner classification, and final improvement verdict remain open |

### Repair and stop rows

| Task / cycle | Actual trigger or finding | Owner discovery / `Unowned` | Focused evidence | Full-gate reuse/rerun/invalidation | Browser or owner-test evidence | Scope disposition | Outcome |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 155 / cycle 1 | Initial hook/card/Explorer/Workspace REDs plus Motion DOM-prop typecheck failure and diff-review scroll identity finding | No owner stop; all writes stayed in the 10 approved product/test paths; `Unowned: None` | Final cycle-1 focused passed 5 files / 161 tests | Full gate passed on then-current input (`37.25s`) but was invalidated by cycle 2 | Mounted owner tests proved actual-card marker/pinning/lifetime; no browser-only claim | Implementation-local API and shared projection repairs | Proceeded to High-risk review |
| 155 / cycle 2 | High-risk review found IDs/versions could not supply future Undo's immutable source/candidate snapshots after candidate deletion | No expansion: Workspace and canonical Newly hook are approved owners; `Unowned: None` | Snapshot RED failed 3/3 hook tests; final focused passed 5 files / 161 tests in `3.30s` | Cycle-1 full gate invalidated; latest full gate reran all four commands and passed in `36.56s` | Mounted Workspace captured exact pre-dispatch authoritative snapshots; hook tests proved direct/staged provenance | Repaired within Task 155 future-Undo provenance boundary | Implemented awaiting checkpoint; no third cycle |
| 156 / cycle 1 | Initial missing Undo hook/card behavior; focused observer resubscribe loop; Explorer TDD ordering was caught and reset before RED; mocked Dexie observation and type/lint findings | No owner stop; all writes stayed in the exact nine approved product/test paths; `Unowned: None` | Hook/card/Explorer REDs failed only new assertions; integrated focused owners passed before full gate | Cycle-1 full gate passed on then-current input but was invalidated by cycle 2 | Hook/Card/Explorer owners proved truth, locks, no bubbling, duplicates, and focus without browser-only claims | Implementation-local state, observer identity, and test-harness repairs | Proceeded to High-risk review |
| 156 / cycle 2 | High-risk review found committed Undo plus ambiguous response could remove the exact live card and selected path before reconciliation | No expansion: Newly hook and ordinary Explorer are approved owners; `Unowned: None` | Retention RED failed the exact card assertion; focused passed 5 files / 143 tests in `3.73s` | Earlier evidence invalidated; exact serial gate passed in `44.22s`, then was superseded by cycle 3 | Explorer owner retained only the exact pending/unknown/reconciling command snapshot/path; staged Bit owner proved same-candidate routing | Repaired within the explicit retention matrix; no Search or visual/copy work | Checkpoint `fb4b361ba6b71c93db9b45cc3f8ce3a820d1f85a` was later superseded by the Control Tower Important finding |
| 156 / cycle 3 | Control Tower review found `getSnapshot() === "dirty"` plus a title-only publisher omitted conflicted title and dirty/conflicted breakdown-row intent, leaving ordinary-card Undo eligible | Owner discovery stopped acceptance; user approved bounded cycle `3/3` and expansion only to `src/hooks/use-scratch-breakdowns.ts` plus its test; `Unowned: None` | Three RED assertions reproduced row `null`, non-reactive dirty, and eligible conflict; first GREEN had one local coalescing parse error; final focused passed 6 files / 168 tests in `4.05s` | Superseded fingerprint and `44.22s` gate invalidated; latest exact serial four-command gate passed in `44.53s` | Actual row transitions and Explorer owner tests prove dirty/conflict no dispatch, acquire, navigation, queue, or replay; open/resolved re-enables from current truth; shared lock retains saving/reconciling | Canonical mounted handle predicate/subscription repair only; Task 137 save-before-action unchanged; no Search, copy, style, data, or schema work | Finding resolved within approved final cycle; final High-risk review found no remaining concrete issue |
| 157 / cycle 1 | Initial REDs reproduced missing released copy, Retry/re-enabled semantics, `aria-disabled`, attached status rail, and static/eight-theme/reduced-motion CSS | No owner stop; writes stayed in the exact 11 approved product/test paths; `Unowned: None` | Initial focused 5 files / 137 tests had 8 expected failures; cycle-end focused passed 5 files / 137 tests in `3.26s` | Full gate not run in cycle 1 | Hook/copy/Card/Explorer owner tests establish state and DOM semantics; no browser-computed, pointer, focus, viewport, reduced-motion, or theme claim | Implementation remained within released DP-VQ10 ordinary-card presentation | Proceeded to diff review |
| 157 / cycle 2 | Diff review found a successful same-operation Retry discarded the retained terminal focus plan | No expansion; canonical hook/Explorer tests own the finding; `Unowned: None` | Targeted RED reproduced heading focus instead of next-card focus; final focused passed 5 files / 138 tests | Full gate not run in cycle 2 | Owner tests establish programmatic focus disposition only; no browser modality or computed-style claim | Preserved the existing focus plan through `not_applied` Retry | Finding repaired; proceeded to lint/type verification |
| 157 / cycle 3 | Lint reported 12 `react-hooks/refs` errors because a React ref was nested inside the `undo` object; renaming the nested field produced the same 12 errors | No owner expansion; all attempted writes stayed in approved Card/Explorer owners; `Unowned: None` | Previously green focused 5 files / 138 tests remained the available focused evidence | Full gate not run; lint blocked it and invalidated earlier green-only evidence | Static lint evidence established the ref boundary; no browser claim | Pinned no-progress rule triggered a durable stop after the unchanged failure class | User explicitly resumed and authorized the final extra repair cycle `4/4` |
| 157 / cycle 4 | Root-cause repair moved the action ref to the existing top-level Card API; lint passed, then the full suite exposed stale marker-copy expectations in the Workspace integration test | Owner discovery stop: `src/components/triage/triage-workspace.test.tsx` is outside the exact Task 157 owner list; six expectations in one scenario require a user path-expansion gate; currently `Unowned` pending that decision | Latest focused passed 5 files / 138 tests in `3.16s`; standalone lint passed with 0 errors and 11 unchanged warnings in `7.83s` | Latest full test ran, not reused: 99 files / 1,176 passed and 1 failed in `25.24s`; remaining lint/typecheck/build chain did not run after the test failure; all prior gates invalidated | Approved owner tests establish released marker/state semantics; the full-suite failure establishes only the stale integration expectation; no browser invariant claimed | No write to the unapproved Workspace test; Task 157 remains `[ ]`, Task 158 held | Durable owner-expansion stop; next legal action is explicit approval or rejection of cycle `5/5` plus that single test path |
| 157 / cycle 5 | Control Tower approved the final repair and one test-owner expansion; the mounted-page Workspace scenario had six stale `Newly placed` queries after exact marker release to `NEW` | Expansion exactly to `src/components/triage/triage-workspace.test.tsx`; no other line/assertion changed; owner stop resolved; `Unowned: None` | Exact six-owner focused passed 6 files / 197 tests in `3.17s`; a preceding package-script attempt ran all 99 files and was not used as focused evidence | Every invalidated catalog gate reran serially: test/lint/typecheck/build all passed in `38.48s`; cycle 4 failing full test and all earlier gates invalidated | Workspace owner proves mounted-page marker persistence/clearing with released copy; other mounted owners and copy/CSS tests supply the precise substitution recorded in the Task 157 row; no browser claim | Mechanical stale-consumer alignment only; no new product/copy authority, Search, common-card, data, schema, or persistence change | Final `5/5` finding resolved; High-risk review found no remaining concrete issue; implementation/evidence/audit checkpoint ready |
| 157 / cycle 6 | Control Tower found re-enabled activation rejected `reason: reenabled`; blocker changes failed to end its lifetime; terminal not-applied Retry bypassed current Placement/lock/Edit blockers; checking/success fell through to conflict; Node action was leading | No owner expansion: user explicitly approved cycle `6/6`; writes stayed in hook/test, Explorer/test, and NodeCard/test; `Unowned: None` | Exact initial RED: 3 files / 118 tests, 9 failures; first GREEN 3/118; latest focused 6 files / 205 tests `3.65s`; one intermediate failure was a misplaced one-shot assertion and not a product defect | Cycle 5 implementation/evidence, `38.48s` gate, and fingerprint invalidated; latest test/lint/typecheck/build reran serially and passed in `45.79s` | Hook owners prove re-enabled dispatch and all three lifetime/Retry blockers; Explorer proves accepted checking/success copy, no stale action, and one success status owner; NodeCard proves trailing slot; no browser claim | Admit both available reasons; project blockers over preserved retryable raw state and recheck before acquire; explicit checking/success mapping; trailing Node action; no copy/design/data/schema change | All four findings repaired; final High-risk review found no remaining concrete issue; cycle `6/6` exhausted |
| 157 / cycle 7 | Control Tower found cycle 6 used shared-lock copy for initial checking without authority and mutated `reenabledKeysRef` from render-time `getState()` | User explicitly approved choice A, cycle `7/7`, and reflection only in the recipe and DESIGN_TOKENS; existing hook/Explorer/copy owners used; `Unowned: None` | Exact RED 3 files / 125 tests with 5 failures; final focused 6 files / 207 tests in `4.23s`, including a genuinely suspended render | Cycle-6 `45.79s` gate invalidated; first new test passed 99/1,186 but lint found 1 new effect-state error in `7.39s`; after repair, an added suspended-render regression invalidated intervening green gates; final serial test/lint/typecheck/build all passed in `47.00s` | Owner tests prove checking copy/state/action and shared-lock distinction, no checking side effects/focus movement, a suspended render cannot consume re-enabled lifetime, committed blockers do, and success remains one exact announcement; no browser-only claim | Choice A copy plus checking/success data states reflected in two canonical owners; render reads made pure and lifetime clear moved to committed effect; no new data/schema/persistence/Search authority | Both escaped findings repaired; final High-risk review found no remaining concrete issue; cycle `7/7` exhausted |
| 158 / cycle 1 | Initial Search-only Undo REDs plus focused test-fixture typecheck; High-risk async review then found activation-time results could become stale during pending Undo and focus the wrong survivor | No owner stop or expansion; all product/test writes stayed in the exact eight approved paths; `Unowned: None` | Initial RED 3 files / 49 tests had 5 expected failures; separate Explorer RED failed 2/2; first integrated focused passed 4 files / 144 tests, then the final cycle-1 focused rerun passed after the test-only type repair | Cycle-1 exact serial full gate passed in `38.75s` but was invalidated by the async review finding | Owner tests established independent non-drag controls, shared Undo states, non-success retention, exact success, query/scroll state, and base focus; no browser-only claim | Test fixture used a readonly getter; product review finding remained inside Search hook/test ownership | Proceeded to cycle 2 repair before checkpoint |
| 158 / cycle 2 | A reactive result inserted before the pending target made terminal success focus `albatross` from the stale activation list instead of current same-position `alto` | No owner stop or expansion; Search hook/test are approved owners; `Unowned: None` | Targeted RED reproduced the exact wrong focus; latest focused passed 4 files / 145 tests in `3.24s` | Cycle-1 focused/full evidence invalidated; every focused command and exact serial test/lint/typecheck/build reran and passed in `38.59s` | Search hook owner proves latest-list exact-index next/input behavior while result/Explorer owners preserve no-bubble, no-drag, and ordinary substitution; no browser-only claim | Read latest result projection and recompute current removed-row index; captured index remains only for already-observed removal | Finding repaired; final High-risk review found no remaining concrete issue, extra path, or `Unowned` item |
| 158 / cycle 3 | Checkpoint review found the trailing Undo lacked canonical Search-owned class/role, and the recorded 99-test manifest contradicted its stated global path-order algorithm | No owner stop or expansion; writes stayed in the exact two product/test and three documentation paths; `Unowned: None` | Exact owner RED failed 1/9 in `1.46s`, receiving only `newly-undo-action shrink-0`; owner GREEN passed 9/9 in `1.01s`; latest focused passed 4 files / 145 tests in `3.37s`, diff check `0.01s`, typecheck `1.53s` | Cycle-2 focused/full evidence and fingerprint invalidated; every catalog full command reran serially on repair input and passed in `39.33s` | Result owner proves `explorer-search-undo` class/role plus preserved `newly-undo-action`, sibling isolation, no reveal, and non-draggable result/action; no browser run or browser-only claim | Minimal two-attribute binding and deterministic path-sort correction only; no CSS, canonical, copy, ordinary-card, data, schema, or persistence change | Both findings repaired within final cycle; final High-risk diff review found no remaining concrete issue, extra path, authority need, or `Unowned` item |

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
