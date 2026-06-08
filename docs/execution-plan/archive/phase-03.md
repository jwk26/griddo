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

