# GridDO Project Adapter v2 Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace GridDO's Phase-23-specific Markdown adapter with one tracked Project Adapter v2 policy that supports independent Phase 24 and Phase 25 lifecycle kickoffs.

**Architecture:** Keep durable repository policy in a whole-file JSON adapter, resolve commands through a separate repository-owned JSON catalog, and recompute all Git/runtime facts on every lifecycle invocation. Store lifecycle approval only in future phase-specific JSON receipts. Migrate once on a dedicated branch, merge it, and branch both phases from the resulting `origin/main`.

**Tech Stack:** JSON, Bash, Git worktrees, candidate `resolve-project-adapter-v2.py`, GitHub CLI.

---

### Task 1: Preserve the migration RED boundary

**Files:**

- Read: `AGENTS.md`
- Read: `docs/CODEX_WORKFLOW_ADAPTER.md`

**Step 1: Prove the legacy adapter is rejected**

Run:

```bash
python3 /Users/jwk/Documents/codex-workflow-clean-design-mode-implementation/skills/run-phase/scripts/resolve-project-adapter-v2.py \
  --repo-start /Users/jwk/Documents/griddo2-codex-adapter-v2-migration \
  --adapter docs/CODEX_WORKFLOW_ADAPTER.md \
  --lifecycle run-phase
```

Expected: exit `5`, `status: migration_required`,
`migration.adapter_format: markdown`, `writes_allowed: false`.

**Step 2: Prove the selected v2 pointer is not silently guessed**

Run the same command with `--adapter docs/CODEX_WORKFLOW_ADAPTER.json`.

Expected: exit `3`, `status: onboarding_required`, explicit unresolved policy,
and `writes_allowed: false`.

**Step 3: Confirm the repository is still clean**

Run `git status --short`.

Expected: only this already-committed plan history; no working-tree output from
either resolver.

### Task 2: Replace the legacy adapter with stable v2 policy

**Files:**

- Modify: `AGENTS.md`
- Delete: `docs/CODEX_WORKFLOW_ADAPTER.md`
- Create: `docs/CODEX_WORKFLOW_ADAPTER.json`
- Create: `docs/CODEX_WORKFLOW_COMMANDS.json`
- Create: `scripts/codex-gh`

**Step 1: Update the explicit project entrypoint**

Change `AGENTS.md` so it:

- points only to `docs/CODEX_WORKFLOW_ADAPTER.json`;
- resolves current paths, branches, commits, remotes, and commands at runtime;
- records Phase 23 as completed history without requiring its removed worktree;
- allows Phase 24 and Phase 25 to request independent Run Phase Gate C packets
  according to exact task dependencies;
- gives no phase, task, publication, or live-rollout authority;
- preserves the Claude/OMC boundary.

**Step 2: Add the whole-file v2 adapter**

Create `docs/CODEX_WORKFLOW_ADAPTER.json` with these exact stable fields:

```json
{
  "schema_version": 2,
  "adapter_kind": "codex-project-policy",
  "project_identity": {
    "repository_id": "jwk26/griddo"
  },
  "canonical_documents": {
    "authority_order": [
      "schema",
      "spec",
      "design",
      "execution",
      "planning_standard",
      "workflow"
    ],
    "roles": {
      "product": "docs/prd.md",
      "schema": "docs/SCHEMA.md",
      "spec": "docs/SPEC.md",
      "design": "docs/DESIGN_TOKENS.md",
      "execution": "docs/EXECUTION_PLAN.md",
      "planning_standard": "docs/PLANNING_STANDARD.md",
      "workflow": "docs/WORKFLOW.md"
    }
  },
  "planning_layout": {
    "mode": "scaled",
    "active_plan_role": "execution"
  },
  "issue_ledger": {
    "path_pattern": "docs/issues/Issues_Phase_{phase}.md",
    "active_states": ["Open", "In Progress", "Awaiting User Decision"],
    "user_acceptance_marker": "[x]",
    "direction_change_role": "workflow"
  },
  "receipt_policy": {
    "lifecycle_path_patterns": {
      "craft-docs": "docs/receipts/Craft_Docs.{gate}.json",
      "run-phase": "docs/issues/Issues_Phase_{phase}.{gate}.json",
      "run-task": "docs/issues/Issues_Phase_{phase}.Task_{task}.{gate}.json",
      "end-phase": "docs/issues/Final_Close_Phase_{phase}.json"
    }
  },
  "verification_policy": {
    "command_catalog": {
      "kind": "json-command-map",
      "path": "docs/CODEX_WORKFLOW_COMMANDS.json"
    },
    "constraint_roles": ["planning_standard"],
    "lifecycle_gates": {
      "craft-docs": {
        "focused": ["diff-check"],
        "full": ["diff-check"]
      },
      "run-phase": {
        "focused": ["diff-check", "typecheck"],
        "full": ["test", "lint", "typecheck", "build"]
      },
      "run-task": {
        "focused": ["diff-check", "typecheck"],
        "full": ["test", "lint", "typecheck", "build"]
      },
      "end-phase": {
        "focused": ["diff-check", "typecheck"],
        "full": ["test", "lint", "typecheck", "build"]
      }
    }
  },
  "git_policy": {
    "selected_remote": "origin",
    "protected_branch": "main",
    "integration_branch": "main",
    "remote_default_branch_role": "protected_branch",
    "branch_naming": "phase-{phase}/<lowercase-kebab-description>",
    "reuse_policy": "do-not-reuse-active-phase-branch",
    "feature_worktree": "linked",
    "primary_worktree_role": "integration_branch"
  },
  "publication_policy": {
    "mode": "provider",
    "provider": "github",
    "command_path": "scripts/codex-gh",
    "pr_create_or_reuse": "exact-match-only",
    "pr_base_role": "integration_branch",
    "merge_methods_allowed": ["merge"],
    "expected_head_pinning": "required",
    "required_checks_and_queue": "all reported required checks reach terminal success",
    "bounded_wait_retry": "at most 20 status reads at 15-second intervals"
  },
  "archive_policy": {
    "phase_archive_pattern": "docs/execution-plan/archive/phase-{phase}.md",
    "central_deferred_index": "docs/issues/Issues_Deferred.md",
    "phase_notes_pattern": "not used",
    "reusable_learnings": "docs/execution-plan/LEARNINGS.md"
  },
  "cleanup_policy": {
    "remote_branch": "guarded-non-force-after-merge-proof",
    "local_branch": "guarded-non-force-after-integration-sync",
    "worktree": "guarded-non-force-clean-only"
  }
}
```

**Step 3: Add the logical command catalog**

Create `docs/CODEX_WORKFLOW_COMMANDS.json`:

```json
{
  "diff-check": "git diff --check",
  "test": "pnpm test",
  "lint": "pnpm lint",
  "typecheck": "pnpm typecheck",
  "build": "pnpm build"
}
```

**Step 4: Add the repository-owned publication bridge**

Create executable `scripts/codex-gh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

exec gh "$@"
```

This bridge adds no provider policy. It exposes the installed GitHub CLI only
through the stable repository-relative path required by Adapter v2.

**Step 5: Run pre-commit structural checks**

Run:

```bash
jq empty docs/CODEX_WORKFLOW_ADAPTER.json docs/CODEX_WORKFLOW_COMMANDS.json
bash -n scripts/codex-gh
test -x scripts/codex-gh
! rg -n '"(repository_root|current_branch|current_worktree|worktree_root|primary_integration_worktree|remote_url|default_branch|approved_base|approved_scope|lifecycle_scope|accepted_tasks|current_batch|pr_head|merge_method)"[[:space:]]*:' docs/CODEX_WORKFLOW_ADAPTER.json
git diff --check
```

Expected: every command exits `0` and the forbidden-runtime-key search returns
no matches.

**Step 6: Commit the migration**

```bash
git add AGENTS.md docs/CODEX_WORKFLOW_ADAPTER.md \
  docs/CODEX_WORKFLOW_ADAPTER.json docs/CODEX_WORKFLOW_COMMANDS.json \
  scripts/codex-gh
git commit -m "chore(workflow): migrate GridDO adapter to v2"
```

### Task 3: Validate committed v2 behavior

**Files:**

- Verify: `AGENTS.md`
- Verify: `docs/CODEX_WORKFLOW_ADAPTER.json`
- Verify: `docs/CODEX_WORKFLOW_COMMANDS.json`
- Verify: `scripts/codex-gh`

**Step 1: Resolve each lifecycle from committed bytes**

For each lifecycle in `craft-docs run-phase run-task end-phase`, run the matching
candidate resolver from that skill directory with:

```bash
python3 <candidate-skill>/scripts/resolve-project-adapter-v2.py \
  --repo-start /Users/jwk/Documents/griddo2-codex-adapter-v2-migration \
  --adapter docs/CODEX_WORKFLOW_ADAPTER.json \
  --lifecycle <lifecycle>
```

Expected without a lifecycle receipt: stable policy and runtime resolve,
`contract_ready: true`, `status: approval_required`, and
`writes_allowed: false`. No invocation writes a file.

**Step 2: Verify runtime facts and catalog resolution**

Require the resolver output to report:

- repository ID `jwk26/griddo`;
- current worktree and branch discovered at runtime;
- remote `origin` and default `main` discovered at runtime;
- integration role count exactly one;
- command catalog path `docs/CODEX_WORKFLOW_COMMANDS.json`;
- exact logical command bodies from the catalog;
- no absolute path or current phase state inside `.policy`.

**Step 3: Verify exact tracked identities**

Run:

```bash
git diff --exit-code -- AGENTS.md docs/CODEX_WORKFLOW_ADAPTER.json \
  docs/CODEX_WORKFLOW_COMMANDS.json scripts/codex-gh
git ls-files --error-unmatch AGENTS.md docs/CODEX_WORKFLOW_ADAPTER.json \
  docs/CODEX_WORKFLOW_COMMANDS.json scripts/codex-gh
git status --short
```

Expected: no diff, every path tracked, clean worktree.

### Task 4: Publish the shared migration baseline

**Files:** none

**Step 1: Inspect exact branch history and scope**

Run:

```bash
git log --oneline 8977ffc741abab2707a1c6632cca50324d3101ae..HEAD
git diff --stat 8977ffc741abab2707a1c6632cca50324d3101ae..HEAD
git diff --check 8977ffc741abab2707a1c6632cca50324d3101ae..HEAD
```

Expected: only the approved design, plan, entrypoint, adapter, catalog, and
publication bridge.

**Step 2: Push and create the PR**

```bash
git push -u origin workflow/adapter-v2-migration
gh pr create --base main --head workflow/adapter-v2-migration \
  --title "chore: migrate GridDO workflow adapter to v2" \
  --body "Migrate the committed GridDO workflow policy from the retired Phase 23 Markdown profile to Project Adapter v2. Runtime Git facts are rediscovered, lifecycle approval moves to phase-specific JSON receipts, and no product code or canonical product authority changes."
```

Verify the PR head OID equals local `HEAD` and there is exactly one matching
open PR.

**Step 3: Merge with exact-head pinning**

Run `gh pr merge` with merge method and `--match-head-commit <HEAD>`. Do not use
force, admin, auto-merge, rebase, squash, or implicit branch deletion.

**Step 4: Refresh and prove containment**

Run:

```bash
git fetch origin
git merge-base --is-ancestor <migration-head> origin/main
git rev-parse origin/main
```

Expected: ancestry check exits `0`. Preserve the migration worktree and local
branch until both phase prompts have recorded the merged base.

### Task 5: Prepare the two lifecycle prompts

**Files:** none

**Step 1: Pin shared identities**

Record:

- merged `origin/main` SHA;
- migration PR and merge proof;
- candidate branch and commit
  `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`;
- adapter relative path `docs/CODEX_WORKFLOW_ADAPTER.json`.

**Step 2: Produce the Phase 25 prompt**

The prompt requests only a read-only Run Phase readiness report and Gate C for
Phase 25. It must stop before branch/worktree/receipt writes until the user
approves exact values. After Gate C it prepares the phase and stops before Run
Task. The first proposed command batch is Tasks 120 and 121, subject to fresh
dependency and mutex inspection.

**Step 3: Produce the Phase 24 prompt**

The prompt requests only a read-only Run Phase readiness report and Gate C for
Phase 24 under its own branch/worktree. It treats Tasks 106–119 as document-only
decision prerequisites, preserves the `decision-docs` mutex, and writes no
product code. It does not infer that Phase 25 waits for Phase 24.

**Step 4: Return both reports to the control tower**

Each phase session must report exact branch, worktree, base, receipt, commit,
current task, tests, and blockers. Neither session may merge, rebase,
cherry-pick, push, change main/live skills, or edit the other phase's scope
without a new control-tower instruction.
