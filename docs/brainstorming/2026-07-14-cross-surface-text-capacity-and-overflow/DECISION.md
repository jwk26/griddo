# Cross-Surface Text Capacity and Overflow

## Metadata

- Created: 2026-07-14
- Updated: 2026-07-14
- Readiness: draft
- Category: content display, interaction, typography, accessibility
- Source project: `griddo2-claude`
- Functional baseline: `griddo2-claude` commit `48af728e872217a340c0d02ac5bec58e3ea09c36`
- Visual reference: `griddo2-claude-themes2-3` commit `4f39709688ceb4cac5e15d4e3502186b1f1c801b`
- Origin topic: `2026-06-25-inbox-triage-theme-surface-redesign`
- Tags: text-capacity, overflow, ellipsis, wrapping, node, bit, breakdown, scratch, ime

## Summary

Scratch, Breakdown content, Node title와 Bit title은 서로 다른 저장 한도와 surface shape를
갖지만 현재 UI는 여러 위치에서 단순 ellipsis에 의존한다. 이 주제는 Inbox/Triage 승격
결정과 분리하여, 같은 item이 Scratch Pool, Breakdown, Staging과 Grid를 이동할 때 어느
정도의 text를 직접 보여주고 전체 내용을 어떻게 확인·편집하게 할지 통합적으로 결정한다.

이 문서는 아직 결론이 아니다. 실제 main과 8개 theme source를 감사하고 사용자 interview를
거친 뒤 display, overflow와 editor contract를 확정한다.

## Why This Is A Separate Brainstorming Topic

`2026-06-25-inbox-triage-theme-surface-redesign/DECISION.md`는 Inbox/Triage의 승격 범위와
placement lifecycle을 결정한다. 반면 text capacity는 main Grid의 공용 Node/Bit card,
Staging, search, DnD preview와 localization에도 영향을 준다.

한 section의 ellipsis만 수정하면 같은 item이 surface마다 다른 양으로 보이거나, title을
확인하기 위해 사용자가 어디로 이동해야 하는지 불분명해질 수 있다. 따라서 공용
cross-surface contract로 별도 논의한다.

## Known Data Constraints

현재 production schema의 저장 한도는 다음과 같다.

| Item | Stored field | Current maximum |
|---|---|---:|
| Scratch | Bit `title` | 200 characters |
| Breakdown Row | `content` | 1,000 characters |
| Node | `title` | 100 characters |
| Bit | `title` | 200 characters |

저장 한도와 화면 표시 한도는 같은 개념이 아니다. 이 brainstorming은 schema maximum을
그대로 card에 노출한다는 전제를 두지 않는다.

## Placement Dependency

Inbox/Triage 승격 결정은 다음 data-validity boundary를 제공한다.

- Breakdown source content를 자동 truncate하지 않는다.
- staged candidate가 Node/Bit title limit을 넘으면 별도의 `Result title` 수정·확인 modal을
  거치고 source Breakdown content는 원문을 유지한다.
- Direct Breakdown placement에는 title editor를 넣지 않는다. `1~100`자는 Node/Bit,
  `101~200`자는 Bit만 허용하며, `201~1,000`자는 두 type을 unavailable 처리한다.

이 brainstorming은 위 data-validity boundary를 입력으로 받아 modal, card와 editor에서 text를
몇 줄까지 보이고 전체 text에 어떻게 접근할지를 다룬다.

## Primary Surfaces In Scope

### Scratch

- expanded Scratch Pool row title
- collapsed Scratch switcher의 accessible name과 optional visual hint
- Selected Scratch Context title과 completion state에서의 title

### Breakdown

- active Breakdown row content
- staged/de-emphasized row content
- inline row editor
- empty/completion message와 긴 Scratch title 조합

### Staging

- staged Node candidate card
- staged Bit candidate row
- candidate drag token
- Placement Affordance의 source content와 result title

### Grid

- main Grid Node card
- main Grid Bit card
- Grid Explorer Node/Bit row
- newly placed Node/Bit state와 Undo가 함께 있을 때의 text area
- Grid Explorer search result title과 full breadcrumb

## Questions To Resolve

### Display Capacity

- 각 surface가 기본적으로 한 줄, 두 줄 또는 그 이상을 보여줄지
- character count가 아니라 container width와 line count를 기준으로 정의할지
- responsive viewport와 8개 theme font metric 차이를 어떤 token으로 흡수할지
- Node와 Bit의 shape 차이가 display capacity에 어떤 차이를 만드는지

### Overflow And Full-Text Access

- ellipsis, wrapping, line clamp와 expansion을 surface별로 어떻게 선택할지
- hover가 없는 touch와 keyboard 환경에서 전체 text를 어떻게 확인할지
- tooltip, popover, detail view 또는 inline expansion 중 어떤 패턴을 사용할지
- expansion이 Grid layout, DnD hitbox와 section ratio를 변경해도 되는지

### Editing

- Breakdown inline editor를 single-line 또는 multiline으로 만들지
- multiline이면 Enter, Shift+Enter, Cmd/Ctrl+Enter의 역할을 어떻게 나눌지
- 한글 IME composition 중 Enter가 save로 오인되지 않도록 어떤 contract를 둘지
- display clamp와 edit field height 사이의 전환을 어떻게 안정화할지

### Accessibility And Localization

- screen reader에는 시각적으로 잘린 text의 전체 값을 제공할지
- visible truncation과 accessible name이 불일치할 때 중복 낭독을 피하는 방법
- EN/KR resource와 theme별 한글 font metric에서 line count가 달라지는 문제
- 긴 한국어 compound text와 긴 영문 단어의 wrapping 차이

## Audit Inputs

결정 전에 다음 source를 직접 비교한다.

- `src/components/triage/scratch-pool.tsx`
- `src/components/triage/breakdown-panel.tsx`
- `src/components/triage/staging-zone.tsx`
- `src/components/triage/hierarchy-explorer.tsx`
- `src/components/grid/node-card.tsx`
- `src/components/grid/bit-card.tsx`
- 관련 component tests와 schema validation
- `griddo2-claude-themes2-3/src/app/prototype/inbox-triage-*/page.tsx`의 8개 최종 route

시안의 ad-hoc state와 duplicated markup은 구현 근거로 사용하지 않는다. surface별 실제
text hierarchy, font, padding, radius와 overflow treatment만 visual evidence로 사용한다.

## Interview Order

1. 같은 item의 full text를 어느 surface에서 반드시 읽을 수 있어야 하는지 결정한다.
2. Scratch Pool, Breakdown, Staging Node/Bit, Grid Node/Bit의 기본 line capacity를 정한다.
3. ellipsis 이후 full-text reveal interaction을 정한다.
4. Breakdown editor의 single-line/multiline과 IME keyboard contract를 정한다.
5. responsive, 8-theme typography, EN/KR와 accessibility를 검증한다.
6. test matrix와 canonical amendment target을 정한다.

질문은 한 번에 하나씩 진행한다. 각 답변은 정상 흐름뿐 아니라 edit, DnD, search,
placement, viewport 변경과 page exit까지 user flow를 따라 검증한다.

## Out Of Scope Until Interview Completion

- schema maximum 변경
- Node/Bit card의 새로운 visual design 탐색
- 8개 theme typography 자체의 교체
- production component 구현
- 현재 Inbox/Triage promotion 문서에 미확정 ellipsis 값을 추가하는 작업
