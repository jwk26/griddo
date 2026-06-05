# Out-of-Phase Issues

This file records work that happened outside the active phase task plan. These
entries should not be retroactively classified as part of a phase unless the
phase plan is explicitly amended.

---

## OOP-1 — Motion extraction after Phase 14 close-out

**Status:** Resolved in isolated worktree  
**Category:** Out-of-phase design-system / motion extraction work  
**Timing:** After Phase 14 close-out, before the next planned phase began  
**Base phase context:** Phase 14 Monthly Redesign was already closed at
`9ee1ff8 docs: close phase 14 — update plan, log issues and learnings`

### Context

The user requested a focused extraction of motion behavior from the original
`griddo` project after Phase 14 had been closed. The work was intentionally
performed outside the main working tree in a separate worktree:

- Worktree: `/Users/jwk/Documents/griddo2-claude-extract`
- Branch: `griddo2-claude-extract`
- Implementation commit: `a1755e3 feat: extract GridDO motion language`
- Review-fix commit: `de0cd94 fix: address motion extraction review`

### Scope

Extracted and adapted these original GridDO behaviors:

- Node hover scale and layering
- Node drag lift scale and layering
- Sidebar pencil drag-target affordance
- Smooth dark mode color/background transition

The work also introduced a reusable runtime motion token layer and documented
the motion language in `docs/DESIGN_TOKENS.md`.

### Why this is out of phase

This work is not part of Phase 14 Monthly Redesign. Phase 14 was focused on the
monthly calendar surface and was already closed before this motion extraction
began. The motion work affects shared grid, layout, calendar animation tokens,
sidebar behavior, and global theme transition behavior, so it should be reviewed
and merged as a standalone feature branch rather than as a Phase 14 continuation.

### Resolution / integration note

Keep this work classified as a standalone motion extraction. Merge
`griddo2-claude-extract` only after reviewing it independently from Phase 14.
Do not backfill the work into `docs/issues/Issues_Phase_14.md`.
