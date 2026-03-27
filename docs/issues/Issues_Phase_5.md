# Issues — Phase 5

## Issue 1: Branch Base Mismatch — Phase 5 Work on Phase 4 Branch Line

- **Problem:** Phase 5 implementation was continued on the existing `phase-4/grid-navigation-bit-cards` branch instead of a clean `phase-5/...` branch created from `origin/main` after Phase 4 merged.
- **Root Cause:** Branch creation step was skipped or the wrong branch was active when Phase 5 work began.
- **Solution:** Reconstructed `phase-5/bit-detail-application-hooks` on the correct base. Missing files (`chunk-item.tsx`, `chunk-pool.tsx`, `chunk-timeline.tsx`) and the missing popup animation export (`grid.ts`) were recovered via a targeted fix commit.
- **Learning:** Always verify branch base before writing code. `git log --oneline origin/main..HEAD` should be empty at the start of a new phase. The `execute-next-phase` skill now enforces this check explicitly.

## Issue 2: Missing Bit Detail Component Files

- **Problem:** Three new component files required by Phase 5 (`chunk-item.tsx`, `chunk-pool.tsx`, `chunk-timeline.tsx`) were absent from the branch at close-out time.
- **Root Cause:** Branch repair via cherry-pick omitted these files. They were in the Phase 4 branch history but not part of the cherry-picked commits.
- **Solution:** Files were recovered and committed in the fix commit `fix: recover phase 5 branch omissions and align workflow gates`.
- **Learning:** After any cherry-pick repair, verify the full expected file set against the execution plan — not just that tests pass and the build compiles.

## Issue 3: Redundant `as any` Casts in Test Files

- **Problem:** Five test files (`mtime-cascade`, `auto-completion`, `deadline-hierarchy`, `grid-uniqueness`, `promotion`) used `as any` to pass `FakeTable<T>` to `IndexedDBDataStore`. This caused 18 `@typescript-eslint/no-explicit-any` lint errors.
- **Root Cause:** `FakeTable<T>` already satisfies `TableLike<T>` (the type `IndexedDBDataStore` expects). The casts were redundant and incorrect.
- **Solution:** Removed all `as any` casts. No behavior change.
- **Learning:** When writing test fakes, verify the fake already satisfies the expected interface before adding type casts. A cast that silences a real type error is different from one that's purely redundant.

## Issue 4: `setState` Called Synchronously in `useEffect`

- **Problem:** `bit-detail-popup.tsx` called `setLocalTitle` and `setLocalDescription` synchronously inside a `useEffect` body, triggering the `react-hooks/set-state-in-effect` lint rule.
- **Root Cause:** Derived state sync pattern (reset local editing state when bit identity changes) — the correct intent, but the linter flags synchronous setState in effect bodies.
- **Solution:** Added `// eslint-disable-next-line react-hooks/set-state-in-effect` before the first setState call. The pattern is valid for this use case (resetting local form state on entity change).
- **Learning:** This pattern is acceptable for "reset on identity change" use cases. Document the intent in the comment so reviewers understand it is not a performance issue.

## Issue 5: Unescaped Apostrophes in JSX Text

- **Problem:** `deadline-conflict-modal.tsx` had bare `'` characters in JSX text content ("parent's"), triggering `react/no-unescaped-entities` lint errors.
- **Root Cause:** Standard apostrophes in natural language text must be escaped in JSX.
- **Solution:** Replaced with `&apos;` HTML entity.
- **Learning:** In JSX text content, always use `&apos;` for apostrophes. Linters catch this but it is easy to miss during code generation.

## Issue 6: Architecture Conformance — Urgency Hooks Bypass DataStore Facade

- **Problem:** `use-node-urgency.ts` and `use-global-urgency.ts` import `{ db }` directly from `indexeddb.ts` and call Dexie table methods inside `liveQuery`. The established pattern (used by all prior hooks) is `liveQuery(() => indexedDBStore.someMethod())`.
- **Root Cause:** The new hooks needed reactive reads but were written with direct Dexie access instead of going through the DataStore facade.
- **Resolution:** Deferred to Phase 5.5 (Task 25.5). The fix requires adding `getBitsForNode()` and `getAllActiveBits()` read methods to the DataStore interface, then refactoring the hooks.
- **Learning:** When adding new reactive hooks, always use `liveQuery(() => indexedDBStore.method())` — not `db.table.where(...)`. Dexie tracks underlying table operations for reactivity regardless of whether they go through the facade.

---

## Summary

| # | Issue | Resolution |
|---|-------|------------|
| 1 | Branch base mismatch — Phase 5 on Phase 4 branch line | Reconstructed branch on correct base; skills updated |
| 2 | Missing bit-detail component files after cherry-pick repair | Recovered in fix commit |
| 3 | Redundant `as any` casts in test files (18 lint errors) | Removed casts — `FakeTable<T>` already satisfies `TableLike<T>` |
| 4 | `setState` in `useEffect` lint error in bit-detail-popup | eslint-disable comment; pattern is valid for derived state reset |
| 5 | Unescaped apostrophes in JSX (deadline-conflict-modal) | Replaced with `&apos;` |
| 6 | Urgency hooks bypass DataStore facade | Deferred to Phase 5.5 (Task 25.5) |
