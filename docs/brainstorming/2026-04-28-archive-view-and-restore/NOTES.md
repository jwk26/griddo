# Archive View and Restore — Notes

## Important Semantic Cautions

These edge cases and design decisions should be preserved for implementation
planning:

### Archive View Node is a portal, not a container

Archived items retain their original `parentId`. They are NOT reparented to the
Archive View Node. The Archive View queries `archivedAt IS NOT NULL` across all
items — it does not look at its own children.

This distinction matters for restore: when an item is restored, it reappears at
its original location, not "inside the Archive View Node."

### Cascade archive uses a single shared timestamp

When archiving a Node, all descendants receive the same `archivedAt` timestamp
(not independent `Date.now()` calls). This ensures the restore window (±5
seconds) can reliably identify which descendants were archived as part of the
cascade vs. independently archived before the cascade.

### Restore window semantics

The ±5 second window for cascade restore mirrors the existing trash restore
pattern (`isWithinRestoreWindow` in `indexeddb.ts`). Items that were
independently archived before the cascade are left archived on restore.

### System nodes cannot be archived

Nodes with `systemRole !== null` (Inbox, Archive View) cannot be archived. The
UI must not offer "Archive" in context menus for system nodes. They can only be
hidden from grid via `hiddenFromGrid`.

### Archive is not a deletion path

Archive is a lifecycle state: "this work is done and should be out of sight."
Trash is destructive: "this should be deleted." These are distinct intents with
different visual treatment (warm/dignified vs. destructive tone).

### Completion does not auto-archive

Completion is a work-state signal. Archive is a lifecycle placement decision.
Completing a Node or Bit should not automatically remove it from the grid.

This preserves spatial trust: users can mark work complete without it
disappearing from its known location. Archive remains a manual action from a
context menu or another explicit archive affordance.

Completed-but-unarchived items are valid. Review Mode can later gather them as
archive candidates, but the user should also be able to archive manually without
waiting for Review Mode.

Scratch is different only because Inbox/Triage has a bounded completion moment:
when all Breakdown rows are placed and no staged candidates remain. At that
point the UI may offer an explicit Archive Scratch affordance; it still requires
user confirmation.

### Archive as prerequisite for Review Mode

Without Archive, Review Mode creates decisions but has no "done" destination.
The user reviews a completed Node, decides "this is finished," and has nowhere
to put it except leave it on the grid or trash it. Archive must exist before
Review Mode can feel complete.

## Discarded / Not Promoted from Source

No archive-specific alternatives were discarded. The `archivedAt` field approach
was selected early and remained stable throughout the ideation process.
