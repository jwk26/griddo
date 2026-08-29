# Task 157 — Render DP-VQ10 Newly And Undo States

> State: Repaired through user-approved cycle 7; awaiting user checkpoint review
> Task marker: `[ ]`
> Initial implementation: `86f2ea5ecd1b43b644c246033360fb060615a90f`
> Cycle 6 repair: `61c6b03bf940b2594996e4bc50870b7a4f497734`
> Cycle 7 repair and canonical reflection: `489f6a08686f44a5323c112e62703b48dee68968`

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
- Initial authority checking uses exact `Checking whether Undo is available…`,
  remains distinct from a real shared lock, and exposes only a focusable,
  `aria-disabled` trailing Undo whose activation has no effect. The
  committed-success removal boundary shows the accepted restored-source
  sentence with no stale action while the stable live region remains the sole
  success announcement owner.
- Render-time state reads are pure. A blocker is projected synchronously, but
  the one-shot re-enabled lifetime ends only after the blocker render commits;
  a suspended render cannot consume it.
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
| Superseded cycle 6 checkpoint | `cf74e6c0980bc9ccb66f63f105612bc01d91f7a8`; fingerprint `8df72a88bf391b0b66c470a18ed74b8fc6eab053820908449dc32c3432fb7d30` |
| Approved cycle 7 repair | `489f6a08686f44a5323c112e62703b48dee68968`; hook/test, Explorer/test, copy/test, recipe, and DESIGN_TOKENS only |
| Canonical impact | `Reflected` — the user's exact choice A checking mapping and the already-approved success data-state mapping are now recorded in `docs/recipes/inbox-triage-newly-placed-undo-visual-recipe.md` and `docs/DESIGN_TOKENS.md` |
| Owner gate / unowned | Cycle 5's Workspace expansion remains historical; cycle 7 required no new owner beyond the exact user-approved canonical/product/evidence paths; `Unowned: None` |

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
   concrete issue, extra path, authority need, or `Unowned` item at that
   checkpoint.
9. Control Tower review then found two cycle-6 escaped defects: initial
   checking borrowed shared-lock copy without state/copy authority, and
   `getState()` deleted re-enabled state during render. The user explicitly
   selected choice A and approved cycle `7/7`, including reflection in the two
   named canonical owners.
10. Cycle-7 RED ran 3 files / 125 tests with 5 expected failures. Exact checking
    copy/state/action tests and three render-read lifetime checks failed before
    implementation. The final hook regression also performs a blocked read in
    a React render that suspends and proves the uncommitted render does not
    consume re-enabled lifetime.
11. The first full test passed 99 files / 1,186 tests in `26.43s`, but lint
    correctly rejected a redundant synchronous revision update inside the new
    commit effect (1 error, 11 existing warnings, `7.39s`). Removing that
    redundant update made lint green. A subsequent explicit suspended-render
    regression expanded the suite and invalidated the intervening green gates,
    so every focused and full command was rerun on the final input. Final
    High-risk review found no remaining concrete issue, scope expansion, or
    `Unowned` item. Cycle `7/7` is exhausted.

## Latest Verification

| Command | Exit | Elapsed | Relevant result |
| --- | ---: | ---: | --- |
| `pnpm exec vitest run src/hooks/use-triage-newly-placed.test.tsx src/components/triage/hierarchy-explorer.test.tsx src/components/grid/node-card.test.tsx src/components/grid/bit-card.test.tsx src/components/triage/triage-workspace.test.tsx src/lib/copy/inbox-triage.test.ts` | 0 | `4.23s` | 6 files / 207 tests passed; includes choice A checking, shared-lock separation, suspended-render purity, committed lifetime, and existing success ownership |
| `git diff --check` | 0 | `<0.01s` | Adapter focused diff check passed |
| `pnpm typecheck` (focused) | 0 | `1.55s` | Adapter focused typecheck passed before the final full gate |
| `pnpm test` | 0 | `25.83s` | 99 files / 1,187 tests passed; existing Node deprecation and worker `localStorage` warnings only |
| `pnpm lint` | 0 | `7.24s` | 0 errors; 11 unchanged warnings outside Task 157 paths |
| `pnpm typecheck` | 0 | `1.35s` | `tsc --noEmit` passed |
| `pnpm build` | 0 | `12.58s` | Next.js 16.2.1 build passed; compile `6.2s`, TypeScript `4.2s`, seven pages generated |

The latest exact four-command serial full-gate total was `47.00s`. No prior
Task 157 gate was reused. Cycle 6's 205-test focused run, `45.79s` full gate,
checkpoint, and fingerprint were invalidated by cycle 7. The first cycle-7
full-test/lint attempt and the intervening green 1,186-test gate were also
invalidated; the exact latest six-file focused and every Adapter-catalog full
command were rerun after the final suspended-render regression.

No browser run was used. Mounted hook/Explorer/Workspace/Card owner tests
directly establish DOM attachment, independent selection/marker/eligibility,
re-enabled acquire/dispatch and blocker lifetime, blocked Retry no-acquire/
no-dispatch/no-replay, focusable `aria-disabled` activation suppression, no
bubbling, exact checking/shared-lock separation, uncommitted suspended-render
purity, committed blocker lifetime, success projection, trailing Node action,
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
`2081f807dbb4d15d52a8fd4a893fd3599ee023628893babc324df9fcecfa7697`:

```text
domain=griddo-task-relevant-input-v1
task=157
implementation=489f6a08686f44a5323c112e62703b48dee68968
src_tree=92b1bd0222e08e2733a28f471bca5b78ad046c62
test_manifest_sha256=ee666b766660a41c09eb0194e14323e2428cd7c80ad5544a2c7eef070a748fc8
task_path_manifest_sha256=d01769b05db0b45859978ffb52a6e3d5d3e6278d6df477cf59d0ab78817ae469
config_command_manifest_sha256=111450e6805057e33bc917444dcb1e86baf893a55e711e03634c9bc0f4d0a3fd
adapter_blob=7903892c04c4eb6fcd694712d5a01fdb608e183f
command_catalog_blob=2063146db0b8920dc8ee5805001e1541da49c2a0
node=v26.0.0
pnpm=10.22.0
platform=Darwin-24.5.0-arm64
```

The test manifest covers 99 tracked `src/**/*.{test,spec}.{ts,tsx}` files. The
task-path manifest covers the original eleven product/test owners, the exact
single user-approved cycle-5 test owner, and the two user-approved cycle-7
canonical reflection owners (14 paths total); cycle 7 changed six product/test
paths and those two canonical paths. The config/command manifest
covers `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `eslint.config.mjs`,
`next.config.ts`, `vitest.config.ts`, `postcss.config.mjs`,
`docs/CODEX_WORKFLOW_COMMANDS.json`, and the Adapter. This replacement
fingerprint supersedes cycle 6's `8df72a88bf391b0b66c470a18ed74b8fc6eab053820908449dc32c3432fb7d30`;
the historical Task 156 fingerprint was not reused. Runtime token/accounting
and prompt byte size were not measured.

## Checkpoint Buckets

- **Visible now:** approved ordinary-card `NEW`, stable action, exact reasons,
  recovery states, attached rail, static themes, and reduced-motion parity.
- **Review now:** Task 157 implementation/evidence at this checkpoint.
- **Planned later:** Task 158 Search-result Undo, still unstarted.
- **Unowned:** None.
