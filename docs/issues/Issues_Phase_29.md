# Issues — Phase 29: Mounted-Page Newly Placed And Undo

> Branch: `phase-29/mounted-page-newly-placed-undo`
> Worktree: `/Users/jwk/Documents/griddo2-codex-phase-29-mounted-page-newly-placed-undo`
> Kickoff date: 2026-08-28
> State: Tasks 155–157 Accepted; Task 158 `[ ]`, Implemented awaiting review

## Status Legend

| Status | Meaning |
| --- | --- |
| Open | Identified and unresolved |
| In Progress | Actively owned by the current task |
| Awaiting User Decision | Blocked on an explicit user-owned choice |
| Closed | Resolved with durable evidence |
| Deferred | Moved to declared future ownership with rationale |
| Dropped | Explicitly rejected or no longer applicable |
| Promoted to Execution Plan | Reflected in canonical task ownership |

## Gate C Kickoff

| Field | Durable value |
| --- | --- |
| Gate | `gate-c`, explicitly approved by the user on 2026-08-28 with statement `내 승인합니다` |
| Phase scope | Phase 29, Tasks 155–158, equal-weight product and workflow-audit tracks |
| First bounded batch | Task 155 only; sequential execution; Tasks 156–158 held for fresh dependency/readiness recheck |
| Task state | Tasks 155–157 are `[x]`, Accepted; Task 158 remains `[ ]`, unstarted and held |
| Source mode | Merged canonical Phase 29 plan plus accepted Task 123/152 foundations, approved nine-recipe package and DP-VQ10 receipt, and unchanged-candidate Track B audit continuity |
| Integration | `origin/main` at `f3c2be6b2afa2da51cde39d22c13eabf2286f296`, local divergence `0/0` after fetch |
| Approved base | `f3c2be6b2afa2da51cde39d22c13eabf2286f296`; no base exception |
| Feature branch | `phase-29/mounted-page-newly-placed-undo` |
| Worktree choice | New linked feature worktree at `/Users/jwk/Documents/griddo2-codex-phase-29-mounted-page-newly-placed-undo`; no reuse |
| Whole-file receipt | `docs/issues/Issues_Phase_29.gate-c.json` |
| Next legal action | Control Tower reviews the Task 157 acceptance-only checkpoint; Task 158 may begin only with a fresh candidate-pinned `run-task` prompt |

## Readiness And Clean-Start Evidence

- The synchronized Adapter resolver returned `approval_required`,
  `contract_ready=true`, and `writes_allowed=false` before Gate C. The user's
  exact Gate C disposition is the write authority.
- The pinned workflow candidate is clean on branch
  `post-v1/workflow-candidate-low-cost` at
  `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`. The Adapter blob is
  `7903892c04c4eb6fcd694712d5a01fdb608e183f`. Both remain read-only.
- Immediately before mutation, integration `HEAD` and `origin/main` both
  equaled the approved base, the integration tree was clean with divergence
  `0/0`, and the approved feature branch and worktree path were absent.
- Immediately after worktree creation, `HEAD` equaled the approved base, the
  tree was clean, and `approved-base..HEAD` contained zero commits.
- Task 155 dependencies Tasks 123 and 152 are `[x]`, Accepted. Their
  implementation, checkpoint, and acceptance commits are ancestors of the
  approved base.
- The Task 152 mounted Workspace callback exposes stable result/type,
  operation/result IDs, source/candidate versions, and destination/path
  provenance. The Task 155 hook/test/evidence files are correctly absent, and
  the named Workspace, Explorer, NodeCard, BitCard, placement hook, and test
  owners exist. No blocking plan/code drift was found.
- The leaf Newly/Undo recipe's historical `Proposed` header is a resolved
  false blocker: the nine-recipe package is approved at `7a1545126bab755184adf356dcca761c8db74a43`,
  the current recipe index says `User-approved production recipe package`, and
  DP-VQ10 receipt blob `401b8d84ee95d4c09b1466c9a7800e2b39e33599`
  is accepted by Task 117 commit `d4bd591aa3e0cdd540156c95f306c274c215ca26`.

## Baseline Full Gate

- Dependency setup: `pnpm install --frozen-lockfile` exited 0 in `3.43s`;
  the lockfile was unchanged and 537 packages were linked. Tracked state
  remained clean.
- The Adapter-declared full gate ran serially at the exact approved base:

| Command | Exit | Elapsed | Relevant result |
| --- | ---: | ---: | --- |
| `pnpm test` | 0 | `29.47s` | 98 test files and 1,146 tests passed; Vitest duration `27.91s`; Node emitted the existing `module.register()` deprecation and worker `localStorage` experimental warnings |
| `pnpm lint` | 0 | `7.56s` | 0 errors; 11 existing warnings |
| `pnpm typecheck` | 0 | `4.09s` | `tsc --noEmit` passed |
| `pnpm build` | 0 | `12.39s` | Next.js 16.2.1 production build passed; compile `5.1s`, TypeScript `4.0s`, seven pages generated; existing Node deprecation and `localStorage` experimental warnings were emitted |

No production or test implementation, Task 155 measurement row, relevant-input
fingerprint, downstream lifecycle, push, publication, integration, or cleanup
occurred during kickoff.

## Active Issues

No Phase 29 product issue is active at kickoff. The nine carried post-close
workflow findings are owned without verdict by
`docs/verification/inbox-triage/phase-29-workflow-pilot-audit.md`.

## Task 155 Durable Start

| Field | Durable value |
| --- | --- |
| Task | `155 — Project Newly Placed provenance over actual cards` |
| State | `[x]`, Accepted; durable start `bc8f84edae7881a89cca0a9c7d78443dec0c0c54` precedes implementation `0bdd1a88e1eb3c455ff8b156318f18ab7ca3b449`; accepted evidence checkpoint `638789c572577c720724693013805d66690b9ad4` |
| Approval | Exact candidate-pinned Task 155 work order on 2026-08-28, bounded by the committed `docs/issues/Issues_Phase_29.gate-c.json` Gate C receipt and the current Task 155 contract |
| Approved base / entrypoint | Integration base `f3c2be6b2afa2da51cde39d22c13eabf2286f296`; Task 155 entrypoint and recovery anchor `d81f924e209afd1cced22fdbfdca12e2c11af11b` |
| Dependencies | Tasks 123 and 152 are `[x]`, Accepted and contained in the approved base |
| Exact scope | Create the canonical Newly hook/test and Task 155 evidence; modify only the approved Workspace/test, Explorer/test, NodeCard/test, and BitCard/test owners; update this ledger and the actual Task 155 workflow-audit row; no Task 156–158 behavior |
| Behavior | Own mounted-page-only local placement provenance; project static semantic markers and newest-first type pinning over actual NodeCard/BitCard records without changing stored `x/y`; preserve across Scratch/path/theme and clear on route exit/reload/unmount; remote/other-tab records remain ordinary; no Zustand Newly state, persistence, replacement card model, or common-card redesign |
| Issues / deviations | None; the accepted checkpoint has no material finding, scope deviation, or `Unowned` item |
| Canonical impact | `None` — Task 155 implements the existing approved product/design/data/lifetime contract without changing canonical authority |
| Verification / evidence | Latest focused 5 files / 161 tests; latest full gate 99 files / 1,154 tests, lint 0 errors with 11 unchanged warnings, typecheck and build passed; exact results, review repairs, and fingerprint `1a491bbd2bda0fb26c9af723704ed657a47399472053d8d5d9700500549e8821` are owned by `docs/verification/inbox-triage/task-155.md` |
| Audit invariant | The implementation checkpoint is incomplete until product evidence and the actual Task 155 audit measurement row are committed together; acceptance-only work does not edit the audit |
| Next action | Control Tower reviews this acceptance-only checkpoint; Task 156 remains unstarted and may begin only after a fresh `run-task` prompt |

## Task 156 Durable Start

| Field | Durable value |
| --- | --- |
| Task | `156 — Connect ordinary-card source-aware Undo independently of search` |
| State | `[x]`, Accepted; durable start `ea0ace9d9af5503899ddcaa5d5bbe9b96dd6b527`; initial implementation `5b370843de9440455706fef177e0a80734c13e23`; accepted repair implementation `b81bd442d8df72824345827977e8a28ecad4cbf7`; accepted evidence/audit checkpoint `bd9357615507fe96ced709e315cb1e3fea1c36f8` |
| Approval | Exact candidate-pinned Task 156-only work order on 2026-08-29, bounded by the committed `docs/issues/Issues_Phase_29.gate-c.json` Gate C receipt, the completed dependency revalidation, and the current Task 156 contract |
| Approved base / entrypoint | Integration base `f3c2be6b2afa2da51cde39d22c13eabf2286f296`; exact clean Task 156 entrypoint and recovery anchor `2dfab8058e2b34ee55bab6460bbc152865434b5b` |
| Dependencies | Tasks 124, 136, 137, 139, 152, and 155 are `[x]`, Accepted and their acceptance commits are ancestors of the entrypoint; Tasks 114 and 151 are deliberately not dependencies |
| Exact scope | Original Task 156 owners plus user-approved cycle `3/3` expansion only to `src/hooks/use-scratch-breakdowns.ts` and its test; update Task 156 evidence, this ledger, and the existing audit row; no Search, `DP-VQ07`, Task 157 realization, Task 158, data/persistence/schema, or common-card redesign |
| Behavior | Connect ordinary-card source-aware Undo from exact current result/source/candidate/dependency truth; keep marker and eligibility independent; synchronously acquire the shared `undo` lock before dispatch; retain exact provenance and blockers through pending/unknown/reconciling; reject duplicate/competing intent without write/navigation/queue/replay; release only on terminal result; restore staged/direct provenance and canonical next → previous → column-heading focus |
| Issues / deviations | Resolved with canonical impact `None`: Control Tower found the mounted title-only handle/`dirty`-only consumer omitted dirty/conflicted row and conflicted-title intent; the user-approved cycle `3/3` expanded ownership exactly to the two recorded hook paths, and repair `b81bd442d8df72824345827977e8a28ecad4cbf7` resolved it. No remaining material finding, scope deviation, blocker, or `Unowned` item |
| Canonical impact | `None` — Task 156 implements the existing approved ordinary-card Undo contract without changing canonical authority |
| Verification / evidence | Initial implementation `5b370843de9440455706fef177e0a80734c13e23`; repair `b81bd442d8df72824345827977e8a28ecad4cbf7`; latest focused 6 files / 168 tests; exact serial full gate 99 files / 1,171 tests, lint 0 errors with 11 unchanged warnings, typecheck and build passed; replacement fingerprint `f397bf954ca3fe3c8e424b31d60cab928964d628baac0711b1aea69ff7d29558`; exact results are owned by `docs/verification/inbox-triage/task-156.md` |
| Audit invariant | The accepted repaired implementation/evidence and audit checkpoint remains immutable; this acceptance-only transaction does not edit Task 155/156 evidence or the Phase 29 audit |
| Next action | Control Tower reviews this Task 156 acceptance-only checkpoint; Task 157 remains unstarted and may begin only with a fresh `run-task` prompt |

## Task 157 Durable Start

| Field | Durable value |
| --- | --- |
| Task | `157 — Render DP-VQ10 Newly and Undo states` |
| State | `[x]`, Accepted |
| Approval | Exact candidate-pinned Task 157-only Control Tower work order on 2026-08-29, bounded by the committed `docs/issues/Issues_Phase_29.gate-c.json` Gate C receipt, the accepted `DP-VQ10=A` receipt, and the current Task 157 contract |
| Approved base / entrypoint | Integration base `f3c2be6b2afa2da51cde39d22c13eabf2286f296`; exact clean Task 157 entrypoint and recovery anchor `d0bb079fe0ae1ab2cdcca50c200b19a56c37e0f5` |
| Dependencies | Tasks 117, 128, 155, and 156 are `[x]`, Accepted and their acceptance commits are ancestors of the entrypoint |
| Exact scope | Original eleven approved product/test owners plus the cycle-5 Workspace test expansion; cycle 7 is further bounded to hook/test, Explorer/test, copy/test, and canonical reflection only in `docs/recipes/inbox-triage-newly-placed-undo-visual-recipe.md` and `docs/DESIGN_TOKENS.md`; update Task 157 evidence, this ledger, and only Task 157 audit records; no Task 158/Search, common-card redesign, repository command, persistence, schema, or unrelated evidence work |
| Behavior | Realize the approved `DP-VQ10=A` actual-card static Newly marker, separate stable Undo action, and card-attached always-visible status rail over the accepted Tasks 155–156 model, including independent selection/marker/eligibility, exact reasons and operation states, focus, lifetime, accessibility, reduced-motion parity, and eight-theme presentation |
| Issues / deviations | Accepted with canonical impact `Reflected`: cycle 6 repaired the four prior Control Tower findings, and user-approved cycle `7/7` resolved the later checking-authority omission and render-time state mutation. The accepted repair separates checking/shared-lock copy, suppresses checking activation, and clears re-enabled lifetime only after a committed blocker render; a suspended render cannot consume it. There is no remaining material finding, scope deviation, blocker, extra owner, or `Unowned` item. Historical cycle 5/6 records remain superseded evidence; the recipe header remains unchanged. |
| Canonical impact | `Reflected` — exact user-approved choice A checking and existing success data-state mappings were recorded only in `docs/recipes/inbox-triage-newly-placed-undo-visual-recipe.md` and `docs/DESIGN_TOKENS.md` |
| Recovery anchor | Durable start `5400c3d4097a58c224aabc7f107617bd4a7fd6c2`; durable owner stop `5f3d1916227cbf7d4403270aaa6e7462872b0480`; accepted repair/canonical reflection `489f6a08686f44a5323c112e62703b48dee68968`; accepted evidence/audit checkpoint `fef2c01b06098e9f30f0fb9ec7ccb7bbb23f9794`; accepted fingerprint `2081f807dbb4d15d52a8fd4a893fd3599ee023628893babc324df9fcecfa7697` |
| Verification / evidence | Latest focused 6 files / 207 tests in `4.23s`; exact serial full gate 99 files / 1,187 tests `25.83s`, lint 0 errors with 11 unchanged warnings `7.24s`, typecheck `1.35s`, build `12.58s`, four-command total `47.00s`; focused diff check and typecheck passed; final High-risk review found no remaining concrete issue; exact details are owned by `docs/verification/inbox-triage/task-157.md` |
| Audit invariant | The accepted Task 157 evidence and actual measurement row remain immutable; this acceptance-only transaction does not edit either owner or Tasks 155–156 evidence/audit records |
| Next action | Control Tower reviews this Task 157 acceptance-only checkpoint; Task 158 remains `[ ]`, unstarted, and may begin only with a fresh candidate-pinned `run-task` prompt. |

## Task 158 Durable Start

| Field | Durable value |
| --- | --- |
| Task | `158 — Integrate Undo into Explorer search results only` |
| State | `[ ]`, Implemented awaiting review; implementation and acceptance remain separate |
| Approval | Exact fresh candidate-pinned Task 158-only Control Tower work order on 2026-08-29, bounded by the committed `docs/issues/Issues_Phase_29.gate-c.json` Gate C receipt, accepted `DP-VQ07=A` and `DP-VQ10=A` receipts, and the current Task 158 contract |
| Approved base / entrypoint | Integration base `f3c2be6b2afa2da51cde39d22c13eabf2286f296`; exact clean Task 158 entrypoint and recovery anchor `57afa67e6cad93bbef74c8a23fad6f719e442d4c` |
| Dependencies | Tasks 114, 151, 156, and 157 are `[x]`, Accepted; acceptance commits `be2a842fa87395031e8f15b81751b3ac67e3869b`, `0ab994e867754db96d64c34691942d27cf9c8efc`, `d0bb079fe0ae1ab2cdcca50c200b19a56c37e0f5`, and `57afa67e6cad93bbef74c8a23fad6f719e442d4c` are ancestors of the entrypoint |
| Exact scope | Modify only the four approved Search/Explorer/Newly product owners and their four tests; create Task 158 evidence; update this ledger and only Task 158 audit measurement/repair records; no ordinary-card Undo change, copy/style/canonical document change, query/ranking change, DnD source behavior, persistence/schema/data change, or Phase 30–31 work |
| Behavior | Compose the accepted Tasks 156–157 Undo model and DP-VQ10 realization into DP-VQ07 search results only: matching local placements enter current results; independent trailing Undo never reveals or drags; query and result scroll survive every Undo state; non-success retains the exact result; terminal success removes only that result, announces `Restored “{title}” to {source}.`, and focuses the next surviving result at the removed position or otherwise the search input, never a previous result |
| Issues / deviations | Resolved with canonical impact `None`: cycle 1 focused typecheck repaired a test-only readonly fixture; High-risk async review then found stale activation-time results could choose the wrong focus after a pending-Undo refresh, and cycle 2 recomputed the exact latest removed-row position. Checkpoint review found the missing Search-owned `explorer-search-undo` class/role and a non-reproducible test-manifest ordering claim; cycle 3/3 reproduced and repaired both within the exact two product/test and three documentation owners. No remaining material finding, scope deviation, blocker, owner stop, path expansion, fourth-cycle gate, or `Unowned` item |
| Canonical impact | `None` — Task 158 consumes the existing approved Search-only composition without changing canonical authority |
| Audit invariant | Product/evidence checkpoint is incomplete until the exact Task 158 measurement row and any Task 158 repair rows are committed with actual measurements; Tasks 155–157 evidence and audit rows remain immutable; Task 157 Working session is closed/archive-only, this is the sole active Task 158 Working session, and duplicate-session count is `0` |
| Implementation / evidence | Durable start `dd2be1f65bb3709677b6af3e4ffbe319468d5f1f`; original implementation `f041af0cf8eacfcf994b64481d489d393dd94b31`; cycle 3 repair `81c2f1e1f1229d79b0e32e08e300024853469324`, exact parent `66010d3481f5f4aa698a84b1de3c1b58c5e5dcd0`; latest focused 4 files / 145 tests in `3.37s`; exact serial full gate 99 files / 1,196 tests `21.50s`, lint 0 errors with 11 unchanged warnings `6.68s`, typecheck `1.24s`, build `9.91s`, total `39.33s`; exact detail is owned by `docs/verification/inbox-triage/task-158.md` |
| Fingerprint | Replacement `4616261c3066cd220583e34b1628045ff622c2863fe4d6b8e3e3880b10de50bc` on repair implementation `81c2f1e1f1229d79b0e32e08e300024853469324`; components: `src` tree `36a32647ec8fd7587e0942960f948881d819f624`, lexicographically path-ordered 99-test manifest `5f7629e1261deb4ef795ce2ae6cee568a0809b0f0d6631c8d5f6e6167bd64d2f`, exact 8-path manifest `2259f694e1f5ea74b95033cbf42a0a8157c3d49cf9235fee8d1bc6825629a24e`, config/command manifest `111450e6805057e33bc917444dcb1e86baf893a55e711e03634c9bc0f4d0a3fd`; superseded `0c6d86a7…` used tree traversal rather than the stated global path order (`ac757dff…` is reproducible on the old commit), while the repair also changed implementation inputs, so neither it nor `15f4a0ee…` was reused |
| Next action | Control Tower reviews this paired Task 158 product/evidence/audit checkpoint; do not accept Task 158 or start Phase 30–31 |
