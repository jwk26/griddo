# Promotion Map: Inbox/Triage 2-3 → Main (Claude draft)

> Source: `docs/brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/DECISION.md`
> Date: 2026-07-17
> Status: **Draft** (Claude) — awaiting approval gate. Parallel Codex draft lives at `PROMOTION_MAP.md`.
> Functional baseline: main `48af728` · Design source: `griddo2-claude-themes2-3` `4f39709` · EXECUTION_PLAN mode: scaled (Next phase 23)

---

## Promotion Scope

**In scope this round** (from DECISION § Promotion Boundary + user-approved additions):

- 4영역 Inbox/Triage 화면의 기존 비율(60/40, 60/40, 35/65)과 작업 흐름 보존
- visible section label/header/chrome 복원 (테마별 realization 포함)
- Scratch Pool 검색·생성일 정렬·접기·compact switching 정리
- Selected Scratch Context를 signature section(일반 row의 2~2.5배)으로 승격
- Breakdown row 정리 + active/staged/consumed 상태 계약 변경
- Staging Node/Bit 구조 + drop-back 흐름 (full-card drag; grip handle 미승격)
- Grid Explorer 전체 hierarchy 검색·경로·drop constraint·staged/direct placement 2단계 흐름
- 실제 Node/Bit card 기반 newly placed(page-session transient) + source-aware Undo
- Breakdown-scoped completion/archive lifecycle
- 8개 테마별 정보 위계·시각 역할 반영 (surface-first hybrid recipe)
- **[user-approved]** ScratchBreakdown/Scratch title optimistic-concurrency 계약, durable staged candidate 도메인화, 원자적 mutation 경계
- **[user-approved]** Localization: 이번 라운드는 **EN copy ownership boundary(Inbox resource/copy 집중)** 만 — functional foundation

**Explicitly out of scope** (deferred, does NOT block this round's user flow):

- main 공용 `BitCard`의 8개 테마별 표현 강화 → post-promotion BitCard worktree
- 갱신된 공용 Node/Bit surface를 Staging·placed/newly-placed card에 재사용하는 작업
- 한국어 resource, EN/KR 전환, 한국어 section label, 테마별 한글 typography (i18n 요구는 유지)
- Neumorphism ASC/DESC 투명 물방울(water-lens) sort control 표현
- 표시 줄 수/ellipsis/wrapping/expansion 등 text capacity 정책 → `2026-07-14-cross-surface-text-capacity-and-overflow`

---

## Source Intake

| Source | Type | Decision | Scope | Provenance |
|---|---|---|---|---|
| `2026-06-25-.../DECISION.md` | Product Decision | **Adopt** (primary) | 정책의 단일 출처 — 사용자 흐름, 상태 계약, 8-theme 위계 | topic dir (Readiness: code-ready) |
| `griddo2-claude` (main) | Functional Source | **Adopt** | 데이터 모델·store·hook·접근성·production 구조 baseline | commit `48af728` (code baseline ≡ Phase 22 `23efe5b`) |
| `griddo2-claude-themes2-3` | Mixed Design Source | **Adopt (area/variant realization)** | 8개 route의 layout·interaction·visual realization | clean commit `4f39709`; worktree clean |
| `.../NOTES.md` | Supporting Evidence | Reference | code/visual audit, interview 이력, Area Selection table | topic dir |
| `2026-04-28-inbox-triage-workspace/DECISION.md` | Product Decision (foundational, code-ready) | **Reference (retained authority)** | 4영역·lifecycle·placement·archive 기반 — 이미 main 반영 | topic dir |
| `2026-05-28-inbox-triage-theme-variants/DECISION.md` | Prior Decision (draft) | **Reference-only (superseded)** | label 제거·compact context 결정이 이번에 대체됨 | topic dir (Readiness: draft) |
| `PROTOTYPE_FUNCTION_GAP_2_4.md` (historical) | Exploratory Source | Reference-only | 2-4 UX 변경 후보 이력 | removed; `git show 48af728:…` |
| `PROTOTYPE_TO_MAIN_HANDOFF.md` (historical) | Exploratory Handoff | Reference-only | 재구현 관점 ledger (일부 낡음) | removed; `git show 25ffe0d:…` |
| `docs/recipes/inbox-triage-batch2-visual-recipe.md` | Superseded historical recipe | Reference-only | 낡은 label/compact 지시 포함 → direct execution recipe로 확장 금지 | working tree |

> Downstream-ready note: Design Source rows for Step 0.75 carry worktree + route path + theme (see Visual Recipe Artifacts). No source is left `pending source confirmation` **except** the Grid search-result surface, which has no direct 2-3 visual source (tracked as a Phase-local realization, not a recipe).

---

## Prototype Variant Area Selection

Normalized from NOTES.md § Prototype Variant Area Selection (handoff artifact). Target uses the shared-contract vocabulary (`DECISION.md` = reflected structure/interaction · `Recipe` = Step 0.75 · `DESIGN_TOKENS.md` = token implication · `Non-Promoted Items` = discard/defer). Compound rows note both routes in Status.

| Area | Adopt from / Signal | Type | Target | Status / Notes |
|---|---|---|---|---|
| 4-area workspace ratio | foundational decision + main | Structure | DECISION.md | reflected in DECISION.md (Common Surface Contract) |
| Visible section chrome | all 8 routes @4f39709 | Structure + Visual recipe | DECISION.md + Recipe | structure reflected; exact theme chrome → Step 0.75 |
| Scratch expanded/collapsed structure | 8 routes + main first-key | Structure + Interaction | DECISION.md | reflected — merged authority (main first-key wins; prototype focus-collapse NOT promoted) |
| Scratch tools visual realization | all 8 routes | Visual recipe | Recipe | recipe target confirmed → Step 0.75 |
| Selected Scratch Context | all 8 routes | Structure + Visual recipe | DECISION.md + Recipe | structure reflected (signature section 2~2.5×); exact recipe → Step 0.75 |
| Breakdown row actions/lifecycle | 8 routes + main persistence | Interaction | DECISION.md | reflected (Breakdown) |
| Scratch/row inline edit | user interview + main datastore | Interaction | DECISION.md | reflected — title/content-only, blur save, save-before-next-action |
| Over-limit placement title | main schema/DnD audit + interview | Interaction (+ data validation) | DECISION.md | reflected — staged→Result title modal; direct→length-gated, no editor |
| Breakdown staged visual state | all 8 routes | Visual recipe | Recipe | recipe target confirmed → Step 0.75 |
| Breakdown empty/completion prompt | all 8 routes | Visual recipe + content | Recipe + Task instruction | recipe + exact copy → Step 0.75 / task copy |
| Staging Node/Bit structure | foundational + all 8 routes | Structure | DECISION.md | reflected (Staging); grip handle rejected, full-card drag |
| Staging final card redesign | future BitCard worktree | Unresolved visual realization | Non-Promoted Items | **Deferred** — post-promotion; this round uses current main BitCard |
| Grid header/search/level labels | 8 routes + main search + 2026-07-13 interview | Structure + Interaction | DECISION.md | reflected — full labels + theme chrome adopted; active-column search REPLACED by full-hierarchy search |
| Invalid/unavailable drop signal | all 8 routes | Interaction + Visual recipe | DECISION.md + Recipe | interaction reflected; theme recipes → Step 0.75 |
| Staged placement affordance | all 8 routes | Interaction + Visual recipe | DECISION.md + Recipe | reflected; recipes → Step 0.75 |
| Direct row type/path affordance | all 8 routes | Interaction + Visual recipe | DECISION.md + Recipe | reflected; recipes → Step 0.75 |
| Actual card placement result | 8 routes + main mutation | Interaction | DECISION.md | reflected — real record + existing card, no indicator card |
| Newly placed card treatment | all 8 routes | Interaction + Visual recipe | DECISION.md + Recipe | reflected with corrected lifecycle (route-exit end); recipes → Step 0.75 |
| Source-aware Undo | all 8 routes | Interaction | DECISION.md | reflected |
| Archive overlay/completed context | all 8 routes | Interaction + Visual recipe | DECISION.md + Recipe | reflected; recipes → Step 0.75 |
| Theme switcher/fold lock/test controls | prototype sidebar | Discard | Non-Promoted Items | prototype review UI — 승격 금지 |
| Hover numbering/variant switchers | exploration history | Discard | Non-Promoted Items | 최종 UI에서 제거됨 |
| Korean duplicate routes | removed exploration | Discard (implementation) | Non-Promoted Items | i18n requirement만 후속 결정으로 유지 |
| Neumorphism water-lens sort | user direction, no final source | Unresolved visual realization | Non-Promoted Items | **Deferred** — post-promotion polish |

**Pipeline gate:** No row remains `decision update required`. All Structure/Interaction rows semantically verified as reflected in DECISION.md (7 divergence-prone rows checked in full). Gate **not blocked**.

---

## Adoption Slot Map

Relationship: **variant realization, not conflict.** main = functional/data/structure/accessibility baseline; 2-3 = 8-theme layout/interaction/visual realization under one shared semantic contract; reusable code = main only (2-3 code is mock/duplicate, reference-only).

```
Surface: Common (shell / section chrome / scroll / theme+locale switch)
  structural baseline → main + DECISION Common Surface Contract (Adopt)
  interaction model   → DECISION (theme/locale switch = presentation, no state reset) (Adopt)
  realization: 8 themes → themes2-3 @4f39709 (Adopt) → Recipe: shell/section chrome
  reusable code       → main triage-workspace.tsx (Adopt)

Surface: Scratch Pool
  structural baseline → main + DECISION (tools-top / list-bottom) (Adopt)
  interaction model   → main first-printable-key auto-collapse (Adopt; prototype focus-collapse rejected)
  realization: 8 themes → themes2-3 (Adopt) → Recipe: Scratch Pool (tools/list/collapsed)
  reusable code       → main scratch-pool.tsx + triage-store.ts (Adopt)

Surface: Breakdown (Selected Context / rows / edit / empty+completion)
  structural baseline → DECISION (Selected Context = signature section) (Adopt)
  interaction model   → DECISION (inline edit: title/content-only, blur save, save-before-next-action) (Adopt)
  realization: 8 themes → themes2-3 (Adopt) → Recipe: Selected Context, Breakdown row/empty state
  reusable code       → main breakdown-panel.tsx (Adopt)

Surface: Staging (Node/Bit)
  structural baseline → DECISION + foundational (Node grid / Bit list; 35/65) (Adopt)
  interaction model   → DECISION (full-card drag via main DragOverlay/TriageDragToken) (Adopt)
  realization: 8 themes → themes2-3 (Adopt) → Recipe: Staging
  reusable code       → main staging-zone.tsx + triage-store.ts (Adopt)
  [not adopted] Staging/placed CARD 8-theme visual → DEFERRED (uses current main BitCard this round)

Surface: Grid Explorer + Placement
  structural baseline → main hierarchy columns + DECISION (Adopt)
  interaction model   → DECISION (full-hierarchy search; staged/direct 2-step placement; re-validate before Confirm; no partial success) (Adopt)
  functional dependency → NEW dedicated Explorer search query/hook/result model (searchAll() 재사용 금지) (Adopt — built in this promotion)
  realization: 8 themes → themes2-3 (Adopt) → Recipe: Grid Explorer chrome, placement affordances, drop signals
  reusable code       → main hierarchy-explorer.tsx + use-dnd.ts (Adopt, re-architected)
  [not adopted] Grid full-hierarchy SEARCH-RESULT screen visual → NOT ADOPTED; user-facing realization unresolved
      → structure/interaction from DECISION; visual basis = each theme's existing Grid Explorer header/search chrome + existing Node/Bit card grammar
      → Phase-local; requires separate user review checkpoint before implementation (NOT a Step 0.75 recipe)

Surface: Newly Placed / Undo
  structural baseline → real Node/Bit card + DECISION (page-session transient projection) (Adopt)
  interaction model   → DECISION (not cleared on scratch/column switch; ends on route exit; source-aware Undo) (Adopt)
  realization: 8 themes → themes2-3 treatment (Adopt) → Recipe: Newly Placed/Undo (static marker only, no pulse/flicker)
  reusable code       → main mutation hooks + new page/session transient owner (Adopt)

Surface: Archive / Completion
  structural baseline → main use-can-archive-scratch.ts + DECISION (Adopt)
  interaction model   → DECISION (Breakdown-scoped blur overlay; Cancel→complete/reopen; eligibility = ≥1 consumed + all consumed + no staged; empty-every() guard) (Adopt)
  realization: 8 themes → themes2-3 (Adopt) → Recipe: archive/completion surface
  reusable code       → main breakdown-panel.tsx + use-can-archive-scratch.ts (Adopt)

Capability: Persistence / Concurrency / Mutation atomicity  [user-approved SCHEMA scope]
  data model → main datastore + NEW contracts (Adopt, edit SCHEMA):
      · monotonic version on persisted Scratch record + scratchBreakdowns (optimistic concurrency)
      · durable staged candidate (repository/domain data, not Zustand): stable id, scratchId,
        sourceBreakdownRowId, node/bit type, lifecycle/version; uniqueness = 1 active candidate per source row
  behavior → DECISION (Dexie: id+base version+lifecycle compare in one RW txn; BaaS: atomic update / DB function parity)
  API surface → atomic mutation boundaries for Stage/Unstage, Placement Confirm, source consume,
      candidate removal, source-aware Undo (no partial success); operation ID / idempotency locations recorded
  migration strategy → exact fields + migration shape confirmed at Step 1 vs current datastore
      (operation-log table NOT pre-decided here)

Capability: Localization foundation
  scope → EN copy ownership boundary only (Inbox resource/copy) this round (Adopt)
  [not adopted] KR resource / EN·KR toggle / KR typography → DEFERRED (post-core)
```

No unresolved **true** slot conflicts. Three explicit not-adopted realization slots recorded (Grid search-result = Phase-local; Staging/placed card visual + Neumorphism water-lens = Deferred).

---

## Visual Recipe Artifacts (Step 0.75 targets)

Surface-first hybrid (per DECISION § Visual Recipe Structure). Each recipe holds 8 theme realization sections. Source region = all 8 routes at `griddo2-claude-themes2-3` `4f39709`, `src/app/prototype/inbox-triage-<theme>/page.tsx` (themes: griddo, tiny-desk, neumorphism, claymorphism, origami, terminal, retro-mac, graphite).

| Surface | Realization | Recipe Path | Status | Notes |
|---|---|---|---|---|
| Shell / section chrome | 8 themes | `docs/recipes/inbox-triage-shell-chrome-visual-recipe.md` | required-before-plan | section label/header/chrome restore; hidden scrollbar chrome |
| Scratch Pool | 8 themes | `docs/recipes/inbox-triage-scratch-pool-visual-recipe.md` | required-before-plan | tools/list/collapsed (pin/bar/block) realizations |
| Selected Scratch Context | 8 themes | `docs/recipes/inbox-triage-selected-context-visual-recipe.md` | required-before-plan | signature section 2~2.5×; `Scratch complete` state |
| Breakdown row / empty state | 8 themes | `docs/recipes/inbox-triage-breakdown-visual-recipe.md` | required-before-plan | row actions; two empty states; exact copy |
| Staging | 8 themes | `docs/recipes/inbox-triage-staging-visual-recipe.md` | required-before-plan | Node/Bit shape, remove target; NO card redesign (main BitCard) |
| Grid Explorer chrome | 8 themes | `docs/recipes/inbox-triage-grid-explorer-visual-recipe.md` | required-before-plan | title (`Library Index`/`Finder`/`GRID EXPLORER`…), full level labels, header/search chrome |
| Placement affordances + drop signals | 8 themes | `docs/recipes/inbox-triage-placement-visual-recipe.md` | required-before-plan | staged/direct affordance, invalid/unavailable + cursor warning |
| Newly Placed / Undo | 8 themes | `docs/recipes/inbox-triage-newly-placed-visual-recipe.md` | required-before-plan | static marker/outline/corner/shadow ONLY — reconcile OUT `animate-pulse` per DECISION |
| Archive / completion surface | 8 themes | `docs/recipes/inbox-triage-archive-visual-recipe.md` | required-before-plan | section blur overlay, complete/reopen |
| (navigation) | — | `docs/recipes/inbox-triage-visual-recipe-index.md` | required-before-plan | source-region ↔ surface ↔ theme ↔ owner/task map; not a recipe/token replacement |

**NOT a recipe target:** Grid full-hierarchy **search-result screen** — no direct 2-3 source. Do not fabricate an "extracted" recipe. Realize from existing Grid Explorer chrome + Node/Bit grammar; gate on a Phase-local user review (see Open Questions).

Rules honored: recipe paths precede EXECUTION_PLAN amendment; tasks reference recipe paths (not worktree); recipes ≠ DESIGN_TOKENS.md (tokens still amended at Step 3); `animate-pulse`/grip-handle/theme-magic-values reconciled OUT against DECISION.

---

## Decision Mapping

```
Visible section label/chrome restore (supersedes label removal)
  → SPEC.md § Inbox / Triage Workspace
  → DESIGN_TOKENS.md § Inbox / Triage Batch 2 Surface Contract / Removed Visible Labels  (OVERWRITE)
  → DESIGN_TOKENS.md § Surface Recipes / Batch 2 Inbox / Triage  (mark superseded → new surface recipes)

Selected Scratch Context = signature section (supersedes compact one-line)
  → SPEC.md § Inbox / Triage Workspace
  → DESIGN_TOKENS.md § Inbox / Triage Batch 2 Surface Contract / Breakdown

Scratch Pool search/sort/collapse (first-key authority) + Search Lifecycle
  → SPEC.md § Inbox / Triage Workspace
  → DESIGN_TOKENS.md § Inbox / Triage Batch 2 Surface Contract / Scratch Pool

Breakdown row lifecycle (active/staged/consumed; remove consumed, no line-through)
  → SPEC.md § Inbox / Triage Workspace
  → SCHEMA.md § Object Stores / scratchBreakdowns  (consumedAt semantics + version)
  → SCHEMA.md § Application Hooks (consumed/active predicate)

Staging Node/Bit structure + full-card drag
  → SPEC.md § Inbox / Triage Workspace
  → DESIGN_TOKENS.md § Compact Drag Token (Inbox/Triage)

Grid Explorer full-hierarchy search (replaces active-column; no searchAll reuse)
  → SPEC.md § Inbox / Triage Workspace
  → SPEC.md § Architecture Decisions  (NEW AD: dedicated Explorer search query/hook/result)
  → SPEC.md § File Organization Conventions + § Key File Paths  (new search module)
  → DESIGN_TOKENS.md § Inbox / Triage Batch 2 Surface Contract / Hierarchy Search

Staged/direct 2-step placement + commit reliability + over-limit title flow
  → SPEC.md § Inbox / Triage Workspace
  → SCHEMA.md § Key Queries / Application Hooks  (atomic create+consume+candidate-removal)
  → DESIGN_TOKENS.md § Inbox / Triage Batch 2 Surface Contract / DnD States

Newly placed (page-session transient) + source-aware Undo
  → SPEC.md § Inbox / Triage Workspace
  → SPEC.md § Architecture Decisions  (transient page/session state ownership)

Archive eligibility + Breakdown-scoped overlay (consumedAt guard, empty-every guard)
  → SPEC.md § Inbox / Triage Workspace
  → SCHEMA.md § Application Hooks / 10. Archive Cascade + 11. Archive Restore

Optimistic concurrency + durable staged candidate  [user-approved]
  → SCHEMA.md § Object Stores / scratchBreakdowns  (add version; new candidate store)
  → SCHEMA.md § Object Stores / (Scratch record)  (add version)
  → SCHEMA.md § Zod Validation Schemas
  → SPEC.md § Architecture Decisions  (NEW AD: optimistic-concurrency result contract)

Localization EN copy ownership boundary
  → SPEC.md § Inbox / Triage Workspace  (Inbox resource/copy boundary)
```

---

## Open Question Disposition

DECISION § Open Questions declares **zero active product-policy questions** in scope. The rows below are promotion-process dispositions (5-value taxonomy only).

| Question | Classification | Owning scope | Notes |
|---|---|---|---|
| Grid full-hierarchy search-result screen visual realization | **Phase-local** | Grid Explorer & Placement phase | No direct 2-3 source. Structure/interaction from DECISION; visual from existing Grid Explorer chrome + Node/Bit grammar. **Separate user review checkpoint required before implementation.** Not a recipe. |
| SCHEMA exact fields + migration shape (version, durable candidate, mutation boundaries) | **Phase-local** | Persistence/concurrency foundation phase | Re-verify against current datastore at Step 1; operation-log table NOT pre-decided |
| SCHEMA needed at all? (edit vs skip) | **Resolved** | — | Resolved: **edit** (user-confirmed, scope expanded) |
| Staging/placed Node/Bit card 8-theme visual | **Deferred** | post-promotion BitCard worktree | This round uses current main BitCard surface |
| Neumorphism ASC/DESC water-lens control visual | **Deferred** | post-promotion polish | No final source |
| KR resource / EN·KR toggle / KR typography | **Deferred** | post-core i18n | EN copy boundary is this round's only localization work |
| Text capacity / overflow display policy (lines, ellipsis, wrapping) | **Deferred** | `2026-07-14-cross-surface-text-capacity-and-overflow` | This round fixes data-validity limits (100/200/1000) only |

Every Phase-local row has an owning scope; exact phase numbers resolve at Step 4 (derived from amended canonical docs). No Blocking rows remain.

---

## Canonical Doc Edit Plan

```
Document              Action   Status    Notes
SCHEMA.md             edit     pending   ① optimistic concurrency: monotonic `version` on persisted Scratch
                                         record + scratchBreakdowns; Dexie compares id+base version+lifecycle
                                         in one RW txn; BaaS atomic-update/DB-function parity.
                                         ② durable staged candidate store (repository/domain, not Zustand):
                                         stable id, scratchId, sourceBreakdownRowId, node/bit type,
                                         lifecycle/version; uniqueness = 1 active candidate per source row.
                                         ③ atomic mutation boundaries (Stage/Unstage, Placement Confirm,
                                         source consume, candidate removal, source-aware Undo — no partial
                                         success); record operation-ID/idempotency locations.
                                         operation-log table NOT pre-decided; exact fields + migration
                                         confirmed at Step 1 vs current datastore.
SPEC.md               edit     pending   § Inbox/Triage Workspace: label/chrome restore, signature Context,
                                         consumed-row removal, staged/direct 2-step placement, dedicated
                                         full-hierarchy Explorer search (searchAll 재사용 금지), archive overlay,
                                         over-limit title flow, EN copy boundary. New AD: optimistic concurrency
                                         + dedicated search query. Paired: File Organization / Key File Paths.
DESIGN_TOKENS.md      edit     pending   § Inbox/Triage Batch 2 Surface Contract: OVERWRITE "Removed Visible
                                         Labels" → restore; amend Scratch Pool / Breakdown (compact→signature)
                                         / Hierarchy Search / DnD States; add semantic state tokens
                                         (selected/staged/invalid/pending/newly-placed/completed). Mark old
                                         Surface Recipes/Batch2 superseded. Amend AFTER Step 0.75 recipes.
EXECUTION_PLAN.md     edit     pending   scaled mode, next phase = 23. Derive phases from amended SPEC/SCHEMA
                                         (source phase/batch order = advisory only). Reclassify superseded
                                         Batch 2 Inbox/Triage assumptions (label removal / compact context).
                                         Reference recipe paths (not worktree). Encode Phase-local constraints:
                                         Grid search-result user review checkpoint; SCHEMA fields at Step 1.
PLANNING_STANDARD.md  edit     pending   New conformance items: optimistic-concurrency result contract;
                                         archive eligibility (consumedAt!==null + empty-every guard);
                                         placement atomicity / no partial success; dedicated Explorer search
                                         query (no searchAll reuse); newly-placed route-exit transient lifecycle.
```

No `skip` rows. All five canonical docs require amendment.

---

## Non-Promoted Items

| Item | Type | Reason |
|---|---|---|
| `themes2-3` prototype sidebar theme switcher / Scratch Pool fold lock / test mode | Prototype review UI | Dev/review-only control; product feature unaffected |
| Hover numbering / variant switchers in prototype routes | Exploration UI | Removed in final UI |
| 8 route별 반복 state/handler, mock `ideas`/`nodeCandidates`/`bitCandidates`/`placedItemsByScratch` mutation, legacy string normalization, `triagedScratches` local completion lock | Prototype-only impl | mock/spaghetti; production re-implements on main data model. Does NOT exclude the surfaces/flows themselves. |
| Prototype focus-immediate collapse; scratch-switch newly-placed reset; `animate-pulse` state signal; route-level magic color/spacing/shadow copy | Superseded prototype detail | DECISION overrides toward main behavior / static markers |
| `griddo2-claude-themes2-3` Korean duplicate routes | Exploratory source | i18n **requirement** retained as follow-up; the route duplication approach is excluded |
| `2026-05-28-inbox-triage-theme-variants` label-removal + compact-context decisions | Prior draft decision | Superseded by this DECISION; canonical docs carrying them are overwritten (not excluded) |
| main `BitCard` 8-theme redesign; Neumorphism water-lens; KR visual completion; text-capacity policy | Deferred design work | Out of scope this round (see Promotion Scope). Underlying decisions remain intact. |

> Scope note: excluding a prototype artifact does not exclude the underlying product surface, flow, or existing decision. The foundational `2026-04-28-inbox-triage-workspace` decision remains intact and authoritative.

---

## Approval Gate

**STOP — no canonical doc will be edited until this map is approved.** Parallel Codex draft is at `PROMOTION_MAP.md`; reconcile/select before Step 0.75. On approval, the chosen map should be saved as `PROMOTION_MAP.md` (canonical location) and Step 0.75 (visual recipe extraction) begins.
