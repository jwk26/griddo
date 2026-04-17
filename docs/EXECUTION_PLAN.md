# EXECUTION PLAN — GridDO

> **Guideline:** Check this file first to see the current task before looking into other docs.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete

---

## Phase 1: Foundation

### Task 1: Scaffold Next.js Project
- **Status:** `[x]`
- **Files:** `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`
- **Actions:**
  - `pnpm create next-app@latest` with TypeScript strict, Tailwind 4.x, App Router, `src/` directory
  - Install all dependencies per SPEC.md tech stack: `dexie@^4`, `next-themes`, `date-fns@^4`, `zustand@^5`, `motion`, `@dnd-kit/core`, `@dnd-kit/sortable`, `zod@^3`, `lucide-react`, `geist`
  - Install dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
  - Configure `@/` path alias in `tsconfig.json` mapping to `src/`
  - Add `vitest.config.ts` with jsdom environment, `@/` alias, and `src/` include
- **Acceptance:** `pnpm build` passes, dev server starts, `pnpm test` runs (zero tests is OK at this stage)
- **Commit:** `feat: scaffold Next.js 16 project with dependencies`

### Task 2: Initialize shadcn/ui
- **Status:** `[x]`
- **Files:** `components.json`, `src/lib/utils.ts`, `src/components/ui/button.tsx`
- **Actions:**
  - `pnpm dlx shadcn@latest init -t next` — configure: style `new-york`, base color `zinc`, Tailwind CSS config blank (leave empty for v4), Tailwind CSS path `src/app/globals.css`, CSS variables `yes`, icon library `lucide`
  - Confirm `components.json` aliases: `@/components`, `@/components/ui`, `@/lib/utils`, `@/hooks`, `@/lib`
  - Add components: `pnpm dlx shadcn@latest add button dialog popover input scroll-area tooltip dropdown-menu separator`
  - **Note:** shadcn init generates a base `globals.css` with `@import "tailwindcss"`, shadcn CSS variables, and a `@theme inline` block. Task 3 reconciles this with GridDO tokens
- **Acceptance:** `components.json` has `tailwind.config: ""`, `tailwind.css: "src/app/globals.css"`, `tailwind.baseColor: "zinc"`, `tailwind.cssVariables: true`. Button renders. `cn()` available from `@/lib/utils`
- **Commit:** `feat: initialize shadcn/ui with base components`

### Task 3: Configure Tailwind v4 Token Bridge + Fonts
- **Status:** `[x]`
- **Files:** `src/app/globals.css`, `src/app/layout.tsx`
- **Dependencies:** Task 2 (shadcn init must complete first)
- **Actions:**
  - Reconcile `src/app/globals.css` with GridDO tokens from `docs/DESIGN_TOKENS.md`:
    - Keep `@import "tailwindcss"` and add `@import "tw-animate-css"` (shadcn component animations)
    - Add `@custom-variant dark (&:where(.dark, .dark *));` (replaces Tailwind v3 `darkMode: "class"`)
    - Expand `@theme inline` block: keep shadcn-generated tokens, add all GridDO color, spacing, container, and animation tokens per DESIGN_TOKENS.md Tailwind v4 Theme Bridge section. GridDO custom `@keyframes` nest inside `@theme inline` alongside their `--animate-*` values
    - Add `:root` block with all CSS variables from DESIGN_TOKENS.md (shadcn core + GridDO extensions) — top-level, NOT inside `@layer base`
    - Add `.dark` block with dark mode overrides — also top-level
    - Keep `@layer base` only for: `* { @apply border-border }`, `body { @apply bg-background text-foreground antialiased }`, and `prefers-reduced-motion` query
  - Wire fonts per DESIGN_TOKENS.md Font Loading section: `GeistSans` and `GeistMono` on `<html>`, `font-sans` on `<body>`
  - Verify `--radius: 0.625rem` (10px) in `:root`
  - Delete `tailwind.config.ts` if it exists (Tailwind v4 uses CSS-first configuration)
- **Acceptance:** `pnpm build` passes. Utility classes resolve: `bg-background` (#ffffff), `text-foreground` (#09090b), `text-muted-foreground` (#71717a), `bg-primary` (#3b82f6), `bg-priority-high` (#ef4444), `text-urgency-3` (deep red), `font-sans` (Geist Sans), `font-mono` (Geist Mono), `animate-jiggle`, `w-sidebar` (224px), `max-w-bit-detail` (640px). Dark mode toggles correctly via `.dark` class on `<html>`
- **Commit:** `feat: configure Tailwind v4 token bridge, design tokens, and Geist fonts`

### Task 4: Zod Schemas + TypeScript Types
- **Status:** `[x]`
- **Files:** `src/lib/db/schema.ts`, `src/types/index.ts`
- **Dependencies:** Task 1
- **Actions:**
  - `src/lib/db/schema.ts`: Copy Zod schemas from SCHEMA.md — `nodeSchema`, `createNodeSchema`, `bitSchema`, `createBitSchema`, `chunkSchema`, `createChunkSchema` with all field validations, constraints, and defaults
  - Export inferred TypeScript types: `Node`, `CreateNode`, `Bit`, `CreateBit`, `Chunk`, `CreateChunk`
  - `src/types/index.ts`: Re-export all schema types. Add computed types: `AgingState` (`"fresh" | "stagnant" | "neglected"`), `UrgencyLevel` (`1 | 2 | 3 | null`), `Priority` (`"high" | "mid" | "low"`), `GridPosition` (`{ x: number; y: number }`), `BreadcrumbSegment` (`{ id: string; title: string; level: number }`)
- **Acceptance:** `pnpm tsc --noEmit` passes. All Zod schemas validate sample data. Types importable via `@/types` and `@/lib/db/schema`
- **Commit:** `feat: add Zod validation schemas and TypeScript types`

### Task 5: DataStore Abstraction + IndexedDB Implementation
- **Status:** `[x]`
- **Files:** `src/lib/db/datastore.ts`, `src/lib/db/indexeddb.ts`, `src/lib/constants.ts`
- **Dependencies:** Task 4
- **Actions:**
  - `src/lib/db/datastore.ts`: Define `DataStore` interface — CRUD for nodes, bits, chunks. Methods: `getNode`, `getNodes(parentId)`, `createNode`, `updateNode`, `softDeleteNode`, `restoreNode`, `hardDeleteNode`, `getBit`, `getBits(parentId)`, `createBit`, `updateBit`, `softDeleteBit`, `restoreBit`, `hardDeleteBit`, `getChunks(bitId)`, `createChunk`, `updateChunk`, `deleteChunk`, `getActiveGridContents(parentId)`, `getCalendarItems()`, `getTrashedItems()`, `searchAll(query)`, `getGridOccupancy(parentId)`, `promoteBitToNode(bitId)`
  - `src/lib/db/indexeddb.ts`: Dexie.js implementation. `class GridDODatabase extends Dexie` with 3 object stores. Configure all indexes from SCHEMA.md (compound indexes: `[parentId, deletedAt]`, `[parentId, order]`, `[parentId, status]`). Implement all interface methods. Zod validation on writes via `createNodeSchema.parse()` etc
  - `src/lib/constants.ts`: `GRID_COLS: 12`, `GRID_ROWS: 8`, `AGING_FRESH_DAYS: 5`, `AGING_STAGNANT_DAYS: 11`, `URGENCY_LEVEL_1_DAYS: 3`, `URGENCY_LEVEL_2_DAYS: 2`, `URGENCY_LEVEL_3_DAYS: 1`, `TRASH_RETENTION_DAYS: 30`
  - **Critical PRD constraint:** No component imports `dexie` or `DataStore` directly. Components use custom hooks (`src/hooks/`) for reads. Hooks are the only files that import `useLiveQuery`; DataStore write methods are called from hooks and event handlers only
- **Acceptance:** DataStore interface exports cleanly. IndexedDB implementation opens database and creates stores with correct indexes. Constants importable via `@/lib/constants`. `pnpm tsc --noEmit` passes
- **Commit:** `feat: add DataStore interface, IndexedDB implementation, and constants`

#### Phase 1 Notes

> **Scaffold non-empty dirs:** `create-next-app` refuses non-empty directories. Scaffold into a sibling temp dir (`../scaffold-tmp`), rsync over, delete temp.

> **shadcn init automation:** CLI flags don't cover style/base-color. Create `components.json` manually — the format is stable. Also manually install `class-variance-authority` after `shadcn add`.

> **Spec ambiguities break delegation:** Codex follows formulas literally. The `promoteBitToNode` level bug came from an ambiguous spec formula. Resolve contradictions in docs before delegating.

> **Stub correct algorithm shapes:** Even when deferring a utility (BFS), implement the same algorithm shape in the stub. A linear scan from (0,0) is not equivalent to BFS from the original position.

> **Full issue log:** `docs/issues/Issues_Phase_1.md`

---

## Phase 2: Core Logic

### Task 6: Pure Utility Functions
- **Status:** `[x]`
- **Files:** `src/lib/utils/bfs.ts`, `src/lib/utils/aging.ts`, `src/lib/utils/urgency.ts`, `src/lib/utils/completion.ts`
- **Dependencies:** Task 4 (types), Task 5 (constants)
- **Actions:**
  - `bfs.ts`: Export `findNearestEmptyCell(occupied: Set<string>, startX: number, startY: number): GridPosition | null`. BFS from start position across 12×8 grid. Returns first unoccupied cell or `null` if grid is full. Key format: `"x,y"`
  - `aging.ts`: Export `getAgingState(mtime: number): AgingState`. Compute days since mtime. Return: 0–5 = `"fresh"`, 6–11 = `"stagnant"`, 12+ = `"neglected"`. Export `getAgingSaturation(state: AgingState): number` returning `1`, `0.5`, `0.2` per DESIGN_TOKENS
  - `urgency.ts`: Export `getUrgencyLevel(deadline: number | null): UrgencyLevel`. Return `null` if no deadline or > 3 days away. Return `1` (3 days), `2` (2 days), `3` (1 day or D-day). Export `isPastDeadline(deadline: number | null): boolean`
  - `completion.ts`: Export `isNodeComplete(bits: Bit[]): boolean`. Returns `true` when `bits.length > 0` AND every bit has `status === "complete"`. Empty node = never complete
- **Acceptance:** All functions are pure — no side effects, no imports of DataStore or Dexie. Unit tests pass:
  - `bfs.test.ts`: finds nearest cell, handles full grid, wraps around edges
  - `aging.test.ts`: boundary values at 5/6/11/12 days
  - `urgency.test.ts`: null deadline, >3d, 3d/2d/1d/past
  - `completion.test.ts`: empty bits array, partial, all complete
- **Commit:** `feat: add pure utility functions for BFS, aging, urgency, and completion`

### Task 7: Zustand Stores
- **Status:** `[x]`
- **Files:** `src/stores/sidebar-store.ts`, `src/stores/edit-mode-store.ts`, `src/stores/search-store.ts`, `src/stores/calendar-store.ts`
- **Dependencies:** Task 1
- **Actions:**
  - `sidebar-store.ts`: State: `isOpen: boolean`. Actions: `toggle()`, `open()`, `close()`. Default: `isOpen: true`. Export `useSidebarStore`
  - `edit-mode-store.ts`: State: `isEditMode: boolean`. Actions: `toggle()`, `enable()`, `disable()`. Default: `isEditMode: false`. Export `useEditModeStore`
  - `search-store.ts`: State: `isOpen: boolean`, `query: string`. Actions: `setQuery(q)`, `open()`, `close()`, `toggle()`. Default: `isOpen: false`, `query: ""`. Export `useSearchStore`
  - `calendar-store.ts`: State: `drillDownPath: string[]`, `currentWeekStart: Date`, `currentMonth: Date`. Actions: `pushDrillDown(nodeId)`, `popDrillDown()`, `resetDrillDown()`, `navigateWeek(direction: 1 | -1)`, `navigateMonth(direction: 1 | -1)`. Export `useCalendarStore`
  - All stores use Zustand `create()` — no provider needed (SPEC decision #9)
- **Acceptance:** Each store exports a typed hook. State updates trigger re-renders only in consuming components. Stores importable via `@/stores/`
- **Commit:** `feat: add Zustand stores for sidebar, edit mode, search, and calendar`

### Task 8: Animation Variant Definitions
- **Status:** `[x]`
- **Files:** `src/lib/animations/grid.ts`, `src/lib/animations/calendar.ts`, `src/lib/animations/layout.ts`
- **Dependencies:** Task 1
- **Actions:**
  - `grid.ts`: Export Motion variants — `sinkingVariants` (exit: translateY 8px, scale 0.95, opacity 0.5, duration 0.5s), `taskTossVariants` (spring with overshoot for drag-into-Node), `magnetSnapTransition` (spring: damping ~15, stiffness ~200), `vignetteVariants` (opacity keyed by level: l0=0, l1=0.15, l2=0.3, l3=0.45)
  - `calendar.ts`: Export `dayColumnExpandVariants` (layout animation + vignette), `magnetSnapCalendarTransition` (spring for day column snap)
  - `layout.ts`: Export `sidebarVariants` (width transition for fold/unfold), `searchOverlayVariants` (fade + scale entry/exit), `bitDetailPopupVariants` (fade + slide-up entry, slide-down + fade exit)
- **Acceptance:** All variants export as plain objects — no runtime side effects. Importable via `@/lib/animations/`
- **Commit:** `feat: add Motion animation variants for grid, calendar, and layout`

### Task 9: Data Hooks — Grid + Bit Detail
- **Status:** `[x]`
- **Files:** `src/hooks/use-grid-data.ts`, `src/hooks/use-bit-detail.ts`
- **Dependencies:** Task 5 (DataStore)
- **Actions:**
  - `use-grid-data.ts`: Export `useGridData(parentId: string | null)`. The reactive subscription layer — internally uses Dexie `useLiveQuery` (v1 implementation detail, replaceable for v2 cloud sync). Returns `{ nodes: Node[], bits: Bit[], isLoading: boolean }`. Queries use compound index `[parentId, deletedAt]`
  - `use-bit-detail.ts`: Export `useBitDetail()`. Reads `?bit=` query param from URL via `useSearchParams`. When present, fetches Bit + ordered Chunks via the reactive layer. Returns `{ bit: Bit | null, chunks: Chunk[], isOpen: boolean, close: () => void }`. `close()` removes `?bit` param via `router.replace`
  - **Abstraction boundary:** Components import these hooks only — never DataStore or Dexie directly. The hooks are the reactive abstraction; DataStore is the CRUD abstraction. Both are replaceable independently for v2
- **Acceptance:** Grid data auto-updates when IndexedDB changes. Bit detail state driven by URL query param. No manual cache invalidation. No component imports `dexie` — only these hooks do
- **Commit:** `feat: add reactive data hooks for grid and bit detail`

### Task 10: Data Hooks — Calendar, Search + DnD
- **Status:** `[x]`
- **Files:** `src/hooks/use-calendar-data.ts`, `src/hooks/use-search.ts`, `src/hooks/use-dnd.ts`
- **Dependencies:** Task 5 (DataStore), Task 7 (stores)
- **Actions:**
  - `use-calendar-data.ts`: Export `useCalendarData()`. Reactive layer (internally `useLiveQuery`). Fetches: active Nodes with deadlines + Bits with deadlines + Chunks with times. Returns `{ weeklyItems(weekStart: Date): Map<string, (Node | Bit | Chunk)[]>, monthlyItems(month: Date): Map<string, (Node | Bit | Chunk)[]>, poolItems: (Bit | Chunk)[], isLoading: boolean }`. Schedule collections include all three types; `poolItems` is `Bit | Chunk` only (Nodes live in the separate Node Pool component). Pool sort: deadline items first (by priority rank → time), no-deadline below
  - `use-search.ts`: Export `useSearch()`. Reads query from `useSearchStore`. Client-side filters all active nodes, bits, chunks by title (case-insensitive substring). Returns `{ results: SearchResult[], isLoading: boolean }`. `SearchResult`: `{ id, type, title, parentPath, deadline }`
  - `use-dnd.ts`: Export `useDnd()`. Coordinates @dnd-kit sensors + collision detection. Returns `{ sensors, handleDragStart, handleDragEnd, handleDragOver, activeItem }`. Handles: grid reposition, drag-into-Node, calendar scheduling, chunk timeline reorder, drag-to-breadcrumb
- **Acceptance:** Calendar data groups items by day/date. Search filters in real-time. DnD hook provides unified drag coordination across all contexts
- **Commit:** `feat: add hooks for calendar data, search, and drag-and-drop`

#### Phase 2 Notes

> **Dexie v4 reactive pattern:** `useLiveQuery` does not exist in Dexie v4. Use `liveQuery` from `dexie` with `useState` + `useEffect` subscribe/unsubscribe. The SPEC and plan references to `useLiveQuery` are v3 conventions — ignore them. `dexie-react-hooks` is not installed and should not be added.

> **URL query param removal:** When removing a specific param (e.g., `?bit=`), use `URLSearchParams.delete(key)` and reconstruct the URL. Never use bare `router.replace(pathname)` — it silently wipes all other params.

> **DnD hook is infrastructure, not behavior:** `useDnd()` in Phase 2 provides sensors, `activeItem` tracking, and handler signatures only. Drag dispatch logic (grid reposition, drag-into-Node, calendar scheduling, chunk reorder, breadcrumb drop) requires UI drop zone components built in Phases 3–5. TODO comments in `handleDragEnd` map each behavior to its owning phase.

> **Full issue log:** `docs/issues/Issues_Phase_2.md`

---

## Phase 3: Layout Shell + Level 0 Grid

### Task 11: Client Providers Wrapper
- **Status:** `[x]`
- **Files:** `src/app/providers.tsx`, `src/app/layout.tsx`
- **Dependencies:** Task 3 (tokens), Task 5 (DataStore)
- **Actions:**
  - `providers.tsx`: `"use client"` wrapping children with: `ThemeProvider` (from `next-themes`, `attribute="class"`, `defaultTheme="system"`), `DndContext` (from `@dnd-kit/core`), DataStore provider (React context providing the IndexedDB `DataStore` instance). Zustand stores require no provider (SPEC decision #9)
  - `layout.tsx`: Update root layout. Import `GeistSans` and `GeistMono` from `geist/font`. Apply font variables to `<html className={...}>`. Wrap `{children}` in `<Providers>`. Set `<body className="font-sans">`. Metadata: `title: "GridDO"`, `description: "Local-first task management"`
- **Acceptance:** ThemeProvider toggles `.dark` class on `<html>`. DndContext available to all pages. DataStore accessible via context hook. Fonts render correctly
- **Commit:** `feat: add client providers and root layout with font loading`

### Task 12: Sidebar + Theme Toggle
- **Status:** `[x]`
- **Files:** `src/components/layout/sidebar.tsx`, `src/components/layout/theme-toggle.tsx`
- **Dependencies:** Task 7 (sidebar-store), Task 2 (shadcn)
- **Actions:**
  - `sidebar.tsx`: `"use client"`. Fixed left sidebar. Uses `useSidebarStore`. Classes per DESIGN_TOKENS: `fixed left-0 top-0 h-full bg-background border-r border-border flex flex-col items-center gap-1 py-4 px-2 z-40 transition-all`. Width: `w-sidebar` (open) / `w-sidebar-collapsed` (closed). Sidebar buttons with Lucide icons: `Plus` (+), `Pencil` (edit mode), `Search`, Theme toggle, `Calendar` (with urgency dot), `Trash` (Level 0 only). Fold/unfold button at bottom
  - `theme-toggle.tsx`: `"use client"`. Uses `useTheme()` from `next-themes` with `resolvedTheme` for correct icon. Toggles between `Sun`/`Moon` Lucide icons
  - Urgency notification dot on Calendar: `absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full` with `bg-urgency-{1,2,3}` based on global urgency query
- **Acceptance:** Sidebar folds/unfolds. Theme toggle switches light/dark. Urgency dot appears on Calendar button. Width matches `--sidebar-width` tokens
- **Re-opened note:** Urgency dot rendering on Calendar button deferred to Task 26 (Phase 6). `useGlobalUrgency` hook was delivered in Task 24 (Phase 5). Task 26 wires the dot to the sidebar and Task 30 extends the hook to also scan Nodes with deadlines.
- **Commit:** `feat: add foldable sidebar with theme toggle and urgency indicator`

### Task 13: Grid View + Grid Cell
- **Status:** `[x]`
- **Files:** `src/components/grid/grid-view.tsx`, `src/components/grid/grid-cell.tsx`
- **Dependencies:** Task 9 (use-grid-data), Task 7 (edit-mode-store)
- **Actions:**
  - `grid-view.tsx`: `"use client"`. Props: `parentId: string | null`, `level: number`. Uses `useGridData(parentId)`. Renders 12×8 CSS Grid: `grid grid-cols-12 gap-[var(--grid-gap)]`. Maps nodes and bits onto cells by `(x, y)`. Empty cells render `GridCell` in edit mode. Grid line opacity per level: `--grid-line-opacity-l{n}` tokens
  - `grid-cell.tsx`: Container for a single grid position. Props: `x, y, isEditMode, isEmpty, children`. Classes per DESIGN_TOKENS: `relative rounded-md transition-all`. Edit mode adds: `border-2 border-dashed border-muted-foreground/30`. Empty + edit: centered `+` button (`text-muted-foreground/50 hover:text-muted-foreground`)
- **Acceptance:** 12×8 grid renders. Grid lines at correct opacity per level. Empty cells show `+` in edit mode. Items at correct `(x, y)` positions
- **Commit:** `feat: add grid view and grid cell components`

### Task 14: Node Card
- **Status:** `[x]`
- **Files:** `src/components/grid/node-card.tsx`
- **Dependencies:** Task 4 (types), Task 6 (aging, urgency)
- **Actions:**
  - `node-card.tsx`: `"use client"`. Mobile app icon design per DESIGN_TOKENS Component Quick Reference. Props: `node: Node`, `onClick: () => void`
    - Outer: `flex flex-col items-center gap-1.5 p-3 rounded-xl cursor-pointer transition-transform hover:scale-105`
    - Icon container: `flex items-center justify-center w-14 h-14 rounded-2xl` with `style={{ backgroundColor: node.color }}`
    - Lucide icon: `w-7 h-7 text-white` — dynamically resolved from `node.icon` string
    - Title: `text-xs font-medium text-foreground truncate max-w-[5rem]`
  - Aging: apply `filter: saturate(...)` from `getAgingSaturation(getAgingState(node.mtime))`
  - Urgency badge on icon corner when child Bits have approaching deadlines
  - Completion indicator: when `isNodeComplete(childBits)` returns `true`, show a visual indicator on the icon (e.g., small checkmark badge or faint ring). Use `completion.ts` utility.
  - Edit mode: add `animate-jiggle` class + delete button overlay
- **Acceptance:** Node renders as icon + label. Color from `node.color`. Aging desaturates. Click navigates to `/grid/[nodeId]`
- Node completion indicator visible when all child Bits are complete
- **Commit:** `feat: add node card with aging and urgency indicators`

### Task 15: Level 0 Page + Onboarding
- **Status:** `[x]`
- **Files:** `src/app/page.tsx`, `src/components/grid/onboarding-hints.tsx`, `src/components/layout/level-0-shell.tsx`, `src/components/grid/create-node-dialog.tsx`, `src/lib/constants/node-icons.ts`
- **Dependencies:** Task 11, Task 12, Task 13, Task 14
- **Actions:**
  - `page.tsx`: Thin server component shell — delegates to `Level0Shell`
  - `level-0-shell.tsx`: `"use client"`. Owns creation state (dialog open/close, placement context, error). Renders Sidebar, GridView, OnboardingHints, CreateNodeDialog. Wires both creation entry points to the shared dialog.
  - `create-node-dialog.tsx`: shadcn Dialog. Fields: title (required), icon picker (25 Lucide icons, `role="radiogroup"`), color (native `input type=color`). Defaults: Folder / #308ce8. Placement resolved in shell via BFS before `createNode()` call.
  - `onboarding-hints.tsx`: `"use client"`. Ghost placeholders. Disappear after first node creation (reactive via `useGridData` hook).
  - `node-icons.ts`: Shared icon constants (`NODE_ICON_MAP`, `NODE_ICON_NAMES`, `DEFAULT_ICON`, `DEFAULT_COLOR_HEX`) used by both NodeCard and CreateNodeDialog.
- **Creation flow clarification:**
  - Level 0 `+` uses a **Create Node dialog** (not instant creation — user selects title, icon, color)
  - Sidebar `+` and empty-cell `+` share the same dialog; placement context differs only in BFS origin
  - Sidebar placement: BFS from `(0, 0)`
  - Empty-cell placement: BFS from `(clickedX, clickedY)` — returns clicked cell if empty, nearest fallback if occupied
  - Level 1–2 Node/Bit menu and Level 3 direct Bit creation remain out of scope for this phase
- **Acceptance:** `/` renders Level 0 grid with sidebar. First visit shows ghost hints. Creating first node (via sidebar `+` or cell `+`) opens dialog, places node, and removes hints. No vignette.
- **Commit:** `feat: wire Level 0 node creation — dialog, shell, shared icon constants`

#### Phase 3 Notes

> **Plan status vs. implementation:** Tasks 11–14 were committed in a single phase commit before statuses were updated. ~~Always update task statuses in the same session that produces the commit.~~ **Superseded:** Task status `[x]` now requires explicit user approval at the checkpoint — see WORKFLOW.md §Task Completion Gate.

> **Level 0 creation was a Phase 3 omission:** The sidebar `+` and empty-cell `+` were wired to `noop`. The execution plan acceptance criteria said "creating first node removes hints" but never specified the creation UI. Treat any acceptance criterion that implies user action as requiring a complete UI path — not just a data layer.

> **`typecheck` script does not exist:** There is no separate `pnpm typecheck` command. TypeScript checking runs as part of `pnpm build` (`next build`). The pre-PR gate is `pnpm lint && pnpm build`.

> **Lint has 2 pre-existing warnings:** `src/hooks/use-dnd.ts` lines 46 and 55 have `_event is defined but never used`. These are not errors and are not introduced by Phase 3. Lint exits 0. Correct phrasing: "lint passes with 2 pre-existing warnings."

> **Radiogroup keyboard navigation deferred:** The icon picker uses `role="radiogroup"` + `role="radio"` semantics but individual tab stops rather than the ARIA-standard single-tab-stop + arrow-key navigation. Full keyboard implementation requires either custom `onKeyDown` arrow handlers or adopting the Radix `RadioGroup` primitive. Deferred to a future a11y pass.

> **DataStore context exists but hooks use direct imports:** `providers.tsx` exports `useDataStore()` with a full context implementation. However, all existing hooks (`use-grid-data`, `use-search`, `use-bit-detail`) import `indexedDBStore` directly. New write paths (e.g., `level-0-shell.tsx`) should follow the existing direct-import pattern for consistency until a deliberate migration is planned.

> **Full issue log:** `docs/issues/Issues_Phase_3.md`

---

## Phase 4: Grid Navigation + Bit Cards

### Task 16: Breadcrumbs
- **Status:** `[x]`
- **Files:** `src/components/layout/breadcrumbs.tsx`
- **Dependencies:** Task 5 (DataStore)
- **Actions:**
  - `breadcrumbs.tsx`: `"use client"`. Props: `nodeId: string`. Fetches parent chain from DataStore. Structure per DESIGN_TOKENS:
    - Nav: `flex flex-col gap-0.5 h-breadcrumb px-4 justify-center`
    - Path: `flex items-center gap-1.5 text-sm`
    - "Home" button: `text-muted-foreground hover:text-foreground transition-colors` → navigates to `/`
    - Chevron: `ChevronRight` `w-3.5 h-3.5 text-muted-foreground`
    - Segment: `text-muted-foreground hover:text-foreground transition-colors`. Last segment: `text-foreground font-medium`
    - Description subtitle: `text-xs text-muted-foreground truncate pl-0.5` (when node has description)
  - Click segment → navigate to `/grid/[nodeId]` or `/` for Home
  - Drop zone structure present; active drag highlighting deferred to Task 34 (DnD Grid Interactions)
- **Acceptance:** Breadcrumbs show full path. Click navigates. Last segment bold. Description subtitle when present.
- **Commit:** `feat: add breadcrumbs with navigation and drag-to-breadcrumb drop zone`

### Task 17: Bit Card
- **Status:** `[x]`
- **Files:** `src/components/grid/bit-card.tsx`
- **Dependencies:** Task 4 (types), Task 6 (aging, urgency)
- **Actions:**
  - `bit-card.tsx`: `"use client"`. Horizontal rectangle per DESIGN_TOKENS. Props: `bit: Bit`, `parentColor: string`, `chunkStats: { completed: number; total: number }`, `onClick: () => void`
    - Outer: `flex items-center gap-3 px-4 py-3 rounded-lg bg-card shadow-sm border border-border`
    - Color accent: `w-1 self-stretch rounded-full` with `style={{ backgroundColor: parentColor }}` (dark mode visible, light mode bg tint)
    - Icon: `flex-shrink-0` → Lucide icon `w-5 h-5 text-muted-foreground`
    - Content: `flex-1 min-w-0` → title `text-sm font-medium text-foreground truncate`, deadline `text-xs text-muted-foreground mt-0.5`
    - Priority badge: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium` with `bg-priority-{high,mid,low}-bg text-priority-{high,mid,low}`
    - Progress bar (chunks > 0): track `w-16 h-1.5 rounded-full bg-secondary overflow-hidden`, fill `h-full rounded-full bg-primary transition-all`
  - Aging saturation filter. Urgency blink: `animate-urgency-blink-{1,2,3}`
  - Past deadline: blur + overlay pattern per DESIGN_TOKENS ("Done?" with check/x buttons)
  - Dismiss persistence: clicking ✗ on past-deadline overlay sets `bit.pastDeadlineDismissed = true` via `DataStore.updateBit()`. When `pastDeadlineDismissed === true`, overlay does not render. User can still manually complete via Bit Detail Popup.
  - Click → appends `?bit=[bitId]` to URL
- **Acceptance:** Bit renders as horizontal card. Priority badge correct color. Progress reflects chunks. Urgency blinks near deadline. Past-deadline shows blur+overlay
- Past-deadline overlay dismissed with ✗ → `pastDeadlineDismissed` persisted. Overlay does not re-appear on remount
- **Commit:** `feat: add bit card with priority, progress, urgency, and past-deadline overlay`

### Task 18: Level 1-3 Grid Page
- **Status:** `[x]`
- **Files:** `src/app/grid/[nodeId]/page.tsx`
- **Dependencies:** Task 13, Task 16, Task 17
- **Actions:**
  - `page.tsx`: Server component shell. Extracts `nodeId` from params. Renders client grid with `parentId={nodeId}`. Layout: sidebar + breadcrumbs bar at top + grid view
  - Level detection: fetch node → pass `node.level + 1` to GridView (display level is one deeper than parent)
  - Level 1-2: Nodes (left zone ~5-6 cols) + Bits (right zone ~6-7 cols). Soft guide — items can go anywhere
  - Level 3 (`node.level === 2`): Bits only, full grid. Block Node creation. `+` creates Bit directly
  - Level 1 first visit: ghost hints for 2-way split ("Nodes here" left, "Bits here" right)
- **Acceptance:** `/grid/[nodeId]` renders grid at correct level. Breadcrumbs show path. Level 3 blocks Node creation. Browser back navigates to parent
- **Commit:** `feat: add Level 1-3 grid page with breadcrumbs and level constraints`

### Task 19: Vignette + Depth Effects
- **Status:** `[x]`
- **Files:** `src/components/grid/grid-view.tsx` (update), `src/lib/animations/grid.ts` (update)
- **Dependencies:** Task 13, Task 8
- **Actions:**
  - Update `grid-view.tsx`: Add vignette overlay element. Inner shadow via `box-shadow: inset 0 0 120px rgba(0,0,0, intensity)`. Intensity from `--vignette-intensity-l{level}` tokens: l0=0, l1=0.15, l2=0.3, l3=0.45. Animate opacity via Motion on level change
  - Grid line density: set CSS variable `--grid-line-opacity` per level (l0=0.15, l1=0.12, l2=0.08, l3=0.05)
  - Depth transition animation on navigation between levels
- **Acceptance:** No vignette at Level 0. Vignette visible at Level 1+ with increasing intensity. Grid lines thinner with depth. Transition plays on level change
- **Commit:** `feat: add vignette and grid depth effects per hierarchy level`

### Task 20: Edit Mode Overlay
- **Status:** `[x]`
- **Files:** `src/components/grid/edit-mode-overlay.tsx`
- **Dependencies:** Task 7 (edit-mode-store), Task 13
- **Actions:**
  - `edit-mode-overlay.tsx`: `"use client"`. Uses `useEditModeStore`. When edit mode active:
    - All cards get `animate-jiggle` class (`jiggle 0.3s ease-in-out infinite` from Tailwind keyframes)
    - Grid cells get `border-2 border-dashed border-muted-foreground/30`
    - Empty cells show `+` button for item creation
    - Each item gets delete button overlay (top-right corner, `bg-destructive text-destructive-foreground` rounded)
    - Drag-to-reposition deferred to Task 34 (DnD Grid Interactions)
  - Toggle via sidebar Pencil button or keyboard shortcut
  - Exit on navigation or ESC key
- **Acceptance:** Pencil toggles edit mode. Cards jiggle. Delete overlays appear on all item types. Dashed cell borders visible. ESC exits. Drag reposition owned by Task 34.
- **Commit:** `feat: add edit mode with jiggle animation and delete overlays`

#### Phase 4 Notes

> **Always add a visually-hidden h1 per page:** `node-grid-shell.tsx` was missing a page heading for screen readers. Every major page shell needs `<h1 className="sr-only">{title}</h1>` even when the visual design omits a visible heading.

> **BitCard in GridCell requires a flex wrapper:** BitCard placed directly inside GridCell is not vertically centered. Wrap with `<div className="flex h-full items-center">` to fill the cell and center the card.

> **Hide overflow scrollbars with Tailwind arbitrary values:** Long breadcrumb paths show a native browser scrollbar. Suppress with `[scrollbar-width:none] [&::-webkit-scrollbar]:hidden` on the overflow-x-auto container — covers both Firefox and WebKit.

> **execute-next-phase skill had a bug during this phase:** The skill was updated post-execution. If planning or task scoping felt off during this phase, that's the likely cause. Verify the skill is current before starting the next phase.

> **At leaf level, switch creation type — never block it:** The `isLeafLevel` guard was applied too broadly, hiding all creation affordances instead of routing `+` to `CreateBitDialog`. Any leaf-level guard on a creation entry point should substitute Bit creation, not remove the affordance entirely.

> **Verify acceptance criteria against running code, not code existence:** Tasks 17, 18, and 20 were marked complete with code committed, but several acceptance items were undelivered (missing overlay buttons, missing delete overlay on BitCard, leaf-level creation blocked). Code existing ≠ acceptance criteria met. Check each acceptance line against the live behavior before closing.

> **Separate edit-mode affordances from DnD interactions across phases:** Task 20 = visual affordances (jiggle, dashed cells, delete overlays). Task 34 = DnD interaction logic (drag reposition, drag-into-Node, drag-to-breadcrumb). Never let acceptance criteria from one bleed into the other. Resolve ownership before closing any task that touches shared behavior.

> **Full issue log:** `docs/issues/Issues_Phase_4.md`

---

## Phase 4.5: Design Alignment

> **Context:** Design archaeology against `docs/design-system-preview.html` revealed accumulated drift between the canonical design reference and runtime code. This phase closes that drift before Phase 5 builds on top of it.
> **Branch:** `phase-4/grid-navigation-bit-cards` (same branch, separate tracking unit)
> **Audit source:** `docs/design-archaeology/DESIGN_AUDIT.md`

### Task A: Foundation Token Alignment

- **Status:** `[x]`
- **Files:** `src/app/globals.css`, `src/lib/utils/aging.ts`, `src/components/grid/bit-card.tsx`, `src/components/grid/node-card.tsx`, `src/lib/utils/aging.test.ts`, `src/components/grid/bit-card.test.tsx`
- **Actions:**
  - `globals.css` — `:root`:
    - Add `--page-bg: hsl(38 28% 91%)` (warm beige body background)
  - `globals.css` — `@theme inline`:
    - Add `--color-page-bg: hsl(var(--page-bg))` so `bg-page-bg` utility is available
  - `globals.css` — `@layer base`:
    - Change `body` from `@apply bg-background` to `background: hsl(var(--page-bg))` in light mode. Dark mode body background stays `--background`; add a `.dark body` override to keep dark background
  - `globals.css` — `.dark`:
    - Change `--card: 240 6% 8%` (elevated surface, distinct from `--background`)
    - Change `--popover: 240 6% 8%` (same elevation as card)
    - Update aging token names: rename `--aging-fresh-saturation` → `--aging-fresh-filter`, etc. with compound values: fresh = `saturate(1)`, stagnant = `saturate(0.5) brightness(0.9)`, neglected = `saturate(0.2) brightness(0.75)`
  - `aging.ts`:
    - Rename `getAgingSaturation(state)` → `getAgingFilter(state): string`
    - Return full CSS filter strings: `"saturate(1)"`, `"saturate(0.5) brightness(0.9)"`, `"saturate(0.2) brightness(0.75)"`
    - Export old name as deprecated alias if needed for test migration, or update all callsites directly
  - `bit-card.tsx` + `node-card.tsx`:
    - Update import: `getAgingFilter` instead of `getAgingSaturation`
    - Change `style={{ filter: \`saturate(${saturation})\` }}` → `style={{ filter: getAgingFilter(getAgingState(...)) }}`
  - `aging.test.ts` + `bit-card.test.tsx`:
    - Update assertions to expect full filter strings (e.g. `"saturate(0.5) brightness(0.9)"` not `"saturate(0.5)"`)
- **Acceptance:**
  - `pnpm test` passes — aging tests assert full filter strings; bit-card aging test matches new signature
  - `pnpm build` passes — no TypeScript errors from renamed export
  - Dark mode: BitCard and NodeCard backgrounds are visibly elevated against page background
  - Light mode: body background is warm beige (`hsl(38 28% 91%)`), not pure white
  - Stagnant/neglected items visibly darker (brightness applied), not just desaturated
- **Commit:** `fix: foundation token alignment — page-bg, dark card elevation, aging filter`

### Task B: BitCard Design Alignment

- **Status:** `[x]`
- **Files:** `src/components/grid/bit-card.tsx`, `src/components/grid/bit-card.test.tsx`
- **Dependencies:** Task A
- **Actions:**
  - **Restructure to two-row layout** per `docs/design-archaeology/DESIGN_AUDIT.md` section 5:
    - Row 1 (top): color accent bar + icon + title + meta/deadline + priority badge
    - Row 2 (bottom, conditional on `chunkStats.total > 0`): progress bar (`flex: 0 0 80%`, not `w-16`) + chunk count label
    - Card padding: `py-[10px] pr-[14px] pl-[12px]` to match `10px 14px 10px 12px` spec
    - Card border-radius: `rounded-[10px]` (spec is `var(--radius)` = 10px; `rounded-lg` = 8px, off by 2px)
  - **Priority badge** per audit section 6:
    - Font size: `text-[10px]` (not `text-xs` = 12px)
    - Font weight: `font-semibold` (600, not `font-medium` = 500)
    - Text transform: `uppercase`
    - Letter spacing: `tracking-[0.05em]`
    - Padding: `px-[7px] py-[2px]`
  - **Past-deadline overlay** per audit section 8:
    - "Done?" text: `text-[13px] font-semibold text-foreground` (not `text-xs font-medium text-muted-foreground`)
    - Action buttons: `w-7 h-7 rounded-full` (28px, not `h-5 w-5` = 20px)
    - Cancel button: `bg-secondary text-secondary-foreground` (not `bg-muted text-muted-foreground`)
- **Acceptance:**
  - BitCard visually matches the two-row layout in `docs/design-archaeology/screenshot-light.png`
  - Priority badge is uppercase with correct size and weight
  - Past-deadline overlay buttons are 28px circles with correct tokens
  - `pnpm build` passes
- **Commit:** `fix: BitCard design alignment — two-row layout, badge typography, overlay`

#### Phase 4.5 Notes

> **Aging tokens in globals.css were dead code:** `--aging-fresh-saturation` etc. were never consumed by components. Aging was hardcoded in `aging.ts`. Updating only the CSS tokens would have had zero visual effect. Always trace the full call path before categorising a change as "token-only."

> **Explicitly deferred (known remaining gaps):** NodeCard icon container size (52px vs 56px) and Sidebar button/icon sizing are minor visual discrepancies. Deferred to Phase 7 Polish — not structural, "visually subtle" per audit verdict.

> **Full audit:** `docs/design-archaeology/DESIGN_AUDIT.md`

#### Phase 4.5 Bootstrap Notes (Pre-Phase-5 Prep)

> **Audit docs without close-out steps become debt:** `OMISSION_AUDIT.md` was written but never applied. Treat audit action items as plan tasks — status + owner before the session ends.

> **Conformance deviations compound across phases:** 5 Tier 5 architectural deviations (non-reactive fetches, DataStore facade bypass, dead context, unused variant) accumulated across Phases 1–4 with no conformance gate. `PLANNING_STANDARD.md §6` checklist now runs at every phase close.

> **DataStore API gap exposed by Fix 1:** `getNodes(null)` returns only L0 nodes. The calendar hook's original `db.nodes.toArray()` returned all levels. Facade is now clean; the functional gap (L1/L2 nodes missing from calendar) is a pre-existing DataStore design issue for Phase 6.

> **3 open decisions before Phase 5 starts:** (1) Inline edit save strategy (blur vs. debounce) — affects Tasks 21/22/23/25c. (2) Hook 3 force-complete reversal rule — affects Task 24. (3) Edit-mode / chooser integration ownership — affects Tasks 20 & 25b.

> **Full bootstrap issue log:** `docs/issues/Issues_Phase_4_Bootstrap.md`

---

## Phase 5: Bit Detail + Application Hooks

### Task 21: Bit Detail Popup
- **Status:** `[x]`
- **Files:** `src/components/bit-detail/bit-detail-popup.tsx`
- **Dependencies:** Task 9 (use-bit-detail), Task 2 (shadcn dialog)
- **Actions:**
  - `bit-detail-popup.tsx`: `"use client"`. Uses `useBitDetail()`. Centered modal over blurred background. Motion entry via `bitDetailPopupVariants`
    - Backdrop: `fixed inset-0 bg-background/80 backdrop-blur-sm z-50`
    - Container: `max-w-bit-detail` (640px), `max-h-[85vh]` (from `--bit-detail-max-height`), scrollable
    - Header: editable title input, icon selector (Lucide icon picker), deadline date picker with **"All day" toggle**: when enabled, sets `deadlineAllDay: true` and hides the time picker, priority toggle (cycles high→mid→low→null on click)
    - Header dropdown menu: "Promote to Node" action (visible only when Bit has 1+ Chunks). Calls `DataStore.promoteBitToNode(bitId)` (Task 25). "Move to trash" action: calls `DataStore.softDeleteBit(bitId)`
    - Description: editable textarea
    - mtime label: `text-xs text-muted-foreground` — "Last updated: X days ago" via `date-fns formatDistanceToNow`
    - Chunk pool section (Task 23)
    - Timeline section (Task 22)
  - Empty state: timeline structure visible (vertical line, dot placeholder) + "Add a step" CTA button
  - Close: click backdrop, ESC key, or browser back (removes `?bit` param)
- **Acceptance:** `?bit=[bitId]` opens popup with fade+slide. Title/description editable inline. Priority cycles. Close via backdrop/ESC/back. mtime shows relative time
- Deadline picker has "All day" toggle that hides the time component when enabled
- Header dropdown shows "Promote to Node" action when Bit has 1+ Chunks
- **Commit:** `feat: add bit detail popup with editable fields and priority toggle`

### Task 22: Chunk Timeline + Chunk Item
- **Status:** `[x]`
- **Files:** `src/components/bit-detail/chunk-timeline.tsx`, `src/components/bit-detail/chunk-item.tsx`
- **Dependencies:** Task 21, Task 4 (types)
- **Actions:**
  - `chunk-timeline.tsx`: Vertical timeline inside bit detail popup. Structure per DESIGN_TOKENS:
    - Container: `relative pl-8`
    - Vertical connecting line: `absolute left-3.5 top-0 bottom-0 w-0.5 bg-border`
    - Each chunk renders as `ChunkItem`
    - Drag-to-reorder via `@dnd-kit/sortable` — updates `order` field
    - Deadline marker at bottom: clock icon aligned vertically with dots above
    - Progress ring: circular SVG showing `completedChunks / totalChunks`
  - `chunk-item.tsx`: Single chunk in timeline. Props: `chunk: Chunk`, `onToggle`, `onEdit`, `onDelete`
    - Wrapper: `relative flex items-start gap-3 pb-6`
    - Dot: `relative z-10 w-3 h-3 rounded-full border-2 border-background mt-1.5`. Complete: `bg-primary`. Incomplete: `bg-muted-foreground/30`
    - Content card: bordered container with title `text-sm`, completed adds `line-through text-muted-foreground`
    - Time: `text-xs text-muted-foreground mt-0.5`
  - Ordering: chunks with `time` sort by time value; chunks without `time` follow `order` field
- **Acceptance:** Timeline renders vertically with connecting line and dots. Complete chunks: filled dot + strikethrough. Drag reorders. Deadline marker at bottom. Progress ring reflects ratio
- **Commit:** `feat: add chunk timeline with reorderable items, deadline marker, and progress ring`

### Task 23: Chunk Pool
- **Status:** `[x]`
- **Files:** `src/components/bit-detail/chunk-pool.tsx`
- **Dependencies:** Task 22, Task 5 (DataStore)
- **Actions:**
  - `chunk-pool.tsx`: `"use client"`. Section inside bit detail popup above the timeline. Lists unscheduled chunks (no `time` set)
    - "Add a step" button to create new chunk via DataStore (`order = chunks.length`)
    - Inline editing: click chunk title to edit in place
    - Delete: remove button per chunk — hard delete (chunks have no soft-delete per SCHEMA)
    - Drag from pool onto timeline to set order position
  - Validates via `createChunkSchema` on creation
  - Chunk activity triggers mtime cascade on parent Bit (handled by Hook 1 in Task 24)
- **Acceptance:** Can add new chunks inline. Edit title by clicking. Delete removes permanently. Drag to timeline sets position
- **Commit:** `feat: add chunk pool with inline create, edit, delete, and drag-to-timeline`

### Task 24: Core Application Hooks
- **Status:** `[x]`
- **Files:** `src/lib/db/indexeddb.ts` (update), `src/hooks/use-global-urgency.ts` (new), `src/hooks/use-node-urgency.ts` (new), `src/components/shared/deadline-conflict-overlay.tsx` (new), `src/components/shared/deadline-conflict-modal.tsx` (new)
- **Dependencies:** Task 5 (DataStore), Task 6 (utilities)
- **Actions:**
  - Implement inside DataStore write methods (enforced at data layer, not in components):
  - **Hook 1 — mtime cascade:** Per SCHEMA.md table. Chunk changes cascade `mtime = Date.now()` to parent Bit AND parent Node. Bit changes cascade to parent Node. Does NOT cascade on open/view or grid reposition
  - **Hook 2 — Deadline hierarchy:** `child.deadline <= parent.deadline`. Block violation and return conflict info for UI modal ("Child cannot exceed parent's deadline. Update parent too?"). When parent deadline shortened: find conflicting children, return list for blur+overlay
  - **Hook 3 — Bit auto-completion:** On chunk status → `"complete"`, check all sibling chunks. All complete → `bit.status = "complete"`. Reverse: chunk uncompleted + bit was complete → `bit.status = "active"`. Both directions cascade mtime
  - **Hook 8 — Grid cell uniqueness:** Before insert/move, query active items at `(parentId, x, y)`. If occupied → reject or trigger BFS auto-placement
  - **`useGlobalUrgency()` hook:** New hook in `src/hooks/use-global-urgency.ts`. Reactive query across all active Bits project-wide. Returns `UrgencyLevel` (1|2|3|null) — the most urgent level of any active Bit with an approaching deadline. Consumed by Task 12 (sidebar Calendar button urgency dot).
  - **`useNodeUrgency(nodeId: string)` hook:** New hook in `src/hooks/use-node-urgency.ts`. Reactive query for child Bits of a specific Node. Returns `UrgencyLevel` of the most urgent child. Consumed by Task 14 (NodeCard urgency badge).
  - **`DeadlineConflictOverlay` component:** `src/components/shared/deadline-conflict-overlay.tsx`. Renders "Modify timeline" overlay on child items whose deadlines exceed a newly-shortened parent deadline. Consumed by Tasks 21 (Bit Detail), 25c (Node Edit Dialog), and Calendar tasks.
  - **`DeadlineConflictModal` component:** `src/components/shared/deadline-conflict-modal.tsx`. "Update parent's deadline too?" modal surfaced when a child deadline would exceed the parent. Consumed by Tasks 21 and 25c.
  - **Grid-full feedback:** When BFS returns `null` in any creation flow, surface a toast: "Grid is full. Reorganize or move items to make space." Do not open any creation dialog.
- **Acceptance:** Unit tests pass:
  - `mtime-cascade.test.ts`: chunk complete → parent Bit mtime updated → parent Node mtime updated; grid reposition does NOT update mtime
  - `deadline-hierarchy.test.ts`: child deadline past parent → blocked with conflict info; parent shortened → conflicting children identified
  - `auto-completion.test.ts`: last chunk completed → bit status flips to "complete"; chunk uncompleted → bit reverts to "active"
  - `grid-uniqueness.test.ts`: insert at occupied cell → rejected; BFS fallback finds nearest empty
  - `use-global-urgency.test.ts`: returns correct max urgency level across all active Bits
  - `use-node-urgency.test.ts`: returns correct urgency for child Bits of a given Node
- **Commit:** `feat: implement mtime cascade, deadline hierarchy, auto-completion, and grid uniqueness hooks`

### Task 25: Bit-to-Node Promotion
- **Status:** `[x]`
- **Files:** `src/lib/db/indexeddb.ts` (update)
- **Dependencies:** Task 24
- **Actions:**
  - Implement Hook 9 from SCHEMA.md as `promoteBitToNode(bitId)` on DataStore:
    - **Max-depth guard:** Before promotion, check `parentNode.level >= 3` (Nodes only exist at levels 0–3; a Bit inside a Level 3 Node cannot be promoted because the resulting Node would be Level 4, which is invalid). If guard triggers: return an error, show a toast "Cannot promote — maximum nesting depth reached.", and abort. Hide the "Promote to Node" dropdown action entirely when the Bit's parent Node is at Level 3.
    1. Create new Node: copy Bit's `title`, `icon`, `deadline`, `description`. Assign default `color`. Set `level = parentNode.level + 1` (SCHEMA.md is authoritative: Node level = parent level + 1)
    2. For each Chunk: create new Bit inside new Node. Map `chunk.title → bit.title`, `chunk.time → bit.deadline`, `chunk.timeAllDay → bit.deadlineAllDay`. Auto-place via BFS
    3. Delete original Bit and all its Chunks
  - Surface in UI: "Promote to Node" action in the Bit Detail Popup header dropdown menu (Task 21). Action is only visible when the Bit has 1+ Chunks.
- **Acceptance:** Unit tests pass:
  - `promotion.test.ts`: Bit with 3 chunks → new Node created with 3 child Bits; original Bit+Chunks deleted; child Bit deadlines match chunk times; BFS places children on grid
  - `promotion.test.ts`: Bit inside Level-3 Node → promotion blocked with error; "Promote to Node" action hidden at max depth
- **Commit:** `feat: implement bit-to-node promotion with chunk-to-bit conversion`

### Task 25a: Bit Status Toggle + Completion UI
- **Status:** `[x]`
- **Files:** `src/components/bit-detail/bit-detail-popup.tsx` (update), `src/components/grid/bit-card.tsx` (update)
- **Dependencies:** Task 21 (Bit Detail Popup), Task 24 (Hook 3 — auto-completion)
- **Actions:**
  - **Bit Detail Popup header:** Add a status toggle button (checkmark icon). Click cycles: active → complete → active. When completing: apply Hook 3 mtime cascade. When undoing: revert Bit status to `"active"`, cascade mtime
  - **Zero-Chunk Bits:** Status toggle is the only completion mechanism (no auto-completion possible). Same checkmark button
  - **Force-complete:** Toggle to complete even with incomplete Chunks. All Chunk statuses remain unchanged — only the Bit flips
  - **Undo-complete:** Toggle back to active. If Bit was auto-completed (all Chunks done), uncompleting the Bit sets `status = "active"` but does not change Chunk statuses
  - **Remove-to-trash:** "Move to trash" action in Bit Detail Popup header dropdown. Calls `DataStore.softDeleteBit(bitId)`
  - **BitCard visual:** Completed Bits show strikethrough title + gray treatment + `opacity-50`. In edit mode, completed Bits still jiggle and show delete overlay
  - **Sinking animation:** Deferred to Task 35 (Phase 7 Motion Animations). Task 35 owns `bitCompleteVariant` — a `translateY(8px) scale(0.95) opacity(0.5)` AnimatePresence exit animation on BitCard status change. Task 25a only handles the static visual state (strikethrough, gray, opacity-50).
  - **Calendar consistency:** Completed Bits in Calendar day columns (Task 27/28) render with the same gray/strikethrough treatment
- **Acceptance:**
  - Bit Detail Popup has a completion toggle button. Click completes/uncompletes
  - Zero-Chunk Bits can be completed via toggle
  - Force-complete works with incomplete Chunks (Chunk statuses unchanged)
  - Undo-complete reverts Bit to active
  - "Move to trash" action works from popup header dropdown
  - Completed BitCard shows strikethrough + gray + `opacity-50`
- **Commit:** `feat: add bit status toggle, force-complete, undo, and remove-to-trash`

### Task 25b: Level 1-2 Creation Chooser + Bit Creation Dialog
- **Status:** `[x]`
- **Files:** `src/components/grid/create-item-chooser.tsx` (new), `src/components/grid/create-bit-dialog.tsx` (new or update), `src/app/grid/[nodeId]/_components/node-grid-shell.tsx` (update)
- **Dependencies:** Task 18 (Level 1-3 Grid Page), Task 5 (DataStore)
- **Actions:**
  - `create-item-chooser.tsx`: `"use client"`. Small popover triggered by `+` button at Level 1-2. Two options: "Node" (folder icon) and "Bit" (check-square icon). Selecting "Node" opens existing `CreateNodeDialog`. Selecting "Bit" opens `CreateBitDialog`
  - `create-bit-dialog.tsx`: shadcn Dialog. Fields: title (required), icon picker (reuse `NODE_ICON_MAP`), deadline (optional date picker with "All day" toggle), priority (optional: high/mid/low/none toggle). No color field — Bit inherits parent Node color. No description — added later via Bit Detail Popup
  - `node-grid-shell.tsx` update: At Level 1-2, both sidebar `+` and empty-cell `+` open the chooser. At Level 3, `+` opens `CreateBitDialog` directly (existing behavior). At Level 0, `+` opens `CreateNodeDialog` directly (unchanged)
  - **BFS origin rule:** Node placement: BFS from `(0, 0)` (top-left). Bit placement: BFS from `(GRID_COLS-1, 0)` (top-right). Empty-cell `+` click: BFS from `(clickedX, clickedY)` regardless of type
  - **Grid-full feedback:** When BFS returns `null`, show toast: "Grid is full. Reorganize or move items to make space." Do not open the creation dialog
- **Acceptance:**
  - Level 1-2 `+` (sidebar and empty-cell) opens Node/Bit chooser popover with two options
  - Selecting "Node" → `CreateNodeDialog` → places Node via BFS from top-left
  - Selecting "Bit" → `CreateBitDialog` → places Bit via BFS from top-right
  - Level 3 `+` opens `CreateBitDialog` directly (unchanged)
  - Level 0 `+` opens `CreateNodeDialog` directly (unchanged)
  - Grid-full condition shows toast instead of opening dialog
- **Commit:** `feat: add Level 1-2 creation chooser, Bit creation dialog, and grid-full feedback`

### Task 25c: Node Property Edit Dialog
- **Status:** `[x]`
- **Files:** `src/components/grid/edit-node-dialog.tsx` (new), `src/components/grid/node-card.tsx` (update), `src/components/grid/edit-mode-overlay.tsx` (update)
- **Dependencies:** Task 14 (NodeCard), Task 20 (Edit Mode Overlay)
- **Actions:**
  - `edit-node-dialog.tsx`: `"use client"`. shadcn Dialog. Pre-populated with existing Node data. Editable fields: title, icon (icon picker), color (color input), description (textarea), deadline (date picker with "All day" toggle). Save calls `DataStore.updateNode(nodeId, changes)`
  - `node-card.tsx` update: Accept an `isEditMode` prop. When `isEditMode === true`, click opens `EditNodeDialog` instead of navigating to `/grid/[nodeId]`
  - `edit-mode-overlay.tsx` update: Pass `isEditMode={true}` to NodeCard when edit mode is active
  - **Click precedence rule:** Normal mode: click Node → navigate to `/grid/[nodeId]`. Edit mode: click Node → open `EditNodeDialog`. Bit click behavior is unchanged in both modes (popup opens regardless)
- **Acceptance:**
  - In edit mode, clicking a Node opens `EditNodeDialog` with pre-populated title, icon, color, description, deadline
  - Save persists changes via DataStore
  - In normal mode, clicking a Node still navigates (unchanged)
  - Edit-mode click on a Bit still opens the Bit Detail Popup (unchanged)
- **Commit:** `feat: add node property edit dialog with edit-mode click routing`

#### Phase 5 Notes

> **Branch verification:** Always verify branch base before writing any code. `git log --oneline origin/main..HEAD` must be empty at phase start. A branch repair was needed this phase — the `execute-next-phase` skill now enforces this check explicitly.

> **Cherry-pick repairs:** After any cherry-pick repair, verify the full expected file set against the execution plan. Tests and build passing is not sufficient — missing files may not cause immediate failures.

> **Test fakes and type casts:** When writing test fakes, verify the fake already satisfies the target interface before adding `as any`. Redundant casts become lint errors.

> **Urgency hooks — DataStore facade:** `use-node-urgency` and `use-global-urgency` were implemented with direct `{ db }` access inside `liveQuery`. The correct pattern is `liveQuery(() => indexedDBStore.method())`. Deferred to Phase 5.5.

> **Full issue log:** `docs/issues/Issues_Phase_5.md`

---

## Phase 5.5: DataStore Facade Cleanup

> **Origin:** Architecture Conformance Review — Phase 5 close-out (2026-03-28).
> `use-node-urgency.ts` and `use-global-urgency.ts` bypass the DataStore facade by importing `{ db }` directly and calling Dexie table methods inside `liveQuery`. The established pattern (confirmed in `use-grid-data.ts`) is `liveQuery(() => indexedDBStore.someMethod())`. The facade must be consistent across all reactive hooks.

### Task 25.5: DataStore Read Methods + Urgency Hook Refactor
- **Status:** `[x]`
- **Files:** `src/lib/db/datastore.ts` (update), `src/lib/db/indexeddb.ts` (update), `src/hooks/use-node-urgency.ts` (update), `src/hooks/use-global-urgency.ts` (update)
- **Dependencies:** Task 24 (use-node-urgency, use-global-urgency)
- **Actions:**
  - `datastore.ts`: Add two read methods to the `DataStore` interface:
    - `getBitsForNode(nodeId: string): Promise<Bit[]>` — returns all non-deleted Bits with `parentId === nodeId`
    - `getAllActiveBits(): Promise<Bit[]>` — returns all non-deleted Bits across the project
  - `indexeddb.ts`: Implement both methods in `IndexedDBDataStore`
  - `use-node-urgency.ts`: Replace `db.bits.where("parentId").equals(nodeId).toArray()` with `indexedDBStore.getBitsForNode(nodeId)` inside `liveQuery`. Remove `import { db }` — use `indexedDBStore` only
  - `use-global-urgency.ts`: Replace direct db query with `indexedDBStore.getAllActiveBits()` inside `liveQuery`. Remove `import { db }`
  - Grep for any remaining `import { db }` in hooks or components — fix any found
- **Acceptance:**
  - No hook or component imports `{ db }` from `indexeddb.ts`
  - `liveQuery` in all hooks calls `indexedDBStore` methods, not raw Dexie table methods
  - Architecture Conformance — Blocking (DataStore facade) passes cleanly
  - `pnpm test && pnpm build` pass
- **Commit:** `refactor: DataStore facade — add read methods, remove direct db access from urgency hooks`

#### Phase 5.5 Notes

> **vi.hoisted() for mocks:** Variables used inside a `vi.mock()` factory must be declared with `vi.hoisted()`, not `const`. `vi.mock` is hoisted to the top of the file; a plain `const` is initialized after the factory runs, causing a ReferenceError at test time. Pattern: `const myMock = vi.hoisted(() => vi.fn(...))`.

> **eslint-disable exhaustive-deps placement:** The `react-hooks/exhaustive-deps` disable comment must go on the line immediately before the closing `}, [deps])` of the useEffect — not inside the effect body. Placing it on a line inside the body (e.g., before a setState call) silences a nonexistent rule and leaves the actual warning unfixed.

> **Full issue log:** `docs/issues/Issues_Phase_5.5.md`

---

## Phase 6: Calendar Views

### Task 26: Calendar Layout + Node Pool
- **Status:** `[x]`
- **Files:** `src/app/calendar/layout.tsx`, `src/components/calendar/node-pool.tsx`, `src/components/layout/sidebar.tsx` (update)
- **Dependencies:** Task 5, Task 7 (calendar-store), Task 24 (use-global-urgency)
- **Actions:**
  - `layout.tsx`: Shared layout for `/calendar/weekly` and `/calendar/monthly`. Two-panel: left panel `w-calendar-pool` (288px, `--calendar-pool-width`) + right content area (`{children}`). Left panel split: Node pool top (60%, `--calendar-node-pool-ratio`) + Items pool bottom (40%)
    - View toggle in layout header: switches between `/calendar/weekly` and `/calendar/monthly` routes
  - `node-pool.tsx`: `"use client"`. Top section of left panel. Uses `useCalendarStore` for drill-down
    - Level 0 Nodes: icon only (tooltip on hover for title)
    - Click Node → drill down: show sub-Nodes (with `>` chevron) + Bits inside
    - Back arrow `<` to navigate up drill-down stack (`popDrillDown()`)
    - Search input within pool to filter items (case-insensitive substring match)
    - Nodes and Bits draggable to the schedule (DnD source)
    - Empty states: no L0 Nodes → "No nodes yet" placeholder. Drill-down into Node with no children → "No items" message
  - `sidebar.tsx` (update): Wire Calendar button `onClick` → `router.push("/calendar/weekly")`. Render urgency dot on Calendar icon using `useGlobalUrgency()` — small colored circle (top-right of icon, matching `--urgency-1/2/3`). Active state styling when on any `/calendar/*` route
- **Acceptance:** Calendar layout renders two-panel at correct widths. Node pool shows Level 0 icons. Drill-down navigates into Nodes. Search filters pool
- Calendar sidebar button navigates to `/calendar/weekly` and shows active state on calendar routes
- Urgency dot renders on Calendar button when any active item has deadline within 3 days
- Layout header includes a Weekly/Monthly view toggle
- Empty Node pool shows placeholder. Drill-down into empty Node shows "No items"
- **Commit:** `feat: add calendar layout with node pool and drill-down navigation`

### Task 27: Calendar:Weekly Page + Day Columns
- **Status:** `[x]`
- **Files:** `src/app/calendar/weekly/page.tsx`, `src/components/calendar/day-column.tsx`
- **Dependencies:** Task 26, Task 10 (use-calendar-data)
- **Actions:**
  - `weekly/page.tsx`: `"use client"`. Right panel: 7 day columns (Mon–Sun). Uses `useCalendarData()` with `weeklyItems(weekStart)`. Week navigation arrows + current week label. Uses `useCalendarStore` for `currentWeekStart`
  - `day-column.tsx`: Single vertical day column. Props: `date: Date`, `items: (Node | Bit | Chunk)[]`
    - Min width: `--calendar-day-min-width` (128px). Tall and scrollable
    - Empty: "Drop items here" placeholder
    - 1 item: Bit → standard Bit card. Node → Node icon with title tooltip. Chunk → compact item (same as 2+ view, since Chunks have no "standard card" design)
    - 2+ items: compact list (Task 28)
    - No-time items at top. Timed items below, sorted earliest → latest
    - Drop zone by item type: Bit → `DataStore.updateBit({ deadline: date })`, Node → `DataStore.updateNode({ deadline: date })`, Chunk → `DataStore.updateChunk({ time: date })`
    - Bit items are clickable: click appends `?bit=[bitId]` to the current URL to open Bit Detail Popup
    - Node items are clickable: click navigates to `/grid/[nodeId]`
    - Completed Bits render with strikethrough title + gray/opacity treatment (consistent with grid BitCard)
    - Overflow `+N more`: click → column expands vertically with Motion layout animation + vignette, hiding adjacent columns. Only one column can be expanded at a time — expanding one auto-collapses any other
    - Collapse: ESC or click non-item area. ESC priority: calendar column collapse is lower than Bit Detail Popup (if popup is open, ESC closes popup first)
- **Acceptance:** 7 day columns render. Items on correct days. Drop sets deadline. Overflow expands/collapses. Week navigation works
- Clicking a Bit in a day column opens Bit Detail Popup via `?bit=[bitId]`
- Completed items render with strikethrough + gray treatment
- **Commit:** `feat: add weekly calendar page with day columns and drag scheduling`

### Task 28: Compact Bit + Items Pool
- **Status:** `[x]`
- **Files:** `src/components/calendar/compact-bit-item.tsx`, `src/components/calendar/items-pool.tsx`
- **Dependencies:** Task 27, Task 10 (use-calendar-data)
- **Actions:**
  - `compact-bit-item.tsx`: Compact design for 2+ items in a day column. Per DESIGN_TOKENS:
    - `flex items-center gap-2 px-3 py-1.5 border-l-4 text-sm` with `style={{ borderLeftColor: parentColor }}`
    - `parentColor` resolution: Bit → parent Node's `color`. Chunk → grandparent Node's `color` (resolve via parent Bit's `parentId` → Node lookup)
    - Title: `flex-1 truncate text-foreground`
    - Time: `text-xs text-muted-foreground flex-shrink-0`
    - Date badge in corner when applicable
    - Clickable: Bit → click appends `?bit=[bitId]` to URL. Chunk → click appends `?bit=[chunk.parentId]` (opens parent Bit's popup). Completed state (Bit `status === "complete"` or Chunk `status === "complete"`): strikethrough + gray treatment
  - `items-pool.tsx`: `"use client"`. Bottom section of calendar left panel. Merged pool of Bits + Chunks only (Nodes are in the separate Node Pool above)
    - Sort: deadline items first (by priority rank → time), no-deadline below
    - Scrollable with search input
    - Items draggable to schedule
    - Unschedule: drag back to pool or ✗ button → Bit: `DataStore.updateBit({ deadline: null })`, Chunk: `DataStore.updateChunk({ time: null })`
- **Acceptance:** Compact items: colored left border + title + time. Pool sorts correctly. Drag to schedule works. Unschedule clears deadline
- Compact items clickable → opens Bit Detail Popup
- Completed items render with strikethrough + gray treatment
- **Commit:** `feat: add compact bit items and calendar items pool with scheduling`

### Task 29: Calendar:Monthly Page
- **Status:** `[x]`
- **Files:** `src/app/calendar/monthly/page.tsx`, `src/app/calendar/monthly/_components/month-grid.tsx`, `src/app/calendar/monthly/_components/date-cell-popover.tsx`
- **Dependencies:** Task 26, Task 10
- **Actions:**
  - `monthly/page.tsx`: `"use client"`. Same left panel as weekly (shared via calendar layout). Right panel: month calendar grid
  - `month-grid.tsx`: Standard 7-column (Mon–Sun) × weeks grid. Left/right arrows for month navigation. Month label. Uses `useCalendarStore` for `currentMonth`
    - Date cells: color indicators for scheduled items (highlight color from parent Node)
    - Drag from pools to date cells → sets deadline to that date
  - `date-cell-popover.tsx`: Click date cell → shadcn `Popover` with all items for that day in list view. Items clickable → navigate by type: Node → `/grid/[nodeId]`, Bit → `/grid/[parentId]?bit=[bitId]`, Chunk → `/grid/[grandparentId]?bit=[parentBitId]` (resolve `grandparentId` by looking up `chunk.parentId` → `Bit.parentId`)
- **Acceptance:** Month grid renders with correct day layout. Items as color indicators. Click date shows popover. Month navigation works. Drag to date sets deadline
- **Commit:** `feat: add monthly calendar page with date grid and item popovers`

### Task 30: Calendar Data Integration
- **Status:** `[x]`
- **Files:** `src/hooks/use-calendar-data.ts` (update), `src/stores/calendar-store.ts` (update), `src/hooks/use-dnd.ts` (update), `src/hooks/use-global-urgency.ts` (update), `src/app/calendar/layout.tsx` (update)
- **Dependencies:** Task 27, Task 28, Task 29
- **Actions:**
  - **DataStore facade cleanup:** Refactor `use-calendar-data.ts` and `use-global-urgency.ts` to use DataStore interface instead of direct `indexedDBStore` imports (same pattern as Phase 5.5 cleanup)
  - **Global urgency Node scanning:** Extend `useGlobalUrgency` to also scan Nodes with deadlines (SCHEMA.md "Global urgency" query specifies `bits, nodes`). Currently only scans Bits
  - Finalize `use-calendar-data.ts`: Ensure `weeklyItems` and `monthlyItems` filter active items only (`deletedAt === null`). Verify pool sort order matches SPEC (deadline first by priority rank, then no-deadline)
  - Finalize `calendar-store.ts`: Wire `navigateWeek` / `navigateMonth` to update `currentWeekStart` / `currentMonth` using `date-fns` (`addWeeks`, `addMonths`)
  - **DnD calendar scheduling** (`use-dnd.ts`): Implement calendar scheduling in `handleDragEnd` — detect drop target as day column or date cell. Bit drop → `DataStore.updateBit({ deadline: targetTimestamp, mtime: Date.now() })`, Node drop → `DataStore.updateNode({ deadline: targetTimestamp, mtime: Date.now() })`, Chunk drop → `DataStore.updateChunk({ time: targetTimestamp })` (Chunk mtime cascades to parent Bit via Hook 1). Unschedule reverses: Bit/Node → clear `deadline`, Chunk → clear `time`. Implement `handleDragOver` for drop-target visual feedback
  - **Deadline conflict on DnD** (`layout.tsx` update): When `handleDragEnd` detects a Chunk drop exceeding parent Bit's deadline, set conflict state. Calendar layout mounts `DeadlineConflictModal` controlled by this state. "Update parent" → extend parent Bit's deadline to the drop date; "Cancel" → abort the drop. Conflict check via `DataStore.getBit(chunk.parentId)` to compare deadlines
  - Verify multi-view consistency (PRD Section 23): changes from calendar reflect on grid via reactive hooks
- **Acceptance:** Calendar data groups correctly. Navigation updates view. Scheduling persists to IndexedDB. Changes sync across calendar and grid views automatically
- No direct `indexedDBStore` imports remain in `use-calendar-data.ts` or `use-global-urgency.ts`
- `useGlobalUrgency` returns urgency from both Bits and Nodes with deadlines
- Dropping a Chunk past parent Bit's deadline shows `DeadlineConflictModal` in calendar layout
- DnD scheduling updates mtime (aging resets on schedule action)
- **Commit:** `feat: integrate calendar data hooks with navigation and multi-view sync`

#### Phase 6 Notes

> **Codex prompt length vs Gemini file reader:** The Gemini post-code review prompt (1950 lines of inlined file contents) triggered `ENAMETOOLONG` errors in Gemini's file reader tools. For future phases with many files, split the prompt into smaller chunks or use file references instead of inline content.

> **Component→DataStore boundary:** Codex wrote unschedule mutations directly in UI components (items-pool.tsx, day-column.tsx). Caught during conformance review and extracted into `useCalendarActions` hook. Watch for this pattern — Codex defaults to the simplest call site, not the architectural boundary.

> **Chunk color resolution:** Codex's colorMap only mapped Node and Bit IDs. Chunks (which need grandparent Node color) were falling back to the border color. Added explicit chunk→parentBit→grandparentNode resolution in use-calendar-data.ts.

> **Sidebar Trash button:** Pre-existing noop visible on calendar routes (and all L0 routes). Not a Phase 6 regression — wiring is Phase 7 Task 31.

> **Full issue log:** `docs/issues/Issues_Phase_6.md`

---

## Phase 6.5: DataStore Facade Migration

> **Purpose:** Eliminate all remaining direct `indexedDBStore` imports outside `src/lib/db/indexeddb.ts`. Phase 6 enforced the facade for all new code; this phase retrofits the 11 pre-existing files from earlier phases.

### Task 30.5: Migrate Pre-Existing Files to DataStore Facade
- **Status:** `[x]`
- **Files (hooks — read path):** `src/hooks/use-bit-detail.ts`, `src/hooks/use-grid-data.ts`, `src/hooks/use-search.ts`, `src/hooks/use-node-urgency.ts`
- **Files (components — write path):** `src/components/grid/edit-node-dialog.tsx`, `src/components/layout/breadcrumbs.tsx`, `src/components/layout/level-0-shell.tsx`, `src/components/bit-detail/chunk-timeline.tsx`, `src/components/bit-detail/bit-detail-popup.tsx`, `src/components/bit-detail/chunk-pool.tsx`, `src/app/grid/[nodeId]/_components/node-grid-shell.tsx`
- **Dependencies:** Phase 6 (established `getDataStore()` pattern and `useCalendarActions` hook pattern)
- **Actions:**
  - **Hooks (read path):** Replace `indexedDBStore` imports with `getDataStore()` inside `liveQuery` callbacks. Pattern established in `use-calendar-data.ts` and `use-global-urgency.ts`
  - **Components (write path):** Extract mutation calls into dedicated hooks (e.g., `useGridActions`, `useBitDetailActions`) following the `useCalendarActions` pattern. Components import hooks only, not DataStore
  - **Test files:** Update mocks from `indexedDBStore` to the new hook/facade pattern. Affected: `breadcrumbs.test.tsx`, `node-grid-shell.test.tsx`, `chunk-pool.test.tsx`
  - **Verification:** `grep -r "indexedDBStore" src/ --include="*.ts" --include="*.tsx"` should return only `src/lib/db/indexeddb.ts` (the implementation) and `src/lib/db/datastore.ts` (the lazy loader)
- **Acceptance:** Zero `indexedDBStore` imports outside `indexeddb.ts` and `datastore.ts`. All architecture conformance blocking checks pass. Build + test green
- **Commit:** `refactor: complete DataStore facade migration — remove all direct indexedDBStore imports`

#### Phase 6.5 Notes

> **Boundary enforcement is two-layered:** Eliminating `indexedDBStore` imports is necessary but not sufficient. Two components (`breadcrumbs.tsx`, `node-grid-shell.tsx`) still violated the "components import hooks only" rule via `getDataStore()` after the initial Codex pass. Full conformance required a second extraction round creating `useNode` and `useBreadcrumbChain`.

> **Action hook scope:** Each action hook maps to one component's write surface. Don't merge unrelated mutations into a single hook for "convenience" — `useChunkActions`, `useBitDetailActions`, `useNodeActions`, `useGridActions` each have clear ownership.

> **Test mock strategy:** After hook extraction, component tests mock at the hook boundary (not `indexeddb` or `datastore`). The chain-walking logic in `useBreadcrumbChain` is no longer tested at the component level — if needed, add a dedicated hook unit test in a future phase.

> **Full issue log:** `docs/issues/Issues_Phase_6.5.md`

---

## Phase 7: Trash, Search + Polish

### Task 31: Trash Page
- **Status:** `[x]`
- **Files:** `src/app/trash/page.tsx`, `src/components/trash/trash-list.tsx`, `src/components/trash/trash-group.tsx`, `src/hooks/use-trash-data.ts` (new)
- **Dependencies:** Task 5 (DataStore). **Note:** Task 31 UI (restore/delete buttons) functionally depends on Task 32's cascade hooks being implemented. Build Task 32 first or implement Task 31 and Task 32 together.
- **Actions:**
  - Wire Trash sidebar button in `sidebar.tsx` → navigates to `/trash`
  - `src/hooks/use-trash-data.ts`: New reactive hook. Internally wraps `liveQuery(() => getDataStore().getTrashedItems())`. Returns `{ items: { nodes: Node[], bits: Bit[] }, isLoading: boolean }`. Items are returned flat; grouping is done in `trash-list.tsx`. Follows the same hook boundary rules as all other hooks — no direct DataStore or Dexie imports in the component
  - `trash/page.tsx`: `"use client"`. List view with sidebar (no grid). Uses `useTrashData()`
  - `trash-list.tsx`: Renders all trashed items grouped by top-level parent Node. Global "Empty trash" button → shadcn `AlertDialog` confirmation ("This will permanently delete all trashed items. This cannot be undone.") → on confirm, permanently delete all trashed items. Groups expand independently (not accordion — multiple groups can be open simultaneously)
  - `trash-group.tsx`: Deleted Node shows as single entry with child count indicator ("Work — 3 Nodes, 8 Bits"). Click to expand/collapse children (independent — expanding one does not collapse others)
    - Per-item actions: Restore button, Delete permanently button
    - "Delete permanently" → shadcn `AlertDialog` confirmation before calling hard-delete. "This cannot be undone."
    - Retention label: `text-xs text-muted-foreground` — "X days until permanent deletion" from `deletedAt + 30 days - Date.now()`
  - Restore behavior: returns to original parent grid. BFS nearest-empty-cell if position occupied. Auto-restores parent chain if parent also trashed. **BFS-null edge case:** if BFS returns `null` (parent grid is full), show toast "Parent grid is full. Free up space first." and abort the restore — do not move the item
- **Acceptance:** `/trash` shows trashed items grouped by parent. Expand reveals children. Multiple groups can be open simultaneously. Restore returns to grid with BFS fallback. BFS-null shows toast and aborts. Permanent delete shows AlertDialog confirmation before executing. "Empty trash" shows AlertDialog confirmation before executing. Retention countdown shows
- Trash sidebar button navigates to `/trash`
- **Commit:** `feat: add trash page with grouped view, restore, and permanent delete`

### Task 32: Cascade Delete/Restore/Cleanup Hooks
- **Status:** `[x]`
- **Files:** `src/lib/db/indexeddb.ts` (update), `src/hooks/use-trash-auto-cleanup.ts` (new)
- **Dependencies:** Task 24, Task 6 (BFS)
- **Actions:**
  - **Hook 4 — Cascade soft-delete:** Node trashed → recursively find all descendant Nodes + their Bits, set `deletedAt = Date.now()` on all. Bit trashed → trash Bit only (Chunks implicitly inaccessible via trashed parent)
  - **Hook 5 — Cascade restore:** Node restored → if parent trashed, auto-restore parent chain first (no orphans). Restore all descendants trashed in same cascade. Each restored item: BFS if original `(x, y)` occupied. Bit restored → auto-restore parent Node chain if needed. **BFS-null guard:** if BFS returns `null` for any item during restore (grid full), return an error for that item — do not silently drop it. Caller (Task 31 UI) surfaces this as a toast
  - **Hook 6 — Cascade hard-delete:** Node permanently deleted → delete Node + all descendant Nodes + all descendant Bits + all Chunks of those Bits. Bit deleted → delete Bit + all Chunks
  - **Hook 7 — Trash auto-cleanup:** On app startup and periodically (e.g., every hour): query `deletedAt < Date.now() - 30 * 86400000`. Apply Hook 6 to each match
  - **Auto-cleanup trigger:** Add `useTrashAutoCleanup` hook in `src/hooks/use-trash-auto-cleanup.ts`. Hook runs Hook 7 cleanup once on mount, then on a `setInterval` every 60 minutes. Hook is called from `providers.tsx`.
- **Acceptance:** Unit tests pass:
  - `cascade-delete.test.ts`: trash Node → all descendant Nodes + Bits get `deletedAt`; trash Bit → only that Bit trashed, Chunks untouched
  - `cascade-restore.test.ts`: restore Node with trashed parent → parent chain auto-restored; restored item at occupied cell → BFS fallback
  - `cascade-hard-delete.test.ts`: permanently delete Node → all descendants + their Chunks removed from store
  - `auto-cleanup.test.ts`: items trashed >30 days → permanently deleted on cleanup run
- **Commit:** `feat: implement cascade soft-delete, restore, hard-delete, and trash auto-cleanup`

### Task 33: Search Overlay
- **Status:** `[x]`
- **Files:** `src/components/layout/search-overlay.tsx`
- **Dependencies:** Task 10 (use-search), Task 7 (search-store)
- **Actions:**
  - `search-overlay.tsx`: `"use client"`. Uses `useSearchStore` + `useSearch()`. Motion entry via `searchOverlayVariants`. Per DESIGN_TOKENS:
    - Backdrop: `fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]`
    - Container: `w-full max-w-search-overlay bg-popover rounded-xl border border-border shadow-2xl overflow-hidden`
    - Input: `flex items-center gap-3 px-4 py-3 border-b border-border`. Search icon `w-5 h-5 text-muted-foreground`. Input field `flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base` with `autoFocus`
    - Results: `max-h-[50vh] overflow-y-auto py-2`. Each: `flex items-center gap-3 px-4 py-2.5 hover:bg-accent cursor-pointer transition-colors`. Type icon `w-4 h-4 text-muted-foreground`, title `text-sm font-medium text-foreground truncate`, path `text-xs text-muted-foreground truncate`, deadline
  - Trigger: sidebar Search button or `Cmd/Ctrl+K` shortcut. Keyboard handler calls `e.preventDefault()` to prevent browser address-bar focus; fires regardless of current focus target
  - Click result → navigate to item's grid location and close overlay:
    - Node result: navigate to `/grid/[nodeId]`
    - Bit result: navigate to `/grid/[parentNodeId]?bit=[bitId]`
    - Chunk result: navigate to `/grid/[grandparentNodeId]?bit=[parentBitId]`
  - **`SearchResult` type update** (in `use-search.ts` AND `datastore.ts` AND `indexeddb.ts`): Added `parentNodeId: string` for Bit results; added `parentBitId: string` and `grandparentNodeId: string` for Chunk results. `searchAll` returns these ID fields alongside `parentPath: string[]`
  - **Empty states:** (a) No query entered → show placeholder text "Search nodes, bits, and chunks…" with a search icon; no results list rendered. (b) Query entered but no matches → show "No results for '[query]'" message centered in the results area
  - **ESC implementation:** Search overlay's ESC handler calls `e.stopPropagation()` after closing, preventing the event from reaching lower-priority handlers (bit detail popup, calendar column expand, edit mode). This is the mechanism for the ESC priority rule in Cross-Cutting Concerns
  - Scope: case-insensitive substring across active nodes, bits, chunks titles
- **Acceptance:** Search opens via sidebar button or Cmd+K. `e.preventDefault()` prevents browser focus steal. Real-time filtering. Empty state shows placeholder when no query; "No results" message when query has no matches. Results show type + parent path. Click navigates and closes. ESC/backdrop closes
- ESC closes overlay (highest priority — before bit detail popup, calendar expand, edit mode); `stopPropagation` prevents lower handlers from firing
- Chunk results navigate to correct grandparent grid with bit popup open
- **Commit:** `feat: add search overlay with real-time filtering and keyboard shortcut`

### Task 34: DnD Grid Interactions
- **Status:** `[x]`
- **Files:** `src/hooks/use-dnd.ts` (update), `src/components/grid/grid-view.tsx` (update)
- **Dependencies:** Task 10, Task 13, Task 20
- **Actions:**
  - Finalize `use-dnd.ts` with full interaction handlers:
    - **Grid reposition (edit mode):** Drag item to empty cell → `DataStore.updateNode/Bit({ x, y })`. Magnet snap via `magnetSnapTransition` (spring: damping ~15, stiffness ~200)
    - **Drag-into-Node:** Drag Bit/Node over a Node card → "suck" spring animation → move item to child grid of target Node with BFS auto-placement
    - **Drag-to-breadcrumb:** Drag item onto breadcrumb segment → move item to that ancestor's grid with BFS
  - Visual feedback: dragged item opacity 0.5, valid drop zones get highlight border
  - @dnd-kit pointer sensor with 8px activation distance (prevents click interference)
- **Acceptance:** Items repositionable in edit mode with snap animation. Drag-into-Node moves to child grid. Drag-to-breadcrumb moves to ancestor. Visual feedback during drag
- **Deferred:** "Move to..." tree browser menu (PRD Section 20.3) — explicitly deferred to v1.1 / PRD Section 26 scope. Not part of this task.
- **Commit:** `feat: implement grid drag interactions with magnet snap and node drop`

### Task 35: Motion Animations
- **Status:** `[x]`
- **Files:** `src/lib/animations/grid.ts` (update), `src/lib/animations/layout.ts` (update), `src/components/grid/grid-view.tsx` (update), `src/components/layout/sidebar.tsx` (update), `src/components/bit-detail/bit-detail-popup.tsx` (update)
- **Dependencies:** Task 8, Task 19
- **Actions:**
  - **Sinking completion:** Bit status → `"complete"` → Motion `AnimatePresence` exit variant: `translateY(8px) scale(0.95) opacity(0.5)` (`sink-fade 0.5s ease-out forwards`). Card sinks below grid and fades
  - **Task tossing:** Drag into Node → spring animation with overshoot. Item visually "thrown" into Node icon
  - **Magnet snap:** Grid and calendar drops snap with spring transition
  - **Sidebar fold/unfold:** Motion layout animation on width change (`w-sidebar` ↔ `w-sidebar-collapsed`). `sidebarVariants` defined in `src/lib/animations/layout.ts`: width transition between `var(--sidebar-width)` (224px) and `var(--sidebar-collapsed-width)` (56px)
  - **Search overlay:** Fade + scale entry/exit via `searchOverlayVariants` (already defined in `layout.ts` — wire it in `search-overlay.tsx`)
  - **Bit detail popup:** Fade + slide-up entry, slide-down + fade exit via `bitDetailPopupVariants`. Canonical definition in `layout.ts` (y: 16, no scale — bit detail is a layout-level overlay). `sinkingVariants`, `taskTossVariants`, `magnetSnapTransition`, and `vignetteVariants` remain in `grid.ts`
  - **Floating idle:** Optional CSS `animate-float` on idle nodes (PRD mentions ON/OFF toggle)
  - All animations respect `prefers-reduced-motion` media query
- **Acceptance:** Completion sinks card. Drag-into-Node tosses. Sidebar animates fold. Popups animate. `prefers-reduced-motion` disables all
- **Commit:** `feat: add Motion animations for completion, tossing, sidebar, and popups`

#### Phase 7 Notes

> **Derived state over effect:** When a selected-index needs to reset on query/open changes, compute it inline from `{ query, index }` state rather than syncing via `useEffect`. Avoids `react-hooks/set-state-in-effect` and removes a render cycle.

> **Codex hook boundary check:** After each Codex run, grep for `getDataStore()` in `src/components/`. Any hit is a boundary violation — extract a hook before integration.

> **Trash child-type grouping:** dnd-kit and multi-child-type trees require explicit per-type grouping in the prompt. "Group children" is ambiguous — write "group child nodes AND bits under deleted parent nodes separately."

> **dnd-kit edit-mode gating:** Always include `disabled: !isEditMode` in Codex prompts for `useDraggable`/`useDroppable`. It is not inferred from "edit mode only."

> **Hook parameter vs. store import:** Hooks must not read Zustand stores. Pass data as parameters instead. Flag this in Codex prompts: "hooks accept data as parameters; they do not import stores."

> **liveQuery is allowed in hooks:** The conformance standard was amended to explicitly permit `liveQuery` imports in `src/hooks/*.ts`. This is the intended reactive-layer pattern — only structural Dexie usage (table access, schema) is blocked outside `indexeddb.ts`.

> **liveQuery initialization guard vs. loading UX:** `isLoading` flags used to suppress premature empty-state renders while `liveQuery` hydrates are not optimistic-UI violations. The conformance checklist should distinguish initialization guards (`isLoading ? null : <Component />`) from user-visible loading UX (spinners, skeletons). The former is acceptable; the latter is not.

> **Full issue log:** `docs/issues/Issues_Phase_7.md`

---

## Cross-Cutting Concerns

These apply across all phases:

- **Two-layer data abstraction (critical PRD constraint):** Data access has two independent abstraction boundaries, both replaceable for v2 cloud sync:
  1. **CRUD layer — DataStore interface** (`src/lib/db/datastore.ts`): All write operations (create, update, delete) go through this interface. v1 implementation: `src/lib/db/indexeddb.ts`.
  2. **Reactive layer — custom hooks** (`src/hooks/use-*.ts`): All read subscriptions go through these hooks. v1 implementation uses Dexie `useLiveQuery` internally. Components never import DataStore or Dexie directly — they import hooks only.
  - For v2 migration: swap the DataStore implementation (e.g., to Supabase) AND swap the reactive internals (e.g., `useLiveQuery` → React Query). Component code stays unchanged.
- **Design tokens:** Use semantic classes from DESIGN_TOKENS.md. All colors via CSS variables — no hardcoded hex. Reference: `bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-muted-foreground`, `bg-priority-{high,mid,low}-bg`, `text-priority-{high,mid,low}`, `bg-urgency-{1,2,3}`.
- **Computed values:** Aging state, urgency level, node completion, bit progress — computed at render time via pure utility functions. Never stored in the database (SPEC decision #6).
- **URL-driven state:** Grid level via route (`/`, `/grid/[nodeId]`). Bit detail via query param (`?bit=[bitId]`). Browser back/forward navigation works naturally.
- **Reactive updates:** All data reads via custom hooks (internally `useLiveQuery` in v1). Write to store → all subscribed components auto-update. No manual cache invalidation, no optimistic rollback (SPEC decision #11).
- **Zod at write boundary:** Validate data with Zod schemas on create/update operations. Data read from the store is trusted — no runtime validation on reads (SPEC decision #7).
- **Grid cell uniqueness (Hook 8):** Always check `(parentId, x, y)` occupancy before insert or move. BFS auto-placement as fallback when position is occupied.
- **Testing:** Vitest for unit tests. Pure utility functions (T6) and application hooks (T24, T25, T32) require passing unit tests as acceptance criteria. Test files co-located with source: `src/lib/utils/*.test.ts`, `src/lib/db/*.test.ts`.
- **Accessibility:** `prefers-reduced-motion` disables all animations. Focus management on modals (search overlay, bit detail, dialogs). `aria-labels` on icon-only sidebar buttons. Keyboard navigation for search results.
- **ESC key priority (innermost-first):** Search overlay > Bit detail popup > Calendar column expand > Edit mode. **Implementation:** The search overlay handler (highest priority) calls `e.stopPropagation()` after closing, preventing the event from reaching lower handlers. Each lower handler checks its own open state before consuming the event. Owned by Task 33 (search overlay) — the stopPropagation pattern must be in place before lower-priority handlers can be considered correct.
- **BFS origin rule:** Node creation: BFS from `(0, 0)` (top-left corner). Bit creation: BFS from `(GRID_COLS-1, 0)` (top-right corner). Empty-cell `+` click: BFS from `(clickedX, clickedY)` regardless of type — returns the clicked cell if empty, nearest fallback if occupied.
- **Non-features (PRD Section 26):** Do NOT implement: Mascot System, Labs, AI-Powered Search, Responsive Design, Onboarding Enhancement. These are explicitly deferred.
- **Doc authority:** SCHEMA.md = data model source of truth. SPEC.md = architecture/routes/components. DESIGN_TOKENS.md = visual values. This file = execution order. PRD = historical context, non-authoritative for implementation.

#### Phase 7 Defer Notes

> **Explicitly deferred polish items (not in Phase 7 scope):**
> - Folded sidebar red highlight + scale animation (PRD Section 16, line 494-495) — Phase 7 if time permits
> - Breadcrumb subtitle expand option (PRD Section 6, line 197) — Phase 7 if time permits
> - Floating animation ON/OFF toggle settings (PRD Section 25, line 2130) — settings UI is out of scope for v1
> - "Neglected" dust/noise texture (PRD Section 10, line 306) — Phase 7 if time permits or defer to Section 26
> - NodeCard icon container minor size discrepancy (52px vs 56px spec) — Phase 7 Polish
> - Sidebar button/icon sizing discrepancies — Phase 7 Polish
> - DeadlineConflictOverlay integration in calendar compact items — overlay exists and works in grid views; calendar items update reactively but don't show the in-context "Modify timeline" prompt. Phase 7 if time permits.

---

## Phase 8: Bit Detail Surface Refinement (Pilot)

> **Purpose:** Redesign the Bit Detail surface toward `references/bitdetail0.png` via the `/reference-redesign` skill. Test whether a recipe-driven approach improves implementation fidelity.
> **Recipe:** `docs/DESIGN_TOKENS.md` § Surface Recipes → Bit Detail Surface
> **Approved recipe session:** produced via `/reference-redesign references/bitdetail0.png` — see `docs/reviews/phase-8-workflow-pilot-record.md`
> **Gap review:** `docs/reviews/phase-8-bit-detail-gap-review.md`
> **Pilot record:** `docs/reviews/phase-8-workflow-pilot-record.md`
> **Pilot scope:** Bit Detail popup only. No other surfaces.
> **Pilot question:** Does a recipe-driven approach reduce visual ambiguity and improve layout fidelity compared to previous phases?

### Task 36: Header + Metadata Bar Restructure
- **Status:** `[x]`
- **Files:** `src/components/bit-detail/bit-detail-popup.tsx`
- **Dependencies:** Phase 7 complete
- **Recipe:** `docs/DESIGN_TOKENS.md` § Bit Detail Surface → Header Row, Priority + Meta Row, Description (Collapsed by Default)
- **Actions:**
  - Restructure header row per recipe:
    - Left: icon picker (h-9 w-9, existing popover, flex-shrink-0) + title (text-lg font-semibold, flex-1 min-w-0 truncate)
    - Right: status toggle (h-7 w-7) + more menu (h-7 w-7) only — no progress ring here
    - Header remains single-line. Title truncates; right controls do not shrink.
  - Replace metadata bar with chip-based layout (px-5 pt-1.5):
    - Priority pill leftmost (existing cycling behavior, existing styles)
    - When deadline is set: date chip (Calendar icon + date text + × to clear) + time chip (hidden if all-day) + ALL toggle pill
    - When deadline is null: "Add date" button (Calendar icon + text)
    - Edit state on chip click: existing date/time inputs + ALL toggle, dismiss on blur/ESC
  - Description: collapsed by default (existing behavior — no change needed)
- **Acceptance:**
  - Header: icon picker left of title; status toggle and more menu right; no progress ring in header
  - Title truncates at tight widths; right controls do not shrink
  - Metadata bar: priority pill leftmost, then deadline chips when set
  - Date chip has × button that clears deadline immediately
  - Time chip hidden when all-day is active
  - ALL pill toggles all-day; active state uses primary color
  - "Add date" button shown when no deadline set
  - Chip click → edit state; blur/ESC → returns to chip display
  - Priority cycling, status toggle, icon picker, promote, trash all still work
  - `pnpm build` passes

### Task 37: Steps Section Unification + ChunkTimeline Removal + Deadline Footer
- **Status:** `[x]`
- **Files:** `src/components/bit-detail/chunk-item.tsx` (update), `src/components/bit-detail/chunk-pool.tsx` (update), `src/components/bit-detail/chunk-timeline.tsx` (delete), `src/components/bit-detail/bit-detail-popup.tsx` (update integration)
- **Dependencies:** Task 36
- **Recipe:** `docs/DESIGN_TOKENS.md` § Bit Detail Surface → Steps Header Row, Chunk Area, Step Item, Deadline Footer, Empty State
- **Actions:**
  - Add steps header row above chunk area in `bit-detail-popup.tsx`:
    - `flex items-center justify-between px-5 pt-3 pb-0`
    - Left: "Add a step" button (Plus icon, existing styling from ChunkPool) — move trigger here
    - Right: progress ring SVG (moved from header, hidden when totalChunks === 0)
  - Update `chunk-pool.tsx` to render all chunks as a unified list:
    - Remove the `time === null` filter — all chunks render in ChunkPool
    - Sort by `chunk.order` (manual order) — no time-based sorting
    - Remove the "Add a step" button from ChunkPool's own render (it moves to steps header row)
    - DnD context wraps all chunks
  - Update `chunk-item.tsx` step item visual:
    - Remove bordered card wrapper (no border, no bg-background, no px-3 py-2)
    - Render: dot + text + optional time sub-label (gap-3, pb-5)
    - Dot: w-3.5 h-3.5. Complete: bg-primary. Incomplete: border-2 border-muted-foreground/40
    - Title: text-sm. Complete: line-through text-muted-foreground
    - Time sub-label (when chunk.time set): text-xs text-muted-foreground mt-0.5
    - Drag handle + delete: opacity-0, opacity-100 on parent hover
  - Delete `chunk-timeline.tsx` — remove all imports and usage from `bit-detail-popup.tsx`
  - Add deadline footer in `bit-detail-popup.tsx` below chunk area:
    - `flex items-center gap-2 px-5 pb-5`
    - Clock h-4 w-4 text-destructive + formatted deadline text-sm text-destructive
    - Hidden when `bit.deadline === null`
  - Adjust chunk area container: pl-6, connecting line at `left-[11px]`
- **Acceptance:**
  - Steps header row renders above the step list: "Add a step" left, progress ring right
  - All chunks (timed and untimed) appear in a single unified list ordered by `chunk.order`
  - No separate timed-step section exists
  - Timed steps show time as sub-label below their text
  - Step items: no card wrapper, dot + text + optional sub-label only
  - Complete steps: line-through + muted; incomplete dots: hollow outline
  - Drag reorder, inline edit, toggle complete, delete all still work for all steps
  - `chunk-timeline.tsx` is deleted; no import errors
  - Deadline footer renders in red below chunk area when deadline is set; hidden when null
  - Empty state renders correctly (line stub + hollow dot)
  - `pnpm test && pnpm build` pass

### Task 38: Bit Detail Spacing + Visual Polish
- **Status:** `[x]`
- **Files:** `src/components/bit-detail/bit-detail-popup.tsx`, `src/components/bit-detail/chunk-pool.tsx`, `src/components/bit-detail/chunk-item.tsx`
- **Dependencies:** Task 37
- **Recipe:** `docs/DESIGN_TOKENS.md` § Bit Detail Surface (all subsections — final pass)
- **Actions:**
  - Audit all padding, gaps, and spacing against recipe values:
    - Header: px-5 pt-5 pb-0
    - Metadata bar: px-5 pt-1.5 pb-0
    - Steps header row: px-5 pt-3 pb-0
    - Chunk area: px-5 pt-2 pb-5, pl-6 internal offset
    - Step items: pb-5 between items, gap-3 between dot and content
    - Deadline footer: px-5 pb-5
    - Connecting line: left-[11px] (centered on 14px dot)
  - Verify dot sizes (w-3.5 h-3.5 = 14px) and connecting line alignment
  - Verify dark mode: all recipe elements use semantic tokens, no hardcoded values
  - Run visual comparison against `references/bitdetail0.png` for layout fidelity
- **Acceptance:**
  - Padding and spacing match recipe values across all zones
  - Step dot centers align with connecting line
  - Dark mode renders correctly with token-based colors
  - Overall visual density and hierarchy approximate `references/bitdetail0.png`
  - `pnpm test && pnpm build` pass

#### Phase 8 Pilot Notes

> **Pilot context:** Phase 8 tests whether adding a precise surface recipe to DESIGN_TOKENS.md improves implementation fidelity for the Bit Detail surface.
>
> **What this pilot measures:**
> - Did the recipe reduce ambiguity during implementation?
> - Did implementation fidelity improve compared to previous phases?
> - Was one closing-phase screenshot review sufficient to catch visual deviations?
>
> **Verification approach:** No per-task evaluator loop. At closing, screenshot the Bit Detail surface and compare against the recipe and `references/bitdetail0.png`. Fix clear deviations only.
>
> **Structural decisions deferred:** Component-level merge of the chunk area is not part of this pilot. If visual continuity reveals that a structural merge is needed, that decision is revisited post-pilot.
>
> **Required post-phase output:** Before Phase 8 is considered fully complete, update `docs/reviews/phase-8-workflow-pilot-record.md` with final findings and write a workflow update recommendation based on the evidence gathered during this pilot.
>
> **Pilot verdict:** Adopt the recipe pattern with changes. Geometric recipes eliminate layout guesswork. Gemini pre/post-code reviews caught 6 real issues (3 HIGH, 3 MEDIUM). Key gaps: no interaction state table, no geometry validation step, no component ownership notes.
>
> **Recipe geometry rule:** `left-[X]` inside a `pl-N` container must satisfy `X = padding-left + (dot-width / 2)`. Validate before implementation.
>
> **Component ownership:** Put a one-line ownership note in the recipe for each component boundary. Prevents duplicate-render bugs invisible to screenshot review.
>
> **Pilot record update discipline:** The running record must be updated after each task commit — not retroactively. Make it a structural CCG checkpoint.
>
> **Full issue log:** `docs/issues/Issues_Phase_8.md`
> **Workflow update recommendation:** `docs/reviews/phase-8-workflow-pilot-record.md` §13

---

## Phase 9: Grid UX Improvements

> **Purpose:** Fix broken delete buttons, restructure grid layout architecture with route-group + GridRuntime, fix DnD collision resolution, enable DnD outside edit mode, improve create dialogs, add visual polish, close-out DnD reliability + visual polish refinements, and amend grid interaction/visual policy per the consolidated UX proposal (Tasks 48–53).
> **Branch:** `phase-9/grid-ux-improvements`
> **Canonical refs:** SPEC.md § Phase 9 PRD Departures, § Page Layouts, § Routes; DESIGN_TOKENS.md § Level Depth Backgrounds, § Sidebar
> **PRD departures:** 4 intentional departures from the PRD documented in SPEC.md § Phase 9 PRD Departures

### Task 39: Delete Buttons + Confirmation Modal
- **Status:** `[x]`
- **Files:** `src/hooks/use-grid-actions.ts` (update), `src/components/grid/delete-confirm-dialog.tsx` (create), `src/components/grid/node-card.tsx` (update), `src/components/grid/bit-card.tsx` (update), `src/components/grid/grid-view.tsx` (update)
- **Dependencies:** Phase 8 complete
- **Actions:**
  - Add `softDeleteNode` and `softDeleteBit` callbacks to `use-grid-actions.ts`, calling through to `DataStore.softDeleteNode` / `DataStore.softDeleteBit`
  - Create `delete-confirm-dialog.tsx` using shadcn `AlertDialog`. Accepts `pendingDelete: { id: string; type: "node" | "bit"; title: string } | null`, `onConfirm`, `onCancel`. Node delete copy warns about cascade ("and all its child nodes and bits"). Destructive variant on confirm button
  - Add `onDelete` callback prop to `NodeCard` and `BitCard`. X button calls `onDelete(item)` with `event.stopPropagation()` preserved
  - In `GridView`: add `pendingDelete` state, `handleDeleteRequest` (stages the pending delete from any grid item), `handleDeleteConfirm` (calls appropriate soft-delete action). Pass `onDelete={handleDeleteRequest}` through `DraggableNodeCard` and `DraggableBitCard` to the card components. Render `DeleteConfirmDialog` at the end of the component
- **Acceptance:**
  - In edit mode, clicking X on a node shows confirmation dialog with cascade warning text
  - In edit mode, clicking X on a bit shows confirmation dialog with simple warning text
  - Confirming deletes the item (disappears from grid via `useLiveQuery` reactivity)
  - Cancelling closes the dialog, item stays
  - Clicking X does not trigger card click/navigation
  - `pnpm build` passes

### Task 40: Route-Group Grid Layout + GridRuntime
- **Status:** `[x]`
- **Files:** `src/lib/utils/color.ts` (create), `src/components/layout/add-flow-context.tsx` (create), `src/components/layout/grid-runtime.tsx` (create), `src/app/(grid)/layout.tsx` (create), `src/app/(grid)/page.tsx` (create), `src/app/(grid)/grid/[nodeId]/page.tsx` (create), `src/app/page.tsx` (delete), `src/app/grid/[nodeId]/page.tsx` (delete), `src/components/layout/level-0-shell.tsx` (delete), `src/app/grid/[nodeId]/_components/node-grid-shell.tsx` (delete)
- **Dependencies:** Task 39
- **Actions:**
  - Extract `hexToHsl` from `level-0-shell.tsx` (duplicated in `node-grid-shell.tsx`) to `src/lib/utils/color.ts` as a shared utility
  - Create `add-flow-context.tsx` with minimal context: `AddFlowProvider` and `useAddFlow()` hook exposing `openAddAtCell(x: number, y: number)`
  - Create `grid-runtime.tsx` — single client component that consolidates logic from both shell components:
    - Route state: `nodeId = useParams().nodeId ?? null`. Call `useNode(nodeId)` only when non-null. `displayLevel = nodeId === null ? 0 : (node?.level ?? 0) + 1`. `isLeafLevel = displayLevel >= 3`
    - Renders `Sidebar` (passes `onAddClick` and `level`), `Breadcrumbs` (passes `nodeId`), `AddFlowProvider`, `DndContext` boundary, `EditModeOverlay`, all create dialogs (chooser, node, bit)
    - Add-flow orchestration: sidebar + calls `openAdd({ mode: "auto" })`. Pages call `openAddAtCell(x, y)` via context. Level-based rules: L0 → node only, L1-2 → chooser, L3 → bit only
    - BFS origin inset: nodes from `(1, 1)`, bits from `(GRID_COLS - 2, 1)` instead of `(0, 0)` / `(GRID_COLS - 1, 0)`
    - No `p-4` on content wrapper (padding gap removed per design spec)
  - Create `src/app/(grid)/layout.tsx` — server layout that renders `GridRuntime`
  - Create `src/app/(grid)/page.tsx` — thin Level 0 page: renders `GridView` + `OnboardingHints`, calls `useAddFlow().openAddAtCell`
  - Create `src/app/(grid)/grid/[nodeId]/page.tsx` — thin Node grid page: renders `GridView` + `EditNodeDialog`, calls `useAddFlow().openAddAtCell`
  - Delete `src/app/page.tsx`, `src/app/grid/[nodeId]/page.tsx`, `src/components/layout/level-0-shell.tsx`, `src/app/grid/[nodeId]/_components/node-grid-shell.tsx` (and `_components/` directory if empty)
- **Acceptance:**
  - Routes `/` and `/grid/[nodeId]` resolve correctly under `(grid)` route group
  - GridRuntime mounts once — no remount flash when navigating between grid levels
  - Sidebar + button opens correct dialog based on level (L0: node, L1-2: chooser, L3: bit)
  - Empty cell + button opens correct dialog at the clicked cell position
  - Grid content fills available space with no padding gap
  - Old shell files (`level-0-shell.tsx`, `node-grid-shell.tsx`) and old page files deleted, no import errors
  - `pnpm build` passes

### Task 41: Sidebar Redesign + Breadcrumb Cleanup
- **Status:** `[x]`
- **Files:** `src/components/layout/sidebar.tsx` (update), `src/components/layout/breadcrumbs.tsx` (update), `src/stores/sidebar-store.ts` (delete)
- **Dependencies:** Task 40
- **Actions:**
  - Rewrite `sidebar.tsx` as a fixed icon rail (`w-12` / 48px). Remove all fold/unfold logic, `useSidebarStore` usage, and `motion` expand/collapse animations
    - Icons top: + (add), Pencil (edit mode toggle), Search, Calendar
    - Icons bottom (mt-auto): Trash, Theme toggle (moon/sun)
    - Each button: `w-10 h-10 flex items-center justify-center rounded-lg`
    - Active state: highlighted when on route (calendar, trash) or mode active (edit)
    - Trash icon visible on all levels (PRD departure #4)
    - Accept `onAddClick` prop (from GridRuntime) and `level` prop
    - Keep `useEditModeStore`, `useSearchStore`, `usePathname`, `globalUrgency` calendar badge
  - Update `breadcrumbs.tsx` to accept `nodeId: string | null`. When `nodeId === null`, render root-only state showing "Home" with no navigation segments. Guard `useBreadcrumbChain` call — only call when `nodeId` is not null
  - Delete `src/stores/sidebar-store.ts` (only imported by `sidebar.tsx`, no longer needed)
  - Update `main` content margin from `ml-[14rem]` to `ml-12` (3rem) wherever the sidebar margin is applied
- **Acceptance:**
  - Sidebar renders as narrow icon rail on all pages, identical across all levels
  - No fold/unfold mechanism exists
  - Trash icon visible at all grid levels
  - Breadcrumb shows "Home" at Level 0, full chain at deeper levels
  - Edit mode toggle, calendar/trash navigation, search all still work from sidebar
  - No TypeScript errors referencing `sidebar-store.ts` or `useSidebarStore`
  - `pnpm build` passes

### Task 42: DnD Collision Resolution + Drag-to-Child Confirmation
- **Status:** `[x]`
- **Files:** `src/lib/grid-dnd.ts` (update), `src/components/layout/grid-runtime.tsx` (update), `src/hooks/use-dnd.ts` (update), `src/components/grid/grid-view.tsx` (update)
- **Dependencies:** Task 40
- **Actions:**
  - Add `gridCollisionDetection` to `grid-dnd.ts`: runs `closestCenter`, then if any candidate has `kind === "grid-node-drop"`, filter out all `grid-cell` candidates. Otherwise fall back to `closestCenter` default
  - Update `grid-runtime.tsx` to use `gridCollisionDetection` as `DndContext` collision detection
  - Extend `DragActiveItem` type in `use-dnd.ts` to include `title: string`. Set from `event.active.data.current` in `handleDragStart`
  - Update `useDraggable` data payloads in `DraggableNodeCard` and `DraggableBitCard` (in `grid-view.tsx`) to include `title` in drag data
  - Add cycle prevention in `use-dnd.ts`: before staging a node-to-node move, walk the target node's ancestor chain via `parentId`. If the dragged node's ID appears, block with `toast.error("Cannot move a node into its own descendant.")`
  - Add `pendingNodeMove` state to `use-dnd.ts`: `{ itemId, itemType, itemTitle, targetNodeId, targetNodeTitle } | null`. On `grid-node-drop`, stage confirmation instead of executing mutation directly. Add `handleNodeMoveConfirm` (executes existing BFS placement + parentId update logic) and `handleNodeMoveCancel`
  - Render move confirmation dialog in `grid-runtime.tsx` using the exposed `pendingNodeMove` state. Title: "Move into '{targetNodeTitle}'?", Body: "'{itemTitle}' will be moved into this node.", Actions: Cancel / Move
- **Acceptance:**
  - Dragging an item onto a node card reliably triggers the node-drop flow (not the grid-cell flow)
  - Confirmation dialog appears before executing drag-to-child move
  - Cycle prevention blocks moving a node into its own descendant with a toast error
  - Confirming the move places the item in the target node's grid via BFS
  - Cancelling clears the pending state, item returns to original position
  - `pnpm build` passes

### Task 43: Enable DnD Outside Edit Mode
- **Status:** `[x]`
- **Files:** `src/components/grid/grid-view.tsx` (update)
- **Dependencies:** Task 42
- **Actions:**
  - Merge `EditableGridDropCell` and `StaticGridCell` into a single `GridDropCell` that is always droppable. Visual edit-mode affordances (dotted borders, jiggle, X buttons, + icon) remain edit-mode-only
  - Remove `disabled: !isEditMode` from `useDraggable` in both `DraggableNodeCard` and `DraggableBitCard`. Activation constraints already exist (`distance: 8` mouse, `delay: 250` touch)
  - Remove `disabled: !isEditMode` from `useDroppable` in `DraggableNodeCard` (node-card drop target)
  - Confirm `breadcrumbs.tsx` still has `disabled: !isEditMode` on its droppable — breadcrumb drops remain edit-mode-only (no change needed)
  - Delete the `EditableGridDropCell` and `StaticGridCell` function definitions
- **Acceptance:**
  - Without edit mode: drag a node/bit to reposition on grid → works
  - Without edit mode: drag a node/bit onto another node → confirmation dialog appears
  - Without edit mode: drag onto breadcrumb → does NOT work (edit-mode gate preserved)
  - In edit mode: jiggle, X buttons, dotted borders, + icons all still render
  - `pnpm build` passes

### Task 44: Create Dialog Improvements
- **Status:** `[x]`
- **Files:** `src/components/ui/textarea.tsx` (create via shadcn), `src/lib/constants/color-palette.ts` (create), `src/lib/constants/node-icons.ts` (update), `src/components/grid/create-node-dialog.tsx` (update), `src/components/grid/create-bit-dialog.tsx` (update), `src/components/layout/grid-runtime.tsx` (update if types change)
- **Dependencies:** Task 40
- **Actions:**
  - Add shadcn textarea: `pnpm dlx shadcn@latest add textarea`. If command fails, create `textarea.tsx` manually matching shadcn conventions
  - Create `src/lib/constants/color-palette.ts` with 10 curated hex colors (`COLOR_PALETTE` array) and `getRandomColor()` helper. Colors: blue, red, green, amber, violet, pink, cyan, orange, indigo, teal
  - Expand `src/lib/constants/node-icons.ts` from ~25 to ~40 curated icons. Add task/project-relevant icons from Lucide: `ClipboardList`, `ListTodo`, `CalendarDays`, `Timer`, `Alarm`, `PenTool`, `Image`, `Video`, `Headphones`, `BookOpen`, `Archive`, `FolderOpen`, `Layers`, `Tag`, `Pin`
  - Update `create-node-dialog.tsx`: on closed→open transition, randomize icon (`NODE_ICON_NAMES[random]`) and color (`getRandomColor()`). Add `description` state + `<Textarea>` field below title (placeholder "Description (optional)", maxLength 500). Wire `description` through `onSubmit`. Validation errors must not reshuffle selections
  - Update `create-bit-dialog.tsx`: on closed→open transition, randomize icon. Add `description` state + `<Textarea>` (maxLength 1000). Wire `description` through `onSubmit` (update `CreateBitDialogValues` type to include `description`)
  - Update `grid-runtime.tsx` submit handlers if types changed — both already accept `description` from Task 40
- **Acceptance:**
  - Opening create node dialog shows random icon and random color (different on each open)
  - Opening create bit dialog shows random icon
  - Validation error does not reshuffle icon/color
  - Description field present and optional in both dialogs
  - Created items have description persisted (visible in edit dialog / bit detail)
  - Expanded icon grid shows ~40 icons
  - `pnpm build` passes

### Task 45: Visual Polish
- **Status:** `[x]`
- **Files:** `src/components/grid/bit-card.tsx` (update), `src/app/globals.css` (update), `src/components/grid/grid-view.tsx` (update), `src/lib/animations/grid.ts` (update), `src/components/grid/grid-cell.tsx` (update)
- **Dependencies:** Task 40
- **Actions:**
  - Bit card line-clamp-2: in `bit-card.tsx`, replace `truncate` with `line-clamp-2` on the title `<p>`. Change parent flex from `items-center` to `items-start` so icon and priority badge align to top of multi-line text
  - Level background colors: add CSS variables `--grid-bg-l0` through `--grid-bg-l3` to `globals.css` `:root` and `.dark` (values per DESIGN_TOKENS.md). In `grid-view.tsx`, apply level-aware `backgroundColor` via inline style using `hsl(var(--grid-bg-lN))`
  - Remove vignette overlay: delete the vignette `motion.div` from `grid-view.tsx`. Remove `vignetteVariants` import. Delete `vignetteVariants` export from `src/lib/animations/grid.ts`
  - Creation animation: add `creationVariants` to `grid.ts` — `initial: { scale: 0.85, opacity: 0 }`, `animate: { scale: 1, opacity: 1 }` with spring transition (`stiffness: 400, damping: 25`). Wrap node/bit cards in `AnimatePresence` + `motion.div` with these variants
  - Deletion animation: add `exit` to `creationVariants` — `{ scale: 0.9, opacity: 0, y: 8 }` with `duration: 0.2, ease: "easeIn"`
  - Square add-target: in `grid-cell.tsx`, update empty edit-mode cell affordance: wrap + button in `aspect-square w-full max-w-[4rem] m-auto` container within the cell
- **Acceptance:**
  - Bit titles wrap to 2 lines before clipping
  - Grid background color changes subtly with each level (lighter/darker progression)
  - No vignette overlay renders at any level
  - New nodes/bits animate in with a spring scale+fade
  - Deleted items animate out with a shrink+fade
  - Empty cells in edit mode show a square dotted + target centered within the rectangular cell
  - `pnpm build` passes

### Task 46: DnD Close-out
- **Status:** `[x]`
- **Files:** `src/lib/grid-dnd.ts` (modify), `src/hooks/use-dnd.ts` (modify), `src/components/grid/grid-view.tsx` (modify), `src/components/grid/grid-cell.tsx` (modify), `src/components/layout/grid-runtime.tsx` (modify), `src/lib/grid-dnd.test.ts` (test), `src/components/grid/grid-view.test.tsx` (test)
- **Dependencies:** Task 42, Task 43, Task 45
- **Actions:**
  - Replace collision detection strategy in `grid-dnd.ts`: use `pointerWithin` for `grid-node-drop` targets (pointer must be inside the node rect) and `closestCenter` for `grid-cell` targets. The current `closestCenter`-only approach over-aggressively prefers node-drop candidates from adjacent cells — this is an algorithm swap, not a threshold tuning exercise
  - Fix non-edit-mode reposition so dropping onto a valid grid cell actually moves the dragged node/bit (currently broken because collision detection routes most drops to `grid-node-drop` instead of `grid-cell`)
  - Make node-drop hover/outline appear only when the pointer is meaningfully inside the target node area
  - Preserve correct move-into confirmation when the pointer is truly over a node
  - Prevent drag interaction from expanding grid width or producing horizontal overflow during drag near the viewport edge. Start with the smallest fix: apply `overflow-x-hidden` and `min-w-0` on the grid scroll/container path. If needed, force `overflow-hidden` while a drag is active. Do not use `DragOverlay` unless container overflow clipping cannot solve the horizontal scrollbar issue without breaking drag UX
  - Show square add-target hover affordance during non-edit drag over valid empty cells
  - Add regression tests for: reposition to empty cell, move-into-node confirmation, adjacent false-positive node hover, no horizontal overflow side effects during drag where testable
- **Acceptance:**
  - Outside edit mode, dragging a node/bit to an empty cell repositions it successfully
  - Dragging near a node does not trigger node-drop outline unless the pointer is actually over the node target area
  - Dragging onto a node still opens the correct "Move into …?" confirmation
  - Dragging near the right edge does not create horizontal scroll or expand the grid container
  - Empty-cell drag hover shows the approved square add-target affordance outside edit mode
  - `pnpm test` and `pnpm build` pass

### Task 47: Visual Polish Close-out
- **Status:** `[x]`
- **Files:** `src/components/grid/grid-cell.tsx` (modify), `src/components/layout/breadcrumbs.tsx` (modify), `src/components/layout/grid-runtime.tsx` (modify if needed), `src/components/grid/node-card.tsx` (modify), `src/components/grid/create-node-dialog.tsx` (modify), `src/components/grid/create-bit-dialog.tsx` (modify), `src/lib/constants/node-icons.ts` (modify), `src/app/globals.css` (modify), `src/lib/utils/bfs.ts` (modify)
- **Dependencies:** Task 41, Task 44, Task 45, Task 46
- **Actions:**
  - Adjust BFS auto-placement origins: nodes from `(1, 1)` → `(2, 2)`; bits from `(GRID_COLS - 2, 1)` → `(GRID_COLS - 3, 2)`
  - Update grid background color to newly approved values/direction in `globals.css`
  - Remove breadcrumb subtitle rendering for node description in `breadcrumbs.tsx`. Keep node description in schema and persistence paths — this is display-only removal, not schema removal
  - Expand icon picker set to 64 curated icons in `node-icons.ts`. Keep create dialog picker layouts usable with the larger set
  - Apply visual-only node card redesign per `references/editmode.png` direction. Replace the current "colored icon box + external label" feel with a contained tile card: white/card-surface tile, softer radius and shadow, icon rendered in node color instead of inside a large solid color block, title placed inside the tile under the icon, compact single-line label treatment. Keep one-cell footprint and all existing interactions unchanged. No structural, behavioral, routing, or sizing changes
  - Refine square add-target visuals to match approved direction cleanly
  - Do not change bit long-text behavior in this task
- **Acceptance:**
  - Auto-created nodes appear at `(2, 2)` origin; bits at `(GRID_COLS - 3, 2)` origin
  - Breadcrumbs show navigation only; no node description subtitle is rendered
  - Node description still persists in data and remains editable where already supported
  - Grid background reflects the newly approved visual tuning
  - Node cards render as contained tile cards (card-surface bg, softer radius/shadow, colored icon without solid block, title inside tile) per `references/editmode.png` direction, with no changes to structure, interactions, or sizing
  - Both create dialogs expose a 64-icon picker
  - No bit long-text behavior changes
  - `pnpm test` and `pnpm build` pass

### Phase 9 Amendment: Grid Interaction + Visual Policy

> **Scope amendment:** The following tasks extend Phase 9 with grid interaction policy changes, visual language updates, and a schema-level Node description removal. These tasks continue on the existing `phase-9/grid-ux-improvements` branch and were agreed as part of the consolidated UX proposal.
>
> **Execution issues:** Work that went beyond planned task scope during Phase 9 execution is tracked in [`docs/issues/Issues_Phase_9.md`](issues/Issues_Phase_9.md). That document is the live phase execution record — root causes, changes, active architecture issues (e.g., design-token workflow vs. JS runtime sizing authority), and user-reported issues.
>
> **Explicit policies:**
> - Per-card `X` button = edit mode only (already the case after Tasks 39–47)
> - Breadcrumb ancestor move = always-on + confirmation (policy change from edit-mode-only)
> - Drag-to-delete = left sidebar center `X` target + confirmation (secondary path, does not replace Task 39)
> - Persistent edit-mode dotted overlays = removed; empty-cell creation affordance = hover-only faint plus
> - Dotted target = drag-hover only, redesigned per `references/dotted2`
> - Keep `autoScroll={false}` (confirmed direct fix for drag-right overflow)
> - Node `description` = remove from schema, forms, and persistence model (data-destructive — orphaned fields persist in IndexedDB but become inaccessible)
> - Bit card text = single-line `truncate` only; no `line-clamp-2`; text overlap not solved in this phase

### Task 48: Drag-to-Delete Target + Motion
- **Status:** `[x]`
- **Files:** `src/components/layout/sidebar.tsx` (update), `src/hooks/use-dnd.ts` (update), `src/components/layout/grid-runtime.tsx` (update), `src/lib/grid-dnd.ts` (update)
- **Dependencies:** Task 39, Task 42
- **Actions:**
  - Add `getGridDeleteDropId` helper to `grid-dnd.ts` returning a stable droppable ID string (e.g., `"grid-delete-drop"`)
  - Extend `grid-runtime.tsx` to pass `dragActiveItem` (from `useDnd`) to `Sidebar` as a new prop
  - In `sidebar.tsx`: accept optional `dragActiveItem` prop. When non-null, render a contextual `X` delete target centered vertically between the top icon group (add, pencil) and the bottom icon group (trash, theme). The target replaces/overlays the middle icons (search, calendar) during drag
    - Target sizing: same as other sidebar buttons (`flex h-10 w-10 items-center justify-center rounded-lg`)
    - Target styling: `text-destructive` with `motion-safe:animate-jiggle` (reuses existing edit-mode wiggle animation)
    - Icon: `X` from lucide-react (not `Trash2` — matches the card X delete affordance)
    - Make the target a `@dnd-kit` `useDroppable` with `id: getGridDeleteDropId()` and `data: { kind: "grid-delete-drop" }`
  - In `use-dnd.ts` `handleDragEnd`: detect `grid-delete-drop` kind. Extract `{ id, type, title }` from `event.active.data.current`. Do **not** delete directly — instead, return the pending delete data so `grid-runtime.tsx` can stage it into the existing `DeleteConfirmDialog` via `requestDelete`
  - In `grid-runtime.tsx`: when `handleDragEnd` returns a delete request from drag-to-delete, call `requestDelete({ id, type, title })` to open the existing `DeleteConfirmDialog`. No new dialog needed
- **Acceptance:**
  - While dragging a Node/Bit, sidebar shows a wiggling `X` target in the middle zone
  - `X` target does not appear when no drag is active
  - Dropping on the `X` target opens the existing delete confirmation dialog (cascade warning for Nodes, simple warning for Bits)
  - Confirming deletes the item; cancelling returns it to its original position
  - Sidebar does not widen during drag — target stays within the `w-12` rail
  - `pnpm test` and `pnpm build` pass

### Task 49: Ancestor Move Policy Change
- **Status:** `[x]`
- **Files:** `src/components/layout/breadcrumbs.tsx` (update), `src/hooks/use-dnd.ts` (update), `src/components/layout/grid-runtime.tsx` (update)
- **Dependencies:** Task 43, Task 48
- **Actions:**
  - In `breadcrumbs.tsx`: remove `disabled: !isEditMode` from `useDroppable` in `BreadcrumbSegmentButton`. Breadcrumb drops are now always-on regardless of edit mode
  - Add Bit-at-root rejection: when `nodeId` is `null` (Home segment), set `disabled: true` if the currently dragged item is a Bit. Read `dragActiveItem` from `useDnd` or accept it as a prop from `grid-runtime.tsx`. Bits cannot exist at root (`parentId` is required on Bits per schema)
  - In `use-dnd.ts` `handleDragEnd`: when a `grid-breadcrumb-drop` is detected, do **not** execute the move immediately. Instead, stage a `pendingAncestorMove` state (same pattern as `pendingNodeMove`): `{ itemId, itemType, itemTitle, targetNodeId, targetNodeTitle } | null`. Add `handleAncestorMoveConfirm` (executes BFS placement + `parentId` update) and `handleAncestorMoveCancel`
  - In `grid-runtime.tsx`: render an ancestor move confirmation dialog using `pendingAncestorMove` state. Title: `"Move to '{targetNodeTitle}'?"`. Body: `"'{itemTitle}' will be moved to this location."`. Actions: Cancel / Move. For Home target, use title `"Home"`
  - Confirmation is required for **all** ancestor moves regardless of edit mode
- **Acceptance:**
  - Without edit mode: dragging a Node/Bit onto a breadcrumb segment shows confirmation dialog
  - In edit mode: same behavior — confirmation always required
  - Confirming moves the item to the target ancestor's grid via BFS nearest empty cell
  - Cancelling clears the pending state, item returns to original position
  - Dragging a Bit onto the Home breadcrumb segment is rejected (disabled drop target)
  - Dragging a Node onto Home works and shows confirmation
  - `pnpm test` and `pnpm build` pass

### Task 50: Dotted Area Redesign + Hover-only Plus
- **Status:** `[x]`
- **Files:** `src/components/grid/grid-cell.tsx` (update), `src/components/grid/grid-view.tsx` (update)
- **Dependencies:** Task 46, Task 47
- **Actions:**
  - In `grid-cell.tsx`: remove the persistent `border-2 border-dashed border-muted-foreground/30` that renders on all empty cells in edit mode. Replace with:
    - **Edit mode, no drag active:** empty cells show no border. On hover, show a faint `+` icon (`text-muted-foreground/30` → `text-muted-foreground/60` on hover). Use CSS `:hover` pseudo-class, not React state, to avoid re-renders
    - **Drag active (edit mode or not):** on the hovered valid target cell, show the dotted area styled per `references/dotted2` — rounded-square dashed border with `+` icon. Only the currently hovered target shows this treatment, not all empty cells. Use `isDragOver` prop (already exists from `GridDropCell`) to trigger
  - Remove the `isEditMode` conditional on `border-dashed` — edit mode no longer drives persistent dotted styling
  - Keep the square add-target container (`aspect-square w-full max-w-[4rem] m-auto`) for both hover-only `+` and drag-over dotted target
  - In `grid-view.tsx`: ensure `GridDropCell` passes `isDragOver` correctly to `GridCell` for drag-hover dotted rendering
- **Acceptance:**
  - In edit mode with no drag: empty cells show no dotted border; hovering an empty cell reveals a faint `+`
  - In edit mode during drag: only the hovered target cell shows the `references/dotted2`-style dotted area
  - Outside edit mode during drag: same dotted target on hovered valid cell (unchanged from Task 46)
  - Clicking the hover-revealed `+` in edit mode still opens the create dialog at that cell position
  - `pnpm build` passes

### Task 51: Drag Focus Hierarchy
- **Status:** `[x]`
- **Files:** `src/components/grid/grid-view.tsx` (update), `src/components/layout/sidebar.tsx` (update), `src/app/globals.css` (update)
- **Dependencies:** Task 48, Task 50
- **Actions:**
  - In `grid-view.tsx`: add `data-dragging="true"` attribute on the grid container `div` when a drag is active (use `dragActiveItem` from `useDnd`)
  - In `globals.css`: add CSS rules using `[data-dragging="true"]` ancestor selector:
    - `[data-dragging="true"] [data-grid-item]:not([data-drag-active="true"]) { opacity: 0.4; filter: saturate(0.5); transition: opacity 0.15s, filter 0.15s; }` — all non-active grid items desaturate
    - The actively dragged item should have `data-drag-active="true"` attribute set in `DraggableNodeCard` / `DraggableBitCard` when `isDragging` is true
  - In `sidebar.tsx`: accept `dragActiveItem` prop (already passed in Task 48). When non-null, apply `opacity-40 saturate-50` classes to the search, calendar, trash, and darkmode buttons. Keep `+` and pencil at full opacity
  - **Implementation constraint:** all desaturation via CSS classes/data attributes — no per-item React state changes during drag
- **Acceptance:**
  - During drag: all non-active Nodes/Bits on the grid appear desaturated and dimmed
  - The actively dragged item remains at full color/opacity
  - Sidebar search, calendar, trash, darkmode icons desaturate during drag
  - Sidebar `+` and pencil icons remain at full opacity during drag
  - When drag ends, all items return to normal immediately
  - No perceptible performance degradation during drag (CSS-only, no React re-renders)
  - `pnpm build` passes

### Task 52: Visual Language — L0 Background + Node Card Square
- **Status:** `[x]`
- **Files:** `src/app/globals.css` (update), `src/components/grid/node-card.tsx` (update)
- **Dependencies:** Task 47
- **Actions:**
  - In `globals.css` `:root`: update `--grid-bg-l0` to `48 38% 91%` (≈ `#F1F0E1`). Derive deeper levels by reducing lightness from this base:
    - `--grid-bg-l0: 48 38% 91%;`
    - `--grid-bg-l1: 48 30% 88%;`
    - `--grid-bg-l2: 48 22% 85%;`
    - `--grid-bg-l3: 48 14% 82%;`
  - In `globals.css` `.dark`: update dark-mode equivalents preserving the same hue progression with appropriate dark values
  - In `node-card.tsx`: update the card button to render as a true square / rounded-square tile. Ensure the card container uses `aspect-square` so the tile is visually square within the rectangular grid cell. The tile should be centered in the cell. Keep `rounded-2xl`, shadow, and all existing interactions
  - Reference: `references/editmode.png` for tile card direction, `references/dotted2` for dotted target
- **Acceptance:**
  - L0 grid background is warm beige (`#F1F0E1` equivalent)
  - Each deeper level is visibly cooler/darker while maintaining the warm tone
  - Node cards render as square tiles centered within their rectangular grid cells
  - All existing Node card interactions (click, drag, edit-mode X, jiggle) remain functional
  - `pnpm build` passes
- **Visual recipe:** `docs/recipes/node-card-recipe.md` — finalized values: icon `h-8 w-8`, padding `p-3`, title `text-xs` / title zone `h-5`, shadow `shadow`

### Task 53: Node Description Schema Removal + Bit Single-line
- **Status:** `[x]`
- **Files:** `src/lib/db/schema.ts` (update), `src/lib/db/indexeddb.ts` (update), `src/components/grid/edit-node-dialog.tsx` (update), `src/components/grid/create-node-dialog.tsx` (update), `src/components/layout/breadcrumbs.tsx` (update if needed), `src/components/grid/bit-card.tsx` (update), `src/types/index.ts` (update if needed), `src/lib/db/deadline-hierarchy.test.ts` (update), `src/lib/db/grid-uniqueness.test.ts` (update), `src/lib/db/auto-completion.test.ts` (update), `src/lib/db/mtime-cascade.test.ts` (update), `src/lib/db/promotion.test.ts` (update), `src/lib/db/indexeddb.test.ts` (update)
- **Dependencies:** Task 47
- **Actions:**
  - **Node description removal (data-destructive):**
    - In `schema.ts`: remove `description` field from `nodeSchema` and `createNodeSchema`. The `Node` and `CreateNode` inferred types will no longer include `description`
    - In `indexeddb.ts`: remove any `description` references in Node create/update paths. Existing IndexedDB rows with `description` fields are unaffected (reads are trusted, extra fields ignored by Dexie), but new writes will not include it
    - In `edit-node-dialog.tsx`: remove the `description` state, the description input field, and the `description` value from the submit payload
    - In `create-node-dialog.tsx`: remove the `description` state, the `<Textarea>` field, and `description` from `onSubmit` values type
    - In `breadcrumbs.tsx`: confirm no description rendering remains (Task 47 removed subtitle display — verify no residual code)
    - In `grid-runtime.tsx`: update `handleCreateNode` if it passes `description` to `createNode`
    - In all test fixtures (`deadline-hierarchy.test.ts`, `grid-uniqueness.test.ts`, `auto-completion.test.ts`, `mtime-cascade.test.ts`, `promotion.test.ts`): remove `description: ""` from `makeNode` helper functions
    - In `indexeddb.test.ts`: remove assertion on `promotedNode.description` and any other description references
  - **Bit single-line policy:**
    - In `bit-card.tsx`: ensure the title uses `truncate` (single-line ellipsis). If `line-clamp-2` was applied in Task 45, revert to `truncate`. Do not use `line-clamp-2`
    - Keep the one-cell x/y model. Do not attempt to solve text overlap
    - Do not create a follow-up task for overlap
  - **Docs:** Update all canonical documentation to remove Node `description`:
    - `docs/SCHEMA.md`: remove `description` from the nodes table. Add a note: "Removed in Phase 9 amendment. Existing IndexedDB rows may retain orphaned `description` fields."
    - `docs/SPEC.md`: remove any references to Node description display (e.g., breadcrumb subtitle, grid descriptions). Ensure no layout or component spec references a Node description field
    - `docs/DESIGN_TOKENS.md`: remove any component usage references that mention Node description rendering or breadcrumb subtitle styling
- **Acceptance:**
  - `nodeSchema` and `createNodeSchema` do not include `description`
  - `Node` and `CreateNode` TypeScript types do not include `description`
  - Edit Node dialog has no description field
  - Create Node dialog has no description field or `<Textarea>`
  - No `description` references in test fixture `makeNode` helpers
  - `promoteBitToNode` test does not assert on `description`
  - Bit card titles render as single line with ellipsis truncation
  - `pnpm tsc --noEmit` passes (no type errors from removed field)
  - `pnpm test` passes
  - `pnpm build` passes

#### Phase 9 Notes (Amendment)

> **Data-destructive change:** Node `description` removal is a one-way schema change. Existing IndexedDB rows retain orphaned `description` fields that Dexie silently ignores on read. No migration is needed, but the data is permanently inaccessible once the UI and schema stop referencing it.

> **Drag-to-delete is a secondary path:** It supplements, not replaces, the per-card X button in edit mode. Both paths converge on the same `DeleteConfirmDialog`.

> **Ancestor move confirmation:** All ancestor moves via breadcrumb now require confirmation regardless of edit mode. This replaces the previous edit-mode-only gate, which existed to prevent accidental hierarchy changes.

> **Grid-aware sizing:** Fixed rem-based node sizing breaks across resolutions (FHD vs QHD vs UHD). Container queries with `min(100cqw, 100cqh)` and a 96px cap solved this without JS runtime measurement. See MI-3 through MI-6 in Issues_Phase_9.md.

> **Grid dimension iteration:** Density at higher resolutions drove three grid-dimension changes (12×8 → 15×8 → 18×9). When sizing feels sparse at one resolution, increasing grid density is a better fix than resolution-dependent branching or max-width constraints.

> **Scope drift at phase close:** Phase 10 deadline-conflict code (bit-detail-popup, use-bit-detail-actions) accumulated in the working tree during Phase 9. At close-out, it was misclassified as Phase 9 source by path proximity. Prevention: classify dirty files by diff content + plan cross-reference, not file path. Skill updated.

> **Full issue log:** `docs/issues/Issues_Phase_9.md`

---

## Phase 10: Breadcrumb + Deadline UX

> **Purpose:** Redesign the breadcrumb as a compact contextual surface, add deadline quick-edit, surface parent Node deadlines in Bit Detail, enforce L0 no-deadline policy, add optional deadline to Node creation, and redesign deadline input around a date-first interaction model.
> **Branch:** `phase-10/breadcrumb-deadline-ux`
> **Canonical refs:** SCHEMA.md (deadline fields, deadlineAllDay), DESIGN_TOKENS.md
>
> **Explicit policies:**
> - L0 Node = no deadline (UI + read-surface enforcement — hide deadline field in L0 create/edit, exclude L0 Nodes from calendar/urgency read paths)
> - `Week` pill = 7 days later from today
> - No explicit time selected = `deadlineAllDay = true`
> - All-day hierarchy comparison = `23:59:59.999` in local timezone for the selected date
> - Deadline quick-edit = deadline-only shortcut, does not replace full `EditNodeDialog`
> - Parent deadline label = `"Parent deadline"` (tooltip: `"Child deadline cannot exceed this"`)

### Task 54: Compact Breadcrumb Redesign
- **Status:** `[x]`
- **Files:** `src/components/layout/breadcrumbs.tsx` (rewrite), `src/app/globals.css` (update), `src/components/layout/grid-runtime.tsx` (update)
- **Dependencies:** Phase 9 complete
- **Actions:**
  - Redesign `breadcrumbs.tsx` from a full-width `border-b` navigation strip to a compact contextual block embedded into the grid surface. With max 4 levels (Home > L0 > L1 > L2), the breadcrumb should be a small floating/inline element, not a full-width bar
  - Remove the `h-breadcrumb` fixed height and `border-b border-border` styling. The breadcrumb should sit within the grid content area, not above it as a separate strip
  - Position the breadcrumb in the top-left of the grid area, overlaid on the grid surface with appropriate padding and a subtle background (e.g., `bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1.5`)
  - Keep all existing functionality: navigation via click, droppable segments for ancestor move, segment highlighting on drag-over
  - In `grid-runtime.tsx`: update the layout so the breadcrumb floats within the grid content area rather than occupying a dedicated layout row above it
  - In `globals.css`: remove `--breadcrumb-height` if it exists, or any `h-breadcrumb` utility. Update content margin calculations that depended on the breadcrumb strip height
- **Acceptance:**
  - Breadcrumb renders as a compact floating element in the top-left of the grid area
  - No full-width navigation strip visible
  - Navigation, drag-drop onto segments, and ancestor move confirmation all still work
  - Grid content occupies the full vertical space (no dedicated breadcrumb row)
  - `pnpm build` passes

### Task 55: Node Deadline Quick-Edit Surface
- **Status:** `[x]`
- **Files:** `src/components/layout/breadcrumb-deadline.tsx` (create), `src/components/layout/breadcrumbs.tsx` (update), `src/hooks/use-node-actions.ts` (update if needed)
- **Dependencies:** Task 54, Task 58 (date-first input component)
- **Actions:**
  - Create `breadcrumb-deadline.tsx`: a small component rendered below the compact breadcrumb. Accepts `nodeId` and reads the current Node via `useNode`
  - When the Node has no deadline, render nothing
  - When the Node has a deadline, render the formatted deadline as clickable text (e.g., `"Due Apr 15"` or `"Due Apr 15, 3:00 PM"`)
  - On click, open a Popover containing the `DateFirstDeadlinePicker` component (from Task 58). Pre-populate with the current deadline
  - On date selection: validate against child Bits via deadline hierarchy check. If shortening creates a conflict with any child Bit deadline, show `DeadlineConflictModal` (existing component). On confirm, update the Node deadline via `useNodeActions.updateNode`
  - On clear: remove the deadline (`deadline: null, deadlineAllDay: false`)
  - In `breadcrumbs.tsx`: render `<BreadcrumbDeadline nodeId={nodeId} />` below the breadcrumb block when `nodeId` is not null
- **Acceptance:**
  - When viewing a Node with a deadline, the deadline text appears below the compact breadcrumb
  - Clicking the deadline opens a popover with the date-first picker
  - Selecting a new date updates the Node deadline
  - Shortening the deadline triggers conflict validation against child Bits
  - Clearing the deadline removes it from the Node
  - When viewing a Node without a deadline, no deadline text appears
  - At L0 (Home), no deadline quick-edit appears (no nodeId)
  - `pnpm build` passes

### Task 56: Parent Node Deadline in Bit Detail
- **Status:** `[x]`
- **Files:** `src/components/bit-detail/bit-detail-popup.tsx` (update), `src/hooks/use-bit-detail.ts` (update if `parentNode` is not already exposed)
- **Dependencies:** Phase 9 complete
- **Actions:**
  - In `bit-detail-popup.tsx`: after the Bit's own deadline section, add a parent deadline display. `parentNode` is already resolved via `useBitDetail` (the hook reads the parent Node for hierarchy validation)
  - Render only when `parentNode?.deadline` is not null
  - Display at the very bottom of deadline-related content (below Bit deadline, above chunks/actions). Layout hierarchy: Bit deadline first (child), parent deadline last (final constraint)
  - Label: `"Parent deadline"` in `text-xs text-muted-foreground`
  - Format the deadline using `date-fns` `format` (same format as Bit deadline display)
  - Add a title/tooltip attribute: `"Child deadline cannot exceed this"`
  - Read-only display — no editing from this surface (editing is via the breadcrumb quick-edit in Task 55 or the full `EditNodeDialog`)
- **Acceptance:**
  - When a Bit's parent Node has a deadline, it appears labeled `"Parent deadline"` below the Bit's own deadline
  - When the parent Node has no deadline, nothing extra renders
  - The parent deadline is formatted consistently with the Bit's own deadline
  - Tooltip on hover shows `"Child deadline cannot exceed this"`
  - `pnpm build` passes

### Task 57: L0 Deadline Enforcement + Create Node Deadline
- **Status:** `[x]`
- **Files:** `src/components/grid/edit-node-dialog.tsx` (update), `src/components/grid/create-node-dialog.tsx` (update), `src/components/layout/grid-runtime.tsx` (update)
- **Dependencies:** Phase 9 complete
- **Actions:**
  - **L0 enforcement (UI + read surfaces):**
    - In `edit-node-dialog.tsx`: accept `level` as a prop (or derive from the Node's `level` field). When `level === 0`, hide the entire deadline section. Existing L0 Nodes with deadlines set before this change will not have their deadlines shown or editable — effectively hidden
    - In `create-node-dialog.tsx`: accept `level` as a prop from `grid-runtime.tsx`. At L0 (`level === 0`), do not render the deadline input. At L1+ (`level >= 1`), render the optional deadline input (see below)
    - **Read-surface exclusion:** L0 Node deadlines must also be excluded from read surfaces so they cannot create hidden-but-active state. Specifically:
      - `use-calendar-data.ts`: filter out Nodes with `level === 0` from calendar deadline queries (weekly items, monthly items, pool items)
      - `use-global-urgency.ts`: exclude Nodes with `level === 0` from urgency scanning
      - Any other deadline-driven read surface that displays or acts on Node deadlines must skip L0 Nodes
    - No schema-level Zod rejection. The schema still allows `deadline` on any Node. Enforcement is at the UI write layer + read-surface filtering layer
  - **Optional deadline in Create Node (L1+ only):**
    - In `create-node-dialog.tsx`: add an optional deadline section below the icon/color picker when `level >= 1`. Use the `DateFirstDeadlinePicker` component (from Task 58). Default: no deadline selected
    - Update `onSubmit` values type to include `deadline: number | null` and `deadlineAllDay: boolean`
    - In `grid-runtime.tsx` `handleCreateNode`: pass `deadline` and `deadlineAllDay` through to `createNode`. Default both to `null` / `false` when not set
  - **Level prop threading:** `grid-runtime.tsx` already computes `displayLevel`. Pass it to the create/edit dialog components
- **Acceptance:**
  - At L0: Create Node dialog has no deadline input; Edit Node dialog hides deadline section
  - At L1+: Create Node dialog shows optional deadline input with date-first picker
  - Creating a Node with a deadline persists it correctly
  - Creating a Node without a deadline works the same as before
  - Existing L0 Nodes with deadlines: deadline is hidden in edit dialog and ignored by calendar/urgency read surfaces
  - L0 Nodes do not appear in calendar deadline queries (weekly, monthly, pool)
  - L0 Nodes do not contribute to global urgency badge
  - Creating a child Node with a deadline exceeding its parent Node's deadline is prevented — enforced at both UI level (`CreateNodeDialog` validation) and datastore level (`createNode` path in `indexeddb.ts`)
  - `pnpm tsc --noEmit` passes
  - `pnpm build` passes

### Task 58: Date-First Deadline Input
- **Status:** `[x]`
- **Files:** `src/components/shared/date-first-deadline-picker.tsx` (create), `src/components/bit-detail/bit-detail-popup.tsx` (update), `src/components/grid/edit-node-dialog.tsx` (update)
- **Dependencies:** Phase 9 complete
- **Actions:**
  - Create `date-first-deadline-picker.tsx` as a shared component. Props: `value: { deadline: number | null; deadlineAllDay: boolean }`, `onChange: (value: { deadline: number | null; deadlineAllDay: boolean }) => void`, `onClear?: () => void`
  - Visible structure (horizontal row of pill buttons + icons):
    - `Today` pill: sets deadline to today. No time → `deadlineAllDay = true`
    - `Week` pill: sets deadline to 7 days from today (same time-of-day or all-day). No time → `deadlineAllDay = true`
    - `Calendar` icon button: opens a date picker (shadcn `Calendar` component in a `Popover`). Selecting a date sets the deadline. No time → `deadlineAllDay = true`
    - `Clock` icon button: opens a time picker (hour/minute inputs or a time select). Selecting a time sets `deadlineAllDay = false` and combines with the current date. If no date is set yet, use today
  - **All-day rule:** if the user selects only a date (via Today, Week, or Calendar) without explicitly setting a time via the Clock icon, the deadline is stored as `deadlineAllDay = true`. The timestamp is set to `00:00:00.000` local time on that date. For hierarchy comparison purposes, all-day deadlines are treated as `23:59:59.999` local time — this logic lives in the comparison/validation code, not in the picker component
  - Remove the current `"All day"` toggle from any deadline input surfaces. The concept is handled implicitly by whether the user sets a time
  - Replace existing deadline inputs in `bit-detail-popup.tsx` and `edit-node-dialog.tsx` with `DateFirstDeadlinePicker`
  - Preserve the existing `deadline` and `deadlineAllDay` schema fields — no schema changes
- **Acceptance:**
  - `Today` pill sets deadline to today (all-day)
  - `Week` pill sets deadline to today + 7 days (all-day)
  - `Calendar` icon opens date picker; selecting a date sets an all-day deadline
  - `Clock` icon opens time picker; selecting a time makes the deadline time-specific
  - No visible "All day" toggle in the UI
  - Existing deadline editing surfaces (Bit Detail, Edit Node) use the new picker
  - Deadline hierarchy validation treats all-day deadlines as `23:59:59.999` local
  - A shared all-day deadline comparison utility/rule exists (normalizes `deadlineAllDay` timestamps to `23:59:59.999` local before comparison)
  - All hierarchy validation paths use the shared rule consistently — UI conflict checks (`DeadlineConflictModal` trigger) and datastore-level validation (`assertBitDeadlineFitsParent`, `assertChunkTimeFitsBit`) agree on the same normalization
  - `pnpm build` passes

### Task 59: Dynamic Protected Breadcrumb Zone
- **Status:** `[x]`
- **Files:** `src/lib/utils/breadcrumb-zone.ts` (create), `src/lib/utils/bfs.ts` (update), `src/components/grid/grid-view.tsx` (update — suppress `+` on blocked cells), `src/hooks/use-dnd.ts` (update), `src/lib/grid-dnd.ts` (update — collision filtering), `src/components/layout/grid-runtime.tsx` (update — expose zone via context)
- **Dependencies:** Task 54, Task 55 (the deadline line contributes to the cluster footprint)
- **Origin:** `docs/issues/Issues_Phase_10.md` mi-5 — breadcrumb cluster overlaps top-row grid items. Promoted from user-reported issue because the fix requires a new layout rule affecting all placement paths and its own acceptance criteria. Migration split to Task 59b per ED-3.
- **Actions:**
  - **Dynamic zone derivation (not a fixed cell count):** Compute the blocked cell set from the actual rendered breadcrumb cluster footprint (breadcrumb pill + optional deadline line from Task 55) at placement time. Measure the cluster via `ResizeObserver` or `useLayoutEffect` + `getBoundingClientRect` on the cluster wrapper in `breadcrumbs.tsx`. Translate pixel rect to `{x, y}` cell coordinates using the same cell-size math used by `GridView` (grid cols, grid gap, inset). Expose the blocked cells as a `Set<string>` keyed by `"x,y"` via React context (preferred — passes through `AddFlowProvider`) or a Zustand slice
  - Create `src/lib/utils/breadcrumb-zone.ts` with pure helpers: `rectToBlockedCells(rect, gridMetrics) → Set<string>`, `isCellBlocked(x, y, blocked) → boolean`, and a hook-free pixel-to-cell projection that can be unit tested
  - **BFS auto-placement exclusion:** `findNearestEmptyCell(occupied, originX, originY)` must treat blocked cells as occupied. Option A (recommended): accept an optional `blocked: Set<string>` parameter and merge with `occupied` at the top of the function. Thread the blocked set through create paths so auto-placement never lands in the zone. `grid-runtime.tsx` exposes the blocked set via context; `grid-view.tsx` consumes it for cell affordance and passes it to BFS callers
  - **Manual drag-drop rejection:** In `use-dnd.ts` grid-cell drop handler, reject drops onto cells inside the blocked set (no move, optional toast `"Cell reserved by breadcrumb"`). In `gridCollisionDetection`, exclude blocked cells from collision candidates so the drop indicator never highlights them during drag
  - **Click-to-add rejection:** `AddFlowProvider.openAddAtCell` must skip blocked cells. Suppress the `+` affordance on blocked cells — do not silently create elsewhere via BFS (silent relocation reads as a bug)
  - **No live reflow on edit:** When the user edits a node/bit title and the breadcrumb visual width changes, existing items **do not reposition**. Only new placements and drag targets respect the updated zone. This prevents disorienting reflow during typing
  - **Cross-parent landing:** When an item is moved to a different parent (via breadcrumb drop or node drop), BFS placement in the target grid must also respect blocked cells. For target grids that are not currently rendered, use a static conservative estimate (`BREADCRUMB_ZONE_COLS` constant covering top-left cells) rather than DOM measurement
  - **Scope: forward-only protection.** This task protects new placements only. Existing items that already overlap the breadcrumb zone are not relocated. Legacy overlap cleanup is tracked separately as Task 59b
  - **Breadcrumb width absorption (unchanged from Task 54 fixes):** Overflow is absorbed inside the breadcrumb pill via `max-w` + `whitespace-nowrap` + horizontal scroll. Task 59 does not change the breadcrumb's own width behavior; it only uses the rendered footprint to compute the blocked zone
- **Acceptance:**
  - At every level (L0/L1/L2/L3), new items created via sidebar `+` never land in the breadcrumb footprint (BFS skips blocked cells)
  - Cell-level `+` affordance is suppressed on blocked cells (no `+` button rendered); clicking a blocked cell does not silently create elsewhere via BFS
  - BFS auto-placement correctly skips blocked cells at all levels
  - Dragging a bit/node onto a blocked cell is rejected (no move; optional toast)
  - Drop indicator during drag never highlights a blocked cell
  - Cross-parent moves (breadcrumb drop, node drop) place items outside the target grid's blocked zone using a static conservative estimate
  - Existing items that already overlap the breadcrumb zone remain in place (no migration — see Task 59b)
  - Existing placements remain stable regardless of subsequent title/deadline edits (no live reflow)
  - Zone shape updates when the deadline line (Task 55) appears or disappears, or when the breadcrumb cluster width changes on navigation
  - At L0, the zone covers the Home pill footprint (small); at L3 with long titles, the zone expands to match
  - `pnpm tsc --noEmit` passes
  - `pnpm build` passes

### Task 59b: Breadcrumb Zone Legacy Overlap Cleanup
- **Status:** `[x]`
- **Files:** `src/lib/utils/breadcrumb-zone.ts` (update), `src/lib/db/indexeddb.ts` (update), `src/lib/db/datastore.ts` (update if needed), `src/components/layout/grid-runtime.tsx` (update — trigger remediation on first grid view per parent)
- **Dependencies:** Task 59
- **Origin:** Split from Task 59 scope narrowing — migration removed from Task 59 to reduce implementation risk. See `docs/issues/Issues_Phase_10.md` for the decision record.
- **Actions:**
  - **Per-parent deferred remediation:** On first grid view per parent, scan existing Nodes/Bits whose `{x, y}` falls inside the current blocked zone. Relocate via BFS to nearest empty cell outside the zone
  - **Per-parent migration marker:** Store migration state per parent (not a single global flag). Use durable meta/settings storage. Atomic write of relocated items + marker
  - **Deterministic processing:** Use combined occupancy across Nodes and Bits. Exclude relocating items from initial occupancy. Process in row-major order. Reserve chosen fallback cells immediately. Fail without setting marker if no legal cell exists
  - **Dev logging:** Log relocations to console in dev mode
- **Acceptance:**
  - On first view of a grid after Task 59b lands, existing items overlapping the breadcrumb zone are relocated to nearest empty cells
  - Migration runs exactly once per parent (marker persisted)
  - Relocations are deterministic (same input → same output)
  - Items already outside the zone are unaffected
  - `pnpm tsc --noEmit` passes
  - `pnpm build` passes

#### Phase 10 Notes

> **Task dependency order:** Task 58 (Date-First Deadline Input) should be implemented early in Phase 10 as Tasks 55 and 57 depend on the `DateFirstDeadlinePicker` component. Task 59 (Dynamic Protected Breadcrumb Zone) depends on Task 54 and Task 55 because the zone is derived from the rendered breadcrumb + deadline cluster. Task 59b (Legacy Overlap Cleanup) depends on Task 59. Recommended order: 58 → 54 → 56 → 57 → 55 → 59 → 59b.

> **Task 59 was promoted from user-reported issue mi-5** during Batch 2 (Task 54 review). See `docs/issues/Issues_Phase_10.md` for the original observation and promotion rationale. Task numbers were shifted by +1 as a result: Tasks 59–66 became 60–67, and Task 67 became Task 68. Subsequently, the original 8-task Phase 11 (Tasks 60–67) was split into four focused phases: Phase 11 (T60–T61, Calendar Shell), Phase 12 (T62–T63, Creation Flows), Phase 13 (T64–T65, Weekly Redesign), Phase 14 (T66–T67, Monthly Redesign). The original Phase 12 (Task 68, Quarterly) was renumbered to Phase 15.

> **All-day timestamp storage:** The picker stores all-day deadlines with `00:00:00.000` local time. The `23:59:59.999` interpretation is applied only at comparison time (hierarchy validation, urgency calculation, calendar display). This keeps the storage clean while preserving correct end-of-day semantics.

> **L0 deadline enforcement covers UI + read surfaces.** Write surfaces (create/edit dialogs) hide the deadline field at L0. Read surfaces (calendar queries, urgency scanning) filter out L0 Nodes. This prevents hidden-but-active deadline state. Schema-level Zod rejection is deferred — if needed later, add a `refine` on `createNodeSchema` that checks `level === 0 → deadline must be null`.

> **Hook API boundary: validation reads and ResizeObserver writes must go through hooks.** Found at close-out: `breadcrumb-deadline.tsx` called `getChildDeadlineConflicts` directly on DataStore (a read in an event handler), and `grid-runtime.tsx` called `runBreadcrumbZoneMigration` directly (a write in a ResizeObserver callback). Both are violations — the rule "UI components import hooks, not DataStore" applies to reads and writes alike. Fix: add the methods to `useNodeActions` / `useGridActions` and call from there. Also: hooks must not import Zustand — `use-dnd.ts` read `useBreadcrumbZoneStore` directly inside the hook. Fix: pass a `getBlockedCells: () => Set<string>` getter from the component layer instead. Full issue log: `docs/issues/Issues_Phase_10.md` close-1.

> **Full issue log:** `docs/issues/Issues_Phase_10.md`

---

## Phase 11: Calendar Shell

> **Purpose:** Restructure the calendar shell — sidebar, header, and pool. Redesign navigation controls, disable pencil in calendar mode, add a Home icon for returning to grid root, move the Weekly/Monthly toggle inline with date navigation, and add pool fold/unfold with smooth animation.
> **Branch:** `phase-11/calendar-shell`
> **Canonical refs:** SPEC.md § Routes (calendar routes), DESIGN_TOKENS.md
>
> **Explicit policies:**
> - Calendar sidebar `+` = creation entry point for **unscheduled** Nodes/Bits; opens a Node vs Bit chooser (actual creation dialogs wired in Phase 12)
> - Calendar sidebar `pencil` = disabled in calendar mode (`pointer-events-none opacity-40`)
> - Home icon above `+` navigates to `/` (Grid L0)
> - Weekly/Monthly toggle moves to the date navigation row (inline with `<` arrows and date label)
> - Pool collapse hides pool content and expands the calendar area; state persists in Zustand

### Task 60: Calendar Sidebar + Header Redesign
- **Status:** `[x]`
- **Files:** `src/components/layout/sidebar.tsx` (update), `src/app/calendar/layout.tsx` (update), `src/app/calendar/weekly/page.tsx` (update), `src/app/calendar/monthly/page.tsx` (update)
- **Dependencies:** Phase 10 complete
- **Actions:**
  - In `sidebar.tsx`: detect calendar routes via `pathname.startsWith("/calendar/")`. When on a calendar route:
    - `+` button: wire to a calendar creation flow (opens a chooser for Node vs Bit, then the appropriate create dialog). Items created here are **unscheduled** (no deadline set)
    - `pencil` button: render as disabled (`pointer-events-none opacity-40`)
    - Add a `Home` icon button (`Home` from lucide-react) **above** the `+` button. Clicking navigates to `/` (Grid L0). This provides a direct return path from calendar to grid root
  - In `calendar/layout.tsx`: remove the current `"Calendar Schedule"` heading text. Remove the `"Weekly / Monthly"` label from the top header section
  - Move the `Weekly / Monthly` toggle to the date navigation row: place it inline with the left/right date navigation arrows and the centered date label. Layout: `[< arrow] [Weekly | Monthly toggle] [date label (centered)] [> arrow]`
  - Remove `border-b` dividers between calendar header sections. Use spacing, surface color, and font weight to create visual separation instead
  - Apply the updated icon design language (square/rounded-square icon style) to calendar sidebar buttons
- **Acceptance:**
  - In calendar mode: `+` opens creation flow for unscheduled items; `pencil` is disabled; `Home` icon appears above `+` and navigates to `/`
  - `"Calendar Schedule"` text is removed
  - `Weekly / Monthly` toggle sits in the date navigation row
  - No hard border lines between calendar sections
  - `pnpm build` passes

### Task 61: Pool Fold/Unfold
- **Status:** `[x]`
- **Files:** `src/app/calendar/layout.tsx` (update), `src/stores/calendar-store.ts` (update)
- **Dependencies:** Task 60
- **Actions:**
  - In `calendar-store.ts`: add `isPoolCollapsed: boolean` state and `togglePool` action
  - In the calendar layout or pool component: add a collapse/expand toggle (chevron icon) at the top of the pool section. When collapsed, the pool section hides its content and shrinks to a minimal bar (showing only the toggle and a label like "Pool"). When expanded, full pool content is visible
  - Use `AnimatePresence` + `motion.div` for smooth height transition on fold/unfold
  - When pool is collapsed, the calendar (weekly day columns or monthly grid) expands to fill the reclaimed space
- **Acceptance:**
  - Pool section has a toggle to collapse/expand
  - Collapsing hides pool items and gives more vertical space to the calendar
  - Expanding restores the pool with smooth animation
  - Pool state persists within the session (Zustand store)
  - `pnpm build` passes

#### Phase 11 Notes

> **Creation chooser wiring only.** T60 wires the sidebar `+` to a Node-vs-Bit chooser (two-button popover). The chooser calls into Phase 12's creation dialogs. For Phase 11, the chooser can open placeholder stubs — Phase 12 completes the flow.

> **Radix PopoverTrigger asChild requires forwardRef.** Custom components used as `PopoverTrigger asChild` children must be converted to `forwardRef` and spread `...rest` props onto the underlying `<button>`. Plain function components silently break the trigger — Radix Slot cannot inject `ref` or `data-state`/`aria-expanded` props. Tests using manual `onOpenChange` mocks mask this bug class.

> **pointer-events-none for disabled buttons in a hover-able context.** `opacity-40` dims visually but CSS `:hover` still fires. Add `pointer-events-none` to the disabled element's className to suppress hover. Pointer events pass through to the parent wrapper, so a `cursor-not-allowed` wrapper div still shows the correct cursor without needing extra CSS.

> **Narrow collapsed bar: verify button geometry fits.** 2.5rem (40px) does not fit `px-2` + `h-8 w-8` button (32px + 16px = 48px). Use 3rem (48px) minimum for a bar that holds a standard icon button with standard side padding.

> **aria-controls must not reference unmounted elements.** When pool content is unmounted on collapse, `aria-controls` must be conditional: `aria-controls={isCollapsed ? undefined : "element-id"}`. A permanent `aria-controls` pointing to a non-existent DOM id is an accessibility violation.

> **Horizontal pool collapse: axis clarification.** The execution plan text said "height transition" — the correct axis is width. When writing future specs for panel collapse, be explicit about the animation axis (width vs. height) to avoid prompt ambiguity.

> **Full issue log:** `docs/issues/Issues_Phase_11.md`

---

## Phase 12: Calendar Creation Flows

> **Purpose:** Wire the calendar sidebar creation entry point (introduced in Phase 11) to actual creation dialogs. Implement Node creation from calendar (unscheduled, `parentId = null`) and Bit creation from calendar with a tree-browsing parent Node selector.
> **Branch:** `phase-12/calendar-creation`
> **Canonical refs:** SPEC.md § Routes (calendar routes), SCHEMA.md (Node/Bit fields)
>
> **Explicit policies:**
> - Calendar-created Nodes = `parentId = null`, visible in Grid L0, no deadline assigned
> - Calendar-created Bits = require explicit parent Node selection via Node browser; created with no date assigned
> - Selected parent in Create Bit must be visibly shown in the dialog (title + path)
> - Create Bit button disabled until a parent Node is selected

### Task 62: Calendar Pool Node Creation
- **Status:** `[ ]`
- **Files:** `src/app/calendar/layout.tsx` (update), `src/hooks/use-grid-actions.ts` (update if needed)
- **Dependencies:** Phase 11 complete
- **Actions:**
  - When the sidebar `+` is clicked in calendar mode and the user selects "Node" from the chooser:
    - Open `CreateNodeDialog` (reuse existing component)
    - On submit: create the Node with `parentId = null`, `level = 0`, and BFS auto-placement at the L0 grid. No deadline is set
    - The new Node appears in Grid L0 and (if it has a deadline later) in the calendar pool
  - This is a lightweight reuse of existing creation infrastructure — the only difference from grid creation is the entry point (calendar sidebar vs grid cell `+`)
- **Acceptance:**
  - From calendar, sidebar `+` → Node → opens CreateNodeDialog
  - Created Node appears in Grid L0 with BFS auto-placement
  - Created Node has no deadline (unscheduled)
  - `pnpm build` passes

### Task 63: Calendar Pool Bit Creation + Parent Selector
- **Status:** `[ ]`
- **Files:** `src/components/calendar/parent-node-selector.tsx` (create), `src/components/grid/create-bit-dialog.tsx` (update), `src/app/calendar/layout.tsx` (update)
- **Dependencies:** Phase 11 complete
- **Actions:**
  - Create `parent-node-selector.tsx`: a tree-browsing Node selector component. Props: `value: string | null` (selected Node ID), `onChange: (nodeId: string) => void`
    - On open, show all L0 Nodes. Clicking a Node either selects it (if it's the desired parent) or drills into its children (if it has child Nodes)
    - Show each Node with its icon and title. Indicate Nodes that contain child Nodes (e.g., chevron or folder indicator)
    - Breadcrumb-style path at the top of the selector showing the current browsing location
    - "Select" button to confirm the currently viewed Node as the parent, or allow clicking a "Select this node" action on each Node row
    - The selector should be rendered inside a Popover or Dialog
  - Update `create-bit-dialog.tsx`: accept an optional `requireParent?: boolean` prop and optional `defaultParentId?: string | null` prop
    - When `requireParent` is true: show the `ParentNodeSelector` in the dialog. Display the selected parent's title and path. Disable the "Create" button until a parent is selected
    - When `requireParent` is false (default, grid usage): behavior unchanged
  - In calendar layout: when sidebar `+` → Bit is selected, open `CreateBitDialog` with `requireParent={true}`. If the calendar is drilled into a specific Node context, pass that Node as `defaultParentId`
  - Created Bit: `parentId = selected Node`, BFS auto-placement in that Node's grid, no deadline (unscheduled)
- **Acceptance:**
  - From calendar, sidebar `+` → Bit → opens CreateBitDialog with parent selector
  - Parent selector shows L0 Nodes, allows browsing deeper, shows path
  - Create button is disabled until a parent Node is selected
  - Selected parent is visibly displayed (title + path)
  - Created Bit appears in the selected parent's grid with no deadline
  - From grid, CreateBitDialog behavior is unchanged (no parent selector shown)
  - `pnpm build` passes

#### Phase 12 Notes

> **Calendar creation is not scheduling.** Items created from the calendar sidebar `+` are unscheduled by default. The user creates first, then drags onto a date to schedule. This keeps the creation flow lightweight and consistent regardless of entry point.

> **Parent Node selector is the most complex new component.** The tree-browsing Node selector (Task 63) requires a browse-and-select interaction pattern. Consider implementing it as a standalone component reusable for future "pick a Node" interactions (e.g., move-to, reparent).

---

## Phase 13: Weekly Redesign

> **Purpose:** Redesign the calendar weekly view with stable day column sizing, today emphasis via expanded width, and drag rescheduling of already-placed items.
> **Branch:** `phase-13/weekly-redesign`
> **Canonical refs:** SPEC.md § Routes (calendar routes), DESIGN_TOKENS.md
>
> **Explicit policies:**
> - Stable day section footprint with internal scroll; today section wider by default; click-to-expand other days
> - Placed calendar items = draggable for rescheduling; cursor affordance only (no drag handles)

### Task 64: Weekly Stable Day Sizing + Today Emphasis
- **Status:** `[ ]`
- **Files:** `src/components/calendar/day-column.tsx` (update), `src/app/calendar/weekly/page.tsx` (update), `src/stores/calendar-store.ts` (update)
- **Dependencies:** Phase 12 complete
- **Actions:**
  - In `calendar-store.ts`: add `expandedDay: number | null` state (day index 0–6, `null` = use default rule) and `setExpandedDay` action
  - **Default expanded-day rule:**
    - If the displayed week includes today: today's column is expanded by default (`expandedDay` resolves to today's day index when `null`)
    - If the displayed week does not include today: the first visible day column (index 0, Monday) is expanded by default
    - This ensures exactly one column is always expanded, providing a stable layout regardless of navigation
  - In `day-column.tsx` / weekly page: replace content-driven column width with a fixed layout model:
    - Each day column has a fixed base width (e.g., `flex-1`)
    - The expanded column (today or selected) gets a wider allocation (e.g., `flex-[2]` or `flex-[1.5]`)
    - Content overflow within a day column scrolls internally (`overflow-y-auto`) rather than expanding the column
  - Remove the current border-color-only today emphasis. The expanded column should be visually distinct via width and subtle surface color (e.g., slightly lighter/warmer background)
  - Clicking a non-expanded date header expands that day (animates width increase) and contracts the previously expanded day. Use `motion.div` `layout` animation for smooth width transition
  - Only one day can be expanded at a time. Clicking the already-expanded day has no effect
- **Acceptance:**
  - Day columns have stable widths that don't fluctuate with content
  - When the displayed week includes today: today's column is wider by default
  - When the displayed week does not include today: the first day column (Monday) is wider by default
  - Exactly one column is always expanded
  - Content-heavy days scroll internally rather than expanding
  - Clicking another day header expands it with smooth animation
  - Only one day is expanded at a time
  - `pnpm build` passes

### Task 65: Weekly Drag Rescheduling + Pool Cleanup
- **Status:** `[ ]`
- **Files:** `src/components/calendar/day-column.tsx` (update), `src/components/calendar/items-pool.tsx` (update), `src/hooks/use-dnd.ts` (update)
- **Dependencies:** Task 64
- **Actions:**
  - **Placed items draggable:** Items already placed in a day column must be draggable. Wrap each placed item with `useDraggable`. On drag-end to a different day column: update the item's deadline to the target day. On drag-end back to the pool: clear the deadline (unschedule)
  - **Cursor affordance:** Set `cursor-grab` on placed items, `cursor-grabbing` during drag. Do not add visible drag-handle icons
  - **Pool row cleanup:**
    - Remove the left-side drag icon from each pool item
    - Replace the right-side `X` (unschedule) icon with `Trash2` icon from lucide-react (matching Bit Detail's delete/trash affordance)
  - In `use-dnd.ts`: ensure `handleDragEnd` handles the case where a placed calendar item (not just a pool item) is dropped on a different day column — update deadline to the new day
- **Acceptance:**
  - Items placed in a weekly day column are draggable to other day columns (rescheduling)
  - Dragging a placed item to the pool unschedules it (clears deadline)
  - Placed items show `cursor-grab` on hover, `cursor-grabbing` while dragging
  - No drag-handle icons on placed items
  - Pool items have no left-side drag icon
  - Pool items have `Trash2` icon instead of `X` for unschedule action
  - `pnpm build` passes

#### Phase 13 Notes

> **Placed item drag rescheduling (weekly):** `use-dnd.ts` must detect whether the drag source is a pool item (new scheduling) or a placed item (rescheduling). Pool items have no deadline; placed items have a deadline that needs to be updated to the new target day.

---

## Phase 14: Monthly Redesign

> **Purpose:** Redesign the calendar monthly view with horizontally wider date cells, a floating day detail popup instead of a fixed side panel, and draggable placed items for rescheduling.
> **Branch:** `phase-14/monthly-redesign`
> **Canonical refs:** SPEC.md § Routes (calendar routes), DESIGN_TOKENS.md
>
> **Explicit policies:**
> - Monthly: horizontally wider rounded-rectangle cells (not square); day detail = popup overlay (not fixed column)
> - Monthly popup: one popup at a time; X to close; positioned near click
> - Placed calendar items = draggable for rescheduling; cursor affordance only (no drag handles)

### Task 66: Monthly Cell Redesign + Day Detail Popup
- **Status:** `[ ]`
- **Files:** `src/app/calendar/monthly/_components/month-grid.tsx` (update), `src/app/calendar/monthly/_components/date-cell-popover.tsx` (rewrite), `src/app/calendar/monthly/page.tsx` (update)
- **Dependencies:** Phase 13 complete
- **Actions:**
  - In `month-grid.tsx`: update date cells from their current shape to **horizontally wider rounded rectangles** (`rounded-xl`, wider aspect ratio). Do not use square cells. Reason: typical viewport is wider than tall, and square cells waste horizontal space in the 2-column (pool + calendar) layout. Reference: `references/monthly.jpg`
  - **Day detail popup:** Replace the current `date-cell-popover.tsx` (if it uses a fixed side panel) with a Radix `Popover` or floating overlay:
    - Clicking a date cell opens a popup overlay **near the clicked cell** (use Radix Popover with `side="bottom"` or `side="right"` and viewport collision handling)
    - Popup shows all items for that day in a list view. Items are clickable → navigate to their grid location (same behavior as current implementation)
    - Popup has an `X` button in the top-right corner to close
    - **One popup at a time:** clicking a different date closes the current popup and opens the new one. Manage via `selectedDate` state on the monthly page
  - In monthly page: remove any fixed 3-column layout (Pool | Calendar | Today Detail). The calendar grid should use the full available width alongside the pool. The popup is an overlay, not a space-consuming panel
  - Placed items in monthly cells must be draggable to other date cells (rescheduling). Use cursor affordance, no drag handles. When an item is dropped on a different date cell, update its deadline to that date
- **Acceptance:**
  - Monthly date cells are horizontally wider rounded rectangles (not square)
  - Clicking a date opens a popup overlay near the cell, not a fixed side panel
  - Popup has an X close button
  - Only one popup is open at a time; clicking another date swaps it
  - Calendar grid uses full available width (no fixed third column)
  - Placed items are draggable between date cells for rescheduling
  - `pnpm build` passes

### Task 67: Monthly Item Representation
- **Status:** `[ ]`
- **Files:** `src/app/calendar/monthly/_components/month-grid.tsx` (update), `src/app/calendar/monthly/_components/date-cell-popover.tsx` (update)
- **Dependencies:** Task 66
- **Actions:**
  - In `month-grid.tsx` date cells:
    - Bits: render as small colored **dots** (circle indicator, `h-2 w-2 rounded-full`). Color derived from parent Node's color. Multiple dots stack horizontally; overflow shows a count badge (e.g., `+3`)
    - Nodes: render as small versions of the Node tile (miniature icon + title or icon only) using the Node's color. Consistent with the new Phase 9 square/rounded-square Node design language, but smaller (e.g., `h-6 w-6` icon only)
  - In the popup day detail view: show full item details (icon, title, time if any, parent path) — same richness as the current implementation
  - Reference: `references/monthly.jpg`
  - Keep the entire month visible on one screen. The popup is an overlay; the calendar itself should not scroll vertically for a standard 5-week month
- **Acceptance:**
  - Bits appear as colored dots in monthly cells
  - Nodes appear as small tile icons in monthly cells
  - Popup detail view shows full item information
  - Entire month is visible on one screen (no vertical scroll for the calendar grid)
  - `pnpm build` passes

#### Phase 14 Notes

> **Monthly popup positioning:** Use Radix Popover's built-in viewport collision handling. If the clicked cell is near the bottom-right corner, the popup should flip/shift to remain visible. Test with edge cells explicitly.

> **Placed item drag rescheduling (monthly):** `use-dnd.ts` must detect whether the drag source is a pool item (new scheduling) or a placed item (rescheduling). Same detection pattern as Phase 13's weekly rescheduling.

---

## Phase 15: Quarterly Calendar View

> **Purpose:** Add a new Quarterly calendar view that shows Nodes (only) placed across quarters. Provides a high-level planning surface for longer-term work.
> **Branch:** `phase-15/quarterly-view`
> **Canonical refs:** SCHEMA.md (Node deadline, deadlineAllDay)
>
> **Explicit policies:**
> - Only Nodes can be placed in Quarterly (no Bits, no Chunks)
> - Placing a Node in a quarter sets its deadline to the **last calendar day** of that quarter:
>   - Q1 → March 31, Q2 → June 30, Q3 → September 30, Q4 → December 31
> - Placed deadlines are treated as **all-day** (`deadlineAllDay = true`)
> - For comparison/validation: local timezone, `23:59:59.999` on the final day
> - Quarterly is a new calendar mode alongside Weekly and Monthly

### Task 68: Quarterly Calendar View
- **Status:** `[ ]`
- **Files:** `src/app/calendar/quarterly/page.tsx` (create), `src/app/calendar/quarterly/_components/quarter-grid.tsx` (create), `src/app/calendar/quarterly/_components/quarter-column.tsx` (create), `src/app/calendar/layout.tsx` (update), `src/stores/calendar-store.ts` (update), `src/hooks/use-calendar-data.ts` (update), `src/hooks/use-dnd.ts` (update)
- **Dependencies:** Phase 14 complete
- **Actions:**
  - In `calendar-store.ts`: add `currentYear: number` state, `navigateYear` action, and extend the calendar view type to include `"quarterly"`
  - In `calendar/layout.tsx`: add `Quarterly` to the Weekly/Monthly toggle (becomes a 3-way toggle). Route to `/calendar/quarterly`
  - Create `quarterly/page.tsx`: `"use client"`. Same pool panel as weekly/monthly (shared via calendar layout). Right panel: quarter grid. Only Nodes from the pool can be dragged onto quarters — Bits and Chunks are not droppable
  - Create `quarter-grid.tsx`: 4-column layout, one per quarter (Q1, Q2, Q3, Q4). Each column shows Nodes with deadlines falling within that quarter. Year navigation arrows + year label at the top
  - Create `quarter-column.tsx`: column component for a single quarter. Header shows `Q1 (Jan–Mar)` etc. Body lists Nodes placed in that quarter (rendered with the Phase 9 Node tile design language). Column is a `useDroppable` target
  - **Placement semantics:** dragging a Node from the pool (or from another quarter) onto a quarter column sets:
    - `deadline` to `new Date(year, lastMonth, lastDay).getTime()` where lastMonth/lastDay correspond to the quarter's end date (Q1: month=2 day=31, Q2: month=5 day=30, Q3: month=8 day=30, Q4: month=11 day=31)
    - `deadlineAllDay = true`
  - **Drag validation:** if a Bit or Chunk is dragged onto a quarter column, reject the drop (do not update, optionally show toast: `"Only Nodes can be placed in Quarterly view"`)
  - In `use-calendar-data.ts`: add `quarterlyItems` query — all Nodes with deadlines, grouped by quarter based on deadline timestamp. Filter: active Nodes only (`deletedAt === null`)
  - In `use-dnd.ts`: handle `quarterly-column-drop` kind. On drop, update Node deadline to quarter end date
  - The Node placement section should use **full height** of the available calendar area. Reference: `references/quarter`
- **Acceptance:**
  - `/calendar/quarterly` route resolves and renders the quarterly view
  - 3-way toggle (Weekly / Monthly / Quarterly) works in calendar header
  - 4-column quarter grid shows Nodes by quarter
  - Dragging a Node onto a quarter sets its deadline to the last day of that quarter (all-day)
  - Dragging a Bit/Chunk onto a quarter is rejected
  - Year navigation arrows update the displayed year
  - Nodes with deadlines in the displayed year appear in the correct quarter column
  - Quarter columns use full available height
  - `pnpm build` passes

#### Phase 15 Notes

> **Quarter end-date computation:** Use `new Date(year, month, 0).getDate()` pattern if needed for months with varying lengths (though Q1-Q4 end dates are fixed: Mar 31, Jun 30, Sep 30, Dec 31). Hard-code the month/day pairs for clarity.

> **Quarterly is Nodes-only by design.** Quarterly is a strategic planning surface. Bits are tactical (specific tasks), and placing them at quarter granularity would lose meaningful scheduling precision. This is an intentional interaction constraint, not a limitation to be relaxed later.
