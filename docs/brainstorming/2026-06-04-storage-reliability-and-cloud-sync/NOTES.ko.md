# 저장소 안정성과 클라우드 동기화 Notes

## Metadata

- Created: 2026-06-04
- Related topic: 2026-06-04-storage-reliability-and-cloud-sync

## Session Log

### 2026-06-04

#### Daily Progress

- [x] Storage-loss risk — 실제 product risk로 확인했고 DECISION.md에 반영
- [x] Port-specific IndexedDB confusion — origin fragmentation으로 기록했고 DECISION.md에 반영
- [x] Immediate direction — IndexedDB는 유지하고 backup/persistent-storage safety net을 먼저 추가
- [x] Supabase migration concern — 현재 codebase 기준 v2-sized architecture track으로 검증
- [x] Sidebar sync/status UX — manual sync와 auto sync를 포함한 backup freshness indicator로 정리
- [x] Backup file model — full JSON snapshot files + content-hash dedupe로 정리
- [x] Restore/import policy — replace restore + copy import로 정리
- [x] Failure/fallback policy — download fallback을 포함한 capability ladder로 정리
- [x] Privacy/encryption — v1.5는 plain JSON, encryption은 defer
- [x] Supabase migration compatibility — backup JSON은 future migration input이며 cloud DB blob이 아님

#### Concern: IndexedDB Data Loss

Status: current product risk로 resolved — DECISION.md에 반영됨

Initial signal:
- 사용자는 cache removal 또는 Chrome update/maintenance 이후 모든 Nodes/Bits가 사라졌다고 보고했다.
- 이는 PRD의 기존 known risk와 일치한다. v1 IndexedDB data는 browser storage 안에 있으므로 유실될 수 있다.

Outcome:
- current direction은 IndexedDB-only storage를 충분하다고 보지 않는다.
- immediate safety-net work에는 export/import와 persistent storage request가 포함되어야 한다.
- Persistent storage는 risk reducer일 뿐이다. 사용자 또는 브라우저가 site data를 의도적으로 clear하는 경우를 막지 못한다.

#### Concern: Port-Specific Data Sets

Status: expected browser behavior로 resolved — DECISION.md에 반영됨

Initial signal:
- 사용자는 GridDO를 다른 port에서 열 때 서로 다른 Nodes/Bits가 보이는 현상을 관찰했다.

Evidence:
- Same-origin policy에서 origin은 protocol, host, port로 정의된다.
- IndexedDB와 Web Storage는 origin별로 분리된다.
- GridDO에는 이미 `/debug-indexeddb`가 있고, 여기서 exact current origin을 보여준다.

Outcome:
- 이를 application data corruption bug가 아니라 origin fragmentation으로 취급한다.
- future debug/settings surface는 current origin을 명시해야 한다.
- local development에서 하나의 working data set을 유지해야 한다면 fixed origin/port를 선호해야 한다.

#### Concern: Supabase Migration Scope

Status: v1.5 direction 기준 resolved — Supabase는 immediate safety-net path가 아님

Initial signal:
- 사용자는 IndexedDB reliability와 port fragmentation이 취약해 보이기 때문에 GridDO가 IndexedDB를 중단하고 Supabase로 migration해야 하는지 고민했다.

Reasoning:
- Supabase는 durable state를 브라우저 밖으로 옮겨 browser-local loss와 local port fragmentation을 줄일 수 있다.
- 동시에 auth, schema, RLS, local data migration/import, latency behavior, offline policy, reactive subscription replacement 같은 더 큰 product/architecture work를 만든다.
- 기존 DataStore abstraction 덕분에 가능성은 있지만 trivial하지 않다.

Outcome:
- IndexedDB를 즉시 폐기하지 않는다.
- 더 작은 v1.5 safety net을 먼저 구현한다.
- Supabase는 v2 storage/sync 또는 cloud-backup strategy로 평가한다.

Codebase-based assessment:
- 현재 앱에는 Supabase 또는 auth dependency가 없다. `package.json`에는 Dexie가 있지만 Supabase/auth library는 없다.
- `docs/prd.md`와 `docs/SPEC.md`는 v1을 no server, no database, no auth인 local-first로 명시한다.
- `src/lib/db/datastore.ts`는 GridDO에 유용한 CRUD migration boundary를 제공한다. future backend change가 bounded이고 full UI rewrite를 의미하지는 않는다.
- reactive read layer는 현재 Dexie-specific이다. Grid, calendar, node, bit-detail, urgency, breadcrumb, trash hooks가 Dexie `liveQuery`로 subscribe한다.
- 많은 interaction flow가 `DataStore` mutation을 직접 호출하고 drag/drop, scheduling, chunk edits, trash, restore, promotion에서 local write가 빠르다는 전제를 가진다.
- runtime schema에는 `userId`, sync version, server timestamp, remote ownership fields가 없다. Supabase로 이동하려면 storage adapter만이 아니라 schema와 migration decisions가 필요하다.
- `src/lib/db/indexeddb.ts`에는 grid occupancy, cascade delete/restore, BFS restore placement, promotion, deadline checks, search, calendar filtering, durable local migration markers 같은 substantial local behavior가 들어 있다.

Conclusion:
- Supabase는 browser-local loss와 origin fragmentation을 근본적으로 줄일 수 있다.
- 하지만 auth, sync semantics, offline behavior, latency policy, RLS/ownership, schema migration까지 scope를 확장한다.
- Supabase는 first reliability fix가 아니라 v2 architecture evaluation으로 취급한다.
- immediate direction은 export/import, persistent-storage request, backup reminder, user-visible backup/sync status surface를 포함한 v1.5 safety work다.

#### Direction: Minimal Safety Net with Sidebar Sync Surface

Status: DECISION.md에서 resolved

User direction:
- catastrophic data loss를 막는 가장 작은 safety layer부터 시작한다: Export/Import, persistent storage, backup reminder.
- sync control을 sidebar에 둔다.
- 현재 local data가 latest backup/sync state에 반영되어 있는지, outdated인지 color 또는 icon state로 보여준다.
- manual sync와 auto sync를 모두 지원한다.

Open terminology:
- v1.5에서 "sync"는 cloud real-time sync가 아니라 local backup/export freshness를 의미할 수 있다.
- cloud target이 존재하지 않는 한, UX가 Supabase-style multi-device sync를 암시하면 안 된다.

Outcome:
- v1.5에서는 sidebar Sync surface를 backup freshness에 사용한다.
- Manual sync는 backup을 즉시 쓴다.
- Auto sync는 browser support와 folder permission이 허용할 때 실제 backup file을 쓴다.
- auto writes가 unavailable이면 같은 surface가 backup reminder + manual download로 degrade된다.

#### Decision: Local File Backup vs IndexedDB Snapshot

Status: resolved — local file backup이 safety mechanism

Clarification:
- IndexedDB snapshot은 JSON-shaped backup data를 browser-managed IndexedDB store 안에 저장하는 것을 의미한다.
- 이는 in-app undo/rollback에는 유용하지만, 사용자가 실제 겪은 failure case를 해결하지 못한다. site-data deletion이 snapshot과 primary data를 함께 제거할 수 있기 때문이다.
- Local backup file은 browser-managed site data 밖, 예를 들어 user-selected folder에 저장된다.

Outcome:
- v1.5에서는 IndexedDB-internal snapshot을 main backup mechanism에서 제외한다.
- v1.5는 real JSON file을 사용한다.
- design은 future cloud-sync mental model을 남긴다: 지금은 backup freshness, 나중에는 cloud sync.

#### Decision: Real File Auto Sync

Status: resolved — browser capability가 허용할 때 선호

User preference:
- Auto sync는 reminder만 보여주는 것이 아니라 real file write를 수행해야 한다.

Recommended UX:
- 사용자가 backup folder를 선택한다.
- GridDO는 newest backup으로 `griddo-latest.json`을 쓴다.
- data content가 바뀌었을 때 dated backup file을 쓴다.
- Sidebar는 color/icon으로 state를 보여준다: green backed up, yellow pending, blue saving, red action needed.

Fallback:
- folder writes가 unsupported 또는 permission unavailable이면 manual sync가 browser download로 backup file을 내려받는다.

#### Decision: Backup Scope

Status: resolved — full application data graph

Must include:
- active, trashed, archived, system Nodes를 포함한 모든 `nodes`
- Inbox 아래 Scratch Bits를 포함한 모든 `bits`
- trashed/archived Bit의 Chunks를 포함한 모든 `chunks`
- consumed rows를 포함한 future `scratchBreakdowns`
- lifecycle fields (`deletedAt`, `archivedAt`, `hiddenFromGrid`, `systemRole`, `pastDeadlineDismissed`)
- layout/order fields (`parentId`, `level`, `x`, `y`, `order`, `createdAt`, `mtime`)
- deadline/scheduling fields (`deadline`, `deadlineAllDay`, `time`, `timeAllDay`, priority/status)

Should include:
- format/schema version, export timestamp, debugging용 source origin, row counts, content hash가 들어간 manifest
- import 때 duplicate Inbox/Archive system nodes를 피할 수 있는 system-node reconciliation metadata

Should not include:
- browser file handles 또는 folder permissions
- route, search query, edit mode, drag/hover state 같은 transient UI state
- primary data로서의 backup status

Open nuance:
- 현재 runtime에는 breadcrumb-zone migration marker용 Dexie `settings` store가 있다. future product settings는 backup해야 할 가능성이 높지만, internal migration markers는 별도 import policy가 필요하다.

#### Decision: Content Hash Dedupe

Status: resolved — backup functionality 전체에 적용

Reasoning:
- data가 바뀌지 않았는데 duplicate file을 만들면 recovery 가치는 늘지 않고 folder clutter만 늘어난다.
- hash comparison은 dated backups뿐 아니라 auto sync, manual sync, pre-restore safety backups에도 적용될 수 있다.

Policy:
- canonical backup payload에서 `contentHash`를 계산한다.
- `exportedAt`, filename, source origin, file path 같은 volatile metadata를 제외한다.
- hash가 last successful backup과 같으면 up-to-date로 보고하고 file을 쓰지 않는다.
- hash가 다르면 `latest`를 쓰고 필요하면 dated backup을 생성한다.
- manual sync는 나중에 force-copy action을 제공할 수 있지만, default behavior는 duplicate content를 skip한다.

Important wording:
- 이는 "full snapshots를 쓰기 전에 diff/hash를 비교한다"는 뜻이지, "diff file만 저장한다"는 뜻이 아니다.
- 모든 backup file은 독립적으로 restorable해야 한다.

#### Decision: Retention

Status: v1.5 기준 resolved — automatic deletion 없음

Reasoning:
- Hash dedupe가 초기에 backup count를 충분히 낮게 유지할 가능성이 높다.
- recovery file을 auto-delete하면 사용자의 마지막 useful restore point를 제거할 수 있다.
- retention UI는 first safety layer에 필요하지 않은 product complexity를 만든다.

Policy:
- `griddo-latest.json`을 유지한다.
- 실제 생성된 every dated backup을 유지한다.
- pre-restore backup을 유지한다.
- 필요하면 나중에 count/size metadata를 보여준다.
- "keep last 90 days", "keep last N backups" 같은 retention options는 defer한다.

#### Decision: Restore vs Import

Status: resolved — replace restore와 copy import를 분리

Restore:
- disaster recovery / point-in-time replacement.
- backup file을 validate한다.
- manifest와 counts를 preview한다.
- current data가 있으면 먼저 pre-restore backup을 쓴다.
- current IndexedDB contents를 backup contents로 replace한다.
- backup의 IDs를 preserve한다.

Import:
- non-empty current GridDO에 backup data를 가져오되 current rows를 overwrite하지 않는다.
- imported data를 true merge가 아니라 copies로 취급한다.
- 모든 imported entity ID를 remap한다.
- parent-child links를 new IDs로 remap한다.
- existing rows는 그대로 둔다.
- same title, same path, same original ID 기준으로 auto-merge하지 않는다.
- 같은 backup hash가 이미 import된 적 있으면 warning한다.
- current payload hash가 backup hash와 정확히 같으면 skip한다.

Rationale:
- True merge는 same IDs, deleted vs edited rows, grid position collisions, system-node identity, Scratch breakdown lifecycle, archive/trash state, parent-chain repair에 대한 conflict rules가 필요하다.
- 이 수준의 conflict handling은 v1.5 backup이 아니라 future cloud sync에 속한다.

#### Decision: Pre-Restore Safety Backup Instead of Trash

Status: resolved — restore 중 current data를 Trash로 보내지 않음

User explored:
- restore 때 current data를 GridDO Trash로 보내면 사용자가 나중에 필요한 piece를 recover할 수 있지 않을까?

Conclusion:
- Trash를 backup staging으로 사용하지 않는다.

Reasoning:
- Trash는 GridDO 내부의 user deletion lifecycle이다.
- entire current DB를 Trash로 옮기면 product semantics가 흐려진다.
- restored backup data와 trashed previous data가 system nodes, IDs, parent paths, grid positions를 공유할 수 있어 merge conflicts가 다시 생긴다.
- Scratch breakdowns와 archive/trash lifecycle은 normal Trash에서 cleanly recover하기 어렵다.

Alternative:
- pre-restore backup file을 쓴다.
- restore는 replace로 수행한다.
- 사용자가 old data를 나중에 필요로 하면 pre-restore file을 Import from backup으로 가져온다.

#### Decision: Failure and Fallback

Status: resolved — capability ladder

Simple model:
- Automatic backup possible: folder selected, browser supports writes, permission active.
- Manual backup only: browser가 folder에 직접 쓸 수 없거나 user가 setup하지 않음.
- Problem state: permission denied/expired, write failed, payload generation failed.

UX:
- Green: current data backed up.
- Yellow: backup needed 또는 pending.
- Blue: saving.
- Red: user action needed.

Rules:
- Backup failure는 normal GridDO work를 막지 않는다.
- Failed writes는 last successful hash/timestamp를 update하지 않는다.
- Permission problems는 retry 또는 manual download fallback을 제공한다.
- Replace restore는 더 엄격하다. current data를 먼저 preserve해야 하는데 safety backup을 쓸 수 없으면 restore를 중단한다.

#### Decision: Atomic Writes

Status: resolved — 가능한 범위에서 적용

Policy:
- browser APIs가 허용하는 경우 `griddo-latest.json`을 update하기 전에 temp file을 먼저 쓴다.
- Dated backups는 newly named files라 overwrite risk가 낮다.
- restore/import 전 backup files를 parse, version-check, hash-check한다.
- file write와 verification path가 성공하기 전에는 backup successful로 mark하지 않는다.

#### Decision: Privacy and Encryption

Status: resolved — v1.5는 plain JSON

Reasoning:
- Backup files에는 user의 task, idea, Scratch, deadline, lifecycle data가 들어간다.
- 사용자가 cloud-synced folder를 선택하면 backup file은 해당 provider의 sync/storage policy를 따른다.
- Encryption은 password loss, key storage, auto-sync unlock, cross-device import questions를 만든다.

Policy:
- v1.5에서는 plain JSON을 사용한다.
- setup과 restore/import surface에서 data sensitivity를 명확히 알린다.
- encrypted/password-protected backups는 defer한다.

#### Decision: Versioning and Schema Compatibility

Status: resolved — versioned backup format

Policy:
- `backupFormatVersion: 1`을 포함한다.
- app/schema version marker를 포함한다.
- known versions만 지원한다.
- older supported versions는 explicit migration functions를 통해 migrate한다.
- future versions, unknown required stores, missing required fields는 reject한다.
- safe한 unknown optional metadata는 ignore한다.

#### Direction: Supabase Migration Compatibility

Status: backup design 기준 resolved — migration-ready input, not cloud blob

Question:
- 현재 계획이 backup file을 local에 저장하는 방식인데, future Supabase migration에서는 이 파일을 그대로 database에 올리는가?

Answer:
- 아니다. Backup JSON은 migration input이지 primary Supabase storage shape가 아니다.

Future flow:
1. User가 local GridDO backup JSON을 생성한다.
2. Future Supabase/GridDO version이 user에게 login을 요청한다.
3. User가 backup JSON을 선택한다.
4. App이 file을 validate한다.
5. Migration이 cloud `user_id`를 attach한다.
6. Data를 `nodes`, `bits`, `chunks`, `scratch_breakdowns` 같은 normalized tables에 insert/upsert한다.
7. Original JSON은 audit/disaster recovery 용도로 별도 저장할 수 있지만, app queries는 normalized rows를 사용해야 한다.

Reasoning:
- JSON blob storage는 grid queries, calendar queries, search, row-level ownership/RLS, realtime updates, partial sync를 어렵게 만든다.
- Normalized tables가 Supabase의 장점을 살린다.

Boundary:
- v1.5 backup format은 one-time migration에 도움이 된다.
- live bidirectional sync는 해결하지 않는다. live sync에는 revisions, tombstones, conflict handling, offline queues, latency policy, Dexie `liveQuery` replacement가 필요하다.

#### Big-Tech Pattern Notes

Status: supporting context

Observed general patterns:
- Backup/restore product는 point-in-time restore 또는 version history를 많이 사용한다.
- relationship-heavy data에서는 restore가 replace-like인 경우가 많다.
- 일부 서비스는 restore 전에 rollback archive를 보존한다.
- Export archive와 restore/import는 별도 concept으로 다뤄지는 경우가 많다.

Examples used for reasoning:
- Apple iCloud Contacts/Calendars: selected archive로 restore하면 current data를 replace하고, current data는 먼저 archive로 저장된다. 마음이 바뀌면 selective merge가 아니라 더 최신 archive를 restore한다.
- OneDrive/Dropbox: version history와 point-in-time restore가 중심 pattern이며 retention window가 흔하다.
- Google Takeout: export archive는 data portability를 지원하지만, archive export는 first-class selective restore와 다르다.

GridDO adaptation:
- user-facing idea는 versioned restore pattern을 따른다.
- 구현은 full JSON snapshots + hash dedupe로 단순하고 안전하게 간다.
- replace restore와 copy import를 분리한다.

## Discarded Ideas

- Immediate IndexedDB deletion and full Supabase migration: scope와 auth/sync implications가 unresolved라 채택하지 않음.
- Persistent browser storage를 backup으로 취급: deliberate site-data clearing에서 recover할 수 없으므로 discard.
- 다른 local ports를 하나의 data source로 취급: normal browser origin rules상 불가능.
- IndexedDB-internal backup snapshots를 main safety layer로 사용: browser site-data deletion이 snapshot과 primary data를 함께 제거할 수 있으므로 discard.
- Diff-only backup files: 각 backup이 independently restorable해야 하므로 discard. diff/hash comparison은 full snapshot을 쓸지 결정하는 데만 사용한다.
- True merge import: sync-grade conflict semantics가 필요하므로 v1.5에서는 discard.
- restore 중 current data를 Trash로 이동: Trash는 app deletion lifecycle이지 backup staging이 아니므로 discard.
- v1.5 default encrypted backup: password/key management가 immediate data-loss safety fix를 늦추므로 defer.
- backup JSON을 primary Supabase database shape로 저장: query, RLS, realtime, sync에 normalized cloud tables가 더 적합하므로 discard.

## References

- `docs/prd.md` — Storage Strategy는 이미 v1 IndexedDB, v1.5 export/import, v2 optional cloud sync를 정의한다.
- `docs/SPEC.md` — DataStore abstraction은 future cloud sync를 위한 intended migration boundary다.
- `src/app/debug-indexeddb/page.tsx` — current read-only origin-specific IndexedDB dump surface.
- MDN Same-Origin Policy — protocol, host, port가 origin을 정의하며 IndexedDB는 origin-separated다.
- MDN Storage quotas and eviction criteria — browser storage는 default로 best-effort이며 persistent storage는 eviction risk를 줄일 수 있지만 user clearing은 여전히 data를 삭제한다.
- MDN File System Access API / `showSaveFilePicker` — direct file writes를 위한 browser capability와 user-gesture constraints.
- Chrome File System Access API guide — permission이 있을 때 file/folder handles로 direct writes를 지원할 수 있다.
- Apple iCloud restore documentation — restore는 current Contacts 또는 Calendars를 archived version으로 replace하며 pre-restore state를 another archive로 보존한다.
- Microsoft OneDrive restore documentation — point-in-time restore/version history pattern.
- Dropbox version history documentation — versioned restore pattern.
- Google Takeout documentation — export archive pattern.
