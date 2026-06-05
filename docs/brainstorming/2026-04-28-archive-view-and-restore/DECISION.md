# Archive View and Restore

## Metadata

- Created: 2026-04-28
- Readiness: code-ready
- Category: deferred task
- Source project: griddo2-claude
- Source topic: migrated from out_of_phase ideation
- Source prototype: n/a
- Tags: archive, archivedAt, restore, lifecycle, archive-view
- Dependencies: 2026-04-28-lifecycle-system-foundation

## Summary

Archive provides a "done" destination for completed work — distinct from Trash's
destructive semantics. Without Archive, completed Nodes sit on the grid forever,
aging and consuming space.

Archive is implemented as a lifecycle state (`archivedAt` timestamp) plus a
dedicated Archive View surface accessed through a system Node at L0.

Completion and Archive are separate concepts. Marking a Node or Bit complete
does not automatically archive it. Archive is an explicit lifecycle action that
the user triggers from context menu or another clearly labeled archive affordance.

## Mechanism

1. Set `archivedAt: Date.now()` on the item
2. Grid queries filter `archivedAt = null` (items disappear from grid)
3. Restore: clear `archivedAt` → item reappears at original position

Schema fields, indexes, and cascade hooks are defined in
`2026-04-28-lifecycle-system-foundation`.

## Archive View Node

The Archive View Node at L0 (`systemRole: 'archive_view'`) is a **portal, not a
container**. Clicking it opens the Archive View surface, which queries all items
where `archivedAt` is set.

Archived items retain their original `parentId`. They are NOT reparented to the
Archive View Node.

## Archive View Surface

```
┌─────────────────────────────────────────────┐
│  Archive                    [Search...]     │
│                                             │
│  ── L0 Nodes ──                             │
│  ✓ Old Project (archived 2026-04-01)  [↩]  │
│  ✓ Q1 Planning (archived 2026-03-15) [↩]  │
│                                             │
│  ── Work > API ──                           │
│  ✓ Deploy v2 (archived 2026-04-10)   [↩]  │
│  ✓ Fix rate limiter (archived ...)    [↩]  │
│                                             │
│  ── Personal ──                             │
│  ✓ Tax filing (archived 2026-04-15)  [↩]  │
└─────────────────────────────────────────────┘
```

| Feature | V1 Spec |
|---------|---------|
| Grouping | By original parent Node. Archived L0 Nodes in their own top-level group |
| Sorting | `archivedAt` descending within each group |
| Search | Available — filters by title |
| Restore | Single-item. ↩ clears `archivedAt`. BFS auto-placement if original position occupied |
| Bulk restore | Not in v1 |
| Visual tone | Warm/dignified — distinct from Trash's destructive tone. Completed items show ✓ prominently |

## Direct Archive from Grid

Users can archive any non-system Node or Bit from its context menu without
needing Review Mode. Sets `archivedAt` with cascade (Hook 10).

System nodes (`systemRole !== null`) are excluded — they can only be hidden from
grid via `hiddenFromGrid`.

Completion does not trigger this action automatically. Completed-but-unarchived
items remain visible in their original grid location until the user archives
them. Review Mode may later surface these items as archive candidates, but Review
Mode is not required for manual archive.

Scratch has one narrow exception in the Inbox/Triage workflow: when all Breakdown
rows for a Scratch are placed and no staged candidates remain, the user may be
shown an explicit Archive Scratch affordance. Confirming that affordance archives
the Scratch Bit; declining leaves it active in Inbox.

## Related Future Ideas

- `2026-04-28-lifecycle-system-foundation` — schema prerequisite
- `2026-05-26-archive-auto-cleanup` — auto-cleanup policy (retention period TBD)
- `2026-04-28-review-mode` — Archive is a hidden dependency: Review Mode needs
  a "done" destination for completed work
