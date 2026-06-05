# Lifecycle System Foundation

## Metadata

- Created: 2026-04-28
- Readiness: code-ready
- Category: deferred task
- Source project: griddo2-claude
- Source topic: migrated from out_of_phase ideation
- Source prototype: n/a
- Tags: schema, systemRole, archivedAt, hiddenFromGrid, system-nodes, indexes, lifecycle
- Dependencies: none

## Summary

Schema and infrastructure changes that enable GridDO's lifecycle system. This
is not a user-facing feature by itself — it is the foundation that Quick
Capture, Inbox/Triage, Archive, and Rollup/Focus depend on.

All lifecycle features require these schema changes to be in place first.

## Dependents

The following future ideas depend on this foundation:

- `2026-04-28-quick-capture-entry-surface`
- `2026-04-28-inbox-triage-workspace`
- `2026-04-28-archive-view-and-restore`
- `2026-04-28-node-rollup-focus-aging` (depends on foundation, independent of the above)

## Schema Changes

### New Fields

#### Node: `systemRole`

```typescript
systemRole: z.enum(['inbox', 'archive_view']).nullable().default(null)
```

| Value | Meaning |
|-------|---------|
| `null` | Regular user-created Node |
| `'inbox'` | System Inbox Node. Internal view renders the Scratch structuring workspace |
| `'archive_view'` | System Archive View Node. Clicking opens the Archive View surface. Not a container — archived items retain their original `parentId` |

Constraints:
- Uniqueness: application-level enforcement for non-null values only. Before creating or updating a Node with `systemRole !== null`, verify no other Node has the same value. The index is normal (non-unique) — Dexie does not support unique constraints on nullable fields where many rows share `null`
- Immutable after creation: system queries by `systemRole`, not by title/icon
- User may customize `title`, `icon`, `color` freely

#### Node + Bit: `archivedAt`

```typescript
archivedAt: timestampSchema.nullable().default(null)
```

Mirrors `deletedAt` semantics:
- `null` = active (visible on grid)
- Timestamp = archived (hidden from grid, visible in Archive View)
- All grid queries add `archivedAt = null` to existing `deletedAt = null` filter
- Restoring clears `archivedAt` — item reappears at original position (`parentId`, `x`, `y` preserved)

#### Node: `hiddenFromGrid`

```typescript
hiddenFromGrid: z.boolean().default(false)
```

Allows system nodes to be removed from L0 grid display without trashing. When `true`, the Node is not rendered on the grid but remains accessible from the sidebar.

- Only applicable to system nodes (`systemRole !== null`)
- Sidebar always queries nodes where `systemRole !== null`, regardless of `hiddenFromGrid`
- "Show on Grid" reverses: sets `hiddenFromGrid = false`, BFS auto-placement if original `(x, y)` occupied

### New Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_nodes_systemRole` | `systemRole` | Find system nodes by role |
| `idx_nodes_archivedAt` | `archivedAt` | Filter active vs archived |
| `idx_bits_archivedAt` | `archivedAt` | Filter active vs archived |
| `idx_nodes_active_full` | `[parentId, deletedAt, archivedAt]` | Compound: active, non-archived children |
| `idx_bits_active_full` | `[parentId, deletedAt, archivedAt]` | Compound: active, non-archived Bits |

### New Object Store: `scratchBreakdowns`

Stores per-Scratch idea rows created in the Breakdown/Scribble area. A dedicated
store (not Chunk reuse) because breakdown rows must not participate in Bit
auto-completion (Hook 3), require `createdAt` for display ordering, and have an
independent `consumedAt` lifecycle.

```typescript
scratchBreakdowns: {
  id: string                 // uuid
  scratchBitId: string       // FK → Bit.id (parentId = Inbox Node)
  content: string
  order: number
  createdAt: number          // timestamp
  consumedAt: number | null  // null = unconsumed; timestamp = consumed (line-through, not deleted)
}
```

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_scratchBreakdowns_by_scratch` | `[scratchBitId, order]` | Retrieve rows sorted by order |
| `idx_scratchBreakdowns_scratchBitId` | `scratchBitId` | Bulk delete on Scratch Bit removal |

### Scratch Bit Placement

All Scratch Bits use `x = 0, y = 0` as a sentinel. The grid-cell uniqueness /
placement validation rule is excepted for Bits whose `parentId` is the Inbox
Node. The Triage layout renders Scratch items by `createdAt` order, ignoring
grid coordinates.

### Query Changes

All existing "active items" queries must add `archivedAt = null` alongside `deletedAt = null`. L0 grid rendering must also exclude `hiddenFromGrid = true`:

- Active grid contents (`+ archivedAt = null`, L0 also `+ hiddenFromGrid = false`)
- Node completion check (`+ archivedAt = null`)
- Calendar items (`+ archivedAt = null`)
- Badge computation (`+ archivedAt = null`)
- Global urgency (`+ archivedAt = null`)
- Text search (`+ archivedAt = null`)
- Grid occupancy (`+ archivedAt = null`)

Note: The compound index `[parentId, deletedAt, archivedAt]` may not cover the final L0 access pattern once `hiddenFromGrid` is added. Implementation should evaluate whether an additional compound index is needed or whether application-level filtering is sufficient (system nodes are few).

## Default System Nodes

On first app launch (or migration), the system creates two Nodes:

| Property | Inbox Node | Archive View Node |
|----------|-----------|------------------|
| `systemRole` | `'inbox'` | `'archive_view'` |
| `title` | "Inbox" | "Archive" |
| `icon` | `"inbox"` | `"layers"` |
| `color` | `hsl(221, 83%, 53%)` | `hsl(240, 4%, 46%)` |
| `parentId` | `null` | `null` |
| `level` | `0` | `0` |

Scratch Bit items (Bits stored in the Inbox Node) use `"sparkles"` as their
system default icon.

### System Node Behavior Rules

| Rule | Detail |
|------|--------|
| Deletable from Grid | Yes — sets `hiddenFromGrid = true`. Retains valid `x/y` for re-showing |
| Persistent in Sidebar | Always shown in sidebar regardless of grid presence |
| Movable | Yes — can be repositioned on L0 grid |
| Customizable | Title, icon, color are editable. `systemRole` is immutable |
| Re-creatable | If no Node with the required `systemRole` exists, system offers to recreate |
| Visual distinction | Default icon/color should clearly differ from user-created Nodes |

### Route Behavior

System nodes use the standard URL pattern `/grid/[nodeId]` but render differently based on `systemRole`:

| `systemRole` | Renders |
|-------------|---------|
| `null` | Standard grid view |
| `'inbox'` | Triage layout |
| `'archive_view'` | Archive View |

No new routes needed.

## Application Hooks

### Hook 10: Archive Cascade

System nodes (`systemRole !== null`) cannot be archived. The UI must not offer "Archive" for system nodes.

When a **Node** is archived:
1. Create one shared timestamp: `const archiveTimestamp = Date.now()`
2. Set `archivedAt = archiveTimestamp` on the Node and all descendant Nodes and Bits (same pattern as soft-delete cascade, Hook 4). Single timestamp ensures restore can identify cascade members
3. Chunks become inaccessible via archived parent Bit (no update needed)

When a **Bit** is archived:
1. Set `archivedAt = Date.now()` on the Bit

### Hook 11: Archive Restore

Uses the same timestamp-window approach as trash restore. On restore, only descendants whose `archivedAt` falls within ±5 seconds of the parent's `archivedAt` are restored — items independently archived before the cascade are left archived.

When a **Node** is restored:
1. Find descendants whose `archivedAt` is within 5 seconds of this Node's `archivedAt`
2. Set `archivedAt = null` on matched descendants only
3. If original `(x, y)` occupied → BFS auto-placement

When a **Bit** is restored:
1. If parent Node is archived → restore parent chain (using same window rule)
2. If original `(x, y)` occupied → BFS auto-placement

### Scratch Bit Permanent Deletion

When a Scratch Bit is permanently deleted (hard delete after trash retention or
explicit purge), all associated `scratchBreakdowns` rows are hard-deleted.
Archive does not trigger this cleanup — archived Scratch Bits retain their
breakdown history through a potential restore.
