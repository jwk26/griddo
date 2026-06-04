# Lifecycle System Foundation — Notes

## Resolved Questions

### OQ #5 — System Node Default Icon/Color (Resolved 2026-05-29)

System node defaults confirmed:

| Node | `icon` | `color` |
|------|--------|---------|
| Inbox | `"inbox"` | `hsl(221, 83%, 53%)` |
| Archive View | `"layers"` | `hsl(240, 4%, 46%)` |

Scratch Bit items (stored in Inbox) use `"sparkles"`.

Icons are stored as lowercase strings (e.g. `"inbox"`, `"layers"`, `"sparkles"`).
Colors are stored as raw HSL with spaces: `hsl(R, G%, B%)` — matches
`Node.color` schema format.

## Architecture Notes

### Hook Participation as Store Decision Criterion

The `scratchBreakdowns` store was created as a dedicated store (not Chunk reuse)
because:

- Breakdown rows must NOT trigger Hook 3 (Bit Auto-Completion). Reusing Chunk
  would cause Hook 3 to fire when all breakdown rows are "consumed," conflicting
  with auto-completion semantics.
- Chunk has no `createdAt` field — breakdown rows need it for display order.
- `consumedAt` is a lifecycle concept independent of Chunk semantics.

Rule: if data must not participate in an existing hook, it warrants a dedicated
store rather than reuse of an existing type.

## Discarded / Not Promoted from Source

- **Treat Inbox as a normal GridDO grid:** Dropped. Inbox should process
  unstructured thought, not become another permanent spatial workspace.
- **Keep temporary prototype worktrees as durable references:** Dropped. Useful
  decisions are absorbed into DECISION.md files. Worktree paths are convenience
  pointers only.
- **Reuse Chunk for scratchBreakdowns:** Dropped. Chunk participates in Hook 3
  (Bit Auto-Completion) and lacks `createdAt`. A dedicated store is safer and
  avoids hook interference.
