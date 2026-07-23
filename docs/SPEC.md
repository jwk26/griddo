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

9. **Zustand for client-only state** — GridDO has complex presentation state (edit mode, sidebar state, drag intent, calendar drill-down, search mode, inline drafts, and page-session placement metadata). Zustand stores in `src/stores/` own only state that can be discarded or reconstructed. Persistent domain state remains behind the DataStore/reactive-hook boundary. In particular, Inbox/Triage staged candidates are durable Dexie records, not a second candidate truth in `triage-store`; the store may project selection, pending presentation, interrupted search, and Newly Placed provenance but never duplicate persisted candidate lifecycle.

10. **next-themes for dark/light theming** — Dark/Light mode via `next-themes` provider in root layout. Theme token switching is handled through CSS custom properties in `globals.css`, referenced by Tailwind classes. No conditional class logic in components.

11. **Local-first feedback with authoritative mutation completion** — Ordinary local mutations may still reflect quickly through IndexedDB and reactive hooks, but the UI must not infer success from low latency. Inbox/Triage Add/Edit/Delete, Stage/Unstage, Placement, Undo, and Archive commands use stable operation metadata, explicit pending/reconciling states, and authoritative postcondition reads. Source or result surfaces change only after the owning transaction is confirmed; failures preserve drafts and domain records and expose recovery instead of relying on optimistic removal or partial rollback.

12. **@dnd-kit for all drag interactions** — Unified drag-and-drop across: grid cell repositioning, drag-into-Node (move with confirmation), calendar pool-to-day scheduling, Chunk timeline reordering, and drag-to-breadcrumb (edit-mode-only). Grid repositioning and drag-to-child are always enabled; breadcrumb drops require edit mode. Custom collision detection (`gridCollisionDetection`) prioritizes node-drop targets over cell targets. Single library, consistent interaction model.

13. **Motion for all animations** — The PRD specifies jiggle mode, sinking effects, floating animation, vignette transitions, magnet snap, and task-tossing. Motion (Framer Motion) handles all of these declaratively. CSS-only would be insufficient for the interaction-driven animations GridDO requires. Animation variants defined per domain in `src/lib/animations/`.

14. **Pure utility functions for algorithms** — BFS auto-placement, aging state computation, urgency level computation, and Node completion check are pure functions in `src/lib/utils/`. No side effects, independently testable.

15. **System Nodes (lifecycle)** — Two system Nodes (`systemRole: 'inbox' | 'archive_view'`) are seeded at first launch / migration (defaults in SCHEMA.md § Default System Nodes). They use the standard `/grid/[nodeId]` URL but render role-specific surfaces (Inbox → Triage workspace; Archive View → Archive View surface) — **no new routes**. System Nodes cannot be archived or trashed; they are removed from the L0 grid via `hiddenFromGrid` (not trash) and always appear in the sidebar regardless. `systemRole` is immutable; non-null uniqueness is enforced at the application level. Archive is a manual lifecycle action (`archivedAt`, Hooks 10/11); completion never auto-archives.

16. **Compact-token pointer DnD + pending-confirmation targets (Inbox/Triage)** — Extends Decision 12. Breakdown rows remain grip-activated; staged Node/Bit candidates use the entire candidate card as the activator. Both render the shared pointer-centered `TriageDragToken`, not a native row/card snapshot. Mouse and Touch use the established sensor constraints. Placement entry is pointer DnD only in this promotion: no keyboard drag mode or parallel `Place in Grid` command is added. Drop targets distinguish valid, invalid, and **pending-confirmation** states; no domain write occurs before Confirm. This remains a local adoption of the broader Grid DnD direction (`2026-06-02-grid-dnd-preview-and-drop-targeting`, not promoted in full); existing main-grid, Calendar, and pool DnD are unchanged.

17. **Color theme axis (Batch 2)** — Color theme is a second visual axis layered on top of `next-themes` dark/light mode. Dark/light remains class-based (`.dark`); color theme is stored separately and applied to `<html data-color-theme="...">`. The canonical theme set is `griddo`, `tiny-desk`, `neumorphism`, `claymorphism`, `origami`, `terminal`, `retro-mac`, and `graphite`. Components consume semantic CSS variables and theme surface classes; they must not branch on theme id except in the theme picker. Prototype files are visual/function references only — implementation patches the current app and preserves current behavior.

18. **Inbox/Triage 2-3 promotion supersedes the earlier Batch 2 surface assumptions** — System Node routing, Archive View behavior, direct archive, and unrelated Grid/Calendar behavior remain intact. Within Inbox/Triage, the current promotion deliberately replaces the earlier visible-label removal, compact Selected Scratch Context, active-column search, UI-only Staging, consumed-row line-through, and global archive-dialog assumptions. The resulting surface restores visible theme-specific section chrome, keeps the first-printable-key Scratch Pool collapse trigger, uses durable candidates and whole-hierarchy Explorer search, and scopes completion/archive to Breakdown. Exact 8-theme realization comes from the surface-first Inbox/Triage visual recipes, while accessibility and production behavior in this SPEC remain authoritative.

19. **Optimistic concurrency result contract (Inbox/Triage)** — Scratch-title, Breakdown-row, and staged-candidate mutations use the monotonic revisions and conditional-write predicates defined in SCHEMA.md. Editors capture a page-memory base snapshot and resolve text conflicts inline; `mtime` is not a concurrency token. Repository commands return one shared result family (`applied`, `already_applied`, `conflict`, `invalid`, `not_found`) and reconcile unknown transport outcomes before the UI commits a result. General Node-title editing does not gain CAS in this promotion; placement result creation is idempotent through preallocated IDs, and created Bits enter the shared Bit revision contract.

20. **Durable candidate repository and atomic Triage commands** — Staged Node/Bit candidates are source-linked domain records with one candidate allowed per Breakdown row. Stage, Unstage, staged/direct Placement, source-aware Undo, and Archive are repository-owned transactions; components never compose their writes sequentially. The v1 DataStore implements the contract with Dexie read-write transactions and preallocated stable IDs. A future BaaS keeps the same command and postcondition semantics through server transactions/functions and idempotency keys.

21. **Dedicated Grid Explorer search** — Inbox/Triage search is a mode inside Grid Explorer that traverses the reachable active hierarchy, returns ancestor ID chains and full breadcrumbs, and owns result relevance, reveal, DnD interruption, and stale-result handling. It does not reuse the global `searchAll()` result shape or mutate the normal Grid route. The exact result-screen visual realization is a Decision prerequisite for its implementation phase; this SPEC fixes behavior and information requirements only.

22. **Inbox page-session placement projection** — Confirmed placement creates ordinary Node/Bit records. Newly Placed styling, temporary list pinning, source-aware Undo metadata, and rollback eligibility are page-session projections keyed by operation/result IDs; they are never permanent fields on Node, Bit, Breakdown, or candidate records. Scratch, Grid-column, theme, and locale changes preserve the projection. Leaving or reloading Inbox/Triage ends it without removing the created records.

23. **Shared production ownership and copy boundary** — The eight theme prototypes are realization evidence, not implementation modules. Production uses one `triage/` component domain, shared hooks, DataStore commands, semantic state, theme tokens, and surface recipes; no theme-specific routes or duplicated handlers are introduced. New English Inbox/Triage labels, status, validation, error, and accessibility strings live behind an Inbox-owned copy module so later EN/KR resources can replace the source without rewriting feature components.

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
| Domain Query/Command Helpers | `src/lib/{domain}/{name}.ts` | `src/lib/triage/grid-explorer-search.ts` |
| Feature Copy Modules | `src/lib/copy/{domain}.ts` | `src/lib/copy/inbox-triage.ts` |
| Pure Utilities | `src/lib/utils/{name}.ts` | `src/lib/utils/bfs.ts` |
| Constants | `src/lib/constants.ts` | — |
| Animation Variants | `src/lib/animations/{domain}.ts` | `src/lib/animations/grid.ts` |
| Types | `src/types/{domain}.ts` | `src/types/index.ts` |
| Zustand Stores | `src/stores/{name}-store.ts` | `src/stores/edit-mode-store.ts`, `src/stores/color-theme-store.ts` |
| Providers | `src/app/providers.tsx` | — |
| Unit / Component Tests | co-located `*.test.ts` / `*.test.tsx` | `src/components/triage/triage-workspace.test.tsx` |
| Browser / E2E Tests | `tests/e2e/{flow}.spec.ts` | `tests/e2e/inbox-triage-workspace.spec.ts` |

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
| `triage/` | Workspace shell, Scratch Pool, Selected Scratch Context, Breakdown, Staging, Grid Explorer/search, Placement, Newly Placed/Undo, and Archive-completion surfaces | Inbox/Triage workspace, system node `inbox` |
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

A production workspace that turns Scratch Bits into placed Nodes and Bits. It has four persistent
areas and one shared behavior contract across all eight color themes:

```text
[ Scratch Pool ] [ Breakdown ] [ Staging       ]
                 [ Grid Explorer (Home–Level 3) ]
```

#### Workspace Structure And Section Identity

- Preserve the established ratios: main work area top/bottom `60/40`, top Breakdown/Staging
  `60/40`, and Staging Node/Bit `35/65`.
- `Scratch Pool`, `Breakdown`, `Staging`, and the Grid section all have visible theme-specific
  labels/header chrome. The default Grid label is `Grid Explorer`; Tiny Desk uses `Library Index`,
  Retro Mac uses `Finder`, and Terminal uses `GRID EXPLORER`. Their accessible name remains
  `Grid Explorer`.
- Column labels are `Home`, `Level 1`, `Level 2`, and `Level 3`. User-facing `L1`, `L2`, `L3`,
  `Home-L3`, and similar abbreviations are removed.
- Wheel, trackpad, touch, and keyboard scrolling remain available, but visible scrollbar chrome is
  hidden in the Scratch list, Breakdown list, Staging Node and Bit subsections, and every Grid
  column.
- Selected, staged, pending, invalid, Newly Placed, and completed are separate semantic states.
  Each theme realizes them through its own existing surface language; one generic opacity/color
  treatment must not collapse their meaning. Repeated blink, pulse, and flicker are not status
  requirements.
- Theme or locale switching changes presentation only. It preserves selection, Pool state/search,
  drafts, Grid path/search/reveal, open affordances, pending operation IDs, Newly Placed markers,
  Undo, and Archive eligibility. It does not cause save, cancel, navigation, or duplicate mutation.
- Exact realization is defined by `docs/recipes/inbox-triage-visual-recipe-index.md` and its surface
  recipes. Prototype numbering switchers, fold-lock/test controls, and duplicated theme routes are
  not product UI. Reusable semantic state and theme styling remain governed by DESIGN_TOKENS.md.

#### Scratch Selection

- On same-app-session route re-entry, restore the last selected Scratch if it is still active.
  Otherwise select the first active Scratch in the current Pool sort order. A reload or new app
  session starts from that fallback; selection is not persisted to domain data or `localStorage`.
- If there are no active Scratches, keep selection `null` and show the Inbox empty state. Automatic
  selection changes data context but does not steal keyboard focus.
- Scratch switching does not reset the shared Grid path, Grid search, column scroll, Newly Placed
  state, or eligible Undo. Operation-specific navigation locks still take precedence.
- If the selected Scratch is externally archived or deleted, stop editing it and show a
  non-dismissible lifecycle modal with a five-second auto-move countdown, `Move now`, and
  pause/resume controls. Recompute the next-visible/previous-visible destination against the latest
  Pool filter and order before moving.
- When unsaved Add/Edit drafts exist, open that countdown paused and provide per-draft full-text copy
  controls before discarding page memory. Restoring the same archived Scratch before navigation
  cancels the modal and preserves surviving drafts; a hard-deleted record is never inferred back
  into existence.

#### Scratch Pool

- Expanded Pool has two regions: one cohesive tools region and the Scratch list. Identity/icon,
  exact active count, collapse control, search, and sort belong to tools; search and sort share a
  row. The header count always represents all active Scratches, while an active search reports its
  filtered count separately.
- The list shows active Scratch title and `createdAt` metadata. Search matches title only. Sort uses
  `createdAt` and exposes its state: DESC/newest-first by default or ASC/oldest-first. Sort is a
  device-local preference shared across Scratches, not server/domain data.
- Collapsed Pool stacks identity/count, expand control, and Scratch switchers vertically. It omits
  search and sort; all active Scratches remain available even when an expanded-mode query is
  preserved. Every icon-only switcher has an accessible Scratch name and the selected item is
  visibly distinct.
- Selecting a Scratch or focusing Breakdown does not collapse the Pool. The first printable key in
  Breakdown collapses it. Manual re-expansion suppresses repeat auto-collapse for that Scratch until
  selection changes.
- Expanded/collapsed state, suppression, query, result context, and list scroll survive route
  re-entry in the same app session, but reset on reload/new session. Collapse does not end search;
  re-expansion recomputes the same query against current data without moving focus from the expand
  control.
- Inbox count pressure remains exact and semantic: `0` hidden, `1–7` neutral, `8–14` warm, `15+`
  high-pressure.

#### Selected Scratch Context And Breakdown Rows

- Selected Scratch Context is a signature section between the Breakdown header and row list, not
  header metadata or another draggable row. Its target height is about `2–2.5` normal rows. It
  always exposes Scratch title, creation date/time, an always-visible Scratch-title Edit control,
  and Breakdown ASC/DESC sort.
- Row sort uses `createdAt` (DESC/newest-first by default), then `order`, then stable `id`. It is a
  device-local preference independent of Scratch Pool sort. Row UI does not show numbering or
  date/time.
- Active rows keep grip-only drag activation. Edit and Trash are always visible and do not depend on
  hover. The whole row must not become a drag activator.
- The Add input has explicit Add and Enter submission. Blur neither submits nor clears it. A
  successful Add clears the input, retains focus, scrolls only the row list to the insertion edge
  selected by sort, announces success with polite live status, and applies one short theme-specific
  signal with a reduced-motion static equivalent.
- Add snapshots one draft into one idempotent command and locks duplicate submit while pending.
  Failure/offline preserves text and focus with Retry; an unknown outcome keeps the input in
  reconciling state until the stable row ID/postcondition proves success or non-execution. It never
  displays an optimistic row or queues multiple drafts.
- Add draft is page memory. It may coexist with one inline editor and survives same-Scratch work and
  theme/locale changes. Scratch switch or route exit requires `Continue writing` versus `Discard and
  move`; reload/tab close uses the native unload guard. Add never auto-submits on navigation.
- A Scratch with no historical consumed row shows an idea-entry prompt when its active list is empty.
  A Scratch whose rows are all consumed follows the completion flow. Deleting all rows without
  consumed evidence returns to the entry prompt, not completion.

#### Inline Editing And Concurrent Conflict

- Context Edit changes only Scratch title. Row Edit changes only that row's content. Both transform
  their existing surface into an inline editor; Save commits, Cancel/Escape restores, valid blur
  saves, unchanged values close without a write, and an empty value keeps validation/editor open.
- Saving keeps the editor and draft visible, locks conflicting controls, and closes only after an
  authoritative success. Failure/offline preserves the draft and focus. Unknown results enter
  reconciliation before Retry is offered.
- Scratch switch, another Edit, Trash, Archive, Undo, or internal route navigation requested during
  dirty edit becomes one save-before-action pending intent. Save/conflict resolution must complete
  before it runs; additional intents are not queued. Theme/locale toggle is the explicit exception:
  it preserves the dirty editor without triggering blur save.
- Scratch title and row content use optimistic concurrency from SCHEMA.md. An editor captures
  `{id, editable value, version, lifecycle}` in page memory and conditionally writes against it.
  Text conflict remains inline with latest-value preview, `Use my edit`, and `Use latest`; it never
  becomes a global modal or last-write-wins overwrite.
- External stage/consume/delete/archive is lifecycle invalidation, not text conflict. Save is blocked,
  the local draft remains available to inspect/copy, and focus moves to the next valid source only
  when the invalid editor closes.

#### Breakdown Lifecycle And Delete Reliability

| State | Presentation and actions |
|-------|--------------------------|
| Active | Normal row; Edit, Trash, and grip drag enabled |
| Deleting/reconciling | Same row and position with visible pending state; actions and DnD locked |
| Staged | Row remains in the list with theme-specific de-emphasis; Edit/Trash disabled; no strike-through |
| Consumed | Removed from the active list but retained as persisted archive evidence |
| Deleted | Absent and not completion evidence |

- Staging alone never sets `consumedAt`. Unstage or Undo restores the original row, `createdAt`, and
  sort position and uses the same one-time signal as Add.
- Delete is idempotent and non-optimistic: retain the row until success is known. Failure restores
  Active state without a dedicated Retry button; an unknown result provides `Check again` while
  retaining the navigation/unload guard. Successful deletion moves focus by visible sort order and
  then recalculates empty/completion state.

#### Staging

- Visible `Staging`, `Nodes`, and `Bits` chrome remains. Node candidates use grid/object cards; Bit
  candidates use list rows. Shape and information structure, not color alone, distinguish them.
- Candidates are durable, Scratch-scoped records joined to authoritative source Breakdown rows.
  One source row may own at most one candidate. A candidate stores no duplicate label; a missing
  source is cleaned only after authoritative confirmation and produces a section-local alert.
- Node and Bit subsections sort newest-first by candidate `createdAt`, use stable `id` tie-breaks,
  scroll independently without visible bars, and do not resize the 35/65 section. Their label shows
  a count only for two or more items (`2 Nodes`, `3 Bits`); remote-arrival `New items` status is a
  separate indicator.
- Candidate root surfaces are fully draggable and have no inner Grip. Any point produces the same
  shared `TriageDragToken`, pointer alignment, and sensor thresholds. Candidate click has no separate
  select/detail action, and Staging offers no manual reorder or inline edit.
- Dropping an active row into Node or Bit Staging creates one durable candidate. While pending, show
  the same candidate card grammar with a non-blinking pending treatment and lock source/candidate
  actions. Success converts it to normal staged state; failure removes only the pending projection,
  restores the active row, and shows a dismissible section-local error without auto-retry.
- A staged candidate can be returned through either the drag-only dedicated unstage overlay or a
  drop anywhere on the Breakdown section. Both invoke the same atomic command. The overlay is
  absolute and temporary, does not resize/blur Staging, and adds temporary scroll padding so its
  controls and the final candidate remain reachable.
- Unstage keeps candidate and staged source visible until commit succeeds. Failure preserves both
  and shows a dismissible, non-expiring section-local alert with no Retry button; the user retries by
  dragging again. Unknown outcomes reconcile before either surface changes.
- During staged drag, invalid Grid columns signal unavailability immediately and add a direct warning
  only when entered. Breakdown similarly signals drop-back without replacing its label or obscuring
  content. Dropping a Node on Bits or a Bit on Nodes is invalid; dropping back on the same subsection
  is a mutation-free cancel. No drag feedback blinks or auto-drops.

#### Grid Explorer Context

- The four-column hierarchy path, selected Node chain, and column scroll offsets are shared across
  Scratch selection. Same-app-session route re-entry restores the last valid path and scroll; reload
  or a new session starts at Home. Invalid external path segments collapse to the nearest valid
  ancestor without selecting a look-alike sibling.
- Node cards precede the `Bits` subsection in each column. Selected state lives on cards and path;
  selected Node titles are not duplicated under column headers.
- Remote additions preserve focus and the pre-update first-visible-card anchor rather than jumping
  scroll. Removing/moving a selected path Node falls back to the nearest valid ancestor and provides
  non-blocking status.

#### Grid Explorer Search

- Search is an internal Grid Explorer mode. Opening it replaces all four columns with one dedicated
  search body and focuses the input; an empty query shows pre-search guidance distinct from a
  no-results state. Input `X` clears without a separate Clear text button.
- Scope is every active Node and Bit reachable from visible Home roots. Chunks, system Nodes,
  hidden roots, archived/trashed items, and unreachable orphans are excluded. Whitespace tokens may
  match title or breadcrumb; every token must match.
- Relevance order is exact title, title prefix, title substring, split title/breadcrumb match, then
  breadcrumb-only, with hierarchy order as tie-break. Results are one flat list and expose type,
  title, full breadcrumb, and native icon/color. Exact duplicates use direct labels such as
  `Duplicate item 1/2`, never opaque coordinates.
- Result click/Enter clears active/interrupted query, restores columns, reconstructs the ancestor ID
  path, and selects a Node or reveals a Bit without leaving Inbox. Bit reveal has no timer and ends
  on another selection, path change, DnD, new search, or route exit.
- Starting Breakdown/candidate DnD closes search so columns can accept the drop and preserves only
  this interrupted query. Placement completion/cancel does not auto-reopen search; the user's next
  search restores it. Result selection, `X`, Escape, reload, or route exit clears it.
- Current query remains while data refreshes. Stale result selection is rejected after path
  revalidation. Search results are navigation surfaces, not drag sources; a local Newly Placed result
  may expose its existing Undo.
- The exact result-screen layout and theme realization is intentionally unresolved and must receive
  user approval in the Grid Search implementation phase. Existing Grid chrome/card grammar is
  context, not an automatic fallback design.

#### Placement Targets And Flow

- Column bodies and active Node cards are placement targets. Home accepts Nodes only; Level 3 accepts
  Bits only; intermediate targets follow hierarchy limits. Pointer release uses the currently
  hit-tested destination. Invalid or locked targets never write or silently redirect.
- Valid column edge hover auto-scrolls only that column, updates hit testing continuously, preserves
  all ordinary input scrolling, and keeps scrollbar chrome hidden. The affordance lives inside the
  column's scrollable content so its height, warning, Confirm, and Cancel remain reachable without
  expanding the column.
- A full destination still opens the ordinary affordance with source/type/path and a direct
  `No empty Grid cell` reason. Confirm is disabled; Cancel is available. The app does not choose a
  parent, sibling, or cell automatically.
- Placement entry is pointer drag only. Mouse and Touch share the compact drag token and affordances;
  this promotion adds no keyboard destination picker or action-menu shortcut.
- **Staged flow:** drop candidate -> optional Result Title editor only when the source exceeds the
  chosen type limit -> staged Placement affordance -> Confirm creates the real item, consumes the
  row, and removes the candidate. Cancel preserves the candidate and row.
- **Direct flow:** drop active row -> distinct modal-like Node/Bit type and path choice -> separate
  Placement affordance -> Confirm creates the real item and consumes the row. Direct placement has
  no title editor: `1–100` characters permits Node/Bit, `101–200` permits Bit only, and `201–1000`
  permits neither until the row is edited outside the flow. Source text is never truncated.
- Confirm-before-write is retained. The result is an actual existing Node/Bit card, never a checkbox,
  `Node: ...` indicator, or separate placed-card design.
- While a direct/staged placement flow is open, block Scratch switch, Grid path/search, new DnD,
  conflicting Undo, and internal route navigation with a direct reason. Confirm or Cancel ends the
  task; blocked intents are not queued or auto-run. Focus is contained within the current affordance
  without converting the column-scoped surface into a full-screen modal.

#### Reliability And Reconciliation

- Add/Edit/Delete, Stage/Unstage, Placement, Undo, and Archive use the operation/result contract in
  SCHEMA.md. Confirm revalidates source version/lifecycle, candidate relation, target reachability,
  type rules, and cell availability immediately before its transaction.
- Staged placement atomically creates the result, consumes the row, and removes the candidate.
  Direct placement atomically creates the result and consumes the row. No component may issue these
  as independent best-effort writes.
- Pending UI retains source and intended result context and locks only conflicting operations.
  Explicit failure leaves authoritative records unchanged and exposes contextual Retry only where
  this contract defines it. Unknown outcomes reconcile stable IDs/postconditions before allowing a
  new command or showing success.
- Pending Stage/Unstage/Delete/Placement/Undo/Archive locks Scratch switch and internal route exit as
  specified by the owning flow; unresolved reload/tab close uses native unload confirmation. Once a
  result resolves, prior navigation requests are not automatically executed.
- External invalidation during drag keeps the visual drag snapshot until release, then applies the
  latest authoritative state without executing the stale drop. Invalidation after an affordance
  opens closes or invalidates that affordance without partial writes.
- Pending, conflict, failure, reconciliation, restore, and success are visible and announced with
  suitable `aria-live` or `role="alert"` semantics without stealing focus. Success effects run once
  for `applied`, not again for `already_applied`.

#### Newly Placed And Undo

- A confirmed result uses the existing Node/Bit component, dimensions, radius, base color, and inner
  grammar. A static theme-specific marker/outline/background/corner/shadow announces Newly Placed;
  no separate card or repeated pulse is introduced. Selected and Newly Placed can coexist visibly.
- Multiple local results may be Newly Placed. In the current Inbox session, Nodes pin above normal
  Nodes and Bits pin above normal Bits in their target column, newest placement first, while stored
  Grid coordinates remain unchanged. Confirm scrolls that column to reveal the card.
- Only placement operations started and confirmed by this mounted page get the marker and Undo.
  Remote results are ordinary cards. Scratch, column, theme, and locale changes preserve local
  markers; route exit or reload clears them and returns actual records to ordinary Grid order.
- Undo is a separate control on the actual card. Staging-source Undo removes the created result and
  restores candidate plus source row; direct-source Undo removes the result and restores the active
  row. The rollback is one transaction and is never optimistic.
- Selection/search reveal does not disable Undo. Mutation of the result, archive/delete, unknown
  changes, or surviving descendants/dependencies does. The marker remains while Undo is unavailable;
  the same control stays visible with an accessible reason and can re-enable when reversible local
  child operations are undone in reverse order.
- Undo before Archive mutation withdraws completion UI and restores ordinary Breakdown/Staging.
  Archive or another placement pending state temporarily locks it. Success preserves Grid focus and
  announces the restored source without automatically scrolling/focusing another section; failure
  keeps both sides authoritative and offers Retry.

#### Completion And Archive

- Persisted archive eligibility requires an active selected Scratch, at least one consumed row, no
  unconsumed rows, and no staged candidates. An empty history, all-staged rows, or deleting every row
  without consumed evidence is not complete.
- A non-empty Add draft or dirty Scratch-title editor is a page-local completion blocker. It does not
  alter persisted eligibility, but it prevents automatic completion UI until the draft is cleared or
  the editor resolves. Completion never auto-submits or cancels text.
- On the first false-to-true eligible transition in the mounted session, blur/dim only Breakdown and
  show the Archive Scratch affordance over that section with Cancel and Archive. It is a named
  non-modal region: it does not cover the page, trap global focus, or steal existing focus. While
  the overlay is open, a separate `Show archive dialog` control is not rendered.
- Cancel/Escape removes the overlay, converts Selected Scratch Context to the theme-specific
  `Scratch complete` state, and shows `Show archive dialog` inside Breakdown. Reopen uses the same
  section-scoped overlay. A new saved row, restored row, or candidate immediately withdraws all
  completion UI.
- Switching away postpones the decision without writing a dismissal flag. Returning in the same
  session, route re-entry, or reload recomputes eligibility and shows complete Context/reopen rather
  than auto-opening the overlay. Auto-open occurs only at a new mounted-session eligibility
  transition.
- Archive Confirm revalidates eligibility and Scratch version in one idempotent transaction, keeps
  the overlay as pending/reconciling, and locks Cancel, Undo, Edit, Placement, Scratch switch, and
  internal route exit until resolved. Failure retains the Scratch and provides Retry/Cancel; unknown
  outcome reconciles before selection changes.
- Success sets `archivedAt`, removes the Scratch from active Inbox, and preserves Archive View restore
  behavior. Select the next visible Scratch, then previous; if the current filter has no result, keep
  its no-results state rather than selecting a hidden Scratch. If no active Scratch exists, show the
  Inbox empty state. Never auto-navigate to Archive View.

#### Focus And Accessibility

- Opening Edit, search, direct type choice, title validation, or Placement moves focus to the active
  step. Cancel returns to the surviving source; Confirm moves to the real Newly Placed card. Removing
  a focused source uses the next/previous item or section heading/input fallback.
- Column/search list keyboard navigation and all non-DnD actions remain operable. Current placement
  itself is the documented pointer-only exception and must not expose a nonfunctional keyboard
  command.
- Icon-only controls, collapsed Scratch switchers, status markers, invalid target reasons, unavailable
  Undo, and theme-specific labels have stable accessible names. Color, blur, and motion are never
  the only status channel.

#### Copy And Localization Boundary

- This promotion ships the English surface only. New labels, statuses, validation, failure,
  reconciliation, focus announcements, and accessible descriptions are read from
  `src/lib/copy/inbox-triage.ts`; feature components do not scatter new hard-coded copy.
- Later EN/KR support adds a shared locale provider/resources and Sidebar toggle, not eight duplicate
  routes. Locale switching keeps the same layout and interaction state. Date/time formatting,
  Korean typography, text fit, ellipsis/wrapping, and IME policy complete in their recorded follow-up
  work rather than being guessed during this core promotion.

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
| `playwright.config.ts` | Browser/E2E runner configuration and deterministic local web-server ownership for `tests/e2e/` |
| `src/components/layout/grid-runtime.tsx` | Client wrapper: route state, sidebar, breadcrumb, shared DnD boundary, add-flow orchestration |
| `src/components/layout/add-flow-context.tsx` | Minimal React context — pages call `useAddFlow().openAddAtCell(x, y)` to trigger add-flow |
| `src/components/layout/color-theme-provider.tsx` | Applies the persisted color theme to `<html data-color-theme="...">` |
| `src/components/layout/color-theme-toggle.tsx` | Color theme picker — 8 visual themes, swatches, selected check |
| `src/components/calendar/calendar-view-header.tsx` | Shared Calendar weekly/monthly header — title/subtitle, view switch, previous/today/next controls |
| `src/components/triage/triage-workspace.tsx` | Inbox/Triage composition root — four-area shell, DnD context, and page-session coordination |
| `src/components/triage/selected-scratch-context.tsx` | Signature Scratch context, title editor, row sort, and completed realization host |
| `src/components/triage/grid-explorer-search.tsx` | Dedicated whole-hierarchy search input/result surface; visual layout requires its phase-local user decision |
| `src/components/triage/placement-affordance.tsx` | Direct type/path step, staged/direct confirmation, validation, pending, failure, and reconciliation surfaces |
| `src/components/triage/archive-completion-affordance.tsx` | Breakdown-scoped archive overlay, completed Context/reopen, and archive recovery states |
| `src/lib/db/datastore.ts` | `DataStore` interface — storage abstraction plus atomic Inbox/Triage command/result contract |
| `src/lib/db/indexeddb.ts` | Dexie.js implementation — v1 stores, reactive reads, conditional writes, transactions, and reconciliation queries |
| `src/lib/db/schema.ts` | Zod validation schemas and TypeScript types (from SCHEMA.md) |
| `src/lib/triage/grid-explorer-search.ts` | Pure reachable-hierarchy traversal, token matching, relevance, breadcrumb, and duplicate-label model |
| `src/lib/copy/inbox-triage.ts` | Central English Inbox/Triage visible and accessibility copy; future locale-resource boundary |
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
| `src/hooks/use-dnd.ts` | Existing non-Triage DnD coordination — grid moves, calendar scheduling, timeline reorder, drag-to-child confirmation |
| `src/hooks/use-triage-dnd.ts` | Inbox pointer sensors, compact drag intent, collision/drop targeting, and DnD interruption; no persistence writes |
| `src/hooks/use-triage-candidates.ts` | Reactive durable candidate/source projection and Stage/Unstage command coordination |
| `src/hooks/use-grid-explorer-search.ts` | Async search request identity, cancellation, loading/error/stale-result handling, and reveal handoff |
| `src/hooks/use-triage-placement.ts` | Direct/staged placement steps, page-session Newly Placed/Undo metadata, command dispatch, and reconciliation |
| `src/stores/triage-store.ts` | Disposable Inbox/Triage UI state only — selection, Pool/Grid session context, drafts, affordance mode, and operation presentation; no durable candidates |
| `src/types/triage.ts` | Shared candidate, search-result, placement command/result, page-session operation, and status types |
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
