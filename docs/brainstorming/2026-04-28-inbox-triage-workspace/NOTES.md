# Inbox / Triage Workspace — Notes

## Resolved Questions

### OQ #6 — Scratch Storage Model (Resolved 2026-05-29)

Scratch is stored as a Bit inside the Inbox Node (`parentId` = Inbox Node ID).
No new type. Scratch Bits use `x = 0, y = 0` as a sentinel; the grid-cell
uniqueness / placement validation rule is excepted for Inbox-parent Bits.
Items are sorted by `createdAt` in the Triage layout.

### OQ #7 — Breakdown Idea Persistence (Resolved 2026-05-29)

Breakdown rows use a dedicated `scratchBreakdowns` store (not Chunk reuse).
Chunk reuse was rejected because Chunk participates in Hook 3 (Bit
Auto-Completion) and lacks `createdAt`. The dedicated store has:

- `scratchBitId` — FK to the Scratch Bit
- `content`, `order`, `createdAt` — display and ordering
- `consumedAt` — null = unconsumed; timestamp = consumed (line-through, not deleted)

Full store definition in `2026-04-28-lifecycle-system-foundation`.

### OQ #8 — Candidate Commit Timing (Resolved 2026-05-29)

Staging is UI state only. Node/Bit records are created when a candidate is
placed into the Hierarchy Explorer. On placement, the source `scratchBreakdowns`
row is marked `consumedAt`. When all breakdowns are consumed and no staged
candidates remain, the user is prompted to archive the Scratch (not delete it).

V1 keeps staged candidates lightweight:

- Staged candidates are not edited inline. To revise content, cancel/remove the
  staged candidate, edit the source Breakdown row, then stage it again.
- Dropping a staged candidate into the Hierarchy Explorer opens a confirmation
  dialog before creating the Node/Bit. Canceling the dialog keeps the staged
  candidate in Staging.
- The confirmation dialog must show the source content, candidate type,
  destination hierarchy path, and result summary before any record is created.
- Directly dropping a Breakdown row into the Hierarchy Explorer is allowed as a
  fast path, but it still opens confirmation and requires explicit Node/Bit type
  selection. No type is preselected.
- If the destination target has no available grid cell, confirmation remains
  visible but the confirm action is disabled with the reason.
- Removing a staged candidate uses a drag-to-`Remove from staging` interaction,
  not a per-card `X` button. The target appears while dragging staged candidates
  and reuses the existing grid drag deletion affordance language.
- Removing a staged candidate is not destructive: the source Breakdown row
  returns to active display and `consumedAt` remains `null`.
- Staging is scoped to the currently selected Scratch. Candidates from different
  Scratches are not mixed; switching the selected Scratch loses no persisted data
  because candidates are UI-only and source Breakdown rows stay unconsumed.

Inbox/Triage uses compact drag tokens instead of dragging the full row/card.
This prevents long Breakdown rows or staged Bit candidates from obscuring the
drop target. The same issue exists in broader Grid DnD, especially for horizontal
Bit cards; see `2026-06-02-grid-dnd-preview-and-drop-targeting`.

### OQ #9 — Inbox Badge Pressure Threshold (Resolved 2026-05-29)

Three-level model: 0=hidden, 1–7=neutral, 8–14=warm, 15+=high-pressure.
Exact count. Thresholds go in `constants.ts`. Badge colors use semantic tokens
(not hard-coded HSL values).

## Discarded / Not Promoted from Source

- **Inbox as a normal GridDO grid:** Dropped. Inbox should process unstructured
  thought, not become another permanent spatial workspace. The Triage layout
  renders items as a chronological list, not spatially.
- **Triage as only a destination selector:** Dropped. Captured thoughts often
  need breakdown before placement. A simple "pick a Node" selector is
  insufficient — the Breakdown/Scribble step is essential.
- **Continue Phase 15 / Task 68 immediately:** Deferred. Quarterly planning
  depends on a more mature daily work lifecycle. The daily interaction model
  needs to mature first.
- **Reuse Chunk for scratchBreakdowns:** Dropped. Chunk participates in Hook 3
  (Bit Auto-Completion) and lacks `createdAt`. A dedicated store avoids hook
  interference.

## Structure Settlement History

The Inbox/Triage page structure evolved through several stages:

1. Initial concept: simple inbox list + destination picker (dropped as too thin)
2. Added Breakdown/Scribble for idea decomposition before placement
3. Added Node/Bit Staging as a separate conversion area
4. Added Hierarchy Explorer for visual placement across Home-L3
5. Final structure settled: Scratch Pool + Breakdown + Staging + Hierarchy

The visual theme is not final. The structure should be treated as stable. Final
styling should later be adapted using the design direction from theme
exploration (see `2026-05-28-inbox-triage-theme-variants`).
