# Task 157 — Render DP-VQ10 Newly And Undo States

> State: Implemented; awaiting user checkpoint review
> Task marker: `[ ]`
> Implementation: `86f2ea5ecd1b43b644c246033360fb060615a90f`

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
| Implementation | `86f2ea5ecd1b43b644c246033360fb060615a90f`; exact original eleven owners plus the user-approved cycle `5/5` Workspace test owner |
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
6. Final High-risk diff/requirement review found no remaining concrete issue,
   extra path, product-authority need, or escaped defect. The final `5/5`
   budget is exhausted; no further repair is authorized by this checkpoint.

## Latest Verification

| Command | Exit | Elapsed | Relevant result |
| --- | ---: | ---: | --- |
| `pnpm exec vitest run src/hooks/use-triage-newly-placed.test.tsx src/components/triage/hierarchy-explorer.test.tsx src/components/grid/node-card.test.tsx src/components/grid/bit-card.test.tsx src/lib/copy/inbox-triage.test.ts src/components/triage/triage-workspace.test.tsx` | 0 | `3.17s` | 6 files / 197 tests passed |
| `git diff --check` | 0 | `0.03s` | Passed immediately before the serial full gate |
| `pnpm test` | 0 | `19.60s` | 99 files / 1,177 tests passed; existing Node deprecation and worker `localStorage` warnings only |
| `pnpm lint` | 0 | `6.67s` | 0 errors; 11 unchanged warnings outside Task 157 paths |
| `pnpm typecheck` | 0 | `2.17s` | `tsc --noEmit` passed |
| `pnpm build` | 0 | `10.04s` | Next.js 16.2.1 build passed; compile `3.8s`, TypeScript `4.3s`, seven pages generated |

The latest exact four-command serial full-gate total was `38.48s`; including
the separately measured diff check it was `38.51s`. No prior Task 157 gate was
reused. The cycle 4 full test (1,176 passed / 1 failed), prior focused/lint
results, and an accidental package-script invocation that ran all 99 files were
all superseded by the exact latest focused and Adapter-catalog reruns on the
cycle 5 input.

No browser run was used. Mounted hook/Explorer/Workspace/Card owner tests
directly establish DOM attachment, independent selection/marker/eligibility,
focusable `aria-disabled` activation suppression, no bubbling, live/atomic
status ownership, same-operation Retry/reconciliation, re-enabled lifetime,
one-shot success announcement, mounted-page lifetime, and programmatic focus.
The copy owner proves exact wording, and the CSS owner test proves the static
default plus seven named mappings and absence of animation/transition rules.
No browser-computed style, pixel, viewport, physical pointer/touch, or runtime
media-query invariant is claimed.

## Relevant-Input Fingerprint

Domain: `griddo-task-relevant-input-v1`. Each manifest is the SHA-256 of
newline-terminated, lexicographically path-ordered `Git-blob<TAB>path` lines at
the implementation commit. The following newline-terminated canonical payload
hashes to SHA-256
`8df9b928c6637ca6b8df51db6dfbfff37992ef1d348682c89997cc11f046eb32`:

```text
domain=griddo-task-relevant-input-v1
task=157
implementation=86f2ea5ecd1b43b644c246033360fb060615a90f
src_tree=227e6d8e036e579c085d19a526c77b07c3f119b3
test_manifest_sha256=8b755058666f7a54fa0e761d806c7d84546f4bee3cf514050ffcfc754f5e283c
task_path_manifest_sha256=fca863a3dd8cc554dc431d8b0458d74b634d35bf23b645d9f2fae66a211c933d
config_command_manifest_sha256=111450e6805057e33bc917444dcb1e86baf893a55e711e03634c9bc0f4d0a3fd
adapter_blob=7903892c04c4eb6fcd694712d5a01fdb608e183f
command_catalog_blob=2063146db0b8920dc8ee5805001e1541da49c2a0
node=v26.0.0
pnpm=10.22.0
platform=Darwin-24.5.0-arm64
```

The test manifest covers 99 tracked `src/**/*.{test,spec}.{ts,tsx}` files. The
task-path manifest covers the original eleven product/test owners plus the
exact single user-approved cycle 5 test owner. The config/command manifest
covers `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `eslint.config.mjs`,
`next.config.ts`, `vitest.config.ts`, `postcss.config.mjs`,
`docs/CODEX_WORKFLOW_COMMANDS.json`, and the Adapter. This is Task 157's first
fingerprint; the historical Task 156 fingerprint was not reused. Runtime
token/accounting and prompt byte size were not measured.

## Checkpoint Buckets

- **Visible now:** approved ordinary-card `NEW`, stable action, exact reasons,
  recovery states, attached rail, static themes, and reduced-motion parity.
- **Review now:** Task 157 implementation/evidence at this checkpoint.
- **Planned later:** Task 158 Search-result Undo, still unstarted.
- **Unowned:** None.
