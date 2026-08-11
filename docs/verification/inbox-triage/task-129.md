# Task 129 — Semantic Four-Area Inbox Shell

## Scope

Task 129 changes only the existing `TriageWorkspace` shell, its focused test,
semantic shell CSS, and this evidence package. It preserves the current
canonical Inbox route dispatch and existing DnD/state/handler tree. Explorer
item labels and Task 130-or-later behavior are excluded.

## Automated evidence

| Evidence | Command | Exit | Relevant result |
| --- | --- | ---: | --- |
| RED | `pnpm exec vitest run src/components/triage/triage-workspace.test.tsx` | 1 | 2 expected failures: the shell lacked `data-triage-role="shell-background"` and the `triage-shell` ratio contract; the 10 pre-existing Workspace tests passed |
| Focused GREEN | `pnpm exec vitest run src/components/triage/triage-workspace.test.tsx` | 0 | 1 file, 12 tests passed |
| Focused constraints | `pnpm typecheck`; `git diff --check` | 0 | TypeScript and whitespace checks passed before route verification |
| Full test | `pnpm test` | 0 | 89 files, 693 tests passed |
| Full lint | `pnpm lint` | 0 | 0 errors; unchanged 11 pre-existing warnings |
| Full typecheck | `pnpm typecheck` | 0 | `tsc --noEmit` passed |
| Full build | `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven routes generated |

The full gate was run serially exactly once after focused verification and
route review.

## Visible route evidence

- **Route:**
  `http://localhost:3000/grid/d376fba8-d282-462b-b80d-df1e6af98e80`
- **Seed/state:** fresh browser IndexedDB; application-seeded Inbox and Archive
  View system Nodes; Inbox selected; zero active Scratches, Breakdown rows,
  Staging candidates, and ordinary Grid items.
- **Viewports:** `1024×768` and `1920×1080` CSS pixels.
- **Theme/mode:** default GridDO in light and dark; Terminal light was also
  checked as a theme-tree preservation probe, then the route was restored to
  GridDO light.
- **Interaction steps:** open `/`; activate the sidebar Inbox system Node;
  inspect the four named regions; focus `#triage-grid-explorer-heading`;
  toggle light/dark; open Change color theme and choose Terminal; return to
  GridDO; resize to both approved widths.
- **Focus and expected result:** `Grid Explorer` is a stable `tabIndex=-1`
  heading landmark. Programmatic focus remained on
  `#triage-grid-explorer-heading` across both GridDO light/dark transitions.
  Choosing Terminal through the color-theme popover returned focus to the
  `Change color theme` trigger as expected, while the same four section DOM
  regions and all ratio attributes remained mounted.

### Landmarks and geometry

The accessibility tree exposed one `Inbox triage workspace` region containing
exactly four named section regions and headings: `Scratch Pool`, `Breakdown`,
`Staging`, and `Grid Explorer`. `Nodes` and `Bits` remained subordinate level-3
headings inside Staging.

| Viewport | Main work / Explorer | Breakdown / Staging | Nodes / Bits | Horizontal overflow |
| --- | --- | --- | --- | ---: |
| `1024×768` | `460.80 / 307.20` px (`60/40`) | `412.80 / 275.20` px (`60/40`, border rounding) | `96 / 179` px (`35/65`, border rounding) | `0` px |
| `1920×1080` | `648 / 432` px (`60/40`) | `950.39 / 633.59` px (`60/40`, border rounding) | `221.75 / 411.84` px (`35/65`, border rounding) | `0` px |

At `1920×1080`, all seven detected `overflow-y: auto` descendants inside
the five semantic internal-scroll viewport owners computed
`scrollbar-width: none`; scrolling semantics were not removed.

### Captures

| Capture | SHA-256 |
| --- | --- |
| [`task-129-griddo-light-1024x768.png`](captures/task-129-griddo-light-1024x768.png) | `659993e45fc9d11281074fef6d06d603cd106898d7c3411cdbccae97444e828f` |
| [`task-129-griddo-dark-1024x768.png`](captures/task-129-griddo-dark-1024x768.png) | `caa5d3bd79d9459455abcd86399577585b1f9d4ea22c4aceac0e1d7a05ae920c` |
| [`task-129-griddo-light-1920x1080.png`](captures/task-129-griddo-light-1920x1080.png) | `cacec17b94aa5bda5d57a814b7a4ce2b14a29f74760c27a5fea335ff37dba25e` |
| [`task-129-griddo-dark-1920x1080.png`](captures/task-129-griddo-dark-1920x1080.png) | `f2589daa4ba76622035aaf266c64fff16bb54827deaebb313df5e545367f5b6b` |

## Review

- Direct diff review found no theme-ID branch, replacement body, new
  state/effect, copied prototype handler, Explorer item-label change, or Task
  130+ behavior.
- The latest Vercel Web Interface Guidelines review found no concrete finding
  in the Task 129 changes. New heading landmarks use semantic elements and a
  replacement `:focus-visible` outline.
- Existing Explorer `L1`/`L2`/`L3` item labels are visibly unchanged because
  their replacement is explicitly owned by Task 134.
- Final localhost browser check reported zero new console errors.

## Checkpoint buckets

- **Visible now:** canonical Inbox route; fresh empty Inbox seed; GridDO light
  and dark at `1024×768` and `1920×1080`; visible and accessible Scratch
  Pool, Breakdown, Staging, and Grid Explorer; exact ratios; stable heading
  focus; hidden-scrollbar treatment; no horizontal overflow.
- **Review now:** section identity/chrome, ratio geometry, focus behavior,
  light/dark captures, focused/full evidence, and Task 129 user acceptance.
- **Planned later:** Task 130 owns Pool behavior; Task 134 owns full Explorer
  item labels; later approved tasks own their exact state and receipt surfaces.
- **Unowned:** None.
