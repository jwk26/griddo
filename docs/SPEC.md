# GridDO — Technical Specification

> **Scope:** Architecture, routing, file organization, and page layouts. Data model lives in SCHEMA.md. Design values live in DESIGN_TOKENS.md.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Decisions](#architecture-decisions)
- [Routes](#routes)
- [File Organization Conventions](#file-organization-conventions)
- [Page Layouts](#page-layouts)
- [Responsive Breakpoints](#responsive-breakpoints)
- [Key File Paths](#key-file-paths)

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js (App Router) | 16 | Routing, layouts, static shell |
| Language | TypeScript | 5.x strict | Type safety across the codebase |
| UI Runtime | React | 19 | Component model, hooks, concurrent features |
| Styling | Tailwind CSS | 4.x | Utility-first styling |
| Component Library | shadcn/ui (Radix primitives) | latest | Accessible, composable UI primitives |
| Icons | Lucide React | latest | Icon library for Nodes, Bits, sidebar, and UI elements |
| Validation | Zod | 3.x | Runtime schema validation at data boundaries |
| Storage | Dexie.js (IndexedDB) | 4.x | Type-safe IndexedDB wrapper with reactive queries (`useLiveQuery`) |
| Theming | next-themes | latest | Dark/Light mode with system preference detection |
| Dates | date-fns | 4.x | Date arithmetic — aging, urgency, calendar rendering |
| State Management | Zustand | 5.x | Lightweight client state — edit mode, sidebar, drag state, calendar view |
| Animation | Motion (Framer Motion) | latest | Jiggle mode, sinking effects, floating animation, vignette, magnet snap |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable | latest | Grid reordering, calendar scheduling, timeline ordering |
| Package Manager | pnpm | latest | Fast, disk-efficient dependency management |

---

## Architecture Decisions

1. **Client Components by default** — GridDO is local-first. All data lives in IndexedDB, accessed from the browser. Server Components are used only for static layout shells (root layout, page skeletons). Any component that reads data or handles interaction is a Client Component.

2. **DataStore abstraction (two-layer)** — Data access has two independent abstraction boundaries. **CRUD layer:** All write operations go through a `DataStore` interface (`src/lib/db/datastore.ts`). v1 implements with Dexie.js/IndexedDB (`src/lib/db/indexeddb.ts`). **Reactive layer:** All read subscriptions go through custom hooks (`src/hooks/use-*.ts`), which internally use Dexie `useLiveQuery` in v1. Components never import DataStore or Dexie directly — they import hooks only. Both layers are independently replaceable for v2 cloud sync. This is a **critical PRD constraint**. See PRD Section 1: Storage Strategy.

3. **Reactive data via custom hooks** — Components subscribe to data through custom hooks (`useGridData`, `useBitDetail`, `useCalendarData`, `useSearch`), which internally use Dexie's `useLiveQuery` in v1. This eliminates manual cache invalidation — write to the store, and all subscribed components update automatically. The hooks are the abstraction boundary; swapping `useLiveQuery` for React Query or SWR in v2 requires no component changes.

4. **URL-driven grid navigation** — The current grid position is encoded in the URL (`/` for Level 0, `/grid/[nodeId]` for deeper levels). This enables browser back/forward navigation through the grid hierarchy. Breadcrumbs and URL stay in sync.

5. **Bit detail via query parameter** — Opening a Bit detail popup appends `?bit=[bitId]` to the current URL. Browser back closes the popup. This works from both grid and calendar views.

6. **Computed values at render time** — Aging state, Node completion, badge urgency, and Bit progress are computed during rendering from stored data (see SCHEMA.md). Never stored. This avoids stale derived state and simplifies the write path.

7. **Zod validation at write boundary** — Data is validated with Zod schemas (SCHEMA.md) when entering the DataStore (create/update operations). Data read from the store is trusted — no runtime validation on reads. This keeps read paths fast.

8. **Domain-grouped shared components** — Shared components are organized by domain (`grid/`, `calendar/`, `bit-detail/`, `layout/`, `trash/`, `quick-capture/`, `triage/`, `archive/`) under `src/components/`. Page-specific components live in `_components/` within their route folder.

9. **Zustand for client state** — GridDO has complex UI state (edit mode, sidebar fold, drag operations, calendar drill-down, search query). React Context alone doesn't scale for cross-cutting interactive state. Zustand stores in `src/stores/` provide lightweight, boilerplate-free state management. Data state stays in Dexie (`useLiveQuery`); UI state stays in Zustand. Clean separation.

10. **next-themes for dark/light theming** — Dark/Light mode via `next-themes` provider in root layout. Theme token switching is handled through CSS custom properties in `globals.css`, referenced by Tailwind classes. No conditional class logic in components.

11. **Optimistic UI everywhere** — Local-first means zero network latency. All mutations (create, update, delete, move, complete) apply instantly to IndexedDB and reflect immediately via `useLiveQuery`. No loading spinners, no optimistic rollback, no error states for data operations.

12. **@dnd-kit for all drag interactions** — Unified drag-and-drop across: grid cell repositioning, drag-into-Node (move with confirmation), calendar pool-to-day scheduling, Chunk timeline reordering, and drag-to-breadcrumb (edit-mode-only). Grid repositioning and drag-to-child are always enabled; breadcrumb drops require edit mode. Custom collision detection (`gridCollisionDetection`) prioritizes node-drop targets over cell targets. Single library, consistent interaction model.

13. **Motion for all animations** — The PRD specifies jiggle mode, sinking effects, floating animation, vignette transitions, magnet snap, and task-tossing. Motion (Framer Motion) handles all of these declaratively. CSS-only would be insufficient for the interaction-driven animations GridDO requires. Animation variants defined per domain in `src/lib/animations/`.

14. **Pure utility functions for algorithms** — BFS auto-placement, aging state computation, urgency level computation, and Node completion check are pure functions in `src/lib/utils/`. No side effects, independently testable.

15. **System Nodes (lifecycle)** — Two system Nodes (`systemRole: 'inbox' | 'archive_view'`) are seeded at first launch / migration (defaults in SCHEMA.md § Default System Nodes). They use the standard `/grid/[nodeId]` URL but render role-specific surfaces (Inbox → Triage workspace; Archive View → Archive View surface) — **no new routes**. System Nodes cannot be archived or trashed; they are removed from the L0 grid via `hiddenFromGrid` (not trash) and always appear in the sidebar regardless. `systemRole` is immutable; non-null uniqueness is enforced at the application level. Archive is a manual lifecycle action (`archivedAt`, Hooks 10/11); completion never auto-archives.

16. **Compact-token DnD + pending-confirmation targets (Inbox/Triage)** — Extends Decision 12. Inbox/Triage drag interactions (Breakdown rows, staged Node/Bit candidates) use a **compact drag token** rather than a full-row/card preview, with pointer-centered targeting. Drop targets distinguish three states — valid, invalid, and **pending-confirmation** (a drop that opens a confirmation dialog before any write). This is a local, partial implementation of the broader Grid DnD direction (`2026-06-02-grid-dnd-preview-and-drop-targeting`, not promoted in full); existing main-grid / calendar / pool DnD is unchanged.

17. **Color theme axis (Batch 2)** — Color theme is a second visual axis layered on top of `next-themes` dark/light mode. Dark/light remains class-based (`.dark`); color theme is stored separately and applied to `<html data-color-theme="...">`. The canonical theme set is `griddo`, `tiny-desk`, `neumorphism`, `claymorphism`, `origami`, `terminal`, `retro-mac`, and `graphite`. Components consume semantic CSS variables and theme surface classes; they must not branch on theme id except in the theme picker. Prototype files are visual/function references only — implementation patches the current app and preserves current behavior.

18. **Batch 2 visual alignment preserves Phase 19 behavior** — Theme, Calendar, Grid, and Inbox/Triage visual changes are applied over the current Phase 19 app. They do not reopen lifecycle rules, system node routing, Archive View behavior, direct archive behavior, calendar DnD, or Inbox/Triage compact-token DnD. If a high-fidelity prototype value conflicts with accessibility, current behavior, or build constraints, the conflict is recorded explicitly instead of silently normalizing the design away. **One deliberate exception:** the Scratch Pool auto-collapse trigger is realigned from "collapse on Scratch selection" to "collapse on the first Breakdown keystroke" (`ISSUE-18-17`), restoring the original Inbox/Triage design intent from the `2026-04-28-inbox-triage-workspace` decision — a recorded behavior change, not a silent one.

---

## Routes

| Route | Purpose | Rendering | File |
|-------|---------|-----------|------|
| `/` | Level 0 grid — root Nodes | Route-group layout + Client grid | `src/app/(grid)/page.tsx` |
| `/grid/[nodeId]` | Grid view inside a Node (Level 1-3) | Route-group layout + Client grid | `src/app/(grid)/grid/[nodeId]/page.tsx` |
| `/calendar/weekly` | Calendar:Weekly — global weekly schedule | Client | `src/app/calendar/weekly/page.tsx` |
| `/calendar/monthly` | Calendar:Monthly — global monthly overview | Client | `src/app/calendar/monthly/page.tsx` |
| `/trash` | Trash zone — soft-deleted items | Client | `src/app/trash/page.tsx` |

**Route-group layout:** Grid routes (`/` and `/grid/[nodeId]`) share a `(grid)` route group with a common layout at `src/app/(grid)/layout.tsx`. This layout renders `GridRuntime`, a client wrapper that owns sidebar, breadcrumb, shared DnD boundary, and add-flow orchestration. Page components are thin grid-content renderers — they do not manage shell chrome.

**No auth.** All routes are public. No middleware for route protection. No login/callback routes.

**Bit detail popup:** Not a route. Triggered by `?bit=[bitId]` query parameter on any grid or calendar page. The popup component reads the query param and renders accordingly.

**Search overlay:** Not a route. Triggered by sidebar Search button or keyboard shortcut. Rendered as a portal overlay on any page.

**Edit mode:** Not a route. Toggled via sidebar Pencil button or keyboard shortcut. Visual overlay on the current grid page.

**System Node surfaces:** Not new routes. The Inbox and Archive View system Nodes use `/grid/[nodeId]`; `GridRuntime` dispatches on `systemRole` to render the Triage workspace or Archive View surface instead of the standard grid.

**Quick Capture entry surface & Command Palette:** Not routes. The `+` entry surface is an anchored popover from the sidebar `+` button; `Cmd+K` opens the Command Palette (key `1` = Scratch capture, key `2` = existing Search overlay). Both are modals/overlays on the current page, as is the Scratch capture modal.

---

## File Organization Conventions

| Category | Location Pattern | Example |
|----------|-----------------|---------|
| Pages | `src/app/{route}/page.tsx` | `src/app/(grid)/grid/[nodeId]/page.tsx` |
| Layouts | `src/app/{route}/layout.tsx` | `src/app/layout.tsx` |
| Page Components | `src/app/{route}/_components/{name}.tsx` | `src/app/trash/_components/trash-group.tsx` |
| Shared Components (by domain) | `src/components/{domain}/{name}.tsx` | `src/components/grid/node-card.tsx` |
| UI Primitives (shadcn) | `src/components/ui/{name}.tsx` | `src/components/ui/button.tsx` |
| Hooks | `src/hooks/use-{name}.ts` | `src/hooks/use-grid-data.ts` |
| DataStore Interface | `src/lib/db/datastore.ts` | — |
| DataStore Implementation | `src/lib/db/indexeddb.ts` | — |
| Validation Schemas | `src/lib/db/schema.ts` | — |
| Pure Utilities | `src/lib/utils/{name}.ts` | `src/lib/utils/bfs.ts` |
| Constants | `src/lib/constants.ts` | — |
| Animation Variants | `src/lib/animations/{domain}.ts` | `src/lib/animations/grid.ts` |
| Types | `src/types/{domain}.ts` | `src/types/index.ts` |
| Zustand Stores | `src/stores/{name}-store.ts` | `src/stores/edit-mode-store.ts`, `src/stores/color-theme-store.ts` |
| Providers | `src/app/providers.tsx` | — |

**Component location rule:** Used by one page only → co-locate under `_components/` in that route folder. Used by 2+ pages → `src/components/{domain}/`.

**Shared component domains:**

| Domain | Contents | Used by |
|--------|----------|---------|
| `grid/` | `grid-view.tsx`, `grid-cell.tsx`, `node-card.tsx`, `bit-card.tsx`, `edit-mode-overlay.tsx`, `onboarding-hints.tsx` | Grid pages |
| `bit-detail/` | `bit-detail-popup.tsx`, `chunk-pool.tsx`, `chunk-item.tsx` | Grid + Calendar (popup opens from both) |
| `calendar/` | `calendar-view-header.tsx`, `node-pool.tsx`, `items-pool.tsx`, `day-column.tsx`, `compact-bit-item.tsx` | Both calendar views |
| `layout/` | `sidebar.tsx`, `breadcrumbs.tsx`, `search-overlay.tsx`, `theme-toggle.tsx`, `color-theme-toggle.tsx`, `color-theme-provider.tsx` | All pages |
| `trash/` | `trash-list.tsx`, `trash-group.tsx` | Trash page only (but may move to shared if trash preview is added elsewhere) |
| `quick-capture/` | `entry-surface.tsx`, `scratch-modal.tsx`, `command-palette.tsx` | Quick Capture `+` surface + Cmd+K palette (Batch 1) |
| `triage/` | `triage-workspace.tsx`, `scratch-pool.tsx`, `breakdown-panel.tsx`, `staging-zone.tsx`, `hierarchy-explorer.tsx` | Inbox/Triage workspace, system node `inbox` (Batch 1) |
| `archive/` | `archive-view.tsx`, `archive-group.tsx` | Archive View surface, system node `archive_view` (Batch 1) |

---

## Page Layouts

### Route: `/` (Level 0 Grid)

- **Structure:** Full-width 18x9 grid occupying the main content area. Fixed icon-rail sidebar (always visible, `w-12`). Breadcrumb shows "Home" root-only state.
- **Content:** Nodes only. No Bits at Level 0.
- **Sidebar:** Permanent narrow icon rail, always visible, identical across all levels. Icons: + (add), Pencil (edit toggle), Search, Calendar (top); Trash, dark/light Theme toggle, Color Theme toggle (bottom). No fold/unfold mechanism.
- **Onboarding:** On first visit (no Nodes exist), show ghost placeholder Nodes with dashed outlines and hint labels ("Try: Work, Personal, Hobbies"). Disappear after first Node creation.
- **Interactions:** Click Node → navigate to `/grid/[nodeId]`. Dark/light Theme toggle, Color Theme toggle, search overlay, edit mode. DnD enabled (repositioning works outside edit mode).
- **Visual:** Level 0 background color (`--grid-bg-l0`). Standard grid line density. No depth effects at Level 0.

### Route: `/grid/[nodeId]` (Level 1-3 Grid)

- **Structure:** 18x9 grid with breadcrumb bar at top. Fixed icon-rail sidebar (same as Level 0, no remount on navigation).
- **Level 1-2 content:** Nodes (left zone, ~5-6 columns) + Bits (right zone, ~6-7 columns). 2-way split is a soft guide — items can be placed anywhere.
- **Level 3 content:** Bits only, full-width grid. No Node creation allowed.
- **Onboarding (Level 1, first visit):** Ghost hints for 2-way split ("Nodes here" on left, "Bits here" on right). Disappear after first item creation.
- **Sidebar:** Trash icon visible on all levels. "+" context-aware: Level 1-2 shows Node/Bit chooser, Level 3 creates Bit directly.
- **Depth visual effects:**
  - Grid line density increases with level (thinner, denser lines).
  - Background color changes per level (`--grid-bg-l1` through `--grid-bg-l3`) — progressively cooler/darker.
- **DnD:** Grid repositioning and drag-to-child enabled outside edit mode. Breadcrumb drops remain edit-mode-only. Drag onto node shows confirmation dialog. Cycle prevention blocks moving a node into its own descendant.
- **Bit detail:** Click a Bit → URL updates to `?bit=[bitId]` → popup opens (see Bit Detail Popup below).
- **Edit mode:** Toggle via sidebar Pencil → jiggle animation, dashed cell outlines, "+" on empty cells (square affordance, centered), drag-to-reposition, delete buttons with confirmation dialog.

### Bit Detail Popup (Modal — not a route)

- **Trigger:** `?bit=[bitId]` query parameter. Opens from grid or calendar.
- **Structure:** Centered modal over blurred background.
  - **Header:** Editable title, icon selector, deadline picker, priority toggle (high/mid/low cycle).
  - **Description:** Editable text area.
  - **mtime label:** Subtle "Last updated: X days ago" text.
  - **Chunk pool:** List of unscheduled Chunks. Add/edit/delete Chunks here.
  - **Timeline:** Vertical timeline with connected dots. Drag Chunks from pool onto timeline to set order.
- **Empty state:** Timeline structure visible (vertical line, dot placeholder) + "Add a step" CTA button.
- **Timeline behavior:** Order-based by default. Chunks with `time` sort by time within the timeline; chunks without `time` follow user-defined `order`.
- **Close:** Click outside, press ESC, or browser back (removes `?bit` param).

### Route: `/calendar/weekly` (Calendar:Weekly)

- **Structure:** Two-panel layout. Left panel + right schedule area. Sidebar on left.
- **Header (Batch 2):** Weekly and Monthly share a calendar view header. Header contains title + muted subtitle, Weekly/Monthly view switch, previous/today/next navigation, and consistent focus-visible styling. Day/Year controls are not introduced unless future scope adds those views.
- **Left panel — Node Pool (top, larger section):**
  - Level 0 Nodes shown as icons only (hover for title tooltip).
  - Click a Node → drill down to show sub-Nodes (with `>` chevron) and Bits inside.
  - Back arrow (`<`) to navigate up.
  - Search input within pool.
  - Both Nodes and Bits are draggable to the schedule.
- **Left panel — Items Pool (bottom, smaller section):**
  - Merged pool of all Bits and Chunks across the project.
  - Sort: Deadline items first (sorted by priority rank, then time), no-deadline items below.
  - Scrollable with search input.
- **Right — Weekly Schedule:**
  - 7 vertical day columns (Mon–Sun), tall and scrollable.
  - "Drop items here" placeholder in empty columns.
  - Drag item from pool to day column → sets deadline to that day ("on a day").
  - **1 item in a day:** Standard Bit component.
  - **2+ items:** Compact list (colored left border, title, time on right, date badge in corner).
  - **No-time items** at the top of the day column. Timed items below, sorted earliest→latest.
  - **Overflow:** "+N more" indicator. Click → column expands vertically with vignette effect, hiding adjacent columns.
  - **Collapse expanded:** ESC key or click any area in the column except on Bits.
- **Unschedule:** Drag item back to Items Pool, or ✗ button on hover. Clears deadline.
- **Batch 2 visual contract:** Day columns consume calendar theme variables for background, border, radius, and shadow. Existing expandable-column behavior, DnD, unschedule actions, and item interactions are preserved.

### Route: `/calendar/monthly` (Calendar:Monthly)

- **Structure:** Two-panel layout. Same left panel as Weekly. Right = calendar grid. Sidebar on left.
- **Header (Batch 2):** Same shared calendar view header as Weekly. Month title and year subtitle are displayed separately.
- **Left panel:** Identical to Weekly — Node Pool (top) + Items Pool (bottom). Same drill-down, search, and drag behavior.
- **Right — Monthly Grid:**
  - Standard calendar grid: 7 columns (Mon–Sun), rows for weeks of the month.
  - Batch 2 visual target uses tight `gap-px` calendar grid lines instead of separated card gaps.
  - Weekday header uses a theme-aware header background.
  - Date cells consume calendar theme variables for background, border, radius, and shadow.
  - Today is shown as a circular date badge.
  - First-of-month labels use `MMM d` format (for example, `May 1`); other days use day number only.
  - Items appear as compact Node tiles and Bit/Chunk dots on date cells with parent color indicators.
  - Drag items from pools to date cells (same deadline-setting behavior as Weekly).
  - Click a date cell → popover showing all items scheduled for that day in a list view. Items in the popover are clickable → navigates to item's grid location.
  - Popup item controls must have visible `focus-visible` styling.

### Route: `/trash` (Trash Zone)

- **Structure:** List view with sidebar. No grid.
- **Grouped view:** A deleted Node appears as a single entry with child count indicator (e.g., "Work — 3 Nodes, 8 Bits"). Click to expand and reveal children.
- **Per-item actions:** Restore, Delete permanently.
- **Global actions:** "Empty trash" button to permanently delete all.
- **Retention label:** Each item shows "X days until permanent deletion" based on `deletedAt` + 30 days.
- **Restore behavior:** Returns to original parent grid. BFS nearest-empty-cell if original position occupied. Auto-restores parent chain if parent was also trashed.

### Search Overlay (Modal — not a route)

- **Trigger:** Sidebar Search button or keyboard shortcut.
- **Structure:** Centered overlay on blurred background. Search input at top with real-time filtering.
- **Results:** Each result shows: item name, type icon (Node/Bit/Chunk), parent path (e.g., "Work > Project A > Frontend"), deadline if present.
- **Action:** Click result → navigate to item's grid location. Search overlay closes.
- **Scope:** Vanilla text search across all active (non-trashed, non-archived) Nodes, Bits, and Chunks. Case-insensitive substring matching.

### System Node Routing (Inbox / Archive View)

Both system Nodes use `/grid/[nodeId]`. `GridRuntime` reads the Node's `systemRole` and dispatches:

| `systemRole` | Renders |
|--------------|---------|
| `null` | Standard grid view |
| `'inbox'` | Triage workspace (below) |
| `'archive_view'` | Archive View surface (below) |

System Nodes always appear in the sidebar (queried by `systemRole !== null`) regardless of `hiddenFromGrid`. They cannot be archived or trashed; "remove from grid" sets `hiddenFromGrid = true` (retains `x/y`; "Show on Grid" reverses it, BFS-placing if the original cell is occupied).

### Quick Capture `+` Entry Surface (Modal — not a route)

- **Trigger:** Sidebar `+` button. Anchored popover that slides/fades in next to the `+` (not a centered modal). Visual realization: `docs/recipes/quick-capture-entry-surface-visual-recipe.md`.
- **Structure:** Two intent groups — **Ideas** (Scratch) and **Create** (Node, Bit). Scratch is the primary action by position. The surface may show an optional surface-level `Cmd+K` palette hint; the Scratch row itself carries no per-row shortcut.
- **Scratch:** Opens a centered one-line capture modal ("Capture your ideas..."). Captured Scratch is a Bit parented to the Inbox Node (icon `"sparkles"`, `x=0,y=0` sentinel); routed to Inbox regardless of current location; no parent/cell selection in fast capture.
- **Create (Node/Bit):** Open the **existing** create dialogs (`create-node-dialog.tsx` / `create-bit-dialog.tsx`; create-modal redesign is out of scope). Context rules: L0/global `Bit` opens a parent selector (no direct L0 Bit); inside a Node, `Bit` uses the current Node; Level 3 is Bit-only.

### Command Palette (Cmd+K) (Modal — not a route)

- **Trigger:** `Cmd+K`. Visual/interaction realization: `docs/recipes/command-palette-visual-recipe.md`.
- **Commands (fixed):** key `1` = Scratch capture; key `2` = open the existing Search overlay. No Search redesign — the palette's prompt input is visual-shell only, not an app-wide search/filter.

### Inbox / Triage Workspace (rendered for `systemRole: 'inbox'`)

A processing workspace that turns Scratch into Node/Bit hierarchy. Four internal areas. The labels in this diagram are documentation labels, not visible UI headings:

```text
[ Scratch Pool ] [ Main Work Area                          ]
                 [ Breakdown/Scribble ] [ Node/Bit Staging ]
                 [ Hierarchy Explorer (Home–L3)            ]
```

- **Layout ratios:** Main Work Area vertical Top 60% / Bottom 40%; top horizontal Breakdown 60% / Staging 40%; Staging internal Node Zone 35% / Bit Zone 65% (Node Zone renders a two-column grid of icon-centered Node candidates; Bit Zone a vertical list of text rows).
- **Visible labels:** Final Inbox UI does not show developer section headings such as `Scratch Pool`, `Breakdown / Scribble`, `Node Staging`, `Bit Staging`, or `Hierarchy Explorer`. These names may remain in component names, tests, internal docs, `aria-label`s, or visually hidden labels. `Home`, `L1`, `L2`, and `L3` may remain only as subtle navigation/depth context.
- **Scratch Pool:** Full-height list of active Scratch Bits, ordered **newest-first by `createdAt`** by default. Each row shows the title and a relative-time `createdAt` label (`2h ago` / `yesterday` / `2 days ago` / `6 days ago` / `m/dd/yy`); long titles ellipsize. Expanded mode shows inbox identity, exact count, fold/unfold control, title search, and an icon-only asc/desc sort toggle. Search filters Scratch titles only. Sort target is Scratch `createdAt` with newest-first and oldest-first modes. Collapsed mode shows compact inbox identity, count badge, fold/unfold control, and compact Scratch switching with **short vertical pills**: each pill represents one active Scratch, the selected Scratch pill is longer and higher-contrast, inactive pills are shorter and muted, pills have no visible text, and accessible labels/tooltips expose Scratch titles. Collapsed mode has no search and no sort control. **Auto-collapse trigger:** selecting a Scratch does **not** collapse the pool; focus or click into the Breakdown area alone does **not** collapse it either. The pool auto-collapses when the user types the **first keystroke** in the Breakdown section while a Scratch is selected. A manually re-expanded pool is respected for the current Scratch editing session and does not auto-collapse again until the selected Scratch changes. (This is the one deliberate Phase 19 behavior change in Batch 2 — see Architecture Decision 18 — restoring original Inbox/Triage intent per `ISSUE-18-17`.) Inbox badge: 0 hidden / 1–7 neutral / 8–14 warm / 15+ high-pressure (exact count; thresholds in `constants.ts`; semantic tokens — no hard-coded HSL).
- **Breakdown:** The selected Scratch is the visible context and must be clear at a glance. It renders at the **top-left of the Breakdown section** as a compact context strip: a small Scratch/Inbox-family icon, the selected Scratch title, and optional relative-time/meta in a single line. The strip is visually distinct from the Breakdown rows below it through surface tone, border or left accent, smaller type scale, and spacing/separation; it must not look draggable, row-like, or share row hover/drag affordances. Long Scratch titles truncate/ellipsize. Always-active input row; rows persist in the `scratchBreakdowns` store (not Chunks). Dragging a row into Staging creates a UI candidate and de-emphasizes the source row — `consumedAt` is **not** set yet. Drag activation remains grip-only; full-row dragging is rejected. Batch 2 improves grip visibility and hit area without making the entire row appear draggable. After submitting a breakdown row with Enter, focus remains in the add-note input for rapid `type → Enter → type` entry (`ISSUE-18-18`); global commands such as `Cmd+K` still move focus to the command menu.
- **Node/Bit Staging:** UI state only, scoped to the selected Scratch (candidates never mix across Scratches; switching Scratch loses no persisted data because rows stay unconsumed). Node and Bit candidates remain visually distinct **by shape, not color alone**: `Node = icon-centered object`, `Bit = text-centered row/card` (restored from the `2026-04-28-inbox-triage-workspace` decision; consistent with the Layout-ratios line above — Node Zone two-column icon grid, Bit Zone vertical text list). This shape distinction must be conveyed without the removed developer section labels. No inline edit (remove → edit the Breakdown row → re-stage).
- **Hierarchy Explorer:** Home / L1 / L2 / L3 columns (progressive reveal; Nodes before Bits). Batch 2 removes the unnecessary gap between the hierarchy shell and the Home/L1/L2/L3 columns. A search input filters only the active hierarchy section (the deepest currently opened section). If only Home/Grid0 is open, search filters Home/Grid0 Nodes/Bits; if Level 2 is active, it filters Level 2 Nodes/Bits. Search query persists when the active section changes. A **persistent filter indicator is primary**: show the active query, the scoped section, the result count, and a clear affordance. A flash/highlight on the search input is a **secondary** cue when the active section changes with a non-empty query. This is not global app search.
- **Placement confirmation:** Dropping a staged candidate — or a Breakdown row via the fast path — is a **pending-confirmation** target: it opens the placement confirmation dialog (reuses the existing GridDO move-confirmation `Dialog`) showing source content, candidate type, destination hierarchy path, and result summary. Confirm creates the real Node/Bit at the target and marks the source `scratchBreakdowns` row `consumedAt`; cancel/Escape creates nothing and leaves `consumedAt` null. If the target grid is full, confirm is disabled with a reason. The fast path requires an explicit Node/Bit type choice (no default).
- **Remove from staging:** A shared `Remove from staging` drop target appears while dragging staged candidates (reuses the existing grid delete affordance; not a per-card ✗). Dropping removes only the staged candidate; the source Breakdown row returns to active display and `consumedAt` stays null. Non-destructive (no toast).
- **Archive Scratch (narrow exception):** When all Breakdown rows are placed/consumed and no staged candidates remain, the user may be offered an explicit Archive Scratch affordance (requires confirmation). Confirm sets `archivedAt` on the Scratch Bit; decline leaves it active in Inbox. Never hard-deleted via this path.
- **DnD states:** compact drag token + pending-confirmation targets (Decision 16). Invalid hierarchy/staging drop states use muted/unavailable visual language, not destructive-red treatment.

### Archive View Surface (rendered for `systemRole: 'archive_view'`)

A **portal, not a container** — archived items keep their original `parentId`; the surface queries all items where `archivedAt` is set (it does not read its own children).

- **Grouping:** by original parent Node (archived L0 Nodes form their own top-level group). **Sort:** `archivedAt` descending within each group. **Search:** filters by title.
- **Restore:** single-item (↩) clears `archivedAt`; BFS auto-placement if the original cell is occupied; restoring a Bit whose parent is archived restores the parent chain (±5s window, Hook 11). Bulk restore is not in v1.
- **Tone:** warm/dignified (distinct from Trash's destructive tone); completed items show ✓.
- **Visual:** existing GridDO baseline UI/tokens in Batch 1 (no dedicated Archive View theme source; future global theme system may affect it via global tokens).

### Direct Archive (context menu)

Any non-system Node or Bit can be archived from its context menu (no Review Mode required) — sets `archivedAt` with cascade (Hook 10). System Nodes are excluded. **Completion does not auto-archive**; completed-but-unarchived items remain in place on the grid until the user archives them.

---

## Responsive Breakpoints

> GridDO is **web-first, desktop-focused** for v1. Responsive design is deferred (see PRD Section 26). Tailwind default breakpoints are configured but not actively designed for. Minimum supported width: 1024px.

| Token | Width | Behavior |
|-------|-------|----------|
| `sm` | 640px | Not targeted for v1 |
| `md` | 768px | Not targeted for v1 |
| `lg` | 1024px | Minimum supported width. Full grid visible. Sidebar open by default |
| `xl` | 1280px | Comfortable grid spacing. Default development target |
| `2xl` | 1536px | Extra grid spacing, larger day columns in Calendar |

---

## Key File Paths

Infrastructure files that don't follow the File Organization Conventions above.

| Path | Purpose |
|------|---------|
| `src/app/globals.css` | CSS custom properties, Tailwind v4 `@theme` bridge, dark mode variant — single source of truth for all design tokens |
| `src/app/layout.tsx` | Root layout — font variables, color-theme no-flash init script, ThemeProvider/DataStore provider shell |
| `src/app/(grid)/layout.tsx` | Route-group layout — renders GridRuntime for all grid pages |
| `src/app/providers.tsx` | Client-side providers wrapper — ThemeProvider, ColorThemeProvider, DataStoreProvider. Zustand stores require no provider. |
| `src/components/layout/grid-runtime.tsx` | Client wrapper: route state, sidebar, breadcrumb, shared DnD boundary, add-flow orchestration |
| `src/components/layout/add-flow-context.tsx` | Minimal React context — pages call `useAddFlow().openAddAtCell(x, y)` to trigger add-flow |
| `src/components/layout/color-theme-provider.tsx` | Applies the persisted color theme to `<html data-color-theme="...">` |
| `src/components/layout/color-theme-toggle.tsx` | Color theme picker — 8 visual themes, swatches, selected check |
| `src/components/calendar/calendar-view-header.tsx` | Shared Calendar weekly/monthly header — title/subtitle, view switch, previous/today/next controls |
| `src/lib/db/datastore.ts` | `DataStore` interface — the abstraction boundary between app code and storage |
| `src/lib/db/indexeddb.ts` | Dexie.js IndexedDB implementation of `DataStore` — v1 storage backend |
| `src/lib/db/schema.ts` | Zod validation schemas and TypeScript types (from SCHEMA.md) |
| `src/lib/constants.ts` | Grid dimensions (18×9), aging thresholds (5/11 days), urgency thresholds (3/2/1 days), trash retention (30 days) |
| `src/lib/utils/bfs.ts` | BFS auto-placement algorithm — finds nearest empty cell from a starting position |
| `src/lib/utils/aging.ts` | Aging state computation — Fresh/Stagnant/Neglected from mtime |
| `src/lib/utils/urgency.ts` | Deadline urgency level computation — Level 1/2/3/Past from deadline |
| `src/lib/utils/completion.ts` | Node completion check — are all child Bits complete? |
| `src/lib/utils/color.ts` | Shared `hexToHsl` utility (extracted from shell components) |
| `src/stores/edit-mode-store.ts` | Edit mode toggle, jiggle state |
| `src/stores/search-store.ts` | Search query, open/closed state |
| `src/stores/calendar-store.ts` | Calendar drill-down navigation, pool state |
| `src/stores/color-theme-store.ts` | Color theme id, validation, and persistence (`griddo-color-theme`) |
| `src/lib/animations/grid.ts` | Grid animation variants — jiggle, sinking, creation/deletion, depth transitions |
| `src/lib/animations/calendar.ts` | Calendar animation variants — vignette expand, magnet snap |
| `src/lib/grid-dnd.ts` | Grid DnD utilities — `gridCollisionDetection` (prioritizes node-drop over cell) |
| `src/lib/constants/color-palette.ts` | Curated 10-color palette for node creation randomization |
| `src/hooks/use-grid-data.ts` | Reactive hook — subscribes to Nodes + Bits for a given parentId via `useLiveQuery` |
| `src/hooks/use-bit-detail.ts` | Bit detail popup state — reads `?bit` param, fetches Bit + Chunks |
| `src/hooks/use-search.ts` | Search state — query string, filtered results across all stores |
| `src/hooks/use-calendar-data.ts` | Calendar data — all items with deadlines, pool items, drill-down state |
| `src/hooks/use-dnd.ts` | Drag-and-drop coordination — grid moves, calendar scheduling, timeline reorder, drag-to-child confirmation |
| `components.json` | shadcn/ui configuration — component output path, Tailwind CSS variables, icon library |
| `tsconfig.json` | TypeScript config — `@` path alias mapping to `src/` |

---

## Phase 9 PRD Departures

Intentional departures from the PRD introduced in Phase 9. Each is a deliberate design decision, not an omission.

| # | PRD Rule | Phase 9 Change | Reason |
|---|----------|----------------|--------|
| 1 | Sidebar is foldable; when folded, no icon strip (Section 16) | Permanent narrow icon rail (`w-12`), always visible, no fold/unfold | Reduces cognitive overhead; all functions always one click away |
| 2 | Drag-to-reposition and drag-onto-Node are edit-mode-only (Sections 17, 20) | Grid DnD enabled outside edit mode; breadcrumb drops remain edit-mode-only | Repositioning is a frequent action; gating behind edit mode adds friction |
| 3 | Deeper levels apply vignette effect (Section 5) | Vignette removed; background color changes per level instead (`--grid-bg-l0` through `--grid-bg-l3`) | Background color is a stronger, more immediate depth signal |
| 4 | Trash icon available on Level 0 only (Section 19) | Trash icon visible on all levels | Sidebar is identical across all levels for consistency |
