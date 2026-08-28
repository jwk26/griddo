# Phase 28 Post-close Smoke Repair

## Cycle 4 durable start

- Status: `In Progress` under one explicitly approved fourth and final repair cycle. A fifth cycle, another path, or another product/design decision requires a new user gate.
- Control Tower disposition: the prior checkpoint passed code review, but publication readiness is withdrawn pending the user-owned manual-smoke corrections below. The same coherent repair session remains the only implementation owner; duplicate session and rollover are prohibited.
- Recovery identity: HEAD `0e04c3e57e2e763c0399ae5b1673a35122bcc930`, parent `0d95a7f2747610f364cc95acbf289e7ae67caa3d`, base `3b2782287bc12fa6595427254cd4c698d60e5105`, `src` tree `26b9df35d754ca5db788255ba8ad7bb3203bca84`, evidence blob `62a1c7fd3ee8033f8ca0899676ed786766fa5b21`.
- Manual-smoke findings: deep-scroll DESC Add must reset only the Breakdown content viewport to reveal the complete Selected Scratch Context and new first row while retaining Add-input focus; compatible active Remove-from-staging hover must use canonical destructive tokens while every idle/invalid/unavailable/other state remains neutral; Direct and Staged placement opening must reset only the owning Explorer column to `scrollTop === 0` while successful-card focus retains minimum reveal behavior.
- Explicit direction change: destructive/red styling is newly approved only for the compatible active-hover Remove target. The operation remains Unstage, and no copy, command, persistence, arbitration, invalid-state, or unavailable-state semantics change.
- Canonical impact at start: `Tagged`; implementation and both approved canonical design owners must agree before this may become `Reflected`.
- Phase 29 remains inactive. The historical Final Close receipt, Phase 28 task markers/ledger/archive, Execution Plan, Adapter, workflow candidate, Phase 29 audit, and Tasks 155–158 remain read-only.
- Next legal action: focused RED evidence within the exact additional write set, followed by the minimum implementation.

### Cycle 4 exact additional write set

- `src/components/triage/breakdown-panel.tsx`
- `src/components/triage/breakdown-panel.test.tsx`
- `src/components/triage/hierarchy-explorer.tsx`
- `src/components/triage/hierarchy-explorer.test.tsx`
- `src/components/triage/triage-workspace.tsx`
- `src/components/triage/triage-workspace.test.tsx`
- `docs/DESIGN_TOKENS.md`
- `docs/recipes/inbox-triage-staging-visual-recipe.md`
- `docs/verification/inbox-triage/phase-28-post-close-smoke-repair.md`

The already committed `src/hooks/use-dnd.ts` and `src/hooks/use-triage-dnd.test.ts` remain outside cycle-4 write authority.

## Durable start

- Status: `In Progress`
- Authority: one-off Control Tower-approved manual implementation authority; this is not a lifecycle receipt, product authority, Phase issue ledger, Task marker, or Phase 29 audit evidence.
- Base: `3b2782287bc12fa6595427254cd4c698d60e5105`
- Branch: `phase-28/post-close-smoke-repair`
- Worktree: `/Users/jwk/Documents/griddo2-codex-phase-28-post-close-smoke-repair`
- Phase 28 Final Close: `docs/issues/Final_Close_Phase_28.json`, SHA-256 `d9b844a4ec666c9de759ca439f22cf1f2d3e51e9829ca07ffc82bf0882b46cbb`, merge/base `3b2782287bc12fa6595427254cd4c698d60e5105`.
- Phase 29: inactive; Tasks 155–158 remain `[ ]`; audit `docs/verification/inbox-triage/phase-29-workflow-pilot-audit.md` remains read-only at blob `21a1a8b6e23c4aef22bf360961bf7b4235563aa2`.
- Repair budget: three bounded implementation/repair cycles. A fourth cycle or any new path, owner, product/design/copy decision, tooling/config change, or unresolved Unowned item requires a user gate.
- Next legal action: implementation within the exact write set below.

## Exact write set

Create:

- `docs/verification/inbox-triage/phase-28-post-close-smoke-repair.md`

Modify:

- `src/hooks/use-dnd.ts`
- `src/hooks/use-triage-dnd.test.ts`
- `src/components/triage/hierarchy-explorer.tsx`
- `src/components/triage/hierarchy-explorer.test.tsx`
- `src/components/triage/triage-workspace.tsx`
- `src/components/triage/triage-workspace.test.tsx`

No other tracked path is authorized.

## Corrected diagnostic findings

- Generated-output root cause: the six Breakdown, Scratch Context, edit-control, Save/Cancel, dirty Save emphasis, and Search layout symptoms came from stale hybrid `.next/dev` Turbopack/PostCSS output. Tracked `globals.css` was correct, the retained generated module omitted selectors, served CSS and CSSOM therefore omitted them, and computed layout broke. The user removed `.next`; regeneration recovered the symptoms. No quarantine copy exists.
- DnD root cause: with a pointer present, `handleDragOver` returns after hierarchy DOM resolution. Over Remove and Node/Bit staging wells, that resolver clears the target and suppresses the valid non-hierarchy `event.over.id` fallback.
- Placement opening root cause: direct/staged affordances are inserted at the Explorer column top while phase focus uses `preventScroll: true`, so the affordance can remain outside the owning visible viewport.
- Placement success root cause: successful placement retains only `{id,type}` and does not reveal the confirmed destination ancestry/path, so the authoritative card may never render or receive focus.
- Empty reliability rail: ordinary confirmation has no copy or live/status semantics but still reserves 48 px; the approved visual-only correction is conditional omission in the existing JSX owner.

## Scope and exclusions

The approved scope is limited to DnD non-hierarchy feedback fallback, minimum-scroll placement opening, exact typed result/path reveal and one-shot authoritative-card focus, and conditional omission of the empty reliability rail. Preserve hierarchy ownership, no-write hover behavior, Stage/Unstage and placement command semantics, shared lock, ordering, persistence, and all real reliability states.

Excluded: permanent `.next` invalidation tooling; Next/Turbopack, PostCSS, package, lockfile, script, command-catalog, or config changes; Breakdown/Scratch/Search repairs; Search metadata advisory; keyboard DnD; global Search; broader placement redesign; theme-specific UI; Tasks 155–158; persistence/schema/DataStore changes; unrelated warnings.

## Implementation checkpoint

Status: `Awaiting Control Tower disposition`. This is a clean committed implementation checkpoint, not acceptance.

### Commit identity

- Durable start: `3d447f60dc5c5305b80b6bb213d03ec933e1f30f` (`docs: start Phase 28 post-close smoke repair`), parent/base `3b2782287bc12fa6595427254cd4c698d60e5105`; its only changed path was this document.
- DnD fallback: `215f8d3e65d8501fc39f723a5f6463dc8a257bf2` (`fix(triage): restore non-hierarchy drag feedback`).
- Placement reveal/focus and empty-rail omission: `10029b07a7cab52bf32e25e819975470cf970f85` (`fix(triage): reveal and focus placed cards`).
- Browser event-order correction: `ded2a12b02ce922a3b2177c396b3c419f1732967` (`fix(triage): retain drag fallback across pointer refresh`).
- Product checkpoint before this evidence update: `ded2a12b02ce922a3b2177c396b3c419f1732967`; `src` tree `26b9df35d754ca5db788255ba8ad7bb3203bca84`.
- The implementation chain changes exactly the seven paths declared in the exact write set and no others.

### Repair cycles

1. Established focused RED for the DnD arbitration defect, implemented valid non-hierarchy event-target fallback while retaining hierarchy ownership, and established focused GREEN.
2. Established focused RED for placement opening/result handoff, implemented minimum owning-viewport scroll, confirmed-path reveal, exact typed one-shot focus, and conditionally omitted the empty rail. Corrected effect ordering and test isolation within this cycle before GREEN.
3. Fresh-browser verification exposed the document pointer refresh occurring after the DnD event fallback. A focused regression reproduced the loss; the non-hierarchy feedback identity is now retained across a hierarchy miss and cleared at drag lifecycle boundaries. At that checkpoint no fourth cycle had been used; the separately approved manual-smoke cycle below is the final cycle.

### RED/GREEN evidence

- DnD initial RED: the focused post-close group failed for Remove, Node-well, and Bit-well fallback plus cancel clearing; hierarchy ownership, denial, and no-write assertions supplied the boundaries.
- DnD event-order RED: `retains a compatible fallback through a later hierarchy-miss pointer refresh` failed with `overTargetId === null` instead of `triage-node-zone-drop`.
- Placement RED: eight Explorer owner cases failed across opening visibility intent, direct/staged Node/Bit reveal/focus, delayed one-shot handoff, and wrong-type denial; four Workspace cases failed because applied results lacked confirmed ancestry.
- Focused final GREEN: `pnpm exec vitest run src/hooks/use-triage-dnd.test.ts src/components/triage/hierarchy-explorer.test.tsx src/components/triage/triage-workspace.test.tsx` exited 0 with 3/3 files and 200/200 tests passing in 2.52 s (wall `real 2.98`).
- The focused cases cover hierarchy wins; Remove/Node/Bit fallback; invalid/incompatible denial; feedback-only no-write; leave/cancel/drop clearing; direct/staged Node/Bit path reveal and exact typed focus; delayed one-shot authoritative rendering; wrong-type same-ID denial; stale/invalid/no-write paths; and pending/unknown/reconciling lock retention.

### Browser evidence

Runtime: freshly generated Next.js 16.2.1 production build from the repair worktree, served at `http://localhost:3138`. Browser console result: 0 errors and 0 warnings.

- 1440 x 900 DnD: compatible Node and Bit staging wells changed from transparent borders to solid primary/accent feedback; the compatible Remove well changed from dashed/transparent to solid muted feedback. Escape/cancel removed each feedback state. Hover dispatched no product write.
- 1440 x 900 hierarchy: `Smoke Target 12` alone reached `data-triage-target-state="valid"`; its sibling and owning body remained `idle-valid`; cancel restored `default`.
- Direct opening from Home-column scrollTop 251 moved only the owning column to scrollTop 16; `document.scrollY` stayed 0. Focus was the `Choose a result type` phase owner. After type choice, `Confirm placement` owned focus and Confirm/Cancel were visible and operable.
- Staged opening from the same lower position produced the same owning-column-only scroll result and focused `Confirm placement`; Confirm/Cancel were visible and operable.
- Direct Node success focused the exact authoritative Node `Direct Node smoke`, ID `9bca6a91-eb9c-4166-8062-858a49ea9d92`, under the revealed `Home / Smoke Target 12` path; its rectangle intersected the owning column.
- Direct Bit success focused the exact authoritative Bit `Direct Bit smoke`, ID `12d19d10-5f26-4b6a-bf14-e985bfcf45ae`, under the same revealed path; its rectangle intersected the owning column.
- Staged Node success focused the exact authoritative Node `Stage Node smoke`, ID `0b2456e8-71b2-4889-9f95-21df8d03ac30`; staged Bit success focused the exact authoritative Bit `Stage Bit smoke`, ID `9075f8dc-1e5a-444c-873c-800f4e3655e1`. Both intersected the owning visible column.
- Ordinary confirmation rendered zero `.placement-reliability-rail` elements and zero local status roles while preserving Confirm/Cancel. A MutationObserver captured the real pending rail as `Placing “Direct Bit smoke” in Home → Smoke Target 12…`, `role="status"`, `aria-live="polite"`.
- 1024 x 768 smoke: viewport and workspace were 1024 x 768/976 x 768, document `scrollWidth === clientWidth === 1024`, and no horizontal document overflow occurred. The placement, focused heading, Confirm, and Cancel were immediately visible; Cancel was exercised successfully. The owning column alone scrolled, while `document.scrollY` remained 0.
- Visual captures at both viewport sizes were reviewed during the browser run. The browser tool initially emitted two untracked PNGs into the primary repository root; both exact files were removed immediately, and no screenshot is retained in either repository worktree. The measurements above are the durable browser record.

The IndexedDB records used for the matrix were browser-local smoke fixtures only. They did not alter repository persistence code, schema, DataStore, candidate truth, or the tracked write set.

### Full gates

| Command | Result | Elapsed | Warnings |
| --- | --- | ---: | ---: |
| `pnpm test` | exit 0; 98/98 files, 1,143/1,143 tests | 28.94 s; `real 29.38` | 8 emissions: 1 Node DEP0205, 7 localStorage experimental |
| `pnpm lint` | exit 0; 0 errors | `real 27.79` | 11 pre-existing warnings |
| `pnpm typecheck` | exit 0 | `real 4.73` | 0 |
| `pnpm build` | exit 0; compiled 6.1 s, TypeScript 4.6 s, 7 routes | `real 12.96` | 2 emissions: 1 Node DEP0205, 1 localStorage experimental |
| `git diff --check` | exit 0 | `real 0.01` | 0 |

No excluded warning cleanup was performed.

### Relevant-input fingerprint

- Hash domain: `griddo-phase28-post-close-repair-relevant-input-v1` followed by LF-separated `path<TAB>SHA-256` lines in the order below, with no final LF in the hashed byte sequence.
- Domain paths: `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `src/app/globals.css`, and the six approved product/test files.
- Fingerprint: `93f1e1574d16d334ed7edcbd8f2b740bb6bd95bcfb9d95b1f0e87d13127c7e7a`.
- Relevant modified-input component hashes: `use-dnd.ts` `bca3abc4188a1d6c27404e87f406678de4b5cf94dee8de07cc878f6b61aad413`; `use-triage-dnd.test.ts` `79700dedeeae8f04fa7d15d8e89229ca2493b187e8940a6eb16bcf021ce301ef`; `hierarchy-explorer.tsx` `cfe802340a1af2b88996f166c517278cf9747acffe3d021a76c84c9d6c6c5e73`; `hierarchy-explorer.test.tsx` `33d6c3ef1937a11b9c5a690850aa9d3b9bb5bcc6ce4fa956182d7cc8def277fe`; `triage-workspace.tsx` `8ddff3296359ffafebdc3bd10f1edff8ddd50cc11dc59b5a04636df5e3b39a95`; `triage-workspace.test.tsx` `3322b39200f4e947d3826f83ab8ddc1c973dc0531aa0331d18eaeaa15f2502ea`.

### Final High-risk review

- DnD arbitration: hierarchy DOM targets return ownership before fallback; fallback accepts only typed, compatible, non-hierarchy drop data and uses the exact event drop ID. A later hierarchy miss preserves only that compatible fallback; a hierarchy hit clears it.
- No-write hover boundary: hover paths update feedback state only. Stage/Unstage and terminal drop remain the command boundaries; focused tests assert no Stage or DataStore call from feedback.
- Exact placement identity/path: applied results preserve command `resultType`, returned ID, and `expectedAncestorIds`; DOM selection requires both exact ID and exact type. No result is invented on stale, invalid, or no-write paths.
- Unrelated selection and scroll: reveal changes only the destination ancestry needed to render the result; scroll adjustment is limited to the closest Explorer column and leaves document/unrelated Explorer scroll untouched.
- One-shot render-driven focus: reveal and focus keys are type-plus-ID identities, wait for authoritative render, and do not re-run on unrelated renders.
- Viewport visibility: opening phase owners and successful exact cards were measured against their owning visible columns at both required viewport sizes.
- Shared-lock lifecycle: command ownership, pending/unknown/reconciling lock retention, retry, terminal handling, ordering, and persistence paths are unchanged and covered by the owner suites.
- Empty semantics: the rail is absent only when copy/state is absent; pending/unknown/reconciling/failure/retry/conflict semantics and actions remain in the existing owner.
- Phase 29 stop: Tasks 155–158 and the audit blob remain unchanged; no Phase 29 behavior or audit evidence was created.
- Web UI review: focus remains programmatic and visibly ringable on semantic owners, live status exists only for real state, controls retain accessible names, reduced-motion/theme behavior remains in the existing CSS owner, and no new copy/theme branch was introduced.

### Operational and canonical disposition

- Generated output: operationally recovered by the user's `.next` removal and regeneration. The stale output was not preserved at a quarantine path. No tracked CSS, Next/PostCSS config, package, script, lockfile, or command-catalog workaround was added.
- Canonical impact: only this repair branch and its seven-path commit chain are changed. `main`, the Phase 28 Final Close receipt, Phase issue/task markers, candidate workflow and Project Adapter remain untouched.
- Visible now: compatible DnD wells visibly activate and clear; placement controls are brought into their owning viewport; successful direct/staged Node/Bit placements reveal and focus the exact authoritative card; empty confirmation space is removed.
- Review now: the three implementation commits, focused/full-gate results, production-browser measurements, relevant-input fingerprint, and this evidence checkpoint.
- Planned later: Control Tower may disposition this one-off repair checkpoint under separate Final Close authority.
- Unowned: a permanent `.next` cache-invalidation safeguard, because evidence still identifies no safe tracked tooling/config correction.
- Phase 29 audit handoff: record both the missing post-close repair lifecycle and the unowned permanent cache safeguard when Phase 29 is separately activated. The audit remains inactive and read-only now.
- Control Tower continuity: maintain the current Control Tower owner through disposition; do not roll over to Phase 29.
- Working-session continuity: this remains the only fresh manual implementation session through this checkpoint; do not create a duplicate session or roll over implementation work.
- Prohibited until separate Final Close approval: acceptance-only edits, push, PR, merge, publication, integration sync, and cleanup.
- Exactly one next legal action: Control Tower reviews this committed checkpoint and supplies its disposition.

## Cycle 4 implementation checkpoint

Status: `Awaiting Control Tower disposition`. Repair-cycle count is `4/4`; no fifth cycle is authorized.

### Cycle 4 commits and write scope

- Durable start: `20f8317eea1ea02e0e945411837a08c9049b62d1` (`docs: start Phase 28 smoke repair cycle 4`), parent/recovery HEAD `0e04c3e57e2e763c0399ae5b1673a35122bcc930`; only this evidence owner changed.
- Bounded implementation: `8bb727b47e6744c997db5f18f295119edf00c827` (`fix(triage): align manual smoke viewport handoffs`); it changes exactly the two Breakdown owners, two Explorer owners, two Workspace owners, and two canonical Staging design owners listed in the cycle-4 write set.
- Cycle-4 total write set is the nine paths declared in the durable start. The total branch write set is those paths plus the already committed `src/hooks/use-dnd.ts` and `src/hooks/use-triage-dnd.test.ts`: eleven paths total, with no other tracked path.
- Implementation `src` tree: `c1bbfb711b53a16e78e576c47dd217bd52f724a8`.

### Cycle 4 RED/GREEN

- Focused RED command: `pnpm exec vitest run src/components/triage/breakdown-panel.test.tsx src/components/triage/triage-workspace.test.tsx src/components/triage/hierarchy-explorer.test.tsx` exited 1 with 4 expected failures and 247 passes. DESC retained `scrollTop 240` instead of 0; Direct and Staged opening retained 20 instead of 0; compatible Remove still exposed neutral rather than destructive classes.
- Focused GREEN: the same three-owner command exited 0 with 3/3 files and 252/252 tests in 2.93 s (`real 3.31`).
- DESC regression proves the owning Breakdown content resets to 0 only after the authoritative row renders, the complete Context precedes the first row, Add input retains focus, document scroll is unchanged, and one `Added.` status exists. ASC continues to call `scrollIntoView({block: "end"})` and retains Add-input focus.
- Remove regressions prove active exact-target classes `border-destructive bg-destructive/10 text-destructive`, idle/incompatible dashed neutral classes, and zero Unstage dispatch from hover.
- Explorer regressions prove Direct/Staged phase focus with owning `scrollTop === 0`, document and unrelated-column preservation, and successful-card focus using the prior minimum reveal path rather than a top reset.

### Cycle 4 full gates

| Command | Result | Elapsed | Warnings |
| --- | --- | ---: | ---: |
| `pnpm test` | exit 0; 98/98 files, 1,146/1,146 tests | 27.32 s; `real 27.90` | 8 emissions: 1 Node DEP0205, 7 localStorage experimental |
| `pnpm lint` | exit 0; 0 errors | `real 6.83` | 11 pre-existing warnings |
| `pnpm typecheck` | exit 0 | `real 1.56` | 0 |
| `pnpm build` | exit 0; compiled 4.7 s, TypeScript 4.2 s, 7 routes | `real 10.91` | 2 emissions: 1 Node DEP0205, 1 localStorage experimental |
| `git diff --check 0e04c3e…HEAD` | exit 0 | `real 0.02` | 0 |

No warning cleanup or excluded path change was performed.

### Cycle 4 browser evidence

Runtime: fresh Next.js 16.2.1 production build from this repair worktree at `http://localhost:3138`; Chrome `152.0.0.0` on macOS. Primary viewport 1440 x 900, secondary viewport 1024 x 768. Console: 0 errors, 0 warnings. No repository screenshot was created or retained.

- DESC Add began with Breakdown `scrollTop 302`, content viewport `[32,490]`, and Context `[-254,-150]` fully hidden. Authoritative success produced `scrollTop 0`, complete Context `[48,152]`, new first row `[160,208]`, active Add input, unchanged `document.scrollY 0`, and exactly one visible `✓ Added.` status.
- Remove idle computed neutral border `rgb(228,228,231)`, transparent background, and muted text. Compatible active hover computed destructive border/text `rgb(239,67,67)` plus 10% destructive background and the exact destructive classes. Escape removed the target, preserved the candidate/source as staged, and dispatched no write.
- At 1440 x 900, lower-scroll Direct and short Staged confirmation each opened with owning Explorer `scrollTop 0`, phase-owner focus, complete 16 px intended top origin, and visible Confirm/Cancel inside column `[634,899]`. A long staged Result Title also opened at 0 and focused its existing input. Document scroll remained 0.
- Direct Node focused exact authoritative `Cycle4 filler 03`, ID `5963ad27-8841-48ae-b2dd-da8661122c8c`; Direct Bit focused exact `Cycle4 filler 04`, ID `91828a7f-9113-4df8-83fd-70d4fd8212f2`.
- Staged Node focused exact authoritative `Cycle4 filler 01`, ID `12f56407-2b18-4211-8518-649e57a9db14`; Staged Bit focused exact `Cycle4 filler 02`, ID `02bfb38b-6754-4f5f-98d9-76a381b2d348`. All four exact cards intersected their owning viewport. The final Staged Bit used destination-column `scrollTop 57`, proving successful-card focus retained minimum reveal rather than resetting to top.
- Ordinary confirmation retained zero empty reliability rails/statuses. Real pending emitted the polite status `Placing “Cycle4 filler 03” in Home → Smoke Target 12…`.
- Accepted DnD remained intact: Node/Bit compatible wells gained solid primary/accent feedback then returned to transparent on cancel; hierarchy `Smoke Target 12` alone was `valid`, its sibling remained `idle-valid`, and cancel restored `default`. The three canceled sources stayed `active`, proving hover-only no-write behavior.
- At 1024 x 768, Direct and Staged confirmation each opened at owning `scrollTop 0`; placement `[570.8,733.8]` fit within the owning column ending at 767, with 16 px top and 33.2 px bottom space. Confirm/Cancel `[688.8,720.8]` were visible and operable, the phase heading owned focus, unrelated Breakdown scroll remained 219, `document.scrollY` remained 0, and `scrollWidth === clientWidth === 1024`.

Browser fixtures remained local to the runtime IndexedDB and changed no tracked persistence, schema, DataStore, or candidate owner.

### Cycle 4 relevant-input fingerprint

- Hash domain: `griddo-phase28-post-close-repair-relevant-input-v2`, followed by LF-separated `path<TAB>SHA-256` lines with no final LF.
- Domain: the prior v1 domain in its original order, followed by `src/components/triage/breakdown-panel.tsx`, `src/components/triage/breakdown-panel.test.tsx`, `docs/DESIGN_TOKENS.md`, and `docs/recipes/inbox-triage-staging-visual-recipe.md`.
- Fingerprint: `a33c5bee9265fa7d0f3c3edfa423d8de37d48dc7f9555480c875023d9bd66d3b`.
- New component hashes: Breakdown implementation `e2e4239505211a2d79a2af11af3e7a1870c4423c69c5a1e65afa609fea7ef50b`; Breakdown tests `1f0ab6f3cd9fc049d4199b4017bdb00bdc01b9a8b30c1902b86aa025699169ad`; design tokens `082ef6bc276b503d3e993de71df3c56cce8ee70b9487d2d8ee4896564fb6bc63`; Staging recipe `17a3b0b2fdd0d305f3b869c5585763d430267f0add1e74ce73b44e6d7f97dc29`.

### Cycle 4 final High-risk review

- Owning-scroll isolation: DESC writes only the Breakdown content ref; placement phase focus writes only the closest Explorer column; result-card focus retains the separate minimum helper. Browser and owner tests preserve document/unrelated scroll.
- Add lifecycle: reset waits for the exact authoritative added-row render, consumes the pending ID once, does not change pending/unknown/reconciling paths, and leaves Add input plus exactly-once success ownership unchanged. ASC remains the existing end handoff.
- Placement focus and identity: Direct heading, staged Result Title input, confirmation owner, and exact typed result-card lookup remain distinct. Reveal still uses confirmed ancestry, one-shot type-plus-ID identity, and render-driven focus.
- DnD boundary: no arbitration, command, copy, lock, persistence, or DnD hook changed in cycle 4. Hover is visual-only.
- Destructive scope: only exact compatible Remove hover receives the three canonical destructive tokens. Idle, cancel, Node/Bit invalid, unavailable, same-type neutral, staging wells, and Breakdown drop-back remain non-destructive; operation semantics remain Unstage.
- Canonical wording: `docs/DESIGN_TOKENS.md` and the Staging visual recipe state the same active-only exception and exclusions as JSX/tests. Canonical impact is therefore `Reflected`.
- React/UI review: transient scroll values remain refs/DOM effects rather than render state; no new subscription, waterfall, or rerender owner was introduced. Existing semantic controls, labels, focus-visible treatment, reduced-motion transition list, long-content handling, live status ownership, and non-color dashed/solid cues remain intact. Latest Web Interface Guidelines review found no cycle-4 blocking issue.
- Phase 29 scope stop: audit blob and Tasks 155–158 remain unchanged and inactive. No Phase 29 work, lifecycle receipt, acceptance marker, or publication preparation occurred.

### Cycle 4 disposition

- Canonical impact: `Reflected`.
- Remaining findings: no unresolved cycle-4 product finding within the approved scope.
- Unowned remains unchanged: permanent `.next` cache-invalidation safeguard; the missing post-close repair lifecycle remains a later Phase 29 audit handoff only.
- Publication remains withdrawn and untouched. No acceptance-only edit, Final Close preparation/receipt, push, PR, merge, integration sync, cleanup, or Phase 29 action was performed.
- Exactly one next legal action: Control Tower disposition of this clean committed checkpoint.
