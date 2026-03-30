# Issues — Phase 5.5

## Issue 1: vitest mock hoisting — ReferenceError on direct mock variable reference

- **Problem:** Using `createChunkMock` directly as the mock value in a `vi.mock()` factory caused `ReferenceError: Cannot access 'createChunkMock' before initialization` at test runtime.
- **Root Cause:** `vi.mock()` factories are hoisted to the top of the file by vitest's transform. A plain `const createChunkMock = vi.fn(...)` is initialized after the factory runs, so the variable doesn't exist yet when the factory is evaluated.
- **Solution:** Declare the mock with `vi.hoisted()`: `const createChunkMock = vi.hoisted(() => vi.fn(async () => undefined))`. `vi.hoisted()` runs its callback at hoist time, making the variable available to the `vi.mock()` factory.
- **Learning:** Any variable referenced inside a `vi.mock()` factory must be declared with `vi.hoisted()`. The original workaround `(...args: unknown[]) => createChunkMock(...args)` deferred the reference to avoid hoisting, but introduced TS2556. `vi.hoisted()` is the idiomatic fix.

## Issue 2: Wrong eslint-disable rule for exhaustive-deps

- **Problem:** A `// eslint-disable-next-line react-hooks/set-state-in-effect` comment was added inside a `useEffect` body to silence a lint warning, but the warning persisted.
- **Root Cause:** `react-hooks/set-state-in-effect` is not a real ESLint rule — it silenced nothing. The actual warning was `react-hooks/exhaustive-deps` on the closing `}, [bit?.id])` line, flagging `bit.title` and `bit.description` as missing dependencies.
- **Solution:** Remove the wrong disable; place `// eslint-disable-next-line react-hooks/exhaustive-deps` on the line immediately before the closing `}, [deps])`.
- **Learning:** The `exhaustive-deps` disable must go on the deps array line, not inside the effect body. When intentionally omitting deps (derived state reset on identity change), the comment belongs at the closing brace.

## Summary

| # | Issue | Resolution |
|---|-------|------------|
| 1 | vitest mock hoisting ReferenceError | Use `vi.hoisted()` for variables referenced in `vi.mock()` factories |
| 2 | Wrong eslint-disable rule left warning unfixed | Replace with `react-hooks/exhaustive-deps` on the deps array line |
