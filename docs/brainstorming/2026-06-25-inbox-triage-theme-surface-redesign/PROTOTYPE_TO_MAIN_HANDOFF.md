# Inbox/Triage Prototype to Main Handoff

## 문서 상태

- 상태: Draft
- 작성 목적: 2-3 시안과 2-4 기획 문서에서 확정되거나 탐색된 Inbox/Triage UX를 main production code로 재구현하기 위한 사전 정리
- 참조 시안: `/Users/jwk/Documents/griddo2-claude-themes2-3`
- 참조 문서:
  - `PROTOTYPE_FUNCTION_GAP.md`
  - `GEMINI_2_3_WORK_PROMPT.md`
  - `PROTOTYPE_FUNCTION_GAP_2_4.md`
  - `ANTIGRAVITY_2_4_WORK_PROMPT.md`

## 목적

이 문서는 prototype code를 main으로 복사하기 위한 문서가 아니다.

2-3 시안은 UX/UI 탐색과 빠른 기능 실험을 위해 만들어졌고, 많은 부분이
ad-hoc mock state, duplicated route code, temporary interaction, theme별 inline
style로 구성되어 있다. main 작업에서는 이 코드를 그대로 가져오지 않는다.

이 문서의 목적은 다음과 같다.

1. 2-3 시안에 어떤 기능과 UX 상태가 들어갔는지 정리한다.
2. 해당 기능이 main에서 어떤 production-quality 구조로 재구현되어야 하는지
   기록한다.
3. 시안에서 확정된 디자인/정책 결정과, 단순 prototype 편의를 분리한다.
4. 이후 main 구현 계획을 작성할 때 빠뜨리기 쉬운 정책 변경을 누적 관리한다.

## 읽는 법

각 항목은 아래 네 가지 층으로 읽는다.

1. Prototype Observation
   - 2-3 시안 코드에서 실제로 보이는 UX와 상태
2. Design Intent
   - 시안이 전달하려는 사용자 경험과 디자인 의도
3. Main Implementation Target
   - main에서 production quality로 구현해야 하는 방향
4. Do Not Carry Over
   - main으로 가져오면 안 되는 prototype-only 구현 방식

## 공통 전제

### C0. 시안 코드는 구현 reference가 아니라 UX reference다

Prototype Observation:

- 2-3 시안은 8개 route 파일에 기능과 디자인이 거의 중복 구현되어 있다.
- `selectedScratchId`, `nodeCandidates`, `bitCandidates`, `placedItemsByScratch`,
  `pendingPlacement`, `directRowDrop`, `showArchiveAffordance` 같은 local mock state가
  각 theme 파일 안에 반복된다.
- `placedItemsByScratch`는 실제 Node/Bit model이 아니라 `Node: ...`, `Bit: ...`
  문자열 배열을 이용해 시각 상태를 표현한다.

Design Intent:

- 사용자가 최신 Inbox/Triage UX가 어떤 화면 흐름과 시각 상태로 보여야 하는지
  판단할 수 있게 하는 것이 목적이다.
- 실제 데이터 모델, persistence, hook architecture를 검증하는 것이 목적은 아니다.

Main Implementation Target:

- main에서는 기존 production component와 store/hook 구조를 기준으로 재구현한다.
- 시안에서 반복된 theme별 코드를 그대로 복사하지 않는다.
- 필요한 경우 presentation component, view state, interaction state를 분리한다.
- 시안에서 얻은 것은 "디자인/상태/흐름"이지 "구현 구조"가 아니다.

Do Not Carry Over:

- 8개 route 파일식 중복 구조
- 문자열 기반 placed item model
- 임시 hover variant switcher
- 시안 탐색용 inline magic value
- production data와 무관한 mock-only mutation

### C1. Section label/header/chrome 부활

Prototype Observation:

- 2-3 시안은 theme 내부의 `Scratch Pool`, `Breakdown`, `Staging`, `Grid` 계열
  header/chrome을 보존하는 방향으로 진행되었다.
- 초기 2-3 문서는 visible developer label 제거를 지시했지만, 이후 2-4 문서에서는
  preview heading과 section label/header/chrome을 분리했다.
- 최종 방향은 preview heading은 제거하고, theme 내부 section chrome은 유지하는 것이다.

Design Intent:

- 2-2 시안의 강점은 각 theme가 section을 자기 방식으로 framing한다는 점이다.
- main의 label 제거 규칙을 prototype에 그대로 적용하면 2-2의 디자인 정체성이 약해진다.

Main Implementation Target:

- main에서도 Inbox/Triage의 주요 section은 사용자가 이해할 수 있는 header/chrome을
  가져야 한다.
- 단, main의 production design system 안에서 일관된 컴포넌트로 설계해야 한다.
- label은 단순 텍스트 덩어리가 아니라 영역의 기능, 상태, 현재 scope를 전달해야 한다.

Do Not Carry Over:

- theme별 preview shell heading
- `L1`, `L2`, `L3`, `Home-L3`, `H1-L3` 같은 축약형 노출
- 개발자용 내부 용어를 그대로 UI에 노출하는 방식

### C2. 한국어 버전

Prototype Observation:

- 2-4 문서는 EN/KR toggle과 한국어 버전을 요구한다.
- 2-3 worktree에는 한때 한국어 route와 language store가 추가되었으나, 현재 작업
  흐름에서는 제거된 상태다.

Design Intent:

- 한국어는 단순 문자열 번역이 아니라 각 theme의 typography 안에서 자연스럽게
  보이도록 별도 font treatment가 필요하다.

Main Implementation Target:

- main에서는 별도 route 복제가 아니라 i18n/resource 기반으로 처리해야 한다.
- 영문/한국어 전환은 production-level state와 routing 정책을 먼저 결정한 뒤 구현한다.
- 한국어 typography token 또는 component-level text treatment가 필요하다.

Do Not Carry Over:

- `inbox-triage-*-kor/page.tsx`처럼 route를 8개 더 복제하는 방식
- 언어별로 prototype page를 통째로 복사하는 방식

### C3. Theme identity 보존

Prototype Observation:

- 2-3 시안은 2-2의 visual identity를 보존하는 것이 가장 중요한 성공 기준이었다.
- 실패한 2-4 초기 시도는 section 비율, typography, color, node/bit staging shape,
  hierarchy structure를 재창조하면서 방향이 틀어졌다.

Design Intent:

- 새 기능은 기존 theme 위에 붙는 generic UI가 아니라, 각 theme의 surface, button,
  card, row, icon, motion 언어 안에 흡수되어야 한다.

Main Implementation Target:

- main은 8개 prototype theme를 그대로 갖지 않더라도, 시안에서 검증된 UX hierarchy와
  visual emphasis를 product UI에 맞게 반영해야 한다.
- "기능을 추가했는데 기존 화면을 재창조하지 않는다"는 원칙은 production에도 적용한다.

Do Not Carry Over:

- prototype theme별 과도한 장식 자체
- production component가 감당하기 어려운 일회성 CSS 장치
- design token 없이 흩어진 색상/spacing/motion 값

## Scratch Pool

### S1. 통합 tools 영역

Prototype Observation:

- 2-3 시안은 Scratch Pool 상단에 identity, count, collapse, search, sort를 통합했다.
- 펼친 상태에서는 search input과 sort control이 header/chrome 안쪽에 들어간다.
- 접힌 상태에서는 icon, count, collapse toggle, selected switcher가 세로로 정렬되는
  방향으로 보정되었다.

Design Intent:

- Scratch Pool은 단순 list가 아니라 현재 Inbox/Triage 작업의 진입점이다.
- tools가 header, search bar, sort button으로 따로 흩어지면 기존 theme의 chrome과
  분리되어 보인다.

Main Implementation Target:

- main의 `ScratchPool`은 tools region과 list region을 명확히 나누되, visually는 하나의
  cohesive component처럼 보여야 한다.
- search, sort, count, collapse는 같은 작업 맥락 안에 있어야 한다.
- 접힌 상태에서도 count와 selected scratch identity가 사라지지 않아야 한다.

Do Not Carry Over:

- theme별 route 안의 local `scratchSearch`, `scratchSortAsc` 반복 구현
- prototype-only width animation 값 그대로 복사
- 검색/정렬 state를 UI mock 수준으로만 다루는 방식

### S2. Scratch search와 created-at sort

Prototype Observation:

- 2-3 시안은 Scratch title search와 created-at asc/desc sort state를 표시한다.
- sort button은 theme별로 다른 디자인을 탐색했다.
  - 예: Neumorphism은 sliding segmented pill
  - Tiny Desk는 `A-Z` / `Z-A` text style
  - Terminal은 command option style
  - Retro Mac은 System style sort label

Design Intent:

- 사용자는 현재 Scratch list가 어떤 기준으로 정렬되어 있는지 바로 알아야 한다.
- Sort UI는 generic pill을 반복하지 않고 theme/product style 안에서 상태가 드러나야 한다.

Main Implementation Target:

- main에서는 Scratch sort를 명확한 state로 관리한다.
- `newest/oldest` 또는 `asc/desc` 용어를 사용자에게 어떤 방식으로 노출할지 정한다.
- sort control은 접근 가능한 toggle/button group이어야 한다.

Do Not Carry Over:

- 각 theme별 label을 production copy로 그대로 가져오는 것
- 정렬 방향과 실제 comparator가 어긋나는 mock 구현

### S3. Collapsed Scratch switching

Prototype Observation:

- 2-3 시안은 Scratch Pool collapsed 상태에서 scratch item을 점/바/핀/블록으로 표시한다.
- selected indicator는 inactive indicator보다 훨씬 강해야 한다는 피드백이 반영되었다.
- 일부 theme에서 inline으로 놓였던 icon/toggle은 세로 배치로 보정되었다.

Design Intent:

- collapsed 상태에서도 Scratch 전환이 가능해야 하고, 현재 선택된 Scratch가 명확해야 한다.

Main Implementation Target:

- main의 collapsed Scratch Pool은 keyboard/mouse 모두에서 사용 가능해야 한다.
- selected state, count, expand affordance는 동시에 이해되어야 한다.

Do Not Carry Over:

- 시안의 theme별 dot 크기나 임시 marker 값을 그대로 복사
- collapsed 상태에서 기능 요소가 가로로 끼어드는 구조

## Breakdown

### B1. Selected Scratch Context는 signature area다

Prototype Observation:

- 2-3 시안은 Breakdown 상단에 Selected Scratch Context를 크게 배치했다.
- 이 영역은 일반 row보다 훨씬 크고, title, createdAt, Edit button, desc/asc sort control을 포함한다.
- 사용자가 "지금 어떤 Scratch를 분해 중인가?"를 즉시 이해해야 한다는 목표로 설계되었다.
- 여러 theme에서 Scratch 완료 상태일 때 context 자체가 `Triaged`, `SUCCESS`, stamp,
  file path, archive ref 같은 theme-specific 완료 상태로 변한다.

Design Intent:

- Selected Scratch Context는 일반 정보 row가 아니다.
- Inbox/Triage에 진입했을 때 가장 먼저 보이는 signature area이며, 각 theme/제품의
  첫인상을 만든다.

Main Implementation Target:

- main의 `BreakdownPanel` 상단 context는 일반 breakdown row와 명확히 분리된 section으로
  재설계한다.
- title, created time, edit action, row sort action을 포함한다.
- main에서도 row보다 시각 hierarchy가 높아야 한다.
- 디자인은 production UI에 맞게 절제하되, 단순 title/date line으로 돌아가면 안 된다.

Do Not Carry Over:

- 2-3의 theme-specific 장식 코드를 그대로 복사
- context를 row component variation으로 구현하는 방식
- context metadata를 heading 우측 작은 text로만 처리하는 방식

### B2. Breakdown row cleanup

Prototype Observation:

- 2-3 시안은 Breakdown row numbering과 row time text를 제거했다.
- row에는 grip-only drag affordance가 있고, Edit/Trash actions가 상시 노출된다.
- staged 상태가 되면 row는 사라지지 않고 theme-specific de-emphasize 상태로 남는다.
- placed 상태가 되면 `visibleIdeas` 필터를 통해 row가 화면에서 소비되어 사라진다.

Design Intent:

- row는 작업 단위이고, grip에서만 drag 가능해야 한다.
- staging은 "대기 중" 상태이므로 row가 완전히 사라지면 안 된다.
- placement 완료는 "소비됨"이므로 row가 더 이상 Breakdown list에 남지 않아야 한다.

Main Implementation Target:

- main의 row model은 `staged`, `placed/consumed`, `active` 상태를 명확히 구분해야 한다.
- staged row는 disabled/de-emphasized로 남기고, placed/consumed row는 기본 list에서 제거한다.
- Edit/Trash action은 hover-only에 의존하지 않는 방향을 검토한다.
- row time은 숨기더라도 sorting/data에는 createdAt 개념이 유지되어야 한다.

Do Not Carry Over:

- `visibleIdeas`처럼 문자열 match로 placed 여부를 계산하는 방식
- staged 여부를 title match로 판별하는 방식
- row action icon의 theme별 임시 선택 과정

### B3. Breakdown empty prompt

Prototype Observation:

- 2-3 시안에는 row가 없을 때 theme-specific empty prompt가 들어갔다.
- triaged 상태와 non-triaged empty 상태가 다르게 보인다.
- 예: Terminal은 debugger/log message, Griddo는 buffer cleared/empty slip message,
  Graphite는 archive ref tone을 사용한다.

Design Intent:

- 빈 Breakdown은 단순 blank area가 아니라 다음 행동을 유도해야 한다.
- 모든 row가 소비된 상태와 아직 입력이 없는 상태는 다르게 보여야 한다.

Main Implementation Target:

- main의 Breakdown empty state는 최소 두 상태를 구분한다.
  - 아직 row가 없는 상태
  - 모든 row가 소비되어 archive 가능한 상태
- copy는 제품 톤에 맞게 정리하되, 시안처럼 "다음 행동"이 분명해야 한다.

Do Not Carry Over:

- prototype theme copy 그대로 복사
- empty state를 archive affordance와 혼동하는 구조

### B4. Archive affordance

Prototype Observation:

- 2-3 시안은 모든 row가 소비되고 staged node/bit가 남아 있지 않을 때 archive affordance를 띄운다.
- 단순히 row가 staged된 것만으로는 archive가 뜨면 안 된다는 정책이 반영되었다.
- archive affordance는 Breakdown section 안에서 section을 blur 처리하고 그 위에 뜬다.
- Cancel하면 overlay는 닫히고, section 내부에 archive open affordance가 남는다.
- OK/Archive를 누르면 해당 Scratch가 inbox에서 사라지는 것으로 mock 처리된다.

Design Intent:

- Archive는 completion moment다.
- full page modal이 아니라 Breakdown section 단위의 완료/보관 affordance로 보여야 한다.
- Cancel 후에도 사용자가 다시 archive dialog를 열 수 있어야 한다.

Main Implementation Target:

- main의 archive flow는 `canArchiveScratch` 조건과 시각 조건을 분리한다.
- 조건:
  - breakdown row가 모두 consumed/placed
  - staged node/bit가 남아 있지 않음
  - active scratch가 존재함
- 표시:
  - Breakdown section-scoped overlay
  - Cancel/OK
  - Cancel 후 inline reopen affordance
  - selected scratch context의 complete state

Do Not Carry Over:

- `showArchiveAffordance` local flag를 route마다 반복하는 방식
- mock `setScratches(prev => prev.filter(...))`로 archive 처리하는 방식

## Staging

### ST1. Node/Bit shape 유지

Prototype Observation:

- 2-3 시안은 Staging을 Node와 Bit로 분리한다.
- Node는 card/grid/icon 성격, Bit는 row/list 성격을 유지한다.
- 일부 empty placeholder label은 제거 대상이었다.

Design Intent:

- Node/Bit 구분은 label에만 의존하면 안 된다.
- 형태와 배치만 봐도 Node 후보와 Bit 후보가 달라야 한다.

Main Implementation Target:

- main의 `StagingZone`은 Node/Bit의 visual grammar를 분리한다.
- label을 쓰더라도 shape, density, icon, hierarchy를 함께 사용한다.

Do Not Carry Over:

- 시안의 theme별 장식적 placeholder
- Node/Bit를 텍스트 label만으로 구분하는 방식

### ST2. Remove-from-staging / Breakdown drop-back

Prototype Observation:

- 2-3 시안은 staged Node/Bit를 다시 Breakdown으로 돌릴 수 있는 drop target을 표시한다.
- theme별로 trash, return, cut, command, slot 같은 affordance가 탐색되었다.

Design Intent:

- remove-from-staging은 destructive delete가 아니라 staging 취소다.
- 사용자는 drag 중에 어디로 되돌릴 수 있는지 알아야 한다.

Main Implementation Target:

- main에서 staged candidate를 되돌리는 interaction을 명확히 제공한다.
- drop target copy/icon은 "삭제"보다 "되돌리기/unstage"에 가깝게 설계한다.

Do Not Carry Over:

- destructive red 중심의 remove tone
- 실제 delete와 unstage를 혼동시키는 UI

### ST3. Invalid drop tone

Prototype Observation:

- 2-4 문서는 invalid drop을 destructive warning red로 몰지 말라고 정리했다.
- 2-3 시안은 theme별 unavailable/locked/dimmed/recessed/folded tone을 탐색한다.

Design Intent:

- invalid drop은 위험 경고가 아니라 "이 위치에는 둘 수 없음"에 가깝다.

Main Implementation Target:

- main에서도 invalid drop tone을 destructive style과 분리한다.
- Node-only / Bit-only 제약은 차분하지만 명확하게 표시한다.

Do Not Carry Over:

- 모든 invalid state를 red/error로 처리하는 방식

## Hierarchy / Grid

### H1. Grid search와 level label

Prototype Observation:

- 2-3 시안은 `Home`, `Level 1`, `Level 2`, `Level 3` label을 사용한다.
- visible `L1/L2/L3`, `Home-L3`, `H1-L3` 같은 축약형은 제거 대상이다.
- search는 Grid surface 내부에 있고, X clear affordance를 사용한다.
- search scope는 active column 강조와 inactive column dimming으로 표현한다.

Design Intent:

- hierarchy search는 detached global search가 아니라 현재 Grid 탐색 surface의 일부다.
- scope text를 늘어놓기보다 column 자체의 상태로 검색 범위를 전달한다.

Main Implementation Target:

- main의 `HierarchyExplorer`에서 label은 사용자용 풀네임을 사용한다.
- search indicator는 query, result count, X clear를 포함한다.
- selected node title을 column heading 아래 반복 노출하지 않고, item active style로 표현한다.

Do Not Carry Over:

- 축약형 level label
- visible `Clear` text
- search pill 안 scope text

### H2. Drop constraints: Home은 Node only, Level 3는 Bit only

Prototype Observation:

- 2-4 문서는 Home에는 Node only, Level 3 grid에는 Bit only라는 제약을 명시한다.
- 2-3 시안은 drag 중 locked/invalid target을 dim, blur, unavailable tone으로 표현한다.

Design Intent:

- drag 중 사용자가 "어디에 둘 수 있는지"를 drop 전부터 알아야 한다.
- 제약 신호는 theme/product tone에 맞아야 하며, 단순 error가 아니어야 한다.

Main Implementation Target:

- main의 hierarchy drop target은 candidate type과 target level constraint를 명확히 계산한다.
- invalid target은 `aria-disabled` 또는 equivalent semantic state도 고려한다.
- visual state는 allowed, invalid, locked, pending을 구분한다.

Do Not Carry Over:

- prototype의 per-theme CSS만으로 제약을 표현하는 방식
- drop 이후에야 실패를 알리는 흐름

### H3. Placement Affordance와 Confirm/Yes

Prototype Observation:

- 2-3 시안은 staged Node/Bit 또는 direct row가 Grid에 drop되면 바로 배치하지 않고
  Placement Affordance를 표시한다.
- Confirm/Yes 후에 최종 배치 상태로 넘어간다.
- direct row drop은 먼저 Node/Bit 선택과 target path 확인 affordance를 보여주고,
  이후 Placement Affordance로 이어진다.

Design Intent:

- drop 직후 사용자가 배치 결과를 확인할 수 있어야 한다.
- direct row는 Node로 만들지 Bit로 만들지 선택해야 하며, target path도 보여야 한다.

Main Implementation Target:

- main의 현재 `PendingPlacement` dialog/flow와 시안에서 탐색한 inline/column affordance를
  비교해 최종 UX를 결정한다.
- Confirm 전 상태와 Confirm 후 상태는 시각적으로 분리되어야 한다.
- direct row drop은:
  - type 선택
  - target path 확인
  - constraint 반영
  - Confirm/Cancel
  흐름을 가져야 한다.

Do Not Carry Over:

- prototype의 `directRowDrop` local object 그대로
- 모든 theme에 다른 interaction model을 넣는 방식

### H4. Confirm 후 결과는 실제 Node/Bit card처럼 보여야 한다

Prototype Observation:

- 최근 2-3 시안은 Confirm 후 `checkbox + Node: ... + Undo` indicator card를 제거하고,
  기존 hierarchy Node/Bit card에 가까운 형태로 결과를 표현하도록 수정했다.
- 내부적으로는 여전히 `placedItemsByScratch[level]` 문자열을 parsing한다.

Design Intent:

- Confirm 후 결과는 "임시 indicator"가 아니라 target path에 실제 Node/Bit가 생긴 것처럼 보여야 한다.
- 기존 Node/Bit card UI를 유지하되, 방금 추가되었음을 알 수 있는 marker/effect를 더한다.

Main Implementation Target:

- main에서는 실제 Node/Bit creation 결과를 Grid data에 반영한다.
- 새로 생긴 Node/Bit는 existing Node/Bit card component를 사용한다.
- newly placed visual state는 별도 indicator card가 아니라 기존 card의 transient visual state로 표현한다.

Do Not Carry Over:

- `Node: ...` / `Bit: ...` string parsing
- checkbox indicator card
- 기존 Node/Bit card와 전혀 다른 새 card design

### H5. Newly Placed 상태 정책

Prototype Observation:

- 현재 2-3 시안에는 안정적인 `newlyPlacedKey` 정책이 아직 정착되지 않았다.
- 시안 탐색 단계에서는 scratch 전환 시 사라지는 scratch-scoped volatile state도 허용된다.

Design Intent:

- Newly placed item은 기존 Node/Bit card UI를 그대로 사용해야 한다.
- 배경, effect, marker, Undo 등으로 "방금 추가된 item"임을 알 수 있어야 한다.
- Grid column 전환 중에는 해당 card가 동일하게 존재해야 한다.

Prototype Policy:

- 2-3 시안에서는 scratch-scoped volatile state로 처리해도 된다.
- 같은 Scratch 안에서는 Grid column 전환 중에도 newly placed 상태가 유지된다.
- 다른 Scratch로 전환하면 일반 Node/Bit card처럼 돌아가도 된다.
- 이 정책은 prototype 탐색 편의를 위한 것이다.

Main Implementation Target:

- main에서는 Inbox page/session scoped transient UI state로 관리한다.
- 사용자가 Inbox/Triage page를 떠날 때까지 newly placed 상태를 유지한다.
- Scratch 전환이나 Grid column 전환만으로는 사라지지 않는다.
- DB에 영구 저장하지 않는다.
- persistence가 아니라 UI session state다.

Do Not Carry Over:

- scratch-scoped lifecycle을 main 정책으로 오해하는 것
- route-level local state에만 묶인 newly placed 상태
- newly placed 상태를 selected 상태와 같은 스타일로 처리하는 것

### H6. Placed item Undo

Prototype Observation:

- 2-3 시안은 placed card 우측에 Undo button을 표시한다.
- 현재 mock에서는 Undo가 `placedItemsByScratch[level]`에서 item을 제거하는 수준이다.

Design Intent:

- 사용자는 실수로 배치한 Node/Bit를 빠르게 되돌릴 수 있어야 한다.
- Undo는 placed card 자체의 우측에 붙어 있어야 한다.

Main Implementation Target:

- Staged Node/Bit에서 온 배치:
  - Undo 시 해당 item을 Staging section으로 되돌린다.
  - 실제 생성된 Node/Bit는 제거되거나 creation transaction이 rollback되어야 한다.
- Direct row drop에서 온 배치:
  - Undo 시 원래 Breakdown row로 돌아간다.
  - row consumed state를 해제한다.
- Undo 가능 기간과 page/session lifecycle을 정책으로 확정해야 한다.

Do Not Carry Over:

- 단순 배열 filter로 placed item만 제거하고 source state를 복원하지 않는 방식
- Undo 출처를 구분하지 않는 model

## Preview / Prototype 검토 UI

### P1. Sidebar theme switcher

Prototype Observation:

- 2-3 worktree의 `src/components/layout/sidebar.tsx`에는 prototype route에서 1-8 theme switcher가 있다.
- test mode toggle은 제거되었다.

Design Intent:

- 시안 검토자가 8개 theme를 빠르게 비교할 수 있어야 한다.

Main Implementation Target:

- main production에는 그대로 들어갈 기능이 아니다.
- 향후 prototype viewer나 internal design review tool이 필요할 때만 별도 관리한다.

Do Not Carry Over:

- production sidebar에 prototype theme switcher를 노출하는 방식
- test mode localStorage toggle

## Production 구현 시 우선순위 제안

### Phase A. 상태 모델과 interaction contract 정리

- Breakdown row lifecycle:
  - active
  - staged
  - placed/consumed
  - restored by undo
- Placement lifecycle:
  - dropped
  - pending confirmation
  - confirmed
  - newly placed
  - undone
- Archive lifecycle:
  - not ready
  - ready
  - dialog open
  - dialog canceled
  - archived
- Newly placed lifecycle:
  - created in current Inbox/Triage page session
  - persists across scratch/grid navigation
  - clears when leaving Inbox/Triage page

### Phase B. Component architecture 설계

주요 production touch point:

- `src/components/triage/triage-workspace.tsx`
- `src/components/triage/scratch-pool.tsx`
- `src/components/triage/breakdown-panel.tsx`
- `src/components/triage/staging-zone.tsx`
- `src/components/triage/hierarchy-explorer.tsx`
- `src/hooks/use-triage-dnd*`
- triage store 또는 page-level transient UI state

구현 전 검토할 점:

- Undo가 data mutation인지 optimistic UI rollback인지
- Newly placed state를 어디에 저장할지
- Archive ready 조건을 어떤 source of truth로 판단할지
- direct row drop에서 type selection을 dialog로 둘지 inline affordance로 둘지
- Grid item card에 `selected`, `newlyPlaced`, `pending`, `invalidTarget` 같은 view state를
  어떻게 조합할지

### Phase C. Visual system 반영

- Prototype의 theme-specific 장식은 production으로 그대로 옮기지 않는다.
- 대신 아래 시각 hierarchy는 유지한다.
  - Scratch Pool tools가 하나의 cohesive area처럼 보임
  - Selected Scratch Context가 row보다 강한 signature section임
  - staged row는 남아 있으나 de-emphasized됨
  - placed row는 Breakdown에서 사라짐
  - placement result는 실제 Node/Bit card처럼 보임
  - newly placed와 selected는 구분됨
  - archive는 Breakdown section-scoped completion moment임

## 누적 결정 Ledger

### D-001. Section label/header/chrome 부활

- Prototype: preview heading은 삭제, theme 내부 section chrome은 유지
- Main target: production에서도 주요 section의 header/chrome을 사용자 이해에 맞게 복원/강화
- Status: 확정

### D-002. Row time 제거, Scratch context time 유지

- Prototype: Breakdown row time은 제거, Selected Scratch Context에는 time/date metadata 유지
- Main target: row UI에서는 time을 숨기되, context와 sorting data에는 createdAt 개념 유지
- Status: 확정

### D-003. Staged row는 남고, placed row는 사라진다

- Prototype: staged row는 de-emphasized, placed row는 `visibleIdeas`에서 제외
- Main target: staged는 disabled/de-emphasized, consumed/placed는 active Breakdown list에서 제거
- Status: 확정

### D-004. Archive 조건

- Prototype: row가 모두 placed/consumed되고 staged node/bit가 없을 때 archive affordance 표시
- Main target: canArchive 조건도 같은 정책을 따라야 함
- Status: 확정

### D-005. Confirm/Yes 후 실제 Node/Bit card로 표시

- Prototype: placed indicator card를 제거하고 실제 Node/Bit card에 가까운 형태로 표현
- Main target: 실제 created Node/Bit를 Grid data 안에 표시
- Status: 확정

### D-006. Placed Node/Bit Undo

- Prototype: placed card 우측에 Undo 표시
- Main target:
  - staged source는 Staging으로 복구
  - direct row source는 Breakdown row로 복구
- Status: 확정, 구현 정책 상세화 필요

### D-007. Newly placed state lifecycle

- Prototype: scratch-scoped volatile state 허용
- Main target: Inbox page/session scoped transient UI state
- Status: 확정, main 구현 시 반드시 prototype과 다르게 적용

### D-008. 한국어 버전

- Prototype: 2-4 문서상 요구사항. 2-3 현재 코드에는 유지되어 있지 않음
- Main target: route 복제 대신 i18n/resource 기반
- Status: 필요, 세부 정책 미정

## Open Questions

1. main에서 Undo 가능 기간을 어떻게 제한할 것인가?
   - page session 동안
   - toast timeout 동안
   - archive 전까지
2. newly placed state가 여러 개 누적될 수 있는가?
   - 단일 latest item만 강조
   - page session 동안 여러 item 강조
3. direct row drop의 Node/Bit 선택 UI는 main에서 dialog로 유지할 것인가, column inline affordance로 바꿀 것인가?
4. Archive dialog는 기존 AlertDialog를 유지할 것인가, Breakdown section-scoped overlay로 교체할 것인가?
5. 한국어 버전은 Inbox/Triage 전체 i18n의 일부로 처리할 것인가, prototype-derived design preview 범위로만 둘 것인가?

## 다음 문서화 작업

이 draft 다음 단계에서는 아래를 보완한다.

1. 각 section별 production file touch point를 더 구체화한다.
2. 2-3 시안 commit별로 어떤 UX 결정이 들어갔는지 ledger에 연결한다.
3. main 구현을 위한 실제 task plan을 별도 문서로 작성한다.
4. task plan 작성 시 이 문서를 source of truth로 사용한다.
