# Phase 27 Bounded Smoke Repair Evidence

## Scope and state

- Batch: `P27-12` accepted Task 136 Add viewport handoff and `P27-13`
  accepted Task 145 staged-grip cursor feedback.
- Start base / recovery anchor:
  `2d9ec7deb4e367e36e564a05cda062a71121a7ec`.
- Durable start commit:
  `36c738ec2c06c3ac6e56274081fb819a9beecced`.
- Implementation commit / final `src` tree:
  `c56439a86a65ceeb836796710745f53d05fa3fd0` /
  `7b831a941d40631c2212d07a010f3c6b4a00e01a`.
- Exact production/test write set:
  `src/components/triage/breakdown-panel.tsx` and
  `src/components/triage/breakdown-panel.test.tsx`.
- Canonical impact: `Reflected` in the accepted Task 136 and Task 145
  contracts without reopening their `[x]` markers.

## Reproduction and repair

| Repair | RED evidence | Root cause | Minimum implementation |
| --- | --- | --- | --- |
| `P27-12` | Focused/full Vitest run failed because DESC expected `{ block: "nearest" }` but received `{ block: "start" }`. | Confirmed Add aligned the new top row to the scroll container start in DESC, unnecessarily moving preceding Context. | DESC uses `block: "nearest"`; ASC retains `block: "end"`. Add focus, order, command/reconciliation, and success-signal code are unchanged. |
| `P27-13` | Focused/full Vitest run failed because the native disabled staged grip lacked `cursor-not-allowed` and retained grab classes. | Drag cursor classes were unconditional even when the activator was disabled. | The existing disabled predicate selects `cursor-not-allowed`; only enabled grips receive `cursor-grab active:cursor-grabbing`. DnD data/listeners and Stage semantics are unchanged. |

The RED run executed 95 files / 982 tests and produced exactly these two
expected failures. The first GREEN focused run used
`pnpm exec vitest run src/components/triage/breakdown-panel.test.tsx` and passed
1 file / 116 tests.

## Skill-owned verification

| Command | Exit | Relevant result |
| --- | ---: | --- |
| `git diff --check` | 0 | No whitespace errors. |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed. |
| `pnpm test` | 0 | 95 test files / 982 tests passed. |
| `pnpm lint` | 0 | 0 errors; the same 11 pre-existing warnings outside this repair remain. |
| `pnpm typecheck` | 0 | Fresh full-gate typecheck passed. |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven routes generated. |

## Review and boundaries

- Diff review found no remaining Critical or Important repair finding.
- No hook, DnD, datastore, repository, copy, recipe, or CSS owner changed.
- `P27-06`, `P27-08`, Phase 28, phase close, publication, integration, and
  cleanup remain untouched.
- Task 136–148 markers remain `[x]`.
- Phase-level browser smoke is user-owned. Codex did not run it and does not
  claim browser acceptance.

## Manual smoke pending

At the canonical `1440×900` GridDO light surface, the user needs to recheck
only these paths:

1. With default `DESC`, confirm Add leaves the complete Selected Scratch
   Context and the new top row simultaneously visible, keeps Add input focus,
   and announces `Added.` exactly once for its existing lifetime.
2. Stage a source row, then confirm its grip is natively disabled and the
   actual pointer cursor is non-draggable; an active grip must retain its
   existing grab/grabbing feedback.

Checkpoint state: `P27-12/P27-13 Implemented; Awaiting Manual Smoke and Acceptance`.
