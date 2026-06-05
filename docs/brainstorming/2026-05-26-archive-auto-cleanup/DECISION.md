# Archive Auto-Cleanup Policy

## Metadata

- Created: 2026-05-26
- Readiness: draft
- Category: deferred task
- Source project: griddo2-claude
- Source topic: out_of_phase planning amendment
- Source prototype: n/a
- Tags: archive, cleanup, retention
- Dependencies: 2026-04-28-lifecycle-system-foundation, 2026-04-28-archive-view-and-restore

## Summary

Auto-cleanup policy for archived items. Deferred because the retention period and cleanup mode require a policy decision that has not been made.

## Decision Needed

The following must be decided before this can be promoted to the active plan:

- Retention period: 30 days / 60 days / 90 days / never auto-delete
- Cleanup mode: automatic (silent deletion after retention) or manual (surface candidates for user confirmation)

## Implementation Outline

**Files:** `src/lib/utils/archive-cleanup.ts` (create), `src/lib/constants.ts` (update)

**Dependencies:** Archive List + Restore Action (from archive-view-and-restore)

**Actions (once policy is decided):**
- Create `archive-cleanup.ts`: utility function `getCleanupCandidates(retentionDays: number): Promise<ArchivedItem[]>` — identifies items archived longer than retention period
- In `constants.ts`: add `ARCHIVE_RETENTION_DAYS` constant (value per policy decision)
- Cleanup mode per decision: if manual, return candidates for user confirmation; if automatic, delete and return count
- Integration point: call on Archive View surface mount, show cleanup prompt if candidates exist

**Acceptance:**
- Cleanup function correctly identifies items past retention period
- Cleanup mode matches decided policy
- `ARCHIVE_RETENTION_DAYS` constant matches decided value
- `pnpm build` passes

## Canonical Refs

- SPEC.md Decision #16 (Archive lifecycle)
- SCHEMA.md (archivedAt field, Indexes 14-16)
