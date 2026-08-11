# Task 133 — Source-backed Staging base

## Scope and authority

- Route: `http://localhost:3000/grid/00000000-0000-4000-8000-000000000501`.
- Recovery anchor: ledger-only blocker commit
  `52f3b0c2f88ea25e627a6c3c2cf00fd7f19ef237`; durable resumed-start
  commit `6ef38a4` precedes all production/test changes.
- The user approved `triage-workspace.tsx` and its test as bounded additional
  Task 133 scope only for Task 131 authoritative Node/Bit counts in the
  existing subsection headings. Heading semantics, the Staging heading ID,
  focus structure, and the existing `35/65` shell remain unchanged.
- Product authority checked: `UF-13`, `NEG-06`, `NEG-08`, `NEG-12`, the
  adopted Staging recipe, and accepted Task 131 `useStagedCandidates` API.
- `StagingZone` reads Task 131 durable renderable projections and current
  source content. It does not read the deprecated Zustand candidate map.

## TDD and focused verification

- Initial RED:
  `pnpm exec vitest run src/components/triage/staging-zone.test.tsx src/components/triage/triage-drag-token.test.tsx src/components/triage/triage-workspace.test.tsx`
  exited `1`: eight expected failures and 28 passes exposed legacy Zustand
  rendering, large empty cards, missing exact ordering/whole-root/scroll
  behavior, missing authoritative heading counts, and an unbounded token.
- Accessibility review RED: the whole-root test exited `1` before visible
  focus, touch drag intent, and reduced-motion classes were added.
- Runtime review RED: a 30/30 overflow seed expanded each Staging well from
  the empty-state `370px` / `557px` heights to `1138px` / `1316px`, resizing
  the panel. A focused containment expectation failed before repair.
- Final selected GREEN before the full gate: three files and 36 tests passed.
- After the final containment repair, the three selected files passed all 36
  tests; Task-path ESLint, `pnpm typecheck`, and `git diff --check` exited `0`.

## Runtime method and evidence repairs

The required in-app Browser Node REPL was not available after tool discovery,
so the documented fallback used an isolated headless Chrome CDP target against
the local Next.js development server. Browser IndexedDB was seeded with valid
v4/Dexie-version-40 Inbox, Scratch, Breakdown, and staged-candidate records.
All interactions and captures remained on localhost.

The first evidence command stopped before browser interaction because Node 26
could not infer a stdin module format containing both `require` and top-level
`await`. The CommonJS harness then stopped on an incorrect raw IndexedDB
version expectation (`4` instead of Dexie's physical `40`). Both were
evidence-harness-only repairs with no product/test mutation. The first working
runtime pass found the panel-resize defect; `[contain:size]` plus bounded
height repaired it. The final capture pass also moved focus verification
before bottom-scroll measurement so focus did not reset the Node scroll
position. No premature or additional full gate was run.

## Observable results

| State | 1024×768 and 1920×1080 result |
| --- | --- |
| Empty | Bare `Nodes` / `Bits`; both wells `data-empty="true"`; no placeholder card or message; stable `370px` / `557px` heights |
| One per type | Bare `Nodes` / `Bits`; one square icon-centered Node card and one text Bit row; whole root focus label `Drag Node candidate 01 staged node` |
| Multi | Exact `2 Nodes` / `3 Bits`; two-column Node cards and vertical Bit rows; newest-first source labels |
| Overflow | Exact `30 Nodes` / `30 Bits`; fixed `370px` / `557px` wells; Node/Bit `scrollHeight` exceeds `clientHeight`; both bottom positions and last items are reachable |
| Layout | `data-layout-ratio="35/65"`; measured Node/Bit width ratio `0.5384` at both widths; zero document horizontal overflow |
| Scroll chrome | Computed `scrollbar-width: none` independently for both wells at both widths |
| Interaction | Programmatic primary click caused no candidate mutation; the root retained drag/focus semantics and no internal handle, menu, detail, permanent Unstage, or `VQ-06` appearance was present |
| Pointer token | Actual Node and Bit pointer drags produced pointer-centered, pointer-transparent overlays: Node `32×32px`; Bit `102.59375×32px`; the lower return target remained transient |
| Runtime | Final capture sequence reported zero runtime console errors |

The stable order is `createdAt DESC`, then ID ascending. The capture seed uses
descending timestamps, while the exact same-timestamp ID tie-break is covered
by the focused component test.

## Captures

| Capture | SHA-256 |
| --- | --- |
| [`task-133-empty-1024x768.png`](captures/task-133-empty-1024x768.png) | `b2b4da9db007b96cc00d4c268c455bb4e3256f00c8a2c510e1d64abdd1e64a36` |
| [`task-133-empty-1920x1080.png`](captures/task-133-empty-1920x1080.png) | `7c94f5ca2f9cf9642953c54054b1ba87887cbf571ad87b0ee35eebda4e811047` |
| [`task-133-one-1024x768.png`](captures/task-133-one-1024x768.png) | `5c850c2b18d010fab6b34d3ec0970f28908735034faf2ecd4427f400794ca354` |
| [`task-133-one-1920x1080.png`](captures/task-133-one-1920x1080.png) | `264fdc61f2364af998b16bc4303284e7016d82faf1c069554d797cef6caec1af` |
| [`task-133-multi-1024x768.png`](captures/task-133-multi-1024x768.png) | `5816abd3e1117f3677afbd6a6885008f8eb722c9713186de185df62c58cfc7b5` |
| [`task-133-multi-1920x1080.png`](captures/task-133-multi-1920x1080.png) | `397f1c6aba5fa2340861fa9ab9bd572e8fbbeed430e1c2dc8cfa664bc6fd98e8` |
| [`task-133-overflow-1024x768.png`](captures/task-133-overflow-1024x768.png) | `6175947add0f428a6c311c43010236ed5b9711bcd6a24ab2f010c19ddabad426` |
| [`task-133-overflow-1920x1080.png`](captures/task-133-overflow-1920x1080.png) | `7c83ffaf98dac9d36b87af586066338c7f0d7f129a56518bcb27d9c84fbeb654` |
| [`task-133-token-node-1024x768.png`](captures/task-133-token-node-1024x768.png) | `4c435c75ac8d8535f2954e2ca0cc89e3bbdb1c2ce415f56535fad43990e5f5ab` |
| [`task-133-token-node-1920x1080.png`](captures/task-133-token-node-1920x1080.png) | `9814b0057a6d6e8730c28a980e06d3b3379c3e199f5275ca4a0a8d3584caf1c1` |
| [`task-133-token-bit-1024x768.png`](captures/task-133-token-bit-1024x768.png) | `decfd05f37995635c98355b11b786e3c3d8b2ad6d13937290ae319f4967684d6` |
| [`task-133-token-bit-1920x1080.png`](captures/task-133-token-bit-1920x1080.png) | `2700633ace55abcfc25f9080e093e224d96caea6469af55a44788a09c486a35a` |

## Review and full gate

- Adopted-recipe and Web Interface Guidelines review found the missing
  whole-root focus/touch/reduced-motion treatment and the runtime panel-resize
  defect; both were repaired with focused evidence.
- No remaining concrete Critical or Important Task 133 finding was identified
  in the bounded source/diff/visual review.
- Exactly one post-final-repair serial full gate ran with no relevant
  production/test input change afterward:

| Command | Exit | Result |
| --- | ---: | --- |
| `pnpm test` | `0` | 90 files and 733 tests passed |
| `pnpm lint` | `0` | 0 errors; the unchanged 11 pre-existing warnings |
| `pnpm typecheck` | `0` | `tsc --noEmit` passed |
| `pnpm build` | `0` | Next.js 16.2.1 production build completed; seven routes generated |
