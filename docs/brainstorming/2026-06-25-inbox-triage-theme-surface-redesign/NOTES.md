# Inbox/Triage 2-3 시안의 Main 승격 Notes

## Metadata

- Created: 2026-07-13
- Updated: 2026-07-14
- Related decision: `DECISION.md`
- Functional baseline: `griddo2-claude` commit `48af728e872217a340c0d02ac5bec58e3ea09c36`
- Design source: `griddo2-claude-themes2-3` commit `4f39709688ceb4cac5e15d4e3502186b1f1c801b`
- Status: audit and interview record — complete

## Purpose

이 문서는 `DECISION.md`를 만들기 위해 사용한 감사 근거와 회복 기록이다.

2-3 시안은 빠른 UX/UI 탐색용으로 작성되었으므로 code quality, duplication,
component architecture, mock mutation의 완성도는 평가하지 않았다. 대신 다음을 직접
확인했다.

- 사용자가 실제로 보는 8개 테마의 최종 화면
- 화면에서 접근 가능한 state와 interaction sequence
- 문서에 없지만 최종 시안에 독자적으로 반영된 정책
- 문서에는 있으나 최종 시안 또는 최신 사용자 결정과 달라진 내용
- main의 현재 production behavior와 승격 후 바뀌어야 할 부분

`DECISION.md`에는 확정 방향만 기록한다. 아래의 audit, 충돌, 보류, discard는 canonical
문서로 직접 승격하지 않는다.

## Source Classification

| Source | Type | Use | Provenance |
|---|---|---|---|
| `2026-04-28-inbox-triage-workspace/DECISION.md` | Product Decision | 4영역 layout, data lifecycle, placement/archive 기반 | `griddo2-claude` repository |
| `2026-05-28-inbox-triage-theme-variants/DECISION.md` | Prior Product/Design Decision | superseded conflict 추적 | `Readiness: draft` |
| `PROTOTYPE_FUNCTION_GAP_2_4.md` | Exploratory/Translation Source | 2-4에서 누적한 UX 변경 후보 | topic folder, tracked at functional baseline |
| `PROTOTYPE_TO_MAIN_HANDOFF.md` | Exploratory Handoff | main 재구현 관점과 누적 ledger | main working tree의 untracked draft |
| `griddo2-claude` | Functional Source | 현재 production behavior와 architecture | commit `48af728` |
| `griddo2-claude-themes2-3` | Mixed Design Source | adopted structure, interaction, 8-theme visual realization | clean commit `4f39709` |

## Audit Method

### Code Audit

main에서는 다음 production source와 tests를 읽었다.

- `src/components/triage/triage-workspace.tsx`
- `src/components/triage/scratch-pool.tsx`
- `src/components/triage/breakdown-panel.tsx`
- `src/components/triage/staging-zone.tsx`
- `src/components/triage/hierarchy-explorer.tsx`
- `src/components/triage/*test.tsx`
- `src/hooks/use-dnd.ts`
- `src/hooks/use-can-archive-scratch.ts`
- `src/stores/triage-store.ts`
- `src/components/grid/node-card.tsx`
- `src/components/grid/bit-card.tsx`

2-3에서는 아래 8개 route의 최종 source를 모두 확인했다.

- `src/app/prototype/inbox-triage-griddo/page.tsx`
- `src/app/prototype/inbox-triage-tiny-desk/page.tsx`
- `src/app/prototype/inbox-triage-neumorphism/page.tsx`
- `src/app/prototype/inbox-triage-claymorphism/page.tsx`
- `src/app/prototype/inbox-triage-origami/page.tsx`
- `src/app/prototype/inbox-triage-terminal/page.tsx`
- `src/app/prototype/inbox-triage-retro-mac/page.tsx`
- `src/app/prototype/inbox-triage-graphite/page.tsx`

### Visual Audit

- 2-3 production build를 별도 local server에서 실행했다.
- 8개 route를 `1600x1000` viewport로 각각 렌더링해 section chrome, Selected Scratch
  Context, row actions, Staging shape, 4-column Grid, theme identity를 확인했다.
- 이 확인용 screenshot은 `/private/tmp`의 일시 파일이며 canonical visual source가 아니다.
- amendment mode Step 0.75에서는 확정 commit으로 durable screenshot과 exact visual
  recipe를 다시 추출해야 한다.

## Authority Reconciliation

### 유지할 기존 결정

- 4영역 workspace와 layout ratio
- Scratch별 Breakdown/Staging scope
- staged 상태에서는 `consumedAt`을 설정하지 않음
- placement Confirm 후 실제 Node/Bit 생성과 `consumedAt` 설정
- grip-only Breakdown drag
- 수동 archive와 Archive View restore lifecycle
- first printable Breakdown keystroke 기반 Scratch Pool auto-collapse

### 이번 결정이 대체하는 기존 결정

| Prior direction | New direction |
|---|---|
| visible section label 제거 | theme-specific section label/header/chrome 복원 |
| compact one-line Selected Scratch context | 일반 row보다 약 2~2.5배 높은 signature section |
| consumed row를 line-through로 잔류 | consumed/placed row를 active list에서 제거 |
| global placement Dialog에 direct type choice와 confirm 결합 | direct choice/path affordance와 placement affordance를 분리 |
| generic Archive bar + global AlertDialog | Breakdown-scoped blur overlay, Cancel 후 complete/reopen state |
| placed 결과에 transient recovery 없음 | 실제 card에 page-session newly placed + source-aware Undo |

### Canonical Amendment 필요 지점

- `SPEC.md` Inbox/Triage의 visible label, compact context, consumed row, placement, archive
- `DESIGN_TOKENS.md` Inbox/Triage의 label 제거와 compact context visual contract
- `docs/recipes/inbox-triage-batch2-visual-recipe.md`의 rejected visible labels 및 compact strip
- `EXECUTION_PLAN.md`의 이미 완료된 Batch 2 전제를 현재 promotion scope에 맞게 재구성
- `SCHEMA.md`는 현 시점에서 필수 변경이 확인되지 않았다. Undo transaction 구현에
  durable provenance가 필요하지 않다는 정책을 promotion map에서 다시 검증한다.

## Current Main Versus Final 2-3 Audit

| Area | Current main | Actual final 2-3 | Main promotion target |
|---|---|---|---|
| Workspace labels | anonymous spacer를 사용하고 visible section heading 없음 | 8개 모두 theme-specific section chrome/label 표시 | visible chrome 복원, preview heading은 제외 |
| Scrollbars | 일반 overflow container로 visible chrome 가능 | list/column별 scrollbar chrome 숨김 | 기능 유지 + chrome 숨김 |
| Scratch tools | identity/count/collapse row와 search/sort row가 시각적으로 분리 | theme chrome 안에서 cohesive tools area로 표현 | 상단 tools + 하단 list 구조 |
| Scratch list metadata | title + relative `createdAt` | title + `createdAt` | 유지. Breakdown row time 제거와 구분 |
| Collapsed Pool | vertical pills와 count는 구현됨 | 테마별 pin/bar/block, 모든 control 세로 정렬 | main interaction 유지 + theme realization 반영 |
| Auto-collapse | first printable key, manual reopen 예외 | 다수 route가 Breakdown focus만으로 collapse | main behavior 유지, prototype focus handler 미승격 |
| Selected Context | 작은 one-line strip, title/time만 표시 | 8개 모두 큰 signature surface, title/time/Edit/row sort | 2-3 정보 위계와 visual role 승격 |
| Breakdown rows | createdAt 표시, Trash만, consumed line-through | numbering/time 없음, Edit/Trash 상시, placed filter-out | 2-3 lifecycle로 변경 |
| Scratch/row Edit | 실제 Edit interaction 없음 | theme-specific button은 있으나 handler 없는 visual affordance | title/content-only inline edit, blur save, save-before-next-action |
| Source/result text limit | Breakdown content 1,000자, Node title 100자, Bit title 200자이나 placement가 source를 그대로 title로 사용 | mock string/object라 schema limit을 검증하지 않음 | staged over-limit source는 Result title modal 사용. Direct는 100/200자 기준으로 Node/Bit option을 제한하고 title editor를 사용하지 않음 |
| Breakdown add | Enter input 중심 | explicit add/submit control 존재 | explicit control + Enter rapid entry |
| Breakdown empty | generic/limited empty state | theme-specific prompt와 completion state | 두 empty state 구분 |
| Archive | bottom Archive bar + global AlertDialog | section blur overlay, Cancel/reopen, complete context | 2-3 flow를 production lifecycle에 연결 |
| Staging structure | Node grid + Bit list, generic empty placeholders | Node/Bit shape 유지, theme chrome과 remove target | shape 유지, empty placeholder 제거 |
| Grid title | visible title 없음 | Grid Explorer 계열 theme-specific title | visible title 복원 |
| Grid level labels | `Home/L1/L2/L3` + repeated selected title | `Home/Level 1/Level 2/Level 3`, selected card/path로 표현 | full labels, repeated title 제거 |
| Grid search | active column scope, query/scope/result count, `Clear` text | active column scope, inactive dimming, input 내부 X | 두 source의 scope를 대체. 전체 visible hierarchy 전용 search UI, title+breadcrumb token match, DnD interruption recovery |
| Drop signals | generic valid/invalid/pending classes | 8개 theme-specific unavailable + cursor-entry warning | semantic state 공유 + theme realization |
| Staged placement | global Dialog confirmation | target column 내부 placement affordance | column-scoped affordance, mutation은 production hook |
| Direct placement | 한 global Dialog에서 type choice와 confirm 결합 | modal-like type/path choice 후 별도 placement affordance | 2단계 flow로 분리 |
| Placement result | DB의 실제 Node/Bit가 일반 Grid data로 나타남 | mock PlacedItem을 기존 card loop에 merge | 실제 record + 기존 card, indicator card 금지 |
| Newly placed | 없음 | 기존 card treatment + Undo, local transient state | page route exit까지 유지, Scratch/column 전환 유지 |
| Undo | 없음 | source에 따라 mock idea/candidate 복구 | 실제 create/consume operation을 source-aware rollback |
| Localization | 별도 Inbox EN/KR flow 없음 | 최종 2-3에도 KR route/toggle 없음 | 후속 i18n/resource 작업 |
| Sidebar review UI | production navigation | theme switcher와 Pool fold lock | prototype-only, 승격 금지 |

## Actual 2-3 Findings Not Reliably Captured By Prior Docs

### Placed Item Model

기존 `PROTOTYPE_TO_MAIN_HANDOFF.md`의 다음 설명은 최종 2-3 기준으로 낡았다.

- `placedItemsByScratch`가 현재도 `Node: ...`, `Bit: ...` 문자열 배열이라는 설명
- Confirm 결과가 문자열 parsing에만 의존한다는 설명
- Undo가 placed 배열에서 item만 제거한다는 설명

최종 2-3의 8개 route에는 공통적으로 다음 object 형태가 존재한다.

```ts
interface PlacedItem {
  id: string;
  title: string;
  type: "node" | "bit";
  source: "staging" | "direct-row";
  originalId: string;
  color?: string;
  newlyPlaced: boolean;
}
```

legacy string을 읽는 normalization helper가 남아 있지만 현재 placement 흐름은 object를
생성한다. Undo도 `source`를 보고 Staging candidate 또는 Breakdown idea를 복구한다.
이 구조는 시안에서 정책이 실제로 시각화되었음을 증명하지만, production type 또는
mutation code의 복사 근거는 아니다.

### Newly Placed Lifecycle Mismatch

최종 2-3 code는 Scratch를 바꿀 때 직전 Scratch의 `newlyPlaced`를 `false`로 만든다.
이 동작은 최신 정책과 다르다.

- 확정 production 정책: Scratch 전환과 Grid column 전환으로 지우지 않음
- 종료 시점: Inbox/Triage route를 떠날 때
- 저장 범위: DB가 아닌 page/session transient state

따라서 visual treatment는 2-3을 참고하지만 lifecycle handler는 복사하지 않는다.

### Collapse Trigger Mismatch

최종 2-3의 다수 route는 Breakdown focus 시 Pool을 접는다. current main은 이미 첫
printable key와 manual reopen 예외를 구현했다. main 동작이 최신 production target이며
prototype focus handler는 승격하지 않는다.

### Motion Mismatch

일부 최종 2-3 card와 completion marker에는 `animate-pulse` 또는 유사 반복 효과가 남아
있다. 최종 policy는 newly placed와 drop warning에 blinking/flicker를 사용하지 않는
것이다. static marker, outline, background, corner, shadow 또는 one-shot transition만
visual recipe 후보로 삼는다.

### Archive State Shortcut

일부 route는 local `triagedScratches` map으로 완료 상태를 한 번 고정한다. production은
항상 persisted Breakdown 소비 상태와 selected Scratch의 staged candidate 유무에서
archive eligibility를 계산해야 한다. local completion lock은 승격하지 않는다.

Archive의 최소 증거는 `has ever had row`가 아니라 persisted `consumedAt !== null` row가 한 개 이상
존재하는 것이다. JavaScript의 빈 배열 `every()`가 참이 되는 특성 때문에 모든 row를 Trash로 삭제한
Scratch가 completion으로 오인되지 않도록 query/hook과 tests에서 별도로 검증해야 한다. consumed
row가 하나 이상 있고 나머지 active row만 의도적으로 삭제한 경우는 completion을 허용한다.

### Edit Conflict Baseline Gap

current main의 Node와 Bit에는 `mtime`이 있지만 `ScratchBreakdown`에는 변경 revision이 없다.
`updateScratchBreakdown()`은 현재 row를 읽은 뒤 새 값을 `put()`하며, 편집 시작 시점 이후 외부 변경을
조건으로 거부하는 compare-and-set contract는 없다. 또한 timestamp `mtime`은 UI 정렬/변경 시간에는
유용하지만, 동시 저장 token으로는 단조 증가 정수 `version`보다 모호하다.

production promotion에서는 Scratch title과 Breakdown row repository mutation이 동일한 optimistic
concurrency result contract를 반환하도록 정리해야 한다. Dexie 구현은 read/compare/write를 하나의
read-write transaction으로 묶고, 향후 BaaS 구현은 `id`와 `version`을 조건으로 한 atomic update 또는
PostgreSQL function으로 같은 의미를 보존한다. editor의 base snapshot은 client memory에만 두며,
별도 persistent draft record로 오해하지 않는다.

### Grid Search Policy Supersession

current main과 최종 2-3은 모두 현재 active/deepest column만 title로 검색한다. 이 동작은
2026-07-13 interview에서 확정한 production 정책에 의해 대체되었다.

- search를 열면 4개 column 대신 Grid Explorer 전용 result UI를 표시한다.
- 모든 visible Home root와 descendant의 active Node/Bit를 title과 full breadcrumb token으로
  검색한다.
- result selection은 ancestor ID chain을 복원하여 Inbox/Triage 안에서 target을 reveal한다.
- DnD가 search를 강제로 중단한 경우에만 query를 임시 보존하고 자동 복귀하지 않는다.
- Newly Placed item은 즉시 검색되며 result에서 source-aware Undo를 실행할 수 있다.

main의 `searchAll()`도 그대로 재사용하지 않는다. 이 query는 Node/Bit/Chunk title search와
일반 Grid route navigation을 위한 shape이며 full ancestor ID chain, Explorer 제외 규칙,
breadcrumb token matching과 hierarchy ordering을 제공하지 않는다. production에서는 Grid
Explorer 전용 query, hook과 result panel을 설계한다.

### Breakdown Content And Placement Title Mismatch

main schema는 Breakdown content를 최대 `1,000`자로 허용하지만 Node title은 `100`자, Bit
title은 `200`자로 제한한다. 현재 `useTriageDnd`의 Confirm mutation은
`placement.candidateLabel`을 result title로 그대로 전달하므로 긴 row는 capture와 edit에는
성공하고 실제 placement에서 실패할 수 있다. 2-3은 mock state라 이 production constraint를
드러내지 않는다.

Staged candidate는 선택한 type limit을 넘을 때 별도의 Result title 수정·확인 modal을 거치고,
유효한 title 확정 후 기존 Placement Affordance로 진행한다. source Breakdown content와 Undo
recovery content는 원문을 유지한다.

Direct Breakdown placement는 2-3 시안의 단순한 Node/Bit·path 선택 구조를 보존하기 위해 title
editor를 사용하지 않는 것으로 2026-07-14에 수정되었다. `1~100`자는 Node/Bit, `101~200`자는
Bit만 허용하고, `201~1,000`자는 두 type을 unavailable 처리하여 Row 수정/분해 후 다시 Drag하게
한다. silent truncation 또는 schema-invalid write는 허용하지 않는다.

이 결정은 데이터 유효성만 해결한다. 각 surface가 실제로 몇 글자와 몇 줄을 표시할지,
ellipsis와 wrapping 또는 expansion을 어디서 사용할지는 별도
`2026-07-14-cross-surface-text-capacity-and-overflow` brainstorming으로 이동했다.

## Section Evidence

### Common

- 모든 최종 route에서 preview heading은 제거되었고 theme 내부 section chrome은 남았다.
- 모든 최종 route에서 Scratch Pool, Breakdown, Staging, 4-column explorer 구조가
  시각적으로 확인되었다.
- theme-specific title은 일반적으로 `Grid Explorer`, Tiny Desk는 `Library Index`,
  Retro Mac은 `Finder`, Terminal은 `GRID EXPLORER`다.

### Scratch Pool

- 8개 route 모두 `scratchSearch`와 `scratchSortAsc` state를 가진다.
- expanded list에는 title과 date/time metadata가 보인다.
- collapsed switcher는 테마별 marker를 사용하며 count와 collapse control을 유지한다.
- prototype sidebar의 fold lock은 review convenience이며 product interaction이 아니다.

### Breakdown

- 8개 route 모두 `breakdownSortOrder`를 Selected Scratch Context에서 조작한다.
- Context는 title, `createdAt`, Edit, ASC/DESC를 함께 보여준다.
- row는 visible numbering과 date/time을 제거했다.
- row Edit/Trash는 항상 보이며, staged row의 action은 disabled된다.
- `visibleIdeas`가 placed item을 제거하므로 placed row가 active list에서 사라진다.
- `isTriaged`는 기존 row가 있었고, visible row가 없고, staged candidate가 없을 때만
  true가 된다.

### Staging

- Node와 Bit가 별도 subsection과 다른 shape로 유지된다.
- Node/Bit candidate drag는 type을 구분하고 Grid constraint signal에 사용된다.
- remove/unstage와 Breakdown drop-back은 source row 복구를 표현한다.

### Grid Explorer

- 8개 route 모두 full level label을 사용한다.
- hierarchy search는 active/deepest open column에 scope되고 나머지 column을 dim한다. 이는
  시안 관찰 기록이며 확정 production search scope가 아니다.
- Home Node-only, Level 3 Bit-only restriction을 계산한다.
- drag 시작 signal과 invalid column cursor-entry warning을 서로 다른 강도로 표현한다.
- direct row affordance와 pending placement affordance가 별도 state다.
- placement affordance가 들어가는 list에 `data-placement-scroll`과 bottom padding이 있어
  Confirm/Cancel까지 scroll할 수 있도록 탐색되었다.
- placed Node/Bit는 기존 card loop에 merge되며 card 우측 Undo를 제공한다.

### Completion And Archive

- 8개 route 모두 `showArchiveAffordance`와 section-scoped overlay를 가진다.
- overlay가 열렸을 때 reopen control은 숨기고 Cancel 이후에만 보이도록 정리되었다.
- Cancel 이후 Context가 theme-specific completed state로 바뀐다.
- OK는 mock Scratch list에서 item을 제거하지만 production에서는 `archivedAt` mutation을
  사용해야 한다.

## Eight-Theme Visual Evidence

아래는 최종 route에서 확인한 visual role이다. exact CSS 값이 아니라 visual recipe
추출을 위한 selection record다.

| Theme | Signature context | Staged/row language | Grid/placement language | Status |
|---|---|---|---|---|
| Griddo | polished dashboard/ticket 계열의 큰 active-work surface | 정돈된 product row와 muted staged state | blue technical signal, compact actual card treatment | Adopt visual realization |
| Tiny Desk | paper memo/desk object 계열 | warm paper, wood, stationery action | `Library Index`, analog marker와 paper control | Adopt visual realization |
| Neumorphism | inset/raised soft plate | pressed staged row, raised controls | shadow-only depth와 soft placement well | Adopt visual realization |
| Claymorphism | large puffy blue clay surface | rounded tactile object | soft 3D invalid/placement control | Adopt visual realization |
| Origami | sharp folded paper/faceted surface | flat paper and crease language | fold geometry와 paper alert | Adopt visual realization |
| Terminal | editor/buffer 형태의 code context | CLI row와 command action | single-line `GRID EXPLORER`, text-frame affordance | Adopt visual realization |
| Retro Mac | classic dialog/folder context | 1-bit window/control language | `Finder`, System window affordance | Adopt visual realization |
| Graphite | editorial/technical metadata plate | thin drafting line과 grayscale row | precise `Grid Explorer`, drafting marker | Adopt visual realization |

한 theme의 exact style을 다른 theme에 공통 적용하지 않는다. shared semantic state와
8개의 realization source로 취급한다.

## Prototype Variant Area Selection

이 표는 writing-documents amendment mode의 Step 0 source intake에 전달할 mixed-source
selection record다. Structure/Interaction row는 모두 `DECISION.md`에 반영된 상태다.

| Surface/Area | Source | Type | Canonical target | Selection | Resolution |
|---|---|---|---|---|---|
| 4-area workspace ratio | foundational decision + main | Structure decision | `SPEC.md` | Adopt | `DECISION.md` Common Surface Contract에 반영 |
| Visible section chrome | all 8 prototype routes | Structure + visual recipe | `SPEC.md`, `DESIGN_TOKENS.md`, recipe | Adopt | 구조는 DECISION 반영, exact theme recipe 추출 필요 |
| Scratch expanded/collapsed structure | all 8 routes + main first-key behavior | Structure + interaction | `SPEC.md`, recipe | Adopt merged authority | DECISION Scratch Pool에 반영 |
| Scratch tools visual realization | all 8 routes | Visual recipe | theme recipes | Adopt | Step 0.75 필요 |
| Selected Scratch Context | all 8 routes | Structure + visual recipe | `SPEC.md`, `DESIGN_TOKENS.md`, recipes | Adopt | 구조는 DECISION 반영, exact recipes 필요 |
| Breakdown row actions/lifecycle | all 8 routes + main persistence | Interaction decision | `SPEC.md`, execution tasks | Adopt | DECISION Breakdown에 반영 |
| Scratch/row inline edit | user interview + main datastore capability | Interaction decision | `SPEC.md`, execution tasks | Adopt | title/content-only, blur save, save-before-next-action |
| Over-limit placement title | main schema/DnD audit + user interview | Data validation + interaction | `SPEC.md`, execution tasks | Adopt with split flow | staged candidate는 conditional Result title modal. Direct는 길이에 따라 Node/Bit option을 제한하고 title editor를 사용하지 않음 |
| Breakdown staged visual state | all 8 routes | Visual recipe | theme recipes | Adopt | Step 0.75 필요 |
| Breakdown empty/completion prompt | all 8 routes | Visual recipe + content direction | theme recipes/task copy | Adopt | exact copy와 recipe 추출 필요 |
| Staging Node/Bit structure | foundational decision + all 8 routes | Structure decision | `SPEC.md` | Adopt | DECISION Staging에 반영 |
| Staging final card redesign | future main BitCard worktree | Unresolved visual realization | deferred recipe/task | Defer | post-promotion follow-up |
| Grid header/search/level labels | all 8 routes + main search behavior + 2026-07-13 interview | Structure + interaction | `SPEC.md`, execution tasks, recipe | Adopt with replaced scope | full level label과 theme chrome은 시안에서 채택, active-column search는 전체 hierarchy search로 대체 |
| Invalid/unavailable drop signal | all 8 routes | Interaction + visual recipe | `SPEC.md`, theme recipes | Adopt | interaction DECISION 반영, recipes 필요 |
| Staged placement affordance | all 8 routes | Interaction + visual recipe | `SPEC.md`, recipes | Adopt | DECISION 반영, recipes 필요 |
| Direct row type/path affordance | all 8 routes | Interaction + visual recipe | `SPEC.md`, recipes | Adopt | DECISION 반영, recipes 필요 |
| Actual card placement result | all 8 routes + main mutation | Interaction decision | `SPEC.md`, execution tasks | Adopt | DECISION 반영 |
| Newly placed card treatment | all 8 routes | Interaction + visual recipe | `SPEC.md`, recipes | Adopt with corrected lifecycle | DECISION 반영, recipes 필요 |
| Source-aware Undo | all 8 routes | Interaction decision | `SPEC.md`, execution tasks | Adopt | DECISION 반영 |
| Archive overlay/completed context | all 8 routes | Interaction + visual recipe | `SPEC.md`, recipes | Adopt | DECISION 반영, recipes 필요 |
| Theme switcher/fold lock/test controls | prototype sidebar | Prototype review UI | none | Discard | main 승격 금지 |
| Hover numbering/variant switchers | prototype exploration history | Prototype review UI | none | Discard | 최종 UI에서 제거됨 |
| Korean duplicate routes | removed exploration | Exploratory source | none | Discard implementation | i18n requirement만 후속 결정으로 유지 |
| Neumorphism water-lens sort | user direction, no final source | Unresolved visual realization | deferred recipe/task | Defer | post-promotion follow-up |

## Production Touchpoints

| Responsibility | Current main owner | Promotion concern |
|---|---|---|
| 4-area composition and placement dialog shell | `triage-workspace.tsx` | labels 복원, global dialog 분리/이동 |
| Scratch tools/list/collapse | `scratch-pool.tsx`, `triage-store.ts` | cohesive layout, theme realization, existing first-key contract 유지 |
| Context, rows, input, archive | `breakdown-panel.tsx` | context role 확대, sort/edit, consumed filtering, section overlay |
| Staged candidates | `staging-zone.tsx`, `triage-store.ts` | labels, empty cleanup, semantic states, drop-back |
| Grid columns/search/items | `hierarchy-explorer.tsx`, new Explorer search query/hook/panel | full labels, dedicated full-hierarchy result mode, path restore, DnD query recovery, in-column affordances |
| DnD state and writes | `use-dnd.ts` | direct choice와 confirm 분리, rollback metadata, invalid constraints |
| Archive eligibility | `use-can-archive-scratch.ts` | has-ever-had-row + all consumed + no staged 조건 명시 |
| Node/Bit persistent writes | existing grid hooks/data store | atomic create/consume/Undo compensation |
| Newly placed transient state | new page/session owner or extended triage store | route exit reset, Scratch/column 전환 보존 |
| Theme realization | shared semantic components + theme tokens/recipes | duplicated route 금지 |

## Now And Later Ledger

### 지금 하는 작업

1. 이 `DECISION.md`를 interview로 보완하고 `Readiness: code-ready`로 승격한다.
2. writing-documents amendment mode Step 0에서 source classification과 이 문서의
   Prototype Variant Area Selection을 검증한다.
3. `PROMOTION_MAP.md`를 작성해 canonical target과 non-promoted item을 확정한다.
4. 8개 테마의 adopted visual area를 durable screenshot과 exact recipe로 추출한다.
5. `SPEC.md`, `DESIGN_TOKENS.md`, 필요한 recipe와 `EXECUTION_PLAN.md`를 amendment한다.
6. 승인된 execution plan으로 main에 production-quality Inbox/Triage를 구현한다.

### 나중 하는 작업

1. core promotion 직후 shared locale/resource, EN/KR toggle, locale-aware copy와 accessibility
   foundation을 구현한다.
2. 승격이 끝난 최신 main 기반 worktree에서 공용 `BitCard`의 8-theme visual variation을
   먼저 탐색하고 구현한다.
3. 갱신된 공용 Node/Bit card를 기준으로 Staging Node/Bit와 placed/newly placed
   treatment를 다시 탐색하고 main에 반영한다.
4. 8개 테마의 한국어 typography, text fit과 screenshot QA를 최종 visual 구조에서 마감한다.
5. Neumorphism ASC/DESC water-lens treatment를 별도 visual polish로 탐색한다.

## Prototype-Only Items Not To Carry

- 8개 page route에 반복된 state와 handler
- mock `ideas`, `nodeCandidates`, `bitCandidates`, `placedItemsByScratch` mutation
- legacy string normalization을 production model로 사용하는 방식
- `triagedScratches` local completion lock
- Scratch focus 즉시 collapse
- Scratch 전환 시 newly placed 초기화
- theme switcher, Scratch Pool fold lock, test mode, hover variant numbering
- dead variant state와 실험용 conditional markup
- blinking/pulse를 상태의 필수 신호로 사용하는 방식
- route별 magic color, spacing, shadow를 그대로 복사하는 방식

## Interview Queue

질문은 한 번에 하나씩 진행하고, 답변이 확정되면 `DECISION.md`에 반영한다.

1. [settled 2026-07-14] 한국어/i18n 후속 batch 순서
2. [settled 2026-07-14] Undo 중 created item이 다른 mutation을 받은 경우의 제한/실패 처리
3. [settled 2026-07-14] 8개 테마 visual recipe의 surface-first hybrid 구조
4. [settled 2026-07-14] Placement Affordance가 열린 뒤 source/target이 변경되면 Confirm 직전에
   재검증하고, 실패 시 무기록·무자동이동으로 중단
5. [settled 2026-07-14] Placement Confirm을 idempotent 원자적 operation으로 처리하고 pending 잠금,
   실패 rollback/수동 Retry, timeout 결과 재조회를 적용
6. [settled 2026-07-14] Archive OK는 overlay를 유지하는 idempotent mutation으로 처리하고 성공 확인
   후에만 Scratch 제거, 실패 시 수동 Retry/Cancel, timeout 시 결과 재조회를 적용
7. [settled 2026-07-14] Archive overlay/completion 중 eligibility가 상실되면 즉시 일반 작업 상태로
   복귀하고 OK transaction에서도 eligibility를 재검증
8. [settled 2026-07-14] Archive 성공 후 현재 visible Pool order에서 next/previous Scratch를 선택하고,
   filtered no-results와 실제 empty Pool의 selection/focus를 구분
9. [settled 2026-07-14] Archive overlay를 non-modal section dialog로 처리하고 자동 open 시 focus 유지,
   명시적 reopen/Cancel focus 이동과 overlay 내부 Escape만 적용
10. [settled 2026-07-14] Archive 저장 전 Scratch 전환을 결정 연기로 처리하고 복귀 시 complete Context와
    reopen control을 복원하되 overlay는 자동 재개하지 않음
11. [settled 2026-07-14] route 재진입/reload 시 archive-ready Scratch는 complete Context와 reopen
    control로 복원하고 overlay presentation은 저장하지 않으며 pending operation만 reconcile
12. [settled 2026-07-14] Confirm 전 Placement flow에서는 앱 내부 문맥 변경을 차단하고 명시적
    Confirm/Cancel을 요구하되 dirty Result Title draft가 있을 때만 native unload guard 적용
13. [settled 2026-07-14] Placement 단계 진입/전환 시 focus를 affordance 안에 containment하고
    Cancel은 source handle, 성공은 실제 Newly Placed card로 복귀
14. [settled 2026-07-14, clarified] 이번 promotion의 Placement 진입은 Mouse/Touch pointer DnD로
    제한하고 visible `Grid에 배치` action, keyboard DnD와 target picker는 추가하지 않음
15. [settled 2026-07-14] Scratch Pool header/collapsed count는 전체 active 수로 고정하고 filtered
    result count는 search 영역에 별도로 표시
16. [settled 2026-07-14] Breakdown ASC/DESC는 `createdAt`, 동일 시각에는 `order`, `id`를 사용하고
    기본 DESC/newest-first로 표시
17. [settled 2026-07-14] Scratch Pool/Breakdown sort는 서로 독립된 device-local preference로
    모든 Scratch에 공통 적용하고 reload 후에도 유지
18. [settled 2026-07-14] Breakdown add 성공 후 input focus를 유지하고 새 row로 내부 scroll하며,
    일회성 theme-specific signal과 polite live announcement를 제공
19. [settled 2026-07-14] Breakdown add는 single idempotent operation으로 직렬화하고 성공 전 input을
    유지하며 실패 Retry와 timeout 결과 재조회를 적용
20. [settled 2026-07-14] Breakdown Add input은 blur 시 submit/discard하지 않고 draft를 유지하며
    Enter 또는 explicit Add만 row 생성을 시작
21. [settled 2026-07-14] unsaved Breakdown Add draft는 같은 Scratch 안에서 유지하고 Scratch/route
    전환에는 discard confirmation, reload에는 native guard를 적용하며 durable 복원은 하지 않음
22. [settled 2026-07-14] 하나의 Breakdown row는 `sourceBreakdownId` 기준으로 하나의 staged
    candidate만 가질 수 있고, 유형 변경은 unstage 후 restage하며 remove 시 staging 자격을 복구
23. [settled 2026-07-14] staged candidate를 Dexie와 향후 BaaS에 저장되는 Scratch-scoped domain
    data로 승격하여 route/reload/다른 기기에서도 유지하고, source row의 staged 상태는 candidate에서 파생
24. [settled 2026-07-14] visible unstage control과 Breakdown section 전체로의 candidate drop-back은
    같은 unstage command를 사용
25. [settled 2026-07-14] unstage는 성공 확인 전 candidate/source 상태를 유지하고 실패 시 별도 Retry
    button 없이 알림만 제공하며, 사용자가 기존 control 또는 DnD를 다시 실행해 재시도
26. [settled 2026-07-14] unstage 실패는 현재 Staging header 아래 section-local alert로 표시하고,
    성공 알림은 만들지 않으며 향후 workspace-context error toast로 이전
27. [settled 2026-07-14] 임시 unstage 실패 알림은 자동 종료하지 않고 재시도, candidate 제거,
    Scratch 전환 또는 `X`로 닫으며 `X`는 알림만 제거
28. [settled 2026-07-14] Staging 등록 중에는 기존 staged Node/Bit card 구조를 재사용한 non-draggable
    pending candidate를 theme-specific 상태 처리로 표시하고, 성공 후 정상화하며 실패 시 원복과 알림 제공
29. [settled 2026-07-14] remote candidate 변경 중 pointer drag는 release까지 visual snapshot만 유지하고
    drop mutation을 취소하며, 열린 Placement Affordance는 즉시 닫고 authoritative state를 반영
30. [settled 2026-07-14] Staging Node/Bit는 각각 `createdAt` DESC와 stable `id`로 newest-first 표시하고
    수동 재정렬은 제공하지 않음
31. [settled 2026-07-14] Staging candidate 수에는 한도를 두지 않고 Node/Bit subsection별 독립 내부
    scroll을 사용하며 scrollbar chrome만 숨기고 기존 section 비율을 유지
32. [settled 2026-07-14] local staging은 해당 subsection을 맨 위로 이동하고, remote 신규 candidate는
    scroll을 유지한 채 `새 항목 N개` indicator로 알리며 확인 시 count 제거
33. [settled 2026-07-14] `Nodes`/`Bits` label은 candidate가 2개 이상일 때만 `2 Nodes`, `3 Bits`처럼
    count를 앞에 표시하고 0개 또는 1개이면 숫자를 생략
34. [settled 2026-07-14] drag 중 나타나는 기존 dedicated unstage drop zone과 Breakdown section
    drop-back을 함께 유지하고 permanent unstage button은 추가하지 않음
35. [settled 2026-07-14] staged card primary click은 동작 없이 전체 card를 drag surface로 사용하고,
    2-3의 내부 handle은 폐기하며 main의 pointer-centered type-specific drag pill을 보존
36. [settled 2026-07-14] 전체 card drag에서도 main의 Mouse 8px, Touch 250ms delay/5px tolerance를 유지
37. [settled 2026-07-14] staged drag 시작 시 Breakdown에 은은한 theme-specific target signal을,
    실제 진입 시 직접적인 drop-back 문구를 추가하되 content와 layout은 유지
38. [settled 2026-07-14] durable candidate는 title snapshot을 저장하지 않고 `sourceBreakdownId`로
    authoritative row content를 표시하며 staged row mutation은 repository/BaaS에서도 차단
39. [settled 2026-07-14] stale/offline client의 staged source Edit/Trash는 mutation 없이 거부하고
    authoritative staged 상태와 unstage 선행 안내를 표시하며 자동 unstage/cascade는 하지 않음
40. [settled by existing decision] Breakdown row Edit 중 remote staging이 발생하면 lifecycle invalid
    editor로 전환하여 Save를 막고 draft 확인·복사·닫기를 유지
41. [settled 2026-07-14] authoritative source 삭제가 확인된 orphan candidate는 원자적으로 제거하고
    audit와 Staging-local 알림을 남기며 broken/hidden record는 유지하지 않음
42. [settled 2026-07-14] unstage 성공 후 기존 sort 위치의 source row로 Breakdown 내부 scroll/focus를
    복원하고 Breakdown Add 성공과 동일한 theme-specific 일회성 signal을 재사용
43. [settled 2026-07-14] candidate의 현재 subsection은 neutral no-op drop으로 두고 반대 subsection은
    unstage 선행 message가 있는 invalid target으로 표시하며 자동 유형 변환은 금지
44. [settled 2026-07-14] dedicated unstage drop zone은 Staging 하단 overlay로 표시하고 viewport 높이는
    유지하며 drag 중 scroll padding으로 마지막 candidate 접근성을 보장
45. [settled by existing decision] Grid Explorer search mode에서 staged/direct drag를 시작하면
    search UI를 닫고 column을 복원하며, DnD로 중단된 query만 임시 보존하고 자동 복귀하지 않음
46. [settled 2026-07-14] candidate-create 직전에 source ID/version/lifecycle을 authoritative하게
    재검증하고 변경되었으면 create를 거부한 뒤 최신 상태와 재드래그 안내를 표시
47. [settled 2026-07-14] staged candidate drag가 유효 target 없이 끝나면 mutation과 알림 없이
    candidate를 유지하고 모든 drag signal, warning과 overlay를 즉시 제거
48. [settled by existing decision] Placement Affordance가 열린 동안 Grid path/column navigation을
    차단하고 직접적인 이유를 표시하며 Confirm/Cancel 뒤 요청을 자동 실행하지 않음
49. [settled 2026-07-14] 유효한 Grid column의 위·아래 edge에서 해당 column만 제한적으로
    auto-scroll하고 invalid column과 page는 움직이지 않으며 visible scrollbar chrome은 계속 숨김
50. [settled 2026-07-14] edge auto-scroll 중 target hit-test와 signal을 계속 갱신하고 pointer release
    순간 아래의 valid Node 또는 column body를 최종 destination으로 사용
51. [settled 2026-07-14] Newly Placed Node를 생성 직후 정상 선택·탐색·후속 placement target으로
    허용하고, child 생성 시 parent Undo를 차단하는 기존 dependency 규칙을 적용
52. [settled 2026-07-14] 실제 Grid 좌표는 유지하되 현재 Inbox/Triage session에서는 Newly Placed
    card를 target column 상단에 임시 고정하고 Confirm 후 column을 상단으로 scroll하여 reveal
53. [settled 2026-07-14] 기존 Node/Bits 구분을 유지하고 Newly Placed Node와 Bit를 각 유형 목록
    상단에서 page-session placement 완료 최신순으로 표시하며 일반 항목은 Grid 좌표 순서를 유지
54. [settled 2026-07-14] 현재 mounted page가 시작한 placement operation만 Newly Placed로 추적하고
    다른 기기·tab·session의 생성 항목은 실제 좌표의 일반 card로 표시하며 pin, marker와 Undo를 제외
55. [settled 2026-07-14] 현재 column의 remote item 추가는 path·selection·focus를 유지하고 stable
    visible item과 offset을 anchor로 scroll을 보정하며 새 item으로 자동 이동하지 않음
56. [settled 2026-07-14] selected path Node가 remote 삭제·archive·reparent로 무효해지면 가장 가까운
    유효 ancestor까지 path를 축소하고 sibling 자동 선택 없이 focus와 non-blocking 안내를 복구
57. [settled 2026-07-14] full-hierarchy Grid search 중 data 변경은 query와 search UI를 유지한 채
    result만 갱신하고 자동 이동·별도 sync 알림 없이 focused result 제거 시 input으로 focus 복귀
58. [settled 2026-07-14] full Grid target에도 destination warning이 있는 Placement Affordance를 열고
    Confirm을 차단하며 Cancel 후 재드래그하도록 하고 자동 대체 target 배치는 금지
59. [settled 2026-07-14] Scratch Pool collapse 중 query·result scroll 문맥을 보존하고 collapsed
    switcher에는 숨은 filter를 적용하지 않으며 expand 시 최신 result와 문맥을 복원
60. [audit 2026-07-14] main, 2-3 시안과 결정문을 다시 대조하는 local single-user flow second pass
61. [settled 2026-07-14] 같은 app session의 마지막 active Scratch를 재진입 시 복원하고, 첫 진입 또는
    invalid selection에는 현재 Pool 정렬의 첫 active Scratch를 자동 선택하며 reload에는 selection을 저장하지 않음
62. [settled 2026-07-14] Scratch Pool expanded/collapsed 상태와 수동 reopen 예외는 같은 app session에서
    route 재진입까지 유지하고 reload에는 expanded로 초기화하며, 개발용 Sidebar fold lock은 승격하지 않음
63. [settled 2026-07-14] non-empty Breakdown Add draft를 유지한 채 Scratch/Row inline Edit을 허용하고,
    Edit의 저장·취소·실패와 Add draft를 독립시키며 이탈 시 Edit 저장 후 Add draft 확인 순서로 처리
64. [settled 2026-07-14] non-empty Breakdown Add draft는 Archive presentation을 일시 차단하고 input
    근처에서 해결하도록 하며, draft가 비워진 뒤 기존 완료 조건이 유효하면 overlay를 자동으로 시작
65. [settled 2026-07-14] Breakdown row Delete 확인 뒤 성공 전까지 기존 row를 같은 위치의 theme-specific
    `삭제 중` 상태로 유지하고 actions를 잠그며, 성공 후에만 제거와 completion 재계산을 수행
66. [settled 2026-07-14] Breakdown row Delete가 pending/reconciling이면 Scratch/route 이동을 잠그고
    navigation intent를 저장하지 않으며 reload/tab close에는 native unload guard를 적용
67. [settled 2026-07-14] Delete 명시적 실패는 row를 Active로 복구하고 기존 Trash로 재시도하며,
    timeout은 같은 operation ID를 재조회하고 미확정 시 mutation Retry 대신 `다시 확인`만 제공
68. [settled 2026-07-14] Delete 성공 후 현재 sort의 next/previous row, 일반 empty면 Add input,
    Archive 전환이면 overlay heading으로 focus하며 실패는 복구된 Trash에 focus를 반환
69. [settled 2026-07-14] Stage/Unstage pending 또는 결과 확인 중에는 Scratch/route 이동을 잠그고
    intent를 저장하지 않으며, 같은 Scratch의 관계없는 interaction은 계속 허용
70. [settled 2026-07-14] Grid hierarchy path와 selected Node chain은 page-level shared context로
    유지하여 Scratch 전환으로 초기화하거나 Scratch별 path map으로 저장하지 않음
71. [settled 2026-07-14] Active Grid search mode, query, result와 result scroll은 Scratch 전환에도
    유지하고 focus를 search로 강제 복귀하지 않으며, 새 DnD 시작 시에만 interruption 규칙 적용
72. [settled 2026-07-14] 일반 Grid column scroll과 search reveal highlight도 Scratch 전환에 유지하고,
    기존 Grid interaction 또는 route 이탈에서만 reveal을 해제
73. [settled 2026-07-14] selected Scratch가 외부 archive/delete되면 lifecycle별 안내 modal과
    countdown 뒤 현재 visible Pool의 next/previous로 이동하고 hidden Scratch는 자동 선택하지 않음
74. [settled 2026-07-14] external removal modal은 5초 countdown, 지금 이동과 일시정지/계속을 제공하고
    stale surface로 돌아가는 Cancel은 두지 않으며 초 단위 live announcement는 반복하지 않음
75. [settled 2026-07-14] external removal 시 local unsaved text가 있으면 countdown을 처음부터 멈추고
    draft source별 전체 text 복사를 제공하며 사용자가 계속/즉시 이동을 선택할 때까지 유지
76. [settled 2026-07-14] external archive된 Scratch가 countdown 중 active로 restore되면 modal과 이동을
    취소하고 원래 selection·local draft를 유지하며, hard delete에는 복귀 규칙을 적용하지 않음
77. [settled 2026-07-14] external removal countdown의 destination은 최신 visible Pool로 갱신하고
    변경 시 5초를 재시작하며, 즉시 이동/만료 직전 active·visible 상태를 다시 검증
78. [settled 2026-07-14] Scratch Pool search query, result와 scroll은 같은 app session의 route
    재진입에 복원하고 reload/new session에는 초기화하며 hidden selected Scratch는 그대로 유지
79. [settled 2026-07-14] Grid path, selected Node chain과 column scroll은 같은 app session의 route
    재진입에 복원하고 reload/new session에는 Home으로 초기화하며 reveal/Newly Placed는 이탈 시 종료
80. [settled 2026-07-14] Inbox/Triage route 이탈 시 active Grid search와 DnD로 임시 보존한 query를
    모두 삭제하고, 같은 app session 재진입에도 복원된 일반 4-column Grid mode로 시작
81. [settled 2026-07-14] Inbox/Triage route 재진입 시 visual Grid/Scratch context만 복원하고
    keyboard focus는 stale control이 아닌 page heading 또는 main landmark에서 시작
82. [settled 2026-07-14] Theme/EN·KR 전환은 모든 Inbox transient state와 pending operation을
    유지하는 presentation 변경이며, dirty inline Edit의 blur-save를 실행하지 않음
83. [settled 2026-07-14] Dirty Scratch title editor는 Archive completion presentation을 보류하고,
    자동 저장 없이 Save/Cancel 종료 뒤 eligibility가 유효할 때 overlay를 시작
84. [settled 2026-07-14] Archive overlay 중에는 Breakdown Add를 차단하되 Cancel 뒤 Add input을
    즉시 제공하고, 새 row 저장 성공 시 complete Context/reopen control을 철회
85. [settled 2026-07-14] Placement의 `drag only`는 Mouse 전용이 아니라 Mouse/Touch pointer DnD를
    뜻하며 기존 sensor와 동일한 drag pill을 유지하고 button/keyboard 경로는 제외

### Second-Pass Audit Decisions

아래 항목은 2026-07-14 재감사에서 확인하고 인터뷰로 확정한 local single-user flow 결정이다.
현재 목록에 남은 active question은 없다.

1. **Inbox 진입과 재진입 시 Scratch selection — settled 2026-07-14**
   - 최종 2-3 시안은 첫 Scratch를 자동 선택하지만 main은 `selectedScratchId: null`로 시작한다.
   - 같은 app session 재진입에서는 마지막 active selection을 복원한다.
   - 첫 진입 또는 invalid selection에는 현재 Pool 정렬의 첫 active Scratch를 자동 선택하고, active
     Scratch가 없을 때만 no-selection empty state를 사용한다.
   - selection ID는 reload를 넘겨 영구 저장하지 않으며 Archive 성공의 next/previous 규칙은 유지한다.
2. **Scratch Pool expanded/collapsed 상태의 수명 — settled 2026-07-14**
   - 수동 expanded/collapsed 상태와 현재 Scratch의 수동 reopen 예외는 같은 app session에서 route를
     떠났다가 돌아와도 복원한다.
   - reload와 새 app session에서는 expanded 상태로 시작하고 reopen 예외를 초기화한다. 이 상태는
     content record, local preference 또는 remote data로 저장하지 않는다.
   - 2-3 Sidebar의 `scratch-pool-fold-lock`은 개발·시안 검토용 control이므로 Main 이식 시 삭제하며,
     production 설정으로 대체하지 않는다.
3. **미완성 Breakdown Add draft와 다른 text/action flow의 충돌 — settled 2026-07-14**
   - non-empty Add draft를 유지한 채 Scratch/Row inline Edit을 허용한다. 두 draft는 독립적이며 Edit의
     Save, Cancel 또는 실패가 Add draft를 변경하지 않는다.
   - 두 draft가 함께 있는 상태에서 Scratch/route 이탈을 요청하면 inline Edit 저장을 먼저 완료한 뒤
     기존 Add draft 이탈 confirmation을 적용한다.
   - non-empty Add draft는 Archive overlay와 completion presentation을 일시 차단한다. Input 근처에서
     Add 또는 draft 비우기를 안내하며 Archive가 draft를 자동 제출하거나 폐기하지 않는다.
   - draft를 비웠고 persisted completion 조건이 여전히 충족되면 현재 mounted session의 완료 전환으로
     처리하여 Archive overlay를 자동으로 연다.
4. **Breakdown Row delete mutation lifecycle — settled 2026-07-14**
   - 기존 Delete confirmation을 유지한다.
   - Confirm 뒤 성공 전까지 원래 row를 같은 위치의 `삭제 중` 상태로 유지하고 Edit, Trash와 DnD를
     잠근다. 별도 placeholder로 교체하거나 낙관적으로 제거하지 않는다.
   - 성공 후에만 row를 제거하고 Empty Prompt와 Archive eligibility를 다시 계산한다.
   - pending/reconciling 중에는 Scratch/route 이동을 잠그고 요청을 자동 실행용 intent로 저장하지 않는다.
     Reload/tab close에는 native unload guard를 적용한다.
   - 명시적 실패는 원래 row를 Active로 복구하고 별도 Retry 없이 기존 Trash를 다시 사용한다. Timeout은
     같은 operation ID의 결과를 재조회하고 미확정 상태에서는 mutation 재전송 대신 `다시 확인`만 제공한다.
   - 성공 후 현재 sort의 next/previous row를 사용하고, 일반 empty면 Add input, Archive 전환이면 overlay
     heading으로 focus를 복구한다. 실패는 원래 Trash, 미확정 재확인은 `다시 확인` action을 사용한다.
5. **Stage/Unstage write 중 Scratch 또는 route 전환 — settled 2026-07-14**
   - Stage와 Unstage 모두 pending/reconciling 중에는 Scratch 전환과 앱 내부 route 이탈을 잠근다.
   - 이동 요청을 저장하거나 성공 후 자동 실행하지 않으며 reload/tab close에는 native guard를 적용한다.
   - 같은 Scratch에서 pending source/candidate와 충돌하지 않는 일반 interaction은 계속 허용한다.
6. **Scratch 전환 시 Grid 작업 문맥 — settled 2026-07-14**
   - Grid hierarchy path, selected Node chain과 열린 column은 page-level shared context로 유지한다.
     Scratch 전환으로 Home에 초기화하거나 Scratch별 path map을 만들지 않는다.
   - Active Grid search mode, query, result와 result scroll은 Scratch 전환에도 유지한다. Scratch
     selection focus를 search input으로 강제 이동하지 않으며 DnD 시작 시 기존 interruption을 적용한다.
   - 일반 column scroll과 search reveal highlight도 유지한다. Scratch 전환은 reveal 종료 조건이 아니며
     다른 Grid item 선택, path 변경, DnD/search 재실행 또는 route 이탈에서만 종료한다.

외부 mutation으로 selected Scratch가 사라지는 일반 fallback은 위 1~6번 뒤에 재평가했으며,
아래 7번에서 selection과 modal interaction을 확정했다.

7. **Selected Scratch external removal — settled 2026-07-14**
   - 다른 tab/session에서 selected Scratch가 archive/delete되면 lifecycle에 맞는 안내 modal과 자동
     이동 countdown을 표시하고 stale Scratch interaction을 차단한다.
   - 현재 search/sort의 next visible Scratch, 없으면 previous visible Scratch로 이동한다. Visible
     result가 없으면 hidden Scratch를 선택하지 않으며 전체 active가 없으면 Inbox empty state로 간다.
   - Modal은 5초 countdown, `지금 이동`, `자동 이동 일시정지/계속`을 제공한다. Stale surface로 돌아가는
     Cancel은 두지 않고 countdown 초를 screen reader에 매초 반복 안내하지 않는다.
   - local unsaved Add/Edit text가 있으면 처음부터 countdown을 멈추고 source별 전체 text 복사를
     제공한다. Copy가 자동 이동을 재개하지 않으며 사용자가 계속 또는 즉시 이동을 선택해야 한다.
   - archived Scratch가 countdown 중 active로 restore되면 modal과 이동을 취소하고 원래 selection과
     local draft를 유지한다. Hard delete에는 이 복귀 규칙을 적용하지 않는다.
   - destination이 바뀌면 최신 visible Pool로 다시 계산하고 running countdown을 5초로 재시작한다.
     Paused 상태는 유지하며 실제 이동 직전에도 target의 active·visible 상태를 재검증한다.

8. **Scratch Pool search의 route/reload lifecycle — settled 2026-07-14**
   - Query, filtered result와 result scroll은 같은 app session의 Inbox/Triage route 재진입에서 최신
     data로 복원한다. Collapsed 상태에서는 숨은 filter를 switcher에 적용하지 않는다.
   - Reload와 새 app session에는 빈 query로 초기화하고 content/local preference/remote data로 저장하지
     않는다. 복원된 selected Scratch가 filter 밖이면 selection을 유지하고 hidden status를 표시한다.

9. **Grid context의 route/reload lifecycle — settled 2026-07-14**
   - 현재 main의 path/search가 `HierarchyExplorer` component-local state라 unmount 시 초기화되는 구현
     사실을 product contract로 간주하지 않고 route/reload lifecycle을 명시적으로 확정했다.
   - Grid path, selected Node chain과 column scroll은 같은 app session의 route 재진입에 복원하고,
     reload/new session에는 Home으로 초기화한다. Reveal과 Newly Placed/Undo는 route 이탈 시 종료한다.
   - Route 이탈 시 active Grid search mode, query, result scroll과 DnD interrupted query를 모두
     삭제한다. 같은 app session 재진입에도 search를 자동 복원하지 않고 앞서 복원한 path와 scroll의
     일반 4-column mode로 시작하며 reload/new session도 빈 query로 시작한다.

10. **Inbox/Triage route 재진입 focus — settled 2026-07-14**
    - 같은 app session에서 Scratch selection과 Grid path/scroll을 복원해도 마지막 focused control은
      복원하지 않는다.
    - App의 route-focus convention에 따라 page heading 또는 main landmark로 focus를 이동하며 selected
      Scratch, Grid card 또는 search input으로 강제 이동하지 않는다.

11. **Theme/locale 전환 중 Inbox 작업 상태 — settled 2026-07-14**
    - Theme 또는 EN/KR 전환은 route/Scratch 이동이 아닌 presentation 변경으로 처리하고 Pool/search,
      Add/Edit draft, Grid context, 열린 Placement·Archive, pending operation과 Newly Placed/Undo를 유지한다.
    - Surface와 system copy만 새 theme/locale로 교체하고 user-authored text는 바꾸지 않는다. Toggle로
      이동한 focus는 그대로 두며 dirty inline editor의 일반 blur-save를 실행하지 않는다.

12. **Scratch title Edit과 Archive 자동 완료 충돌 — settled 2026-07-14**
    - Dirty title editor와 Save/conflict/reconciliation은 completion presentation blocker이며 Archive
      overlay, blur와 complete Context를 표시하지 않는다.
    - Completion이 draft를 자동 저장·취소하지 않는다. Save/Cancel로 editor가 종료된 뒤 eligibility를
      재계산하고 유효하면 자동 overlay를 시작하며, Save 실패/conflict면 editor와 blocker를 유지한다.

13. **Archive Cancel 뒤 Breakdown 재개 — settled 2026-07-14**
    - Overlay가 열린 동안에는 blurred Breakdown의 Add와 기존 control을 조작할 수 없지만 Cancel 뒤에는
      별도 재개 단계 없이 기존 Add input을 바로 사용할 수 있다.
    - 새 row 저장 성공 시 eligibility 상실에 따라 complete Context와 reopen control을 제거하고 일반
      Breakdown으로 복귀한다. Non-empty Add draft만 있는 동안에는 기존 completion blocker를 유지한다.

14. **Placement 입력 장치 범위 — settled 2026-07-14**
    - `drag only`를 Mouse 전용이 아니라 Mouse/Touch pointer DnD로 확정한다. 두 입력 모두 기존 main
      sensor activation과 동일한 drag pill, drop signal, Placement Affordance를 사용한다.
    - 별도 visible placement action/menu, keyboard DnD와 destination picker는 이번 promotion에서
      추가하지 않는다.

## Session Log

### 2026-07-13

#### Daily Progress

- [x] main production source와 tests 감사 — reflected in `DECISION.md`
- [x] 2-3의 8개 route code 감사 — reflected in `DECISION.md`
- [x] 8개 theme route 렌더링 비교 — reflected in visual evidence
- [x] stale handoff facts 분리 — recorded in NOTES
- [x] Now/Later promotion boundary 초안 — reflected in `DECISION.md`
- [x] Grid Explorer 전체 hierarchy search interview — reflected in `DECISION.md`
- [x] Scratch/Breakdown inline edit interaction — reflected in `DECISION.md`
- [x] Breakdown-to-Node/Bit title limit mismatch — staged modal + Direct type gating으로 정리
- [x] second-pass local user-flow audit — complete

#### Live Checkpoints

- [reflected] 시안 code quality는 승격 판단 대상이 아님
- [reflected] 실제 2-3 UI와 behavior가 문서보다 우선하는 design evidence임
- [reflected] main functional source와 2-3 design source는 합치지 않고 역할을 분리함
- [reflected] main/2-3의 active-column search는 전체 hierarchy 전용 search mode로 대체함
- [reflected] Placement Confirm은 stale source/target을 재검증하며 자동 재배치나 partial write를 하지 않음
- [reflected] Placement Confirm의 create/consume/candidate removal은 하나의 idempotent transaction이며
  결과가 불명확한 동안 재실행하지 않음
- [reflected] Archive OK는 성공 확인 전까지 Breakdown overlay와 selected Scratch를 유지하고 timeout
  결과 확인 전에는 재실행하지 않음
- [reflected] Archive 전제가 깨지면 overlay, blur, complete Context와 reopen control을 함께 철회함
- [reflected] Archive 성공 후에도 Pool search/sort 문맥을 보존하며 hidden Scratch를 자동 선택하지 않음
- [reflected] Archive overlay는 Breakdown만 가리며 mutation 시작 전에는 전역 focus trap을 사용하지 않음
- [reflected] Scratch 전환은 archive를 취소하거나 실행하지 않고 현재 overlay presentation만 연기함
- [reflected] Archive auto-open은 현재 mounted session의 eligibility 전환 순간에만 적용함
- [reflected] 미확정 Placement flow는 Scratch별로 보존하거나 navigation으로 암묵적 Cancel하지 않음
- [reflected] column-scoped Placement는 full-screen modal이 아니지만 열린 동안 단계 내부 focus를 관리함
- [deferred] keyboard/drag 대체 Placement 진입 경로는 후속 accessibility brainstorming 필요
- [reflected] Scratch Pool count는 검색 여부에 따라 의미가 바뀌지 않음
- [reflected] 같은 source Breakdown row의 Node/Bit 동시 staging과 동일 유형 중복 staging을 금지하고,
  unstage 이후에는 다시 staging할 수 있게 함
- [reflected] staged candidate는 reload나 기기 전환으로 사라지는 임시 UI state가 아니라 동기화되는
  domain data이며, unstage button과 Breakdown section 전체 drop-back은 같은 mutation 경로를 사용함
- [reflected] 기존 toast brainstorming은 성공한 routine unstage의 toast를 금지하지만 blocked/failed
  action의 error toast는 허용하므로, 현재 section-local failure alert의 향후 이전과 충돌하지 않음
- [reflected] 2-3 Breakdown sort control은 실제 배열을 정렬하지 않으므로 production에서 동작 구현 필요
- [reflected] sort direction은 content/BaaS data가 아닌 local view preference임
- [reflected] 새 row signal은 2-3 source 복사가 아닌 surface recipe에서 추출·정의할 신규 미세 상태임
- [reflected] rapid add는 이번 범위에서 in-memory queue나 optimistic row를 사용하지 않음
- [reflected] main의 Add input blur-submit은 explicit Add/Enter 정책으로 대체함
- [reflected] Add draft는 새 record가 아니므로 navigation 시 자동 저장하지 않음
- [deferred] main BitCard, Staging/Placed visual 재탐색
- [deferred] 한국어/i18n 및 Neumorphism water-lens polish

## References

- `docs/brainstorming/2026-04-28-inbox-triage-workspace/DECISION.md`
- `docs/brainstorming/2026-05-28-inbox-triage-theme-variants/DECISION.md`
- `docs/brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/PROTOTYPE_FUNCTION_GAP_2_4.md`
- `docs/brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/PROTOTYPE_TO_MAIN_HANDOFF.md`
- `docs/brainstorming/2026-07-14-cross-surface-text-capacity-and-overflow/DECISION.md`
- `docs/SPEC.md`
- `docs/DESIGN_TOKENS.md`
- `docs/recipes/inbox-triage-batch2-visual-recipe.md`
