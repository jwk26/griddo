# Phase 31 technical correction evidence

This record covers the bounded P31-R01 route correction and P31-C01 inverse
of rejected Test 2. It is not Task 164/165 acceptance, visual acceptance, or
Phase 31 close evidence. The target is branch
`phase-31/integration-conformance-full-gate`; durable work-order entry is
`04f39862f1008cdade67b8e381ff38032b2f6292`.

## P31-R01 — Next app-page export correction

- `src/app/(grid)/grid/[nodeId]/page.tsx` now exposes only its default page
  component and imports the ordinary body from
  `src/components/layout/node-grid-body.tsx`. That client module owns the
  existing system-node empty body, GridView, Add/Delete callbacks, Edit dialog,
  and hidden heading. The route remains the existing URL and data owner.
- Next 16.2.1's installed app-page type guard allows `default`, `config`,
  `generateStaticParams`, the listed segment settings, metadata, and viewport
  fields; arbitrary named exports are not allowed. The runtime regression in
  `grid-runtime.test.tsx` first failed on `NodeGridBody`, then passed after the
  extraction. The same suite also checks default-route standard-node data and
  system-node empty-body preservation.
- No fresh TS2344 reproduction occurred: the earlier fresh nonincremental
  `tsc` diagnostic at the entry returned exit 0. The issue was the source-level
  app-page export contract; after a successful Next build regenerated
  `.next/types/validator.ts` for `/grid/[nodeId]`, post-build `pnpm typecheck`
  also returned exit 0.

## P31-C01 — rejected Test 2 inverse

- Guarded delta: `54d689275cefb5d24c70f562435bb82734c51631..d05140626a6e95d4f5ca4897f02f66594af4d753`, 716 paths (708 additions, 8 modifications), recorded manifest SHA-256
  `c2219aeba7855cbb8bbc35eefe2c709a2f750229c8f98115604611aed9a89f73`.
- Before removal, every delta target blob matched the `d051406` endpoint. The
  seven modified source/test owners were restored exactly to the `54d6892`
  blobs. The only staged removals are the exact 708 Test 2 additions: its
  receipt, rendered report, conformance test, and 705-file asset root. The
  removed tracked objects remain recoverable from the original commits.
- Post-inverse guard: staged deletions equal the original 708 additions, with
  zero missing or extra paths; `git diff --cached --check` and `git diff
  --check` pass. Task 163 acceptance/receipt/evidence and the earlier
  canonical visual-audit and deferred Workflow records remain intact; its
  route component was narrowly refactored under P31-R01.

## P31-I01 — staged-root feedback finding

- Accepted `Task 147`/`DP-VQ06-STAGING` requires exact neutral/invalid target
  reasons only on the active well/target, clearing on exit/end. The Staging
  contract says same-type drop is a neutral mutation-free cancel and opposite
  type is invalid and requires Unstage first. Sources: `docs/DESIGN_TOKENS.md`
  (Staging target reason), `docs/SPEC.md` (same/opposite-type release), and
  `docs/EXECUTION_PLAN.md` Task 147.
- Source inspection finds the feedback/release split: `classifyTriageDropIntent`
  returns `null` for a staged-root zone drop; `handleDragOver` clears target
  feedback when that classifier returns `null`, while `handleDragEnd` also
  returns without a command for null intent. Thus mutation remains blocked but
  the required hover reason is lost. Control Tower classifies the feedback
  omission as a close-blocking contract mismatch, not a mutation/data-integrity
  defect. The separately committed Q05 owner clarification now authorizes the
  bounded feedback-only hook correction recorded below; no Task 163 acceptance
  or release-classifier change is involved.

## P31-I01 / Q05 — bounded feedback correction

- `src/hooks/use-dnd.ts` now retains a staged Node/Bit's exact Nodes/Bits well
  ID for feedback when release classification is `null`, while requiring a
  current, non-cancelled source in the selected Scratch and an exact
  kind-to-ID match. Pointer refresh applies the same current-Scratch check.
  Breakdown Unstage `triage-remove-drop:breakdown` remains a valid remove-target
  ID alongside `triage-remove-drop`. `classifyTriageDropIntent` and release
  behavior are unchanged: same-type and opposite-type root releases return
  without Stage, Unstage, datastore, or lock-acquire calls.
- `src/hooks/use-triage-dnd.test.ts` exercises all four staged Node/Bit ×
  Nodes/Bits hover IDs using simulated DOM Mouse events, then releases and
  checks no mutation/candidate/datastore/lock call. It also guards forged IDs,
  invalidated sources, changed Scratch via Mouse movement and
  `refreshRenderedTarget` (hierarchy hit and miss), and Breakdown Unstage hover.
  Existing Escape/cancel and rendered hierarchy-priority tests remain green.
  The old same-type test no longer expects the hover ID to be null; release
  neutrality is asserted separately. Existing `staging-zone.test.tsx` exact
  same/opposite/invalid target-reason test remains unchanged and green.
  The forged-ID case asserts hover suppression only; it makes no claim that
  release authorization validates the DnD ID separately from target data and
  the unchanged release classifier.
- Repair-cycle accounting: **2 of the initial 3 cycles used; no extra cycle
  requested; no no-progress stop.** Cycle 1 began with
  `pnpm exec vitest run src/hooks/use-triage-dnd.test.ts -t 'retains staged .* hover feedback over .* without authorizing release'`
  exiting 1 on the four expected `overTargetId: null` versus exact-well-ID
  assertions. The first full hook run then exposed the obsolete same-type
  assertion (`expected null`, received `triage-node-zone-drop`); it was replaced
  by hover-plus-neutral-release cases, then focused and full gates passed.
  Cycle 2 followed review findings for the missing Breakdown Unstage ID and
  pointer-only Scratch seam. The RED command
  `pnpm exec vitest run src/hooks/use-triage-dnd.test.ts -t 'Breakdown Unstage|clears stale Scratch feedback'`
  exited 1 with five expected failures: Breakdown Unstage returned null, a
  hierarchy hit exposed `triage-hierarchy:parent-1`, and hierarchy misses kept
  `triage-node-zone-drop`. A transient lint check caught a render-time ref
  assignment (`react-hooks/refs`); it was removed in favor of a
  Scratch-dependent callback. One combined-focus attempt also observed four
  `getDataStoreMock` calls on the Mouse/hierarchy-hit row; their source was not
  established, so no causal claim is made. The test owner now uses explicit
  `afterEach(cleanup)` and asserts the scoped pointer guard directly
  (`elementsFromPoint` is not queried and occupancy is not read).
- Final focused consumer batch:
  `pnpm exec vitest run src/hooks/use-triage-dnd.test.ts src/components/triage/staging-zone.test.tsx src/components/triage/triage-workspace.test.tsx`
  exited 0 (3 files / 165 tests). Evidence is direct hook/component tests and
  simulated DOM Mouse events, not physical pointer or browser evidence.
- Final fresh serial gates: `pnpm lint` exit 0 (11 warnings, 0 errors);
  `pnpm test` exit 0 (100 files / 1,279 tests); `pnpm typecheck` exit 0;
  `pnpm build` exit 0 (Next 16.2.1, seven app routes); post-build
  `pnpm typecheck` exit 0; `git diff --check` exit 0.
- Exact-input fingerprint: schema `run-task-evidence-fingerprint/v1`,
  provenance `b3aa9cbbc8bf76d47494cbbef8c117052c52487b`, JCS SHA-256
  `66cad91dae914db165205080d2f2a42f0cbd32692af65bbb2d005f40329df246`.
  Hash domain is SHA-256 over canonical UTF-8 JSON, no BOM or trailing newline;
  each input content identity is a Git blob SHA-1 from `git hash-object
  --no-filters` (Git blob header plus exact bytes). The manifest pins raw path
  UTF-8 hex and byte length as well as source/test/consumer/authority/config/
  lockfile blob identity, commands, toolchain, claimed invariant and modality:

```json
{"claimed_invariant":"Q05 staged Node and Bit hover over Nodes/Bits exposes exact well IDs while same/opposite-type release remains null and mutation-free; Breakdown Unstage hover remains exact; changed Scratch, source invalidation, cancellation, forged target and hierarchy priority guards remain","commands":["pnpm exec vitest run src/hooks/use-triage-dnd.test.ts src/components/triage/staging-zone.test.tsx src/components/triage/triage-workspace.test.tsx","pnpm lint","pnpm test","pnpm typecheck","pnpm build","pnpm typecheck","git diff --check"],"evidence_modality":"direct hook/component tests with simulated DOM Mouse events; no physical-pointer or browser claim","paths":[{"git_blob_sha1":"7903892c04c4eb6fcd694712d5a01fdb608e183f","kind":"file","path":"docs/CODEX_WORKFLOW_ADAPTER.json","path_bytes_hex":"646f63732f434f4445585f574f524b464c4f575f414441505445522e6a736f6e","path_bytes_length":32},{"git_blob_sha1":"2063146db0b8920dc8ee5805001e1541da49c2a0","kind":"file","path":"docs/CODEX_WORKFLOW_COMMANDS.json","path_bytes_hex":"646f63732f434f4445585f574f524b464c4f575f434f4d4d414e44532e6a736f6e","path_bytes_length":33},{"git_blob_sha1":"d6984dde7d99958e26c80d7f2a15a6e96f2934b0","kind":"file","path":"docs/DESIGN_TOKENS.md","path_bytes_hex":"646f63732f44455349474e5f544f4b454e532e6d64","path_bytes_length":21},{"git_blob_sha1":"aec1bc691d28f1cb6b5455e3d7577c3cf5f0222c","kind":"file","path":"docs/EXECUTION_PLAN.md","path_bytes_hex":"646f63732f455845435554494f4e5f504c414e2e6d64","path_bytes_length":22},{"git_blob_sha1":"e107727896dbba590cbac286e09646fe99ffa7fb","kind":"file","path":"docs/SPEC.md","path_bytes_hex":"646f63732f535045432e6d64","path_bytes_length":12},{"git_blob_sha1":"affab43ed7b05d1852e100a8bcec04f3eee7e5a0","kind":"file","path":"docs/issues/Issues_Phase_31.md","path_bytes_hex":"646f63732f6973737565732f4973737565735f50686173655f33312e6d64","path_bytes_length":30},{"git_blob_sha1":"66e156612a02db9f438b3c362c6382009afa42d9","kind":"file","path":"next.config.ts","path_bytes_hex":"6e6578742e636f6e6669672e7473","path_bytes_length":14},{"git_blob_sha1":"692d747cda04bbd9600fa3b2e82b187d4bbe2dd9","kind":"file","path":"package.json","path_bytes_hex":"7061636b6167652e6a736f6e","path_bytes_length":12},{"git_blob_sha1":"6b375d09d72e462fe23589c0442be7db85b9e91d","kind":"file","path":"pnpm-lock.yaml","path_bytes_hex":"706e706d2d6c6f636b2e79616d6c","path_bytes_length":14},{"git_blob_sha1":"e2d1996c1e9cced81782c6beed0c0f44fd1dce6f","kind":"file","path":"src/components/triage/staging-zone.test.tsx","path_bytes_hex":"7372632f636f6d706f6e656e74732f7472696167652f73746167696e672d7a6f6e652e746573742e747378","path_bytes_length":43},{"git_blob_sha1":"f689a302de0c9b13b9a1a8686399170795c7c5e3","kind":"file","path":"src/components/triage/staging-zone.tsx","path_bytes_hex":"7372632f636f6d706f6e656e74732f7472696167652f73746167696e672d7a6f6e652e747378","path_bytes_length":38},{"git_blob_sha1":"c270d548d865aa3052c73652a6a611d87a815bcc","kind":"file","path":"src/components/triage/triage-workspace.test.tsx","path_bytes_hex":"7372632f636f6d706f6e656e74732f7472696167652f7472696167652d776f726b73706163652e746573742e747378","path_bytes_length":47},{"git_blob_sha1":"f4cbd671abe604b36311609dbec0480d56bb71c7","kind":"file","path":"src/components/triage/triage-workspace.tsx","path_bytes_hex":"7372632f636f6d706f6e656e74732f7472696167652f7472696167652d776f726b73706163652e747378","path_bytes_length":42},{"git_blob_sha1":"8d2db106db30f4c607ff285f9c61fe8f1413a8f7","kind":"file","path":"src/hooks/use-dnd.ts","path_bytes_hex":"7372632f686f6f6b732f7573652d646e642e7473","path_bytes_length":20},{"git_blob_sha1":"8495641f8ab5baa03b194bceab7696527dcc736a","kind":"file","path":"src/hooks/use-triage-dnd.test.ts","path_bytes_hex":"7372632f686f6f6b732f7573652d7472696167652d646e642e746573742e7473","path_bytes_length":32},{"git_blob_sha1":"cf9c65d3e0676a0169374d827f7abb97497789ef","kind":"file","path":"tsconfig.json","path_bytes_hex":"7473636f6e6669672e6a736f6e","path_bytes_length":13},{"git_blob_sha1":"2cc44dc5daa5cbab05ac6b125a8137f758ba3268","kind":"file","path":"vitest.config.ts","path_bytes_hex":"7669746573742e636f6e6669672e7473","path_bytes_length":16}],"provenance_commit":"b3aa9cbbc8bf76d47494cbbef8c117052c52487b","schema_version":"run-task-evidence-fingerprint/v1","toolchain":{"next":"16.2.1","node":"v26.0.0","platform":"darwin-arm64","pnpm":"10.22.0","vitest":"4.1.1"}}
```
- Semantic implementation is recorded as complete pending the close owner's
  fresh detached-candidate provenance and mounted-browser evidence. This does
  not close P31-I01, accept Task 163 again, accept Tasks 164/165, or close
  Phase 31.

## External experiment disposal

Control Tower reports the exact eight pre-identified noncanonical Phase 31
worktrees were atomically moved intact to
`/Users/jwk/.Trash/griddo-phase31-experiments-20261003.PmMcxQ`; they are
recoverable until the user empties Trash. Seven were clean; the Neumorphism
worktree's nine modified and 172 untracked files were preserved. It reports
guarded SIGTERM/SIGKILL for the exact retired Retro Mac-region server processes,
with the protected prototype process untouched, followed by an exact-eight
worktree prune and expected-old-head compare-and-swap local-ref removals. A
read-only check confirms no `phase-31/noncanonical-*` refs/worktrees remain;
canonical Phase 31 remains. Integration `main` and `origin/main` remain clean
at `a1a632abf364e4818d046b742b590805ccd2acb6`. No standalone Neumorphism
report/closure artifact was created.

## Verification record

- TDD guard: `pnpm test -- src/components/layout/grid-runtime.test.tsx` exited 1
  before extraction. Vitest treated the separator as an all-tests invocation:
  the intended route-export assertion failed on `NodeGridBody`, and the
  unrelated Explorer Retry-focus test also failed with expected Retry focus
  but `document.body` focused. The latter exact isolated command
  `pnpm exec vitest run src/components/triage/hierarchy-explorer.test.tsx -t
  'keeps Retry on the same operation and preserves ordinary success focus'`
  passed 1 test (94 skipped). The full focused R01/C01 batch below and the
  subsequent required full test gate both passed; no Explorer repair was made.
- Focused batch: `pnpm exec vitest run
  src/components/layout/grid-runtime.test.tsx
  src/components/grid/node-card.test.tsx
  src/components/grid/bit-card.test.tsx
  src/components/triage/hierarchy-explorer.test.tsx
  src/components/triage/staging-zone.test.tsx
  src/components/triage/triage-workspace.test.tsx
  src/components/triage/triage-drag-token.test.tsx
  src/hooks/use-triage-dnd.test.ts` — exit 0, 8 files / 300 tests.
- Serial adapter gates: `pnpm test` exit 0 (100 files / 1,269 tests);
  `pnpm lint` exit 0 (11 warnings, zero errors); `pnpm typecheck` exit 0;
  `pnpm build` exit 0 (Next 16.2.1, seven app routes); post-build
  `pnpm typecheck` exit 0. `git diff --check` and
  `git diff --cached --check` exit 0.
- `.next` existed before these gates (mtime Sep 12). This build is the normal
  project build gate, not Q06's initially-absent-output provenance proof. This
  agent did not start a server or browser; Control Tower owns the fresh detached
  candidate and mounted-route proof. No user-visual acceptance is claimed.
