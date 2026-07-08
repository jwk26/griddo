# Inbox/Triage 2-4 시안 - 기능/UX Gap Notes

## 목적

이 문서는 `griddo2-claude-themes2-2`의 8개 Inbox/Triage 시안을 기준으로,
현재 `griddo2-claude` main 구현에 존재하는 기능/UX 요소 중 2-2 시안에
반영되지 않은 내용을 정리한다.

이번 작업의 목표는 production code를 수정하는 것이 아니다. 목표는 2-2
시안의 디자인 완성도와 테마별 정체성을 보존하면서, 최신 Inbox/Triage 기능을
2-4 시안 안에 자연스럽게 흡수하는 것이다.

핵심 전제:

- 작업 대상은 prototype code다.
- 2-2 시안은 디자인 기준이다.
- main 구현은 기능/UX reference다.
- main 구현의 낮은 시각 품질은 시안에 복사하지 않는다.
- 시안에서 실제 persistence, production hook, 정확한 DnD state machine을
  구현할 필요는 없다.
- 시안은 기능이 실제로 동작하는 앱이 아니라, 최신 Inbox/Triage UX가 어떻게
  보여야 하는지 판단하기 위한 디자인 결과물이다.

## Reference

### Production Reference

아래 파일은 기능/UX 이해용 reference다. visual style은 복사하지 않는다.

- `/Users/jwk/Documents/griddo2-claude/src/components/triage/triage-workspace.tsx`
- `/Users/jwk/Documents/griddo2-claude/src/components/triage/scratch-pool.tsx`
- `/Users/jwk/Documents/griddo2-claude/src/components/triage/breakdown-panel.tsx`
- `/Users/jwk/Documents/griddo2-claude/src/components/triage/staging-zone.tsx`
- `/Users/jwk/Documents/griddo2-claude/src/components/triage/hierarchy-explorer.tsx`

### Prototype Source

아래 8개 파일은 디자인 기준이다. 직접 수정하지 않고, 2-4 worktree를 만들어
그 안에서 업데이트한다.

- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-griddo/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-tiny-desk/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-neumorphism/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-claymorphism/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-origami/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-terminal/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-retro-mac/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-graphite/page.tsx`

## 짧은 맥락

2-2 시안은 Inbox/Triage의 네 영역을 디자인 중심으로 탐색하기 위해 만들어졌다.

- Scratch Pool
- Breakdown
- Staging
- Hierarchy/Grid

당시 시안은 production 기능을 완전히 구현하기보다 UX 방향과 테마별 시각 언어를
확립하는 데 집중했다. 이후 main 구현에서는 Scratch 검색/정렬, collapsed
Scratch switching, selected Scratch context, remove-from-staging, scoped
hierarchy search, placement confirmation 같은 기능이 추가되거나 정리되었다.

따라서 2-4 작업은 "main을 그대로 따라 그리는 작업"이 아니다. 2-2 시안의
디자인 언어를 유지하면서, 현재 main에만 존재하는 기능과 상태를 시안적으로 다시
해석하는 작업이다.

## 공통 결정

| 항목 | 결정 |
| --- | --- |
| 작업 대상 | 새 2-4 prototype worktree |
| source worktree | `griddo2-claude-themes2-2` |
| target worktree | `griddo2-claude-themes2-4` |
| production code | 수정하지 않음 |
| 2-2 worktree | 직접 수정하지 않음 |
| 작업 성격 | redesign이 아니라 update |
| 디자인 기준 | 2-2 시안의 테마별 정체성 |
| 기능 기준 | main 구현의 최신 Inbox/Triage 기능 |
| 기능 구현 깊이 | 실제 동작 구현보다 visual/UX representation 우선 |
| icon | emoji 금지. 시안 프로젝트 공통 규칙으로 lucide icon 사용 |

## 디자인 보존 우선순위

이번 작업은 2-2 시안의 디자인을 대체하거나 재창조하는 작업이 아니다. 새 기능과
상태를 추가하더라도 각 theme의 기존 구도, 밀도, 질감, typography, 색감, 장식
언어, motion 감각을 먼저 보존한다.

요청사항은 기존 2-2 디자인 문법 안에 흡수되어야 한다. 새 UI가 필요한 경우에도
main 구현 스타일을 가져오거나 모든 theme에 같은 generic component를 덧붙이지
않는다. 각 theme가 이미 갖고 있는 header, surface, button, badge, row, card,
icon 처리 방식을 관찰한 뒤 그 언어로 확장한다.

판단이 애매하면 새 기능을 더 크게 과시하기보다 기존 시안의 완성도와 정체성을
해치지 않는 쪽을 우선한다.

## Preview UI 결정

Preview UI는 2-4 시안 검토를 돕는 임시 UI다. 시안 확정 후 삭제될 수 있다.

용어 정의:

- `Preview heading`: theme 시안을 감싸는 preview shell/body 상단의 제목.
- `Section label/header/chrome`: theme 내부의 `Scratch Pool`, `Breakdown`,
  `Staging`, `Grid` 같은 영역 제목과 주변 장식.
- Preview heading은 삭제한다.
- Theme 내부 section label/header/chrome은 유지한다.

- Sidebar에 8개 theme을 `1`부터 `8`까지 numbering한다.
- Sidebar에 theme 변경 버튼을 둔다. Hover로 preview가 바뀌어도 좋지만,
  click/focus로도 조작 가능해야 한다.
- Sidebar에 EN/KR toggle 버튼을 둔다.
- Body 상단의 preview heading은 삭제한다.
- 예외:
  - retro mac theme은 기존 heading/chrome을 유지한다.
  - terminal theme은 heading의 디자인 요소만 theme 내부로 흡수하고 preview
    heading 자체는 삭제한다.
  - origami theme의 가위 motif가 emoji가 아니라면 theme 내부 edit button
    icon으로 재사용한다. emoji라면 lucide `Scissors` icon을 사용한다.
- Preview UI 자체에는 emoji를 사용하지 않는다. 필요한 icon은 lucide icon을
  사용한다.

## 언어/Label 결정

8개 theme 모두 영어 버전과 한국어 버전을 제공한다. Sidebar의 EN/KR toggle로
전환할 수 있어야 한다.

한국어 버전은 기존 영어 버전과 다른 font treatment가 필요하다. 단순 번역만
붙이는 것이 아니라, 각 theme의 typography 안에서 한국어가 어색하지 않게 보이게
한다.

main 구현에서는 visible section label을 제거했지만, 2-4 시안에서는 label을
부활/유지하는 방침으로 확정한다. 2-2 시안에는 label/header/chrome이 남아 있으므로
그 구조를 그대로 기준으로 작업한다.

| Section | English | Korean |
| --- | --- | --- |
| Scratch Pool | Scratch Pool | 스크래치 모음 |
| Breakdown | Breakdown | 아이디어 분해 |
| Staging | Staging | 대기열 |
| Staging subsection | Node | 노드 |
| Staging subsection | Bit | 비트 |
| Hierarchy/Grid | Grid | 프로젝트 탐색기 |
| Hierarchy level | Home | 홈 |
| Hierarchy level | Level 1 | 레벨 1 |
| Hierarchy level | Level 2 | 레벨 2 |
| Hierarchy level | Level 3 | 레벨 3 |

## Scrollbar 결정

모든 주요 영역에서 visible scrollbar chrome을 제거한다. 스크롤 가능한 내용은
필요하면 유지하되, scrollbar가 시각적으로 드러나지 않게 한다.

- Scratch Pool list
- Breakdown row list
- Staging Node
- Staging Bit
- Hierarchy/Grid 각 section

## Gap Table

### Scratch Pool

| 항목 | 2-2 시안 상태 | main 구현/새 요구 | 2-4 시안 목표 |
| --- | --- | --- | --- |
| tools 구조 | theme별 header/chrome + list 중심. Scratch search/sort는 없다. | main에는 icon/count/collapse 영역과 search/sort 영역이 분리되어 있다. 이 분리는 시각적으로 단절되어 보인다. | Scratch Pool은 tools section(상) + scratch list section(하) 2구조로 만든다. identity/count/collapse/search/sort를 하나의 tools section 안에 통합한다. |
| Scratch search | 없음 | Scratch title search가 main에 존재한다. | search bar를 tools section 안에 넣는다. 실제 full filtering 구현보다 "Scratch 제목 검색" UX가 보이는 것이 중요하다. |
| created-at sort | row에 time은 있으나 sort control은 없다. | created-at 기준 asc/desc 정렬이 가능하다. | search bar와 sort button을 한 줄에 배치한다. sort button은 theme별로 개성 있게 만들고, clicked/unclicked 또는 asc/desc 상태가 구분되어야 한다. |
| collapsed switcher | 일부 theme에 dot/mark 계열 collapsed affordance가 있다. | main에는 collapsed Scratch switching이 있다. | collapsed 상태에서는 모든 요소를 세로로 배치한다. selected item은 inactive item보다 명확히 강해야 한다. |
| label | 2-2에는 label/header가 남아 있다. | main은 label을 제거했다. | 2-4에서는 label을 유지한다. |

### Breakdown

| 항목 | 2-2 시안 상태 | main 구현/새 요구 | 2-4 시안 목표 |
| --- | --- | --- | --- |
| section label/header | `Breakdown / Scribble`, `Breakdown`, `Scribble / Fold` 등 theme별 label이 있다. | main은 label을 제거했다. | 2-4에서는 label/header를 유지한다. |
| sort toggle | 없음 또는 명확하지 않음 | Breakdown row에도 desc/asc toggle이 필요하다. | desc/asc toggle button을 추가한다. |
| input submit | 많은 2-2 시안은 input 옆 submit button이 이미 있다. | main은 Enter submit 중심이다. | input box 우측의 explicit submit button을 유지/강화한다. |
| Scratch context | header 우측 meta처럼 작게 표현된 theme가 있다. | main에도 row 상단 context가 있으나 일반 row와 잘 구분되지 않는다. | 현재 어떤 Scratch를 작업 중인지 row 상단에 더 크게, 더 강하게 보여준다. 일반 row와 시각적으로 분리되어야 한다. theme별 창의성이 중요하다. |
| Scratch context edit | 없음 | context를 편집할 수 있는 affordance가 필요하다. | Scratch context에 edit button을 추가하고 상시 표시한다. |
| Breakdown row actions | 일부 theme에서 hover/action이 약하다. | row edit/trash affordance가 필요하다. | edit, trash icon을 상시 표시한다. icon은 lucide 기반으로, theme별로 개성 있게 표현한다. |
| row numbering | 일부 시안에 number가 있다. | 제거 결정 | row numbering 제거 |
| row time | 일부 row에 time 표시가 있다. | UI에서는 제거. 단 desc/asc 때문에 schema concept은 유지 | row에 time text는 표시하지 않는다. |
| staged 상태 | row가 staging되면 main에서는 de-emphasize된다. | 시안에서는 상태별 표현이 필요하다. | Node/Bit로 staging된 row는 사라지지 않고 상태별로 다르게 보인다. main style 복사 대신 theme별 표현을 제안한다. |
| placed 상태 | main에서는 de-emphasize + line-through 성격. | 시안에서는 실제 배치 완료 후 row가 소비되는 방향 | staging을 거쳐 배치되었거나 row가 직접 배치되면 Breakdown row는 제거한다. row는 실제 배치되었을 때 소비되고 사라진다. |
| Breakdown empty background prompt | row가 없을 때 단순 empty text만 보이거나 비어 보일 수 있다. | 빈 Breakdown list도 사용자를 다음 행동으로 유도해야 한다. | Breakdown row가 하나도 없고 archive alert가 화면을 덮고 있지 않을 때, Breakdown section 배경에 theme-specific 유인물을 표시한다. `Breakdown your Ideas` 같은 문구는 예시일 뿐이며, 각 theme의 언어로 창의적으로 표현한다. |
| Archive affordance | 일관된 표현이 없다. | 모든 row가 소비되면 archive affordance가 필요하다. | Breakdown section 전체를 blur 처리하고 그 위에 archive affordance를 띄운다. Cancel/OK가 있어야 한다. Cancel 시 section 내부에 archive affordance open UI가 표시된다. 이때 Scratch context는 theme별 "Scratch 완료" 상태로 표현한다. OK 시 해당 Scratch가 archive되어 inbox에서 보이지 않는 것으로 표현한다. |

### Staging

| 항목 | 2-2 시안 상태 | main 구현/새 요구 | 2-4 시안 목표 |
| --- | --- | --- | --- |
| empty state | empty label/placeholder가 있는 theme가 있다. | 아무 item도 없을 때 empty placeholder label을 표시하지 않기로 결정 | Section label/header는 유지한다. 다만 Node/Bit staging section 내부에 item이 없을 때는 empty placeholder label을 표시하지 않는다. |
| Node/Bit distinction | theme별로 card/grid/list 차이가 있다. | Node/Bit 구분은 유지되어야 한다. | Node는 card/icon/grid 성격, Bit는 row/list 성격을 유지한다. |
| remove from staging | 약하거나 theme별로 정리되지 않음 | main에는 staged item DnD 중 remove-from-staging 기능이 있다. | remove-from-staging을 각 theme별로 창의적이고 개성적으로 표현한다. generic neutral bar처럼 만들지 않는다. |
| drag back to Breakdown | 명확하지 않음 | node/bit를 Breakdown section으로 DnD하면 remove-from-staging처럼 동작해야 한다. | Breakdown drop-back affordance도 remove-from-staging과 같은 의미로 표현한다. 실제 DnD 구현보다 시각 상태가 중요하다. |
| invalid drop tone | 강한 warning/ring 또는 불명확한 theme가 있다. | main의 muted invalid drop tone은 마음에 들지 않는다. | Antigravity가 각 theme에 맞는 invalid/unavailable tone을 창의적으로 제안한다. main style을 복사하지 않는다. |

### Hierarchy / Grid

| 항목 | 2-2 시안 상태 | main 구현/새 요구 | 2-4 시안 목표 |
| --- | --- | --- | --- |
| search position | 2-2 시안의 search 위치가 괜찮다. | main에는 scoped hierarchy search가 있다. | Search Bar는 시안 위치를 유지한다. |
| level labels | `L1/L2/L3` 등 축약형이 보인다. | 사용자에게는 축약형보다 풀네임이 낫다. | `Home`, `Level 1`, `Level 2`, `Level 3` / `홈`, `레벨 1`, `레벨 2`, `레벨 3` 사용 |
| section selected node meta | section label 아래에 selected node를 반복 표시하는 경우가 있다. | item 자체 active style로 충분하다. | section visible label 아래 selected node text는 제거한다. 선택된 node는 section 내부 item 색상/표면/강조로 표현한다. |
| search clear | X와 Clear가 함께 있거나 clear 모델이 불명확할 수 있다. | X와 clear text 둘 다 필요하지 않다. | Search에는 X clear affordance만 둔다. visible `Clear` text는 제거한다. |
| Home/Level constraints | Home은 Node only, Level 3는 Bit only다. | staging된 node/bit를 DnD할 때 이 신호가 보여야 한다. | hierarchy section에서 "여기는 Node만 가능", "여기는 Bit만 가능" 같은 신호를 theme별로 창의적으로 표현한다. |
| staged node/bit placement | Confirm 후 `Node: ...` / `Bit: ...` 같은 placed indicator card로 보일 수 있다. | main에서는 Confirm 후 실제 Node/Bit가 target path에 배치된다. | Staging을 거친 Node/Bit가 hierarchy column에 drop되면 기존처럼 Placement Affordance를 표시하고 Confirm/Yes 후 실제 Node/Bit card를 target path에 배치한다. 최종 결과를 checkbox + `Node: ...` 같은 indicator card로 대체하지 않는다. |
| direct Breakdown row placement | 2-2에는 명확히 없거나 단순 placed indicator일 수 있다. | row 자체를 바로 hierarchy로 DnD하는 경우 node/bit 선택과 path 확인이 필요하고, Confirm 후 실제 Node/Bit가 target path에 배치되어야 한다. | Row 자체가 drop되면 먼저 node/bit를 고르고 어디에 배치되는지 path를 보여주는 modal-like affordance를 표시한다. 선택지는 target column constraint를 따라야 한다: Home에서는 Node만, Level 3에서는 Bit만 가능하게 보인다. 이후 기존처럼 Placement Affordance/Confirm 단계를 거치고, Confirm 후 실제 Node/Bit card를 target path에 배치한다. |
| placed item undo | 2-2에는 명확하지 않다. | 빠른 배치 실수를 되돌릴 수 있어야 한다. | hierarchy menu를 통해 실제로 배치된 Node/Bit card 우측에는 Undo button을 둔다. Staging을 거친 Node/Bit의 Undo는 Staging으로 복구하고, direct row drop의 Undo는 원래 Breakdown row로 복구한다. |

## Prototype에서 실제 구현하지 않아도 되는 것

아래 항목은 production behavior로는 중요하지만 2-4 시안에서 실제 기능 구현이
필수는 아니다. static state, lightly interactive state, mock state로 표현해도 된다.

| 항목 | 이유 |
| --- | --- |
| Scratch 선택 후 첫 키 입력 시 Scratch Pool collapse | production interaction mechanics다. 시안에서는 expanded/collapsed 상태와 의도만 보여도 충분하다. |
| 실제 search filtering state machine | query/result/scope/clear가 시각적으로 이해되면 충분하다. |
| 실제 desc/asc sorting logic | 정렬 mode/state가 보이면 충분하다. |
| 실제 DnD collision/state machine | valid/invalid/remove/pending 상태를 시각적으로 보여주면 충분하다. |
| 실제 archive persistence | OK 후 inbox에서 사라지는 UX를 mock으로 보여주면 충분하다. |
| production hooks/store 연결 | prototype 목적 밖이다. |

## Antigravity 창의성 Focus

제약조건과 구조는 보존한다. 기존 2-2 시안의 디자인 정체성은 훼손하지 않는다.
그 안에서 아래 영역은 Antigravity의 Design/UX 창의성을 기대한다.

창의성은 기존 시안을 밀어내는 방식이 아니라, 기존 theme language를 더 풍부하게
만드는 방식이어야 한다. 기존 2-2 시안이 이미 잘 해결한 부분은 유지하고, 새로
필요해진 affordance만 자연스럽게 얹는다.

- Scratch tools section 통합 방식
- selected Scratch context 표현
- edit/trash icon의 theme-specific 처리
- Archive Scratch completion affordance
- Staging invalid/unavailable drop tone
- Remove-from-staging affordance
- Hierarchy Node-only / Bit-only drop signal
- Hierarchy placement result as real Node/Bit card + Undo recovery
- Direct row placement의 node/bit 선택 + path 확인 affordance

## 성공 기준

- 8개 theme 모두 기존 2-2의 디자인 정체성을 유지한다.
- 8개 theme 모두 EN/KR toggle에 대응한다.
- 최신 Inbox/Triage 기능이 시안 안에서 빠짐없이 보인다.
- 새 기능이 시안 위에 억지로 붙은 느낌이 아니라, 각 theme의 언어 안에 흡수되어 보인다.
- main 구현의 낮은 visual style을 복사하지 않는다.
- Preview UI는 검토에 충분하고, 추후 삭제 가능한 임시 UI로 분리되어 있다.
