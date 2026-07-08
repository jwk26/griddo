# Antigravity Prompt - Inbox/Triage 2-4 Prototype Update

## 작업 목표

`griddo2-claude-themes2-2`의 8개 Inbox/Triage 시안을 기반으로 새 2-4 시안
worktree를 만든다.

이 작업은 production code 구현이 아니다. 현재 main 구현에 존재하는 최신
Inbox/Triage 기능/UX 상태를 2-2 시안의 디자인 언어 안에 반영해, 8개 theme
prototype을 최신 시안으로 업데이트하는 작업이다.

2-2 시안은 디자인 기준이다. main 구현은 기능/UX reference다. main의 visual
style은 복사하지 않는다.

## 핵심 원칙

- 재창조가 아니라 업데이트다.
- 2-2 시안의 미감, theme identity, design point를 보존한다.
- 요청사항은 기존 2-2 시안의 디자인 문법 안에서 개선한다.
- 기능을 실제 production 수준으로 구현할 필요는 없다.
- static/mock/light interaction으로 UX 상태가 이해되면 충분하다.
- 기존 시안의 구조와 제약을 훼손하지 않는다.
- 새 기능을 넣기 위해 기존 시안의 구도, 밀도, 질감, typography, 색감, 장식 언어,
  motion 감각을 깨지 않는다.
- 미해결 UX 영역에서는 Antigravity의 Design/UX 창의성을 보여준다.
- emoji는 사용하지 않는다. 시안 프로젝트 공통 규칙으로 lucide icon을 사용한다.

작업 시 각 theme가 이미 사용하는 header, surface, button, badge, row, card,
icon 처리 방식을 먼저 관찰하고 그 언어를 확장한다. main 구현 스타일이나 하나의
generic component를 8개 theme에 동일하게 붙이는 방식은 피한다.

## Repo / Worktree

### Production Reference

- Repo: `/Users/jwk/Documents/griddo2-claude`
- 용도: 현재 Inbox/Triage 기능과 UX 이해
- 직접 수정 금지

### Prototype Source

- Worktree: `/Users/jwk/Documents/griddo2-claude-themes2-2`
- 용도: 2-2 시안 디자인 source
- 직접 수정 금지

### Prototype Target

- 새 worktree: `/Users/jwk/Documents/griddo2-claude-themes2-4`
- 새 branch: `griddo2-claude-themes2-4`
- `griddo2-claude-themes2-2`를 기반으로 만든다.
- target worktree/branch가 이미 존재하면 덮어쓰지 말고 멈춰서 보고한다.

## 반드시 읽을 문서

Primary brief:

- `/Users/jwk/Documents/griddo2-claude/docs/brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/PROTOTYPE_FUNCTION_GAP_2_4.md`

이 문서가 이번 작업의 주된 판단 기준이다. 2-2 시안과 main 구현의 차이,
2-4 시안에 반영해야 할 기능/UX, Antigravity 창의성이 필요한 영역을 정리한다.

## Production Behavior Reference

아래 파일은 read-only reference다. 기능/UX 이해용으로만 읽고 production code는
수정하지 않는다.

- `/Users/jwk/Documents/griddo2-claude/src/components/triage/triage-workspace.tsx`
- `/Users/jwk/Documents/griddo2-claude/src/components/triage/scratch-pool.tsx`
- `/Users/jwk/Documents/griddo2-claude/src/components/triage/breakdown-panel.tsx`
- `/Users/jwk/Documents/griddo2-claude/src/components/triage/staging-zone.tsx`
- `/Users/jwk/Documents/griddo2-claude/src/components/triage/hierarchy-explorer.tsx`

## Prototype Design Source

아래 8개 파일은 디자인 source다. 먼저 읽고 각 theme의 디자인 언어를 파악한다.

- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-griddo/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-tiny-desk/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-neumorphism/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-claymorphism/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-origami/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-terminal/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-retro-mac/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-graphite/page.tsx`

## 작업 대상

2-4 worktree에서 아래 8개 route를 모두 업데이트한다.

- `src/app/prototype/inbox-triage-griddo/page.tsx`
- `src/app/prototype/inbox-triage-tiny-desk/page.tsx`
- `src/app/prototype/inbox-triage-neumorphism/page.tsx`
- `src/app/prototype/inbox-triage-claymorphism/page.tsx`
- `src/app/prototype/inbox-triage-origami/page.tsx`
- `src/app/prototype/inbox-triage-terminal/page.tsx`
- `src/app/prototype/inbox-triage-retro-mac/page.tsx`
- `src/app/prototype/inbox-triage-graphite/page.tsx`

공통 helper나 preview UI 파일은 2-4 worktree 내부 파일일 때만 수정 가능하다.

## 작업 순서

1. `PROTOTYPE_FUNCTION_GAP_2_4.md`를 읽는다.
2. production behavior reference 파일 5개를 read-only로 확인한다.
3. 2-2 시안 8개 route를 확인한다.
4. 사용자에게 먼저 update plan을 제시한다.
5. 사용자 승인 후 2-4 worktree/branch를 만든다.
6. 2-4 worktree에서만 시안을 수정한다.
7. 작업 결과를 route별, section별로 요약해 보고한다.

## 승인 전 제시할 Update Plan

파일 수정이나 worktree 생성 전에 아래 형식으로 계획을 먼저 제시한다.

- 공통 구조 변경 요약
- 기존 2-2 디자인 보존 전략
- Preview UI 계획
- EN/KR toggle 계획
- section별 계획:
  - Scratch Pool
  - Breakdown
  - Staging
  - Hierarchy/Grid
- theme별 보존할 디자인 포인트:
  - griddo
  - tiny-desk
  - neumorphism
  - claymorphism
  - origami
  - terminal
  - retro-mac
  - graphite
- theme별로 새 요구사항을 기존 디자인 언어에 흡수하는 방식
- Antigravity 창의성이 필요한 영역:
  - Archive Scratch completion affordance
  - Staging invalid/unavailable drop tone
  - Remove-from-staging affordance
  - Hierarchy placement affordance
  - Direct row placement affordance

## 반드시 반영할 공통 사항

용어 정의:

- `Preview heading`: theme 시안을 감싸는 preview shell/body 상단의 제목.
- `Section label/header/chrome`: theme 내부의 `Scratch Pool`, `Breakdown`,
  `Staging`, `Grid` 같은 영역 제목과 주변 장식.
- Preview heading은 삭제한다.
- Theme 내부 section label/header/chrome은 유지한다.

- Sidebar에 1-8 numbered theme switcher를 만든다.
- Sidebar에 EN/KR toggle을 둔다.
- 모든 theme에 한국어 버전을 만든다.
- 한국어 버전은 영어와 다른 font treatment를 사용한다.
- Body 상단 preview heading은 삭제한다.
- retro mac theme은 기존 heading/chrome을 유지한다.
- terminal theme은 heading의 디자인 요소만 theme 내부로 흡수하고 preview heading은 삭제한다.
- origami theme의 가위 motif가 emoji가 아니라면 edit button icon으로 재사용한다. emoji라면 lucide `Scissors`를 사용한다.
- 모든 주요 list/section에서 visible scrollbar chrome을 제거한다.
- emoji 금지. lucide icon 사용.

## 반드시 반영할 UX

### Scratch Pool

- 기존 label/header는 유지한다.
- tools section(상) + scratch list section(하) 2구조로 만든다.
- tools section 안에 identity/count/collapse/search/sort를 통합한다.
- search bar + sort button은 한 줄에 둔다.
- sort button은 theme별로 개성 있게 디자인한다.
- sort button은 clicked/unclicked 또는 asc/desc 상태가 구분되어야 한다.
- collapsed 상태에서는 모든 요소를 세로로 배치한다.

### Breakdown

- 기존 label/header는 유지한다.
- desc/asc toggle button을 추가한다.
- scribble input 우측에 Submit button을 둔다.
- selected Scratch context를 일반 row보다 강하게 표현한다.
- Scratch context에 edit button을 추가하고 상시 표시한다.
- Breakdown row에 edit/trash icon을 상시 표시한다.
- row numbering을 제거한다.
- row time text를 제거한다.
- staging된 row는 사라지지 않고 상태별로 다르게 보인다.
- 실제 placement가 완료된 row는 소비되어 사라지는 것으로 표현한다.
- Breakdown row가 하나도 없고 archive alert가 화면을 덮고 있지 않을 때는 Breakdown section 배경에 theme-specific 유인물을 표시한다. 문구는 generic하게 고정하지 말고 theme별 언어로 만든다.
- 모든 row가 소비되면 Breakdown section 전체를 blur 처리하고 archive affordance를 띄운다.
- archive affordance에는 Cancel/OK가 있어야 한다.
- Cancel 후에는 section 내부에 archive affordance open UI가 표시된다.
- 이때 Scratch context는 theme별 "Scratch 완료" 상태로 표현한다.

### Staging

- Section label/header는 유지한다.
- Node/Bit staging section에 아무 item도 없을 때 section 내부 empty placeholder label은 표시하지 않는다.
- Node는 card/icon/grid 성격, Bit는 row/list 성격을 유지한다.
- remove-from-staging 기능을 theme별로 창의적으로 표현한다.
- Node/Bit를 Breakdown section으로 DnD할 때도 remove-from-staging과 같은 의미로 표현한다.
- invalid drop tone은 현재 main 구현을 복사하지 말고 theme별로 새롭게 제안한다.

### Hierarchy / Grid

- Search Bar는 2-2 시안의 위치를 유지한다.
- Label은 `Home`, `Level 1`, `Level 2`, `Level 3` / `홈`, `레벨 1`, `레벨 2`, `레벨 3`를 사용한다.
- section visible label 아래 selected node title 반복은 제거한다.
- 선택된 node는 item 자체 색상/표면/강조로 표현한다.
- Search clear는 X affordance만 사용한다. visible `Clear` text는 쓰지 않는다.
- Home은 Node only, Level 3는 Bit only임을 DnD 상태에서 theme별로 표현한다.
- Staging을 거친 Node/Bit가 drop되면 기존처럼 Placement Affordance를 표시하고 Confirm/Yes 후 배치한다.
- Confirm/Yes 후에는 checkbox + `Node: ...` 같은 placed indicator card가 아니라 실제 Node/Bit card를 target path에 배치한다.
- 실제 배치된 Node/Bit card 우측에는 Undo button을 표시한다. Undo 시 staged Node/Bit는 다시 Staging section으로 돌아간다.
- Row 자체가 바로 drop되면 먼저 node/bit 선택과 target path를 보여주는 modal-like affordance를 표시한다.
- Direct row affordance의 node/bit 선택지는 target column constraint를 따른다. Home에서는 Node만, Level 3에서는 Bit만 가능하게 보인다.
- 이후 기존처럼 Placement Affordance/Confirm 단계를 거치고, Confirm 후 실제 Node/Bit card를 target path에 배치한다.
- Direct row drop으로 배치된 실제 Node/Bit card 우측에도 Undo button을 표시한다. Undo 시 원래 Breakdown row로 돌아간다.

## 하지 말 것

- production code 수정 금지
- `griddo2-claude-themes2-2` 직접 수정 금지
- main 구현의 visual style 복사 금지
- 8개 theme를 하나의 공통 스타일로 평준화 금지
- 기존 2-2 시안의 정체성 훼손 금지
- emoji 사용 금지
- visible `L1`, `L2`, `L3`, `Home-L3`, `H1-L3` 사용 금지
- search에 visible `Clear` text 사용 금지
- Confirm 후 최종 결과를 checkbox + `Node: ...` 같은 placed indicator card로 대체하기 금지
- production persistence/hooks/store 구현 금지

## 작업 결과 보고

보고할 것:

- 새 worktree/branch
- 변경한 파일 목록
- 8개 route 작업 범위 요약
- EN/KR toggle 확인 결과
- Preview sidebar theme switching 확인 결과
- section별 visible changes:
  - Scratch Pool
  - Breakdown
  - Staging
  - Hierarchy/Grid
- theme별 특이사항:
  - griddo
  - tiny-desk
  - neumorphism
  - claymorphism
  - origami
  - terminal
  - retro-mac
  - graphite

## 기대 결과

`griddo2-claude-themes2-4` worktree에 8개 Inbox/Triage 2-4 시안이 생성된다.
각 시안은 2-2의 theme identity를 유지하면서, 최신 Inbox/Triage 기능과 UX
상태를 사용자가 이해할 수 있게 보여준다.
