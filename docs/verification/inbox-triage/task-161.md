# Task 161 — Coordinate Guarded Archive, Recovery, And Handoff

> State: Implemented through repair cycle 3/3; awaiting user checkpoint review
> Task marker: `[ ]`
> Durable start: `c8cdf783a7fd21540036f025278e27816c6262e8`
> Implementation: `300250b364a50f676e525b1e1c1fc1af220085e4`

## Scope And Result

- The mounted Workspace now owns one guarded Archive coordinator. It rechecks
  the current Add-draft and Scratch-title blockers synchronously, acquires the
  shared `archive` lock before storage or dispatch, creates one Task 125
  command, and schema-validates one Task 126 recovery descriptor.
- The descriptor is written to and read back from current-tab
  `sessionStorage` before dispatch. Unavailable, denied, quota, serialization,
  missing-readback, or mismatched-readback storage fails closed with zero
  Archive commands and releases the unstarted lock.
- Pending, unknown, and reconciling retain the selected Scratch, descriptor,
  and shared lock. Competing Archive, Cancel/Escape, Scratch switch, departure,
  Edit, Stage/Unstage, Placement, and Undo intents are rejected without queue
  or replay. Terminal applied/already-applied/not-applied/rejected/conflict
  clears the descriptor and lock; a presentation handoff exception cannot
  reclassify an authoritative applied result as unknown.
- A valid reload descriptor is reconciled before the normal Inbox Workspace
  subtree mounts or can dispatch. Invalid/foreign descriptors are discarded
  without mutation or reconciliation.
- Applied Archive preserves Pool query and created-at sort, selects exact
  next-visible then previous-visible, and focuses the selected Context. A
  filtered no-visible result selects null and focuses Search; a true empty
  result focuses the primary Add item action. Hidden Scratches are never
  selected and the route never moves to Archive View.
- Task 162 recovery presentation, wording, Retry/Check-again UI, spinner,
  toast, and dialog remain absent.

## Authority, Ordering, And Ownership

| Evidence | Value |
| --- | --- |
| Entrypoint | Accepted Task 160 commit `23184e06ae20ede9d6b5c18db02a11b4553ee7b0` |
| Task authority | Exact Phase 30 Control Tower Task 161 work order dated 2026-09-01; the Gate C `run-phase` receipt was not represented as a Task 161 receipt |
| Resolver | Pinned candidate `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`, pinned run-task SHA-256 `614631c56866549feb298d995ea0cf1311caa1cacaaefc2ba2ca753e43910531`, explicit Adapter `docs/CODEX_WORKFLOW_ADAPTER.json`; expected `approval_required`, `contract_ready=true`, `writes_allowed=false` |
| Durable start | `c8cdf783a7fd21540036f025278e27816c6262e8`; ledger-only parent of every Task 161 product/test write |
| Implementation | `300250b364a50f676e525b1e1c1fc1af220085e4`; Task 161 product and owner-test implementation |
| Dependencies | Accepted Tasks 126, 127, 130, 136, 137, 139, 145, 152, 156, and 159 were revalidated as ancestors of the Task 160 entrypoint |
| Canonical impact | `None` — existing SCHEMA/SPEC/plan and Archive recipe were implemented without product, design, schema, persistence, or workflow-authority change |
| Owner gate / unowned | No owner expansion or unresolved scope stop; `Unowned: None` |

The Task 161 product changes are
`src/hooks/use-archive-scratch.ts`,
`src/components/triage/breakdown-panel.tsx`,
`src/components/triage/triage-workspace.tsx`,
`src/components/triage/scratch-pool.tsx`, and
`src/stores/triage-store.ts`. Their matching tests are
`src/hooks/use-archive-scratch.test.ts`,
`src/components/triage/breakdown-panel.test.tsx`,
`src/components/triage/triage-workspace.test.tsx`,
`src/components/triage/scratch-pool.test.tsx`, and
`src/stores/triage-store.test.ts`. The already-wired generic owner behavior in
`src/hooks/use-triage-placement.ts` and
`src/hooks/use-triage-newly-placed.ts` required no source change; Archive-owned
exclusion was added to their matching tests and to
`src/hooks/use-triage-operation-lock.test.tsx`.

## TDD, Review, And Repair Evidence

1. Initial RED coverage exercised synchronous blocker races, lock/storage/
   dispatch ordering, every storage failure, terminal and unknown recovery,
   reload gating, handoff resolution, focus owners, and competing operation
   seams before their Task 161 owners were implemented.
2. Repair cycle 1 found that the eligibility hook could mount before reload
   reconciliation and that terminal snapshot failure lacked a bounded fallback.
   The normal Inbox subtree was moved behind the recovery gate and the existing
   Pool snapshot became the failure fallback.
3. The first browser pass found that a final active Scratch under a non-empty
   query rendered true empty and focused Add. Repair cycle 2 first added failing
   store/Pool regressions, then made filtered-null query-aware and focused Search.
4. Final self-review found that an applied handoff callback exception could
   escape after descriptor/lock release and be recast as unknown. Repair cycle
   3 reproduced the rejected promise in one RED test, then made the callback
   failure non-authoritative, retained the lock through handoff, and preserved
   terminal applied truth. The focused regression then passed.
5. The final focused/full gates and the final-input browser session ran after
   repair cycle 3. All three authorized repair cycles were used; no fourth
   cycle was attempted and no Critical or Important finding remains open.

## Latest Verification

| Command | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm exec vitest run src/hooks/use-archive-scratch.test.ts src/hooks/use-triage-operation-lock.test.tsx src/components/triage/breakdown-panel.test.tsx src/components/triage/triage-workspace.test.tsx src/components/triage/scratch-pool.test.tsx src/stores/triage-store.test.ts src/hooks/use-triage-placement.test.tsx src/hooks/use-triage-newly-placed.test.tsx` | 0 | 8 selected files / 343 tests passed; duration `3.97s` |
| target-path `pnpm exec eslint` for the 13 changed TypeScript source/test paths | 0 | 0 errors and 0 warnings |
| `pnpm typecheck` (focused) | 0 | `tsc --noEmit` passed |
| `pnpm test` | 0 | 100 files / 1,254 tests passed; Vitest duration `18.38s` |
| `pnpm lint` | 0 | 0 errors; 11 unchanged existing warnings |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; compile `3.7s`, TypeScript `8.7s`, seven pages generated |
| `git diff --check` | 0 | Whitespace verification passed after the final product change |

The test/build commands emitted only the already-known Node deprecation and
worker `localStorage` experimental warnings.

## Final-Input Running-App Evidence

One fresh Playwright session ran the canonical Inbox route against
implementation `300250b364a50f676e525b1e1c1fc1af220085e4` on 2026-09-02.
The fixture and current-tab storage were ephemeral and task-local.

- Each direct Archive trace was `storage-set` → `storage-get` readback →
  `archive-put` → `storage-remove`. The stored value was a schema-valid Task 126
  descriptor, dispatch occurred exactly once, and the descriptor was absent at
  terminal completion.
- Next-visible archived `Selected Scratch`, selected `Next Scratch`, and focused
  `Selected Scratch: Next Scratch` Context. Previous-visible archived the tail,
  selected `Previous Scratch`, and focused its Context.
- Filtered no-visible preserved query `no-match`, selected null, rendered `No
  matches`, and focused the Search input. True empty preserved an empty query,
  rendered `No active scratches`, selected null, and focused `Add item`.
- Every handoff stayed on the canonical Inbox URL; no hidden Scratch was
  selected and Archive View was not opened.
- A real forced reload started with a valid applied recovery descriptor.
  Instrumentation observed descriptor reads and classifier reads, then
  `storage-remove`, then the first normal Inbox Workspace mount. At mount the
  descriptor was absent; `Reload Next` Context was selected and focused.
- Browser console inspection returned zero errors. No visual matrix or
  campaign-wide visual claim was made; Task 164 retains that ownership.

## Relevant-Input Fingerprint

The final fingerprint is SHA-256
`8db1b9add3f5b65d1ac2b0954f636982549c79406ffdb2ff1135ddccd5126e4b`.
It hashes a newline-delimited manifest in path order containing Git blob IDs
for the Adapter, Gate C and Phase 29 receipts, execution plan, SCHEMA, SPEC,
Archive recipe, Tasks 159–160 evidence, Task 125/126 repository command and
recovery owners, Task 136/137/139/145/152/156 blocker and shared-lock owner
inputs, every canonical Task 161 product/test path, plus the exact entrypoint,
durable-start and implementation commits, pinned candidate commit, and pinned
run-task SHA-256. This evidence file and the mutable ledger are excluded to
avoid a self-referential fingerprint.

## Checkpoint Buckets

- **Visible now:** guarded Archive, current-tab recovery, complete shared-lock
  exclusion, reload-before-projection reconciliation, and four exact handoffs.
- **Review now:** durable start `c8cdf783a7fd21540036f025278e27816c6262e8`,
  implementation `300250b364a50f676e525b1e1c1fc1af220085e4`,
  focused/full verification, final-input browser evidence, and this checkpoint.
- **Planned later:** Task 162 recovery presentation remains held and unstarted;
  Phase 31 remains prohibited. Task 164 retains aggregate visual conformance.
- **Unowned:** None.
