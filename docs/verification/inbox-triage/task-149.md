# Task 149 Verification — Implementation Checkpoint

> State: `Implemented — awaiting user review`. Task 149 remains `[ ]`; this is
> implementation checkpoint evidence, not acceptance evidence.

## Scope Exercised

- Release-time rendered hierarchy target selection over stale DnD hover data.
- Valid, invalid, and full feedback; full targets remain release selections.
- Valid Explorer-column edge scrolling and exit/end/Escape/remote-invalidation
  cancellation while `DndContext autoScroll={false}` remains unchanged.
- Mouse and touch coordinate owner tests plus focused browser mouse evidence.

## TDD And Gate Evidence

| Command / modality | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm test -- src/hooks/use-triage-dnd.test.ts src/components/triage/hierarchy-explorer.test.tsx src/components/triage/triage-workspace.test.tsx` | 1 | Initial RED: six new Task 149 assertions failed; existing release selected the stale target. This package-script form also ran the full suite, so it is not claimed as focused selected-target evidence. |
| `pnpm exec vitest run src/hooks/use-triage-dnd.test.ts src/components/triage/hierarchy-explorer.test.tsx src/components/triage/triage-workspace.test.tsx` | 0 | Intermediate focused GREEN after the third repair: 3 files, 103 tests passed. |
| `pnpm exec vitest run src/hooks/use-triage-dnd.test.ts src/components/triage/hierarchy-explorer.test.tsx` | 1 | Fourth-cycle RED: 4 failures among 65 tests reproduced no-post-activation mouse release, stationary-touch activation, same-coordinate geometry refresh, and multi-frame stationary-pointer row change. |
| `pnpm exec vitest run src/hooks/use-triage-dnd.test.ts src/components/triage/hierarchy-explorer.test.tsx src/components/triage/triage-workspace.test.tsx` | 0 | Latest focused GREEN: 3 files, 107 tests passed. |
| `pnpm test` | 0 | Superseded intermediate input: 95 files, 990 tests passed; not reused after the fourth production repair. |
| `pnpm test` | 0 | Latest-input complete test gate: 95 files, 995 tests passed. |
| `pnpm lint` | 1 | Intermediate full lint found one new React ref error and one new hook-dependency warning. |
| `pnpm lint` | 0 | Latest input: zero errors and 11 unchanged pre-existing warnings. |
| `pnpm typecheck` | 0 | Latest input: `tsc --noEmit` passed. |
| `git diff --check` | 0 | Latest input passed. |
| `pnpm build` | 0 | Latest-input Next.js 16.2.1 production build compiled, typechecked, and generated all 7 routes. |
| `pnpm exec vitest run src/hooks/use-triage-dnd.test.ts` | 1 | Fifth-cycle harness setup run: 6 component-render errors exposed a missing partial mock export; corrected before claiming behavioral RED. |
| `pnpm exec vitest run src/hooks/use-triage-dnd.test.ts` | 1 | Fifth-cycle behavioral RED after harness setup was corrected: 6 failures among 58 tests reproduced same-ID `valid` feedback retention and post-cancellation Explorer frame work for document exit, window blur, remote invalidation, Escape, and drag end. |
| `pnpm exec vitest run src/hooks/use-triage-dnd.test.ts` | 0 | Fifth-cycle owner GREEN: 1 file, 58 tests passed. |
| `pnpm exec vitest run src/hooks/use-triage-dnd.test.ts src/components/triage/hierarchy-explorer.test.tsx src/components/triage/triage-workspace.test.tsx` | 0 | Fifth-cycle latest focused GREEN: 3 files, 113 tests passed. |
| `pnpm test` | 0 | Fifth-cycle intermediate full test: 95 files, 1001 tests passed; a later test-harness purity repair invalidated this exact test input. |
| `pnpm lint` | 1 | Fifth-cycle intermediate lint rejected one render-time external assignment in the new integration harness; product behavior was unchanged. |
| `pnpm test` | 0 | Fifth-cycle final latest-input complete test gate: 95 files, 1001 tests passed. |
| `pnpm lint` | 0 | Fifth-cycle final input: zero errors and 11 unchanged pre-existing warnings. |
| `pnpm typecheck` | 0 | Fifth-cycle final input: `tsc --noEmit` passed. |
| `pnpm build` | 0 | Fifth-cycle final input: Next.js 16.2.1 compiled, typechecked, and generated all 7 routes. |
| `git diff --check` | 0 | Fifth-cycle final input passed before documentation-only checkpoint updates. |

## `WF28-02` Deterministic Product Evidence Fingerprint

The final successful focused/full evidence is anchored at implementation
commit `1830cc37ff913bd1d4ad4b62ddd9f7b2319b4dca`. The anchor is provenance,
not part of the composite identity, so a later docs-only commit can reuse the
evidence when every product-input subdomain still matches.

Each tracked-input subdomain uses SHA-256 over its ASCII domain header plus LF,
then the listed manifest lines plus LF. Git manifests use sorted
`<mode> <type> <object-id>\t<path>` lines from `git ls-tree`; source/test lines
come from `git ls-tree -r <candidate> -- src`, partitioned by whether the path
matches `\.test\.(ts|tsx)$`.

| Fingerprint subdomain | Deterministic input | SHA-256 |
| --- | --- | --- |
| `griddo-task149-source-v1` | 131 non-test tracked files under `src` | `628d914a4cef68dd7e5ab51ae7a5a450c58a1bc3f08572c105b15bd0eaf4a87e` |
| `griddo-task149-test-v1` | 95 tracked `src/**/*.test.{ts,tsx}` files | `54d8517e2e137078c9be88ffce0280653c6dbe129cacdcf27c9b66a5db972cad` |
| `griddo-task149-build-config-v1` | `eslint.config.mjs`, `next.config.ts`, `package.json`, `pnpm-lock.yaml`, `postcss.config.mjs`, `tsconfig.json`, `vitest.config.ts` | `850b7701604afa49a69726b1bebbe96f3f20765f789f28841e4c5a43195ceda4` |
| `griddo-task149-command-v1` | Git manifests for `docs/CODEX_WORKFLOW_ADAPTER.json` and `docs/CODEX_WORKFLOW_COMMANDS.json`, followed in order by the labeled commands below | `fb7646b438393a9f80383d0e0fbcb5d265d30f15795f65f876b8327b5ca66dbc` |
| `griddo-task149-environment-v1` | Sorted requirements: `arch=arm64`, `node=v26.0.0`, `os=Darwin`, `pnpm=10.22.0` | `10f5e026d35f53f98e3117272998a0c0092d03d45d7cc13fb79eefd67b1bdbc3` |

At the evidence anchor, the command-domain Git objects are Adapter blob
`ab4f7c765c1b27e48c7a46b9084ce6cc0a4af60e` and command-catalog blob
`2063146db0b8920dc8ee5805001e1541da49c2a0`. In the following code block,
each visible `\t` escape denotes one ASCII TAB byte in the hashed payload.
The command-domain labeled lines, in fingerprint order, are:

```text
focused-selected\tpnpm exec vitest run src/hooks/use-triage-dnd.test.ts src/components/triage/hierarchy-explorer.test.tsx src/components/triage/triage-workspace.test.tsx
diff-check\tgit diff --check
test\tpnpm test
lint\tpnpm lint
typecheck\tpnpm typecheck
build\tpnpm build
```

The complete `src` Git tree OID is
`e83086e1044bb2deebc6837f997bebc06b316146`. The composite payload is exactly:

```text
griddo-task149-product-evidence-v1
src_tree_git_oid=e83086e1044bb2deebc6837f997bebc06b316146
source_sha256=628d914a4cef68dd7e5ab51ae7a5a450c58a1bc3f08572c105b15bd0eaf4a87e
test_sha256=54d8517e2e137078c9be88ffce0280653c6dbe129cacdcf27c9b66a5db972cad
build_config_sha256=850b7701604afa49a69726b1bebbe96f3f20765f789f28841e4c5a43195ceda4
command_sha256=fb7646b438393a9f80383d0e0fbcb5d265d30f15795f65f876b8327b5ca66dbc
environment_sha256=10f5e026d35f53f98e3117272998a0c0092d03d45d7cc13fb79eefd67b1bdbc3
```

including the final LF. Its SHA-256 is
`a2da7ab6f49ba50d9fba9d3ea5e3fb568990e05f264891844e2534e2e00dfdd8`.
Product evidence is reusable only when a candidate recomputation matches the
complete `src` tree, every subdomain, and this composite. The three allowed
Task 149 checkpoint documents are outside the domain, so a docs-only commit
does not invalidate the product result.

## Browser Modality

Chromium mouse evidence used route
`/grid/294c56ab-df43-4020-9aa7-24dbc61a1a32`. The original edge run moved the
Home column from `scrollTop 0` to `348`, released on the final rendered
`Explorer Root 14`, stopped after exit, and cancelled on Escape/end. The
fourth-cycle stationary-pointer run sampled seven frames at scroll positions
`50, 190, 330, 430, 570, 690, 830`; all seven pointer-under rows were distinct
and `valid`, and release selected the seventh rendered row
`Home → Cycle 4 Root 02`.

For release-time geometry, a mouse drag remained fixed at viewport point
`(534.375, 776.086)`. Programmatic Explorer scrolling changed the rendered
pointer-under row from `Explorer Root 11` at `scrollTop 0` to
`Explorer Root 05` at `scrollTop 350`; without another pointer move, release
opened destination `Home → Explorer Root 05`. Browser console had zero errors;
the placement dialog emitted its known missing-description warning. No
unrelated theme, route, reduced-motion, or cross-tab matrix was repeated.
Stationary touch activation is owner-test evidence, not claimed as a
touch-browser run.

Fifth-cycle Chromium mouse lifecycle evidence held a valid drag at the Home
column bottom edge. Four 90 ms samples progressed through scroll positions
`110, 176, 308, 451`. After `window blur`, four 100 ms samples remained at
`451`, the pointer-under row returned to `idle-valid`, and Escape/release
opened no placement dialog. Browser console contained zero errors. The
same-ID payload replacement and remote-invalidation boundaries are covered by
the mounted Explorer-to-hook owner tests rather than a repeated browser data
matrix.

## Repair Cycles And Review

1. Replaced stale hierarchy release targeting, added feedback and explicit
   scrolling/cancel owners; repaired a per-column RAF recursion/ownership flaw.
2. Repaired React ref and listener dependency findings from lint.
3. Reproduced and repaired document-exit target retention with a failing
   `mouseleave` test.
4. Preserved pre-activation mouse/touch coordinates and refreshed rendered
   classification on stationary frames; final review exposed same-ID and
   cancellation integration gaps.
5. Keyed feedback by the complete relevant rendered identity, made late frame
   refresh inert across every cancellation boundary, and replaced isolated
   coverage with mounted Explorer-to-hook regressions.

The first read-only High-risk review reported two Important findings:

- `P28-01`: no-post-activation-move release can lack pointer coordinates and
  fall back to stale `event.over`.
- `P28-02`: stationary-pointer scrolling can stop when a new row moves beneath
  the edge pointer because feedback remains tied to the prior row ID.

The user approved one fourth bounded repair cycle. `P28-01` now retains mouse
and touch coordinates before and after activation, and release uses current
rendered geometry whenever coordinates exist. The attempted `P28-02` repair
refreshes the same pointer coordinate on every Explorer animation frame while
preserving the existing occupancy request generation and source stale guards.
The focused and complete gates above are from that repaired input.

The fourth-cycle final read-only High-risk re-review found two Important issues
and no Critical issues:

- `P28-02` remains incomplete because feedback identity is cached only by
  `dropId`. A section target can keep the same ID while its rendered parent,
  level, title/path, or occupancy payload changes, so stationary-frame
  classification can retain the old feedback until release.
- `P28-03` is a new cancellation integration defect: Explorer retains its
  closure-local pointer and calls the refresh owner after document exit,
  window blur, or remote invalidation. Because the classifier remains active,
  the next frame can restore feedback and edge scrolling even though mutation
  remains cancelled.

The user approved one fifth bounded repair cycle. Mounted owner tests now
prove same-ID `parent-a → parent-b` payload replacement reissues occupancy and
changes `valid → full`. The same harness proves queued frames after document
exit, window blur, remote invalidation, Escape, and drag end cannot restore
feedback, requery occupancy, invoke refresh, or move scroll. P28-01's immediate
mouse/touch release tests remain green.

Final read-only High-risk re-review found no Critical or Important issues and
independently reran the focused 3 files / 113 tests green. `P28-01`, `P28-02`,
and `P28-03` remain repaired awaiting the Task 149 checkpoint; none is marked
Closed or Accepted.
