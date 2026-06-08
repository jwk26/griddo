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

