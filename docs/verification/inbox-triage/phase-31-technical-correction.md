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
  defect. No hook/store source was changed in this correction commit; a separate
  exact Q05 owner clarification must be committed before that repair.

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
