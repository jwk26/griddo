# Inbox/Triage 2-3 시안의 Main 승격 결정

## Metadata

- Created: 2026-07-13
- Updated: 2026-07-14
- Readiness: review-ready — second-pass local user-flow audit complete
- Category: product decision, interaction decision, visual-reference adoption
- Source project: `griddo2-claude`
- Source topic: `2026-06-25-inbox-triage-theme-surface-redesign`
- Functional baseline: `griddo2-claude` commit `48af728e872217a340c0d02ac5bec58e3ea09c36`
- Design source: `griddo2-claude-themes2-3` commit `4f39709688ceb4cac5e15d4e3502186b1f1c801b`
- Source prototype routes: `src/app/prototype/inbox-triage-*/page.tsx`의 8개 최종 route
- Tags: inbox, triage, prototype-promotion, themes, dnd, placement, archive

## Summary

2-3 시안에서 확정한 Inbox/Triage의 사용자 흐름, 상태 표현, 테마별 시각 위계를
main production 구현으로 승격한다.

2-3 시안은 디자인 및 상호작용 결과의 근거다. 중복 route, local mock state,
임시 데이터 변환, inline style 같은 구현 방식은 승격 대상이 아니다. main에서는
기존 데이터 모델, store, hook, 공용 컴포넌트와 접근성 규칙 위에서 같은 경험을
production-quality 구조로 다시 구현한다.

이 문서는 main 중심의 최종 목표를 기록한다. 실제 2-3 코드와 main 코드의 비교
근거, 시안 전용 구현, 문서 간 충돌 및 후속 작업은 `NOTES.md`에 기록한다.

## Authority And Supersession

- `2026-04-28-inbox-triage-workspace/DECISION.md`의 4영역 작업 공간, Scratch별
  Breakdown/Staging 소유권, placement confirmation, archive lifecycle은 기반 결정으로
  유지한다.
- 이 문서는 `2026-05-28-inbox-triage-theme-variants/DECISION.md`의 visible section
  label 제거와 compact Selected Scratch Context 결정을 해당 범위에서 대체한다.
- 현재 `SPEC.md`, `DESIGN_TOKENS.md`,
  `docs/recipes/inbox-triage-batch2-visual-recipe.md`에 남은 label 제거 및 compact
  context 지시는 amendment 과정에서 이 문서에 맞게 갱신한다.
- `PROTOTYPE_FUNCTION_GAP_2_4.md`와 `PROTOTYPE_TO_MAIN_HANDOFF.md`의 과거 내용은
  각각 Git commit `48af728`, `25ffe0d`에 보존되어 있으며 현재 authority가 아니다.
  실제 최종 2-3 시안 또는 이 문서와 충돌하면 이 문서가 우선한다.

## Promotion Boundary

### 이번 Main 승격 범위

- 4영역 Inbox/Triage 화면의 기존 비율과 작업 흐름 보존
- visible section label/header/chrome 복원
- Scratch Pool 검색, 정렬, 접기 및 compact switching 정리
- Selected Scratch Context를 signature section으로 승격
- Breakdown row 정리와 active/staged/consumed 상태 계약 변경
- Staging의 Node/Bit 구조와 drop-back 흐름 정리
- Grid Explorer의 검색, 경로, drop constraint, staged/direct placement 흐름 정리
- 실제 Node/Bit card 기반 newly placed 상태와 source-aware Undo
- Breakdown section 범위의 completion/archive 흐름
- 8개 테마별로 검증된 정보 위계와 시각적 역할 반영

### 후속 탐색 및 별도 승격 범위

- main 공용 `BitCard`의 8개 테마별 표현 강화
- 갱신된 공용 Node/Bit surface를 Staging과 placed/newly placed card에 재사용하는 작업
- 한국어 resource, EN/KR 전환, 한국어 section label 및 테마별 한글 typography
- Neumorphism ASC/DESC control의 투명 물방울 렌즈 표현

후속 범위는 이번 승격의 사용자 흐름을 막지 않는다. 이번 승격에서는 현재 main의
공용 Node/Bit surface를 사용하되, Staging과 placed item이 나중에 갱신된 공용
surface를 소비할 수 있도록 역할과 상태를 분리한다.

## End-To-End User Flow

1. 사용자는 Inbox/Triage에 진입한다. 같은 app session의 마지막 active Scratch를 복원하고,
   복원할 수 없으면 현재 Pool 정렬의 첫 active Scratch를 자동 선택한다.
2. Scratch Pool에서 제목 검색과 생성일 기준 정렬을 사용할 수 있다. Breakdown에
   첫 printable key를 입력하면 Pool이 자동으로 접힌다.
3. Breakdown 상단의 Selected Scratch Context가 현재 작업 대상을 명확히 보여준다.
4. 사용자는 Scratch를 여러 Breakdown row로 분해하고 row를 편집하거나 삭제한다.
5. row를 Staging으로 보내 Node 또는 Bit 후보로 만들거나, row를 Grid Explorer로
   직접 드래그한다.
6. Staging 후보는 Grid target에 drop한 뒤 placement affordance에서 확인한다.
   Direct row는 먼저 Node/Bit 유형과 target path를 확인한 뒤 별도의 placement
   affordance로 진행한다.
7. Confirm 후 실제 Node/Bit가 생성되고, 원래 Breakdown row는 active list에서
   소비되어 사라진다.
8. 방금 생성된 실제 Node/Bit card는 페이지를 떠날 때까지 newly placed 상태와
   Undo를 제공한다.
9. 모든 row가 소비되고 Staging이 비면 Breakdown section에 archive affordance가
   자동으로 열린다. Cancel하면 완료 상태와 다시 열기 control이 남고, OK하면
   Scratch를 archive하여 Inbox에서 제거한다.

## Common Surface Contract

### Layout

- 기존 4영역 구성을 유지한다: Scratch Pool, Breakdown, Staging, Grid Explorer.
- 기반 결정의 비율을 유지한다: main work area 상/하 `60/40`, 상단 Breakdown/Staging
  `60/40`, Staging Node/Bit `35/65`.
- 새로운 기능을 이유로 panel 전체를 재설계하거나 8개 테마를 동일한 generic card
  구조로 통일하지 않는다.

### Section Identity

- `Scratch Pool`, `Breakdown`, `Staging` 및 Grid 계열 section label/header/chrome을
  visible UI로 복원한다.
- label은 단순 개발자 표식이 아니라 영역의 역할, 상태, 범위를 읽게 하는 theme
  chrome의 일부다.
- 기본 Grid 이름은 `Grid Explorer`다. 확정된 테마별 표현은 다음과 같다.
  - Tiny Desk: `Library Index`
  - Retro Mac: `Finder`
  - Terminal: `GRID EXPLORER`
- 접근성 이름과 내부 component 용어는 의미적으로 `Grid Explorer`를 유지한다.
- `L1`, `L2`, `L3`, `Home-L3`, `H1-L3` 같은 축약형은 사용자 UI에 노출하지 않는다.

### Scrolling

- 스크롤 기능과 keyboard scrolling은 유지한다.
- visible scrollbar chrome은 아래 영역에서 숨긴다.
  - Scratch Pool list
  - Breakdown row list
  - Staging Node 영역
  - Staging Bit 영역
  - Grid Explorer의 각 column

### Theme Realization

- 8개 테마는 동일한 정보 구조와 interaction contract를 공유한다.
- surface, typography, border, radius, shadow, texture, control, motion은 각 테마의
  기존 언어로 실현한다.
- Selected, staged, invalid target, pending confirmation, newly placed, completed는
  서로 다른 의미를 갖는 상태다. 하나의 공통 색상 또는 opacity만으로 합치지 않는다.
- newly placed 표현에는 반복적인 깜빡임 또는 flicker를 사용하지 않는다.

### Theme And Locale Switching

- Inbox/Triage 안의 Theme 또는 EN/KR 전환은 presentation 변경이다. Scratch 전환, route 이탈,
  mutation Cancel 또는 새 page session으로 취급하지 않는다.
- Selected Scratch, Pool expanded/collapsed와 search, Breakdown Add/Edit draft, Grid path/search/reveal,
  열린 Placement·Archive affordance, pending/reconciling operation, Newly Placed marker와 Undo를 그대로
  유지한다. 전환을 이유로 저장, 취소, 재조회 또는 navigation을 자동 실행하지 않는다.
- 열려 있는 surface는 같은 state와 operation ID를 유지한 채 새 theme token과 locale copy를 즉시
  적용한다. 사용자가 작성한 Scratch/row content와 input draft는 번역하거나 교체하지 않는다.
- Theme/locale toggle로 focus가 이동하는 것은 inline Edit의 일반 valid-blur auto-save에 대한 명시적
  예외다. Editor와 dirty draft를 열린 상태로 유지하고 toggle activation만 실행한다. Focus는 실행한
  toggle에 남기며 editor로 강제 복귀시키거나 draft 이탈 confirmation을 열지 않는다.
- Theme/locale 전환은 Grid search reveal 또는 DnD interrupted query, Newly Placed page-session 상태의
  종료 조건이 아니다. Pending write는 같은 operation을 계속하며 전환 뒤 중복 mutation을 시작하지
  않는다.

## Scratch Pool

### Selection Lifecycle

- 같은 app session에서 Inbox/Triage route를 떠났다가 다시 진입하면 마지막으로 선택한 Scratch가
  여전히 active인 경우 해당 selection을 복원한다.
- app session의 첫 진입이거나 이전 selection이 archived/deleted되어 복원할 수 없으면, 현재
  Scratch Pool sort direction에서 첫 번째 active Scratch를 자동 선택한다. 기본 DESC에서는 가장
  최근 Scratch가 선택된다.
- 이 자동 fallback은 title search filter 밖의 active Scratch를 숨은 상태로 선택하기 위한 규칙이
  아니다. 첫 진입과 재진입 시 Pool search query는 별도 lifecycle 정책을 따르며, selection fallback은
  active Pool의 정렬 순서를 기준으로 계산한다.
- active Scratch가 하나도 없으면 `selectedScratchId`를 `null`로 유지하고 Inbox empty state를 표시한다.
- 자동 selection은 data context만 설정하며 keyboard focus를 강제로 Scratch row나 Selected Scratch
  Context로 이동하지 않는다.
- selection ID는 Scratch record, `localStorage`, IndexedDB 또는 remote DB에 preference로 저장하지
  않는다. Browser reload와 새 browser/app session에서는 이전 selection을 복원하지 않고 위 첫 진입
  fallback을 다시 적용한다.
- Archive 성공 직후에는 `Confirm Archive`의 next-visible/previous-visible selection 규칙이 이 일반
  fallback보다 우선한다.

### Selected Scratch External Removal

- 현재 selected Scratch가 다른 tab/session의 mutation으로 archived 또는 deleted되면 stale Scratch
  surface에서 interaction을 계속 허용하지 않는다. Scratch lifecycle에 맞춰 `해당 Scratch가 다른
  곳에서 아카이브되었습니다` 또는 `삭제되었습니다`라는 modal 안내와 자동 이동 countdown을 표시한다.
- Countdown이 끝나면 현재 Scratch Pool search와 sort를 보존한 채 사라진 Scratch의 다음 visible
  Scratch, 없으면 이전 visible Scratch로 이동한다. Search result에 visible Scratch가 없으면 query 밖의
  hidden Scratch를 자동 선택하지 않고 no-selection/search-empty 상태를 표시한다.
- 전체 active Scratch가 없으면 selection을 `null`로 두고 Inbox empty state로 이동한다. 이 external
  removal flow는 local Archive 성공의 next/previous ordering과 같은 visible-order 원칙을 사용한다.
- Modal은 5초 countdown과 `지금 이동`, `자동 이동 일시정지` control을 제공한다. 일시정지 뒤에는 같은
  control을 `자동 이동 계속`으로 바꾸며, 사용자가 계속하거나 즉시 이동할 때까지 modal을 유지한다.
- Scratch가 이미 active lifecycle에서 사라졌으므로 modal을 닫고 stale 작업 surface로 돌아가는 Cancel은
  제공하지 않는다. Modal이 떠 있는 동안 사라진 Scratch를 Edit, Add, Stage, Place 또는 Archive하지 않는다.
- Message는 lifecycle과 destination을 함께 표시한다. 예를 들어 `해당 Scratch는 다른 곳에서
  삭제되었습니다. 5초 후 “다음 Scratch 제목”으로 이동합니다.`처럼 쓰고, target이 없으면 Inbox
  no-results 또는 empty state로 이동한다는 사실을 직접 표시한다.
- Countdown의 남은 초는 시각적으로 갱신하되 `aria-live`로 매초 반복하지 않는다. Modal open 시
  lifecycle 변경과 자동 이동 시간을 한 번 알리고, keyboard 사용자가 즉시 멈출 수 있도록 pause control을
  안정적인 초기 action으로 제공한다.
- Non-empty Breakdown Add draft, dirty Scratch title Edit 또는 dirty Breakdown row Edit처럼 사라진
  Scratch에 속한 미저장 text가 하나라도 있으면 countdown을 처음부터 paused 상태로 연다. 저장할 수 없는
  이유를 직접 설명하고 사용자가 `자동 이동 계속` 또는 `지금 이동`을 명시적으로 선택하기 전에는 이동하지
  않는다.
- Modal은 각 draft를 `새 아이디어 초안`, `Scratch 제목 편집`, `Breakdown row 편집`처럼 source별로
  구분하고 전체 text를 복사할 수 있는 control을 제공한다. 여러 draft가 함께 존재하면 각각 독립적으로
  확인하고 복사할 수 있어야 하며, visual preview의 truncation이 clipboard content를 줄이지 않는다.
- Copy 성공 또는 실패는 modal 안의 non-blocking status로 알리고 focus를 유지한다. 복사 성공만으로
  countdown을 재개하지 않으며, draft를 `localStorage`, IndexedDB 또는 remote DB에 자동 보관하지 않는다.
- 사용자가 이동을 계속하거나 즉시 이동하면 해당 stale Scratch의 page-local draft를 정리한다. 실제
  이동 전에 복사 기회를 제공하되, 삭제된 record에 draft를 자동 저장하거나 새 Scratch로 옮기지 않는다.
- External archive 뒤 같은 Scratch가 countdown 중 다시 active 상태로 restore되면 countdown과 예정된
  navigation을 즉시 취소하고 modal을 닫는다. 원래 Scratch selection과 아직 client memory에 남아 있는
  Add/Edit draft를 유지하고 작업을 계속할 수 있다는 non-blocking status를 표시한다.
- 이 복귀 규칙은 archive 후 restore에만 적용한다. Hard delete/tombstone 상태를 local 추정으로 되살리거나
  비슷한 title의 다른 Scratch를 같은 record로 취급하지 않는다.
- Countdown 중 표시된 destination이 archive/delete되거나 current search/sort의 visible order에서
  달라지면 최신 Pool 기준 next-visible/previous-visible target을 다시 계산하고 modal message를 갱신한다.
  Running countdown은 5초로 다시 시작하며 사용자가 이미 pause했다면 paused 상태를 그대로 유지한다.
- `지금 이동` 실행 또는 countdown 종료 직전에도 destination의 active lifecycle과 현재 filter visibility를
  다시 검증한다. Stale ID로 이동하지 않으며 visible target이 없으면 최신 상태에 따라 no-selection
  search-empty 또는 Inbox empty destination으로 전환한다.

### Expanded Structure

- Scratch Pool은 상단 tools region과 하단 Scratch list의 두 구조로 읽혀야 한다.
- tools region 안에서 identity/icon, item count, collapse control, search, sort가 하나의
  cohesive area를 이룬다.
- search input과 sort control은 같은 줄에 둔다.
- header와 collapsed state의 item count는 search query와 무관한 전체 active Scratch 수를 표시한다.
  archived Scratch는 제외하며, 검색 중에도 count의 의미를 filtered result 수로 바꾸지 않는다.
- search가 활성화되면 search 영역 안에 별도의 filtered result count를 표시한다. 예를 들어 active
  Scratch가 12개이고 result가 3개면 header/collapsed count는 `12`, search status는 `3 results`를
  나타낸다. 평상시에는 불필요한 `12/12` 표현을 추가하지 않는다.
- sort는 Scratch `createdAt` 기준 newest-first/oldest-first를 전환하며 현재 상태가
  항상 보인다.
- Scratch Pool sort direction은 전체 Pool에 적용되는 device-local UI preference다. Scratch별
  record나 server data에 저장하지 않으며 기본값은 DESC/newest-first다.
- Scratch list row는 title과 `createdAt` metadata를 유지한다. Breakdown row의 time
  제거 정책을 Scratch list에 적용하지 않는다.

### Collapsed Structure

- collapsed 상태의 모든 control은 세로로 배치한다.
- 최소 구성은 다음 순서를 따른다.
  - Inbox identity/icon + 전체 active Scratch exact count
  - expand/collapse control
  - Scratch conversion/switching controls
- 각 Scratch switcher에는 visible title이 없어도 접근 가능한 이름이 있어야 한다.
- selected switcher는 inactive switcher보다 길이, 대비 또는 테마별 marker로 명확히
  구분한다.
- collapsed 상태에는 search와 sort를 표시하지 않는다.
- search query가 있는 상태에서 collapse해도 collapsed switcher에는 보이지 않는 filter를 적용하지
  않고 모든 active Scratch를 표시한다. Header count와 collapsed count도 전체 active Scratch 수를
  유지한다.

### Collapse Interaction

- Scratch를 선택하거나 Breakdown에 단순 focus/click하는 것만으로 Pool을 접지 않는다.
- Scratch가 선택된 상태에서 Breakdown에 첫 printable key를 입력할 때 자동으로 접는다.
- 사용자가 현재 Scratch 작업 중 Pool을 수동으로 다시 펼치면 같은 Scratch session에서는
  자동 접기를 반복하지 않는다. 다른 Scratch를 선택하면 이 예외를 초기화한다.
- 수동 expanded/collapsed 상태는 같은 app session의 일시적 UI state로 유지한다. Inbox/Triage
  route를 떠났다가 같은 app session에서 다시 진입하면 직전 상태를 복원한다.
- 사용자가 자동 collapse 뒤 수동으로 다시 펼쳐 설정된 auto-collapse 예외도 같은 app session에서
  해당 Scratch가 계속 선택되어 있는 동안 유지한다. 다른 Scratch를 선택하면 기존 규칙대로 예외를
  초기화한다.
- Browser reload 또는 새 browser/app session에서는 Pool을 expanded 상태로 시작하고 위
  auto-collapse 예외도 초기화한다. expanded/collapsed 상태와 예외를 Scratch record,
  `localStorage`, IndexedDB 또는 remote DB에 저장하지 않는다.
- Collapse는 search 작업을 종료하지 않는 presentation 변경이다. Current query, filtered result
  문맥과 result-list scroll anchor를 page state에 보존하고, 다시 expand하면 최신 data로 계산한 같은
  query의 결과와 이전 scroll 문맥을 복원한다.
- Expand 후 keyboard focus는 사용자가 실행한 expand control에 유지한다. Search input으로 강제
  이동하지 않는다.
- 2-3 Sidebar의 Scratch Pool lock/unlock toggle은 개발·시안 검토용 control이다. Main 이식 시
  삭제하고 production preference나 사용자 설정으로 대체하지 않는다.

### Search Lifecycle

- Scratch Pool title search의 current query, filtered result context와 result-list scroll은 같은
  app session의 일시적 UI state다. Inbox/Triage route를 떠났다가 같은 app session에서 돌아오면 최신
  active Scratch data로 같은 query를 다시 계산하고 이전 scroll context를 복원한다.
- Route 재진입 시 Pool이 collapsed 상태면 query를 내부에 유지하되 collapsed switcher에는 hidden filter를
  적용하지 않는다. 다시 expand하면 보존된 query의 최신 result와 scroll context를 표시한다.
- 복원된 selected Scratch가 query와 일치하지 않아 result에서 숨겨져도 selection과 Selected Scratch
  Context를 유지하고 Pool search 영역에 현재 Scratch가 검색 결과에서 숨겨졌다는 concise status를
  표시한다. Query 밖의 다른 Scratch로 자동 전환하지 않는다.
- Browser reload 또는 새 browser/app session에서는 Scratch Pool query와 result scroll을 초기화한다.
  Query를 Scratch record, `localStorage`, IndexedDB 또는 remote DB에 저장하지 않는다.

## Breakdown

### Selected Scratch Context

- Selected Scratch Context는 Breakdown heading의 meta가 아니라 row list 위에 놓이는
  독립된 signature section이다.
- 일반 Breakdown row와 동일한 작은 strip 또는 card로 만들지 않는다.
- 높이는 일반 row의 약 `2~2.5배`를 기준으로 하며, section 전체 비율을 무너뜨리지
  않는 범위에서 테마의 첫인상을 전달한다.
- 항상 다음 정보를 포함한다.
  - selected Scratch title
  - Scratch 생성 date/time metadata
  - always-visible Edit control
  - Breakdown row의 ascending/descending sort control
- Breakdown heading 우측에 중복되던 selected Scratch title/meta는 제거한다.
- Context의 Edit는 Scratch 자체를 편집하는 action이며 row Edit와 구분한다.
- completion 상태에서는 같은 surface가 테마별 `Scratch complete` 표현으로 전환된다.

### Breakdown Row

- row numbering과 row date/time text를 표시하지 않는다.
- drag activation은 grip-only를 유지한다.
- Edit와 Trash control은 hover에 의존하지 않고 항상 보인다.
- row 정렬은 Selected Scratch Context 안의 ASC/DESC control로 조작한다.
- Breakdown ASC/DESC는 row content의 알파벳순이나 별도 manual order가 아니라 내부 `createdAt`을
  기준으로 한다. 기본값은 DESC/newest-first이며 ASC는 oldest-first다. time metadata는 정렬에
  사용하되 row UI에는 다시 표시하지 않는다.
- 동일한 `createdAt`에는 `order`, 그래도 같으면 stable `id`를 tie-breaker로 사용하여 render 또는
  realtime refresh마다 같은 row의 순서가 흔들리지 않게 한다.
- Breakdown sort direction은 모든 Scratch에 공통으로 적용되는 별도의 device-local UI preference다.
  Scratch Pool sort와 독립적으로 저장하며 기본값은 DESC/newest-first다.
- 두 sort preference는 Scratch 전환, theme/locale 전환, 앱 내부 route 이동과 reload 후에도 유지한다.
  Scratch/Breakdown content record와 향후 BaaS에는 기록하지 않으며, local preference가 없거나
  유효하지 않으면 각 기본값으로 fallback한다.
- 하단 add input은 명시적인 submit/add control을 갖고, Enter 연속 입력 흐름과 focus
  유지 동작을 보존한다.
- row 생성 성공 후 input을 비우되 focus는 input에 유지한다. 현재 DESC이면 내부 row list를 새 row가
  있는 맨 위로, ASC이면 맨 아래로 scroll한다. page 전체나 Breakdown panel 자체를 이동하지 않는다.
- 새 row에는 기존 card 구조를 바꾸지 않는 짧은 일회성 theme-specific signal을 적용한다. 기존 theme
  token을 사용한 shadow, highlight 또는 한 번의 가벼운 반짝임 범위로 제한하고 반복 blink/pulse나
  화려한 신규 effect를 사용하지 않는다. exact effect와 duration은 Breakdown row visual recipe가
  theme별로 소유한다.
- reduced-motion preference에서는 이동·반짝임 animation을 줄이거나 제거하고 정적인 shadow/contrast
  변화로 같은 추가 상태를 전달한다. visual signal과 별도로 `aria-live="polite"` status로 row 추가
  성공을 알리며 announcement가 input focus를 탈취하지 않는다.
- add 실패 시 draft와 input focus를 유지하고 list를 scroll하거나 성공 signal을 표시하지 않는다.
- Enter 또는 explicit Add를 누르면 현재 draft를 하나의 idempotent add operation으로 snapshot한다.
  저장 중에는 input과 Add를 잠그고 `추가 중` 상태를 표시하며, Enter, Add 또는 blur가 다시 발생해도
  같은 draft를 중복 제출하지 않는다.
- Add input이 blur되어도 새 row를 생성하거나 draft를 폐기하지 않는다. blur는 pointer로 다른 control을
  클릭하거나 Tab으로 focus를 이동해 input이 focus를 잃는 경우를 뜻한다. 사용자가 input으로 돌아오면
  같은 page session의 draft를 계속 편집할 수 있다.
- 새 row 생성은 Enter 또는 explicit Add로만 시작한다. Inline Edit의 유효한 blur auto-save 계약을
  새 record를 만드는 Add input에 적용하지 않는다.
- non-empty Add draft가 있어도 같은 Scratch 안의 Breakdown, Staging, Grid interaction은 허용하고
  draft를 유지한다. theme/locale 전환처럼 같은 Inbox 작업 상태를 보존하는 변경도 draft를 지우지 않는다.
- non-empty Add draft가 있어도 Selected Scratch title 또는 기존 Breakdown row의 inline Edit을
  시작할 수 있다. Add draft와 inline Edit draft는 서로 독립된 page-session state이며, Edit의 Save,
  Cancel, Escape, blur save 또는 실패가 Add draft를 변경하거나 제출하지 않는다.
- 두 draft가 함께 존재할 수 있지만 keyboard focus는 현재 조작 중인 한 editor에만 둔다. Inline Edit을
  닫아도 Add input으로 focus를 강제 이동하지 않으며, 사용자가 Add input으로 돌아오면 기존 draft를
  계속 편집한다.
- 다른 Scratch 선택 또는 앱 내부 route 이동처럼 현재 Add input을 제거하는 action에는
  `계속 작성`과 `초안 버리고 이동` confirmation을 제공한다. 계속 작성은 이동하지 않고 input focus로
  복귀하며, 폐기는 draft를 지운 뒤 원래 요청한 action을 한 번만 실행한다.
- dirty inline Edit과 non-empty Add draft가 동시에 있을 때 Scratch 전환 또는 route 이동을 요청하면
  inline Edit의 save-before-next-action contract를 먼저 완료한다. Save 성공 뒤 Add draft 이탈
  confirmation을 열며, Save 실패나 conflict면 Add confirmation과 navigation을 시작하지 않는다.
- 이 confirmation은 draft를 자동 Add하거나 `저장 후 이동`을 암묵적으로 수행하지 않는다. confirmation이
  열린 동안 추가 navigation intent를 queue에 쌓지 않는다.
- dirty Add draft가 있는 browser reload/tab close에는 native unload confirmation을 사용한다. draft를
  LocalStorage, IndexedDB 또는 remote DB에 별도로 저장하지 않으며 이탈 후 복원하지 않는다.
- 한 번에 하나의 add operation만 실행한다. 성공 전 input을 낙관적으로 비우거나 여러 draft를
  in-memory queue에 쌓지 않으며, optimistic row를 먼저 표시한 뒤 실패 시 제거하지 않는다.
- Dexie에서는 현재 Scratch lifecycle 확인, 다음 `order` 계산과 row 생성을 하나의 read-write
  transaction으로 처리한다. 향후 PostgreSQL 기반 BaaS에서는 client operation ID와 unique
  idempotency key를 사용하여 동일 submit의 중복 생성을 막는다.
- 명시적 실패 또는 offline이면 같은 draft와 logical input focus를 유지하고 Retry를 제공한다.
  timeout 또는 connection loss이면 operation ID와 생성 결과를 재조회하며, 성공이면 한 번만 clear,
  scroll과 success signal을 실행하고 미실행이면 Retry를 허용한다.
- 결과가 불명확한 동안에는 input을 pending/reconciling state로 유지하고 같은 content가 존재한다는
  이유만으로 성공을 추정하거나 새 add operation을 보내지 않는다.

### Scratch And Row Editing

- Selected Scratch Context의 Edit는 Scratch title만 변경한다. 생성일과 description, icon,
  priority, deadline은 Inbox/Triage 편집 범위에 포함하지 않는다.
- Breakdown row Edit는 해당 row content만 변경한다.
- 두 Edit는 기존 Context와 row surface 안에서 inline editor로 전환한다. generic dialog나
  prototype의 visual-only button을 그대로 복사하지 않는다.
- 명시적 Save는 저장하고 Cancel/Escape는 원래 값으로 복원한다. 유효한 draft로 blur되면
  자동 저장하며, 빈 값은 editor와 validation을 유지한다.
- 값이 바뀌지 않았으면 write 없이 종료한다. 저장 실패 시 draft와 editor를 유지하고 오류를
  표시한다.
- 비동기 Save 중에는 editor와 draft를 화면에 유지하고 같은 surface에 saving state를 표시한다.
  input, Save, Cancel, Edit, Trash와 DnD를 잠가 중복 mutation과 취소 race를 막는다.
- Save 성공을 확인한 뒤에만 editor를 닫거나 pending intent를 실행한다. 실패하면 같은 draft와
  logical editor focus를 복원하며 optimistic close 후 editor를 다시 생성하는 방식을 사용하지 않는다.
- timeout이나 connection loss로 응답을 받지 못한 Save는 즉시 실패 또는 성공으로 단정하지 않고
  `저장 결과 확인 중` 상태로 전환한다. editor와 draft는 그대로 유지한다.
- 최신 record를 다시 조회하여 intended value와 증가한 version이 확인되면 성공으로 마무리하고,
  base version/value가 그대로면 Retry를 제공한다. 다른 value 또는 lifecycle state가 확인되면 기존
  inline conflict/invalidation flow로 전환한다.
- 결과 확인 없이 동일 mutation을 즉시 재전송하거나 editor를 무기한 saving state에 잠그지 않는다.
- Save 시작 전 offline이 확인되거나 결과 확인 재조회도 불가능하면 editor 잠금을 해제하고
  `오프라인, 저장되지 않음` 상태와 명시적 Retry를 제공한다. draft는 현재 session에서 계속 편집할
  수 있다.
- 연결 복구는 Retry 가능 상태만 알리며 자동 Save, 자동 pending intent 실행 또는 durable offline
  mutation queue를 시작하지 않는다. pending intent는 보존하고 사용자가 Retry한 Save가 성공한 뒤에만
  실행한다.
- Scratch 전환, 다른 Edit, Archive, 앱 내부 route 이동은 현재 edit 저장이 성공한 뒤
  실행한다. 실패하면 요청한 후속 action을 실행하지 않는다.
- 위 action을 요청한 뒤 Save가 실패하거나 conflict가 발생하면 한 개의 pending intent로 보존하고
  현재 editor surface에 머문다. 어떤 action이 대기 중인지 표시하며, 해결 중에는 추가 후속 action을
  받거나 queue에 누적하지 않는다.
- 사용자가 `내 편집 사용` 또는 `최신 값 사용`으로 conflict를 해결하고 저장 조건이 충족되면 pending
  intent를 자동 실행한다. 사용자는 pending intent만 취소하고 현재 editor에서 계속 작업할 수 있다.
  pending intent를 취소해도 local draft를 자동 취소하거나 저장하지 않는다.
- row를 edit하거나 save하는 동안 grip과 DnD를 disabled 처리한다. Save 또는 Cancel 이후에만
  새 drag를 시작할 수 있다.
- 편집 중인 동일 row의 Trash는 disabled 처리하며 Save 또는 Cancel 후에만 삭제할 수 있다.
- 다른 row의 Trash를 요청하면 현재 편집 내용을 먼저 저장하고, 성공한 경우에만 대상 row의 기존
  delete confirmation을 연다. 저장 실패나 conflict가 발생하면 삭제 confirmation을 열지 않고
  원래 요청을 실행하지 않는다.
- staged row는 edit할 수 없다. 먼저 Staging에서 제거하여 source row를 active 상태로 복원한다.
- Archive overlay가 열려 있을 때는 Scratch Context Edit를 차단한다. Cancel 후의 theme-specific
  `Scratch complete` Context에서는 Archive 전까지 title을 편집할 수 있다.
- Scratch title은 identifier가 아니므로 duplicate title을 허용한다.
- Scratch Pool search 중 title 수정으로 selected Scratch가 query와 일치하지 않게 되면 filter를
  엄격히 유지하여 해당 row를 result에서 제외한다. Selected Scratch Context는 유지하고 Pool에는
  현재 Scratch가 search result에서 숨겨졌다는 concise status를 표시한다.

#### Concurrent Edit Conflict

- Scratch title과 Breakdown row 저장은 last-write-wins가 아니라 optimistic concurrency control을
  사용한다.
- editor 진입 시 `{record id, 원래 editable value, revision, lifecycle state}`를 base snapshot으로
  캡처한다. 이 snapshot은 현재 editor의 client memory에만 존재하며 `localStorage`, IndexedDB 또는
  remote DB에 별도 record로 저장하지 않는다.
- persisted record에는 단조 증가하는 `version`을 두고, Save는 `id + base version + 저장 가능한
  lifecycle state`가 모두 일치할 때만 value와 version을 원자적으로 갱신한다.
- 현재 값이 외부에서 변경된 경우 자동 overwrite하지 않고 `내 편집 사용`과 `최신 값 사용`을
  선택할 수 있는 conflict state를 표시한다. `내 편집 사용`은 사용자가 확인한 최신 version을
  기준으로 다시 conditional save한다.
- editor가 열린 동안 외부 text 변경을 감지하면 local draft와 focus를 유지하고, 같은 surface에
  비차단 `다른 곳에서 변경됨` 상태를 즉시 표시한다. 사용자는 편집을 계속할 수 있으며 실제
  resolution은 Save 시점에 수행한다. Realtime 알림을 받지 못한 경우에도 conditional Save가
  conflict를 최종 검출한다.
- editor가 pristine이고 IME composition 중이 아니라면 외부의 최신 value와 version을 자동 수용하고
  focus를 유지한다. 짧은 `최신 변경사항 반영됨` 상태만 알리며 conflict resolution을 요구하지 않는다.
  local 변경이 하나라도 있거나 IME composition 중이면 자동 교체하지 않고 draft 보호 경로를 사용한다.
- conflict resolution은 global 또는 Breakdown-wide modal을 열지 않고 기존 Scratch Context/Row
  editor surface 안에서 처리한다. editor 아래에 latest value preview와 `내 편집 사용`,
  `최신 값 사용` action을 표시하며, local draft와 editor focus를 보존한다.
- conflict resolution이 열린 동안 외부 변경이 다시 발생하면 같은 inline surface의 latest value와
  base version만 갱신한다. resolver를 중첩하거나 draft를 초기화하지 않는다.
- row가 외부에서 staged, consumed 또는 deleted되었거나 Scratch가 archived/deleted된 경우에는
  stale draft로 source of truth를 되살리지 않는다. Save를 차단하고 최신 상태를 반영하되, 사용자가
  작성한 draft는 현재 conflict UI에서 확인하거나 복사할 수 있게 유지한다.
- 위 lifecycle invalidation은 단순 text conflict와 달리 감지 즉시 editor를 invalid state로 전환하고
  Save를 disabled 처리한다. 진행 중인 한글 IME composition과 draft text를 강제로 교체하거나
  conflict dialog로 focus를 탈취하지 않는다.
- lifecycle invalid state도 같은 inline shell을 유지하되 editable control 대신 draft 확인, 복사와
  닫기 action만 제공한다. 별도 modal 또는 사라진 row를 되살린 일반 row UI로 표현하지 않는다.
- Edit 진입 시 해당 editor control로 focus를 이동한다. 일반 Save/Cancel 후에는 source surface가
  남아 있으면 원래 Edit control로 복귀한다.
- validation, 저장 실패와 text conflict에서는 editor focus를 유지한다. status는 적절한
  `aria-live` announcement로 전달하되 알림 자체가 focus를 탈취하지 않는다.
- pending intent가 성공하면 focus도 결과 destination으로 함께 이동한다. Scratch 전환은 새 Selected
  Scratch Context, 다른 Row Edit는 새 editor, Delete/Archive는 해당 confirmation의 안전한 기본
  action을 focus한다.
- lifecycle invalidation으로 source row가 사라지면 다음 surviving row로 이동하고, 다음 row가 없으면
  Breakdown add input을 fallback으로 사용한다. DOM을 제거한 뒤 browser default focus에 맡기지 않는다.
- Dexie 단계에서는 동일한 read-write transaction 안에서 current version/state를 읽고 비교한 뒤
  갱신한다. 향후 PostgreSQL 기반 BaaS에서는 같은 contract를 conditional `UPDATE` 또는 DB function으로
  옮긴다. Realtime subscription은 외부 변경 알림에 사용할 수 있지만 충돌 방지의 source of truth로
  사용하지 않는다.
- 이 snapshot은 crash/reload draft recovery 기능이 아니다. 비정상 종료 후 draft 복구가 필요하면
  별도 정책과 저장소를 설계한다.
- dirty editor 또는 save pending 상태에서 browser reload, tab/window close가 요청되면 native
  `beforeunload` confirmation을 표시한다. 이 경로에서 비동기 Save 완료를 가정하거나 시도하지 않는다.
- 사용자가 이탈을 취소하면 현재 editor와 draft를 그대로 유지한다. 이탈을 승인하면 미저장 draft는
  폐기되며, 이번 범위에서는 `localStorage`나 IndexedDB를 이용한 영구 draft recovery를 제공하지 않는다.
- custom confirmation 문구는 browser가 보장하지 않으므로 product copy에 의존하지 않는다. 앱 내부
  Scratch 전환과 route navigation은 이 browser fallback이 아니라 앞서 정의한 save-before-action
  contract를 사용한다.

### Row Lifecycle

- Active: 일반 row로 표시하며 편집, 삭제, drag가 가능하다.
- Deleting: Delete confirmation에서 확인한 뒤 저장 성공 전까지 기존 row를 같은 위치와 같은 기본
  surface로 유지한다. 별도 placeholder나 새로운 card로 바꾸지 않고 theme-specific한 낮은 대비,
  surface 또는 작은 status로 `삭제 중`임을 표현한다.
- Deleting row의 Edit, Trash, grip과 DnD를 잠가 중복 delete와 충돌 mutation을 막는다. Pending 상태는
  색상에만 의존하지 않고 visible status와 accessible state로도 전달한다.
- Delete 성공이 확인되기 전에는 row를 list에서 제거하거나 Empty Prompt 또는 Archive eligibility를
  먼저 갱신하지 않는다. 성공 후에만 row 제거와 최신 lifecycle 계산을 함께 반영한다.
- Delete operation이 pending 또는 결과 확인 중인 동안에는 다른 Scratch 선택과 앱 내부 route 이동을
  잠근다. 이동 요청을 pending intent로 저장하거나 성공 후 자동 실행하지 않고, 처리가 끝난 뒤 다시
  시도하라는 non-blocking status를 표시한다.
- Delete 결과가 확정되지 않은 browser reload/tab close에는 native unload confirmation을 적용한다.
  사용자가 page에 남으면 같은 pending row와 operation 확인을 계속하며, custom browser 문구에
  의존하지 않는다.
- Staged: list에 남기되, 테마별 de-emphasis와 disabled action으로 현재 Staging에
  있음을 표현한다. 취소선은 사용하지 않는다.
- Placed/Consumed: active Breakdown list에서 제거한다. 데이터는 production source of
  truth에 소비 상태로 남는다.
- Staging에서 제거하거나 Undo하면 원래 row가 active 상태로 복원된다.

### Row Delete Reliability

- Confirm된 Delete는 operation ID를 가진 idempotent mutation으로 실행한다. 같은 row의 Delete가
  pending 또는 reconciling인 동안 새 Delete operation을 시작하지 않는다.
- 명시적 실패가 확인되면 row를 원래 위치의 Active 상태로 복구하고 잠근 controls를 다시 활성화한다.
  Breakdown-local 오류를 표시하되 별도 Retry button은 만들지 않는다. 사용자가 다시 삭제하려면 기존
  Trash와 confirmation을 새로 실행한다.
- Timeout 또는 connection loss처럼 commit 여부를 알 수 없으면 row를 `삭제 결과 확인 중` 상태로
  유지하고 같은 operation ID의 결과와 authoritative row 존재 여부를 조회한다. 결과 확인 전에 Delete를
  재전송하거나 row를 Active로 낙관적으로 되돌리지 않는다.
- Delete 완료가 확인되면 row를 한 번만 제거하고 Empty Prompt와 Archive eligibility를 갱신한다.
  Operation이 실행되지 않았고 row가 여전히 active임이 확인되면 원래 row를 Active로 복구하고 실패
  안내를 표시한다.
- Offline 등으로 결과를 계속 확인할 수 없으면 mutation Retry가 아닌 `다시 확인` action을 제공한다.
  결과가 확정될 때까지 기존 deleting/reconciling control lock과 navigation guard를 유지한다.
- Delete 성공 후 focus는 현재 Breakdown sort에서 제거된 row의 다음 visible row, 다음이 없으면 이전
  visible row로 이동한다. 둘 다 없고 일반 Empty Prompt 상태면 Breakdown Add input을 사용한다.
- 마지막 row 제거로 Archive overlay가 열리면 사라진 Trash control의 안전한 fallback으로 overlay
  heading에 focus를 이동한다. 이는 source control이 DOM에서 제거된 경우의 focus 복구이며, 다른
  archive-ready 전환에서 현재 focus를 유지하는 일반 auto-overlay 규칙을 바꾸지 않는다.
- 명시적 실패로 row가 Active 상태로 복구되면 기존 Trash control로 focus를 돌린다. 사용자가
  `다시 확인`을 실행했는데 결과가 계속 불명확하면 해당 action에 focus를 유지한다.

### Empty Prompt

- 아직 row가 없는 Scratch와 모든 row가 소비된 Scratch를 구분한다.
- row를 만들었더라도 실제 consumed row 없이 모두 Trash로 삭제한 경우는 completion으로 취급하지
  않고 아이디어 추가 Empty Prompt로 돌아간다.
- archive overlay가 열려 있지 않은 빈 row list에는 다음 행동을 유도하는 theme-specific
  prompt를 표시한다.
- prompt의 문구와 장식은 테마별로 달라도 되지만, 빈 영역을 단순 blank로 두지 않는다.

## Staging

### Node And Bit Structure

- Staging header/chrome과 `Node`, `Bit` subsection label을 visible UI로 유지한다.
- Node는 grid/card 형태, Bit는 list/row 형태를 유지한다.
- 두 유형은 색상만이 아니라 shape와 내부 정보 구조로 구분한다.
- 빈 Staging에는 별도의 큰 placeholder card 또는 반복적인 empty label을 추가하지 않는다.
- Node와 Bit candidate는 각 subsection 안에서 `createdAt` 내림차순으로 정렬하여 가장 최근에
  staging된 항목을 맨 앞에 표시한다. 동일한 `createdAt`에는 안정적인 `id` tie-breaker를 사용한다.
- Staging 내부 수동 재정렬은 제공하지 않는다. candidate 순서는 Grid placement 결과나 hierarchy
  ordering을 의미하지 않는다.
- candidate 개수에는 별도의 표시 상한이나 staging 차단 한도를 두지 않는다. Node와 Bit subsection은
  현재 35/65 분할과 Staging 전체 높이를 유지한 채 각각 독립적인 내부 scroll container를 사용한다.
- visible scrollbar chrome은 숨기되 wheel, trackpad, touch와 keyboard scrolling은 유지한다. candidate
  증가로 Staging section이나 상위 panel의 높이를 늘리지 않는다.
- 현재 화면에서 사용자가 직접 staging한 candidate는 pending candidate가 나타나는 즉시 해당 Node/Bit
  subsection을 맨 위로 scroll하여 결과를 보여준다. 이 scroll은 focus를 옮기지 않는다.
- 다른 tab, 기기 또는 authoritative reconciliation에서 새 candidate가 동기화되면 사용자가 보고 있던
  scroll 위치를 유지한다. 사용자가 이미 subsection 맨 위를 보고 있지 않을 때만 해당 `Node` 또는
  `Bit` label 근처에 `새 항목 N개` indicator를 표시한다.
- indicator를 누르면 해당 subsection 맨 위로 이동하고 count를 지운다. 사용자가 직접 맨 위까지
  scroll해 새 항목을 확인한 경우에도 count를 지운다. 초기 hydration이나 Scratch 전환으로 기존
  candidate를 불러오는 경우는 새 항목 count에 포함하지 않는다.
- remote 신규 항목은 focus를 탈취하지 않고 polite `aria-live`로 알린다. indicator의 구체적인 surface는
  theme visual recipe에서 정하되 의미와 동작은 공통으로 유지한다.
- Node/Bit subsection label은 현재 시안의 `Nodes`와 `Bits` 명칭을 유지한다. visible pending을 포함한
  candidate가 2개 이상일 때만 count를 label 앞에 붙여 `2 Nodes`, `3 Bits`처럼 표시한다.
  candidate가 없거나 하나뿐이면 숫자를 생략하고 `Nodes`, `Bits`만 표시한다.
- 이 전체 count와 remote arrival의 `새 항목 N개` indicator는 의미가 다르므로 하나로 합치지 않는다.

### Candidate Drag Surface And Preview

- staged Node/Bit card의 primary click에는 선택, 상세 보기 또는 menu 동작을 추가하지 않는다. card는
  placement와 unstage를 시작하는 drag surface다.
- 2-3 시안의 card 내부 별도 Grip/drag handle 구현은 잘못된 prototype detail이며 main으로 승격하지
  않는다. production에서는 Node card와 Bit row의 root surface 전체에 draggable activator를 연결한다.
- card의 어느 지점에서 pointer 또는 touch drag를 시작해도 native card snapshot이 아니라 main의
  공통 `DragOverlay`와 `TriageDragToken`을 사용한다. 잡은 위치에 따라 preview shape, offset 또는
  content가 달라지지 않는다.
- main의 `snapDragTokenToCursor` 동작을 보존하여 drag pill 중심을 activation pointer에 맞춘다.
  Node의 compact icon token과 Bit의 icon/label token처럼 item type별 기존 token 내용 차이는 유지하되,
  같은 type은 card 안의 어느 지점에서 잡아도 동일한 pill을 표시한다.
- 전체 card drag는 main의 sensor activation constraint를 유지한다. Mouse는 8px 이동 후 시작하고,
  Touch는 250ms delay와 5px tolerance를 사용한다. theme route마다 값을 바꾸거나 즉시 drag로
  완화하지 않는다.
- prototype의 Grip icon은 drag 시작 조건이나 별도 hit target으로 사용하지 않는다. theme visual
  recipe에서도 전체 card drag 계약을 약화시키는 내부 handle을 다시 추가하지 않는다.

### Candidate Lifecycle

- 후보는 selected Scratch에 scope되며 Scratch 간에 섞이지 않는다.
- staged candidate는 임시 component/Zustand/localStorage 상태가 아니라 동기화되는 domain data다.
  첫 production 구현에서는 Dexie repository에 저장하고, 향후 BaaS migration 뒤에는 같은 repository
  contract를 통해 remote source of truth에 저장한다.
- candidate는 안정적인 ID와 `scratchId`, `sourceBreakdownId`, `type`, lifecycle/version metadata를
  가지며 route 이동, reload, 재로그인과 다른 기기에서도 복구된다.
- candidate는 source title/content snapshot을 소유하지 않는다. Staging card의 표시 text는
  `sourceBreakdownId`로 조회한 authoritative Breakdown row content에서 파생한다.
- candidate query는 source row를 함께 resolve하며 source가 없는 orphan candidate를 정상 card처럼
  렌더링하지 않는다. orphan 처리 정책은 repository/BaaS 무결성 규칙으로 관리한다.
- local cache miss, offline 또는 일시적인 subscription 지연만으로 candidate를 orphan으로 판정하지
  않는다. authoritative repository/BaaS에서 source row가 삭제되었거나 tombstoned 상태임을 확인한다.
- source 부재가 확인되면 candidate를 원자적으로 제거하고 원인, candidate ID, source ID와 시각을
  audit event로 남긴다. 깨진 placeholder card나 hidden orphan record를 유지하지 않으며 count와 archive
  eligibility도 정리된 authoritative candidate 목록으로 다시 계산한다.
- 현재 Scratch에서 orphan cleanup이 발생하면 Staging-local alert로
  `원본이 삭제되어 Staging 항목을 정리했습니다.`라고 알린다. 알림은 focus를 탈취하지 않고 앞서 정한
  `X`와 상태 기반 종료를 사용하며, 향후 workspace-context toast 정책으로 이전할 수 있다.
- source Breakdown row의 staged 표시는 candidate 존재 여부에서 파생한다. candidate와 별도로
  쉽게 어긋날 수 있는 중복 `isStaged` 상태를 저장하지 않는다.
- Staging 진입만으로 source Breakdown row를 소비하지 않는다.
- 하나의 source Breakdown row는 같은 Scratch 안에서 한 시점에 하나의 staged candidate만
  가질 수 있다. Node와 Bit candidate를 동시에 만들거나 같은 유형을 중복 생성하지 않는다.
- 중복 여부는 title 문자열이 아니라 안정적인 `sourceBreakdownId`로 판단한다. 동일한 title을
  가진 서로 다른 row는 각각 독립적으로 staging할 수 있다.
- 이미 staged된 row를 다시 drop하면 새 candidate를 만들거나 기존 candidate의 유형을 암묵적으로
  바꾸지 않는다. 현재 Staging에 있다는 직접적인 이유를 표시하고 no-op으로 끝낸다.
- Node와 Bit 유형을 바꾸려면 먼저 기존 candidate를 remove/unstage하여 source row를 active 상태로
  복원한 뒤 원하는 유형으로 다시 staging한다.
- staged source row의 Edit/Trash 금지는 client disabled style에만 의존하지 않는다. repository와 향후
  BaaS mutation도 candidate 존재 여부와 row version을 확인하여 stale client의 변경을 차단한다.
- stale 또는 offline client가 staged source row에 Edit/Trash를 요청하면 mutation을 실행하지 않는다.
  candidate를 자동 unstage하거나 Edit을 candidate에 전파하거나 Trash와 함께 candidate를 cascade
  delete하지 않는다.
- 거부 응답 후 client는 authoritative candidate/row 상태를 다시 반영하고
  `이 항목은 Staging에 있습니다. 먼저 Staging에서 취소해 주세요.`라는 직접적인 알림을 제공한다.
  사용자가 실제 unstage한 뒤에만 새 Edit/Trash mutation을 시작할 수 있다.
- staged candidate drag 중에만 나타나는 기존 dedicated unstage drop zone과 Breakdown drop-back은
  같은 의미를 갖는다.
- remove 또는 drop-back 후 source Breakdown row는 active 상태로 복구된다.
- staged candidate를 드래그하는 동안 Breakdown section 전체를 unstage drop target으로 사용한다.
  section 안의 특정 source row를 정확히 조준할 필요 없이 Breakdown 영역 어디에 drop해도 같은
  unstage command를 실행한다.
- dedicated unstage drop zone과 Breakdown section drop-back은 동일한 권한 검사, idempotency,
  repository mutation, 성공·실패 feedback을 공유한다. 두 경로를 별도 상태 변경 로직으로 구현하지
  않는다.
- candidate card에 permanent unstage button을 추가하지 않는다. 기존 unstage drop zone은 staged
  candidate drag가 시작될 때만 나타나며, 두 drop target은 모두 현재 pointer DnD 범위에 속한다.
- dedicated unstage drop zone은 staged drag 중 Staging section 하단에 absolute overlay로 표시한다.
  Node/Bit subsection viewport 높이, 35/65 비율, card 위치와 현재 scroll offset을 줄이거나 이동시키지
  않는다.
- overlay가 마지막 candidate를 가리지 않도록 drag 중에만 각 scroll content에 drop zone 높이에 맞는
  임시 bottom scroll padding을 적용한다. 이는 viewport 크기를 바꾸지 않으며 drag 종료 시 제거한다.
- overlay는 기존 Staging content를 blur하지 않고 명확한 drop target으로 보이되, drag가 아닐 때는
  DOM interaction과 공간을 차지하지 않는다.
- remove/drop-back은 해당 row의 staging 자격도 즉시 복구한다. 페이지 수명 동안 row ID를 영구히
  막는 임시 Set guard를 사용하지 않는다.
- production repository/store는 candidate 추가와 `sourceBreakdownId` uniqueness 확인을 같은 mutation
  경계에서 처리하여 빠른 반복 drop이나 동시 event로도 중복 candidate가 생기지 않게 한다.
- BaaS 동기화 이후에도 같은 uniqueness와 lifecycle 규칙을 서버 mutation/constraint에서 보장한다.
  client cache는 authoritative candidate 목록을 투영할 뿐 중복 방지의 유일한 근거가 아니다.

### Stage Reliability

- Breakdown row를 Node 또는 Bit Staging에 drop하면 하나의 idempotent durable candidate-create
  operation을 시작한다.
- durable candidate write 직전에 source Breakdown row의 stable ID, version, active lifecycle,
  기존 candidate 존재 여부를 authoritative repository/BaaS에서 다시 검증한다.
- drag 시작 이후 source row가 수정, 삭제, staging되었거나 version이 달라졌다면 local drop intent를
  실행하지 않고 candidate를 생성하지 않는다. 최신 값으로 자동 staging하거나 drag 시작 시점의
  snapshot으로 강행하지 않는다.
- 검증 실패 시 authoritative 상태를 반영한다. 수정된 row는 최신 내용으로 갱신하고, 이미 staged된
  row는 기존 candidate 상태를 표시하며, 삭제된 row는 목록에서 제거한다. Staging-local alert로
  `다른 곳에서 변경되었습니다. 최신 내용을 확인한 후 다시 드래그해 주세요.`에 해당하는 locale별
  안내를 제공하고 별도 Retry button은 만들지 않는다.
- 저장 성공 전에는 target Staging에 pending candidate를 표시하고 source Breakdown row도 pending
  상태로 잠근다. 같은 row의 중복 drop, Edit, Trash와 충돌 action은 허용하지 않는다.
- pending candidate는 현재 theme의 staged Node/Bit card 컴포넌트와 같은 shape, 크기, padding,
  radius, typography와 내부 정보 구조를 사용한다. 별도 generic pending card나 wrapper를 만들지 않는다.
- pending 여부는 theme-specific color, saturation, surface, border, shadow 또는 작은 상태 marker로
  구분한다. 기존 Node/Bit 유형 차이는 유지하며 blinking, 반복 pulse와 layout-changing motion은
  사용하지 않는다.
- pending candidate는 저장 성공 전까지 drag, unstage와 Grid placement를 할 수 없다. 접근성 tree에는
  저장 중인 candidate임을 전달한다.
- 성공이 확인되면 pending treatment를 제거해 정상 staged candidate로 전환하고 source row를 staged
  de-emphasis 상태로 전환한다.
- 실패하면 pending candidate를 제거하고 source row를 active 상태로 복원한다. Staging-local alert는
  실패한 item title과 `Staging에 등록하지 못했습니다. 다시 시도해 주세요.`를 표시하며, 별도 Retry
  button 없이 앞서 정한 상태 기반 종료와 `X` 닫기를 사용한다.
- timeout이나 연결 단절로 결과가 불명확하면 operation ID로 authoritative 결과를 먼저 조회한다.
  결과 확인 전 같은 row를 다시 staging하거나 정상 candidate로 확정하지 않는다.

### Unstage Reliability

- dedicated unstage drop zone 또는 Breakdown section drop-back을 실행하면 하나의 idempotent unstage
  operation을 시작한다.
- 저장 성공이 확인되기 전에는 candidate를 Staging에 pending 상태로 유지하고 source Breakdown row도
  staged 상태로 유지한다. candidate drag, 중복 unstage와 충돌 action은 잠근다.
- 성공이 확인된 뒤에만 candidate를 Staging에서 제거하고 source row를 active 상태로 복원한다.
- 성공 후 source row의 기존 `createdAt`과 Breakdown sort position은 바꾸지 않는다. row가 현재
  viewport 밖에 있으면 page나 panel 전체가 아니라 Breakdown row list 내부만 해당 row가 보이는
  nearest 위치로 scroll하고 source row surface에 focus를 복원한다.
- 복원된 row에는 Breakdown Add 성공 후 새 row에 사용하는 것과 동일한 theme-specific 일회성 signal을
  적용한다. 별도의 unstage 전용 animation을 만들지 않으며 같은 shadow, border, background 또는
  간단한 sparkle recipe와 reduced-motion 대체 표현을 재사용한다.
- 실패하면 pending 잠금을 해제하되 candidate와 source row를 기존 상태로 유지하고 실패 알림만
  표시한다. 별도의 Retry button은 만들지 않는다. 사용자는 dedicated unstage drop zone 또는
  Breakdown section drop-back을 다시 실행하여 재시도할 수 있다.
- 현재 Inbox/Triage promotion에서는 실패 알림을 Staging header 바로 아래의 section-local overlay로
  표시한다. Node/Bit 목록 높이를 늘리거나 candidate card 구조를 바꾸지 않으며, 실패한 item title과
  `Staging 취소에 실패했습니다. 다시 시도해 주세요.`라는 직접적인 이유를 포함한다.
- 이 알림은 focus를 가져가지 않고 `role="alert"`로 보조 기술에 즉시 전달한다. 성공한 unstage에는
  성공 알림을 추가하지 않는다.
- 실패 알림에는 접근 가능한 이름을 가진 `X` 닫기 button을 제공한다. `X`는 알림만 닫으며 candidate,
  source row와 unstage operation 결과를 변경하거나 자동 재시도하지 않는다.
- 알림은 시간으로 자동 종료하지 않는다. 같은 candidate의 unstage를 다시 시작하거나 authoritative
  sync로 candidate가 사라지거나 selected Scratch가 바뀌거나 사용자가 `X`를 누를 때 제거한다.
  새로운 unstage 실패가 발생하면 기존 알림을 최신 실패 내용으로 교체한다.
- section-local 실패 알림은 임시 방향이다. 별도
  `2026-04-28-toast-feedback-placement/DECISION.md`의 workspace-context toast 재설계가 실행되면 같은
  실패 feedback을 error toast로 이전한다. 기존 문서의 `staged candidate removal does not need toast`는
  성공한 routine removal을 뜻하며 실패 feedback에는 적용하지 않는다.
- timeout이나 연결 단절로 결과가 불명확하면 operation ID로 authoritative 결과를 먼저 조회한다.
  성공이 확인되지 않은 상태에서 candidate를 제거하거나 source row를 active로 전환하지 않는다.

### Stage And Unstage Navigation Boundary

- Stage 또는 Unstage operation이 pending/reconciling인 동안에는 다른 Scratch 선택과 Inbox/Triage의
  앱 내부 route 이탈을 잠근다. 이동 요청을 pending intent로 저장하거나 operation 성공 뒤 자동
  실행하지 않고, 결과가 확정된 뒤 다시 시도하라는 non-blocking status를 표시한다.
- 같은 Scratch 안에서는 pending source row와 candidate 또는 그 lifecycle에 의존하는 action만 기존
  규칙대로 잠근다. 관계없는 row 확인, Scratch Pool 조작과 Grid 탐색까지 page 전체에서 차단하지 않는다.
- 결과가 확정되지 않은 browser reload/tab close에는 native unload confirmation을 적용한다. 사용자가
  page에 남으면 현재 pending presentation과 operation 결과 확인을 계속한다.
- 성공 또는 실패가 확정되면 navigation lock을 제거하되 이전 이동 요청을 자동 실행하지 않는다.

### Drag Feedback

- staged Node/Bit drag 시작 시 허용되지 않는 Grid column을 즉시 theme-specific signal로
  표시한다.
- drag cursor가 실제 invalid column 안에 들어오면 signal 위에 명확한 경고 message를
  추가한다.
- Home은 Node only, Level 3는 Bit only다. 중간 level은 기존 hierarchy 제약을 따른다.
- invalid signal은 원래 column label을 바꾸거나 경고 message 자체를 흐리게 만들지 않는다.
- staged candidate drag가 시작되면 Breakdown section 전체에도 unstage 가능한 target임을 알리는
  은은한 theme-specific border/background signal을 표시한다.
- drag cursor가 Breakdown section 안에 실제로 진입하면 signal을 강화하고
  `Drop to return to Breakdown`에 해당하는 locale별 직접적인 message를 추가한다.
- Breakdown drop-back signal은 기존 Scratch Context, row와 input을 blur, dim 또는 가리지 않으며
  section label을 다른 문구로 교체하지 않는다. section 높이, row 위치와 scroll viewport도 바꾸지
  않는다.
- cursor가 Breakdown을 벗어나거나 drag가 끝나면 signal과 message를 즉시 제거한다. blinking,
  반복 pulse와 자동 drop은 사용하지 않는다.
- staged Node를 현재 `Nodes` subsection으로, staged Bit를 현재 `Bits` subsection으로 다시 가져가면
  target을 valid로 강조하지 않는다. neutral 상태를 유지하며 drop은 mutation 없는 drag cancel로 끝낸다.
- staged Node를 `Bits`에, staged Bit를 `Nodes`에 가져가면 invalid signal과
  `유형을 바꾸려면 먼저 Staging에서 취소하세요.`에 해당하는 locale별 message를 표시한다. 반대
  subsection drop으로 candidate type을 자동 변환하지 않는다.
- staged candidate를 어떤 유효 target에도 drop하지 못한 채 pointer release, `Escape`, browser drag
  cancel로 interaction이 끝나면 mutation 없는 drag cancel로 처리한다. candidate는 Staging의 원래
  위치와 상태를 유지한다.
- drag pill, Grid/Breakdown drop signal, invalid warning과 dedicated unstage overlay를 즉시 모두
  제거한다. 저장 실패가 아니므로 section-local alert, toast 또는 별도 취소 message는 표시하지 않는다.

### Realtime Candidate Changes

- 다른 기기나 session에서 현재 candidate가 unstage, placed, deleted 또는 그 밖의 lifecycle 변경을
  받으면 authoritative candidate subscription을 통해 local view를 갱신한다.
- pointer drag가 진행 중일 때는 drag source와 preview를 갑자기 제거하지 않는다. drag 시작 시점의
  visual snapshot을 pointer release 또는 drag cancel까지 유지하되 remote invalidation을 내부에
  기록한다.
- pointer를 놓으면 local drop mutation을 실행하지 않고 최신 authoritative state를 적용한다. stale
  candidate를 자동으로 다른 target에 배치하거나 source row를 임의로 복제하지 않는다.
- Placement Affordance가 이미 열린 상태에서 candidate가 remote lifecycle 변경을 받으면 affordance를
  즉시 닫고 최신 상태를 반영한다. dirty Result Title draft가 있더라도 무효한 candidate를 위한 draft는
  저장하거나 복구하지 않는다.
- remote 변경 알림은 focus를 탈취하지 않는 non-blocking feedback과 `aria-live`로 전달한다. 사라진
  candidate에 focus가 있었다면 Staging section heading 또는 최신 상태에서 존재하는 관련 source로
  안전하게 이동한다.

## Grid Explorer And Placement

### Scratch Switch Grid Context

- Grid hierarchy path, selected Node chain과 열린 column은 Scratch별 상태가 아니라 현재 mounted
  Inbox/Triage page의 shared Grid context다. 사용자가 다른 Scratch를 선택해도 현재 path와 4-column
  전개 상태를 유지한다.
- Scratch별 마지막 Grid path map을 만들거나 Scratch 전환마다 Home으로 초기화하지 않는다. 새 Scratch의
  staged/direct placement도 사용자가 현재 보고 있는 Grid 위치에서 시작할 수 있다.
- Grid search가 열린 상태에서 Scratch를 전환해도 search mode, current query, 최신 result list와
  result-list scroll context를 유지한다. Grid search는 Scratch별 작업이 아니며 전환된 Scratch를 이유로
  interrupted query로 바꾸거나 search UI를 닫지 않는다.
- Scratch 선택으로 이동한 keyboard focus를 search input으로 강제 복귀시키지 않는다. 이후 새 Scratch의
  Breakdown row 또는 staged candidate DnD가 시작되면 기존 Search Interruption And Recovery 규칙대로
  search를 닫고 query를 임시 보존한다.
- 일반 4-column mode에서도 각 visible column의 scroll offset과 Search Selection And Reveal에서 만든
  highlight를 Scratch 전환 뒤 그대로 유지한다. Column scroll을 상단으로 되돌리거나 Scratch별 scroll
  map을 만들지 않는다.
- Scratch 전환은 search reveal 종료 조건이 아니다. 다른 Grid item 선택, Grid path 변경, DnD 시작,
  search 재실행 또는 Inbox/Triage route 이탈이라는 기존 종료 조건에서만 highlight를 제거한다.
- Scratch 전환과 무관하게 실제 Grid data 변경으로 path가 무효해지면 기존 Realtime Grid Changes의
  nearest-valid-ancestor fallback을 적용한다. Pending placement나 mutation 때문에 Scratch 전환 자체가
  잠긴 경우에는 해당 operation의 navigation boundary가 우선한다.

### Route And Reload Grid Context

- Inbox/Triage route를 떠났다가 같은 app session에서 다시 진입하면 마지막 Grid hierarchy path,
  selected Node chain, 열린 column과 각 visible column의 scroll context를 복원한다.
- 복원 전에 current Grid data로 path의 active/reachable 상태를 검증한다. 무효한 지점부터 기존
  nearest-valid-ancestor 규칙으로 축소하고 stale Node ID나 scroll anchor를 강제로 되살리지 않는다.
- Browser reload 또는 새 browser/app session에서는 Home부터 시작하고 column scroll을 초기화한다.
  Path와 scroll을 `localStorage`, IndexedDB 또는 remote DB에 저장하지 않는다.
- Route 이탈 시 search reveal highlight는 기존 종료 규칙대로 제거하고, Newly Placed marker와 Undo도
  page-session lifecycle에 따라 끝낸다. 실제 생성된 Node/Bit record는 일반 Grid card로 유지한다.
- Inbox/Triage route를 떠나면 active Grid search mode, current query, result list와 result scroll을
  모두 종료한다. DnD interruption으로 임시 보존한 query도 함께 삭제한다.
- 같은 app session에서 route에 다시 진입해도 search UI를 자동 복원하지 않는다. 위에서 복원한 Grid
  path와 column scroll을 사용하는 일반 4-column mode로 시작한다. Browser reload와 새 app session도
  빈 query의 일반 Grid mode로 시작한다.
- Route 재진입 시 visual/data context와 keyboard focus를 별도로 다룬다. 마지막 focused control이나
  selected Scratch/Grid card에 focus를 복원하지 않고, app의 route-focus convention에 따라
  Inbox/Triage page heading 또는 main landmark로 focus를 이동한다. 복원된 selection, path와 scroll은
  그대로 보이지만 Scratch search input이나 Grid 내부 깊은 control로 사용자를 강제 이동시키지 않는다.

### Header And Search Mode

- Grid surface는 visible theme-specific header/chrome을 갖는다.
- column label은 `Home`, `Level 1`, `Level 2`, `Level 3` 풀네임을 사용한다.
- 각 column header 아래에 selected node title을 중복 표시하지 않는다. 선택 상태는 card와
  경로에서 표현한다.
- search는 detached global search가 아니라 Grid Explorer section 안의 전용 mode다.
- search를 열면 4개 column을 숨기고 같은 section body를 search 전용 UI로 교체하며 input에
  focus한다.
- query가 비어 있으면 `Grid Explorer 전체에서 검색` 역할의 pre-search 안내를 표시한다.
  실제 no-results 상태와 빈 query 상태를 같은 문구로 표현하지 않는다.
- search clear는 별도 `Clear` text button 대신 input 내부 `X` control로 제공한다.
- Direct Row 선택 UI 또는 Confirm/Cancel Placement Affordance가 열려 있으면 search를
  disabled 처리한다. pending placement와 search mode를 동시에 유지하지 않는다.

### Search Scope, Matching, And Results

- search scope는 현재 열린 column이 아니라 모든 visible Home root와 그 아래에서 도달 가능한
  전체 active Grid hierarchy다.
- active Node와 Bit만 검색한다. Chunk, archived/trashed item, system Node, Grid에서 숨긴 root,
  visible Home에서 도달할 수 없는 orphan item은 제외한다.
- query는 공백 기준 token으로 나누며, 모든 token이 item title 또는 전체 parent breadcrumb
  중 어딘가에 존재해야 결과에 포함한다.
- 초기 production 범위에서는 typo correction과 semantic/fuzzy synonym search를 추가하지
  않는다.
- result relevance 순서는 다음과 같다.
  1. title exact match
  2. title prefix match
  3. title substring match
  4. title과 breadcrumb에 token이 나뉘어 match
  5. breadcrumb-only match
- relevance가 같으면 실제 Grid hierarchy order를 사용한다.
- Node와 Bit를 group으로 분리하지 않은 하나의 flat result list를 사용한다.
- 각 result는 type, title, full breadcrumb와 기존 item의 icon/color identity를 보여준다.
- 같은 `type + title + breadcrumb`를 가진 result가 여러 개면 좌표를 노출하지 않고
  `중복 항목 1/2`, `중복 항목 2/2`처럼 직접적인 text로 구분한다.
- loading, no-results, stale-result refresh, query failure를 서로 다른 상태로 표현한다. 모든
  result는 scroll 또는 production 수준의 list virtualization을 통해 접근 가능해야 한다.
- search UI가 열린 동안 underlying active Grid data가 추가, 수정 또는 제거되면 current query를
  유지한 채 result list만 최신 matching data로 갱신한다. 새 result로 자동 scroll, selection 또는
  focus 이동을 실행하지 않고 별도 remote-sync alert도 추가하지 않는다.
- 현재 focus된 result가 갱신으로 사라지면 search input으로 focus를 복귀시킨다. Query를 지우거나
  search mode를 종료하지 않는다.

### Search Selection And Reveal

- result는 click 또는 keyboard `Enter`로 선택한다. `Arrow Up/Down`과 `Escape`도 지원한다.
- 선택하면 search UI를 닫고 current query와 interrupted query를 모두 지운 뒤 4개 column을
  복원한다.
- result가 가진 ancestor ID chain으로 path를 재구성하며 일반 Grid route로 이동하지 않고
  Inbox/Triage 안에 남는다.
- Node result는 target Node를 기존 selected state로 만든다.
- Bit result는 parent path를 열고 target Bit를 view 안으로 scroll한 뒤 search reveal
  highlight를 적용한다.
- Bit reveal에는 timer를 사용하지 않는다. 다른 item 선택, Grid path 변경, DnD 시작,
  search 재실행 또는 Inbox/Triage 이탈 시 해제한다.
- search result row 자체는 navigation과 Newly Placed Undo만 지원하며 DnD source로 만들지
  않는다.

### Search Interruption And Recovery

- search 중 Breakdown row 또는 staged Node/Bit DnD가 시작되면 search UI를 닫고 4개 column을
  즉시 복원하여 기존 drop signal과 Placement Affordance를 사용할 수 있게 한다.
- DnD로 강제 종료된 경우에만 query를 page-level `interrupted search query`로 임시 보존한다.
- Drop 또는 Cancel 후 search로 자동 복귀하지 않는다. 사용자가 search를 다시 열면 보존된
  query와 result를 복원한다.
- result 선택, input `X`, `Escape`, Inbox/Triage 이탈은 interrupted query까지 삭제한다. 특히 route
  이탈은 active search의 current query, result와 result scroll도 함께 삭제하며 재진입 시 search
  mode를 복원하지 않는다.
- Newly Placed Node/Bit는 Confirm 직후 search result에 포함하며 existing newly placed marker와
  Undo를 제공한다.
- search result에서 Undo하면 search와 query는 유지하고 해당 result만 제거한다. source에 따라
  Staging 또는 Breakdown으로 복구되었다는 non-blocking inline feedback을 표시한다.
- result 선택 직전에 item과 ancestor path의 active/reachable 상태를 다시 검증한다. stale이면
  search를 유지한 채 result를 갱신하고 non-blocking 안내를 표시한다.

### Realtime Grid Changes

- 다른 기기, browser tab 또는 session에서 현재 보고 있는 Grid column에 Node/Bit가 추가되어도
  현재 hierarchy path, selected Node와 keyboard focus를 변경하지 않는다. Remote item으로 자동
  scroll하거나 focus를 이동하지 않는다.
- canonical Grid 좌표 순서상 remote item이 현재 viewport 앞에 삽입되면 기존 scrollTop 숫자를 그대로
  두는 대신, 업데이트 직전 첫 visible card의 stable ID와 viewport offset을 anchor로 보존한다. 사용자가
  보고 있던 card가 같은 화면 위치에 머물도록 해당 column scroll만 보정한다.
- 현재 hierarchy path를 구성하는 selected Node가 remote delete, archive 또는 parent 이동으로 더 이상
  active/reachable하지 않으면 최초 무효 지점부터 하위 selection과 column을 제거하고 가장 가까운
  유효 ancestor까지 path를 축소한다. 비슷한 sibling을 자동 선택하거나 stale ghost path를 유지하지 않는다.
- focus는 가장 가까운 유효 ancestor card, 그것도 없으면 해당 column heading으로 이동한다.
  `경로가 다른 곳에서 변경되어 최신 위치로 돌아왔습니다.`에 해당하는 locale별 non-blocking status를
  표시한다. Placement Affordance가 열려 있었다면 기존 stale target 규칙대로 write 없이 종료한다.

### Placement Targets

- 기존 main의 hierarchy column body와 유효한 Node target 동작을 보존한다.
- target path와 가능한 result type은 drop 전에 계산한다.
- invalid target에는 write를 발생시키지 않는다.
- staged candidate 또는 direct Breakdown row를 유효한 Grid column 안에서 drag할 때 pointer가 해당
  column의 위·아래 edge에 가까워지면 그 column의 scroll content만 제한적으로 auto-scroll한다.
  edge에 가까울수록 속도를 점진적으로 높이되 급격한 jump는 만들지 않는다.
- invalid/locked column, 다른 Grid column, Grid Explorer 전체와 page는 auto-scroll하지 않는다.
  auto-scroll은 pointer가 edge를 벗어나거나 drag가 종료되는 즉시 멈추며, Node 선택이나 Grid path
  변경을 자동 실행하지 않는다.
- Grid column의 wheel, trackpad, touch, keyboard scroll과 drag edge auto-scroll은 유지하지만 visible
  scrollbar chrome은 모든 theme에서 계속 숨긴다.
- edge auto-scroll 중에는 pointer 아래의 valid Node 또는 column body를 계속 hit-test하여 drop signal을
  갱신한다. Auto-scroll 시작 전의 target을 고정하거나 pointer가 다시 움직일 때까지 stale target을
  유지하지 않는다.
- pointer release 순간 실제 아래에 있는 target을 최종 destination으로 사용한다. Placement Affordance는
  이 최종 target path를 명확히 표시하며, 사용자가 Confirm하기 전까지 어떠한 write도 실행하지 않는다.
- placement affordance는 target column의 scrollable content 안에 놓는다. affordance가
  추가되어도 column이 확장되거나 Confirm/Cancel이 clipping되지 않아야 한다.
- Drop 시 target에 빈 Grid cell이 없으면 source item, result type과 destination path를 보여주는 기존
  Placement Affordance를 그대로 열고 `이 위치에는 빈 Grid cell이 없습니다.`에 해당하는 locale별
  warning을 표시한다. Confirm은 disabled 처리하고 Cancel만 허용한다.
- full target에서 가장 가까운 parent, sibling column 또는 다른 빈 cell로 자동 이동하지 않는다.
  사용자는 Cancel한 뒤 Grid 공간이나 target을 변경하고 다시 drag한다. Drop 때는 공간이 있었더라도
  Confirm 직전 재검증에서 full 상태가 확인되면 write 없이 같은 warning/disabled Confirm 상태로 전환한다.
- Placement Affordance가 열린 뒤 다른 tab, window 또는 외부 mutation으로 source나 target이
  달라질 수 있으므로 Confirm/Yes 직전에 source lifecycle, candidate 상태, target의 active/reachable
  상태, type constraint와 destination 유효성을 다시 검증한다.
- target이 사라졌거나 이동되었거나 더 이상 유효하지 않으면 create, consume, candidate removal 중
  어느 write도 실행하지 않는다. 가장 가까운 column이나 비슷한 path로 자동 재배치하지 않으며,
  기존 target snapshot으로 강행하지 않는다.
- target 재검증 실패 시 최신 Grid 상태를 반영하고 source row 또는 staged candidate는 원래 상태로
  유지한다. stale affordance는 닫거나 invalid state로 전환하고, 사용자가 최신 target으로 다시
  drag해야 한다는 직접적인 안내를 제공한다.
- source row가 이미 staged, consumed, deleted되었거나 candidate가 제거·변경된 경우에도 write를
  실행하지 않는다. stale source를 복원하거나 duplicate result를 만들지 않고 최신 source 상태를
  반영한 뒤 해당 affordance를 종료한다.
- 위 재검증 실패는 partial success로 취급하지 않는다. 자동 target 보정, silent retry와 source/result
  중 하나만 변경하는 best-effort 처리를 사용하지 않는다.
- Direct 유형 선택, staged Result Title 수정 또는 Placement Affordance가 열린 Confirm 전 flow는 하나의
  현재 작업으로 취급한다. 이 동안 Scratch 전환, Grid path 변경, Grid search, 새 DnD와 앱 내부 route
  이동을 실행하지 않고 `먼저 진행 중인 배치를 확인하거나 취소하세요`라는 직접적인 이유를 표시한다.
- 사용자는 Confirm 또는 Cancel/Escape로 flow를 종료한 뒤 요청한 문맥 변경을 다시 실행한다. navigation
  요청을 queue에 보존하거나 Confirm/Cancel 뒤 자동 실행하지 않는다.
- Cancel/Escape는 source row 또는 candidate를 원래 상태로 유지하고 staged Result Title draft가 있으면
  해당 임시 draft만 폐기한다. Scratch별 또는 target별 미확정 Placement flow를 백그라운드에 보존하지
  않는다.
- Confirm 전 browser reload/tab close는 Result Title draft가 실제로 변경된 경우에만 native unload
  confirmation을 표시한다. 저장할 draft가 없는 유형 선택/확인 단계는 이탈을 허용하며 휘발성
  Placement UI를 폐기한다. 재진입 시 미확정 flow를 복원하지 않는다.

### Placement Keyboard And Focus

- 이번 promotion 범위에서 Placement 진입은 Mouse와 Touch를 포함한 pointer drag-and-drop만 지원한다.
  Breakdown row의 Edit/Trash 옆이나 Staging candidate에 별도 `Grid에 배치` button/menu를 추가하지
  않으며, keyboard drag mode와 destination picker도 구현하지 않는다.
- `drag only`는 Mouse 전용이라는 뜻이 아니라 별도 command UI 없이 직접 조작으로 진입한다는 뜻이다.
  Mouse는 8px activation distance, Touch는 250ms delay와 5px tolerance라는 기존 main sensor 계약을
  유지하며 두 입력 모두 같은 drag pill, drop signal과 Placement Affordance를 사용한다.
- 이는 현재 범위의 명시적 제약이다. keyboard 또는 drag 대체 placement 경로는 후속 accessibility
  brainstorming에서 별도로 설계하며, 이번 구현에 숨겨진 shortcut이나 미완성 action을 넣지 않는다.
- drop으로 flow가 열리면 focus를 현재 단계 안으로 이동한다. Staged placement는 Placement Affordance의
  heading 또는 안전한 Cancel action, staged Result Title 단계는 title input, Direct placement는
  Node/Bit 선택 affordance의 heading을 initial focus target으로 사용한다.
- Node/Bit 유형 선택 또는 Result Title 확인으로 다음 Placement Affordance가 열리면 새 단계의 heading
  또는 Cancel로 focus를 이동한다. 이전 단계의 제거된 control에 focus를 남기지 않는다.
- Confirm 전 flow가 다른 interaction을 차단하는 동안 Tab focus도 현재 affordance 안에 containment한다.
  visual surface는 target column 범위를 유지하며 이 이유로 full-screen modal로 바꾸지 않는다.
- unavailable type은 keyboard와 assistive technology에도 disabled 상태와 직접적인 reason을 제공한다.
  validation error, stale source/target, explicit mutation failure에서는 현재 단계 안에 focus를 유지한다.
- Cancel/Escape 후 source가 존재하면 원래 Breakdown grip 또는 staged candidate card surface로 focus를
  돌려보낸다. 외부 lifecycle 변경으로 source가 사라졌으면 해당 Breakdown 또는 Staging section
  heading을 fallback으로 사용한다.
- Confirm 성공 후에는 임시 indicator가 아니라 새로 생성된 실제 Node/Bit card로 focus를 이동한다.
  Newly Placed marker와 Undo의 accessible description을 함께 알리되 announcement가 focus를 다시
  탈취하지 않는다.
- pending/reconciling 동안에는 현재 affordance 안에 focus를 유지한다. 성공, 미실행 또는 실패가
  판명된 뒤에만 각각 새 card, Retry 또는 Cancel로 안정적으로 이동한다.

### Staged Candidate Placement

1. 사용자가 staged Node 또는 Bit를 유효한 Grid target에 drop한다.
2. target column 안에 source item, result type, destination path를 보여주는 별도의
   Placement Affordance가 열린다.
3. Cancel/Escape는 아무 데이터도 변경하지 않고 candidate를 Staging에 유지한다.
4. Confirm/Yes는 실제 Node/Bit를 생성하고 source Breakdown row를 consumed로 표시하며
   candidate를 Staging에서 제거한다.
5. 결과는 checkbox나 `Node: ...` text를 가진 임시 indicator card가 아니라 기존
   Node/Bit card로 표시한다.

### Direct Breakdown Row Placement

1. 사용자가 Breakdown row를 유효한 Grid target에 직접 drop한다.
2. 먼저 modal-like direct-placement affordance에서 Node/Bit 유형과 destination path를
   확인한다. target constraint로 불가능한 유형은 선택할 수 없다.
3. 유형 선택 후 staged placement와 시각적으로 구분되는 별도의 Placement Affordance로
   전환한다.
4. Confirm/Yes 후 실제 Node/Bit를 생성하고 source row를 consumed로 표시한다.
5. Cancel/Escape는 row를 active Breakdown에 그대로 둔다.

### Placement Commit Reliability

- Staged placement의 result 생성, source row consume과 candidate 제거는 하나의 원자적 operation이다.
  Direct placement의 result 생성과 source row consume도 하나의 원자적 operation이다. 어느 단계도
  독립적으로 먼저 확정하거나 best-effort compensation에 맡기지 않는다.
- Confirm/Yes 시 operation ID를 생성하고 같은 사용자 action의 중복 실행을 식별한다. Dexie에서는
  하나의 read-write transaction 안에서 Confirm 직전 재검증과 모든 write를 실행한다. 향후 PostgreSQL
  기반 BaaS에서는 transaction 또는 DB function과 unique idempotency key로 같은 contract를 유지한다.
- mutation이 진행되는 동안 Placement Affordance를 그대로 유지하면서 `배치 중` pending state로
  전환한다. Confirm, Cancel/Escape, 중복 DnD, Scratch 전환, Grid path 변경, Archive와 충돌하는
  interaction을 잠그며 source나 result를 낙관적으로 먼저 숨기거나 표시하지 않는다.
- transaction이 명시적으로 실패하거나 offline 상태라 실행되지 않았으면 모든 write를 rollback하고
  source row와 candidate를 원래 상태로 유지한다. 같은 affordance에서 원인을 알리고 Retry와 Cancel을
  제공한다. 자동 retry는 사용하지 않는다.
- 응답 timeout이나 연결 단절로 commit 결과가 불명확하면 같은 operation ID로 durable 결과를 먼저
  조회한다. 이미 성공했으면 source/result 상태를 최신화하고 실제 Newly Placed Node/Bit card를
  표시한다. 실행되지 않은 것이 확인되면 affordance를 다시 활성화하여 Retry 또는 Cancel을 허용한다.
- 결과가 아직 확인되지 않은 동안에는 pending/reconciling 상태를 유지하고 새 operation을 시작하지
  않는다. 동일 title의 존재 여부 같은 휴리스틱으로 성공을 추정하거나 무조건 재시도해 duplicate를
  만들지 않는다.
- pending, failure와 reconciliation status는 focus를 탈취하지 않는 visible status와 적절한
  `aria-live` announcement로 전달한다. 실패 후 focus는 affordance 안의 Retry로, 성공 후에는 새로
  생성된 실제 Node/Bit card로 이동할 수 있는 일관된 focus target을 제공한다.

### Placement Result Title Validation

- Breakdown row content는 free-form source로서 현재 최대 `1,000`자를 유지한다.
- production schema의 result title limit은 현재 Node `100`자, Bit `200`자다. placement는 이
  차이를 무시하거나 source content를 자동으로 잘라 저장하지 않는다.
- staged candidate의 source content가 확정된 result type의 title limit을 넘으면 기존 Placement
  Affordance 전에 별도의 `Result title` 수정·확인 modal을 연다.
- modal은 원문을 보여주고 별도의 result title draft를 제공한다. title이 target limit 안의
  유효한 값이 될 때까지 다음 단계로 진행할 수 없다.
- source Breakdown content는 수정하지 않는다. placement Cancel과 이후 Undo는 원래 source
  content를 그대로 보존하거나 복원한다.
- Direct Breakdown placement에는 Result Title editor를 넣지 않는다. 2-3 시안의 정보 구조대로
  Node/Bit 유형과 destination path를 선택한 뒤 별도의 Placement Affordance로 바로 진행한다.
- Direct source 길이가 `1~100`자면 Node와 Bit, `101~200`자면 Bit만 선택할 수 있다. limit을 넘는
  type은 unavailable 상태와 `Node 제목은 최대 100자입니다` 또는 `Bit 제목은 최대 200자입니다`라는
  직접적인 reason을 표시한다.
- Direct source가 `201~1,000`자라 두 type 모두 불가능하면 affordance에는 limit 안내와 Cancel만
  남긴다. 사용자는 flow 밖에서 Row를 수정하거나 더 작은 Row로 분해한 뒤 다시 Drag한다. silent
  truncation, schema limit 확대, hidden title editor 또는 실패하는 Confirm을 사용하지 않는다.

### Newly Placed State

- newly placed item은 기존 Grid Explorer Node/Bit card의 component, padding, radius,
  base color와 내부 문법을 그대로 사용한다.
- 별도 card design 또는 임시 placed indicator를 만들지 않는다.
- marker, outline, background treatment, corner treatment, shadow 등으로 방금 추가된
  상태만 덧붙인다.
- Node와 Bit의 기존 차이는 유지하며 두 유형 모두 newly placed 상태를 제공한다.
- Selected state와 Newly Placed state는 시각적으로 구분한다. 둘이 겹치면 selected
  treatment 위에 newly placed marker와 Undo가 함께 보인다.
- 같은 Inbox/Triage page session에서 여러 newly placed item이 동시에 존재할 수 있다.
- 현재 mounted Inbox/Triage page가 시작하고 성공을 확인한 placement operation만 operation ID와
  생성 record ID를 연결하여 local Newly Placed state로 등록한다. 같은 operation의 BaaS subscription
  반영은 remote item으로 오인하지 않는다.
- 다른 기기, browser tab 또는 별도 session에서 생성되어 subscription으로 들어온 Node/Bit는 일반
  Grid card로 실제 좌표 위치에 표시한다. 이를 상단에 고정하거나 Newly Placed marker와 Undo를
  부여하지 않는다. Reload 뒤에는 이전 local operation도 복원하지 않는다.
- Newly Placed Node는 임시 indicator가 아니라 실제 Node이므로 생성 직후부터 일반 Node와 동일하게
  선택, hierarchy 탐색과 후속 placement target으로 사용할 수 있다. Newly Placed marker와 Undo가
  있다는 이유로 하위 배치를 차단하지 않는다.
- 실제 Node/Bit의 `x`, `y` 좌표와 Grid 저장 순서는 기존 placement engine이 결정한 값을 유지한다.
  다만 현재 Inbox/Triage session의 Grid Explorer에서는 Newly Placed 항목을 해당 column의 일반 항목
  위에 임시로 고정하는 display projection을 사용한다. 별도 복제 card나 임시 record를 만들지 않는다.
- 기존 Grid Explorer의 Node 목록과 `Bits` subsection 구조는 유지한다. Newly Placed Node는 Node
  목록 상단, Newly Placed Bit는 Bits 목록 상단에 고정하고 각 유형 안에서는 현재 page session의
  placement 완료 순서가 최신인 항목부터 표시한다. 일반 항목은 그 아래에서 기존 Grid 좌표 순서를
  유지한다.
- Confirm 성공 후 target column을 상단으로 scroll하여 방금 고정된 card를 reveal한다. Inbox/Triage
  route를 떠나 Newly Placed session state가 끝나면 다음 진입부터 실제 Grid 좌표 순서로 표시한다.
- Scratch 전환과 Grid column 전환만으로 상태를 지우지 않는다.
- 사용자가 Inbox/Triage route를 떠날 때 일반 card로 전환하고 Undo 가능 상태도 끝낸다.
- 이 상태는 DB에 영구 저장하지 않는 page/session-level transient UI state다.

### Undo

- newly placed 실제 Node/Bit card 우측에 Undo control을 표시한다.
- Undo는 생성 결과와 source 상태를 하나의 일관된 operation으로 되돌린다.
  - source가 Staging이면 생성된 Node/Bit를 제거하고 candidate와 source row를 Staging
    상태로 복원한다.
  - source가 direct Breakdown row이면 생성된 Node/Bit를 제거하고 source row를 active
    Breakdown으로 복원한다.
- Undo click은 Node navigation/select click과 분리한다.
- route를 떠난 뒤에는 newly placed marker와 Undo를 복원하지 않는다. 생성된 Node/Bit는
  정상 데이터로 유지된다.
- Undo는 생성 결과를 안전하게 제거할 수 있는 동안만 허용한다. 단순 selection, navigation과
  search reveal처럼 DB를 변경하지 않는 interaction은 eligibility에 영향을 주지 않는다.
- 생성된 Node/Bit 자체가 title, icon, deadline, completion, parent/path, archive/delete 등 후속
  mutation을 받았으면 Undo를 차단한다. stale creation snapshot으로 후속 변경을 덮거나 삭제하지 않는다.
- 새 Node 아래에 후속 Node/Bit 또는 Chunk가 존재하면 parent Undo를 차단한다. 해당 child도 같은
  session의 reversible newly placed operation이라면 child부터 역순으로 Undo할 수 있으며, surviving
  dependency와 다른 mutation이 모두 없어지면 parent Undo를 다시 허용한다.
- 따라서 eligibility는 최초 version이 달라졌다는 이유만으로 영구 차단하지 않는다. page/session은
  자신이 만든 placement operation과 dependency를 추적하고, Undo 직전 repository가 실제 record,
  lifecycle, surviving descendant와 알려지지 않은 mutation을 원자적으로 재검증한다.
- 조건을 만족하지 않으면 cascade delete, orphan 생성 또는 best-effort source 복원을 하지 않는다.
  생성 결과와 source의 현재 상태를 그대로 유지한다.
- Undo eligibility가 사라져도 Newly Placed marker는 route exit까지 유지한다. session provenance와
  rollback 가능 여부를 하나의 상태로 합치지 않는다.
- Undo control은 card의 같은 위치에 unavailable 상태로 남기고 `배치 후 수정되어 되돌릴 수 없음`,
  `먼저 새로 추가된 하위 항목을 되돌리기`처럼 구체적인 reason을 제공한다. reason은 hover에만
  의존하지 않고 keyboard focus와 assistive technology에서도 접근 가능해야 한다.
- reversible dependency가 모두 Undo되어 eligibility가 다시 충족되면 parent Undo를 재활성화한다.
  unavailable control을 눌러야만 실패 이유를 알 수 있는 late-error 방식은 사용하지 않는다.
- Archive overlay 또는 Cancel 이후의 `Scratch complete` state가 표시된 동안에도 Archive mutation이
  시작되기 전이면 eligible Newly Placed Undo를 사용할 수 있다.
- Undo가 성공하면 archive eligibility를 다시 계산하여 overlay, reopen affordance와 completed Context를
  즉시 철회한다. direct source는 active Breakdown row로, staged source는 source row와 candidate를
  Staging 상태로 복원하고 일반 작업 Context로 돌아간다.
- Archive mutation이 시작된 뒤에는 Undo를 잠가 archive와 rollback write가 경합하지 않게 한다.
- Direct type/path 선택 또는 Confirm/Cancel Placement Affordance가 열려 있는 동안에는 기존 Newly
  Placed card의 Undo를 unavailable 처리한다. 현재 target path를 제거하거나 변경할 수 있는 별도
  mutation을 placement와 병행하지 않는다.
- 이 상태의 reason은 `먼저 진행 중인 배치를 확인하거나 취소하세요`로 명확히 표시한다. Confirm 또는
  Cancel로 pending placement가 끝나면 각 Undo eligibility를 다시 계산한다. Undo가 pending placement를
  암묵적으로 Cancel하거나 target을 다른 path로 자동 재지정하지 않는다.
- Undo 성공으로 source card가 사라진 뒤 focus는 Grid 작업 맥락에 유지한다. 일반 column에서는 다음
  card, 없으면 이전 card, 둘 다 없으면 해당 column header를 fallback으로 사용한다.
- Grid Search result에서 Undo한 경우에는 다음 result, result가 없으면 search input으로 focus한다.
  복원된 Breakdown row 또는 Staging candidate에는 `복원됨` 상태와 `aria-live` announcement를 제공하되
  자동으로 다른 section을 scroll하거나 focus를 이동하지 않는다.
- Undo click 후 결과 card를 optimistic하게 제거하지 않는다. card와 source state를 유지한 채
  `되돌리는 중` 상태로 관련 control을 잠그고, rollback commit 성공 후에만 두 surface를 갱신한다.
- Dexie에서는 생성 결과 제거와 source/candidate 복원을 하나의 transaction으로 처리한다. 향후
  PostgreSQL 기반 BaaS에서는 동일 operation을 하나의 database transaction/function으로 처리하여
  부분 성공을 허용하지 않는다.
- Undo 실패 시 생성 결과와 source를 기존 상태로 유지하고 Retry를 제공한다. timeout 또는 connection
  loss는 즉시 재전송하지 않고 operation 결과와 result/source record를 재조회하여 성공, 미실행 또는
  conflict로 수렴시킨다.
- dirty editor가 있는 동안 Undo를 요청하면 기존 save-before-action contract의 단일 pending intent로
  보존한다. Save 성공 후 Undo eligibility를 다시 검증하고 유효할 때만 실행한다. 저장 실패, edit
  conflict 또는 eligibility 상실 시 Undo를 실행하지 않는다.
- Undo transaction이 진행되는 동안 Scratch 전환, 다른 placement, Archive와 앱 내부 route 이동을
  잠근다. browser reload/tab close에는 dirty/save-pending과 같은 native unload guard를 적용한다.

## Completion And Archive

### Archive Eligibility

Archive affordance는 다음 조건을 모두 만족할 때만 활성화한다.

- selected Scratch가 존재하고 active 상태다.
- 해당 Scratch에 실제 placed/consumed Breakdown row가 한 개 이상 존재한다.
- 모든 Breakdown row가 placed/consumed 상태다.
- staged Node/Bit candidate가 하나도 남아 있지 않다.

단순히 모든 row를 Staging으로 보낸 상태나 consumed 결과 없이 모든 row를 Trash로 삭제한 상태는
archive-ready가 아니다. 한 개 이상의 row가 consumed된 뒤 나머지 불필요한 active row를 삭제한
경우에는 다른 조건을 만족하면 archive-ready가 될 수 있다.

- non-empty Breakdown Add draft는 persisted archive eligibility를 변경하지 않는 page-local blocker다.
  Draft가 있는 동안에는 automatic Archive overlay, blur, `Scratch complete` Context와 reopen control을
  표시하지 않고 Add input 근처에 아이디어를 추가하거나 draft를 비운 뒤 완료할 수 있다는 section-local
  안내를 표시한다.
- Archive flow가 Add draft를 암묵적으로 제출하거나 폐기하지 않는다. 사용자가 draft를 실제 row로
  추가하면 최신 row 상태로 eligibility를 다시 계산하고, draft를 비웠는데 persisted eligibility가
  여전히 충족되면 그 순간을 현재 mounted page session의 archive-ready 전환으로 보아 overlay를 자동으로
  연다.
- Dirty Scratch title editor도 persisted archive eligibility를 바꾸지 않는 page-local completion
  blocker다. Editor가 열려 있거나 Save/conflict/reconciliation이 진행 중이면 automatic Archive overlay,
  blur와 `Scratch complete` Context를 표시하지 않고 Context editor 안에서 편집을 마쳐야 완료할 수 있다는
  안내를 표시한다.
- Completion 전환이 title draft를 자동 저장하거나 Cancel하지 않는다. 사용자가 Save 또는 Cancel로
  editor를 정상 종료한 뒤 eligibility를 다시 계산하고, 여전히 유효하면 그 시점을 현재 mounted page
  session의 archive-ready 전환으로 보아 overlay를 자동으로 연다. Save 실패나 conflict면 editor와
  blocker를 유지한다.
- overlay 또는 Cancel 이후의 completion state가 표시된 뒤 active row가 복원되거나 staged candidate가
  다시 생기는 등 eligibility가 상실되면 overlay, blur, `Scratch complete` Context와 reopen control을
  즉시 철회한다. 최신 Breakdown/Staging 상태를 다시 표시하고 archive할 수 없게 된 직접적인 이유를
  non-blocking status로 알린다.
- 외부 mutation으로 selected Scratch 자체가 이미 archived 또는 deleted되었으면 stale completion UI를
  유지하지 않는다. 해당 Scratch 작업 화면을 종료하고 active Scratch Pool을 갱신한다.
- OK/Archive transaction 안에서도 selected Scratch lifecycle, 실제 consumed row 존재, 모든 row의
  consumed 상태와 비어 있는 Staging을 다시 검증한다. 조건이 달라졌으면 `archivedAt`을 쓰지 않고
  일반 작업 상태로 복귀한다.
- eligibility 상실 후 자동 archive하거나, stale overlay에서 OK만 잠근 채 조건이 다시 맞기를
  기다리거나, 이전 completion snapshot으로 archive를 강행하지 않는다.

### Initial Completion Moment

- archive-ready로 처음 전환되면 Breakdown section 전체를 blur/dim 처리한다.
- overlay는 Breakdown section 안에서만 표시하고 화면 전체를 가리지 않는다.
- overlay 위의 Archive Scratch affordance에는 Cancel과 OK/Archive action이 있다.
- overlay가 열려 있는 동안 별도의 `Show archive dialog` control은 보이지 않는다.
- 자동으로 overlay가 나타날 때 현재 focus를 빼앗지 않는다. 마지막 Placement 또는 Undo eligibility가
  있는 Grid card 등 현재 작업 위치를 유지하고 `아카이브 준비 완료` 상태를 `aria-live`로 알린다.
- overlay는 Breakdown 안의 non-modal dialog/region semantics와 명확한 accessible name을 갖는다.
  Archive mutation이 시작되기 전에는 page 전체 focus trap을 사용하지 않으며, keyboard 사용자는 다른
  section과 eligible Newly Placed Undo로 이동할 수 있다.
- Overlay가 Breakdown을 blur하는 동안 해당 section의 Add input과 row/Context control은 조작할 수
  없다. 아이디어를 더 추가하려면 먼저 Cancel하거나 Escape로 overlay를 닫는다.
- Escape는 focus가 overlay 내부에 있을 때만 Cancel과 같은 의미로 동작한다. 페이지의 다른 section에서
  누른 Escape가 보이지 않는 archive action을 실행하지 않는다.

### Cancel And Reopen

- Cancel하면 overlay를 닫는다.
- Selected Scratch Context는 테마별 `Scratch complete` 상태로 전환한다.
- Breakdown section 안에 archive dialog를 다시 여는 control을 표시한다.
- Cancel 뒤에도 기존 Breakdown Add input을 사용할 수 있다. 별도 `Continue Breakdown` action이나
  완료 상태 해제 단계를 추가하지 않는다.
- 새 row 저장이 성공하면 archive eligibility가 상실되므로 `Scratch complete` Context와 reopen
  control을 즉시 제거하고 일반 Selected Scratch Context와 Breakdown list로 돌아간다. Add draft를
  입력하기 시작한 것만으로 persisted completion을 해제하지 않으며, non-empty draft 동안에는 앞서
  정한 completion blocker 안내를 사용한다.
- 사용자가 다시 열면 동일한 section-scoped archive overlay를 보여준다.
- Cancel 또는 Escape 후 focus는 새로 나타난 `Show archive dialog` control로 이동한다.
- 사용자가 해당 control로 overlay를 명시적으로 다시 열면 overlay heading 또는 안전한 Cancel action으로
  focus를 이동한다. 이 경우에도 Archive mutation 전까지는 전역 focus trap을 사용하지 않는다.
- Archive mutation이 시작되기 전에는 다른 Scratch로 전환할 수 있다. auto-open overlay가 열린 상태의
  전환은 archive 취소가 아니라 결정을 연기하는 action으로 처리하며, 이전 Scratch의 overlay만 닫는다.
- 같은 page session에서 해당 Scratch로 돌아오면 overlay를 자동으로 다시 열지 않는다. eligibility가
  유지되면 테마별 `Scratch complete` Context와 `Show archive dialog` control을 표시한다. 이미 Cancel한
  뒤 전환한 경우에도 같은 상태를 복원한다.
- 다른 Scratch를 보는 동안 eligibility가 상실되었으면 돌아왔을 때 completion UI를 복원하지 않고
  최신 Breakdown/Staging의 일반 작업 상태를 표시한다.
- Scratch 전환 자체가 archive write, archivedAt 변경 또는 durable dismissal flag를 만들지 않는다.
  Archive mutation이 pending/reconciling인 동안에는 기존 pending lock에 따라 Scratch 전환을 허용하지
  않는다.
- Archive write 전에 Inbox/Triage route를 떠나거나 page를 reload해도 overlay open/Cancel state를
  LocalStorage, IndexedDB 또는 remote DB에 별도로 저장하지 않는다.
- page 진입 또는 reload 시 이미 archive-ready인 Scratch는 overlay를 자동으로 열지 않고 테마별
  `Scratch complete` Context와 `Show archive dialog` control로 복원한다. 자동 overlay는 현재 mounted
  page session에서 eligibility가 `false`에서 `true`로 전환된 최초 완료 순간에만 표시한다.
- route 이탈이나 reload가 archive를 암묵적으로 실행하거나 취소한 것으로 기록되지 않는다. 다시
  진입했을 때 최신 row, Staging과 Scratch lifecycle로 eligibility를 재계산한다.

### Confirm Archive

- OK/Archive는 selected Scratch의 `archivedAt`을 설정한다.
- archived Scratch는 active Inbox/Scratch Pool에서 사라진다.
- 이 경로는 hard delete가 아니며 Archive View의 기존 restore 정책을 유지한다.
- OK/Archive mutation은 operation ID를 가진 idempotent operation으로 실행한다. Dexie에서는 archive
  eligibility와 대상의 최신 상태 확인, `archivedAt` 갱신을 하나의 read-write transaction으로
  처리한다. 향후 PostgreSQL 기반 BaaS에서는 conditional mutation 또는 DB function과 unique
  idempotency key로 같은 contract를 유지한다.
- OK를 누르면 기존 Breakdown-scoped overlay를 `아카이브 중` pending state로 유지한다. Archive 성공이
  확인되기 전에는 selected Scratch를 Pool에서 제거하거나 다음 Scratch를 먼저 보여주지 않는다.
- pending 중에는 OK 중복 실행, Cancel/Escape, Undo, Edit, Placement, Scratch 전환과 앱 내부 route
  이동을 잠근다. browser reload/tab close에는 진행 중 mutation을 알리는 native unload guard를 적용한다.
- pending/reconciling 동안에는 overlay 내부에 focus를 유지하고 disabled control이 아닌 status 또는
  현재 실행 중인 action을 안정적인 focus target으로 제공한다.
- 명시적 실패 또는 offline으로 operation이 실행되지 않았으면 Scratch와 active Inbox 상태를 그대로
  유지한다. 같은 overlay에서 실패 원인, Retry와 Cancel을 제공하며 자동 retry하지 않는다.
- timeout 또는 connection loss로 결과가 불명확하면 같은 operation ID와 Scratch의 최신 `archivedAt`
  상태를 조회한다. 성공이 확인된 뒤에만 Scratch를 active Pool에서 제거하고 후속 selection/focus를
  적용한다. 미실행이 확인되면 Retry 또는 Cancel을 허용한다.
- native unload guard를 통과해 pending 중 강제 reload가 발생했다면 초기 화면을 확정하기 전에 해당
  operation을 reconcile한다. 성공이면 archived Scratch를 제거하고, 미실행이면 completion Context와
  reopen control로 복귀하며, 결과가 불명확하면 section-scoped recovery overlay를 유지한다.
- 결과가 아직 확인되지 않은 동안에는 overlay를 pending/reconciling state로 유지하고 새 archive
  operation을 시작하지 않는다. Scratch가 목록에서 사라졌다는 client 추정만으로 성공 처리하거나
  동일 mutation을 무조건 다시 보내지 않는다.
- pending, failure와 reconciliation status는 overlay 안의 visible status와 적절한 `aria-live`
  announcement로 전달한다. 실패 시 focus는 Retry에 유지하고, 성공 시에는 archive 완료 후 확정된
  destination으로 명시적으로 이동한다.
- Archive 성공 후 selection은 제거 직전의 현재 search, sort와 visible Scratch order를 보존한다.
  archived Scratch의 다음 visible item을 우선 선택하고, 없으면 이전 visible item을 선택한다. 선택한
  Scratch가 있으면 해당 Selected Scratch Context로 focus를 이동한다.
- 검색 결과에서 마지막 visible Scratch를 archive했지만 query 밖에 다른 active Scratch가 남아 있으면
  query를 자동으로 지우거나 숨겨진 Scratch를 선택하지 않는다. selection 없이 search no-results
  상태를 유지하고 search input 또는 clear control로 focus를 이동한다.
- search가 없는 상태에서 active Scratch가 실제로 하나도 남지 않으면 no selection의 Inbox empty
  state를 표시하고 해당 empty state의 primary action으로 focus를 이동한다. Archive View로 자동
  이동하거나 방금 archive한 Scratch를 다시 선택하지 않는다.

## Localization Direction

- 한국어 지원은 확정된 제품 방향이지만 이번 core promotion과 별도 후속 범위다.
- main에서는 8개 한국어 route 복제가 아니라 shared resource/i18n 구조로 구현한다.
- EN/KR 전환, 한국어 section label, action copy, theme별 한글 typography를 함께 설계한다.
- 영어와 한국어가 같은 layout contract를 사용하되, text fit과 font metrics를 테마별로
  검증한다.
- 작업은 functional foundation과 visual completion으로 분리한다.
  1. core Inbox promotion 중에는 영어 화면을 구현하되 새 user-facing copy의 ownership을 Inbox
     resource/copy boundary에 모으고 component 곳곳에 새 문자열을 분산하지 않는다.
  2. core promotion 직후 shared locale state/provider, EN/KR resource, Sidebar toggle, locale-aware
     date/time, validation/error/status와 accessibility copy를 연결한다.
  3. 공용 BitCard와 Staging/Placed visual 재탐색 후 8개 테마별 한국어 font, metrics, text fit과
     screenshot QA를 최종 마감한다.
- 언어 전환은 route 복제나 page reload로 구현하지 않으며 selected Scratch, inline draft, Grid path,
  search query/result, Newly Placed, pending placement와 Archive eligibility를 초기화하지 않는다.
- 표시 줄 수, ellipsis, wrapping과 editor keyboard/IME 세부 정책은 별도
  `2026-07-14-cross-surface-text-capacity-and-overflow` brainstorming 결과를 최종 visual QA에 적용한다.

## Production Architecture Boundary

- 2-3 route의 local mock state나 duplicated handlers를 복사하지 않는다.
- 현재 main의 `ScratchPool`, `BreakdownPanel`, `StagingZone`, `HierarchyExplorer`,
  `TriageWorkspace`, `useTriageDnd`, `triage-store`를 책임 기준으로 재구성한다.
- placed/consumed truth는 실제 Node/Bit 생성 결과와 `scratchBreakdowns.consumedAt`을 사용한다.
- newly placed/Undo transaction metadata만 page/session scope에서 관리한다.
- direct placement의 유형 선택, placement confirmation, mutation, rollback은 서로 다른
  상태로 모델링한다.
- 기존 global `searchAll()`에 Inbox-specific condition을 누적하지 않는다. Grid Explorer
  전용 data query/result model을 두어 active hierarchy traversal, ancestor ID chain,
  token matching, relevance와 hierarchy ordering을 책임지게 한다.
- search query에는 type, title, full breadcrumb segment, ancestor ID chain, native icon/color,
  hierarchy order와 relevance 정보가 포함되어야 한다. Chunk용 global search result shape를
  그대로 재사용하지 않는다.
- 전용 search hook은 async cancellation/request identity, loading, error와 stale response를
  관리하고, search panel은 input과 result rendering에 집중한다. `HierarchyExplorer`는 mode,
  path restore와 reveal lifecycle을 조정한다.
- theme별 시각 차이는 duplicated route가 아니라 shared semantic state와 theme token 또는
  theme realization component를 통해 표현한다.
- 시안에서 검증된 정확한 시각 값은 amendment mode의 visual recipe extraction을 거친 뒤
  canonical design 문서와 execution task에 반영한다.

## Visual Recipe Structure

- visual recipe는 theme-first가 아니라 surface-first hybrid 구조로 작성한다. 실제 production
  component와 execution task가 소유하는 product surface를 파일 경계로 삼는다.
- 각 surface recipe 안에는 shared semantic/layout contract와 Griddo, Tiny Desk, Neumorphism,
  Claymorphism, Origami, Terminal, Retro Mac, Graphite의 8개 realization section을 둔다.
- 별도 `inbox-triage-visual-recipe-index.md`는 source region, surface, theme realization, production
  owner와 execution task를 찾는 navigation artifact로만 사용한다. recipe 또는
  `DESIGN_TOKENS.md`를 대체하지 않는다.
- 공통 semantic token과 theme mapping rule은 `DESIGN_TOKENS.md`, 제품 behavior는 이 문서와
  `SPEC.md`, prototype에서 추출한 exact layout/style/motion 값은 surface recipe가 소유한다.
- 초기 recipe set은 shell/section chrome, Scratch Pool, Selected Scratch Context, Breakdown
  row/empty state, Staging, Grid Explorer, placement affordances, Newly Placed/Undo,
  archive/completion surface를 기준으로 나눈다. amendment Step 0.75 source-region map에서 실제
  execution owner와 겹치는 항목은 합치거나 더 세분화할 수 있으나 theme별 종합 파일로 뒤집지 않는다.
- surface×theme 조합마다 별도 파일을 만드는 완전 분리 방식은 사용하지 않는다. task마다 8개 파일을
  읽게 만들거나 수십 개 recipe에 shared contract를 복제하지 않는다.
- 기존 `docs/recipes/inbox-triage-batch2-visual-recipe.md`는 label 제거, compact Context와 active-column
  search 등 최신 결정에 의해 대체된 내용을 포함하므로 direct execution recipe로 확장하지 않는다.
  PROMOTION_MAP에서 superseded historical source로 분류하고 새 surface recipe가 최신 시각 handoff를
  담당한다.

## Ideation Progress

- [x] 2-3 최종 시안과 main의 섹션별 차이 감사 — settled 2026-07-13
- [x] visible section label/header/chrome 복원 — settled 2026-07-13
- [x] Selected Scratch Context를 signature section으로 정의 — settled 2026-07-13
- [x] staged row 유지, placed row 제거 — settled 2026-07-13
- [x] staged/direct placement의 2단계 흐름과 실제 card 결과 — settled 2026-07-13
- [x] newly placed page-session lifecycle과 source-aware Undo — settled 2026-07-13
- [x] Breakdown-scoped archive completion flow — settled 2026-07-13
- [x] Grid Explorer 전체 hierarchy search와 DnD interruption recovery — settled 2026-07-13
- [x] Scratch Context Edit와 Breakdown row Edit의 production editing pattern — settled 2026-07-14
- [x] Breakdown content와 Node/Bit title limit 간 placement validation — settled 2026-07-14
- [x] 한국어 승격을 functional foundation과 post-card visual completion으로 분리 — settled 2026-07-14
- [x] 8개 테마 visual recipe의 surface-first hybrid 구조 — settled 2026-07-14
- [x] end-to-end user flow second-pass audit — settled 2026-07-14
- [-] main BitCard 및 Staging/Placed visual 재탐색 — deferred to post-promotion follow-up
- [-] Neumorphism ASC/DESC water-lens polish — deferred to post-promotion follow-up

## Open Questions

2026-07-14 second-pass local user-flow audit과 후속 인터뷰를 완료했다. 현재 Main 승격 범위에 남은
active product-policy question은 없다. Main 코드, 2-3 최종 시안과 이 문서의 단일 사용자 흐름을
재대조했으며, BaaS 다중 사용자 presentation polish는 현재 promotion의 blocker로 확대하지 않는다.

`Promotion Boundary`의 후속 항목과 keyboard/drag 대체 Placement 진입 경로는 미결정 질문이 아니라
의도적으로 분리한 deferred work다. 새 근거 또는 구현 중 충돌이 발견되면 별도 amendment나
brainstorming으로 다시 연다.
