# Issues — Phase 4.5

## Issue 1: Aging tokens in globals.css were dead code

- **Problem:** The aging token names `--aging-fresh-saturation`, `--aging-stagnant-saturation`, `--aging-neglected-saturation` existed in `globals.css` but were never consumed by any component. The actual aging behavior was driven entirely by hardcoded return values in `aging.ts`.
- **Root Cause:** The token names were defined during Phase 1 as reference values, but the utility function was written to return raw numbers and components constructed the filter string inline. The CSS variables were never wired to the runtime path.
- **Solution:** Renamed `getAgingSaturation()` → `getAgingFilter()`, returning full CSS filter strings. Updated both card components to apply the return value directly. Renamed the CSS tokens to `--aging-*-filter` with compound values for documentation alignment.
- **Learning:** Always trace the full call path before categorising a token change as "CSS-only." A token existing in `globals.css` does not mean it is consumed — verify with grep before assuming a CSS change will produce a visual effect.

## Issue 2: Aging classified as "token-only" in the initial split

- **Problem:** The initial analysis placed aging alignment in a "token-only fixes" bucket alongside `--page-bg` and dark `--card`/`--popover`. Codex correctly challenged this.
- **Root Cause:** The analysis was based on what *should* have been true (tokens driving behaviour) rather than what *was* true (hardcoded values in the utility function).
- **Solution:** Reclassified aging as requiring both token updates and implementation changes. Updated the execution plan accordingly before starting work.
- **Learning:** When a code change is described as "just updating a token," verify that the token is actually read at runtime. Audit the grep output, not the design intent.

## Summary

| # | Issue | Resolution |
|---|-------|------------|
| 1 | Aging CSS tokens were never consumed by components | Rewired aging through `getAgingFilter()` returning full filter strings |
| 2 | Aging mis-classified as token-only in initial analysis | Reclassified before implementation; no code impact |
