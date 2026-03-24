# Issues — Phase 1

## Issue 1: Scaffold fails in non-empty directory

- **Problem:** `pnpm create next-app@latest .` refuses to run when the target directory contains existing files (`.omc/`, `CLAUDE.md`, `docs/`).
- **Root Cause:** `create-next-app` requires an empty directory or a net-new folder name.
- **Solution:** Scaffolded into a sibling `../scaffold-tmp` directory, then `rsync`'d output into the project directory and deleted the temp folder.
- **Learning:** Always scaffold into a fresh sibling directory when the target has pre-existing files. npm package names cannot start with `_` — use `scaffold-tmp`, not `_scaffold-tmp`.

## Issue 2: shadcn init interactive prompts cannot be fully automated

- **Problem:** `pnpm dlx shadcn@latest init` does not support `--style` or `--base-color` CLI flags. The `-y` flag still triggers interactive prompts for component library selection.
- **Root Cause:** shadcn CLI v2+ changed its flag surface — style/base-color are configured via prompts, not flags.
- **Solution:** Created `components.json` manually with the correct configuration, then ran `shadcn add` to install components.
- **Learning:** For shadcn with Tailwind v4, create `components.json` manually rather than relying on `init`. The file format is stable and well-documented.

## Issue 3: shadcn add does not install class-variance-authority

- **Problem:** Build failed after `shadcn add button` — `Cannot find module 'class-variance-authority'`.
- **Root Cause:** `shadcn add` installed components that import CVA but didn't add it as a dependency.
- **Solution:** Manually installed: `pnpm add class-variance-authority`.
- **Learning:** After `shadcn add`, verify that all peer/transitive dependencies are present. CVA is a known gap.

## Issue 4: promoteBitToNode assigned wrong hierarchy level

- **Problem:** Codex implemented `level: parent.level` for the promoted node, making a child of a level-0 node also level 0 instead of level 1.
- **Root Cause:** SCHEMA.md Hook 9 contained an ambiguous formula (`level = parentNode.level`) that contradicted its own parenthetical clarification ("same level as the Bit's grid position", which is `parentNode.level + 1`).
- **Solution:** Fixed implementation to use `parent.level + 1`. Added guard rejecting promotion at level 3. Corrected SCHEMA.md wording.
- **Learning:** When spec text contradicts its own clarification, resolve the ambiguity before delegating to Codex. Codex follows formulas literally.

## Issue 5: Restore fallback used linear scan instead of BFS

- **Problem:** When restoring an item whose original grid position was occupied, `findFirstAvailableCell()` scanned from (0,0) top-left instead of BFS from the original position.
- **Root Cause:** BFS utility was deferred to Phase 2, so Codex used a simple linear scan as instructed in the prompt. But the scan direction didn't match the "nearest empty cell" spec requirement.
- **Solution:** Implemented `findNearestEmptyCell()` with BFS (8-directional) from the original position. Kept `findFirstAvailableCell()` for promotion (new empty grid, no origin point).
- **Learning:** Even when a utility is deferred, stub the correct algorithm shape (BFS from origin), not a fundamentally different algorithm (linear scan).

## Issue 6: Turbopack sandbox build restriction

- **Problem:** First `pnpm build` run failed due to Turbopack process-binding restriction around Geist CSS in the sandbox environment.
- **Root Cause:** Sandbox environment limitation, not a code error.
- **Solution:** Build passes when run outside the sandbox.
- **Learning:** Turbopack build failures in sandboxed environments may be false negatives. Re-run outside sandbox to confirm.

## Summary

| # | Issue | Resolution |
|---|-------|------------|
| 1 | Scaffold in non-empty dir | Sibling temp dir + rsync |
| 2 | shadcn init not fully automated | Manual components.json |
| 3 | CVA not auto-installed by shadcn | Manual `pnpm add class-variance-authority` |
| 4 | promoteBitToNode wrong level | Fixed to `parent.level + 1`, corrected spec |
| 5 | Restore fallback linear scan | Replaced with BFS from original position |
| 6 | Turbopack sandbox restriction | Re-run outside sandbox |
