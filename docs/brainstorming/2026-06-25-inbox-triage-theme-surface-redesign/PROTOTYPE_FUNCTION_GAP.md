# Inbox/Triage 2-2 Prototype vs Phase 22 Implementation - Functional Gap

## 목적

이 문서는 Phase 22 production 구현에는 존재하지만, Inbox/Triage 2-2
prototype에는 없거나 오래되었거나 명확히 표현되지 않은 기능 요소를 정리한다.

2-3 prototype update는 각 theme의 기존 visual language를 보존하면서,
이 요소들을 prototype에 반영해야 한다.

Production은 behavior reference일 뿐이다. 2-2 prototype이 design source다.

## Prototype 요구사항으로 취급하지 말 것

일부 production behavior는 실제 구현 mechanics이지만 visual prototype에서 구현하거나
설명할 필요는 없다.

Prototype 작업 시간을 아래 항목에 쓰지 않는다:

- 첫 키 입력 시 Scratch Pool collapse mechanics
- production store/state wiring
- 실제 database persistence
- production hooks/components의 정확한 이식
- production accessibility 구현의 정확한 복제
- production의 blank spacer artifact

Prototype은 production internals를 재현하는 것이 아니라, 의도된 UX와 visual state를
보여주면 된다.

## 2-3에서 추가하거나 수정할 기능 요소

### Scratch Pool

#### 2-2에서 없거나 불완전한 것

- Scratch title search.
- Created-at sorting.
- Sort button state/mode visibility.
- Collapsed Scratch switching이 없거나 production보다 약할 수 있음.

#### 2-3 target

- Expanded Scratch Pool에는 다음을 포함하는 하나의 designed tools area가 있어야 한다:
  - Inbox identity
  - Scratch count
  - collapse/expand control
  - search
  - sort button
- Tools는 서로 관련 없는 stacked header strip처럼 보이면 안 된다.
- Scratch list는 별도의 lower area로 남긴다.
- Sort state는 시각적으로 명확해야 한다. 사용자는 현재 sort mode 또는
  active/inactive state를 이해할 수 있어야 한다.
- Collapsed Scratch switching은 selected Scratch target이 inactive target보다
  더 두드러지게 보여야 한다.
- Visible label `Scratch Pool`은 표시하지 않는다.

### Breakdown

#### 2-2에서 없거나 불완전한 것

- Selected Scratch context가 production에는 있지만 prototype에는 없거나 너무 약할 수 있음.
- Production은 grip-only Breakdown dragging을 사용하지만, 오래된 prototype은 full-row dragging처럼 보일 수 있음.
- Archive Scratch completion affordance가 명확히 표현되지 않았을 수 있음.

#### 2-3 target

- Selected Scratch context는 시각적으로 강하고, 아래 질문에 명확히 답해야 한다:
  "What Scratch am I breaking down right now?"
- 일반 Breakdown row처럼 보이면 안 된다.
- 기존 prototype에 input-side submit affordance가 있다면 유지한다. Production에 강한
  submit button이 없다는 이유로 prototype에서 제거하지 않는다.
- Grip-only dragging affordance를 보여준다. Full-row dragging처럼 보이게 하지 않는다.
- 모든 row가 소비된 상태에서 Archive Scratch가 의도적인 completion affordance로
  보이게 한다.
- Visible label `Breakdown / Scribble`은 표시하지 않는다.

### Staging

#### 2-2에서 없거나 불완전한 것

- Remove-from-staging behavior가 보이지 않거나 의도적으로 느껴지지 않을 수 있음.
- Invalid drop state가 destructive하거나 불명확하게 읽힐 수 있음.
- Node/Bit 구분이 visible label에 지나치게 의존할 수 있음.

#### 2-3 target

- Node와 Bit staging zone은 분리해 유지한다.
- 다음과 같은 visible developer label은 사용하지 않는다:
  - `Staging: Nodes`
  - `Staging: Bits`
  - `Nodes`
  - `Bits`
- Node vs Bit staging은 design을 통해 이해 가능해야 한다:
  - layout
  - icon
  - item shape
  - empty state
  - theme-specific affordance
- Remove-from-staging은 theme-specific하고 의도적으로 느껴져야 한다.
- Remove-from-staging은 non-destructive하게 유지한다.
- Invalid drop은 destructive-red가 아니라 unavailable 또는 muted하게 느껴져야 한다.

### Hierarchy

#### 2-2에서 없거나 불완전한 것

- Active-section-scoped hierarchy search가 없거나 decorative 수준일 수 있음.
- Query/result indicator가 없을 수 있음.
- Search clear affordance가 없거나 text-heavy할 수 있음.
- Search scope가 visual section emphasis가 아니라 text로 표시될 수 있음.
- Placement가 inline pending이 아니라 즉시 배치되거나 modal 기반처럼 보일 수 있음.
- Visible `L1`, `L2`, `L3` label은 지나치게 developer-oriented함.

#### 2-3 target

- Search는 hierarchy menu/surface 내부에 있어야 하며, detached bar처럼 보이면 안 된다.
- Search는 active-section-scoped filtering을 표현해야 한다.
- Search indicator는 다음을 보여야 한다:
  - query text
  - result count
  - X clear button
- Search pill 안에 visible scope text를 표시하지 않는다.
- Scope는 active section emphasis와 inactive section de-emphasis로 보여준다.
- Visible label은 다음을 사용한다:
  - Home
  - Level 1
  - Level 2
  - Level 3
- Visible `L1`, `L2`, `L3`는 사용하지 않는다.
- 각 section heading 아래에 selected Node title을 반복 표시하지 않는다.
- Modal/direct placement presentation을 target hierarchy column 내부의 inline pending
  placement card로 대체한다.

예:

```text
Placed Item
Node: Q3 Announcement Planning
[Cancel] [Confirm]
```

- Confirm 전에는 committed된 것처럼 보이면 안 된다.
- Cancel은 pending card를 제거한다.
- Pending card는 theme-specific해야 한다.

## 이어받지 말아야 할 오래된 prototype behavior

- Full-row Breakdown dragging.
- Focus-triggered Scratch Pool collapse.
- Visible developer labels.
- Confirmation 없는 direct hierarchy placement.
- Modal hierarchy placement confirmation.
- Hierarchy search pill 안의 visible scope text.
