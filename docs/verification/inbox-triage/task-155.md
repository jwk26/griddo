# Task 155 — Project Newly Placed Provenance Over Actual Cards

> State: Implemented; awaiting user checkpoint review
> Task marker: `[ ]`
> Implementation: `0bdd1a88e1eb3c455ff8b156318f18ab7ca3b449`

## Scope And Result

- `use-triage-newly-placed.ts` is the one mounted-page owner. It registers only
  the current Workspace's authoritative Task 152 placement callback and keeps
  immutable result, source, candidate, operation, destination, and completion
  provenance in React page-session state.
- Explorer projects repository Nodes and Bits without cloning or changing
  stored `x/y`. Locally completed results are pinned newest-first only within
  their Node or Bit type; ordinary and remote records retain their relative
  order.
- Explorer now renders the actual `NodeCard` and `BitCard` foundations. Each
  exposes a static semantic `data-card-marker="newly-placed"` slot independent
  from selection. No common-card redesign, Undo action/state, or DP-VQ10 full
  realization was added.
- Scratch, path, and theme changes preserve the Workspace hook instance.
  Inbox route exit, reload, or unmount destroys it; a remount renders the same
  repository records without marker, pinning, or retained Undo provenance.
- `triage-store`, persistence, schema, DataStore, repository commands, global
  Search, and Tasks 156–158 were unchanged.

## Durable Ordering And Ownership

| Evidence | Value |
| --- | --- |
| Entrypoint | `d81f924e209afd1cced22fdbfdca12e2c11af11b` |
| Durable start | `bc8f84edae7881a89cca0a9c7d78443dec0c0c54`; ledger-only parent of implementation |
| Implementation | `0bdd1a88e1eb3c455ff8b156318f18ab7ca3b449`; exactly 10 approved product/test paths |
| Canonical impact | `None` — existing approved Task 155 contract implemented without authority change |
| Unowned / scope deviation | None |

## TDD And Repair Evidence

1. Initial hook RED failed because `use-triage-newly-placed.ts` did not exist;
   the contemporaneous run still showed the existing 98 files / 1,146 tests
   green. Hook GREEN passed 1 file / 3 tests.
2. Actual-card marker RED failed 2 of 19 NodeCard/BitCard tests; GREEN passed
   2 files / 19 tests.
3. Explorer projection RED failed the two new pinning/selection assertions;
   the other 78 Explorer tests passed. The first integrated GREEN passed the
   five focused owners after preserving existing accessible names and column
   identity.
4. Workspace RED failed only the new mounted lifetime assertion (58/59);
   mounting the single hook and registering the Task 152 callback made the
   full mounted owner flow green.
5. Cycle 1 typecheck found the native/Motion `onDrag` prop-signature conflict;
   the NodeCard passthrough was narrowed to Motion's actual DOM contract.
   Diff review also found that pinned DOM order and scroll-anchor `itemIds`
   could diverge; one shared typed projection now owns both.
6. High-risk review after the first full gate found that IDs/versions alone
   could not create Task 156's future `PlacementUndoCommand`: staged candidate
   truth is deleted after placement. Cycle 2 RED failed 3/3 hook tests until
   Workspace captured exact pre-dispatch `ScratchBreakdown` and
   `StagedCandidate` snapshots from the authoritative mounted projections.
   All cycle-1 full results were invalidated and rerun.

Final review found no remaining Critical, Important, or Minor concrete issue.
No owner-discovery stop, scope expansion, extra-cycle gate, or no-progress
signature occurred; two bounded repair cycles were used.

## Latest Verification

| Command | Exit | Elapsed | Relevant result |
| --- | ---: | ---: | --- |
| `pnpm exec vitest run src/hooks/use-triage-newly-placed.test.tsx src/components/triage/triage-workspace.test.tsx src/components/triage/hierarchy-explorer.test.tsx src/components/grid/node-card.test.tsx src/components/grid/bit-card.test.tsx` | 0 | `3.30s` | 5 files / 161 tests passed; mounted owner directly proved local-only marker, actual cards, type pinning, selection independence, Scratch/path/theme preservation, and remount clearing |
| `pnpm test` | 0 | `20.16s` | 99 files / 1,154 tests passed; existing Node deprecation and worker `localStorage` warnings only |
| `pnpm lint` | 0 | `6.16s` | 0 errors; 11 unchanged warnings outside Task 155 paths |
| `pnpm typecheck` | 0 | `1.18s` | `tsc --noEmit` passed |
| `pnpm build` | 0 | `9.06s` | Next.js 16.2.1 build passed; compile `3.8s`, TypeScript `3.5s`, seven pages generated |
| `git diff --check` | 0 | not separately measured | Passed after the final repair |

The latest serial full-gate command total was `36.56s`. The first Task 155
full gate (`37.25s`) was not reused because the immutable Undo-snapshot repair
changed source/test inputs. Gate C baseline evidence was not reused.

No browser run was used. The mounted Workspace/Explorer/Card owner tests
exercise the claimed browser-relevant DOM invariant directly: the authoritative
local result becomes the actual typed card, its static marker remains while
selection, Scratch, path, and theme presentation change, and remount removes
only page-session provenance. No computed-style or pixel claim is made; Task
157 retains the full DP-VQ10 visual/copy realization.

## Relevant-Input Fingerprint

Domain: `griddo-task-relevant-input-v1`. The following newline-terminated
canonical payload hashes to SHA-256
`1a491bbd2bda0fb26c9af723704ed657a47399472053d8d5d9700500549e8821`:

```text
domain=griddo-task-relevant-input-v1
task=155
implementation=0bdd1a88e1eb3c455ff8b156318f18ab7ca3b449
src_tree=4c20c83e393e76a10528606637a3a9be88f92183
test_manifest_sha256=a011caccb51fef23f48c1cbc412568e393f987addc78170dfbbfae44a447bc8b
task_path_manifest_sha256=a616930e6ebbfa9fcb63564dbdf337804b60dcb89b75ec2e3deb60e559701804
config_command_manifest_sha256=74ee27da90dc45cf1aa210c279e471a73aaf257a5ee35b4f1fcecbea06d74647
adapter_blob=7903892c04c4eb6fcd694712d5a01fdb608e183f
command_catalog_blob=2063146db0b8920dc8ee5805001e1541da49c2a0
node=v26.0.0
pnpm=10.22.0
platform=Darwin-24.5.0-arm64
```

The test manifest covers 99 tracked `src/**/*.{test,spec}.{ts,tsx}` files.
The config/command manifest covers `package.json`, `pnpm-lock.yaml`,
`tsconfig.json`, `eslint.config.mjs`, `next.config.ts`, `vitest.config.ts`,
`postcss.config.mjs`, `docs/CODEX_WORKFLOW_COMMANDS.json`, and the Adapter.
Runtime token/accounting and prompt byte size were not measured.

## Checkpoint Buckets

- **Visible now:** local mounted-page placement results render as pinned actual
  cards with independent Newly Placed markers; the marker survives the named
  in-page changes and clears on remount.
- **Review now:** Task 155 implementation and evidence at this checkpoint.
- **Planned later:** Task 156 ordinary-card Undo behavior; Task 157 DP-VQ10
  full visual/copy/status realization; Task 158 Search-result Undo.
- **Unowned:** None.
