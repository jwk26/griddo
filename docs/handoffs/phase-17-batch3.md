# GridDO Phase 17 Batch 3 — Handoff

> Durable handoff file. Read this first, run the Resume Sanity Check, then resume.
> Written at the Batch 2 → Batch 3 boundary (context clear).

## Resume Point

Continue from `execute-task` **Step 0** — continuity engine, then classify and proceed.

- Batch 2 (T79) is **complete and approved**. `[x]` committed at `bcd1be3`.
- Batch 3 = T80 only (Breakdown Panel). No provider artifacts exist yet — start fresh from Step 0.
- Do NOT pre-author or launch any provider before Step 3 prompt preparation and Step 4 approval.

## Current State

- `handoff_status: current`
- Repo: `/Users/jwk/Documents/griddo2-claude`
- Branch: `phase-17/inbox-triage-shell`
- Base: `main`
- Source code changed: yes (Batch 1 + Batch 2 — both committed). Working tree: untracked docs only.
  - `docs/reviews/phase-15-skill-audit.md` (prior-phase carry-over; unrelated to Batch 3)
  - `docs/reviews/phase-16-skill-audit.md` (prior-phase carry-over; unrelated to Batch 3)
- Provider artifacts for Batch 3: none yet.

## Settled Decisions / Carryover

**T80 scope boundary (critical):**
- Batch 3 = T80 only (Breakdown Panel). T81+ (Staging Zones, DnD) are Phase 18 — separate branch.
- T80 DOES include the delete affordance (`deleteScratchBreakdown`). This is confirmed in the T80 spec.
- T80 does NOT include drag-wiring (that lands in Phase 18).

**Classification: logic-heavy (verify at Step 0/2).**
- Batch plan classifies T80 as logic-heavy; the Breakdown Panel uses baseline tokens and existing PanelHeader patterns. Verify during execute-task Step 0/2; if no new visual ambiguity appears, proceed Codex-only. Do not skip Gemini if ambiguity is found.

**A9/C9 — role boundary rule (carried from Batch 2):**
- After Codex completes: run `git status --short`, review diff of all changed files, verify focused tests, run full gate (`pnpm test && pnpm build && pnpm lint`).
- If source/test follow-up fixes are needed: draft a scoped Codex prompt and show for approval. Claude must NOT edit source or test files directly unless the user explicitly approves ("fix it directly" or equivalent).

**Existing patterns (must use, do not reimplement):**
- `liveQuery` from `"dexie"` + `useEffect/useState` subscription cleanup — NOT `useLiveQuery` from `dexie-react-hooks` (package not installed).
- `useTriageStore` from `src/stores/triage-store.ts` — `selectedScratchId: string | null`, `selectScratch`, `clearSelection`. Already created in T79.
- `ChunkPool` in `src/components/bit-detail/chunk-pool.tsx` — the existing always-active input row + append pattern. T80's input-row behavior must mirror this pattern.
- `useInbox()` from `src/hooks/use-inbox.ts` — already exports `activeScratchBits`, `scratchCount`, `systemNodes`, `inboxNodeId`, `createScratchBit`.

**DataStore scratchBreakdowns CRUD:**
- Per EXECUTION_PLAN.md T80: "DataStore scratchBreakdowns CRUD (Phase 15)" — the read/create operations exist from Phase 15. T80 adds `deleteScratchBreakdown(id: string): Promise<void>` to DataStore interface (`src/lib/db/datastore.ts`) and implements it in `src/lib/db/indexeddb.ts`.

**Baseline tokens:**
- Phase 17 Notes (EXECUTION_PLAN.md § T80): "Use baseline tokens now." No custom theme variants.

**T80 high-risk guards (must enforce in Codex prompt and integration review):**
- Do NOT use `deleteScratchBreakdownsByScratch` for single-row delete — T80 adds `deleteScratchBreakdown(id: string)` only.
- Delete affordance must use a confirmation Dialog before executing.
- Drag handle UI only — do NOT wire DnD events (drag wiring lands in Phase 18).
- Breakdown list is scoped by `selectedScratchId` from `triage-store`; switching selected Scratch swaps the list.

**Out-of-scope mock precedent (CI-3):**
- Batch 2 established that Codex may add mocks to existing test files when a new component is introduced. If Codex does the same in Batch 3, classify and report before integration (do not auto-accept without diff review).

## Open Questions

None.

## Authority Pointers

- `docs/EXECUTION_PLAN.md` § Task 80 — full spec, files, acceptance criteria
- `docs/issues/Issues_Phase_17.md` — live issue record (Batch 3: Pending)
- `docs/reviews/phase-17-skill-audit.md` — live audit (latest: A12 / P10); next recording point: after Batch 3 checkpoint
- `docs/reviews/phase-17-flow-review.md` — flow review complete; ignore stale `useLiveQuery` wording — use `liveQuery` from `"dexie"`
- `CLAUDE.md` — architecture rules (Client-first, Two-layer Data, Optimistic UI)
- `src/stores/triage-store.ts` — `selectedScratchId` (T79); T80 consumes this
- `src/components/bit-detail/chunk-pool.tsx` — input-row + append pattern reference

## Live Audit / Process Tracks

- File: `docs/reviews/phase-17-skill-audit.md`
- Role: live parallel audit track — not subordinate to implementation
- PR surface: untracked, not PR surface
- Next recording point: after Batch 3 checkpoint (post-Codex integration and verification)
- Dedup constraint: do not duplicate A1–A12 / P1–P10 / C8–C10; add only new Batch 3 observations

## Resume Sanity Check

External-state:
- `git status --short` — expected: only `docs/reviews/phase-15-skill-audit.md` and `docs/reviews/phase-16-skill-audit.md` untracked; nothing modified or staged
- `git log --oneline -5` — verify latest commits include `bcd1be3 docs: mark T79 [x]` and `d55c05c feat(phase-17): implement T79 scratch pool`
- Confirm `src/stores/triage-store.ts` exists (T79 output): `test -f src/stores/triage-store.ts && echo "OK"`
- Confirm T79 is `[x]` in EXECUTION_PLAN.md: `grep "Task 79" docs/EXECUTION_PLAN.md -A1`

Summary-fidelity:
- Confirm A9/C9 role-boundary rule survived: Claude must not edit source/test files directly post-Codex without explicit user approval
- Confirm T80 scope: Batch 3 = T80 only; drag-wiring is Phase 18
- Confirm classification survived: logic-heavy (no Gemini stage)
- Confirm `liveQuery` from `"dexie"` pattern (not `useLiveQuery`) survived
- Confirm `next_action_approval: ready_for_approval` — no provider launch is pre-approved

## Immediate Next Checkpoint

1. Run resume sanity check above.
2. Proceed to `execute-task` Step 0 (continuity engine) → Step 2 (read context — T80 spec + `chunk-pool.tsx` pattern + `datastore.ts` current interface) → Step 3 (prepare Codex prompt) → Step 4 (show prompt preview, wait for approval).
3. Do NOT launch Codex before Step 4 approval.

- `next_action_approval: ready_for_approval`
