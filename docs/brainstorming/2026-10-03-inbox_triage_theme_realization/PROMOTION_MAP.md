# Inbox/Triage theme realization promotion map

> Status: **Proposed — whole-map user approval pending**
> Route: Brainstorming, targeted amendment of existing canonical documents
> Selected authority: [DECISION.md](DECISION.md), D01–D36
> Drafting owner: current Control Tower directly; advisory agents provide facts only
> Runtime anchor: canonical Phase 31 branch at `d05140626a6e95d4f5ca4897f02f66594af4d753`

이 map은 기존 제품 기반을 유지하며 delivery/시각 구현 계획을 재배치한다.
승인 전 canonical/recipe/product diff는 zero다. Map 승인은 canonical 문서,
cleanup, 기술 수리, phase kickoff, `[x]`, Final Close의 승인이 아니다.
선택되지 않은 원본 PRD로 돌아가거나 routing-only product authority를 만들지 않는다.

## 1. Source intake and provenance

| Source | Type / disposition | 사용 범위와 경계 |
|---|---|---|
| 이 topic의 DECISION D01–D36 | Product/delivery decision / Adopt | 사용자 확정 방향의 기록. 이번 whole-map/document approval은 별도다. |
| Adapter-declared current canonical documents, pre-Test-2 product baseline `54d689275cefb5d24c70f562435bb82734c51631` | Functional/product foundation / Retain | Task 163 수락, 기존 기능/DP 계약을 유지한다. Test 2의 추가 구현은 baseline product authority가 아니다. |
| 기존 approved recipe index + 9 recipes | Visual source / Retain | 기존 source provenance/DP를 유지한다. 새 rendered pass나 새 literal adoption을 주장하지 않는다. |
| Pinned prototype `4f39709688ceb4cac5e15d4e3502186b1f1c801b` / tree `7b8eb8766a9b57fe2174a948de09cfb7646cf7de` | Design Source / Reference-only | 8개 Inbox/Triage route의 시각 참조. Behavior/mock/local mutation과 source/asset bytes를 production에 승격하지 않는다. |
| `/Users/jwk/Documents/docs/prototype-to-production.md`, SHA-256 `842a220138ce94c2a25cc5e25b0e1b146934eac4e8d76aba2429454794e7cdd4` | Exploratory methods / Reference-only | 추상 방법·사용자 평가만 참고한다. Product decision은 이 topic에 명시된 것만 adopt한다. |
| Test 1–8의 code/CSS/tests/fixture/runner/image/report/evidence | Historical experiment / Skip | 조사/폐기 identity 이외에는 promotion·implementation·acceptance input으로 사용하지 않는다. |
| NOTES.md | Recovery context / Reference-only | 사실과 lineage 설명. NOTES-only finding을 새 제품 결정으로 promote하지 않는다. |

Source disposition 근거는 사용자 지시다. 기존 DP와 시안의 특정 state가
충돌하면 Q02에서 그 state만 다루며 prototype을 자동 우선하지 않는다.

## 2. Canonical edit targets

| Target ID | Exact path / action | Status / boundary |
|---|---|---|
| C01 | `docs/SCHEMA.md` — retain, no write | No new storage, migration, index or command. |
| C02 | `docs/SPEC.md` — retain, no write | Existing behavior, lifetime, copy meaning and 14 DP outcomes unchanged. New conflict requires a separately scoped decision, not a silent SPEC edit. |
| C03 | `docs/DESIGN_TOKENS.md` — targeted amendment | Proposed: existing role aliases, theme-value centralization, scoped state/mode rules, source/render and production-only realization boundaries. No measured value invented here. |
| C04 | `docs/EXECUTION_PLAN.md` — targeted amendment | Proposed: narrow Phase 31; historical transfer register for 164/165; new Phases 34–40/tasks 166+; exact owners/paths, graph, flows, mutexes, index and Next Numbers consistency. |
| C05 | `docs/PLANNING_STANDARD.md` — targeted amendment | Proposed: applicable-theme incremental verification + retained final 16-theme/mode matrix, element-level first-submission quality, region visual disposition and technical independence. Replace stale Phase 23–33 verification scope explicitly. |
| C06 | `docs/WORKFLOW.md` — targeted amendment | Proposed: this direction-change lineage and explicit transferred-not-accepted state. No new global lifecycle bypass or duplicate skill procedure. |
| C07 | Existing 9 recipe texts / existing accepted DP receipts | Retain, no write in this promotion. Delivery-owner navigation is in C04; source/provenance and behavioral choices are not rewritten. |
| C08 | `docs/issues/Issues_Phase_31.md` / `docs/issues/Issues_Deferred.md` | Subsequent separately authorized ledger/close disposition, not writes under this map gate. Preserve accepted functional records and named deferred issues. |

After map approval, draft affected roles in adapter authority order. Skip
C01/C02/C07 explicitly; C03 retains its own user document gate before execution
derivation, and execution/planning/flow review retain their Route gates. No
structured consumer packet is selected; the ordinary full-map route applies.

## 3. Selected-decision obligation coverage index

Each row cites the exact DECISION table row with the same stable ID. The
disposition here concerns planning, not implementation acceptance. For every
row, the source-to-target connection must survive final flow review.

| ID / exact source | Product disposition | Landing / coverage | Canonical target or owned boundary |
|---|---|---|---|
| D01 / DECISION §2 D01 | Retain immutable Phase 30 | Accepted/archive; no new visual claim | C04/C06; N01 |
| D02 / DECISION §2 D02 | Narrow Phase 31 | Accepted 163 plus separately approved repair/terminal evidence | C04/C06; Q03 |
| D03 / DECISION §2 D03 | Transfer 164, not accept | Unaccepted original; new realization owners required | C04 transfer register; N02 |
| D04 / DECISION §2 D04 | Transfer 165, not accept | Final all-nodes sink required | C04 Phase 40; N02 |
| D05 / DECISION §2 D05 | Retain numbering reservation | New task IDs ≥166; no reuse | C04 indexes/Next Numbers; N03 |
| D06 / DECISION §2 D06 | Adopt theme sequence | Future owners, no kickoff | C04 Phases 34–39 |
| D07 / DECISION §2 D07 | Retain entire final verification promise | Existing flow/data/DP foundations; final evidence not yet produced | C04 Phase 40; C05 |
| D08 / DECISION §2 D08 | Require complete executable graph | Draft-only; flow review later | C04/C05; N04 |
| D09 / DECISION §2 D09 | Narrow technical repair | Existing 163 route seam; repair/evidence pending | C04; Q03; N05 |
| D10 / DECISION §2 D10 | Keep truthful Phase 31 close | Fresh close and issue dispositions required | C04/C05/C06; N06 |
| D11 / DECISION §3 D11 | Adopt region sequencing | Shared shell/Pool/Breakdown/Staging/Explorer/placement owners | C04; C05 |
| D12 / DECISION §3 D12 | Adopt matched conditions | Future fixtures/evidence; no capture performed for this map | C04/C05 |
| D13 / DECISION §3 D13 | Adopt element-to-owner mapping | Future per-element source/computed/owner evidence | C04/C05 |
| D14 / DECISION §3 D14 | Verify actual cascade/font/geometry | Source-only ≠ rendered; fresh observations required | C03/C05; N07 |
| D15 / DECISION §3 D15 | Preserve-and-blend existing functions | Existing behaviors/DPs retained; production-only visuals separately mapped | C02 retain; C03/C04; Q02 |
| D16 / DECISION §3 D16 | Internal 1:1 refinement before first submit | Fresh browser evidence, explicit retained differences | C04/C05; N08 |
| D17 / DECISION §3 D17 | Verify interaction/motion transitions | Live behavior plus relevant state evidence | C03/C04/C05 |
| D18 / DECISION §3 D18 | User region disposition, coherent same Working | Future approved implementation scope; no separate routine document batch | C04/C05; N09 |
| D19 / DECISION §3 D19 | Independent visual/technical judgments | Both required; neither currently inferred | C04/C05; N06 |
| D20 / DECISION §3 D20 | Separate first-submit versus followup findings | Future region records; no duplicate historical archive | C04/C05 |
| D21 / DECISION §4 D21 | Extend centralized role/token architecture | Existing alias vocabulary; exact future values require trace | C03/C04 |
| D22 / DECISION §4 D22 | Retain one semantic component tree | Existing production owners; no theme forks | C02 retain; C03/C04/C05; N10 |
| D23 / DECISION §4 D23 | Plan structural/component owners when needed | CSS-only contract superseded for new tasks only | C04 owner/file/mutex register |
| D24 / DECISION §4 D24 | Light-first, complete supported conformance | Per-theme phase evidence plus final full 16 matrix | C04/C05; N11 |
| D25 / DECISION §4 D25 | Prevent clipping and scope leakage | New direct/rendered regression assertions needed | C03/C04/C05 |
| D26 / DECISION §4 D26 | Preserve DP decisions; expose conflicts | Existing DP evidence retained; local conflicts require user | C02/C07 retain; Q02; N12 |
| D27 / DECISION §4 D27 | Retain deferrals, isolate possible card owner change | Current card foundation exists; deferred redesign excluded | C04; Q01; N13 |
| D28 / DECISION §5 D28 | Keep methods, prohibit experiment reuse | External self-contained file; historical implementation Skip | C04/C05; N14 |
| D29 / DECISION §5 D29 | Remove only Test 2 delta | 716-path delta known; accepted 163 is untouched by it | C06 direction lineage; C08 future gate; N15 |
| D30 / DECISION §5 D30 | Explicitly supersede experimental artifact retention | New exact discard disposition pending; not Git purge | C06; C08 future gate; N16 |
| D31 / DECISION §5 D31 | No standalone final-experiment record | User directs termination/disposal; methods retained externally only | C08 future integrated cleanup disposition; Q04; N17 |
| D32 / DECISION §5 D32 | Exact guarded cleanup only | Eight candidates known; fresh destructive guards still required | C08 future gate; Q04; N18 |
| D33 / DECISION §5 D33 | Keep CT-owned steps 2/5 direct | Read-only Luna facts; single future writer | C06 direction record; no model runtime inference |
| D34 / DECISION §5 D34 | Post-Final-Close skill audit only | Existing deferred workflow issues retained | C08 future audit; N19 |
| D35 / DECISION §5 D35 | Conditional method linkage, not blanket checklist | Strategy adopted; exact skill change undecided | Non-promoted skill bytes; N19 |
| D36 / DECISION §5 D36 | Return to normal approved main-based lifecycle | Close/audit/new plan gates precede theme implementation | C04/C06; N20 |

## 4. Visual surface reconciliation — independent of delivery status

No new prototype/browser capture or computed-style inspection was performed
for this map. All nine source packages remain **source-only** at this new
promotion boundary; older audit observations are historical, not fresh passes.

| Unit | Retained visual source | Retained production-side capability | Disposition / future owner |
|---|---|---|---|
| V01 Shell/chrome | `inbox-triage-shell-section-chrome-visual-recipe.md` | Canonical route/frame, headings/landmarks, internal scrolling | Reproduce approved chrome; preserve geometry decisions or resolve Q02. Phase-local theme task. |
| V02 Pool | `inbox-triage-scratch-pool-visual-recipe.md` | Selection/search/sort/collapse/counts plus approved remote/removal statuses | Reproduce sourced elements; preserve-and-blend production-only DP states. |
| V03 Context | `inbox-triage-selected-scratch-context-visual-recipe.md` | Selected Scratch, inline Edit/Save/Cancel, blockers/focus | Preserve-and-blend editors; fixed geometry changes require Q02. |
| V04 Breakdown | `inbox-triage-breakdown-row-empty-visual-recipe.md` | Active/staged rows, Add/Delete/Edit, reliability, DnD source | Reproduce row grammar; retain actual command/state/empty meanings. |
| V05 Staging | `inbox-triage-staging-visual-recipe.md` | Durable Node/Bit candidates, Unstage, invalid/unavailable/reliability projections | Reproduce approved wells/cards; investigate mounted reason finding under Q05. |
| V06 Explorer | `inbox-triage-grid-explorer-visual-recipe.md` | Ordinary columns/path plus DP-VQ07 whole-hierarchy replacement search | Separate base and replacement-body coverage. Prototype filter is not whole-hierarchy authority; Q01 for actual card internals. |
| V07 Placement | `inbox-triage-placement-affordances-visual-recipe.md` | Direct/staged confirmation, authoritative reliability/title/type limits | Preserve DP-VQ08/09. Column occlusion or placement differences are explicit Q02, not CSS discretion. |
| V08 Newly/Undo | `inbox-triage-newly-placed-undo-visual-recipe.md` | Actual Node/Bit card + separate source-aware Undo/status/reasons | Retain provenance and DP-VQ10; no surrogate card or implicit D-CARD redesign. |
| V09 Archive | `inbox-triage-archive-completion-visual-recipe.md` | Section-scoped completion, Reopen, authoritative Archive/recovery | Retain DP-VQ11/12; prototype decorative success is not mutation evidence. |

The semantic union includes production-only editor/reliability/recovery/search
bodies even when a prototype lacks them. Their absence does not remove them.
Use the exact existing approved DP realization when it exists; an actually
unsourced new replacement gets its own user decision, never adjacent chrome.
Recipe text/prototype bytes are not re-extracted or rewritten in this map.

## 5. Negative-constraint register

| ID | Temptation / exact mismatch | Disposition and obligation |
|---|---|---|
| N01 | Reopen Phase 30 to repair a later route export | Forbidden; repair Phase 31 only — D01/D09. |
| N02 | Tick 164/165 to satisfy a close prerequisite | Forbidden; transferred-not-accepted tombstones — D03/D04. |
| N03 | Reuse retired phases or task IDs | Forbidden; reserve 32/33 and use 166+ — D05. |
| N04 | Treat this map as kickoff/new task authority | Forbidden; independent document/flow/lifecycle gates — D08. |
| N05 | Hide the NodeGridBody failure by deleting generated cache/ignoring typecheck | Forbidden as repair evidence; address the source route seam — D09. |
| N06 | Substitute test pass for visual acceptance or transfer for technical success | Forbidden; independent judgments and truthful close — D10/D19. |
| N07 | Treat recipe literals/CSS declarations as computed or rendered proof | Forbidden; actual element inspection — D14. |
| N08 | Resize comparisons, omit production-only state or hide retained differences | Forbidden; original-size matched evidence — D15/D16. |
| N09 | Recreate a session or extra approval batch for ordinary measurements | Not required; same coherent approved Working — D18. |
| N10 | Fork JSX by theme or import prototype mock architecture | Forbidden; one semantic tree — D22. |
| N11 | End light-only work as full theme conformance or skip later full matrix | Forbidden; supported dark/desktop/a11y/motion and final matrix — D24. |
| N12 | Prototype overrides DP semantics or missing surface uses an adjacent fallback | Forbidden; retained DP and affected-slice decision — D26. |
| N13 | Extend actual-card visual owner into shared card/Korean/deferred feature redesign | Forbidden without separate approval — D27. |
| N14 | Copy/adapt historical experiment or prototype implementation/asset bytes | Forbidden; abstract methods only — D28. |
| N15 | Reset branch, restore entire ledger, revert accepted Task 163 | Forbidden; exact additive Test 2 inverse — D29. |
| N16 | Keep obsolete experiment assets by habit, or purge Git history to “remove all traces” | New exact discard disposition governs current files; no history rewrite — D30. |
| N17 | Require a new Neumorphism report/closure commit merely to discard the ended test, or use its old active row to resume it | No standalone experiment record; exact integrated cleanup disposition/target guards remain — D31. |
| N18 | Delete broad directories/protected worktree or kill session host/prototype runtime | Forbidden; exact guarded candidate cleanup — D32. |
| N19 | Change installed skills now or declare deficiencies without checking existing rules | Forbidden; post-close direct CT audit — D34/D35. |
| N20 | Merge experiments or start real theme work before approved close/audit/plan | Forbidden; normal future lifecycle — D36. |

## 6. Consolidated question queue

| ID / tier | Exact question | User owner / resume condition | Blocks only |
|---|---|---|---|
| Q01 / Phase-local | Which Inbox Node/Bit internal presentation changes are necessary, and which actual shared-card paths/consumer effects should the new phase own without global D-CARD redesign? | User product/design owner; approve a concrete element/path/deferred-remainder boundary after discovery. | The relevant actual-card slice in Phase 34+, not Pool or Phase 31 technical close. |
| Q02 / Phase-local | Does a matched measured target truly conflict with accepted Context height, action reserve, ratio, Placement occlusion, copy or DP-owned state surface? | User; exact compared values/affected behavior and a narrow amendment disposition before the conflicting change. Already-resolved DPs are not reopened by default. | Only the conflicting element/state; supported unchanged slices may proceed. |
| Q03 / Blocking Phase 31 close | What is the minimal source/test owner set for removing NodeGridBody's forbidden route export while keeping ordinary Grid and route tests? | User technical scope owner; approve the evidence-based narrow repair packet, then fresh repair/close verification. | Technical repair and Final Close, not document-map drafting. |
| Q04 / Blocking exact cleanup | What exact dirty files, experimental artifacts, branches/worktrees and attributed runtimes may be discarded under the user's termination/disposal direction? | User; exact integrated cleanup scope with protected targets and revalidated identities. No standalone Neumorphism result/closure report or ledger commit is required. | Destructive cleanup outside a verified target set; no experiment is resumed or succeeded from an obsolete active row. |
| Q05 / Phase-local, tier audit pending | Does the inherited mounted staged-root target-reason omission violate the currently accepted functional contract, and who owns its repair? | User scope owner after factual diagnosis/Blocking-vs-Advisory review; fix only under an explicit narrow owner gate or give a permitted explicit deferred disposition. | Affected conformance claim, and Phase 31 close if classified Blocking; do not silently fold into CSS work. |
| Q06 / Blocking dependent close evidence | The adapter's optional generated-output freshness gate is absent. Which exact project-owned method proves the output consumed by the Phase 31 close claims is fresh? | User approves an exact method through the project document/close scope; the close owner runs it at candidate A. Do not infer cache clearing or build freshness from a pass or timestamp. | Only close claims dependent on generated/rendered output; source-only document-map qualification is unaffected. D10 applies. |

No new visual/product choice is resolved by the author. Installed skill-change
scope is a later post-Final-Close user gate, not an open product substitute.
Existing D-CARD/D-LOCALE/D-LENS/D-KEYBOARD/D-TEXT remain deferred.

## 7. Non-promoted material and approval boundary

- No SCHEMA/SPEC/product behavior or new storage is derived: C01/C02 retained.
- No new recipe literal, source asset, mock data, timer-owned mutation,
  decorative command, global search fallback, locale/IME/water-lens/keyboard
  placement feature is adopted: C07 retained and N10/N12/N13/N14 apply.
- No receipt/ledger/branch/worktree/runtime cleanup, NodeGridBody repair,
  Final Close or installed workflow byte changes occur under map approval.
- Canonical document drafts and the completed plan/flow review retain user
  approval. Phase 31 scope is unchanged until its plan amendment is approved.

Whole-map gate: approve or revise **this entire map**, identified by its exact
path and SHA-256. Approval will be recorded through the adapter's `craft-docs`
receipt pattern `docs/receipts/Craft_Docs.{gate}.json`; the payload is not
written or self-approved at this draft. No structured packet protocol is used.

## 8. Pre-gate audit

Expected registries: obligations **D01–D36**, visual units **V01–V09**,
negative constraints **N01–N20**, questions **Q01–Q06**, targets **C01–C08**.
Each D row has an exact DECISION row, independent planning/landing/evidence
status, and a canonical or separately gated disposition. Coverage is not a
claim that implementation is complete.

Draft verification recorded on 2026-10-03:

- Inline Node registry audit: exit 0. DECISION D01–D36 appears once each in
  the coverage table with the matching section/row citation; C/V/N/Q registries
  have 8/9/20/6 unique ordered IDs. Local Markdown links, nine existing recipe
  paths, all referenced IDs and trailing/EOF whitespace checks passed.
- Adapter-resolved `git diff --check`: exit 0. Explicit new-file whitespace
  checks also passed; a no-index exit 1 means a new-file diff, not a passing
  product gate. The initial audit parser did not accept V-row titles; its
  regex was corrected and the entire audit rerun, without product changes.
- `git diff --exit-code d05140626a6e95d4f5ca4897f02f66594af4d753 -- .`:
  exit 0. All tracked files, including canonical/recipe/product/receipt/ledger
  files, are unchanged. Status lists only this topic's three untracked draft
  files. Main worktree status is empty. No staging/commit/ref/process/deletion
  action was performed.
- Separate Control Tower semantic review: the transferred-not-accepted state,
  retained all-nodes/16-mode obligations, no-storage boundary, existing DPs,
  user-directed disposal without a standalone final-experiment record and unapproved card/conflict/cleanup/repair
  questions remain explicit. Q06 adds the actually missing project-owned
  freshness method without inventing its command or altering the adapter.

No browser/full gate pass is claimed. The drafts are not yet committed;
approval/recovery cannot be inferred from their presence. Map status remains
Proposed until its exact user disposition.

Preapproval revision: the user removed the standalone Neumorphism experiment
record/closure-commit requirement. D31/N17/Q04 and NOTES were revised together;
the original map hash is superseded. Registry, citation, link, whitespace and
zero-tracked-diff checks are rerun on the revised drafts before presentation.
