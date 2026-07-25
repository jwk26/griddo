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
  - [scratchBreakdowns](#scratchbreakdowns)
  - [triageStagedCandidates](#triagestagedcandidates)
  - [Dexie v4 Migration](#dexie-v4-migration)
  - [Non-persistent Inbox/Triage State](#non-persistent-inboxtriage-state)
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
| `color` | `string` | NOT NULL | — | HSL color string (e.g., `"hsl(210, 80%, 55%)"`) for icon/accent. Propagates to child Bits at low saturation |
| `icon` | `string` | NOT NULL | — | Lucide icon name (e.g., `"dumbbell"`, `"briefcase"`) |
| `deadline` | `number \| null` | — | `null` | Unix timestamp (ms). Optional target date for the category |
| `deadlineAllDay` | `boolean` | — | `false` | `true` = date-only ("on a day"), no specific time |
| `mtime` | `number` | NOT NULL | `Date.now()` | Last modified timestamp (ms). Drives aging system |
| `createdAt` | `number` | NOT NULL | `Date.now()` | Creation timestamp (ms) |
| `parentId` | `string \| null` | FK → `nodes.id` | `null` | Parent Node. `null` = Level 0 (root) |
| `level` | `number` | NOT NULL, 0–2 | — | Hierarchy depth. Derived from parent chain on creation. Nodes exist at levels 0, 1, 2 only (Level 3 = Bits only) |
| `x` | `number` | NOT NULL, 0–14 | — | Column index on grid |
| `y` | `number` | NOT NULL, 0–7 | — | Row index on grid |
| `deletedAt` | `number \| null` | — | `null` | Soft-delete timestamp. `null` = active. Non-null = trashed |
| `archivedAt` | `number \| null` | — | `null` | Archive timestamp. `null` = active (on grid). Non-null = archived (hidden from grid, shown in Archive View). Mirrors `deletedAt` semantics |
| `systemRole` | `string \| null` | enum: `"inbox"`, `"archive_view"` | `null` | System Node role. `null` = regular user Node. Immutable after creation; non-null uniqueness enforced at application level |
| `hiddenFromGrid` | `boolean` | — | `false` | When `true`, the (system) Node is not rendered on the L0 grid but remains in the sidebar. Only applicable to system nodes (`systemRole !== null`) |
| `pastDeadlineDismissed` | `boolean` | — | `false` | When `true`, the past-deadline "Done?" overlay is permanently dismissed. Set when user clicks ✗ on the overlay. |

> **Note:** Node `description` was removed in Phase 9 amendment. Existing IndexedDB rows may retain orphaned `description` fields that Dexie silently ignores on read. No migration is needed.

**Indexes:**

| Index Name | Columns | Purpose |
|------------|---------|---------|
| `idx_nodes_parentId` | `parentId` | Grid contents query — all children of a Node |
| `idx_nodes_deletedAt` | `deletedAt` | Filter active vs trashed items |
| `idx_nodes_parent_active` | `[parentId, deletedAt]` | Compound: active children of a specific parent |
| `idx_nodes_level` | `level` | Level-specific queries |
| `idx_nodes_systemRole` | `systemRole` | Find system nodes by role (non-unique index; non-null uniqueness enforced at app level) |
| `idx_nodes_archivedAt` | `archivedAt` | Filter active vs archived |
| `idx_nodes_active_full` | `[parentId, deletedAt, archivedAt]` | Compound: active, non-archived children |

**Completion:** Node completion is **purely computed** at render time by checking whether all child Bits (active, non-deleted) have `status === "complete"`. No completion field is stored. Level 0 Nodes never complete — they represent permanent life/work domains.

**Unique constraint:** No two active items (Nodes or Bits) may occupy the same `(parentId, x, y)` cell. Enforced at application level before insert/move.

**Revision scope:** This amendment does not add a `version` field to Nodes. Inbox/Triage
compare-and-set editing covers Scratch Bits, Breakdown rows, and staged candidates. Placement
result creation is idempotent through a preallocated result ID; a created Bit additionally starts
under the Bit revision contract. General Node-title edit conflicts require a separate product
decision and schema amendment.

**Default System Nodes:** On first launch / migration, two system Nodes are seeded (seeding behavior in SPEC.md § System Nodes):

| Property | Inbox Node | Archive View Node |
|----------|-----------|-------------------|
| `systemRole` | `"inbox"` | `"archive_view"` |
| `title` | "Inbox" | "Archive" |
| `icon` | `"inbox"` | `"layers"` |
| `color` | `hsl(221, 83%, 53%)` | `hsl(240, 4%, 46%)` |
| `parentId` | `null` | `null` |
| `level` | `0` | `0` |

`systemRole` is immutable after creation; `title` / `icon` / `color` remain user-customizable. Non-null `systemRole` uniqueness is enforced at the application level (Dexie cannot apply a unique constraint where many rows share `null`). If no Node with a required `systemRole` exists, the system offers to recreate it. Scratch Bits (Bits parented to the Inbox Node) default to the `"sparkles"` icon.

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
| `version` | `number` | NOT NULL, integer >= 1 | `1` | Monotonic revision used for optimistic concurrency. Incremented once for every successful logical Bit mutation |
| `parentId` | `string` | NOT NULL, FK → `nodes.id` | — | Parent Node. Bits always belong to a Node |
| `x` | `number` | NOT NULL, 0–14 | — | Column index on grid |
| `y` | `number` | NOT NULL, 0–7 | — | Row index on grid |
| `deletedAt` | `number \| null` | — | `null` | Soft-delete timestamp. `null` = active |
| `archivedAt` | `number \| null` | — | `null` | Archive timestamp. `null` = active (on grid). Non-null = archived (hidden from grid, shown in Archive View). Mirrors `deletedAt` semantics |
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
| `idx_bits_archivedAt` | `archivedAt` | Filter active vs archived |
| `idx_bits_active_full` | `[parentId, deletedAt, archivedAt]` | Compound: active, non-archived Bits |

**Grid level:** A Bit's effective grid level = `parentNode.level + 1`. Not stored; derived at query time from the parent Node's `level` field.

**Progress bar:** Computed at render time from `completedChunks / totalChunks`. Hidden when Chunk count is zero. Not stored.

**Scratch Bits (Inbox):** Bits whose `parentId` is the Inbox system Node ("Scratch") use `x = 0, y = 0` as a sentinel and are exempt from grid-cell uniqueness (Hook 8). The Triage layout renders them ordered by `createdAt`, ignoring `(x, y)`. Scratch Bits default to the `"sparkles"` icon. "Scratch" is product/UI language — there is no separate database type.

**Revision contract:** `version`, not `mtime`, is the compare-and-set token. `mtime` remains presentation data for aging. Every repository write that changes a Bit's content, position, completion, or lifecycle increments `version` exactly once for that logical mutation, including cascade-driven writes. User-facing create/update schemas cannot set `version` directly.

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

### scratchBreakdowns

Per-Scratch idea rows created in the Triage Breakdown/Scribble area. A **dedicated store** (not Chunk reuse) because breakdown rows must not participate in Hook 3 (Bit Auto-Completion), require `createdAt` for display ordering, and have an independent `consumedAt` lifecycle.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | `string` | PK, UUID | `crypto.randomUUID()` | Unique identifier |
| `scratchBitId` | `string` | NOT NULL, FK → `bits.id` | — | Parent Scratch Bit (a Bit whose `parentId` = Inbox Node) |
| `content` | `string` | NOT NULL, min 1 char | — | Idea row text |
| `order` | `number` | NOT NULL | — | Display sequence within the Scratch |
| `createdAt` | `number` | NOT NULL | `Date.now()` | Creation timestamp (ms). Drives display ordering |
| `consumedAt` | `number \| null` | — | `null` | `null` = unconsumed; timestamp = consumed. Consumed rows leave the active Breakdown list but remain stored as archive evidence |
| `version` | `number` | NOT NULL, integer >= 1 | `1` | Monotonic revision for content and lifecycle compare-and-set operations |

**Indexes:**

| Index Name | Columns | Purpose |
|------------|---------|---------|
| `idx_scratchBreakdowns_by_scratch` | `[scratchBitId, order]` | Retrieve rows sorted by order |
| `idx_scratchBreakdowns_scratchBitId` | `scratchBitId` | Bulk delete on Scratch Bit removal |

**Not a Chunk:** Breakdown rows do not participate in Hook 3 (Bit Auto-Completion) and carry their own `createdAt` / `consumedAt`. See Hook 3 note.

`consumedAt` is retained production evidence, not a presentation flag. A staged row keeps
`consumedAt = null`; its staged state is derived from the existence of a matching
`triageStagedCandidates.sourceBreakdownId`. Consumed rows remain in this store but are excluded from
the active Breakdown list.

---

### triageStagedCandidates

Durable Node/Bit candidates created by staging a Breakdown row. Candidates are Scratch-scoped
domain data and survive route changes and reloads. Their labels are always resolved from the source
Breakdown row; the candidate does not store a title/content snapshot.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | `string` | PK, UUID | Preallocated by the stage operation | Stable candidate identifier |
| `scratchBitId` | `string` | NOT NULL, FK → `bits.id` | — | Owning active Scratch Bit |
| `sourceBreakdownId` | `string` | NOT NULL, FK → `scratchBreakdowns.id`, UNIQUE | — | Authoritative source row. Enforces at most one candidate per row |
| `type` | `string` | NOT NULL, enum: `"node"`, `"bit"` | — | Result type chosen when the row is staged |
| `createdAt` | `number` | NOT NULL | `Date.now()` | Candidate creation timestamp; drives newest-first subsection ordering |
| `version` | `number` | NOT NULL, integer >= 1 | `1` | Candidate compare-and-set revision captured by drag and placement commands |

**Indexes:**

| Index Name | Columns | Purpose |
|------------|---------|---------|
| `idx_triageCandidates_scratchBitId` | `scratchBitId` | All candidates for the selected Scratch |
| `uq_triageCandidates_sourceBreakdownId` | `sourceBreakdownId` (unique) | Prevent duplicate or cross-type candidates for one source row |
| `idx_triageCandidates_scratch_type_created` | `[scratchBitId, type, createdAt]` | Node/Bit subsection query ordered newest-first, with stable `id` tie-break in memory |

Candidate presence is the persisted `staged` lifecycle. Pending/reconciling presentation is
operation state and is not stored as a second candidate status. Unstage and successful placement
delete the candidate inside the same transaction that validates/restores or consumes its source
row. A candidate may be created only when its `scratchBitId` equals the source row's
`scratchBitId`, the Scratch is active, and the source row is unconsumed.

---

### Dexie v4 Migration

Canonical migration source: `src/lib/db/indexeddb.ts`.

1. Add `version = 1` to every existing `bits` record that has no version.
2. Add `version = 1` to every existing `scratchBreakdowns` record that has no version.
3. Create `triageStagedCandidates` with indexes
   `id,scratchBitId,&sourceBreakdownId,[scratchBitId+type+createdAt]`.
4. Start the candidate store empty. The pre-migration Zustand candidates are transient memory and
   cannot be reconstructed reliably after reload; do not infer durable candidates from
   unconsumed rows.
5. Do not add a Dexie operation-log store in v4. Inbox/Triage mutations use preallocated stable
   target IDs, monotonic versions, one read-write transaction, and authoritative postcondition
   queries for idempotency and reconciliation. A future BaaS may implement the same command
   contract with a server-side idempotency table or database function without adding operation
   fields to these domain records.

### Non-persistent Inbox/Triage State

| State | Ownership | Persistence rule |
|-------|-----------|------------------|
| Add/Edit drafts and editor base snapshots | Mounted Inbox/Triage page | Memory only; never `localStorage`, IndexedDB, or remote domain data |
| Scratch/Breakdown sort preference | Existing device-local preference boundary | Survives reload, but is not stored on Scratch/row records or future shared BaaS content |
| Scratch/Grid search query, reveal highlight, and DnD-interrupted last query | Mounted Inbox/Triage page | Memory only; route exit clears it |
| Placement affordance, archive overlay open/Cancel state, and completion blockers | Mounted Inbox/Triage page | Not stored; recompute from authoritative records on reload/re-entry |
| Newly Placed marker, display pinning, Undo provenance/eligibility | Mounted Inbox/Triage route session | Not stored in domain records; route exit/reload ends the marker and Undo capability |
| Pending mutation envelope (`operationId`, stable target IDs, intended postcondition) | Page/session transport state | Exists only while unresolved so the client can reconcile; it is not a draft, candidate, or permanent operation record |

---

## Zod Validation Schemas

```typescript
import { z } from "zod";

// --- Shared ---

const idSchema = z.string().uuid();
const timestampSchema = z.number().int().positive();
const versionSchema = z.number().int().min(1);
const triageOperationIdSchema = idSchema;

// --- Node ---

export const nodeSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(100),
  color: z.string().regex(/^hsl\(\d{1,3},\s*\d{1,3}%,\s*\d{1,3}%\)$/),
  icon: z.string().min(1),
  deadline: timestampSchema.nullable().default(null),
  deadlineAllDay: z.boolean().default(false),
  mtime: timestampSchema,
  createdAt: timestampSchema,
  parentId: idSchema.nullable().default(null),
  level: z.number().int().min(0).max(2),
  x: z.number().int().min(0).max(14),
  y: z.number().int().min(0).max(7),
  deletedAt: timestampSchema.nullable().default(null),
  archivedAt: timestampSchema.nullable().default(null),
  systemRole: z.enum(["inbox", "archive_view"]).nullable().default(null),
  hiddenFromGrid: z.boolean().default(false),
  pastDeadlineDismissed: z.boolean().default(false),
});

// User-facing create: system-managed lifecycle/role fields are not settable here.
// System Nodes (systemRole) are seeded via an internal path using the full nodeSchema.
export const createNodeSchema = nodeSchema.omit({
  id: true,
  mtime: true,
  createdAt: true,
  deletedAt: true,
  archivedAt: true,
  systemRole: true,
  hiddenFromGrid: true,
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
  version: versionSchema.default(1),
  parentId: idSchema,
  x: z.number().int().min(0).max(14),
  y: z.number().int().min(0).max(7),
  deletedAt: timestampSchema.nullable().default(null),
  archivedAt: timestampSchema.nullable().default(null),
  pastDeadlineDismissed: z.boolean().default(false),
});

export const createBitSchema = bitSchema.omit({
  id: true,
  mtime: true,
  createdAt: true,
  version: true,
  status: true,
  deletedAt: true,
  archivedAt: true,
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

// --- ScratchBreakdown ---

export const scratchBreakdownSchema = z.object({
  id: idSchema,
  scratchBitId: idSchema,
  content: z.string().min(1).max(1000),
  order: z.number().int().min(0),
  createdAt: timestampSchema,
  consumedAt: timestampSchema.nullable().default(null),
  version: versionSchema.default(1),
});

export const createScratchBreakdownSchema = scratchBreakdownSchema.omit({
  createdAt: true,
  consumedAt: true,
  version: true,
});

export type ScratchBreakdown = z.infer<typeof scratchBreakdownSchema>;
export type CreateScratchBreakdown = z.infer<typeof createScratchBreakdownSchema>;

// --- Triage Staged Candidate ---

export const triageStagedCandidateSchema = z.object({
  id: idSchema,
  scratchBitId: idSchema,
  sourceBreakdownId: idSchema,
  type: z.enum(["node", "bit"]),
  createdAt: timestampSchema,
  version: versionSchema.default(1),
});

export const createTriageStagedCandidateSchema =
  triageStagedCandidateSchema.omit({
    createdAt: true,
    version: true,
  });

// Every mutating Inbox/Triage command carries an operation ID. It is command
// metadata, not a persisted domain-record field in Dexie v4.
export const triageMutationEnvelopeSchema = z.object({
  operationId: triageOperationIdSchema,
});

export type TriageStagedCandidate = z.infer<
  typeof triageStagedCandidateSchema
>;
export type CreateTriageStagedCandidate = z.infer<
  typeof createTriageStagedCandidateSchema
>;
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

Whenever a Bit write above succeeds, Hook 12 increments that Bit's `version` once even when one
transaction changes several Bit fields. `mtime` and `version` serve different purposes and must not
be substituted for one another.

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

> **`scratchBreakdowns` exclusion:** Breakdown rows live in a dedicated store, not as Chunks — they do **not** participate in this hook. Placing/consuming breakdown rows never triggers Bit auto-completion.

### 4. Cascade Soft-Delete (Trash)

System nodes (`systemRole !== null` — Inbox and Archive View) **cannot be soft-deleted / trashed**; the UI must not offer Trash for them. "Remove from grid" uses `hiddenFromGrid = true` instead. (Because hard-delete only happens from Trash, Hook 6 is therefore unreachable for system nodes. This mirrors the archive exclusion in Hook 10.)

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
3. **Exception:** Bits whose `parentId` is the Inbox system Node ("Scratch") are exempt — they use the `x = 0, y = 0` sentinel and are not subject to cell uniqueness. The Triage layout orders them by `createdAt`.

### 9. Bit-to-Node Promotion

When a Bit is promoted to a Node:
1. Create a new Node with the Bit's `title`, `icon`, `deadline`. Assign default `color`. Set `level = parentNode.level + 1` (same level as the Bit's grid position).
2. For each Chunk in the Bit: create a new Bit inside the new Node. Map `chunk.title` → `bit.title`, `chunk.time` → `bit.deadline`, `chunk.timeAllDay` → `bit.deadlineAllDay`. Auto-place via BFS.
3. Delete the original Bit and its Chunks.

### 10. Archive Cascade

System nodes (`systemRole !== null`) **cannot** be archived — the UI must not offer "Archive" for them.

When a **Node** is archived:
1. Create one shared timestamp: `const archiveTimestamp = Date.now()`.
2. Set `archivedAt = archiveTimestamp` on the Node and all descendant Nodes and Bits (same cascade pattern as Hook 4). The single shared timestamp lets restore identify cascade members.
3. Chunks become inaccessible via the archived parent Bit (no update needed).

When a **Bit** is archived:
1. Set `archivedAt = Date.now()` on the Bit and increment `version` once.

When the Bit is a Scratch archived from Inbox/Triage, run Hook 16 inside the same transaction before
writing `archivedAt`. A stale completion overlay cannot bypass current row/candidate eligibility.

Completion never triggers this hook — archive is a manual lifecycle action and completion stays purely computed (see nodes/bits Completion notes). Completed-but-unarchived items remain on the grid.

### 11. Archive Restore

Uses the same ±5-second timestamp-window approach as trash restore (`isWithinRestoreWindow`).

When a **Node** is restored:
1. Find descendants whose `archivedAt` is within ±5s of this Node's `archivedAt`.
2. Set `archivedAt = null` on matched descendants only — items independently archived before the cascade stay archived.
3. If original `(x, y)` is occupied → BFS auto-placement.

When a **Bit** is restored:
1. If the parent Node is archived → restore the parent chain (same window rule).
2. If original `(x, y)` is occupied → BFS auto-placement.
3. Set `archivedAt = null` and increment `version` once. Restoring a Scratch preserves its
   Breakdown history; Inbox/Triage recomputes completion from current rows and candidates.

### Scratch Bit Permanent Deletion

When a Scratch Bit is hard-deleted (after trash retention or explicit purge), all associated
`scratchBreakdowns` rows and `triageStagedCandidates` are hard-deleted in the same transaction.
**Archiving** a Scratch Bit does not trigger this cleanup — archived Scratch retains its Breakdown
history for a potential restore. Archive eligibility normally guarantees that no candidate remains,
but hard-delete cleanup must not rely on that UI invariant.

### 12. Inbox/Triage Revision And Mutation Contract

Scratch title and Breakdown row writes use optimistic concurrency, not last-write-wins.

| Record | Base snapshot | Conditional write predicate | Successful write |
|--------|---------------|-----------------------------|------------------|
| Scratch title (`bits`) | `id`, title, `version`, `deletedAt`, `archivedAt` | Same `id` and `version`; Scratch is still active | Update title/`mtime`; increment `version` once |
| Breakdown row | `id`, content, `version`, `consumedAt`, candidate presence | Same `id` and `version`; `consumedAt = null`; no candidate; parent Scratch active | Update content/order as requested; increment `version` once |
| Staged candidate | `id`, `version`, source row version and lifecycle | Candidate and source still match the captured versions and remain eligible | Apply the requested stage/unstage/placement transaction or reject without partial writes |

The comparison and write occur inside one Dexie read-write transaction. `mtime` is never accepted
as a substitute for `version`. Editor base snapshots and conflict drafts remain client memory; they
are not additional object-store records.

All Inbox/Triage mutation commands carry a UUID `operationId`. Create-like commands also allocate
their target record IDs before the transaction and retain them while pending. Repository results use
one shared status contract:

- `applied` — this invocation committed and returns authoritative records/versions.
- `already_applied` — the same stable target/postcondition already exists; do not repeat UI success
  effects.
- `conflict` — the record exists but version, editable value, candidate, or lifecycle differs; return
  current authoritative state.
- `invalid` — current domain constraints reject the command, with a stable reason code.
- `not_found` — the required source or target no longer exists authoritatively.

Transport timeout or connection loss is not converted to one of these final statuses without a
reconciliation query. The page/session keeps the pending command metadata long enough to query its
stable target IDs and postconditions. Dexie v4 has no operation-log store; future remote persistence
may bind `operationId` to a unique server-side idempotency key while preserving this result contract.

### 13. Breakdown Active And Consumed Predicates

For a selected active Scratch:

| Derived state | Persisted predicate | Breakdown presentation |
|---------------|---------------------|------------------------|
| Active | Row exists, `consumedAt = null`, no candidate by `sourceBreakdownId` | Normal editable/draggable row |
| Staged | Row exists, `consumedAt = null`, exactly one candidate by `sourceBreakdownId` | Same row retained with staged treatment; Edit/Trash writes rejected |
| Consumed | Row exists, `consumedAt != null`, no candidate | Excluded from active row list; retained as completion evidence |
| Deleted | Row absent | Not rendered and not completion evidence |

Creating a row validates that its Scratch is active, computes the next `order`, and inserts the
preallocated row ID with `version = 1` in one transaction. A retry with the same operation/row ID and
matching payload returns `already_applied`; it cannot create a duplicate row.

Deleting a row revalidates `version`, `consumedAt = null`, candidate absence, and active Scratch
lifecycle before deleting. A staged or consumed row is not made editable/deletable by a stale
client. `order` and `createdAt` are preserved by stage, unstage, placement, and Undo.

Do not derive completion from `rows.every(...)` alone. Persisted archive eligibility requires an
explicit consumed-row count greater than zero, unconsumed-row count equal to zero, and candidate
count equal to zero (Hook 16).

### 14. Durable Staging And Inbox/Triage Atomic Placement

The following operations are repository-owned transactions, never component-level sequences:

| Operation | Stores read/written atomically | Required validation | Committed result |
|-----------|--------------------------------|---------------------|------------------|
| Stage row | `bits`, `scratchBreakdowns`, `triageStagedCandidates` | Scratch active; source ID/version unchanged; `consumedAt = null`; no candidate for source | Insert one candidate with `version = 1`; source row remains unconsumed |
| Unstage | `bits`, `scratchBreakdowns`, `triageStagedCandidates` | Scratch/source active; candidate ID/version and source relation match | Delete candidate; source row remains active with original order/time |
| Place staged candidate | `nodes` or `bits`, `scratchBreakdowns`, `triageStagedCandidates` | Candidate/source versions and relationship match; source unconsumed; target active/reachable/type-valid; cell available; result title valid | Create actual Node/Bit, set source `consumedAt`, increment source `version`, delete candidate |
| Place direct row | `nodes` or `bits`, `scratchBreakdowns` | Source ID/version unchanged and active; no candidate; target active/reachable/type-valid; cell available; selected type title limit valid | Create actual Node/Bit, set source `consumedAt`, increment source `version` |

Staged Node placement is valid only where the resulting Node level is 0–2. Staged Bit placement
requires a non-null parent Node and produces a Bit in the corresponding Level 1–3 column. Direct
placement applies the same target rules after type selection. Node titles remain limited to 100
characters and Bit titles to 200; no transaction silently truncates source content.

The Node/Bit result ID is preallocated and reused by reconciliation. If a result with that ID exists,
the source is consumed, and the candidate postcondition matches, return `already_applied`; any mixed
state is `conflict` and must not be repaired by an additional create/consume/delete sequence outside
the transaction.

Candidate queries resolve the source row before producing a card. A missing local-cache row is not
enough to delete a candidate. Once the authoritative repository confirms an orphan, remove the
candidate atomically, recompute counts/archive eligibility, and emit the candidate/source IDs to the
application diagnostic boundary. No placeholder candidate or hidden orphan record is retained.

### 15. Source-Aware Placement Undo

Newly Placed presentation is not persisted. The mounted Inbox/Triage page keeps transient placement
metadata containing `operationId`, result ID/type and creation fingerprint, Scratch/source row ID,
source kind (`staging` or `direct`), and the deleted candidate snapshot when the source was Staging.
Scratch/column/theme/locale changes preserve this metadata; route exit discards it.

Undo revalidates the result record, lifecycle, current parent/position, creation fingerprint, and
surviving descendants immediately before write. A changed result, archived/deleted result, unknown
mutation, or non-reversible child dependency returns `invalid` without deleting or restoring
anything.

- **Staging source:** delete the created result, restore the candidate using its original stable ID,
  `type`, `createdAt`, and source relation but with `version = previous version + 1`, set the source
  row `consumedAt = null`, and increment the row `version` once. The increment prevents an old drag
  snapshot from matching the restored candidate after the delete/recreate cycle.
- **Direct source:** delete the created result, set the source row `consumedAt = null`, and increment
  the row `version` once. No candidate is created.

Each rollback is one transaction across the result store, `scratchBreakdowns`, and, when applicable,
`triageStagedCandidates`. A retry that finds the result absent and the exact source postcondition
restored returns `already_applied`. Undo never cascades through unrelated descendants and never
persists a `newlyPlaced` field on Node, Bit, Breakdown, or candidate records.

### 16. Inbox Archive Eligibility

The persisted eligibility query returns true only when all conditions hold in one consistent read:

1. The selected Scratch Bit exists under the Inbox system Node and has `deletedAt = null` and
   `archivedAt = null`.
2. At least one associated Breakdown row has `consumedAt != null`.
3. No associated Breakdown row has `consumedAt = null`.
4. No `triageStagedCandidates` record exists for the Scratch.

An empty Breakdown array is therefore never archive-ready. Deleting every row without any consumed
evidence is also not archive-ready. A non-empty Add draft or dirty Scratch-title editor is a
page-local blocker layered on this persisted result, not a database field.

Inbox/Triage archive Confirm re-runs this query and verifies the Scratch `version` inside the same
transaction that sets `archivedAt` and increments `version`. If the operation response is unknown,
reconcile by operation metadata and the authoritative Scratch lifecycle; do not infer success from
the item disappearing from a client-side list.

---

## Key Queries

> **Lifecycle filter (archive sweep):** Every "active items" query below must filter `archivedAt = null` **in addition to** `deletedAt = null`. L0 grid rendering must also exclude `hiddenFromGrid = true`. Applies to: Active grid contents, Node completion check, All calendar items, Items pool, Badge computation, Global urgency, Text search, Grid occupancy, Aging state. Trash queries (Trashed items, Trash auto-cleanup) continue to key off `deletedAt` only.

| Query | Used by | Stores | Pattern |
|-------|---------|--------|---------|
| Active grid contents | Grid view (any level) | `nodes`, `bits` | Filter both stores by `parentId = X` AND `deletedAt = null` AND `archivedAt = null`. L0 also excludes `hiddenFromGrid = true`. Combine results. Use compound index `[parentId, deletedAt, archivedAt]` |
| Chunks for Bit (ordered) | Bit detail popup | `chunks` | Filter by `parentId = bitId`, sort by `order` ASC. Use compound index `[parentId, order]` |
| Node completion check | Node completion indicator | `bits` | Filter by `parentId = nodeId` AND `deletedAt = null` AND `archivedAt = null`. Check if every result has `status = "complete"`. Use compound index `[parentId, status]` |
| All calendar items | Calendar:Weekly / Monthly | `bits`, `chunks` | **Bits:** filter `deletedAt = null` AND `archivedAt = null` AND `deadline != null`, sort by `deadline`. **Chunks:** filter `time != null`, join with non-deleted, non-archived parent Bits. Use `idx_bits_deadline`, `idx_chunks_time` |
| Items pool (Calendar) | Calendar left panel | `bits`, `chunks` | All active Bits (`deletedAt = null` AND `archivedAt = null`) + all Chunks with non-deleted, non-archived parents. Sort: deadline items first (by priority rank, then deadline), no-deadline items below |
| Trashed items | Trash zone | `nodes`, `bits` | Filter `deletedAt != null`. Group by top-level trashed Node (the Node whose parent is NOT trashed). Show child counts |
| Badge computation | Node badge overlay | `bits`, `nodes` | For a given Node, find direct child Bits/Nodes (`deletedAt = null` AND `archivedAt = null`) with deadlines. Compute urgency level for each. Return the most urgent state |
| Global urgency | Calendar icon notification dot | `bits`, `nodes` | Scan all active items (`deletedAt = null` AND `archivedAt = null`) with deadlines across all stores. Find the most urgent item. Return its urgency level |
| Text search | Search overlay | `nodes`, `bits`, `chunks` | Client-side filter: iterate all active items (`deletedAt = null` AND `archivedAt = null`; Chunks via non-deleted, non-archived parents), match `title` against search term (case-insensitive substring). Return with type, parent path, deadline |
| Grid occupancy | BFS auto-placement | `nodes`, `bits` | Filter both stores by `parentId = X` AND `deletedAt = null` AND `archivedAt = null`. Collect all `(x, y)` pairs into an occupied-cells set |
| Aging state | Grid rendering | `nodes`, `bits` | Operates on grid-visible items only (`deletedAt = null` AND `archivedAt = null`; L0 also `hiddenFromGrid = false`). Compute `daysSinceMtime = (Date.now() - item.mtime) / 86400000`. Apply: 0–5 = Fresh, 6–11 = Stagnant, 12+ = Neglected |
| Trash auto-cleanup | App startup / periodic | `nodes`, `bits` | Filter `deletedAt != null` AND `deletedAt < Date.now() - (30 * 86400000)`. Permanently delete matches (Hook 6) |
| Scratch Breakdown workspace | Inbox/Triage Breakdown and Staging | `bits`, `scratchBreakdowns`, `triageStagedCandidates` | Read selected active Scratch by ID; read all rows by `scratchBitId`; read candidates by `scratchBitId`; join each candidate to its source row; derive Active/Staged/Consumed with Hook 13. Sort rows by selected view preference and candidates by `createdAt DESC, id ASC` |
| Staged candidates by type | Inbox/Triage Staging subsection | `triageStagedCandidates`, `scratchBreakdowns` | Use `[scratchBitId, type, createdAt]`, reverse for newest-first, then stable `id` tie-break. Resolve labels from source rows and exclude only authoritatively confirmed orphans |
| Conditional Scratch/row save | Selected Scratch Context and Breakdown inline editors | `bits` or `scratchBreakdowns`, `triageStagedCandidates` | Primary-key read inside a read-write transaction; compare `version` and lifecycle/candidate predicate; update and increment `version`, or return current record with `conflict`/`invalid` |
| Candidate and placement reconciliation | Stage/Unstage/Placement pending state | `nodes`, `bits`, `scratchBreakdowns`, `triageStagedCandidates` | Query preallocated candidate/result ID plus source row and candidate postcondition. Return `applied`/`already_applied` only for a complete transaction state; mixed states are conflicts and never repaired by repeating partial writes |
| Newly Placed Undo eligibility | Grid Explorer actual Node/Bit card | `nodes`, `bits`, `chunks`, `scratchBreakdowns`, `triageStagedCandidates` | Compare result lifecycle, parent/position and creation fingerprint; query descendants/dependencies; combine with page-session placement provenance. Non-reversible results remain normal records and are not deleted |
| Inbox archive eligibility | Breakdown completion/archive | `bits`, `scratchBreakdowns`, `triageStagedCandidates` | Verify active Scratch; count consumed rows (`> 0`), unconsumed rows (`= 0`), and candidates (`= 0`) in one consistent read. Do not rely on empty-array `every()` |
