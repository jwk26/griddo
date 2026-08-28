# Task 156 — Connect Ordinary-Card Source-Aware Undo Independently Of Search

> State: Implemented; awaiting user checkpoint review
> Task marker: `[ ]`
> Implementation: `5b370843de9440455706fef177e0a80734c13e23`

## Scope And Result

- Ordinary Explorer `NodeCard` and `BitCard` instances expose an optional Undo
  action independently from the static Newly Placed marker. The action stops
  propagation and does not select or navigate the card.
- `use-triage-newly-placed.ts` derives each Undo command from the exact current
  result, source, and staged-candidate provenance captured by Task 155. Direct
  Undo has no candidate field; staged Undo passes the same candidate snapshot.
- Repository reconciliation supplies authoritative result/source/candidate and
  dependency truth. Result mutation, source mutation, candidate mutation,
  descendants, an active shared owner, an open Placement, and dirty Edit intent
  disable activation. Child-first terminal truth can restore eligibility.
- Activation acquires Task 136's shared `undo` lock synchronously before the
  repository call. Pending, unknown, and reconciling retain the same command,
  source, card, selected path, and blocker state. Only a terminal repository
  result releases the lock; duplicate and competing intents do not dispatch,
  navigate, queue, or replay.
- Terminal success removes the result and restores source/candidate truth, then
  focuses the next card, previous card, or owning column heading in that order.
- Explorer Search, global Search, `DP-VQ07`, Task 157 visual/copy realization,
  Task 158 Search-result Undo, common-card design, store/schema/persistence, and
  repository foundations were unchanged.

## Durable Ordering And Ownership

| Evidence | Value |
| --- | --- |
| Entrypoint | `2dfab8058e2b34ee55bab6460bbc152865434b5b` |
| Durable start | `ea0ace9`; ledger-only parent of implementation |
| Implementation | `5b370843de9440455706fef177e0a80734c13e23`; exactly nine approved product/test paths |
| Canonical impact | `None` — existing approved Task 156 contract implemented without authority change |
| Unowned / scope deviation | None |

## TDD And Repair Evidence

1. Initial hook/card RED evidence failed on the missing Undo controller and
   controls. The first attempted focused command accidentally used the package
   script form that ignored file arguments, so it ran the full suite and showed
   exactly seven new failures with the other 1,155 tests green.
2. Cycle 1 connected direct/staged command construction, authoritative truth,
   the shared lock, ordinary-card activation, and focus ownership. A focused
   run exposed an observer resubscribe loop caused by unstable entry-array
   identity; a stable provenance fingerprint fixed it. Explorer implementation
   ordering was caught before evidence was claimed, reverted completely, and
   then rebuilt from three failing owner tests. The Explorer test harness also
   gained an immediate `liveQuery` substitute because its mocked repository has
   no Dexie-observable reads. Typecheck and lint repairs stayed in approved
   owners. The first full gate passed but was invalidated by cycle 2.
3. High-risk review found that a committed Undo followed by an ambiguous
   response removed the live database result before reconciliation, so the
   exact card and selected path were not retained. Cycle 2 RED failed that
   owner assertion. The repair projects only pending/unknown/reconciling command
   snapshots into their exact owning columns and extends only a matching
   retained selected path. A staged Bit owner test additionally proved exact
   candidate routing and absence of a direct call.
4. Final requirement-matrix review found no remaining Critical, Important, or
   Minor concrete issue. No owner-discovery stop, path expansion, extra-cycle
   gate, no-progress signature, or `Unowned` item occurred. Two of the High-risk
   three-cycle budget were used.

## Latest Verification

| Command | Exit | Elapsed | Relevant result |
| --- | ---: | ---: | --- |
| `pnpm exec vitest run src/hooks/use-triage-newly-placed.test.tsx src/components/triage/hierarchy-explorer.test.tsx src/components/grid/node-card.test.tsx src/components/grid/bit-card.test.tsx src/hooks/use-triage-operation-lock.test.tsx` | 0 | `3.73s` | 5 files / 143 tests passed; exact direct/staged provenance, truth/blocker matrix, synchronous lock, no-bubble controls, unknown retention, and canonical focus order |
| `pnpm test` | 0 | `25.00s` | 99 files / 1,168 tests passed; existing Node deprecation and worker `localStorage` warnings only |
| `pnpm lint` | 0 | `7.56s` | 0 errors; 11 unchanged warnings outside Task 156 paths |
| `pnpm typecheck` | 0 | `1.34s` | `tsc --noEmit` passed |
| `pnpm build` | 0 | `10.32s` | Next.js 16.2.1 build passed; compile `4.5s`, TypeScript `3.9s`, seven pages generated |
| `git diff --check` | 0 | not separately measured | Passed before the implementation commit |

The latest exact serial full-gate total was `44.22s`. Earlier cycle-1 and
post-review runs were not reused: cycle 2 changed source/test inputs, and the
final four commands were rerun serially on implementation commit
`5b370843de9440455706fef177e0a80734c13e23`. Gate C and Task 155 evidence were
not reused.

No browser run was used. The hook, Explorer, and actual Card owner tests
directly exercise the claimed browser-relevant invariants: button activation
does not bubble into card navigation, the exact card/path remains mounted while
truth is unknown, competing intent does nothing, and terminal success follows
next-card → previous-card → column-heading focus. No computed-style, copy, or
pixel claim is made; Task 157 retains that ownership.

## Relevant-Input Fingerprint

Domain: `griddo-task-relevant-input-v1`. Each manifest is the SHA-256 of
newline-terminated, lexicographically path-ordered `Git-blob<TAB>path` lines at
the implementation commit. The following newline-terminated canonical payload
hashes to SHA-256
`8c9c042d4d91227f07becdeb14872ba6326ca48be66ce8140878da45ca192423`:

```text
domain=griddo-task-relevant-input-v1
task=156
implementation=5b370843de9440455706fef177e0a80734c13e23
src_tree=d29dbd1f462bb31edb7a5338ca85676fc3965499
test_manifest_sha256=7188e2045a9df0656ac30278648ec5677ac988ab21baeb01da50f76770eb77bb
task_path_manifest_sha256=89e4d94a60b97d3a371f0a942eaffa5eca8c9026cb7931da88ce64f1836fe90c
config_command_manifest_sha256=111450e6805057e33bc917444dcb1e86baf893a55e711e03634c9bc0f4d0a3fd
adapter_blob=7903892c04c4eb6fcd694712d5a01fdb608e183f
command_catalog_blob=2063146db0b8920dc8ee5805001e1541da49c2a0
node=v26.0.0
pnpm=10.22.0
platform=Darwin-24.5.0-arm64
```

The test manifest covers 99 tracked `src/**/*.{test,spec}.{ts,tsx}` files. The
task-path manifest covers the exact nine approved product/test paths. The
config/command manifest covers `package.json`, `pnpm-lock.yaml`, `tsconfig.json`,
`eslint.config.mjs`, `next.config.ts`, `vitest.config.ts`,
`postcss.config.mjs`, `docs/CODEX_WORKFLOW_COMMANDS.json`, and the Adapter.
Runtime token/accounting and prompt byte size were not measured.

## Checkpoint Buckets

- **Visible now:** eligible ordinary Explorer cards offer source-aware Undo;
  exact truth and blockers govern activation and terminal focus ownership.
- **Review now:** Task 156 implementation and evidence at this checkpoint.
- **Planned later:** Task 157 DP-VQ10 full visual/copy/status realization and
  Task 158 Search-result Undo.
- **Unowned:** None.
