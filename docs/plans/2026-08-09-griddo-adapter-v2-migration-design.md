# GridDO Project Adapter v2 Migration Design

**Status:** User-approved on 2026-08-09

## Goal

Replace the Phase-23-specific Markdown adapter with one Project Adapter v2
policy that lets Phase 24 and Phase 25 start independently from the same merged
GridDO baseline. Preserve all product authority and keep the global workflow
installation unchanged.

## Problem

`docs/CODEX_WORKFLOW_ADAPTER.md` mixes durable project policy with transient
Phase 23 facts. It records an absolute repository path, worktree, branch, base,
accepted tasks, publication state, and external evidence locations. The named
Phase 23 worktree no longer exists, so the candidate resolver correctly returns
`migration_required` and permits no writes.

## Selected approach

Perform the migration once on `workflow/adapter-v2-migration` in the linked
worktree `/Users/jwk/Documents/griddo2-codex-adapter-v2-migration`. Verify and
merge that branch before creating either phase branch. Phase 24 and Phase 25
then derive independently from the resulting `origin/main` commit.

Rejected approaches:

- Putting the migration on the Phase 25 branch would make Phase 24 depend on an
  unrelated, unmerged lifecycle.
- Repeating or cherry-picking the migration into both phase branches would
  create duplicate policy identities and ambiguous receipts.

## Authority and state boundaries

The v2 adapter contains only stable policy:

- repository identity and repository-relative canonical document roles;
- scaled-plan and issue-ledger layout;
- lifecycle receipt path patterns;
- the logical verification catalog and gates;
- remote, branch, worktree, publication, archive, and cleanup policy.

The adapter must not contain repository or worktree paths, current branch or
HEAD, approved base/scope, active lifecycle, accepted tasks, current batch, PR
head, package command bodies, or external evidence locations. Git and the
resolver recompute runtime facts on every invocation. Each lifecycle stores
user approval in its own tracked whole-file JSON receipt.

## Files

- Update `AGENTS.md` to point explicitly to
  `docs/CODEX_WORKFLOW_ADAPTER.json`, remove obsolete Phase 23 path retention,
  and describe separate Phase 24 and Phase 25 kickoffs.
- Delete `docs/CODEX_WORKFLOW_ADAPTER.md`.
- Add `docs/CODEX_WORKFLOW_ADAPTER.json` with schema version 2 stable policy.
- Add `docs/CODEX_WORKFLOW_COMMANDS.json` as the runtime command catalog.
- Add executable `scripts/codex-gh` as the repository-owned GitHub CLI bridge
  required by provider publication policy.
- Add this design and its implementation plan.

Do not modify `CLAUDE.md`, product source, canonical product documents, task
markers, live skill links, or `codex-workflow/main`.

## Stable policy

- Repository ID: `jwk26/griddo`
- Authority order: schema, specification, design, execution plan, planning
  standard, workflow
- Planning mode: `scaled`; active role: execution
- Issue ledger: `docs/issues/Issues_Phase_{phase}.md`
- Remote: `origin`; protected and integration branch: `main`
- Feature branches: `phase-{phase}/<lowercase-kebab-description>`
- Feature worktrees: linked; active phase branches are not reused
- Publication: GitHub PR to the integration branch, merge method only, exact
  head pinning, bounded status reads
- Cleanup: non-force and proof-gated only

The command catalog exposes `diff-check`, `test`, `lint`, `typecheck`, and
`build`. Craft Docs uses the document-safe diff check. Run Phase, Run Task, and
End Phase use the application commands appropriate to focused and full gates;
task-specific focused tests remain owned by the execution plan.

## Error handling

- A legacy Markdown pointer, missing adapter, invalid JSON, untracked or dirty
  policy, missing command, runtime drift, or invalid receipt is a zero-write
  stop.
- Resolver `approval_required` or `ready` proves compatibility only. It never
  grants write authority.
- Phase 24 and Phase 25 each require their own Run Phase Gate C and receipt.
- The candidate remains project-pinned for these pilots; no global live rollout
  is part of this migration.

## Verification and integration

After committing the migration:

1. Parse both JSON files and syntax-check the publication bridge.
2. Invoke the candidate resolver for all four lifecycles and verify stable
   policy/runtime resolution, `contract_ready=true`, and
   `writes_allowed=false` without treating that result as approval.
3. Verify the adapter, catalog, and entrypoint equal tracked `HEAD` bytes.
4. Run `git diff --check` and inspect the exact commit scope.
5. Push the dedicated branch, create an exact-head PR, merge without force, and
   prove the merge is contained in refreshed `origin/main`.

No semantic model launch or application full gate is required for this
document/config-only migration. Each phase's Run Phase lifecycle performs its
own full baseline gate from the merged base.

## Handoff

After merge, produce two independent prompts pinned to the new `origin/main`
SHA and candidate commit `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`:

- Phase 25: authoritative command DAG, Tasks 120–126
- Phase 24: user-owned decision prerequisites, Tasks 106–119

Both prompts require a fresh Run Phase Gate C before branch, worktree, receipt,
or task writes. The control-tower session alone coordinates integration order
and cross-phase scope.
