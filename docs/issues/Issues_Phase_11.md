# Issues — Phase 11: Calendar Shell

## Batch Plan

### Original Proposal

| Batch | Tasks | Classification |
|-------|-------|----------------|
| Batch 1 | T60 — Calendar Sidebar + Header Redesign | ui-heavy |
| Batch 2 | T61 — Pool Fold/Unfold | ui-heavy (motion-sensitive) |

**Rationale:** T60 is broad ui-heavy work (sidebar icon changes, header restructure, toggle relocation, border removal). T61 adds a separate animation concern (AnimatePresence/motion.div pool fold) that deserves its own Gemini spec and checkpoint. T61 depends on T60's foundation. Shared file overlap in `calendar/layout.tsx` is acceptable and does not justify combining.

### Execution Status

| Batch | Tasks | Status |
|-------|-------|--------|
| Batch 1 | T60 | Implemented |
| Batch 2 | T61 | Implemented |

### Deviations

None.

---

## Issues

### Issue 1 — PopoverTrigger asChild broken: SidebarIconButton not a forwardRef component

**Category:** Bug (post-implementation, caught by manual testing)
**Status:** Fixed

**Description:** The chooser popover did not open when `+` was clicked on calendar routes. `PopoverTrigger asChild` uses Radix Slot which injects a merged `onClick` and `ref` into the child via `cloneElement`. `SidebarIconButton` was a plain function component — it did not forward `ref` to the underlying `<button>`, and did not spread Radix-injected props (`data-state`, `aria-expanded`, etc.), breaking the trigger wiring.

**Fix:** Converted `SidebarIconButton` to `forwardRef`. Type extended with `Omit<ComponentPropsWithoutRef<"button">, "title" | "onClick">` so Radix-injected props are accepted and spread onto the button. `onClick` changed to optional (`onClick?`) to be compatible with the extended type.

**Test gap noted:** `sidebar.test.tsx` masks this class of bug — its `PopoverTrigger` mock manually calls `onOpenChange` via `cloneElement` rather than modeling actual Radix Slot/asChild behavior. The test passes regardless of whether the real trigger wiring works. Fixing the mock would require using the real Radix Popover in tests (significant test refactoring; deferred).

### Issue 2 — Disabled Pencil hover bleeds through; Escape leaves focus ring on chooser option

**Category:** Bug (post-implementation, caught by manual testing)
**Status:** Fixed

**Description:**
1. Pencil button on calendar routes: `opacity-40` dimmed the button but `hover:bg-accent hover:text-foreground` still activated on hover, making it read as a hoverable control.
2. Chooser popover: pressing Escape left a visible `:focus-visible` ring on the Node or Bit option that had focus before close.

**Fixes:**
1. Added `pointer-events-none` to the disabled Pencil's `className`. CSS `:hover` no longer fires on the button; pointer events pass through to the `cursor-not-allowed` wrapper div, so the cursor remains correct. `disabled` attribute still owns semantic inertness.
2. Added `onEscapeKeyDown={() => { (document.activeElement as HTMLElement)?.blur(); }}` to `PopoverContent`. This blurs the focused option before Radix processes the close, removing the visual ring. Radix still returns focus to the trigger via its own `onCloseAutoFocus` mechanism — no global focus suppression.

### Issue 3 — Pool toggle button missing focus-visible ring

**Category:** Accessibility gap (caught by Gemini post-code review)
**Status:** Fixed

**Description:** The collapse/expand toggle button in `calendar/layout.tsx` had `hover:bg-accent` but no `focus-visible` styles. Keyboard users navigating to the button had no visual focus indicator.

**Fix:** Added `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1` to the toggle button className, matching the codebase standard used in `SidebarIconButton`.

### Note — AnimatePresence without motion.div child

**Category:** Observation (Gemini post-code review, not a spec violation)
**Status:** Accepted as-is

`AnimatePresence` wraps the pool content but the immediate child is a plain `div`, not a `motion.div` with an `exit` prop. This means the content unmounts instantly rather than fading. The Gemini spec specified unmounting as the visibility strategy (not a fade-out), and `motion.aside overflow-hidden` clips the content during the 250ms width animation, providing adequate visual transition. No exit animation on the content wrapper is required.
