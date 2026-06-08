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

