# Inbox/Triage theme realization Notes

> Started: 2026-10-03
> Origin: 사용자가 확정한 Phase 31 범위 축소·후속 테마 phase·실험 폐기를 실제 계획으로 옮기는 준비
> Related phase: Phase 31 / Tasks 163–165
> Parent document: `docs/EXECUTION_PLAN.md`

## History & Prompt Notes

- 사용자는 기술 통합은 Task 163까지 끝났다고 판단하고, 실패/성공 실험의
  코드를 폐기한 뒤 theme별 실제 작업을 별도 phase로 진행하기로 했다.
- “Phase 30을 163까지 닫기”라는 표현은 이미 닫힌 Phase 30의 변경으로
  적용하지 않는다. Task 163이 속한 Phase 31의 잔여 범위를 이관한다.
- Retro Mac, Neumorphism, Terminal은 하나씩, 나머지는 두 테마 단위로
  점진 완성한다. 두 테마 묶음도 같은 shared file을 병렬로 쓰라는 뜻이 아니다.
- Step 2/5는 현재 Control Tower 직접 수행, 나머지 조사에는 사용자가
  지정한 `gpt-6-luna` / `xhigh`를 사용한다. 이번 3개 조사 agent는
  read-only advisory이며 새로운 Working lifecycle claimant가 아니다.
- 전체 Test 1–8 timeline은 외부 방법론 파일에 이미 정리되어 있다.
  실험 원본을 다시 복사하거나 새 감사 문서 묶음으로 보존하지 않는다.
- 사용자는 마지막 Neumorphism 실험의 별도 기록을 추가하지 않도록 지시했다.
  따라서 그 실험에 상세 결과/종료 문서나 ledger-only 종료 커밋을 만들지
  않는다. 삭제 대상 확인은 전체 cleanup에 포함하되 실험을 재개하지 않는다.

## Read-only qualification — 2026-10-03

| 항목 | 관찰한 사실 |
|---|---|
| Integration | `main` / `a1a632abf364e4818d046b742b590805ccd2acb6`, clean. 이번 조사에서 fetch하지 않았으므로 remote freshness를 새로 주장하지 않는다. |
| Canonical Phase 31 | `phase-31/integration-conformance-full-gate` / `d05140626a6e95d4f5ca4897f02f66594af4d753`, tree `47a47f4235342d4430d8678dc53342dbfc8a3cc9`, 조사 시작 시 clean. |
| Pre-Test-2 anchor | `54d689275cefb5d24c70f562435bb82734c51631`, tree `463ea0019c2e8588c32160bc5b3981154d9fe18a`; 이후 Test 2 linear commits 5개. |
| Accepted Task 163 | Implementation `cbf33cfdddc0cf1bdc0f285f1ebd9acf9780b540`, acceptance `c34984b017265ed601afb32282dba292446af5c3`, closure `fe43907a4efd8082ec8c7c17d132eed77ab0d7a7`가 anchor/current 양쪽 ancestor. Task 163의 9개 source/test 경로·evidence·receipt·plan은 Test 2 구간에서 blob 동일. |
| Test 2 delta | Net 716 paths = A708/M8. A는 experiment receipt/report, asset root 705개(683 PNG), 새 conformance test. M은 ledger와 source/test 7개. 정확한 제거는 이 delta에 한정하고 새 Route 문서는 제외한다. |
| Ledger overlap | Task 163과 Test 2 기록을 함께 가진 유일한 overlap. 전체 ledger를 anchor로 덮지 않고 최소 반려/폐기 이력과 기능 수락을 보존한다. |
| I03/Staging continuity | 동일 Working `phase-31-task-164-breakdown-i03-run-task-01`가 사용자 승인으로 Staging 별도 worktree에서 이어졌고 `f68fc6754842ea18a5b56fb12f8156916dbd46a9`에서 closed. Frozen I03 worktree의 active 표기를 새 active claimant로 재활성화하지 않는다. |
| Methodology file | `/Users/jwk/Documents/docs/prototype-to-production.md`, 11,252 bytes, SHA-256 `842a220138ce94c2a25cc5e25b0e1b146934eac4e8d76aba2429454794e7cdd4`; 수정하지 않았다. |
| Pinned prototype | `griddo2-claude-themes2-3` / `4f39709688ceb4cac5e15d4e3502186b1f1c801b`, tree `7b8eb8766a9b57fe2174a948de09cfb7646cf7de`, clean/read-only. |

NodeGridBody 문제는 기존 진단에서 route export와 Next generated route type의
충돌로 확인했다. Main에는 그 export가 없고 Task 163이 추가했다. 이번
문서 작업에서 typecheck/browser/full gate를 실행하거나 fresh pass를 주장하지 않는다.

추가 종료 점검: 현재 계획 그대로는 Tasks 164–165 미수락 때문에 Phase 31을
닫을 수 없다. Canonical amendment가 먼저다. Adapter의 generated-output
freshness gate는 absent이며 project-owned 대체 방법은 아직 확인되지 않았다.
따라서 새 close candidate의 generated/rendered claim 전에 정확한 방법을
명시한다. Staging 실험의 mounted target-reason 누락도 source/계약과 tier를
다시 대조할 별도 finding이며, 지금 고쳤거나 자동 Deferred라고 하지 않는다.

## Discarded Ideas

- Task 164 하나에서 모든 theme/region을 한 번에 끝내고 test 통과로 시각
  완료를 판단하는 방법을 채택하지 않는다.
- 실패한 실험을 canonical 작업으로 재사용하거나 성공한 CSS를 복사하는
  shortcut을 쓰지 않는다. 전수적인 과거 artifact 보관도 사용자가 원하지 않았다.
- Phase 30 reopen, Task 164/165의 가짜 `[x]`, 이미 승인된 기능 결정을
  되풀이하는 전면 PRD 작성, 현재 단계의 설치 skill 변경을 하지 않는다.
- Cleanup은 commit purge나 광범위 directory 삭제가 아니다. 정확한
  worktree/branch/runtime과 current-tree 실험 artifact 제거를 분리한다.

## References

- [Current decision](DECISION.md), [proposed promotion map](PROMOTION_MAP.md).
- 기존 제품 기반: `docs/SCHEMA.md`, `docs/SPEC.md`, `docs/DESIGN_TOKENS.md`,
  `docs/EXECUTION_PLAN.md`, `docs/PLANNING_STANDARD.md`, `docs/WORKFLOW.md`.
- 기존 visual authority: `docs/recipes/inbox-triage-visual-recipe-index.md`가
  지정한 9개 recipe와 14개 accepted DP receipt. Source-only와 rendered
  evidence의 차이는 유지한다.
- 외부 방법론 파일은 self-contained 요약이며 canonical receipt가 아니다.
- 여기 적은 Git identity는 조사와 보호 경계다. 삭제될 실험 문서 링크나
  구현 bytes를 미래 작업의 의존성으로 만들지 않는다.
