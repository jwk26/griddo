# Issues — Phase 6

## Issue 1: Codex wrote direct indexedDBStore imports in all data-touching files

- **Problem:** Codex generated `import { indexedDBStore } from "@/lib/db/indexeddb"` in 4 files (use-dnd.ts, use-global-urgency.ts, day-column.tsx, items-pool.tsx) despite the prompt specifying the DataStore facade pattern
- **Root Cause:** Codex pattern-matched against pre-existing files in the codebase (which still use direct imports) rather than following the architecture rules in the prompt
- **Solution:** Replaced all 4 imports with `getDataStore()` during the code quality pass
- **Learning:** When pre-existing code violates a rule, Codex will copy the violation. Include explicit "do NOT import from X, use Y instead" warnings and provide counter-examples alongside the architecture rules

## Issue 2: Chunk color resolution missing from colorMap

- **Problem:** Codex's `use-calendar-data.ts` colorMap only mapped Node IDs and Bit IDs to colors. Chunks (which need grandparent Node color via parentBit.parentId) fell back to the border color
- **Root Cause:** The Codex prompt described the resolution chain (Chunk -> parent Bit -> grandparent Node) but Codex stopped at Bit-level resolution
- **Solution:** Added explicit chunk traversal loop after the Bit color loop in useCalendarData
- **Learning:** Multi-hop data resolution (grandparent lookups) should be called out with a code snippet, not just described in prose

## Issue 3: Global urgency scanned root nodes only

- **Problem:** `useGlobalUrgency` called `dataStore.getNodes(null)` which returns only root-level Nodes. Nested Nodes with deadlines were invisible to the urgency dot
- **Root Cause:** `getNodes(parentId)` requires a parent — there was no `getAllActiveNodes()` method in the DataStore interface, so Codex used the only available method
- **Solution:** Added `getAllActiveNodes()` to DataStore interface and IndexedDB implementation, then used it in the hook
- **Learning:** Verify the DataStore interface has all the query methods needed BEFORE writing the Codex prompt. Missing facade methods cause Codex to either use the wrong method or bypass the facade

## Issue 4: Gemini post-code review failed (ENAMETOOLONG)

- **Problem:** The Gemini post-code review prompt (1950 lines of inlined file contents) triggered `ENAMETOOLONG` filesystem errors in Gemini's file reader tools. No review content was produced
- **Root Cause:** Gemini CLI's file stat operations received the inline code as a path string, exceeding OS path length limits
- **Solution:** Skipped the post-code review (per skill timeout/failure policy). Pre-code review had already been applied
- **Learning:** For Gemini prompts with >1000 lines of code, either split into multiple smaller prompts or use file path references instead of inlining content

## Issue 5: Component-to-DataStore boundary violation in Phase 6 code

- **Problem:** items-pool.tsx and day-column.tsx imported `getDataStore` directly for unschedule mutations, violating the "UI components import hooks, not DataStore" rule
- **Root Cause:** The unschedule-via-button pattern wasn't covered by the useDnd hook (which only handles DnD operations). Codex placed mutations at the simplest call site
- **Solution:** Extracted `useCalendarActions` hook with `unscheduleNode/Bit/Chunk` methods. Components now import hooks only
- **Learning:** When a new interaction pattern (button click vs DnD) performs the same mutation, plan the hook API to cover both entry points — not just the DnD path

## Issue 6: Items pool click handler was noop

- **Problem:** Codex left `onClick={() => {}}` on pool items despite Task 28 specifying "Clickable -> opens Bit detail popup"
- **Root Cause:** The pool items are on a calendar route (`/calendar/weekly`), and the Bit detail popup is URL-driven via `?bit=[id]`. Codex may have been uncertain whether the popup renders on calendar routes
- **Solution:** Wired onClick to `router.push(`?bit=${bitId}`)` for Bits and `?bit=${parentId}` for Chunks
- **Learning:** When click targets open URL-driven popups from a new route, explicitly confirm in the prompt that the popup component renders on that route

## Summary

| # | Issue | Resolution |
|---|-------|------------|
| 1 | Codex wrote direct indexedDBStore imports | Replaced with getDataStore() facade |
| 2 | Chunk color resolution missing | Added grandparent Node lookup in colorMap |
| 3 | Global urgency root-only scan | Added getAllActiveNodes() to DataStore |
| 4 | Gemini post-code ENAMETOOLONG | Skipped; pre-code review applied |
| 5 | Component→DataStore boundary violation | Extracted useCalendarActions hook |
| 6 | Items pool click handler was noop | Wired to router.push with bit param |
