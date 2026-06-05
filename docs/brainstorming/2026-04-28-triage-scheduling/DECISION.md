# Triage Scheduling

## Metadata

- Created: 2026-04-28
- Readiness: draft
- Category: deferred task
- Source project: griddo2-claude
- Source topic: migrated from out_of_phase ideation (open question #11)
- Source prototype: n/a
- Tags: triage, scheduling, inbox, calendar
- Dependencies: 2026-04-28-inbox-triage-workspace

## Summary

Whether scheduling should be added to the Inbox/Triage workspace, and whether
scheduling an item counts as "handled" before hierarchy placement.

This is an extension of the Inbox/Triage workspace. Scope and design are open.

## Open Question

Should scheduling be added to Inbox/Triage later?

If yes, key design questions:

- Does scheduling a Scratch count as "processed" (removing it from Inbox), or
  must the user also place it in the hierarchy?
- Does scheduling happen inside the Triage workspace, or by dragging to the
  Calendar?
- Can a Scratch be scheduled without being converted to a Bit first?
- Does a scheduled-but-unplaced item appear on the Calendar but not on any grid?

## Current Decision

Deferred. The Inbox/Triage workspace (v1) focuses on hierarchy placement. 
Scheduling integration is a post-v1 extension.
