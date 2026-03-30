# GridDO — Data Schema

> **Scope:** This document specifies the data model. Architecture decisions live in SPEC.md.
> **Storage:** IndexedDB (local-first, single-user, no auth/RLS).
> **Validation:** Zod schemas with TypeScript type inference.

---

## Table of Contents

- [Object Stores](#object-stores)
  - [nodes](#nodes)
  - [bits](#bits)
  - [chunks](#chunks)
- [Zod Validation Schemas](#zod-validation-schemas)
- [Application Hooks](#application-hooks)
- [Key Queries](#key-queries)

---

## Object Stores

### nodes

Category/container items displayed as mobile app-style icons on the grid. Nodes can nest other Nodes and Bits.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | `string` | PK, UUID | `crypto.randomUUID()` | Unique identifier |
| `title` | `string` | NOT NULL, min 1 char | — | Node name. Nouns preferred (e.g., "Workout", "Finance") |
| `description` | `string` | — | `""` | Shown below breadcrumb when inside the Node's grid |
| `color` | `string` | NOT NULL | — | HSL color string (e.g., `"hsl(210, 80%, 55%)"`) for icon/accent. Propagates to child Bits at low saturation |
| `icon` | `string` | NOT NULL | — | Lucide icon name (e.g., `"dumbbell"`, `"briefcase"`) |
| `deadline` | `number \| null` | — | `null` | Unix timestamp (ms). Optional target date for the category |
| `deadlineAllDay` | `boolean` | — | `false` | `true` = date-only ("on a day"), no specific time |
| `mtime` | `number` | NOT NULL | `Date.now()` | Last modified timestamp (ms). Drives aging system |
| `createdAt` | `number` | NOT NULL | `Date.now()` | Creation timestamp (ms) |
| `parentId` | `string \| null` | FK → `nodes.id` | `null` | Parent Node. `null` = Level 0 (root) |
| `level` | `number` | NOT NULL, 0–2 | — | Hierarchy depth. Derived from parent chain on creation. Nodes exist at levels 0, 1, 2 only (Level 3 = Bits only) |
| `x` | `number` | NOT NULL, 0–11 | — | Column index on grid |
| `y` | `number` | NOT NULL, 0–7 | — | Row index on grid |
| `deletedAt` | `number \| null` | — | `null` | Soft-delete timestamp. `null` = active. Non-null = trashed |
| `pastDeadlineDismissed` | `boolean` | — | `false` | When `true`, the past-deadline "Done?" overlay is permanently dismissed. Set when user clicks ✗ on the overlay. |

**Indexes:**

| Index Name | Columns | Purpose |
|------------|---------|---------|
| `idx_nodes_parentId` | `parentId` | Grid contents query — all children of a Node |
| `idx_nodes_deletedAt` | `deletedAt` | Filter active vs trashed items |
| `idx_nodes_parent_active` | `[parentId, deletedAt]` | Compound: active children of a specific parent |
| `idx_nodes_level` | `level` | Level-specific queries |

**Completion:** Node completion is **purely computed** at render time by checking whether all child Bits (active, non-deleted) have `status === "complete"`. No completion field is stored. Level 0 Nodes never complete — they represent permanent life/work domains.

**Unique constraint:** No two active items (Nodes or Bits) may occupy the same `(parentId, x, y)` cell. Enforced at application level before insert/move.

---

### bits

Actionable tasks displayed as horizontal rectangles on the grid. Bits contain Chunks (ordered steps).

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | `string` | PK, UUID | `crypto.randomUUID()` | Unique identifier |
| `title` | `string` | NOT NULL, min 1 char | — | Task name. Verbs/short sentences preferred (e.g., "Check pull requests") |
| `description` | `string` | — | `""` | Shown in Bit detail popup |
| `icon` | `string` | NOT NULL | — | Lucide icon name |
| `deadline` | `number \| null` | — | `null` | Unix timestamp (ms). Optional due date |
| `deadlineAllDay` | `boolean` | — | `false` | `true` = date-only ("on a day") |
| `priority` | `string \| null` | enum: `"high"`, `"mid"`, `"low"` | `null` | Optional priority level. Colors: high=red, mid=yellow, low=blue |
| `status` | `string` | NOT NULL, enum: `"active"`, `"complete"` | `"active"` | Completion state |
| `mtime` | `number` | NOT NULL | `Date.now()` | Last modified timestamp (ms). Drives aging system |
| `createdAt` | `number` | NOT NULL | `Date.now()` | Creation timestamp (ms) |
| `parentId` | `string` | NOT NULL, FK → `nodes.id` | — | Parent Node. Bits always belong to a Node |
| `x` | `number` | NOT NULL, 0–11 | — | Column index on grid |
| `y` | `number` | NOT NULL, 0–7 | — | Row index on grid |
| `deletedAt` | `number \| null` | — | `null` | Soft-delete timestamp. `null` = active |
| `pastDeadlineDismissed` | `boolean` | — | `false` | When `true`, the past-deadline "Done?" overlay is permanently dismissed. Set when user clicks ✗ on the overlay. |

**Indexes:**

| Index Name | Columns | Purpose |
|------------|---------|---------|
| `idx_bits_parentId` | `parentId` | Grid contents — all Bits in a Node |
| `idx_bits_deletedAt` | `deletedAt` | Filter active vs trashed |
| `idx_bits_parent_active` | `[parentId, deletedAt]` | Compound: active Bits of a specific parent |
| `idx_bits_status` | `status` | Filter by completion state |
| `idx_bits_deadline` | `deadline` | Calendar queries — items with deadlines |
| `idx_bits_parent_status` | `[parentId, status]` | Node completion check — active Bits in a Node by status |

**Grid level:** A Bit's effective grid level = `parentNode.level + 1`. Not stored; derived at query time from the parent Node's `level` field.

**Progress bar:** Computed at render time from `completedChunks / totalChunks`. Hidden when Chunk count is zero. Not stored.

---

### chunks

Smallest units of work. Individual steps within a Bit, displayed in a vertical timeline inside the Bit detail popup.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | `string` | PK, UUID | `crypto.randomUUID()` | Unique identifier |
| `title` | `string` | NOT NULL, min 1 char | — | Short, actionable step description |
| `description` | `string` | — | `""` | Additional context for the step |
| `time` | `number \| null` | — | `null` | Optional scheduled time (Unix ms). Cannot exceed parent Bit's deadline |
| `timeAllDay` | `boolean` | — | `false` | `true` = date-only scheduling |
| `status` | `string` | NOT NULL, enum: `"complete"`, `"incomplete"` | `"incomplete"` | Completion state |
| `order` | `number` | NOT NULL | — | User-defined sequence position in Bit timeline. 0-indexed |
| `parentId` | `string` | NOT NULL, FK → `bits.id` | — | Parent Bit |

**Indexes:**

| Index Name | Columns | Purpose |
|------------|---------|---------|
| `idx_chunks_parentId` | `parentId` | All Chunks belonging to a Bit |
| `idx_chunks_parent_order` | `[parentId, order]` | Ordered Chunks for timeline rendering |
| `idx_chunks_time` | `time` | Calendar queries — Chunks with scheduled times |
| `idx_chunks_status` | `status` | Filter by completion state |

**No `deletedAt`:** Chunks do not have independent soft-delete. Behavior:
- **Individual removal** (from Bit detail): Hard delete — permanently removed from the store.
- **Cascade with parent Bit**: When a Bit is soft-deleted (trashed), its Chunks remain in the store. They become inaccessible because the parent Bit is trashed. On Bit restore, Chunks are automatically available again. No additional fields needed.

**No `mtime` or `createdAt`:** Aging is tracked at the Bit level. Chunk activity (completion, creation, deletion) resets the parent Bit's `mtime`.

---

## Zod Validation Schemas

```typescript
import { z } from "zod";

// --- Shared ---

const idSchema = z.string().uuid();
const timestampSchema = z.number().int().positive();

// --- Node ---

export const nodeSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(100),
  description: z.string().max(500).default(""),
  color: z.string().regex(/^hsl\(\d{1,3},\s*\d{1,3}%,\s*\d{1,3}%\)$/),
  icon: z.string().min(1),
  deadline: timestampSchema.nullable().default(null),
  deadlineAllDay: z.boolean().default(false),
  mtime: timestampSchema,
  createdAt: timestampSchema,
  parentId: idSchema.nullable().default(null),
  level: z.number().int().min(0).max(2),
  x: z.number().int().min(0).max(11),
  y: z.number().int().min(0).max(7),
  deletedAt: timestampSchema.nullable().default(null),
  pastDeadlineDismissed: z.boolean().default(false),
});

export const createNodeSchema = nodeSchema.omit({
  id: true,
  mtime: true,
  createdAt: true,
  deletedAt: true,
});

export type Node = z.infer<typeof nodeSchema>;
export type CreateNode = z.infer<typeof createNodeSchema>;

// --- Bit ---

export const bitSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(1000).default(""),
  icon: z.string().min(1),
  deadline: timestampSchema.nullable().default(null),
  deadlineAllDay: z.boolean().default(false),
  priority: z.enum(["high", "mid", "low"]).nullable().default(null),
  status: z.enum(["active", "complete"]).default("active"),
  mtime: timestampSchema,
  createdAt: timestampSchema,
  parentId: idSchema,
  x: z.number().int().min(0).max(11),
  y: z.number().int().min(0).max(7),
  deletedAt: timestampSchema.nullable().default(null),
  pastDeadlineDismissed: z.boolean().default(false),
});

export const createBitSchema = bitSchema.omit({
  id: true,
  mtime: true,
  createdAt: true,
  status: true,
  deletedAt: true,
});

export type Bit = z.infer<typeof bitSchema>;
export type CreateBit = z.infer<typeof createBitSchema>;

// --- Chunk ---

export const chunkSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(500).default(""),
  time: timestampSchema.nullable().default(null),
  timeAllDay: z.boolean().default(false),
  status: z.enum(["complete", "incomplete"]).default("incomplete"),
  order: z.number().int().min(0),
  parentId: idSchema,
});

export const createChunkSchema = chunkSchema.omit({
  id: true,
  status: true,
});

export type Chunk = z.infer<typeof chunkSchema>;
export type CreateChunk = z.infer<typeof createChunkSchema>;
```

---

## Application Hooks

No database triggers — all side effects are handled at the application layer. These hooks **must** be enforced by the data access layer (repository/service), not by individual components.

### 1. mtime Cascade

When any of these actions occur, reset `mtime = Date.now()` on the affected item:

| Action | Updates mtime on |
|--------|-----------------|
| Edit title, description, or properties of a Node | That Node |
| Edit title, description, or properties of a Bit | That Bit |
| Complete or uncomplete a Chunk | Parent Bit **AND** parent Node (two-level cascade) |
| Add or remove a Chunk from a Bit | Parent Bit **AND** parent Node |
| Add or remove a child Node or Bit from a Node | That parent Node |
| Complete or uncomplete a Bit | That Bit **AND** parent Node |

**Does NOT reset mtime:** Opening/viewing an item, repositioning on the grid.

### 2. Deadline Hierarchy Constraint

Hard rule: **a child's deadline/time cannot exceed its parent's deadline.** Enforced at two levels:

| Relationship | Constraint |
|-------------|------------|
| Node → Bit | `bit.deadline <= parentNode.deadline` (when both have deadlines) |
| Bit → Chunk | `chunk.time <= parentBit.deadline` (when both have values) |

**Enforcement scenarios:**

1. **Child scheduled past parent deadline** → Block the action. Surface modal: "Child cannot exceed parent's deadline. Update parent's deadline too? Yes/No."
   - Yes → Extend parent deadline to accommodate child.
   - No → Cancel the action. Child retains previous value.

2. **Parent deadline shortened** → Find all children whose deadline/time exceeds the new parent deadline. Mark each as conflicting. Surface per-item: blur + "Modify timeline" overlay with check/x icon buttons.
   - Check → Open item for date editing.
   - X → Keep conflicting date (item remains in conflict state visually).

### 3. Bit Auto-Completion

When a Chunk's status changes to `"complete"`:
1. Query all Chunks for the parent Bit.
2. If every Chunk has `status === "complete"` → set `bit.status = "complete"`.
3. Apply mtime cascade (Hook 1).

When a Chunk's status changes back to `"incomplete"`:
1. If parent Bit was `"complete"` → set `bit.status = "active"`.
2. Apply mtime cascade (Hook 1).

### 4. Cascade Soft-Delete (Trash)

When a **Node** is soft-deleted (`deletedAt = Date.now()`):
1. Recursively find all descendant Nodes (children, grandchildren, etc.).
2. Find all Bits whose `parentId` matches any of these Nodes.
3. Set `deletedAt = Date.now()` on all found Nodes and Bits.
4. Chunks are implicitly trashed — no update needed (they become inaccessible via their trashed parent Bit).

When a **Bit** is soft-deleted:
1. Set `deletedAt = Date.now()` on the Bit only.
2. Chunks are implicitly trashed.

### 5. Cascade Restore

When a **Node** is restored (`deletedAt = null`):
1. If the Node's `parentId` points to another trashed Node → auto-restore the parent chain (no orphans). Each auto-restored Node uses BFS nearest-empty-cell placement if its original `(x, y)` is occupied.
2. Restore all descendant Nodes and Bits that were trashed in the same cascade operation.
3. For each restored item: if original `(x, y)` is occupied → BFS nearest-empty-cell from original position.

When a **Bit** is restored (`deletedAt = null`):
1. If parent Node is trashed → auto-restore parent Node (and its parent chain if needed).
2. If original `(x, y)` is occupied → BFS nearest-empty-cell.

### 6. Cascade Hard-Delete (Permanent)

When a Node or Bit is permanently deleted from trash:
1. **Node:** Delete the Node, all descendant Nodes, all descendant Bits, and all Chunks belonging to those Bits.
2. **Bit:** Delete the Bit and all its Chunks.

### 7. Trash Auto-Cleanup

Items with `deletedAt` older than 30 days are permanently deleted (Hook 6). Check on app startup and periodically during usage.

### 8. Grid Cell Uniqueness

Before inserting or moving a Node/Bit to `(parentId, x, y)`:
1. Query both `nodes` and `bits` stores for active items at that cell.
2. If occupied → reject the operation (or trigger BFS auto-placement).

### 9. Bit-to-Node Promotion

When a Bit is promoted to a Node:
1. Create a new Node with the Bit's `title`, `icon`, `deadline`, `description`. Assign default `color`. Set `level = parentNode.level + 1` (same level as the Bit's grid position).
2. For each Chunk in the Bit: create a new Bit inside the new Node. Map `chunk.title` → `bit.title`, `chunk.time` → `bit.deadline`, `chunk.timeAllDay` → `bit.deadlineAllDay`. Auto-place via BFS.
3. Delete the original Bit and its Chunks.

---

## Key Queries

| Query | Used by | Stores | Pattern |
|-------|---------|--------|---------|
| Active grid contents | Grid view (any level) | `nodes`, `bits` | Filter both stores by `parentId = X` AND `deletedAt = null`. Combine results. Use compound index `[parentId, deletedAt]` |
| Chunks for Bit (ordered) | Bit detail popup | `chunks` | Filter by `parentId = bitId`, sort by `order` ASC. Use compound index `[parentId, order]` |
| Node completion check | Node completion indicator | `bits` | Filter by `parentId = nodeId` AND `deletedAt = null`. Check if every result has `status = "complete"`. Use compound index `[parentId, status]` |
| All calendar items | Calendar:Weekly / Monthly | `bits`, `chunks` | **Bits:** filter `deletedAt = null` AND `deadline != null`, sort by `deadline`. **Chunks:** filter `time != null`, join with non-deleted parent Bits. Use `idx_bits_deadline`, `idx_chunks_time` |
| Items pool (Calendar) | Calendar left panel | `bits`, `chunks` | All active Bits + all Chunks with non-deleted parents. Sort: deadline items first (by priority rank, then deadline), no-deadline items below |
| Trashed items | Trash zone | `nodes`, `bits` | Filter `deletedAt != null`. Group by top-level trashed Node (the Node whose parent is NOT trashed). Show child counts |
| Badge computation | Node badge overlay | `bits`, `nodes` | For a given Node, find direct child Bits/Nodes with deadlines. Compute urgency level for each. Return the most urgent state |
| Global urgency | Calendar icon notification dot | `bits`, `nodes` | Scan all active items with deadlines across all stores. Find the most urgent item. Return its urgency level |
| Text search | Search overlay | `nodes`, `bits`, `chunks` | Client-side filter: iterate all active items, match `title` against search term (case-insensitive substring). Return with type, parent path, deadline |
| Grid occupancy | BFS auto-placement | `nodes`, `bits` | Filter both stores by `parentId = X` AND `deletedAt = null`. Collect all `(x, y)` pairs into an occupied-cells set |
| Aging state | Grid rendering | `nodes`, `bits` | Compute `daysSinceMtime = (Date.now() - item.mtime) / 86400000`. Apply: 0–5 = Fresh, 6–11 = Stagnant, 12+ = Neglected |
| Trash auto-cleanup | App startup / periodic | `nodes`, `bits` | Filter `deletedAt != null` AND `deletedAt < Date.now() - (30 * 86400000)`. Permanently delete matches (Hook 6) |
