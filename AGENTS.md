# GridDO Codex entrypoint

This is the Codex entrypoint. It coexists with, and does not replace or modify,
`CLAUDE.md`.

## Authority and discovery

- Read `docs/CODEX_WORKFLOW_ADAPTER.md` before a project-specific write.
- Read `docs/EXECUTION_PLAN.md` first when an approved execution lifecycle is
  active. In scaled mode, use its Phase Index and active phase detail; archive
  files are historical rather than default instructions.
- Canonical authority and exact paths are declared only by the adapter.
- `docs/WORKFLOW.md` owns durable direction-change and issue-recording rules.
  `docs/prd.md` is historical, non-authoritative context.
- Use `package.json` as the command source for application test, lint,
  typecheck, build, and development scripts. Do not copy command definitions
  here.

## Current Codex lifecycle scope

- The Fresh-map `$craft-docs` campaign was published by PR #36 and is complete.
- `$run-phase` is active for the exact Phase 23 Gate C scope declared in
  `docs/CODEX_WORKFLOW_ADAPTER.md`. `$run-task` is available only from the
  committed kickoff receipt and only for its exact approved batch.
- `$end-phase` fields are refreshed for the current feature branch, but the
  lifecycle remains unavailable until its own user Final Close. The completed
  docs-publication authority is expired and must never be reused.
- Tasks 101–104 are accepted. The current bounded `$run-task` batch is Task
  105 only; Task 105A is planned but unavailable until Task 105 acceptance and
  its own canonical-document gate. The superseded Golden pilot was compared
  without reuse and retired on 2026-07-28. Its final SHA `52a385d` is
  historical audit identity only; do not reconstruct or import it.
- `$run-phase` owns preparation and the phase kickoff receipt, then stops.
  `$run-task` owns implementation and checkpoint evidence; it may not create,
  switch, delete, rebase, or push a branch or worktree.
- A task or phase receives `[x]` only after explicit user acceptance.
- Recover from committed documents, receipts, Git state, and rerun checks—not
  from chat memory or external evidence alone.

External Task 14 evidence is SHA-pinned as read-only reference material in the
adapter. It is not canonical authority and may not be copied without
production reconciliation and the owning document gate.

Claude/OMC/provider worker instructions are not Codex execution rules. Codex
must not invoke Claude, OMC, provider workers, or tmux workers. Their existing
files remain a separate, protected runtime entrypoint.
