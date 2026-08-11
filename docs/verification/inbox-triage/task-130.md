# Task 130 — Scratch Pool Base Flow

## Scope

Task 130 integrates the existing app-session Pool owner and device-local Pool
sort preference with `useInbox` and `ScratchPool`, and adds only the exact
`P23-03` global Bit-detail promotion visibility guard. It does not implement
`VQ-01`, Pool `VQ-06`, Task 131 candidate authority, or later behavior.

## Automated evidence

| Evidence | Command | Exit | Relevant result |
| --- | --- | ---: | --- |
| Durable start | `git show --stat f5964294be915b6eea979da9f744cde935bc2bcc` | 0 | Ledger-only `In Progress` commit precedes every production/test write |
| Initial RED | `pnpm exec vitest run src/stores/triage-store.test.ts src/stores/triage-preferences-store.test.ts src/hooks/use-inbox.test.tsx src/components/triage/scratch-pool.test.tsx src/components/bit-detail/bit-detail-popup.test.tsx` | 1 | 12 expected failures for absent query-aware reconciliation, persisted/session Pool consumers, scroll restoration, and Inbox-parent popup exclusion; 54 existing tests passed |
| Review RED | `pnpm exec vitest run src/components/bit-detail/bit-detail-popup.test.tsx` | 1 | 1 expected failure proved unresolved parent identity still exposed Promote before the fail-closed repair; 10 tests passed |
| Focused GREEN | `pnpm exec vitest run src/components/triage/breakdown-panel.test.tsx src/components/triage/scratch-pool.test.tsx src/hooks/use-inbox.test.tsx src/stores/triage-store.test.ts src/stores/triage-preferences-store.test.ts src/components/bit-detail/bit-detail-popup.test.tsx` | 0 | 6 files and 98 tests passed, including the existing first-printable Breakdown path |
| Focused constraints | `pnpm exec eslint src/hooks/use-inbox.ts`; `pnpm typecheck`; `git diff --check` | 0 | Target lint, TypeScript, and whitespace checks passed after repair |
| Full-gate sequence 1 of 2 | `pnpm test`; `pnpm lint`; `pnpm typecheck`; `pnpm build` | mixed | Test exited 0 (89 files, 707 tests); lint exited 1 on one new `react-hooks/set-state-in-effect` error at `use-inbox.ts:118`; typecheck and build exited 0. This sequence ran before final repair and continued after lint failed |
| Full-gate sequence 2 of 2 | `pnpm test && pnpm lint && pnpm typecheck && pnpm build` | 0 | After the final product repair, 89 files and 707 tests passed; lint had 0 errors and the unchanged 11 pre-existing warnings; `tsc --noEmit` passed; Next.js 16.2.1 build passed and generated seven routes |

## Process reconciliation

- **Full-gate budget/sequence deviation:** the approved boundary required one
  full gate only after final repair. Two full-gate sequences were actually
  executed, comprising eight full-gate command invocations in total: test,
  lint, typecheck, and build twice. Sequence 1 was premature and
  non-conforming because it ran before the readiness-reset repair and
  continued through typecheck/build after lint failed. Sequence 2 was the one
  conforming post-repair run. This is a durable process deviation; it is not
  represented as `None`.
- **Final evidence validity:** sequence 2 remains valid successful evidence
  because it ran after the final product repair, all four commands succeeded,
  and no relevant product or test input changed afterward. It was not rerun
  during this evidence-only reconciliation.
- **Preference-source scope disposition:** canonical Task 130 named
  `src/stores/triage-preferences-store.ts` for modification, but Task 127 had
  already implemented the exact validated, device-local Pool created-at sort
  API Task 130 needed. Task 130 consumed that API from `useInbox` and
  `ScratchPool` and extended its test coverage without changing the source.
  Behavioral scope is satisfied, while the prescribed source-file action is
  durably reconciled as an intentional no-op rather than claimed as a diff.
- **Canonical impact/tag:** `None`. The two reconciliations change neither
  approved behavior nor ownership, and the canonical Task 130 contract remains
  sufficient. No canonical amendment or separate end-phase tag is required.

## Visible route evidence

- **Route:** canonical seeded Inbox route under `http://localhost:3000/grid/<inbox-node-id>`.
- **Browser path:** the preferred in-app-browser Node REPL tool was unavailable
  in this session, so the available Playwright browser runtime supplied the
  same local route, viewport, accessibility-tree, focus, and capture evidence.
- **Populated seed:** three active Scratches named `Project Alpha`, `Project
  Beta`, and `Inbox Note`; the first created Scratch remained selected while
  later arrivals did not move focus or selection.
- **Viewports:** `1024×768` and `1920×1080` CSS pixels, GridDO light.
- **True-empty seed:** the locally created verification data was cleared, the
  app reseeded its system Nodes, and a new canonical Inbox route rendered zero
  active Scratches with selection `null`.

### Counts, filtering, selection, and scrolling

At both widths, the expanded Pool exposed all three Scratch rows in persisted
created-at order, total count `3`, selected-row `aria-pressed="true"`, a
keyboard-scrollable `overflow-y: auto` Pool viewport, computed
`scrollbar-width: none`, and zero document horizontal overflow. Searching
`Beta` kept `Project Alpha` selected and active in Context while the list
showed only `Project Beta`; focus remained in `Search scratches`, the total
stayed `3`, and the separate filtered count was `1 / 3`. Clearing the query
left focus in the search field and restored all three rows.

### Collapse, first printable key, and focus

- Manual collapse preserved the hidden `Beta` query but rendered no search,
  sort, or filtered count. The compact rail still exposed all three vertical
  Scratch switchers in persisted order, total `3`, accessible titles, and one
  non-color selected `aria-pressed` state.
- Manual collapse focused `Expand Scratch Pool`; manual expansion focused
  `Collapse Scratch Pool`, restored query `Beta`, and restored filtered count
  `1 / 3`.
- After changing selection to `Project Beta`, typing the first printable `X`
  in the Breakdown Add input collapsed the Pool once while the input retained
  focus and value. Manual expansion set the per-Scratch exception; focusing a
  fresh Add input and typing `Y` kept the Pool expanded and retained input
  focus.

### Re-entry, reload, and persisted sort

- Leaving to Home and reopening Inbox in the same app session restored
  selected `Project Beta`, expanded Pool, query `Beta`, the one visible result,
  and filtered count `1 / 3`.
- Reload reset query to empty, Pool to expanded, and session selection to the
  first active Scratch under the current persisted sort (`Inbox Note` under
  newest-first).
- Switching to oldest-first and reloading retained the preference, ordered
  `Project Alpha`, `Project Beta`, `Inbox Note`, and selected `Project Alpha`
  as the deterministic reload fallback.
- The true-empty seed rendered Pool total `0`, query empty, expanded mode,
  `No active scratches`, and no Selected Scratch Context.

### Captures

| Capture | SHA-256 |
| --- | --- |
| [`task-130-populated-1024x768.png`](captures/task-130-populated-1024x768.png) | `84a2025fc1de8cb382502e8afe61d749eedd4f61b385d077fef188d419f59c3b` |
| [`task-130-filtered-1024x768.png`](captures/task-130-filtered-1024x768.png) | `980799eeafe9e274bb740574b5a83031a314a7fc2503095a561979f469a84e57` |
| [`task-130-collapsed-1024x768.png`](captures/task-130-collapsed-1024x768.png) | `066778fd4ceb91536986813daca696da6ec1aa7d099b279fdd597e6b7db3a638` |
| [`task-130-populated-1920x1080.png`](captures/task-130-populated-1920x1080.png) | `21b17c1d3d245816b2bacd6609badc23b935c6535c1cc6eca49290846c9a6d95` |
| [`task-130-filtered-1920x1080.png`](captures/task-130-filtered-1920x1080.png) | `cf89a072cfdae3ecf9112edc0717835c38598ef8a63f17e8b808e411e043e603` |
| [`task-130-true-empty-1024x768.png`](captures/task-130-true-empty-1024x768.png) | `94f485070a4207d57052d8ecbf9c244658ca04b46e8048f3ed45f2ff99785c62` |

The final browser console check reported zero errors.

## Review

- One concrete popup finding was repaired: when a Chunk-backed Bit's parent
  identity was unresolved, `canPromote` failed open and could transiently
  expose an action before Inbox identity was known. Promotion visibility now
  requires a confirmed ordinary non-Inbox parent below level 2. The focused
  tests retain ordinary eligible promotion and reject both confirmed Inbox
  and unresolved parent identities.
- The full gate found one concrete React finding: a synchronous readiness reset
  inside the active-Scratch subscription effect caused a cascading-render lint
  error. The reset now occurs in the async Inbox lookup callback; focused and
  full lint are clean for Task 130 paths.
- Direct React/accessibility/visual review found no theme-ID branch, focus
  steal on automatic selection, hidden-query filtering in compact mode,
  `VQ-01`, Pool `VQ-06` status band/activity behavior, Task 131 candidate
  authority, or later-task implementation. The attempted latest external Web
  Interface Guidelines fetch returned no content, so no external-guideline
  conformance claim is made.

## Checkpoint buckets

- **Visible now:** canonical Inbox Pool populated/filtered/collapsed/re-entry/
  reload/true-empty base states at the approved widths; deterministic keyboard
  and toggle focus; persisted Pool sort; defensive Promote visibility guard.
- **Review now:** Task 130 behavior, captures, focused/full evidence, and user
  acceptance.
- **Planned later:** Task 141 owns `VQ-01`; Task 144 owns Pool `VQ-06`; Task 131
  and later tasks own their exact candidate and downstream surfaces.
- **Unowned:** None.
