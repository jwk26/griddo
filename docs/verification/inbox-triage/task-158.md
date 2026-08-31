# Task 158 — Integrate Undo Into Explorer Search Results Only

> State: Repaired through cycle 3/3; awaiting user checkpoint review
> Task marker: `[ ]`
> Implementation: `81c2f1e1f1229d79b0e32e08e300024853469324`

## Scope And Result

- The existing mounted `HierarchyExplorer` Undo controller now projects only
  locally placed matching Node/Bit records into the DP-VQ07 result body. The
  same Tasks 156–157 eligibility, blocker, pending, unknown, reconciliation,
  retry, conflict, and terminal result contracts are reused.
- Each eligible result has a trailing `Undo` action that is a sibling of the
  result activation button. It does not nest interactive controls, trigger
  reveal, bubble into selection, add `draggable`, or create a DnD source.
  The action binds both the Search-owned `explorer-search-undo` class/role and
  the accepted `newly-undo-action` realization class.
- Matching records observed during an active query enter its current results
  without reopening Search. Query and recorded result scroll remain unchanged
  through Undo states.
- Pending, unknown, not-applied, rejected, conflict, and every other
  non-success projection retain the exact result. Unknown exposes read-only
  `Check again`; not-applied reuses the accepted same-operation `Retry` path.
- Terminal success removes only the exact result, renders
  `Restored “{title}” to {source}.` in the fixed Search status, and focuses the
  next surviving result at the removed row's latest position. If no result
  survives at that position, focus returns to the Search input; no previous
  result fallback exists.
- Search-owned success is excluded from the ordinary-column success live
  region and ordinary next/previous/heading focus plan. Ordinary-card Undo
  behavior and dependencies are otherwise unchanged.

## Durable Ordering And Ownership

| Evidence | Value |
| --- | --- |
| Entrypoint | `57afa67e6cad93bbef74c8a23fad6f719e442d4c`; accepted Task 157 |
| Durable start | `dd2be1f65bb3709677b6af3e4ffbe319468d5f1f`; ledger-only parent of every Task 158 product/test write |
| Original implementation | `f041af0cf8eacfcf994b64481d489d393dd94b31`; exact eight approved product/test paths |
| Cycle 3 repair implementation | `81c2f1e1f1229d79b0e32e08e300024853469324`; parent `66010d3481f5f4aa698a84b1de3c1b58c5e5dcd0`; exact Search-result component/test paths only |
| Dependencies | Accepted Tasks 114, 151, 156, and 157 were revalidated as ancestors before the first write |
| Canonical impact | `None` — exact DP-VQ07/DP-VQ10 Search-only composition; no canonical document changed |
| Owner gate / unowned | No owner-discovery stop, scope stop, path expansion, or extra-cycle gate; `Unowned: None` |

## TDD And Repair Evidence

1. Cycle 1 RED first ran three owners / 49 tests: five expected failures proved
   the absent independent result action, Search success feedback/removal/focus,
   and mounted provenance seam while 44 existing tests passed. The separate
   Explorer RED ran the two new Task 158 integration tests and both failed
   because no Search result Undo existed.
2. Minimal implementation composed the existing Undo controller into Search,
   added sibling result/action DOM, retained non-success rows, and delegated
   success removal/status/focus to the Search hook. An initial focused run
   passed 4 files / 144 tests in `3.43s`; focused typecheck then found two
   readonly assignments in the new test lock fixture. A getter-based fixture
   repaired that test-only type error, and focused evidence passed.
3. Cycle 1's serial full gate passed on its then-current input in `38.75s`, but
   High-risk async review found a concrete defect: if reactive results changed
   during pending Undo, terminal success could choose focus from the stale
   activation-time list. That gate was invalidated before checkpoint.
4. Cycle 2 RED inserted a result before the pending Undo target and reproduced
   the wrong focus (`albatross` instead of the current same-position `alto`).
   The Search hook now reads the latest result projection and recomputes the
   removed row's actual current index, while retaining the captured index only
   if repository observation already removed that row. The targeted RED then
   passed.
5. The cycle 2 focused and full evidence was later invalidated by checkpoint
   review: the trailing action omitted the canonical Search-owned role, and
   the recorded 99-test manifest did not apply the stated global
   lexicographic path ordering.
6. Cycle 3 RED added the exact role assertions to the result owner. It failed
   1 of 9 tests in `1.46s`, receiving only
   `newly-undo-action shrink-0`. The minimal repair added
   `explorer-search-undo` as both class and `data-triage-role`, preserving the
   existing realization class; the same owner passed 9/9 in `1.01s`.
7. Latest focused and every catalog full command reran on repair commit input.
   Final High-risk diff review found no remaining concrete issue, extra path,
   authority need, or `Unowned` item. All three approved cycles were used; no
   fourth-cycle gate was requested or used.

## Latest Verification

| Command | Exit | Elapsed | Relevant result |
| --- | ---: | ---: | --- |
| `pnpm exec vitest run src/components/triage/grid-explorer-search-results.test.tsx src/components/triage/hierarchy-explorer.test.tsx src/hooks/use-grid-explorer-search.test.tsx src/hooks/use-triage-newly-placed.test.tsx` | 0 | `3.37s` | 4 selected files / 145 tests passed |
| `git diff --check` | 0 | `0.01s` | Adapter focused diff check passed |
| `pnpm typecheck` (focused) | 0 | `1.53s` | Adapter focused typecheck passed before the latest full gate |
| `pnpm test` | 0 | `21.50s` | 99 files / 1,196 tests passed; existing Node deprecation and worker `localStorage` warnings only |
| `pnpm lint` | 0 | `6.68s` | 0 errors; 11 unchanged warnings outside Task 158 paths |
| `pnpm typecheck` | 0 | `1.24s` | `tsc --noEmit` passed |
| `pnpm build` | 0 | `9.91s` | Next.js 16.2.1 build passed; compile `4.4s`, TypeScript `3.7s`, seven pages generated |

The latest exact four-command serial full-gate total was `39.33s`. No Gate C,
Task 155–157, or earlier Task 158 gate was reused. Cycle 2's `38.59s` gate and
fingerprint were invalidated by the role repair and the manifest-ordering
finding; every focused and full command was rerun on the cycle 3 implementation
commit input.

No browser run was used. Result-component owner tests establish sibling
interactive controls, non-drag semantics, event isolation, recovery-action
focus, the exact Search-owned plus realization role binding, exact visible
status, and scripted result-viewport ownership. Search
hook tests establish active query and recorded scroll retention, reactive
matching additions, exact-result removal, latest-index next-result/input focus,
and no previous fallback. Mounted Explorer/Newly owner tests establish the
shared Undo state/command substitution, unknown retention, read-only
reconciliation, Search-only success ownership, and ordinary-column regression
through the unchanged shared controller. No browser-computed style, pixel,
physical pointer/touch, viewport geometry, or runtime media-query claim is
made.

## Relevant-Input Fingerprint

Domain: `griddo-task-relevant-input-v1`. Each manifest is the SHA-256 of
newline-terminated, lexicographically path-ordered `Git-blob<TAB>path` lines at
the implementation commit. The following newline-terminated canonical payload
hashes to SHA-256
`4616261c3066cd220583e34b1628045ff622c2863fe4d6b8e3e3880b10de50bc`:

```text
domain=griddo-task-relevant-input-v1
task=158
implementation=81c2f1e1f1229d79b0e32e08e300024853469324
src_tree=36a32647ec8fd7587e0942960f948881d819f624
test_manifest_sha256=5f7629e1261deb4ef795ce2ae6cee568a0809b0f0d6631c8d5f6e6167bd64d2f
task_path_manifest_sha256=2259f694e1f5ea74b95033cbf42a0a8157c3d49cf9235fee8d1bc6825629a24e
config_command_manifest_sha256=111450e6805057e33bc917444dcb1e86baf893a55e711e03634c9bc0f4d0a3fd
adapter_blob=7903892c04c4eb6fcd694712d5a01fdb608e183f
command_catalog_blob=2063146db0b8920dc8ee5805001e1541da49c2a0
node=v26.0.0
pnpm=10.22.0
platform=Darwin-24.5.0-arm64
```

The test manifest covers 99 tracked `src/**/*.{test,spec}.{ts,tsx}` files. The
task-path manifest covers the exact eight approved product/test paths. The
config/command manifest covers `package.json`, `pnpm-lock.yaml`,
`tsconfig.json`, `eslint.config.mjs`, `next.config.ts`, `vitest.config.ts`,
`postcss.config.mjs`, `docs/CODEX_WORKFLOW_COMMANDS.json`, and the Adapter.
Runtime token/accounting and prompt byte size were not measured. Two exact
Task 158 prompts were mechanically identifiable: the initial work order and
the delta-only cycle 3 continuation.

The superseded `0c6d86a7…` test manifest hashed Git tree traversal order rather
than the claimed global path order; applying the stated algorithm to the old
implementation reproducibly yields `ac757dff…`. The cycle 3 product/test
change independently invalidated every implementation-dependent component.
Accordingly neither the old manifest nor fingerprint `15f4a0ee…` was reused.

## Checkpoint Buckets

- **Visible now:** Search-only trailing Undo, retained non-success rows, exact
  success status, and deterministic next-result/input focus over the accepted
  ordinary Undo model.
- **Review now:** Task 158 implementation/evidence/audit at this checkpoint.
- **Planned later:** Phase 30–31 remain separately schedulable and unstarted.
- **Unowned:** None.
