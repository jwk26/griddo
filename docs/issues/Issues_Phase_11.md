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
| Batch 2 | T61 | Pending |

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
