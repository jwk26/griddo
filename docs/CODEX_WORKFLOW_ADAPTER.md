# GridDO Codex Workflow Adapter

This profile ports the Gate C-approved adapter from commit `ff84ac8` into the
Fresh-map adoption worktree. The `$craft-docs` campaign is complete. The only
additional authority declared here is a one-time docs-only publication close
candidate for the exact branch and heads below. It is not standard
`$end-phase` onboarding and does not accept any implementation task. All
relative paths resolve from `repository_root`.

```yaml
repository_root: /Users/jwk/Documents/griddo2-codex-fresh-map-adoption

lifecycle_scope:
  active: [craft-docs]
  craft_docs_state: complete through approved flow review and canonical-production parity maintenance at 041497c6b14f08998c4e8ef0bfb784f0285628aa
  one_time_docs_close: candidate only; no external mutation until a separate user Final Close receipt
  unavailable_until_separate_onboarding: [run-phase, run-task, end-phase]
  onboarding_commit_policy: Candidate A contains only AGENTS.md and docs/CODEX_WORKFLOW_ADAPTER.md on parent 041497c6b14f08998c4e8ef0bfb784f0285628aa
  commit_policy: before Final Close, only local Candidate A is allowed; after Final Close, only the exact receipt commit Candidate B and the pinned publication sequence are allowed
  checkpoint_policy: every candidate and receipt must be committed, hash-pinned, and clean before the next action
  task_acceptance_policy: Tasks 101–165 remain open; this docs close marks no task or phase accepted

canonical_documents:
  authority_order: [schema, spec, design, execution, planning_standard, workflow]
  product: docs/prd.md (historical context; non-authoritative)
  schema: docs/SCHEMA.md
  spec: docs/SPEC.md
  design: docs/DESIGN_TOKENS.md
  execution: docs/EXECUTION_PLAN.md
  planning_standard: docs/PLANNING_STANDARD.md
  workflow: docs/WORKFLOW.md
  decision_roots: [docs/brainstorming]

planning_layout:
  mode: scaled
  active_plan: docs/EXECUTION_PLAN.md
  scaled_index: docs/EXECUTION_PLAN.md#phase-index
  archive: docs/execution-plan/archive/phase-{NN}.md
  numbering_source: docs/EXECUTION_PLAN.md#next-numbers

issue_ledger:
  path: docs/issues/Issues_Phase_{N}.md
  active_phase_path: not used during craft-docs; derive from the approved replacement execution plan before run-phase onboarding
  create_policy: create during an approved phase kickoff when absent
  active_states: [Open, In Progress, Awaiting User Decision]
  terminal_states: [Closed, Deferred, Dropped, Promoted to Execution Plan]
  user_acceptance_marker: "[x]"
  direction_change_record: docs/brainstorming/YYYY-MM-DD-<topic>/DECISION.md
  direction_change_history: docs/brainstorming/YYYY-MM-DD-<topic>/NOTES.md

verification_gates:
  authoritative_source: package.json scripts plus docs/PLANNING_STANDARD.md
  focused:
    - git diff --check
  full:
    - pnpm test
    - pnpm lint
    - pnpm typecheck
    - pnpm build
  document_validator: not configured; craft-docs owns citation, provenance, traceability, contradiction, link, and flow checks
  application_gate_scope: retained for later implementation lifecycles; not required merely because a Markdown-only craft-docs artifact changed
  user_visible_evidence: required for user-facing implementation tasks per docs/PLANNING_STANDARD.md; source-only disclosure is required for the current recipe pass
  conformance_tiers: Blocking violations stop close; Advisory findings are surfaced and recorded, per docs/PLANNING_STANDARD.md
  readiness_review: docs/reviews/inbox-triage-promotion-flow-review.md

craft_docs:
  selected_route: Brainstorming Route with visual-prototype intake
  selected_topic: docs/brainstorming/2026-06-25-inbox-triage-theme-surface-redesign
  promotion_map: docs/brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/PROMOTION_MAP.md
  approved_map_content_commit: 114b032e7c958ca722a56842253874f5e363c6e2
  approved_map_content_sha256: 06bfaff9982f59435a112d51a71309803d3c3933dae965a97819f7de9c9aecc8
  approval_receipt_commit: 90022e73666857dd6f7906087d8386a85aa73e08
  approval_receipt_path: docs/brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/PROMOTION_MAP.md#approval-receipt
  artifact_order: [recipe_package, schema, spec, design, execution, planning_standard, flow_review]
  recipe_index: docs/recipes/inbox-triage-visual-recipe-index.md
  flow_review: docs/reviews/inbox-triage-promotion-flow-review.md
  receipt_policy: embed the gate, approved pre-receipt content SHA-256, receipt commit, user disposition, and next legal action in each owning artifact
  external_evidence_mode: read-only reference; never canonical authority; reconcile with production and the approved map before adoption
  external_evidence_root: /Users/jwk/Documents/task14-capstone-restart-20260727-evidence
  external_evidence:
    recipe_manifest: recipe/SHA256SUMS@3dc101cd6d6a610815807e072ea4b29deb0487759b3bdd155121044f0af7f049
    schema: schema/SCHEMA.operator-reviewed-9338ecee.md@9338ecee14adb1f5d7b131391ad8a808db438e9b633c1cb3dfc2cb37a4a62a6b
    spec: spec/SPEC.reviewed-ec1ee6ac.md@ec1ee6ac1d4781f332eeab66bcf2a24355c32936f4608c866ed43f651df5ed89
    design: design-tokens/DESIGN_TOKENS.reviewed-e07015e9.md@e07015e9df7e761173fa2547406637854fb0d63b323e3499e3379337740f3574
    execution: planning/EXECUTION_PLAN.reviewed-0cd16ab3.md@0cd16ab3daf4b0fbce5a014bae055acb48db8f70d19f9dcd5fa2ca043c1b6b00
    planning_standard: planning/PLANNING_STANDARD.reviewed-24c2e879.md@24c2e879bfd006c04da23d80830108a0f85d4693e3367e3825e9841b5bc05119
    flow_review: flow-review/phase-23-flow-review.reviewed-418b613d.md@418b613d45685ecaf9fae374b49b370813042e73ecdc71e2ae92bea08ed1e625
    preserved_repository: git-preservation/task14-fresh-repository.bundle@c84cf189b7954caecf787e9551bf6026be77e7f8b5b99cdede68e397702c8af9

git:
  scope: one-time docs-only close candidate; external mutation remains inactive until the declared Final Close receipt
  remote: origin
  remote_url: https://github.com/jwk26/griddo.git
  default_branch: main
  protected_branch: main (workflow-protected by this adapter; provider reported no branch protection or rulesets on 2026-07-28)
  integration_branch: main
  branch_naming: phase-{N}/<lowercase-kebab-description>
  docs_close_branch: docs/inbox-triage-fresh-map-adoption
  docs_close_pre_candidate_head: 041497c6b14f08998c4e8ef0bfb784f0285628aa
  docs_close_pre_candidate_tree: be36acd4b7d15362c18ce819cf8b40baca0f3d50
  docs_close_base: origin/main at a3c679cf7ca09559ecc5e1690fd2a3707d40916c
  docs_close_preview: /Users/jwk/Documents/griddo2-codex-docs-close-preview (detached; Candidate A only)
  docs_close_worktree: /Users/jwk/Documents/griddo2-codex-fresh-map-adoption
  pilot_branch: historical phase-23/inbox-triage-persistence at 52a385d; recovery-only and not an input to this pass
  reuse_policy: do not reuse the historical pilot branch or any unrelated worktree; only the pinned docs-close branch and preview may participate
  worktree_root: /Users/jwk/Documents
  pilot_worktree: /Users/jwk/Documents/griddo2-codex-phase-23-pilot (historical; inactive)
  primary_integration_worktree: /Users/jwk/Documents/griddo2-codex-integration (absent before Final Close)
  primary_integration_policy: create or synchronize only after merge proof; it must resolve to the proven remote main head before lifecycle onboarding

publication:
  scope: one-time docs-only candidate; inactive until the separate Final Close receipt
  provider: GitHub repository jwk26/griddo
  command_or_adapter: gh CLI
  status_evidence: on 2026-07-28 origin/main and remote main were a3c679cf7ca09559ecc5e1690fd2a3707d40916c; feature ref absent; matching open PR absent; branch protection absent; rulesets 0; Actions workflows 0
  pr_create_or_reuse: create exactly one PR after Final Close; fail if a remote feature ref or matching PR appears unexpectedly
  pr_base: main
  pr_head: docs/inbox-triage-fresh-map-adoption at the exact Candidate B receipt commit
  title_body_draft: title `docs: adopt clean Inbox/Triage canonical workflow`; body must summarize the Fresh promotion map, canonical docs and recipes, open VQ prerequisites, parity maintenance, and document-only verification
  merge_method: merge
  expected_head_pinning: use `gh pr merge --match-head-commit <Candidate-B-SHA> --merge`; never merge an unpinned or changed head
  required_checks_and_queue: provider reported none on 2026-07-28; still require PR head/base equality, mergeable state, and no unexpected required check before merge
  bounded_wait_retry: at most 12 status reads at 10-second intervals after Final Close
  final_close_receipt: docs/reviews/inbox-triage-promotion-flow-review.md#docs-publication-final-close-receipt
  allowed_sequence:
    - fast-forward the named docs worktree branch from the pinned pre-candidate head to Candidate A
    - append the exact user-approved Final Close receipt and commit it as Candidate B
    - push only the named feature branch and verify the remote head equals Candidate B
    - create the declared PR, verify its head/base and diff, then merge with Candidate B head pinning
    - prove remote main contains the merged Candidate B tree and synchronize the declared integration worktree
    - only after those proofs, perform the declared non-force cleanup
  prohibited: force push; direct push to main; auto-acceptance of Tasks 101–165; archive mutation; release or deployment; unrelated branch or worktree mutation

archive:
  scope: inactive during craft-docs; paths retained from ff84ac8
  phase_archive: docs/execution-plan/archive/phase-{NN}.md
  central_deferred_index: docs/issues/Issues_Deferred.md
  phase_notes: docs/EXECUTION_PLAN.md phase notes before archival
  reusable_learnings: docs/execution-plan/LEARNINGS.md

cleanup:
  scope: inactive before merge proof; one-time non-force cleanup after the declared main synchronization
  remote_branch: delete only docs/inbox-triage-fresh-map-adoption after remote main is proven to contain Candidate B
  local_branch: delete only docs/inbox-triage-fresh-map-adoption after its attached worktree is clean and removed
  worktree: remove only /Users/jwk/Documents/griddo2-codex-fresh-map-adoption and /Users/jwk/Documents/griddo2-codex-docs-close-preview when clean; do not touch any other worktree
  final_close_receipt: docs/reviews/inbox-triage-promotion-flow-review.md#docs-publication-final-close-receipt
  recovery: if any proof fails, stop without force and retain branch/worktree state for recovery
```

## One-time docs publication boundary

- Candidate A is local-only and may modify only `AGENTS.md` and this adapter.
  It authorizes no fetch, push, PR, merge, publication, or cleanup by itself.
- A separate user Final Close must pin Candidate A and the exact receipt
  payload. Any changed head, base, path set, provider state, payload, or dirty
  worktree invalidates that approval and requires a new packet.
- This docs-only close is not `$end-phase`: Tasks 101–165 remain open, no
  issue ledger is closed, and no phase archive is created.
- External evidence is read-only and SHA-pinned. Its prior approvals do not
  replace production document gates.
- After merge and cleanup, refresh from proven `main` and separately onboard
  `$run-phase` and `$run-task`; do not reuse this one-time authority.
