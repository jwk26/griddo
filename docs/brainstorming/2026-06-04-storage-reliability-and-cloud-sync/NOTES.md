# Storage Reliability and Cloud Sync Notes

## Metadata

- Created: 2026-06-04
- Related topic: 2026-06-04-storage-reliability-and-cloud-sync

## Session Log

### 2026-06-04

#### Daily Progress

- [x] Storage-loss risk — resolved as a real product risk, reflected in DECISION.md
- [x] Port-specific IndexedDB confusion — recorded as origin fragmentation, reflected in DECISION.md
- [x] Immediate direction — IndexedDB remains for now; backup/persistent-storage safety net first
- [x] Supabase migration concern — validated against current codebase as a v2-sized architecture track
- [x] Sidebar sync/status UX — resolved as backup freshness indicator with manual and auto sync
- [x] Backup file model — resolved as full JSON snapshot files with content-hash dedupe
- [x] Restore/import policy — resolved as replace restore plus copy import
- [x] Failure/fallback policy — resolved as capability ladder with download fallback
- [x] Privacy/encryption — plain JSON in v1.5; encryption deferred
- [x] Supabase migration compatibility — backup JSON is future migration input, not cloud DB blob

#### Concern: IndexedDB Data Loss

Status: Resolved as current product risk — reflected in DECISION.md

Initial signal:
- User reported that all Nodes/Bits disappeared after cache removal or Chrome
  update/maintenance.
- This matched the PRD's existing known risk: v1 IndexedDB data can be lost
  because it lives entirely in browser storage.

Outcome:
- Current direction does not treat IndexedDB-only storage as sufficient.
- Immediate safety-net work should include export/import and persistent storage
  request.
- Persistent storage is only a risk reducer. It does not protect against user or
  browser actions that intentionally clear site data.

#### Concern: Port-Specific Data Sets

Status: Resolved as expected browser behavior — reflected in DECISION.md

Initial signal:
- User observed different Nodes/Bits when opening GridDO on different ports.

Evidence:
- Same-origin policy defines origin by protocol, host, and port.
- IndexedDB and Web Storage are separated by origin.
- GridDO already has `/debug-indexeddb`, which shows the exact current origin.

Outcome:
- Treat this as origin fragmentation, not an application data corruption bug.
- Future debug/settings surfaces should make the current origin explicit.
- Local development should prefer a fixed origin/port when preserving one
  working data set matters.

#### Concern: Supabase Migration Scope

Status: Resolved for v1.5 direction — Supabase is not the immediate safety-net path

Initial signal:
- User wondered whether GridDO should stop using IndexedDB and migrate to
  Supabase because IndexedDB reliability and port fragmentation feel fragile.

Reasoning:
- Supabase could solve browser-local loss and local port fragmentation by moving
  durable state outside the browser.
- It also introduces larger product and architecture work: auth, schema, RLS,
  migration/import from local data, latency behavior, offline policy, and
  reactive subscription replacement.
- Existing DataStore abstraction makes this possible, but not trivial.

Outcome:
- Do not immediately discard IndexedDB.
- First implement the smaller v1.5 safety net.
- Evaluate Supabase as v2 storage/sync or cloud-backup strategy.

Codebase-based assessment:
- The current app has no Supabase or auth dependency. `package.json` includes
  Dexie, but no Supabase/auth library.
- `docs/prd.md` and `docs/SPEC.md` explicitly define v1 as local-first with no
  server, no database, and no auth.
- `src/lib/db/datastore.ts` gives GridDO a useful CRUD migration boundary, so a
  future backend change is bounded and does not imply a full UI rewrite.
- The reactive read layer is still Dexie-specific today. Grid, calendar, node,
  bit-detail, urgency, breadcrumb, and trash hooks subscribe with Dexie
  `liveQuery`.
- Many interaction flows call `DataStore` mutations directly and assume local
  writes are fast enough for drag/drop, scheduling, chunk edits, trash, restore,
  and promotion.
- The runtime schema has no `userId`, sync version, server timestamp, or remote
  ownership fields. Moving to Supabase would require schema and migration
  decisions, not only a storage adapter.
- `src/lib/db/indexeddb.ts` contains substantial local behavior: grid occupancy,
  cascade delete/restore, BFS restore placement, promotion, deadline checks,
  search, calendar filtering, and durable local migration markers.

Conclusion:
- Supabase would reduce browser-local loss and origin fragmentation at the root,
  but it also expands scope into auth, sync semantics, offline behavior, latency
  policy, RLS/ownership, and schema migration.
- Treat Supabase as a v2 architecture evaluation, not as the first reliability
  fix.
- The immediate direction should be v1.5 safety work: export/import,
  persistent-storage request, backup reminder, and a user-visible backup/sync
  status surface.

#### Direction: Minimal Safety Net with Sidebar Sync Surface

Status: Resolved in DECISION.md

User direction:
- Start with the smallest safety layer that prevents catastrophic data loss:
  Export/Import, persistent storage, and backup reminder.
- Put a sync control in the sidebar.
- Show whether the current local data is reflected in the latest backup/sync
  state or is outdated, using color and/or icon state.
- Support both manual sync and auto sync.

Open terminology:
- In v1.5, "sync" may mean local backup/export freshness rather than cloud
  real-time sync.
- The UX should avoid implying Supabase-style multi-device sync unless a cloud
  target exists.

Outcome:
- Use the sidebar Sync surface for backup freshness in v1.5.
- Manual sync writes a backup immediately.
- Auto sync writes real backup files when browser support and folder permission
  allow it.
- If auto writes are unavailable, the same surface degrades to backup reminder
  plus manual download.

#### Decision: Local File Backup vs IndexedDB Snapshot

Status: Resolved — local file backup is the safety mechanism

Clarification:
- An IndexedDB snapshot would mean storing JSON-shaped backup data inside a
  browser-managed IndexedDB store.
- That is useful for in-app undo/rollback, but it does not address the user's
  actual failure case because site-data deletion can remove the snapshot with
  the primary data.
- A local backup file is stored outside browser-managed site data, for example
  in a user-selected folder.

Outcome:
- v1.5 excludes IndexedDB-internal snapshots as the main backup mechanism.
- v1.5 uses real JSON files.
- The design still keeps a future cloud-sync mental model: backup freshness now,
  cloud sync later.

#### Decision: Real File Auto Sync

Status: Resolved — preferred when browser capability allows it

User preference:
- Auto sync should perform real file writes rather than only showing reminders.

Recommended UX:
- User selects a backup folder.
- GridDO writes `griddo-latest.json` as the newest backup.
- GridDO writes dated backup files when data content changed.
- Sidebar shows state using color/icon: green backed up, yellow pending, blue
  saving, red action needed.

Fallback:
- If folder writes are unsupported or permission is unavailable, manual sync
  downloads a backup file through the browser.

#### Decision: Backup Scope

Status: Resolved — full application data graph

Must include:
- all `nodes`, including active, trashed, archived, and system Nodes
- all `bits`, including Scratch Bits under Inbox
- all `chunks`, including Chunks of trashed/archived Bits
- all future `scratchBreakdowns`, including consumed rows
- lifecycle fields (`deletedAt`, `archivedAt`, `hiddenFromGrid`,
  `systemRole`, `pastDeadlineDismissed`)
- layout/order fields (`parentId`, `level`, `x`, `y`, `order`, `createdAt`,
  `mtime`)
- deadline/scheduling fields (`deadline`, `deadlineAllDay`, `time`,
  `timeAllDay`, priority/status)

Should include:
- manifest with format/schema version, export timestamp, source origin for
  debugging, row counts, and content hash
- enough system-node reconciliation metadata to avoid duplicate Inbox/Archive
  system nodes on import

Should not include:
- browser file handles or folder permissions
- transient UI state such as route, search query, edit mode, drag/hover state
- backup status as primary data

Open nuance:
- Current runtime has a Dexie `settings` store for breadcrumb-zone migration
  markers. Future product settings should likely be backed up; internal
  migration markers need a separate import policy.

#### Decision: Content Hash Dedupe

Status: Resolved — applies to backup functionality as a whole

Reasoning:
- Creating duplicate files when data did not change increases folder clutter
  without improving recovery.
- Hash comparison should apply beyond dated backups: auto sync, manual sync,
  and pre-restore safety backups can all avoid duplicates.

Policy:
- Calculate `contentHash` from canonical backup payload.
- Exclude volatile metadata such as `exportedAt`, filename, source origin, and
  file path.
- If the hash matches the last successful backup, report up-to-date and do not
  write a file.
- If the hash differs, write `latest` and create a dated backup when needed.
- Manual sync may later expose a force-copy action, but default behavior skips
  duplicate content.

Important wording:
- This is "diff/hash comparison before writing full snapshots", not "store only
  diff files".
- Every backup file remains independently restorable.

#### Decision: Retention

Status: Resolved for v1.5 — no automatic deletion

Reasoning:
- Hash dedupe should keep backup count low enough initially.
- Auto-deleting recovery files can remove the user's last useful restore point.
- Retention UI adds product complexity that is not required for the first safety
  layer.

Policy:
- Keep `griddo-latest.json`.
- Keep every dated backup that was actually created.
- Keep pre-restore backups.
- Show count/size metadata later if needed.
- Defer retention options such as "keep last 90 days" or "keep last N backups".

#### Decision: Restore vs Import

Status: Resolved — separate replace restore from copy import

Restore:
- Disaster recovery / point-in-time replacement.
- Validate backup file.
- Preview manifest and counts.
- If current data exists, write a pre-restore backup first.
- Replace current IndexedDB contents with backup contents.
- Preserve IDs from backup.

Import:
- Bring backup data into a non-empty current GridDO without overwriting current
  rows.
- Treat imported data as copies, not as true merge.
- Remap all imported entity IDs.
- Remap parent-child links to the new IDs.
- Keep existing rows unchanged.
- Do not auto-merge by same title, same path, or same original ID.
- Warn if the same backup hash was already imported.
- Skip if current payload hash exactly equals the backup hash.

Rationale:
- True merge would require conflict rules for same IDs, deleted vs edited rows,
  grid position collisions, system-node identity, Scratch breakdown lifecycle,
  archive/trash state, and parent-chain repair.
- That level of conflict handling belongs to future cloud sync, not v1.5 backup.

#### Decision: Pre-Restore Safety Backup Instead of Trash

Status: Resolved — do not move current data to Trash during restore

User explored:
- Could restore move current data into GridDO Trash so the user can recover
  pieces later?

Conclusion:
- Do not use Trash as backup staging.

Reasoning:
- Trash means user deletion lifecycle inside GridDO.
- Moving an entire current DB into Trash would blur product semantics.
- It would reintroduce merge conflicts because restored backup data and trashed
  previous data could share system nodes, IDs, parent paths, and grid positions.
- Scratch breakdowns and archive/trash lifecycle would be hard to recover
  cleanly from normal Trash.

Alternative:
- Write a pre-restore backup file.
- Restore by replace.
- If the user needs old data afterward, use Import from backup on the
  pre-restore file.

#### Decision: Failure and Fallback

Status: Resolved — capability ladder

Simple model:
- Automatic backup possible: folder selected, browser supports writes, and
  permission is active.
- Manual backup only: browser cannot write directly to a folder or user has not
  set one up.
- Problem state: permission denied/expired, write failed, or payload generation
  failed.

UX:
- Green means current data is backed up.
- Yellow means backup is needed or pending.
- Blue means saving.
- Red means user action is needed.

Rules:
- Backup failure does not block normal GridDO work.
- Failed writes do not update last successful hash/timestamp.
- Permission problems offer retry or manual download fallback.
- Replace restore is stricter: if current data must be preserved first and the
  safety backup cannot be written, restore stops.

#### Decision: Atomic Writes

Status: Resolved — apply where feasible

Policy:
- Write temp file before updating `griddo-latest.json` where browser APIs allow
  this.
- Dated backups are newly named files, so overwrite risk is lower.
- Parse, version-check, and hash-check backup files before restore/import.
- Do not mark backup as successful unless file write and verification path
  succeeds.

#### Decision: Privacy and Encryption

Status: Resolved — plain JSON in v1.5

Reasoning:
- Backup files contain the user's task, idea, Scratch, deadline, and lifecycle
  data.
- If the user chooses a cloud-synced folder, the backup file follows that
  provider's sync/storage policy.
- Encryption adds password loss, key storage, auto-sync unlock, and cross-device
  import questions.

Policy:
- Use plain JSON for v1.5.
- Make the data sensitivity clear in setup and restore/import surfaces.
- Defer encrypted/password-protected backups.

#### Decision: Versioning and Schema Compatibility

Status: Resolved — versioned backup format

Policy:
- Include `backupFormatVersion: 1`.
- Include app/schema version marker.
- Support known versions only.
- Migrate older supported versions through explicit migration functions.
- Reject future versions, unknown required stores, and missing required fields.
- Ignore unknown optional metadata when safe.

#### Direction: Supabase Migration Compatibility

Status: Resolved for backup design — migration-ready input, not cloud blob

Question:
- If the current plan saves backup files locally, does future Supabase migration
  upload this file unchanged into the database?

Answer:
- No. Backup JSON should be migration input, not the primary Supabase storage
  shape.

Future flow:
1. User creates local GridDO backup JSON.
2. Future Supabase/GridDO version asks user to log in.
3. User selects the backup JSON.
4. App validates the file.
5. Migration attaches cloud `user_id`.
6. Data is inserted/upserted into normalized tables such as `nodes`, `bits`,
   `chunks`, and `scratch_breakdowns`.
7. The original JSON may optionally be saved separately for audit/disaster
   recovery, but app queries should use normalized rows.

Reasoning:
- JSON blob storage would make grid queries, calendar queries, search, row-level
  ownership/RLS, realtime updates, and partial sync harder.
- Normalized tables preserve Supabase's strengths.

Boundary:
- v1.5 backup format helps one-time migration.
- It does not solve live bidirectional sync, which still requires revisions,
  tombstones, conflict handling, offline queues, latency policy, and replacing
  Dexie `liveQuery` subscriptions.

#### Big-Tech Pattern Notes

Status: Supporting context

Observed general patterns:
- Backup/restore products often use point-in-time restore or version history.
- Restore is usually replace-like for relationship-heavy data.
- Some services keep a rollback archive before restore.
- Export archive and restore/import are often separate concepts.

Examples used for reasoning:
- Apple iCloud Contacts/Calendars: restore replaces current data with a selected
  archive, while current data is saved as an archive first; changing your mind
  means restoring that newer archive, not selectively merging items.
- OneDrive/Dropbox: version history and point-in-time restore are central
  patterns; retention windows are common.
- Google Takeout: export archive supports data portability, but archive export
  is not the same as first-class selective restore.

GridDO adaptation:
- Follow the user-facing idea of versioned restore.
- Implement with full JSON snapshots plus hash dedupe.
- Keep replace restore and copy import separate.

## Discarded Ideas

- Immediate IndexedDB deletion and full Supabase migration: not adopted yet
  because scope and auth/sync implications are unresolved.
- Treating persistent browser storage as backup: dropped because it cannot
  recover from deliberate site-data clearing.
- Treating different local ports as one data source: impossible under normal
  browser origin rules.
- IndexedDB-internal backup snapshots as the main safety layer: discarded
  because browser site-data deletion can remove snapshots with primary data.
- Diff-only backup files: discarded because each backup should be independently
  restorable; use diff/hash comparison only to decide whether to write a full
  snapshot.
- True merge import: discarded for v1.5 because it requires sync-grade conflict
  semantics.
- Moving current data to Trash during restore: discarded because Trash is an
  app deletion lifecycle, not backup staging.
- Encrypted backup as v1.5 default: deferred because password/key management
  would slow down the immediate data-loss safety fix.
- Storing backup JSON as the primary Supabase database shape: discarded because
  normalized cloud tables are better for query, RLS, realtime, and sync.

## References

- `docs/prd.md` — Storage Strategy already defines v1 IndexedDB, v1.5
  export/import, and v2 optional cloud sync.
- `docs/SPEC.md` — DataStore abstraction is the intended migration boundary for
  future cloud sync.
- `src/app/debug-indexeddb/page.tsx` — current read-only origin-specific
  IndexedDB dump surface.
- MDN Same-Origin Policy — protocol, host, and port define origin; IndexedDB is
  origin-separated.
- MDN Storage quotas and eviction criteria — browser storage is best-effort by
  default; persistent storage can reduce eviction risk but user clearing still
  deletes data.
- MDN File System Access API / `showSaveFilePicker` — browser capability and
  user-gesture constraints for direct file writes.
- Chrome File System Access API guide — file/folder handles can support direct
  writes when permission is granted.
- Apple iCloud restore documentation — restore replaces current Contacts or
  Calendars with an archived version while preserving the pre-restore state as
  another archive.
- Microsoft OneDrive restore documentation — point-in-time restore/version
  history pattern.
- Dropbox version history documentation — versioned restore pattern.
- Google Takeout documentation — export archive pattern.
