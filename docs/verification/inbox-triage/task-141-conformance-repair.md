# Task 141 `P27-11` Conformance Repair Evidence

## Scope and authority

- Candidate-pinned `run-task`: repository
  `/Users/jwk/Documents/codex-workflow-clean-design-mode-implementation`,
  branch `post-v1/workflow-candidate-low-cost`, commit
  `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`, skill SHA-256
  `614631c56866549feb298d995ea0cf1311caa1cacaaefc2ba2ca753e43910531`.
- Phase 27 recovery anchor:
  `f5940fc6c50daf873986c7fb414a2ce34c052518`; accepted entrypoint `src`
  tree `94f2d3cd08ba62d01ea00f77e5cb8362dc47e174`.
- Receipt-less Adapter v2 resolution returned `approval_required`,
  `contract_ready=true`, and `writes_allowed=false`. The Gate C run-phase
  receipt was intentionally not passed to the run-task resolver; write
  authority came only from the user's explicit `P27-11` work order.
- Durable start commit `c3237a1eceef399ff33254b02b701f96f4bed7fa`
  precedes production implementation commit
  `c1430f0e45eeb26085b485f3a8d88fe46db0fe82`.

## Implemented repair

- Created `src/hooks/use-external-scratch-removal-data.ts` as the sole reactive
  DataStore boundary for Task 141 external-removal reads, with no Zustand,
  durable state, or session state ownership.
- Moved selected-Scratch archive/delete observation, authoritative fallback for
  an unclassified lifecycle, and terminal Inbox/source reads out of
  `triage-workspace.tsx`.
- The hook exposes only a typed read-only lifecycle observation and terminal
  snapshot callback. Terminal reads retain Inbox projection first and source
  identity last.
- Workspace retains normalization, restoration/delete handling, selection,
  draft, focus, and terminal coordination. Its component-level `liveQuery` and
  all three `getDataStore()` reads are absent.
- Product behavior, copy, DOM, CSS, timing, focus, DataStore, repository,
  schema, stores, `use-inbox.ts`, and Tasks 142–148 behavior/evidence are
  unchanged.

## TDD and bounded repair loop

| Cycle | RED / finding | Repair and GREEN |
| --- | --- | --- |
| Boundary extraction | Workspace conformance test failed on the existing component-level Dexie import; the run showed the one expected failure while the accepted 974 tests passed. | Added the pure hook and changed Workspace to consume typed observation/snapshot APIs. Focused hook + Workspace passed 45/45. |
| Restoration cache guard | A focused regression failed because the first hook draft retained the archived observation after removal ended. | Added guarded removal-end cache invalidation; focused hook + Workspace passed 46/46, changed-file lint and typecheck passed. |
| Same-Scratch context race | Independent review identified that an ID-only fallback dependency weakened the prior cancellation guard. The new same-ID/context-replacement regression failed by accepting the stale first read as `delete`. | Passed the complete read-only external-removal object identity as the cancellation dependency. The stale read is ignored and the replacement read classifies `archive`; focused hook + Workspace passed 47/47. Follow-up review found no Critical or Important issue. |

## Verification

| Command / modality | Exit | Relevant result |
| --- | --- | --- |
| `pnpm exec vitest run src/hooks/use-external-scratch-removal-data.test.tsx src/components/triage/triage-workspace.test.tsx` | 0 | 2 files / 47 tests passed after the final review repair |
| changed-file `pnpm exec eslint ...` over the four approved code paths | 0 | 0 errors or warnings |
| `pnpm test` | 0 | Fresh post-repair full gate: 95 files / 981 tests passed |
| `pnpm lint` | 0 | 0 errors; the same 11 pre-existing warnings outside `P27-11` paths |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed |
| `pnpm build` | 0 | Next.js production build passed; seven routes generated |
| `git diff --check` / staged diff check | 0 | No whitespace errors; implementation commit contains exactly the four approved code paths |
| Local system Chrome over CDP on `http://localhost:3001/grid/<inbox-id>` | 0 | Representative archive lifecycle opened the accepted archive transition and authoritative restore closed it while retaining the source; representative delete lifecycle opened the accepted delete transition, and Move now selected/focused `Repair Destination` |

The browser harness had two setup-only failures before the successful run: a
`127.0.0.1` origin was blocked by Next.js dev-origin policy, then the temporary
page helper was lost across navigation. Switching to canonical `localhost`
and recreating the helper after navigation resolved those harness errors; no
product repair resulted from them. No browser artifact was retained.

The accepted 16-theme geometry matrix was not rerun because this repair changes
no CSS, DOM, or copy.

## Review and checkpoint buckets

- Review: initial read-only review reported one Important same-Scratch fallback
  cancellation defect with an exact path, trigger, and consequence. It was
  reproduced and repaired in scope. Follow-up review reports Critical: None;
  Important: None; Minor: None.
- Canonical impact: `Reflected` in Task 141's files/actions only; accepted
  product/design meaning is unchanged.
- Visible now: no new behavior; the accepted Task 141 archive/delete transition
  remains behaviorally unchanged behind a conforming hook boundary.
- Review now: user acceptance or targeted rejection of the `P27-11` repair
  checkpoint.
- Planned later: Phase 27 smoke/end-phase and Phase 28 remain under their
  existing separate authority; `P27-06` and `P27-08` remain deferred.
- Unowned: None.

`P27-11` remains `In Progress` and must not become `Closed` until a separate
user-owned acceptance action. Task 141 and Task 148 remain accepted and marked
`[x]`.
