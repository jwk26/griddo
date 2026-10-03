# Inbox/Triage theme realization 재계획

> Started: 2026-10-03
> Status: Planning-ready direction; canonical promotion and document approval pending
> Origin: 기존 conformance 범위로는 시안의 세부 표현을 완성하지 못해, 실험을 끝내고 실제 테마 작업을 단계적으로 재계획한다.
> Related phase: Phase 31 / accepted Task 163 / unaccepted Tasks 164–165
> Parent document: `docs/EXECUTION_PLAN.md`; 기존 `2026-06-25-inbox-triage-theme-surface-redesign/DECISION.md`

이 문서는 사용자가 확정한 방향을 새 계획의 입력으로 정리한다. 이전
기능 결정을 다시 만드는 문서나 skill 규칙의 대체물이 아니다. 방향에 대한
동의와 이 문서·promotion map·canonical 문서·구현의 승인은 구분한다.

## 1. 유지할 제품 기반과 이번 변경

이미 닫힌 Phase 30은 Tasks 159–162다. Task 163은 Phase 31의 route 통합
작업이며 수락되었지만 아직 main에 통합되지 않았다. 이번에는 Phase 31을
기술 통합 범위로 끝내고, 미완성 테마 표현과 최종 전체 gate의 책임을
새 후속 phase로 옮긴다. “Phase 31 종료”는 “8개 테마 완성”이 아니다.

기존 SCHEMA/SPEC, 14개 DP receipt, 9개 visual recipe, accepted Tasks
101–163의 제품 동작·상태 수명·데이터 경계는 유지한다. 저장 구조나
명령을 새로 만들지 않는다. Recipe의 source-only 사실과 production의
실제 렌더·사용자 시각 수락은 별개다.

## 2. 종료와 후속 delivery 결정

| ID | 채택한 결정 |
|---|---|
| D01 | Phase 30의 marker, receipt, archive, evidence와 Git 이력을 변경하거나 reopen하지 않는다. |
| D02 | Phase 31은 accepted Task 163의 canonical route 통합과 별도 승인된 좁은 기술 수리·종료 검증 범위로 축소한다. |
| D03 | Task 164는 미수락 그대로 `Transferred / Superseded` 이관 기록을 남기며 `[x]` 또는 Accepted로 만들지 않는다. |
| D04 | Task 165도 미수락 그대로 이관하며, 원래 complete implementation/preservation gate의 책임을 마지막 전체 검증 phase에 남긴다. |
| D05 | Phases 32–33은 retired-number reservation을 유지한다. 새 task는 166부터 사용하고 164·165의 번호나 뜻을 재활용하지 않는다. |
| D06 | 테마 작업 순서는 Phase 34 Retro Mac, 35 Neumorphism, 36 Terminal, 37 Claymorphism + Origami, 38 GridDO + Tiny Desk, 39 Graphite로 계획한다. 앞의 세 테마는 각각 하나씩 진행한다. |
| D07 | Phase 40은 전체 테마·흐름의 integration/full gate를 소유한다. 29 UF, 10 AF, 21 NEG, 14 DP/12 VQ, 9 recipes, migration/rollback/ABA/retention/recovery 및 unrelated-surface 검증 책임을 누락하지 않는다. |
| D08 | 새 phase의 상세 task/file/dependency/commit 계약과 Next Numbers는 canonical 실행 계획에서 완성하고 flow review한다. 이 topic은 새 phase 착수나 Git lifecycle 승인이 아니다. |
| D09 | `NodeGridBody`의 Next route export 충돌은 Task 163 변경에 대한 좁은 Phase 31 수리 대상으로 다룬다. 기존 수락 evidence를 변경된 source의 fresh pass로 재사용하지 않는다. |
| D10 | Phase 31 Final Close에는 당시 유효한 범위의 기술 gate와 issue disposition이 필요하다. 이관으로 알려진 기술 실패를 성공 처리하거나 수락을 조작하지 않는다. |

원래 Task 164의 conformance 책임은 Phases 34–39의 구현과 Phase 40의
전체 matrix로 분해한다. 원래 Task 165의 all-nodes sink는 Phase 40에
이어진다. 이관은 삭제가 아니라 책임 재배치다.

## 3. 실제 테마 구현 방법

외부 방법론 기록은 `/Users/jwk/Documents/docs/prototype-to-production.md`다.
실험의 코드·이미지를 실행 입력으로 가져오지 않고 다음 방법만 적용한다.

| ID | 채택한 결정 |
|---|---|
| D11 | 공통 화면 틀을 먼저 고정하고 Pool → Breakdown → Staging → Explorer/Finder → Placement·Newly/Undo·Archive 순서의 영역 단위로 구현한다. |
| D12 | 영역별 첫 제출 전에 같은 논리 데이터·선택·query/sort/edit/staged 상태와 theme/mode/viewport/DPR/zoom/font/motion 조건을 맞춘다. |
| D13 | 보이는 틀·제목·메타·버튼·아이콘·행·입력·빈 상태·장식을 prototype source/DOM → 실제 computed style/geometry → production owner로 대응시킨다. |
| D14 | CSS 선언이나 “같은 테마의 공통 글꼴”이라는 추정으로 적용 결과를 대신하지 않는다. 실제 요소별 font·좌표·크기·간격·색·border/radius/shadow 및 cascade 결과를 확인한다. |
| D15 | 외형 계약과 기능 보존 계약을 분리한다. Save/Cancel, attached status, pending/error/locked/recovery 등 production-only 상태는 지우지 않고 승인된 의미를 유지해 조화시킨다. |
| D16 | 첫 사용자 제출 전에 새 원본 크기 1:1 비교 → 내부 수정 → 재비교를 한다. resize로 차이를 숨기지 않고 남긴 차이와 이유를 공개한다. |
| D17 | Hover/focus/DnD/animation은 정지 이미지 외에 실제 trigger·transition·interruption과 reduced-motion 동작으로 확인한다. |
| D18 | 영역별 사용자 시각 disposition을 받은 뒤 다음 영역으로 진행한다. 동일한 coherent Working에서 승인 범위의 측정·내부 보완을 이어가며, 일상적인 측정을 별도 session/승인 batch로 분리하지 않는다. |
| D19 | 사용자 시각 수락과 기술 gate를 독립 판정한다. CSS 문자열 테스트, 구현자 self-review, 전체 test 통과는 시각 수락을 대신하지 않으며 시각 수락도 기능·기술 통과를 대신하지 않는다. |
| D20 | 첫 제출 전 내부 보완과 첫 사용자 판정 후 보완을 구분해 영역별 결과·남은 차이·수정 cycle을 기록한다. |

## 4. 토큰과 구현 품질

| ID | 채택한 결정 |
|---|---|
| D21 | 기존 semantic token → 영역/요소/상태의 role alias → theme 값이라는 일원화 방향을 유지한다. 이미 허용된 `--triage-<role>-*` vocabulary를 확장하며 모든 pixel을 무조건 새 token으로 만들지는 않는다. |
| D22 | 하나의 semantic production component tree를 유지한다. Theme ID별 JSX 분기, 8개 별도 production 구현, prototype의 mock/local mutation architecture를 도입하지 않는다. |
| D23 | CSS만으로 목표를 실현할 수 없다면 새 계획에 구조/semantic component owner와 직접 test를 명시한다. 원래 Task 164의 CSS-only 계약을 새 작업 전체의 제약으로 상속하지 않는다. |
| D24 | Light의 영역별 완성부터 진행하되 각 테마 phase 완료 시 지원되는 dark·1024px/1920×1080·접근성·motion과 기존 테마/다른 영역의 회귀를 검증한다. 마지막 Phase 40에서 8 themes × light/dark의 전체 matrix를 검증한다. |
| D25 | 고정 높이/overflow로 편집·상태·복구·focus를 가리지 않으며, 새 theme CSS와 공유 JSX의 다른 mode/theme 누출을 검증한다. 누적 override나 test ID 의존 선택자를 성공 방법으로 채택하지 않는다. |
| D26 | 기존 DP의 정확한 동작/문구/배치와 새 외형이 실제로 충돌하면 affected element와 영향만 사용자 결정으로 올린다. 시안의 mock 동작·이웃 surface를 자동 fallback으로 쓰지 않는다. |
| D27 | `P29-01 / D-CARD`와 다섯 기존 deferral은 자동 해제하지 않는다. Inbox의 실제 Node/Bit card 표현에 추가 owner가 필요하면 그 좁은 범위를 별도 사용자 결정으로 정하고, 공용 카드 전체 redesign/Korean QA까지 묵시적으로 확대하지 않는다. |

## 5. 실험 폐기와 workflow 개선

| ID | 채택한 결정 |
|---|---|
| D28 | Test 1–8의 순서·내용/초점·사용자 평가·방법 교훈은 외부 방법론 파일에만 보존한다. 실험 code/CSS/tests/fixture/runner/이미지/report/evidence bytes를 새 실제 구현에 복사·적응·재사용·import·cherry-pick·merge하지 않는다. |
| D29 | Canonical worktree의 Test 2 net changes만 additive 정정으로 제거하며 Task 163과 9/8–9의 별도 canonical audit를 보존한다. 전체 branch reset, history rewrite, ledger의 통째 anchor 치환을 하지 않는다. |
| D30 | 과거 “실험 asset 보존” 지시는 새 exact 폐기 disposition에서 명시적으로 대체한다. 실험 receipt/report/assets를 현재 tree에서 제거하더라도 Task 163 수락 및 실험 반려·폐기 사실은 ledger에 최소한의 이력으로 남긴다. Git의 기존 commit을 purge하는 계획은 아니다. |
| D31 | 사용자 지시에 따라 마지막 Neumorphism 실험의 별도 결과/종료 보고서, ledger 종료 커밋이나 상세 보존 기록은 새로 만들지 않는다. 교훈은 기존 외부 방법론 파일만 유지한다. 사용자 종료·폐기 disposition과 정확한 삭제 대상 확인은 통합 cleanup 범위에서 처리하며, 폐기할 실험의 오래된 active 표기로 그 실험을 재개하거나 승계하지 않는다. |
| D32 | 폐기 대상은 식별된 8개 실험 worktree/branch와 그 귀속이 입증된 runtime뿐이다. Protected main/Phase 31 기능 worktree/prototype/관련 없는 worktree와 현재 session host는 대상이 아니다. Exact cleanup gate와 안전 guard를 통과한 대상만 처리한다. |
| D33 | Step 2 canonical 재계획과 Step 5 workflow/skill audit는 현재 Control Tower가 직접 판단·작성·검증한다. 나머지 조사/승인된 구현은 Luna xhigh를 활용하되 단일 writer와 비충돌 scope를 지킨다. |
| D34 | 설치된 skill/resolver/shared contract/workflow test 변경은 Phase 31 Final Close 이후 별도 scope에서 한다. Deferred workflow finding을 먼저 사실·현재 규칙과 대조하고, 개선이 필요한 부분만 변경한다. |
| D35 | Prototype 방법의 workflow 적용은 조건부 참조/핵심 실행 연결을 우선 검토한다. 기존 skill에 있는 절차를 거대한 공통 checklist로 중복하지 않는다. 이 topic 자체는 skill 변경 권한이 아니다. |
| D36 | Phase 31 수리·정정·Final Close와 main sync를 끝낸 뒤 workflow audit 및 승인된 후속 계획을 바탕으로 정상 `run-phase`/`run-task`로 실제 테마 작업에 들어간다. Experiment branch를 main 구현으로 승격하지 않는다. |

## 6. 남은 결정과 경계

사용자가 정한 방향은 위와 같지만, exact 삭제 대상·수리 owner·canonical
문서와 실제 phase gate는 각각 해당 승인 경계를 유지한다. Card owner 범위,
기존 고정 치수와 prototype의 실제 충돌, mounted Staging target-reason
finding의 제품 영향은 `PROMOTION_MAP.md`의 질문별 owner/resume condition으로
관리한다. 질문 하나가 불필요하게 전체 테마를 막도록 만들지 않는다.

이 단계는 문서 초안이다. Task 163의 기존 수락을 취소하지 않았고,
Tasks 164–165를 수락하거나 Phase 31을 닫지 않았다.
