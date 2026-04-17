# Flow-Trace Review — Phase 11: Calendar Shell

**Reviewed:** 2026-04-17
**Inputs:** SPEC.md (§ Routes: calendar), EXECUTION_PLAN.md (Phase 11: T60–T61)
**Scope:** T60 (Calendar Sidebar + Header Redesign) · T61 (Pool Fold/Unfold)

---

## Flow-Trace Table

| # | User Flow | Trigger | Intended Outcome | Owning Task | Boundary Cases | Status |
|---|-----------|---------|------------------|-------------|----------------|--------|
| 1 | Enter calendar mode | Navigate to `/calendar/weekly` or `/calendar/monthly` | Sidebar shows Home icon above `+`; pencil is visually disabled; Weekly/Monthly toggle is in the date nav row | T60 | Sidebar must correctly detect calendar route via `pathname.startsWith("/calendar/")`. Direct URL entry (not via sidebar button) must also trigger the calendar-mode sidebar. | ✅ Owned |
| 2 | Click Home icon in calendar sidebar | Click the `Home` lucide icon above `+` | Navigate to `/` (L0 Grid) | T60 | Home icon must appear only on calendar routes. Should not appear on grid or trash routes. | ✅ Owned |
| 3 | Click `+` in calendar sidebar | Click `+` button while on any `/calendar/*` route | Opens a Node-vs-Bit creation chooser (Phase 12 completes the dialog; Phase 11 wires the entry point and opens a stub or chooser UI) | T60 | Chooser must open without navigating away. Phase 11 only needs to wire the entry point — actual creation dialogs are Phase 12's scope. | ✅ Owned |
| 4 | Click `pencil` in calendar sidebar | Click pencil button while on any `/calendar/*` route | No action — button is visually disabled (`pointer-events-none opacity-40`). Edit mode does not activate. | T60 | Must not toggle edit mode. Hover state should still change cursor to `not-allowed` or default. Disabled state must not be confused with "active" state. | ✅ Owned |
| 5 | Leave calendar, return to grid — sidebar restores | Navigate from `/calendar/weekly` to `/grid/[id]` | Pencil is re-enabled; Home icon disappears; `+` reverts to grid creation behavior | T60 | Route detection must be reactive — sidebar must re-render when `pathname` changes. SSR vs. CSR pathname sync: use `usePathname()` from `next/navigation` (client-only). | ✅ Owned |
| 6 | "Calendar Schedule" heading absent | View any calendar page | No "Calendar Schedule" text visible in the header area | T60 | Removal must not break layout (check for empty header row if heading was the only content). | ✅ Owned |
| 7 | Weekly/Monthly toggle in date nav row | View any calendar page | Toggle appears inline with `<` / `>` arrows and date label (not as a separate section above) | T60 | Toggle must remain accessible (not crowded) at minimum supported width (1024px). Date label should remain centered even with toggle present. | ✅ Owned |
| 8 | No border dividers between calendar header sections | View any calendar page | Visual separation uses spacing / surface color / font weight only — no hard `border-b` lines | T60 | Must apply to all calendar routes (weekly and monthly). | ✅ Owned |
| 9 | Collapse pool | Click collapse chevron at top of pool section | Pool content hides; pool shrinks to a minimal bar (showing toggle + label "Pool"); calendar area expands to fill reclaimed space | T61 | Calendar must actually expand — flex/grid layout must respond to pool collapse. Collapsed state must not cut off partially-visible items (smooth transition to zero-height). | ✅ Owned |
| 10 | Expand pool | Click expand chevron on collapsed pool bar | Pool content restores with smooth `AnimatePresence` / `motion.div` height animation | T61 | Pool must restore to same scroll position it had before collapse (or reset — either is acceptable, but must not throw a layout error). | ✅ Owned |
| 11 | Pool state persists within session | Collapse pool, navigate between Weekly/Monthly, navigate back | Pool remains collapsed (or expanded) — state is not lost on route change within calendar | T61 | Zustand `isPoolCollapsed` state must survive calendar-internal navigation. It resets on full page reload (session-scoped is acceptable). | ✅ Owned |

---

## Gaps Found

None. All user-visible flows for Phase 11 have clear task ownership and acceptance criteria.

---

## Boundary Notes (non-blocking)

**B1 — Chooser stub scope (T60/T61 boundary with Phase 12):**
T60 requires `+` to "open a chooser for Node vs Bit." Phase 12 wires the actual dialogs. For Phase 11 to be shippable as a standalone branch, the chooser UI (two-button popover with "Node" and "Bit" options) must be implemented in T60 even if the buttons are stubs that log or show a toast. The Phase 11 acceptance criteria says "`+` opens creation flow for unscheduled items" — implementer must decide if a stub satisfies this or if the full chooser UI is required. Recommend: implement the full chooser UI in T60 so the integration point is clear for Phase 12.

**B2 — Icon design language (T60):**
T60 mentions "apply the updated icon design language (square/rounded-square icon style) to calendar sidebar buttons." This is the Phase 9 icon style. No gap — the style is documented in DESIGN_TOKENS.md — but implementer should cross-reference the Phase 9 icon treatment to ensure consistency.

**B3 — `usePathname` in sidebar (T60):**
`sidebar.tsx` currently uses `usePathname()` to detect active routes (per `src/components/layout/sidebar.tsx`). Calendar mode detection must use the same hook — no new routing mechanism needed.

---

## Summary

- Flows traced: 11
- Fully owned: 11
- Weak: 0
- Gaps: 0
- Deferred: 0
- **Status: PASS**
