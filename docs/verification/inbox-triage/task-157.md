# Task 157 — Render DP-VQ10 Newly And Undo States

> State: Repaired; awaiting user checkpoint review
> Task marker: `[ ]`
> Initial implementation: `86f2ea5ecd1b43b644c246033360fb060615a90f`
> Cycle 6 repair: `61c6b03bf940b2594996e4bc50870b7a4f497734`

## Scope And Result

- The released `DP-VQ10=A` copy bundle now owns the exact `NEW` marker,
  available/ineligible/re-enabled reasons, pending/unknown/reconciling/
  not-applied/success wording, and stable `Undo`, `Check again`, and `Retry`
  actions.
- Actual ordinary `NodeCard` and `BitCard` instances keep selection, Newly
  provenance, and Undo eligibility independent. The action remains keyboard
  focusable while ineligible through `aria-disabled`, suppresses activation,
  does not bubble into card navigation, and references its visible status rail.
- Explorer attaches an always-visible, live/atomic status rail to each local
  Newly card. Unknown truth offers same-operation reconciliation; terminal
  not-applied offers same-command Retry; conflict and blocker states retain the
  card and exact reason. Child-first dependency clearance exposes the temporary
  re-enabled reason.
- Unknown and terminal recovery focus the stable card action. Successful Undo
  retains Task 156's next-card → previous-card → column-heading focus plan and
  announces the restored source once.
- Child-first re-enabled Undo now enters the same exact acquire/dispatch path as
  ordinary availability. Open Placement, another shared owner, or dirty Edit
  ends the one-shot re-enabled sentence and blocks authoritative not-applied
  Retry without acquire, dispatch, navigation, queue, or replay. Clearing the
  blocker restores the retained Retry state without replaying re-enabled copy.
- Initial authority checking uses the accepted wait reason rather than asserted
  conflict. The committed-success removal boundary shows the accepted restored
  source sentence with no stale action while the stable live region remains the
  sole success announcement owner.
- Node and Bit actions now share the approved trailing slot; marker placement
  remains leading and common-card internals remain otherwise unchanged.
- Styling is static with no repeated motion. The default plus seven named theme
  families and the reduced-motion override use the existing theme tokens and
  leave the common card model unchanged.
- Search, Task 158, persistence, schema, repository commands, integration, and
  unrelated evidence were unchanged.

## Durable Ordering And Ownership

| Evidence | Value |
| --- | --- |
| Entrypoint | `d0bb079fe0ae1ab2cdcca50c200b19a56c37e0f5`; accepted Task 156 |
| Durable start | `5400c3d4097a58c224aabc7f107617bd4a7fd6c2`; ledger-only parent of every Task 157 product/test write |
| Durable owner stop | `5f3d1916227cbf7d4403270aaa6e7462872b0480`; records cycle 3 no-progress and cycle 4 Workspace owner discovery |
| Initial implementation | `86f2ea5ecd1b43b644c246033360fb060615a90f`; exact original eleven owners plus the user-approved cycle `5/5` Workspace test owner |
| Superseded checkpoint | `7f6c6c010f7dbc306fece457c3dd02d7e4bf7797`; fingerprint `8df9b928c6637ca6b8df51db6dfbfff37992ef1d348682c89997cc11f046eb32` |
| Approved cycle 6 repair | `61c6b03bf940b2594996e4bc50870b7a4f497734`; hook/test, Explorer/test, and NodeCard/test only |
| Canonical impact | `None` — existing accepted `DP-VQ10=A` realization only |
| Owner gate / unowned | User approved expansion only to `src/components/triage/triage-workspace.test.tsx` for six mechanical marker expectations; `Unowned: None` |

## TDD And Repair Evidence

1. Cycle 1 RED ran five owner files / 137 tests and produced eight expected
   failures for missing copy, Retry/re-enabled semantics, `aria-disabled`, the
   attached rail, and static theme/motion CSS. The initial implementation made
   all 137 focused tests pass in `3.26s`.
2. Cycle 2 diff review found that a successful same-operation Retry discarded
   Task 156's terminal focus plan. The targeted RED focused the column heading
   instead of the next card. Preserving the plan through `not_applied` made the
   expanded 138-test focused set green.
3. Cycle 3 lint found 12 `react-hooks/refs` errors because the action ref was
   nested in the Undo presentation object. Renaming the nested property left
   the same 12 errors, so the pinned no-progress rule caused a durable stop.
4. The user resumed with explicit cycle `4/4` authority. Moving the ref to the
   existing top-level Card API resolved all lint errors. Focused tests passed,
   but the full suite found one stale Workspace integration scenario outside
   the approved owner list: six queries still expected `Newly placed` instead
   of the released `NEW`. Work stopped without editing that file.
5. The user approved final cycle `5/5` and only that test owner. Exactly the six
   stale queries in the mounted-page Newly scenario changed to `NEW`; no other
   assertion or line in that file changed. The six-owner focused set and every
   invalidated Adapter full-gate command then passed.
6. The cycle 5 High-risk review found no issue and produced checkpoint
   `7f6c6c0`, but Control Tower review subsequently found four escaped defects:
   re-enabled activation rejected its own reason, blocker changes did not end
   re-enabled lifetime, not-applied Retry bypassed current UI blockers,
   checking/success fell through to conflict, and Node Undo remained leading.
7. The user explicitly approved cycle `6/6` within existing owners. The first
   exact RED ran three files / 118 tests with nine failures: one re-enabled
   activation, three lifetime, three blocked Retry, one false-success/checking
   projection group, and one trailing-slot assertion. The checking/success
   tests were corrected to use the available lock context before product GREEN.
8. The hook now distinguishes retryable raw operation state from its current
   blocker projection, clears re-enabled lifetime on every eligibility change,
   admits both available reasons to activation, and rechecks projection before
   Retry acquire. Explorer maps checking and success explicitly from accepted
   copy, removes the success action, and preserves one announcement owner.
   Node Undo moved to the trailing edge. Final review found no remaining
   concrete issue, extra path, authority need, or `Unowned` item. Cycle `6/6`
   is exhausted.

## Latest Verification

| Command | Exit | Elapsed | Relevant result |
| --- | ---: | ---: | --- |
| `pnpm exec vitest run src/hooks/use-triage-newly-placed.test.tsx src/components/triage/hierarchy-explorer.test.tsx src/components/grid/node-card.test.tsx src/components/grid/bit-card.test.tsx src/lib/copy/inbox-triage.test.ts src/components/triage/triage-workspace.test.tsx` | 0 | `3.65s` | 6 files / 205 tests passed; includes all four Control Tower findings and single success status ownership |
| `git diff --check` | 0 | `0.01s` | Adapter focused diff check passed |
| `pnpm typecheck` (focused) | 0 | `2.15s` | Adapter focused typecheck passed before the full gate |
| `pnpm test` | 0 | `26.39s` | 99 files / 1,185 tests passed; existing Node deprecation and worker `localStorage` warnings only |
| `pnpm lint` | 0 | `7.07s` | 0 errors; 11 unchanged warnings outside Task 157 paths |
| `pnpm typecheck` | 0 | `1.30s` | `tsc --noEmit` passed |
| `pnpm build` | 0 | `11.03s` | Next.js 16.2.1 build passed; compile `5.1s`, TypeScript `3.9s`, seven pages generated |

The latest exact four-command serial full-gate total was `45.79s`. No prior
Task 157 gate was reused. Cycle 5's 197-test focused run, `38.48s` full gate,
implementation checkpoint, and fingerprint were invalidated by cycle 6. The
first cycle-6 GREEN (3 files / 118 tests), a misplaced one-shot test assertion,
and all intermediate focused results were superseded by the exact latest
six-file focused and Adapter-catalog reruns.

No browser run was used. Mounted hook/Explorer/Workspace/Card owner tests
directly establish DOM attachment, independent selection/marker/eligibility,
re-enabled acquire/dispatch and blocker lifetime, blocked Retry no-acquire/
no-dispatch/no-replay, focusable `aria-disabled` activation suppression, no
bubbling, non-conflict checking/success projection, trailing Node action,
live/atomic status ownership, same-operation Retry/reconciliation, one-shot
success announcement, mounted-page lifetime, and programmatic focus.
The copy owner proves exact wording, and the CSS owner test proves the static
default plus seven named mappings and absence of animation/transition rules.
No browser-computed style, pixel, viewport, physical pointer/touch, or runtime
media-query invariant is claimed.

## Relevant-Input Fingerprint

Domain: `griddo-task-relevant-input-v1`. Each manifest is the SHA-256 of
newline-terminated, lexicographically path-ordered `Git-blob<TAB>path` lines at
the implementation commit. The following newline-terminated canonical payload
hashes to SHA-256
`8df72a88bf391b0b66c470a18ed74b8fc6eab053820908449dc32c3432fb7d30`:

```text
domain=griddo-task-relevant-input-v1
task=157
implementation=61c6b03bf940b2594996e4bc50870b7a4f497734
src_tree=776128aefef8d08b2975ee5cf09c24d1f2dd7d64
test_manifest_sha256=2fd11f740c8b2c918d4bb3d98dbbfbded81b66e4b46180a3a6fdf22006195e70
task_path_manifest_sha256=e3ecd6a5ff6dd5c2e77d0feb46382a0ab900fe0663096bfd795861694a2cbaa5
config_command_manifest_sha256=111450e6805057e33bc917444dcb1e86baf893a55e711e03634c9bc0f4d0a3fd
adapter_blob=7903892c04c4eb6fcd694712d5a01fdb608e183f
command_catalog_blob=2063146db0b8920dc8ee5805001e1541da49c2a0
node=v26.0.0
pnpm=10.22.0
platform=Darwin-24.5.0-arm64
```

The test manifest covers 99 tracked `src/**/*.{test,spec}.{ts,tsx}` files. The
task-path manifest covers the original eleven product/test owners plus the
exact single user-approved cycle 5 test owner; cycle 6 changed six paths within
that existing set. The config/command manifest
covers `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `eslint.config.mjs`,
`next.config.ts`, `vitest.config.ts`, `postcss.config.mjs`,
`docs/CODEX_WORKFLOW_COMMANDS.json`, and the Adapter. This replacement
fingerprint supersedes cycle 5's `8df9b928c6637ca6b8df51db6dfbfff37992ef1d348682c89997cc11f046eb32`;
the historical Task 156 fingerprint was not reused. Runtime token/accounting
and prompt byte size were not measured.

## Checkpoint Buckets

- **Visible now:** approved ordinary-card `NEW`, stable action, exact reasons,
  recovery states, attached rail, static themes, and reduced-motion parity.
- **Review now:** Task 157 implementation/evidence at this checkpoint.
- **Planned later:** Task 158 Search-result Undo, still unstarted.
- **Unowned:** None.
