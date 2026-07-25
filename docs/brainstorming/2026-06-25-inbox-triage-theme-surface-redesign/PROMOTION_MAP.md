# Promotion Map: Inbox/Triage 2-3 Theme Surface Redesign

> Source: `docs/brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/DECISION.md`
> Date: 2026-07-17
> Status: Approved

## Promotion Scope

이번 amendment에서 승격하는 범위는 다음과 같다.

- 기존 4영역 Inbox/Triage 작업 공간의 production 구조와 비율: work area `60/40`,
  Breakdown/Staging `60/40`, Staging Node/Bit `35/65`
- visible section label/header/chrome의 복원과 8개 테마별 realization
- Scratch Pool 검색, 정렬, 접기, compact switching과 selection lifecycle
- Selected Scratch Context의 signature section 역할, 일반 Breakdown row의 약 `2~2.5배`
  높이 기준, Edit와 Breakdown sort control
- Breakdown row의 Add/Edit/Delete, staged/consumed lifecycle, empty/completion 상태
- Staging Node/Bit 후보의 durable lifecycle, full-card drag, unstage/drop-back과 저장 상태
- Grid Explorer의 전체 hierarchy 검색 mode, reveal, DnD interruption recovery와 drop constraint
- staged/direct placement의 분리된 affordance, title validation과 원자적 Confirm
- 실제 Node/Bit card 기반 Newly Placed 상태와 source-aware Undo
- Breakdown section 범위의 completion/archive overlay, Cancel/reopen과 archive lifecycle
- 위 기능을 main의 datastore, repository, hooks, shared components와 접근성 계약 위에서
  production-quality code로 재구현하는 작업
- 후속 EN/KR 구현을 준비하기 위해 이번 영어 UI의 새 user-facing copy를 Inbox 전용
  resource/copy ownership boundary에 모으는 localization foundation

이번 amendment에서 명시적으로 제외하거나 후속 작업으로 분리하는 범위는 다음과 같다.

- main 공용 `BitCard`와 Staging/Placed Node/Bit card의 새로운 8-theme visual redesign
- EN/KR resource, locale provider/toggle, 한국어 copy와 theme별 한국어 typography
  자체. 이번 범위에는 영어 copy ownership boundary만 포함
- Neumorphism ASC/DESC control의 water-lens 표현
- cross-surface text line count, ellipsis, wrapping과 editor IME 세부 정책
- pointer drag 이외의 별도 Placement 진입 경로
- 2-3 prototype의 duplicated route, mock mutation, local state architecture 자체

## Source Intake

| Source                                                                      | Type               | Decision       | Scope                                                                                                                                                                    | Provenance                                                                                                        |
| --------------------------------------------------------------------------- | ------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `2026-06-25-inbox-triage-theme-surface-redesign/DECISION.md`                | Product Decision   | Adopt          | 이번 승격의 product behavior, lifecycle, interaction, architecture boundary와 visual-recipe 구조의 단일 authority                                                        | main commit `40764c2`; `Readiness: code-ready`                                                                    |
| `2026-04-28-inbox-triage-workspace/DECISION.md`                             | Product Decision   | Partial Adopt  | 4영역 workspace, Scratch ownership, placement confirmation과 archive lifecycle의 retained foundation                                                                     | main repository; current DECISION의 Authority And Supersession에서 명시적으로 유지                                |
| `griddo2-claude`                                                            | Functional Source  | Partial Adopt  | datastore/repository, schema, shared components, hooks, DnD sensors, accessibility와 production ownership baseline. Current DECISION과 충돌하는 behavior는 채택하지 않음 | functional baseline commit `48af728e872217a340c0d02ac5bec58e3ea09c36`; 동일 code baseline `23efe5b`               |
| `griddo2-claude-themes2-3`의 8개 final Inbox/Triage route                   | Design Source      | Partial Adopt  | area-level 8-theme layout, visual hierarchy, semantic-state treatment와 affordance realization. 구현 구조와 mock mutation은 제외                                         | commit `4f39709688ceb4cac5e15d4e3502186b1f1c801b`; clean worktree; 아래 route set 참조                            |
| `2026-06-25-inbox-triage-theme-surface-redesign/NOTES.md`                   | Exploratory Source | Reference-only | main/2-3 audit, interview recovery, source conflict와 Prototype Variant Area Selection의 근거                                                                            | main commit `40764c2`; status `audit and interview record — complete`                                             |
| `2026-05-28-inbox-triage-theme-variants/DECISION.md`                        | Product Decision   | Reference-only | 이전 visible-label removal과 compact context 결정의 supersession 추적                                                                                                    | `Readiness: draft`; current DECISION이 해당 범위를 대체                                                           |
| historical `PROTOTYPE_FUNCTION_GAP_2_4.md`와 `PROTOTYPE_TO_MAIN_HANDOFF.md` | Exploratory Source | Reference-only | 과거 translation/handoff 근거만 확인                                                                                                                                     | Git commit `48af728` 및 `25ffe0d`; current working tree에서는 삭제됨                                              |
| `docs/recipes/inbox-triage-batch2-visual-recipe.md`                         | Design Source      | Reference-only | 과거 Batch 2 시각 결정과 충돌 위치 추적                                                                                                                                  | current main; label removal, compact context, active-column search를 포함하여 direct execution source로 사용 금지 |

모든 adopted Design Source는 아래 route alias와 surface recipe에 연결되어 Step 0.75가
추측 없이 source region을 찾을 수 있다. 유일하게 직접적인 최종 visual source가 없는
영역은 whole-hierarchy search result screen이다. 이 realization은 아직 채택되지 않았으며
phase-local open question과 Grid Search & Result UI phase의 `Decision prerequisite` task로
추적한다. 사용자 검토로 realization이 결정되기 전에는 확정 `Task instruction`이나
Step 0.75 recipe 대상으로 취급하지 않는다.

### Prototype Route Set

아래 파일들은 모두 `griddo2-claude-themes2-3` commit `4f39709` 기준이다.

| Alias            | Route source                                           |
| ---------------- | ------------------------------------------------------ |
| `P-griddo`       | `src/app/prototype/inbox-triage-griddo/page.tsx`       |
| `P-tiny-desk`    | `src/app/prototype/inbox-triage-tiny-desk/page.tsx`    |
| `P-neumorphism`  | `src/app/prototype/inbox-triage-neumorphism/page.tsx`  |
| `P-claymorphism` | `src/app/prototype/inbox-triage-claymorphism/page.tsx` |
| `P-origami`      | `src/app/prototype/inbox-triage-origami/page.tsx`      |
| `P-terminal`     | `src/app/prototype/inbox-triage-terminal/page.tsx`     |
| `P-retro-mac`    | `src/app/prototype/inbox-triage-retro-mac/page.tsx`    |
| `P-graphite`     | `src/app/prototype/inbox-triage-graphite/page.tsx`     |

## Prototype Variant Area Selection

`NOTES.md`의 handoff table을 amendment-mode canonical type과 target으로 정규화했다.
복합 신호는 structure/interaction, visual recipe, token/task routing으로 분리했다.

| Area                                            | Adopt from / Signal                          | Type                 | Target               | Status / Notes                                                                                       |
| ----------------------------------------------- | -------------------------------------------- | -------------------- | -------------------- | ---------------------------------------------------------------------------------------------------- |
| 4-area workspace ratio                          | foundational decision + main                 | Structure decision   | `DECISION.md`        | reflected in DECISION.md; 기존 `60/40`, `60/40`, `35/65` contract 유지                               |
| Visible section chrome structure                | all 8 prototype routes                       | Structure decision   | `DECISION.md`        | reflected in DECISION.md; label 제거 정책을 대체                                                     |
| Visible section chrome realization              | all 8 prototype routes                       | Visual recipe        | `Recipe`             | recipe target confirmed; theme별 display label, typography와 chrome 추출 필요                        |
| Scratch expanded/collapsed structure            | all 8 routes                                 | Structure decision   | `DECISION.md`        | reflected in DECISION.md                                                                             |
| Scratch first-key collapse and manual exception | main behavior + interview                    | Interaction decision | `DECISION.md`        | reflected in DECISION.md; focus-collapse는 폐기                                                      |
| Scratch tools realization                       | all 8 routes                                 | Visual recipe        | `Recipe`             | recipe target confirmed                                                                              |
| Selected Scratch Context role and hierarchy     | all 8 routes + user review                   | Structure decision   | `DECISION.md`        | reflected in DECISION.md; signature section으로 확정                                                 |
| Selected Scratch Context realization            | all 8 routes                                 | Visual recipe        | `Recipe`             | recipe target confirmed                                                                              |
| Selected Scratch Context semantic-state mapping | current DECISION + 8-theme review            | Token implication    | `DESIGN_TOKENS.md`   | token implication confirmed                                                                          |
| Breakdown row actions and lifecycle             | all 8 routes + main persistence              | Interaction decision | `DECISION.md`        | reflected in DECISION.md; staged 유지, consumed active list 제외                                     |
| Scratch/row inline edit                         | user interview + main datastore              | Interaction decision | `DECISION.md`        | reflected in DECISION.md; blur save와 save-before-next-action 포함                                   |
| Placement result title limits                   | main schema/DnD audit + interview            | Interaction decision | `DECISION.md`        | reflected in DECISION.md; staged와 direct flow를 분리                                                |
| Breakdown staged-state realization              | all 8 routes                                 | Visual recipe        | `Recipe`             | recipe target confirmed                                                                              |
| Breakdown empty/completion realization          | all 8 routes                                 | Visual recipe        | `Recipe`             | recipe target confirmed; theme copy와 prompt hierarchy 포함                                          |
| Staging Node/Bit information structure          | foundational decision + all 8 routes         | Structure decision   | `DECISION.md`        | reflected in DECISION.md                                                                             |
| Staging final Node/Bit card redesign            | future main BitCard worktree                 | Reference only       | `Non-Promoted Items` | deferred to future topic; 현재 공용 surface 소비                                                     |
| Grid header, level labels and search mode       | all 8 routes + main audit + interview        | Structure decision   | `DECISION.md`        | reflected in DECISION.md; active-column search를 전체 hierarchy mode로 대체                          |
| Whole-hierarchy result-screen realization       | current DECISION; direct prototype source 없음 | Visual recipe        | `Task instruction`   | pending user confirmation; Grid Search & Result UI phase의 `Decision prerequisite`에서 결정           |
| Grid shell/header/theme realization             | all 8 routes                                 | Visual recipe        | `Recipe`             | recipe target confirmed; result-screen 자체의 새 layout은 extraction 대상 아님                       |
| Invalid/unavailable drop behavior               | all 8 routes                                 | Interaction decision | `DECISION.md`        | reflected in DECISION.md                                                                             |
| Invalid/unavailable drop realization            | all 8 routes                                 | Visual recipe        | `Recipe`             | recipe target confirmed                                                                              |
| Staged placement flow                           | all 8 routes                                 | Interaction decision | `DECISION.md`        | reflected in DECISION.md                                                                             |
| Staged placement affordance realization         | all 8 routes                                 | Visual recipe        | `Recipe`             | recipe target confirmed                                                                              |
| Direct row type/path flow                       | all 8 routes                                 | Interaction decision | `DECISION.md`        | reflected in DECISION.md                                                                             |
| Direct row type/path affordance realization     | all 8 routes                                 | Visual recipe        | `Recipe`             | recipe target confirmed                                                                              |
| Actual Node/Bit placement result                | all 8 routes + main mutation                 | Interaction decision | `DECISION.md`        | reflected in DECISION.md; 임시 placed indicator는 미승격                                             |
| Newly Placed lifecycle                          | all 8 routes + interview correction          | Interaction decision | `DECISION.md`        | reflected in DECISION.md; Scratch/column 전환 유지, route exit 종료                                  |
| Newly Placed treatment                          | all 8 routes                                 | Visual recipe        | `Recipe`             | recipe target confirmed; 기존 Node/Bit card 문법 유지                                                |
| Source-aware Undo                               | all 8 routes + interview                     | Interaction decision | `DECISION.md`        | reflected in DECISION.md                                                                             |
| Archive completion flow                         | all 8 routes + main persisted lifecycle      | Interaction decision | `DECISION.md`        | reflected in DECISION.md                                                                             |
| Archive overlay/completed Context realization   | all 8 routes                                 | Visual recipe        | `Recipe`             | recipe target confirmed                                                                              |
| Theme switcher/fold lock/test controls          | prototype sidebar                            | Discard              | `Non-Promoted Items` | discarded; prototype review/development UI                                                           |
| Hover numbering/variant switchers               | prototype exploration history                | Discard              | `Non-Promoted Items` | discarded; final route에서 제거된 review UI                                                          |
| Korean duplicate route implementation           | removed exploration                          | Discard              | `Non-Promoted Items` | duplicated routes는 폐기; i18n 제품 방향은 후속 작업으로 유지                                        |
| Neumorphism water-lens sort                     | user direction, final source 없음            | Reference only       | `Non-Promoted Items` | deferred to future visual-polish topic                                                               |

Structure/Interaction row는 모두 current `DECISION.md`에 의미적으로 반영되어 있으므로
amendment pipeline을 차단하는 `decision update required` row는 없다.

## Adoption Slot Map

### UI Surfaces

| Surface                                | Functional/data slot                                             | Structure/interaction slot                            | Visual realization slot                                                                                              | Reusable code slot                                                                 |
| -------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Common 4-area shell and section chrome | main `TriageWorkspace`                                           | current DECISION Common Surface Contract              | 2-3 route set + shell/chrome recipe                                                                                  | main shared layout/components                                                      |
| Scratch Pool                           | main `scratch-pool.tsx`, `triage-store.ts` behavior baseline     | current DECISION Scratch Pool                         | 2-3 route set + Scratch Pool recipe                                                                                  | main component/store, revised lifecycle owner                                      |
| Selected Scratch Context               | main selected Scratch data                                       | current DECISION Breakdown / Selected Scratch Context | 2-3 route set + Selected Context recipe                                                                              | main `BreakdownPanel` decomposition                                                |
| Breakdown rows and empty state         | main `scratchBreakdowns` repository                              | current DECISION Breakdown                            | 2-3 route set + Breakdown recipe                                                                                     | main hooks/repository/shared row controls                                          |
| Staging                                | durable candidate model to be added to main                      | current DECISION Staging                              | 2-3 route set + Staging recipe; final BitCard redesign not adopted                                                   | main `StagingZone`, revised repository/store boundary                              |
| Grid Explorer shell/columns            | main hierarchy data and card components                          | current DECISION Grid Explorer And Placement          | 2-3 route set + Grid Explorer recipe                                                                                 | main `HierarchyExplorer`, new Inbox-specific query/hook/panel                      |
| Whole-hierarchy search result mode     | new main Inbox-specific search query/result model                | current DECISION Search Scope/Selection/Recovery      | not adopted; visual/content layout은 Phase-local unresolved. 기존 theme chrome/card grammar는 검토 context이며 승인된 fallback이 아님 | new shared search panel/hook; global `searchAll()` shape 재사용 금지               |
| Placement affordances                  | main DnD sensors/drop data and repository writes                 | current DECISION staged/direct flows and reliability  | 2-3 route set + placement recipe                                                                                     | main `useTriageDnd` responsibilities split into explicit state/mutation boundaries |
| Newly Placed and Undo                  | persistent result records + page-session operation metadata      | current DECISION Newly Placed State / Undo            | 2-3 route set + Newly Placed recipe                                                                                  | main Node/Bit cards plus new page-session owner                                    |
| Archive/completion                     | main Scratch lifecycle and persisted Breakdown/candidate queries | current DECISION Completion And Archive               | 2-3 route set + Archive recipe                                                                                       | main `BreakdownPanel`, archive hook/repository                                     |

### Functional Capabilities

| Capability                         | Data model                                                                         | Behavior                                                                                      | API/mutation surface                                                   | Migration strategy                                                                       |
| ---------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Scratch/row optimistic concurrency | persistent Scratch record and `scratchBreakdowns` monotonic version                | compare base version and lifecycle; no last-write-wins                                        | repository result contract shared by title and row edits               | Dexie schema migration now; same version/CAS semantics preserved for future BaaS         |
| Durable Staging candidates         | new candidate domain store with stable ID, Scratch/source/type/lifecycle/version   | one active candidate per source row; source-derived label; durable across route/reload/device | idempotent stage/unstage and authoritative query/subscription          | Dexie store/indexes now; future remote table/constraint through same repository contract |
| Placement commit                   | Node/Bit + source Breakdown + optional candidate                                   | Confirm revalidation and all-or-nothing commit                                                | operation ID, idempotent transaction/result reconciliation             | Dexie read-write transaction; future PostgreSQL transaction/function                     |
| Newly Placed projection            | actual Node/Bit records plus page-session operation metadata                       | route-exit reset; Scratch/column/theme/locale switch preserves state                          | projection/reveal/eligibility API, no permanent marker field           | no DB migration for marker; persistent result remains normal Node/Bit                    |
| Source-aware Undo                  | placement provenance in page-session operation metadata plus authoritative records | delete result and restore candidate/row atomically when still eligible                        | source-aware rollback transaction with conflict/result reconciliation  | Dexie transaction; future PostgreSQL function                                            |
| Archive eligibility and commit     | persisted `consumedAt`, durable candidates, Scratch lifecycle                      | requires consumed evidence, all rows consumed, no candidates or blockers                      | eligibility query + idempotent archive mutation                        | existing Scratch archive field; query and mutation contract amendment                    |
| Localization foundation            | Inbox-owned English copy/resource boundary                                         | theme/locale switch가 작업 state를 초기화하지 않는 공통 contract                              | core에서는 copy ownership만 마련; locale provider/resource 연결은 후속 | schema migration 없음                                                                    |

No true source conflict remains. Main is the production/data/code baseline, current DECISION is the
behavior authority, and 2-3 provides parallel theme realizations rather than competing product rules.

## Visual Recipe Artifacts

Recipe는 theme-first가 아니라 surface-first hybrid로 작성한다. 각 recipe 안에
`P-griddo`부터 `P-graphite`까지 8개 realization section을 둔다.

| Source                                                 | Realization                                                   | Recipe Path                                                           | Status               | Notes                                                                                                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| all prototype routes, shell and section header regions | 4-area shell / section chrome                                 | `docs/recipes/inbox-triage-shell-section-chrome-visual-recipe.md`     | complete             | exact ratio-adjacent spacing, label/chrome, divider, scroll treatment; targeted screenshots required                                       |
| all prototype routes, Scratch Pool regions             | Scratch Pool expanded/collapsed/tools                         | `docs/recipes/inbox-triage-scratch-pool-visual-recipe.md`             | complete             | first-key behavior는 DECISION 소유; recipe는 exact visual/motion만 추출                                                                    |
| all prototype routes, Breakdown context regions        | Selected Scratch Context                                      | `docs/recipes/inbox-triage-selected-scratch-context-visual-recipe.md` | complete             | final selected variant와 completion variant 모두 추출; 2-2.5 row-height role 검증                                                          |
| all prototype routes, Breakdown row/list/empty regions | Breakdown rows / staged / empty prompt                        | `docs/recipes/inbox-triage-breakdown-visual-recipe.md`                | complete             | active/staged/pending/restore signal과 edit/trash/sort realization; screenshots required                                                   |
| all prototype routes, Staging regions                  | Staging shell, Node/Bit candidate, pending and unstage target | `docs/recipes/inbox-triage-staging-visual-recipe.md`                  | complete             | final shared BitCard redesign은 제외; 현재 adopted candidate shape만 기록. Prototype grip handle은 제외하고 full-card drag contract를 보존 |
| all prototype routes, Grid regions                     | Grid Explorer shell, header, columns, cards and drop signals  | `docs/recipes/inbox-triage-grid-explorer-visual-recipe.md`            | complete             | existing theme chrome/card grammar만 추출; 새 whole-hierarchy result layout을 prototype fact로 기록하지 않음                               |
| all prototype routes, staged/direct placement regions  | Placement affordances                                         | `docs/recipes/inbox-triage-placement-affordances-visual-recipe.md`    | complete             | staged Confirm과 direct type/path UI를 분리 추출; pending/error/reconciliation은 DECISION 계약과 결합                                      |
| all prototype routes, placed Node/Bit regions          | Newly Placed / Undo                                           | `docs/recipes/inbox-triage-newly-placed-undo-visual-recipe.md`        | complete             | 기존 Node/Bit card 내부 grammar 유지 여부를 screenshot과 코드로 확인. Static marker만 채택하고 prototype `animate-pulse`는 제거            |
| all prototype routes, archive/completion regions       | Archive overlay / complete Context / reopen                   | `docs/recipes/inbox-triage-archive-completion-visual-recipe.md`       | complete             | Breakdown-scoped blur/overlay와 Cancel 이후 state를 함께 추출                                                                              |
| 위 surface recipes와 route set                         | navigation index                                              | `docs/recipes/inbox-triage-visual-recipe-index.md`                    | complete             | source region, theme, production owner와 execution task를 연결; recipe 대체물이 아님                                                       |

Whole-hierarchy search result screen의 exact visual은 2-3에 존재하지 않는다. 이 부분은
`Recipe` extraction 항목이 아니며 아직 확정 `Task instruction`도 아니다. Grid Search & Result UI
phase의 `Decision prerequisite`에서 visual treatment, content layout, interaction detail과 responsive
layout을 먼저 사용자에게 검토받는다. 기존 8-theme Grid Explorer chrome과 Node/Bit card grammar는
설계 context로만 사용하며 자동 minimal fallback으로 간주하지 않는다.

## Decision Mapping

### Data And Mutation Contracts

Scratch title/Breakdown row optimistic concurrency
-> `SCHEMA.md` § Object Stores > bits (existing, amend)
-> `SCHEMA.md` § Object Stores > scratchBreakdowns (existing, amend)
-> `SCHEMA.md` § Zod Validation Schemas (existing, amend)
-> `SPEC.md` § Architecture Decisions > Optimistic Concurrency Result Contract (new)
-> `SPEC.md` § Page Layouts > Inbox / Triage Workspace > Concurrent Edit Conflict (new)
-> `PLANNING_STANDARD.md` § 6. Architecture Conformance Checklist > Data And Mutation Conformance (new)

Durable staged candidate lifecycle and source uniqueness
-> `SCHEMA.md` § Object Stores > Triage Staged Candidates (new)
-> `SCHEMA.md` § Zod Validation Schemas (existing, amend)
-> `SPEC.md` § Page Layouts > Inbox / Triage Workspace > Staging (new)
-> `SPEC.md` § Architecture Decisions > Durable Candidate Repository (new)
-> `PLANNING_STANDARD.md` § 6. Architecture Conformance Checklist > Inbox/Triage Persistence Boundary (new)

Atomic Stage, Unstage, Placement, Undo and Archive operations
-> `SCHEMA.md` § Application Hooks > Inbox/Triage Atomic Mutations (new)
-> `SCHEMA.md` § Key Queries > Candidate And Placement Reconciliation (new)
-> `SPEC.md` § Page Layouts > Inbox / Triage Workspace > Reliability And Reconciliation (new)
-> `PLANNING_STANDARD.md` § 6. Architecture Conformance Checklist > Atomic Mutation And Recovery Checks (new)

### Common And Scratch Pool

Visible section chrome, scrolling and 8-theme semantic states
-> `SPEC.md` § Page Layouts > Inbox / Triage Workspace (existing, amend)
-> `DESIGN_TOKENS.md` § Inbox / Triage Batch 2 Surface Contract > Removed Visible Labels (existing, replace with Visible Section Identity styling contract)
-> `DESIGN_TOKENS.md` § Surface Recipes > Batch 2 Inbox / Triage (existing, mark superseded and replace with surface-first recipe references)

Scratch selection, expanded/collapsed structure, search/sort and first-key collapse
-> `SPEC.md` § Page Layouts > Inbox / Triage Workspace (existing, amend)
-> `DESIGN_TOKENS.md` § Inbox / Triage Batch 2 Surface Contract > Scratch Pool (existing, amend)

### Breakdown

Selected Scratch Context signature role and editing
-> `SPEC.md` § Page Layouts > Inbox / Triage Workspace (existing, amend)
-> `DESIGN_TOKENS.md` § Inbox / Triage Batch 2 Surface Contract > Breakdown (existing, amend)

Breakdown Add/Edit/Delete and active/staged/consumed lifecycle
-> `SCHEMA.md` § Object Stores > scratchBreakdowns (existing, amend)
-> `SCHEMA.md` § Application Hooks > Breakdown Active And Consumed Predicates (new)
-> `SPEC.md` § Page Layouts > Inbox / Triage Workspace (existing, amend)
-> `EXECUTION_PLAN.md` § Phase Index (existing, amend; owning phase: Breakdown Foundation)

### Staging

Node/Bit candidate structure, full-card drag and unstage/drop-back
-> `SPEC.md` § Page Layouts > Inbox / Triage Workspace (existing, amend)
-> `DESIGN_TOKENS.md` § Compact Drag Token (Inbox/Triage) (existing, amend)
-> `DESIGN_TOKENS.md` § Inbox / Triage Batch 2 Surface Contract > DnD States (existing, amend)
-> `EXECUTION_PLAN.md` § Phase Index (existing, amend; owning phase: Durable Staging)

### Grid Search And Placement

Whole-hierarchy search mode, breadcrumb disambiguation, reveal and DnD recovery
-> `SPEC.md` § Page Layouts > Inbox / Triage Workspace (existing, amend)
-> `SPEC.md` § Architecture Decisions > Dedicated Grid Explorer Search (new)
-> `SPEC.md` § File Organization Conventions (existing, amend)
-> `SPEC.md` § Key File Paths (existing, amend)
-> `DESIGN_TOKENS.md` § Inbox / Triage Batch 2 Surface Contract > Hierarchy Search (existing, amend)
-> `EXECUTION_PLAN.md` § Phase Index (existing, amend; owning phase: Grid Search & Result UI,
   whole-hierarchy result realization is a `Decision prerequisite`)

Placement target constraints, staged/direct affordance split and title validation
-> `SCHEMA.md` § Application Hooks > Inbox/Triage Atomic Placement (new)
-> `SCHEMA.md` § Key Queries > Placement Reconciliation (new)
-> `SPEC.md` § Page Layouts > Inbox / Triage Workspace (existing, amend)
-> `DESIGN_TOKENS.md` § Inbox / Triage Batch 2 Surface Contract > DnD States (existing, amend)
-> `EXECUTION_PLAN.md` § Phase Index (existing, amend; owning phase: Placement Flows)

### Newly Placed, Undo And Archive

Actual-card Newly Placed projection and source-aware Undo
-> `SPEC.md` § Architecture Decisions > Inbox Page-Session Placement State (new)
-> `SPEC.md` § Page Layouts > Inbox / Triage Workspace (existing, amend)
-> `DESIGN_TOKENS.md` § Inbox / Triage Batch 2 Surface Contract > Newly Placed (new)
-> `EXECUTION_PLAN.md` § Phase Index (existing, amend; owning phase: Placement Recovery)

Completion eligibility, Breakdown-scoped archive overlay, Cancel/reopen and Confirm
-> `SCHEMA.md` § Application Hooks > Inbox Archive Eligibility (new)
-> `SCHEMA.md` § Application Hooks > 10. Archive Cascade (existing, amend)
-> `SCHEMA.md` § Application Hooks > 11. Archive Restore (existing, amend)
-> `SPEC.md` § Page Layouts > Inbox / Triage Workspace (existing, amend)
-> `DESIGN_TOKENS.md` § Inbox / Triage Batch 2 Surface Contract > Completion And Archive (new)
-> `EXECUTION_PLAN.md` § Phase Index (existing, amend; owning phase: Completion And Archive)

### Architecture And Delivery

Production ownership boundary and no duplicated theme routes
-> `SPEC.md` § Architecture Decisions > Inbox/Triage Production Ownership (new)
-> `SPEC.md` § File Organization Conventions (existing, amend)
-> `SPEC.md` § Key File Paths (existing, amend)
-> `PLANNING_STANDARD.md` § 6. Architecture Conformance Checklist > Theme Realization And Prototype Promotion (new)

Surface-first visual recipe structure and multi-batch implementation
-> `DESIGN_TOKENS.md` § Surface Recipes > Batch 2 Inbox / Triage (existing, amend with surface-first recipe references)
-> `EXECUTION_PLAN.md` § Phase Index (existing, amend with newly derived promotion phases)
-> `EXECUTION_PLAN.md` § Next Numbers (existing, re-read and increment during Step 4 allocation)

English copy ownership boundary for later localization
-> `SPEC.md` § Page Layouts > Inbox / Triage Workspace > Copy And Localization Boundary (new)
-> `SPEC.md` § File Organization Conventions (existing, amend)
-> `SPEC.md` § Key File Paths (existing, amend)

## Open Question Disposition

| Question                                                                 | Classification | Notes                                                                                                                                                           |
| ------------------------------------------------------------------------ | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SCHEMA를 이번 promotion에서 수정하는가                                   | Resolved       | `edit/pending`. Scratch/Breakdown version뿐 아니라 durable candidate와 atomic mutation boundary를 함께 다룬다.                                                  |
| SCHEMA exact fields, indexes와 migration shape                           | Phase-local    | Step 1에서 current datastore와 재대조한다. 별도 operation-log table은 선결정하지 않는다. Persistence/concurrency foundation phase가 소유한다.                   |
| Whole-hierarchy search result screen의 theme-specific visual realization | Phase-local    | Owner: Grid Search & Result UI phase. Visual treatment, content layout, interaction detail과 responsive layout은 미확정이다. 해당 phase의 EXECUTION_PLAN task를 `Decision prerequisite`로 두고 구현 전 사용자 검토로 결정한다. 기존 theme Grid chrome/card grammar는 context이며 승인된 fallback이 아니다. |
| Staging/placed Node/Bit의 final 8-theme BitCard redesign                 | Deferred       | core promotion 뒤 최신 main 기반 별도 worktree에서 탐색한다. 현재 공용 card surface를 사용한다.                                                                 |
| EN/KR resource, toggle, Korean typography                                | Deferred       | core promotion 직후 별도 functional/visual 단계로 진행한다. 이번 core에는 English copy ownership boundary만 포함한다.                                           |
| Neumorphism ASC/DESC water-lens                                          | Deferred       | final source가 없어 별도 visual polish로 분리한다.                                                                                                              |
| line count, ellipsis, wrapping, IME keyboard details                     | Deferred       | `2026-07-14-cross-surface-text-capacity-and-overflow`에서 결정한다. 현재 schema validity limit만 유지한다.                                                      |
| pointer drag 이외 Placement 진입 경로                                    | Deferred       | 현재 scope는 Mouse/Touch pointer DnD와 기존 sensor constraint를 유지한다. 별도 action-menu entry, keyboard drag mode 또는 destination picker는 추가하지 않는다. |
| BaaS 다중 사용자 presentation polish                                     | Non-blocking   | repository/version/transaction 의미는 보존하되 현재 local-first single-user promotion의 UI 범위를 확대하지 않는다.                                              |

Blocking open question은 없다.

## Canonical Doc Edit Plan

| Document               | Action | Status  | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------- | ------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SCHEMA.md`            | edit   | done    | Dexie v4에서 `bits`/`scratchBreakdowns` version을 backfill하고 durable `triageStagedCandidates` store와 source-unique/query indexes를 추가한다. Stage/Unstage, Placement, Undo, Archive의 transaction/CAS/idempotency/reconciliation contract와 key queries를 기록했다. 별도 Dexie operation-log store는 추가하지 않으며 stable target ID와 authoritative postcondition으로 조정한다. Future BaaS는 같은 command contract를 server idempotency table/function으로 구현할 수 있다. |
| `SPEC.md`              | edit   | done    | 기존 § Page Layouts > Inbox/Triage Workspace의 visible-label removal, compact Context, active-column Grid search, consumed line-through, UI-only Staging과 global archive/dialog 설명을 current DECISION의 전체 user flow로 교체했다. Breakdown row의 grip-only contract를 유지하고 Staged Node/Bit candidate만 별도 Grip 없이 full-card drag로 구분했다. § Architecture Decisions, § File Organization Conventions와 § Key File Paths를 갱신하고 optimistic concurrency, durable candidate repository, dedicated Explorer search, page-session placement projection, production ownership와 English copy ownership을 기록했다. Whole-hierarchy result realization은 별도 사용자 승인 전 시작하지 않는 Decision prerequisite로 유지했다. Step 4에서 반복 가능한 browser verification 경로가 필요함을 확인해 co-located unit/component test와 `tests/e2e/`/`playwright.config.ts` 소유권을 File Organization/Key File Paths에 보완했다. |
| `DESIGN_TOKENS.md`     | edit   | done    | 기존 hidden-label, compact Context, active-column search와 단일 Archive bar 계약을 visible section identity, signature Context, whole-hierarchy search boundary와 Breakdown-scoped completion 계약으로 교체했다. 공통 `data-triage-surface`/`data-triage-state` hook, 6개 semantic state의 non-color cue, Scratch/Breakdown/Staging/Grid/Placement/Newly Placed/Archive의 reusable mapping, compact drag 및 motion/reduced-motion 규칙을 기록했다. Display alias는 copy로 유지하고 token화하지 않았으며, 기존 단일 Batch 2 recipe는 superseded로 표시하고 9개 surface recipe와 index로 교체했다. |
| `EXECUTION_PLAN.md`    | edit   | done    | 최신 scaled guard `Phase 23 · Task 101`에서 시작해 Phase 23–33, Task 101–154를 도출하고 guard를 `Phase 34 · Task 155`로 갱신했다. Phase 15/17/18/22는 frozen historical baseline으로 재분류했으며 archive는 수정하지 않는다. Persistence/atomic commands, shared Scratch shell, Breakdown reliability, durable Staging, whole-hierarchy search, Placement, Newly Placed/Undo, Completion/Archive, 두 개의 8-theme realization batch, 통합 verification을 독립 build 가능한 순서로 나눴다. Phase 23과 33은 모든 Bit create/write 경로의 `version = 1`/logical mutation당 정확히 1회 증가를 direct 및 Hook 1/3/10/11 cascade까지 검증한다. Phase 27 Task 121은 search-result realization을 사용자 승인 recipe로 확정하기 전 Task 124를 시작할 수 없는 `Decision prerequisite`다. BitCard redesign, KR/i18n, water-lens, text-capacity/IME와 pointer 이외 Placement 진입은 명시적으로 제외했다. |
| `PLANNING_STANDARD.md` | edit   | done    | 기존 `Triage staging is UI-state-only` advisory를 durable candidate blocking boundary로 교체했다. 모든 Bit create의 `version = 1`, 기존 Bit content/position/completion/lifecycle logical mutation당 정확히 1회 증가와 direct/cascade 경로의 누락·중복 검증을 강제한다. Version/CAS result contract, atomic mutation/no-partial-success, unknown-outcome reconciliation, persisted consumption evidence와 empty-`every()` archive guard, dedicated Explorer query의 `searchAll()` 비재사용, route-exit Newly Placed lifecycle, source-aware Undo, shared production ownership, visual recipe/8-theme QA와 centralized English copy boundary를 blocking conformance로 추가했다. Active plan에는 제품 동작이 확정되고 별도 승인 산출물과 dependency를 소유한 non-code `Decision prerequisite`만 허용하도록 code-readiness 규칙도 보정했다. |

어떤 canonical 문서도 Step 0.5 approval 전에는 수정하지 않는다.

## Non-Promoted Items

| Item                                                                                                       | Type                             | Reason                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 2-3의 8개 route에 반복된 local state, handler와 mock mutation                                              | Prototype implementation         | 시각/interaction 결과만 채택한다. Production은 main의 shared ownership과 repository 위에서 재구현한다.                            |
| 2-3 `placedItemsByScratch` legacy string normalization                                                     | Prototype implementation         | production data model 또는 migration source로 사용하지 않는다.                                                                    |
| 2-3 local `triagedScratches` completion lock                                                               | Prototype behavior               | persisted consumed row와 durable candidate query로 eligibility를 계산한다.                                                        |
| Scratch focus/click 즉시 collapse                                                                          | Prototype behavior               | current DECISION의 first printable key trigger와 충돌한다.                                                                        |
| Scratch switch 시 Newly Placed 초기화                                                                      | Prototype behavior               | route exit까지 유지하는 current DECISION과 충돌한다.                                                                              |
| prototype sidebar theme switcher, Scratch Pool fold lock과 placed-item test mode                           | Prototype review UI              | development/review control이며 main product UI로 승격하지 않는다.                                                                 |
| prototype hover numbering/variant switchers와 dead variant state                                           | Prototype review UI              | 탐색용 UI이며 final route에서도 제거된 항목이다.                                                                                  |
| prototype의 repeated blink/pulse/flicker                                                                   | Prototype visual behavior        | Newly Placed와 warning의 필수 신호로 사용하지 않는다.                                                                             |
| route별 magic color/spacing/shadow를 component code로 직접 복사하는 방식                                   | Prototype implementation         | exact facts는 recipe로 추출하고 reusable rules는 theme token/realization contract로 옮긴다.                                       |
| removed Korean duplicate routes                                                                            | Exploratory implementation       | 8개 route 복제는 폐기한다. EN/KR 제품 방향 자체는 별도 shared i18n 후속 작업으로 유지한다.                                        |
| `2026-05-28-inbox-triage-theme-variants`의 label-removal/compact-context 결정                              | Superseded prior decision        | current DECISION이 해당 범위를 대체한다. 기존 canonical 문서에 남은 내용은 삭제 대상 문서가 아니라 이번 amendment에서 덮어쓴다.   |
| future main BitCard 8-theme redesign                                                                       | Deferred design source           | 아직 source가 존재하지 않아 이번 recipe에 추정해 넣지 않는다.                                                                     |
| Neumorphism water-lens sort treatment                                                                      | Deferred visual idea             | user direction은 있으나 final source가 없어 별도 visual polish로 진행한다.                                                        |
| `2026-07-14-cross-surface-text-capacity-and-overflow`의 display/IME 정책                                   | Separate Product Decision        | 현재 `Readiness: draft`; 이번 promotion은 100/200/1000자 data validity만 사용한다.                                                |
| `docs/recipes/inbox-triage-batch2-visual-recipe.md`의 label removal, compact Context, active-column search | Superseded design recipe         | current DECISION과 충돌하므로 direct execution recipe로 확장하지 않는다.                                                          |
| global `searchAll()` result shape를 Inbox Grid search에 재사용하는 방식                                    | Existing implementation shortcut | hierarchy ancestor chain, relevance, reveal과 DnD recovery contract를 충족하지 못하므로 새 Inbox-specific query model을 사용한다. |

## Approval Gate

이 통합 map이 승인되기 전에는 canonical 문서를 수정하지 않는다. 승인 후 Step 0.75에서
surface-first visual recipe를 추출하고, recipe/source mapping을 다시 제시한 뒤 다음 canonical
amendment 단계로 이동한다.
