# Gemini Prompt - Inbox/Triage 2-3 Prototype Update

## 작업

기존 2-2 prototype worktree를 바탕으로 새로운 Inbox/Triage 2-3 prototype set을 만든다.

이 작업은 prototype/design 작업만 해당한다.

Production Inbox/Triage component는 수정하지 않는다.
기존 2-2 prototype을 제자리에서 수정하지 않는다.

## Repositories / Worktrees

Production behavior reference:

- Repo: `/Users/jwk/Documents/griddo2-claude`
- Phase 22는 완료되어 merge된 상태다.
- Production은 behavior 이해용으로만 사용한다.
- Production code는 수정하지 않는다.

Prototype source:

- Worktree: `/Users/jwk/Documents/griddo2-claude-themes2-2`
- Branch: `griddo2-claude-themes2-2`
- 현재 2-2 design의 source로 사용한다.

Prototype target:

- 2-2 worktree에서 새로운 2-3 worktree/branch를 만든다.
- Suggested worktree: `/Users/jwk/Documents/griddo2-claude-themes2-3`
- Suggested branch: `griddo2-claude-themes2-3`
- Target worktree 또는 branch가 이미 존재하면, 덮어쓰기 전에 멈추고 보고한다.

## Required Context

Prototype file을 변경하기 전에 아래 문서를 읽는다:

- `docs/brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/PROTOTYPE_FUNCTION_GAP.md`

이 문서는 2-2 prototype에서 없거나 오래되었거나 불명확한 production behavior를 정리한다.
이번 작업의 목표는 그 요소들을 2-3 prototype에 반영하는 것이다.

## 수정 대상 Route

8개 Inbox/Triage prototype theme route를 모두 업데이트한다:

- `src/app/prototype/(inbox-triage)/inbox-triage-griddo/page.tsx`
- `src/app/prototype/(inbox-triage)/inbox-triage-tiny-desk/page.tsx`
- `src/app/prototype/(inbox-triage)/inbox-triage-neumorphism/page.tsx`
- `src/app/prototype/(inbox-triage)/inbox-triage-claymorphism/page.tsx`
- `src/app/prototype/(inbox-triage)/inbox-triage-origami/page.tsx`
- `src/app/prototype/(inbox-triage)/inbox-triage-terminal/page.tsx`
- `src/app/prototype/(inbox-triage)/inbox-triage-retro-mac/page.tsx`
- `src/app/prototype/(inbox-triage)/inbox-triage-graphite/page.tsx`

Shared prototype helper/style은 prototype worktree에 속해 있고 위 route를 지원하는 경우에만 수정할 수 있다.

## Design Direction

2-2 prototype이 design source다. Production은 behavior reference일 뿐이다.

Prototype이 production처럼 보이게 만들지 않는다.
각 theme의 visual language를 보존한다.
누락된 production behavior는 각 theme 고유의 design style로 표현한다.

## Required Updates

모든 theme에서:

- Scratch Pool search를 추가하거나 명확히 한다.
- Scratch created-at sorting을 추가하거나 명확히 한다.
- Sort state/mode를 시각적으로 이해 가능하게 만든다.
- Collapsed Scratch switching을 보존하고 selected target을 두드러지게 만든다.
- Breakdown의 selected Scratch context를 강화한다.
- 기존 theme-specific input-side submit affordance가 있으면 보존한다.
- Breakdown은 full-row draggable이 아니라 grip-only draggable로 보이게 한다.
- Archive Scratch가 의도적인 completion affordance로 보이게 한다.
- Visible developer label 없이 Node와 Bit staging을 분리해 유지한다.
- Remove-from-staging을 의도적이고 theme-specific하게 만든다.
- Invalid drop은 destructive-red가 아니라 muted/unavailable하게 유지한다.
- Active-section-scoped hierarchy search를 추가하거나 명확히 한다.
- Hierarchy search를 hierarchy surface 내부에 둔다.
- Query, result count, X clear affordance를 보여준다.
- Search scope는 pill 안의 visible text가 아니라 active/inactive section treatment로 보여준다.
- Visible hierarchy UI에서는 `Home`, `Level 1`, `Level 2`, `Level 3`를 사용한다.
- Immediate/modal placement presentation을 target hierarchy column 내부의 inline pending
  placement card로 대체한다.

## 하지 말 것

- Production component를 수정하지 않는다.
- Prototype을 production visual과 같게 만들지 않는다.
- Full-row Breakdown dragging을 되살리지 않는다.
- 다음 visible developer label을 표시하지 않는다:
  - `Scratch Pool`
  - `Breakdown / Scribble`
  - `Staging: Nodes`
  - `Staging: Bits`
  - `Hierarchy Explorer`
- Visible `L1`, `L2`, `L3`를 사용하지 않는다.
- Hierarchy search scope를 search pill 안의 visible text로 표시하지 않는다.
- 2-3 prototype에서 hierarchy placement를 modal confirmation으로 처리하지 않는다.
- Production persistence 또는 production hook을 구현하지 않는다.

## Verification

Prototype worktree 업데이트 후:

- 8개 prototype route가 여전히 render되는지 확인한다.
- Prototype worktree에서 사용하는 local build/check command를 실행한다.
- 변경된 file을 보고한다.
- Theme별, section별 visible change를 요약한다:
  - Scratch Pool
  - Breakdown
  - Staging
  - Hierarchy

## Expected Result

새 2-3 prototype worktree/branch가 생성되고, 8개 Inbox/Triage theme route가 모두
theme-specific visual character를 유지하면서 `PROTOTYPE_FUNCTION_GAP.md`에 정리된
post-Phase-22 Inbox/Triage behavior를 표현한다.
