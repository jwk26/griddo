# Task 146 Verification — Remote Candidate And Integrity Reconciliation

## Scope and provenance

- Recovery anchor: `3fb11555b57a96659694dee9729ab6169c78b6e1`.
- Approved entrypoint `src` tree: `923050fab27a61d186c0e45c8f3026f3c29f3b5a`.
- Candidate-pinned workflow: `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`.
- Durable start: `9ed6fe7db24ef0887f1610ed5379735b682c1240`.
- Implementation: `8809a74c08dc7c0be49415edda1cdb257245477f`.
- Implemented `src` tree: `45e8d4401dc35ca05bd4fb8d5953fc6030f92ed6`.
- The run-phase Gate C receipt was not passed to the run-task resolver. The
  receipt-less pinned resolver returned `contract_ready=true` and
  `approval_required`; the user's Task 146-only work order supplied write
  authority.

Production ownership is limited to the staged-candidate hook and existing DnD
owner. Staging behavior evidence uses the existing Staging test owner. No
`DP-VQ06-STAGING` copy, DOM, style, or theme realization; Task 147 behavior;
`P27-06`; unrelated canonical/product change; publication; integration; or
cleanup was added.

## Realized contract

- The reactive candidate/source join now exposes typed `source-unresolved`
  integrity slots with `subscription-miss`, `source-owner-mismatch`, or
  `source-consumed` reasons. None is authoritative orphan proof, and none
  renders as a normal draggable candidate.
- Confirmed-orphan cleanup reaches Task 122 only when the current unresolved
  candidate's exact ID, version, source, Scratch, type, lifecycle, and a
  self-consistent authoritative `confirmed` proof match. Unresolved proof or
  mismatched identity fails closed before a repository call.
- An unknown cleanup retains its exact command and requires reconciliation;
  blind cleanup resend is rejected. The same confirmed exact command can still
  reach the read-only reconciliation query after hook remount for the same
  Scratch. Terminal conflict/rejection/success cannot be retried, while
  authoritative `not_applied` releases the same stable command for the one
  permitted retry.
- Authoritative remote candidate arrival/removal reactively updates total and
  Node/Bit counts, staged-source facts, and `archiveCandidateClear`. Existing
  stable-key rendering preserves focus on a surviving candidate and performs
  no selection mutation or focus theft.
- Candidate DOM authority change/unmount emits the exact activation snapshot.
  The DnD owner marks the retained visual snapshot `invalidated`, keeps it
  through release, then suppresses Stage, Unstage, placement, and other writes.
  The required `TriageActiveDragItem` type is available for Task 147 without
  adding Task 147 UI.

## TDD and bounded review

| Cycle | RED | GREEN / review result |
| --- | --- | --- |
| 1 | Four selected assertions failed for missing typed integrity slots, proof/identity gating, and invalidated drag state; the remaining 940 tests passed. | Exact unresolved projections, fail-closed cleanup gating, same-command unknown reconciliation, retained invalidated drag state, reactive counts/Archive facts, Staging focus preservation, and exact unmount invalidation passed. |
| 2 | A focused assertion proved that a second cleanup call after unknown could resend instead of reconciling. | The hook returns `reconciliation_required` for the unchanged command and `identity_mismatch` for a changed command; the repository cleanup is called once. |
| 3 | Two focused assertions proved hook remount blocked exact read-only reconciliation and terminal conflict still allowed a second cleanup before the snapshot advanced. | Same-Scratch confirmed exact reconciliation survives remount without new storage, terminal no-retry is enforced, and only authoritative `not_applied` permits the same stable retry. |

Independent review found no Critical issue. Its one Important remount lifecycle
finding and one Minor public-type finding were repaired in cycle 3. Re-review
found no remaining Critical or Important Task 146 issue. Local diff review also
added the terminal no-retry guard described above.

## Verification commands

| Command | Exit | Relevant result |
| --- | ---: | --- |
| Focused `pnpm exec vitest run src/hooks/use-staged-candidates.test.tsx src/components/triage/staging-zone.test.tsx src/hooks/use-triage-dnd.test.ts` | 0 | Final fresh run: 3 files / 79 tests passed |
| Changed-file `pnpm exec eslint` | 0 | No errors or warnings in the five Task 146 TypeScript/TSX paths |
| `pnpm test` | 0 | Final fresh full run: 94 files / 949 tests passed |
| `pnpm lint` | 0 | 0 errors; the same 11 existing warnings outside Task 146 paths |
| `pnpm typecheck` | 0 | TypeScript passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven routes generated |
| `git diff --check` | 0 | No whitespace errors |

## Browser modality continuation

The user's verification-only continuation reused every successful gate above
and added `captures/task-146-browser-report.json`. Two same-origin canonical
route tabs used only production Quick Capture, Breakdown, Stage, and Unstage
controls with real pointer down/move/up sequences; no injector, test hook,
product code, or Task 147 UI was added.

The browser skill's persistent Node REPL was unavailable in this environment,
so its documented Playwright fallback ran system Chrome `151.0.7922.170` at
`1920×912` on the actual `/grid/<id>` route.

- With mounted Staging focused on `Surviving candidate`, the second tab caused
  an authoritative candidate arrival and removal. The first tab changed from
  one to two to one staged Nodes, retained the same focused candidate after
  both changes, retained the selected Scratch, and performed no focus theft.
- A staged Node drag remained actively held over the Home placement target
  while the second tab authoritatively unstaged that exact candidate. Before
  release, its source DOM was gone but the visual token still retained kind
  `triage-staged-node`, candidate version `1`, and source version `2`. Release
  removed the token without another Stage/Unstage or placement mutation; the
  staged list, Breakdown list, and empty Home state were unchanged from the
  post-invalidation pre-release snapshot.
- Chrome reported no console or page errors during the captured continuation.
- Machine-readable evidence:
  `captures/task-146-browser-report.json` — SHA-256
  `a2892afd2e059a71a468d68f28eca980ae3a4fdec21147f233add99b685cedeb`.

## Checkpoint buckets

- Visible now: authoritative remote candidate arrival/removal updates existing
  candidate rendering, counts, completion/Archive facts, and surviving focus;
  an invalidated active drag retains its snapshot through release and writes
  nothing.
- Review now: Task 146 implementation and evidence acceptance. Task 146 remains
  `[ ]` until explicit user acceptance.
- Planned later: Task 147 owns all `DP-VQ06-STAGING` copy, DOM, status actions,
  styling, reduced-motion, focus realization, and theme presentation.
- Unowned: None.
