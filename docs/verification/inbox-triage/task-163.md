# Task 163 — Integrate The Canonical Route And Remove Superseded Owners

## Checkpoint Identity

| Field | Value |
| --- | --- |
| Approved base | `a1a632abf364e4818d046b742b590805ccd2acb6` |
| Run-phase kickoff | `0607fc18f959079b791311e89a0794e11c0f57b9` |
| Compatibility receipt | `docs/issues/Issues_Phase_31.Task_163.gate-c.json` at `1943ada60c406ef86e768bc7dc178e1c8407e01c` |
| Durable start | `1ec8b19d0a40b2513ed8b6b32a132f89ba003982` |
| Implementation | `cbf33cfdddc0cf1bdc0f285f1ebd9acf9780b540` |
| Original checkpoint | `e4d036f51d0885947dc0c7b5935b8fa86dfe4846` |
| Relevant-input fingerprint | `68fb5698e8b33c2c7c066252502a545238e4b8038ca6694d4f7eac86863aa5ce` |
| Canonical impact | `None` — no product decision, schema, specification, design, or plan direction changed |

Task 163 is `Implemented` and remains `[ ]` pending Control Tower review and
explicit user acceptance. Predecessor Working session
`phase-31-task-163-run-task-01` is committed as `closed/archive-only` at
checkpoint `e4d036f51d0885947dc0c7b5935b8fa86dfe4846` and is never reactivated.
The sole successor repair Working session is
`phase-31-task-163-checkpoint-repair-01`, status
`active / awaiting user disposition`. Control Tower
`phase-31-control-tower` remains active and duplicate-session count is `0`.

## Approval And Workflow Recovery

The compatibility receipt is a serialization of the already-approved Phase 31
Gate C, not a new product-scope approval. It pins the original Gate C receipt
at kickoff commit `0607fc18f959079b791311e89a0794e11c0f57b9` and was committed
separately before any Task 163 product/test write.

The installed resolver validation command was:

`python3 /Users/jwk/Documents/codex-workflow/skills/run-task/scripts/resolve-project-adapter-v2.py --repo-start /Users/jwk/Documents/griddo2-codex-phase-31-integration-conformance-full-gate --adapter docs/CODEX_WORKFLOW_ADAPTER.json --lifecycle run-task --receipt docs/issues/Issues_Phase_31.Task_163.gate-c.json --expected-gate gate-c --expected-next-action '$run-task'`

It exited `0` with `status: ready` and `contract_ready: true`. Deferred issue
`WF-2026-09-07-RUN-PHASE-RUN-TASK-HANDOFF` remains open with state
`Deferred until Phase 31 Final Close`. No installed skill, resolver, shared
contract, workflow test, or `/Users/jwk/Documents/codex-workflow` file changed.

The separate deferred issue
`WF-2026-09-07-RUN-TASK-PREMATURE-CHECKPOINT-CLOSURE` is also
`Deferred until Phase 31 Final Close`. It is classified as a Control Tower
prompt / lifecycle-continuity integration defect: the Task 163 integration
prompt required the Working session to become `closed/archive-only`
immediately when returning its checkpoint, although `run-task` supports user
acceptance, rejection, and targeted repair after that checkpoint. Premature
closure prevents same-session targeted repair, so this one-line evidence
correction requires exactly one successor recovery session even though no
product scope changed. Product impact is `None`; the disposition is to keep the
predecessor closed and use only successor
`phase-31-task-163-checkpoint-repair-01`. After Phase 31 Final Close, audit
this issue together with `WF-2026-09-07-RUN-PHASE-RUN-TASK-HANDOFF`, decide and
document the canonical checkpoint-session status, and add coverage proving a
Working session remains `active / awaiting user disposition` through
acceptance or targeted rejection repair and closes only at the actual
handoff/rollover boundary. No installed skill, resolver, shared contract, or
workflow test may change before that audit.

## Implemented Surface

- `GridRuntime` is the single system-node body dispatcher. Inbox mounts one
  `TriageWorkspace`, Archive View mounts one `ArchiveView`, and the page body
  emits no parallel standard-grid body for either system node.
- The mounted Inbox workspace retains the Task 161/162 Archive-recovery boundary
  before normal Inbox projection and composes the existing canonical reactive
  hooks.
- `useTriageDnd` now emits `TriagePlacementRelease` directly to
  `useTriagePlacement`. The intermediate component-owned pending-placement
  shape/effect was removed; release remains write-free until canonical
  placement confirmation.
- Task 127's deprecated Zustand candidate record and three compatibility
  actions were removed after consumer audit. Candidate truth continues through
  `useStagedCandidates` and DataStore-backed reactive projection.
- General Grid runtime/DnD branches and the named unrelated routes/shell
  surfaces were preserved.

## Owned Paths

The implementation commit changes exactly the nine Task 163 source/test owners:

- `src/app/(grid)/grid/[nodeId]/page.tsx`
- `src/components/layout/grid-runtime.tsx`
- `src/components/layout/grid-runtime.test.tsx`
- `src/components/triage/triage-workspace.tsx`
- `src/components/triage/triage-workspace.test.tsx`
- `src/hooks/use-dnd.ts`
- `src/hooks/use-triage-dnd.test.ts`
- `src/stores/triage-store.ts`
- `src/stores/triage-store.test.ts`

Checkpoint documentation changes only this evidence file and the Phase 31
ledger. Owner expansion is `None`; `Unowned` is `None`.

## TDD, Repair Budget, And Review

The initial RED run used the four Task 163 owner-test paths through
`pnpm test -- ...`. Because the package script expands that form to the full
suite, it produced 100 files with 1,263 passing and exactly four intended
failures: two system-node duplicate-body assertions, the deprecated Zustand
candidate-shape assertion, and the missing canonical placement handoff.

The implementation then made those assertions green. During the same refactor,
seven stale flat-shape test expectations were converted to the canonical nested
`TriagePlacementRelease` contract; the failure set shrank to zero. Repair count
for that RED-to-green implementation was cycle `1/3`.

Cycle `2/3` repairs checkpoint evidence and final cumulative-diff verification.
Fresh Control Tower verification, reproduced by this successor before any
write, ran both
`git diff --check a1a632abf364e4818d046b742b590805ccd2acb6..e4d036f51d0885947dc0c7b5935b8fa86dfe4846`
and
`git diff --check cbf33cfdddc0cf1bdc0f285f1ebd9acf9780b540..e4d036f51d0885947dc0c7b5935b8fa86dfe4846`.
Each exited `2` with the same failure set:
`docs/verification/inbox-triage/task-163.md:695: new blank line at EOF.`
That result invalidates the original checkpoint's unqualified claim that
`git diff --check` passed: a pre-document or working-tree-only check did not
prove the final committed cumulative diff. The repair removes that trailing
blank line and corrects the claim. The expected post-repair failure set is
empty. No extra-cycle approval is required, and no-progress is not triggered.
The post-commit cumulative command remains an always-fresh guard and is
reported only after the repair commit; this document does not treat a
pre-commit working-tree result as proof of the final commit.

A post-commit independent diff/contract review covered route dispatch, recovery
ordering, placement callback ownership, candidate-store removal, named
unrelated branches, test substitution limits, exact path scope, and commit
shape. The exact sole-Working-session constraint prohibited creating a second
review session, so the review stayed read-only in this session. Concrete
Critical/Important/medium/low findings remaining: `None`. The one target-lint
warning is the pre-existing `GridRuntime` breadcrumb migration effect
dependency warning and was not introduced by Task 163.

## Verification

All final commands below ran after the last Task 163 product/test input.

| Command | Exit | Relevant result |
| --- | ---: | --- |
| Focused Vitest over runtime, workspace, DnD, and store owners | 0 | 4 files / 170 tests passed |
| Target-path ESLint over all nine Task 163 paths | 0 | 0 errors; 1 unchanged existing warning |
| Focused `pnpm typecheck` | 0 | `tsc --noEmit` passed |
| Deprecated/superseded-owner `rg` audit | 0 | no deprecated Zustand candidate API or intermediate placement owner in Task 163 production paths; remaining `stagedCandidates` identifiers are the canonical hook result, and `pendingPlacementDropId` is a presentation prop rather than an owner |
| `pnpm test` | 0 | 100 files / 1,267 tests passed; Vitest duration `33.98s` |
| `pnpm lint` | 0 | 0 errors; 11 unchanged existing warnings |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; compile `6.2s`, TypeScript `4.5s`, seven routes generated |
| Original checkpoint `git diff --check` claim | Invalidated | The recorded command lacked a final committed cumulative range; fresh cumulative verification over both approved-base-to-checkpoint and implementation-to-checkpoint exited 2 on `task-163.md:695: new blank line at EOF` |

The known Node `module.register()` deprecation and worker `localStorage`
experimental warnings were unchanged.

## Final-Input Running-App Evidence

A fresh Next dev server on port 3002 and a fresh headless Chrome profile ran
against the implementation commit. Inputs were Chrome
`152.0.7977.82` on macOS 15.5 arm64, 1440×900 CSS pixels, DPR 1, zoom 1,
`griddo` light theme. Fonts and reduced motion are not applicable because this
checkpoint makes no typography, pixel, animation, media-query, or visual
fidelity claim.

- The ordinary Grid root rendered its standard grid body and no triage
  workspace.
- Quick Capture opened with Scratch/New Node/New Bit choices. Global Search
  accepted focus at `Search nodes, bits, and chunks…`.
- Calendar navigated to `/calendar/weekly` with Weekly/Monthly controls.
- Canonical Inbox
  `/grid/329fe91a-24ff-407a-8470-b5cdeb6b4f34` rendered exactly one triage
  workspace, no standard-grid body, all four named headings, no recovery card
  for the clean seed, and focus within the mounted main/workspace.
- Canonical Archive View
  `/grid/c0172ece-f448-445d-89c9-8b8e2c9c7c9a` rendered Archive View, zero
  triage workspaces, and focus on `main`.
- Trash navigated to `/trash` and rendered its empty state.
- Page console errors and exceptions were empty; all observed server route
  requests returned 200.

This is bounded route/state/focus preservation evidence only. It is not the
intervening eight-prototype visual-fidelity audit and not Task 164's
theme/mode/viewport, motion, or accessibility conformance matrix. Browser
output is volatile and is never reusable.

## Relevant-Input Fingerprint

Schema `run-task-evidence-fingerprint/v1` is serialized as RFC 8785 JCS,
canonical UTF-8 without BOM or trailing newline. Unordered path entries are
raw-Git-byte sorted; every repository path is bound as lowercase hexadecimal
plus byte length, kind, Git object ID, and content SHA-256. The manifest binds
the five claimed invariants/modalities, canonical contracts and recipes,
approval receipt, command catalog and resolved commands, direct owners/tests,
configuration/toolchain, and exact browser inputs. This evidence file and the
mutable ledger are excluded to avoid self-reference.

- Manifest SHA-256: `68fb5698e8b33c2c7c066252502a545238e4b8038ca6694d4f7eac86863aa5ce`
- Provenance commit: `cbf33cfdddc0cf1bdc0f285f1ebd9acf9780b540`
- Fingerprint comparison for cycle 2: recomputed manifest SHA-256 is identical
  to `68fb5698e8b33c2c7c066252502a545238e4b8038ca6694d4f7eac86863aa5ce`.
- Reuse decision: the non-volatile focused/full test, lint, typecheck, build,
  and static-audit evidence remains reusable because the evidence and ledger
  paths are excluded from the exact manifest and its invariant/modalities are
  unchanged. Browser output is volatile and must be freshly rerun after the
  repair commit.
- Invalidated evidence: the original checkpoint's unqualified
  `git diff --check` pass claim is invalidated and replaced by the recorded
  failure plus a required post-repair cumulative committed-diff guard. The
  pre-implementation baseline and RED run remain non-completion evidence.

<details>
<summary>Exact manifest JSON value (JCS-equivalent formatting)</summary>

```json
{
  "browser_inputs": {
    "browser_engine_version": "Chrome/152.0.7977.82",
    "color_scheme": "light",
    "dpr": 1,
    "fonts": "not applicable: no typography or pixel invariant claimed",
    "os_platform": "macOS 15.5 arm64",
    "reduced_motion": "not applicable: no motion invariant claimed",
    "route_state": [
      "/grid/329fe91a-24ff-407a-8470-b5cdeb6b4f34 canonical Inbox system node",
      "/grid/c0172ece-f448-445d-89c9-8b8e2c9c7c9a canonical Archive View system node",
      "ordinary Grid root",
      "/calendar/weekly",
      "/trash",
      "Quick Capture open",
      "global Search focused"
    ],
    "theme": "griddo",
    "viewport_css_px": {
      "height": 900,
      "width": 1440
    },
    "zoom": 1
  },
  "claimed_invariants": [
    {
      "claim": "GridRuntime dispatches one Inbox workspace and one Archive View while the system-node page contributes no parallel standard-grid body.",
      "id": "canonical-system-route-dispatch",
      "modality": [
        "direct-owner-tests",
        "fresh-browser-runtime"
      ]
    },
    {
      "claim": "Archive recovery is read before ordinary Inbox projection.",
      "id": "archive-recovery-first",
      "modality": [
        "direct-owner-tests"
      ]
    },
    {
      "claim": "Triage DnD hands a canonical release directly to the placement owner without an intermediate component placement owner or sequential datastore writes.",
      "id": "canonical-placement-handoff",
      "modality": [
        "direct-owner-tests"
      ]
    },
    {
      "claim": "The Triage Zustand store has no candidate domain truth or deprecated compatibility actions; durable candidates remain DataStore-backed and reactively projected.",
      "id": "durable-candidate-truth",
      "modality": [
        "direct-owner-tests",
        "static-source-audit"
      ]
    },
    {
      "claim": "Ordinary Grid, Calendar, Trash, Quick Capture, global Search, Archive View, and system-node navigation remain reachable.",
      "id": "unrelated-surface-preservation",
      "modality": [
        "direct-owner-tests",
        "fresh-browser-runtime"
      ]
    }
  ],
  "commands": {
    "browser_runtime": [
      "pnpm dev --port 3002",
      "fresh Chrome DevTools Protocol navigation and Runtime.evaluate smoke"
    ],
    "focused": [
      "pnpm exec vitest run src/components/layout/grid-runtime.test.tsx src/components/triage/triage-workspace.test.tsx src/hooks/use-triage-dnd.test.ts src/stores/triage-store.test.ts",
      "pnpm typecheck",
      "pnpm exec eslint 'src/app/(grid)/grid/[nodeId]/page.tsx' src/components/layout/grid-runtime.tsx src/components/layout/grid-runtime.test.tsx src/components/triage/triage-workspace.tsx src/components/triage/triage-workspace.test.tsx src/hooks/use-dnd.ts src/hooks/use-triage-dnd.test.ts src/stores/triage-store.ts src/stores/triage-store.test.ts"
    ],
    "full": [
      "pnpm test",
      "pnpm lint",
      "pnpm typecheck",
      "pnpm build",
      "git diff --check"
    ],
    "static_audit": "rg -n 'stagedCandidates|addStagedCandidate|removeStagedCandidate|clearScratchCandidates|PendingPlacement|pendingPlacement|setPendingPlacement|clearPendingPlacement' 'src/app/(grid)/grid/[nodeId]/page.tsx' src/components/layout/grid-runtime.tsx src/components/triage/triage-workspace.tsx src/hooks/use-dnd.ts src/stores/triage-store.ts"
  },
  "path_entries": [
    {
      "content": {
        "git_object_id": "7903892c04c4eb6fcd694712d5a01fdb608e183f",
        "sha256": "7824499e03228e1b4261e4b8d198041130354acfe28f670141da33b303fc4aff"
      },
      "kind": "blob",
      "path": {
        "byte_length": 32,
        "raw_git_bytes_hex": "646f63732f434f4445585f574f524b464c4f575f414441505445522e6a736f6e"
      }
    },
    {
      "content": {
        "git_object_id": "2063146db0b8920dc8ee5805001e1541da49c2a0",
        "sha256": "4624e375d1bce27eca6dddd474997a9c0a2e2dc9d3c52c11a4c54e5fa1686f2e"
      },
      "kind": "blob",
      "path": {
        "byte_length": 33,
        "raw_git_bytes_hex": "646f63732f434f4445585f574f524b464c4f575f434f4d4d414e44532e6a736f6e"
      }
    },
    {
      "content": {
        "git_object_id": "e165835417c17d36b8669575a9d295f90c24aaae",
        "sha256": "bdd61e53ea3d0bd2bbc135e54a05be271ef28333f2a0127848f8c179e4103ed1"
      },
      "kind": "blob",
      "path": {
        "byte_length": 21,
        "raw_git_bytes_hex": "646f63732f44455349474e5f544f4b454e532e6d64"
      }
    },
    {
      "content": {
        "git_object_id": "5c8dff7edcc6310f532f3dda6a0a7e57cf386588",
        "sha256": "8387127a1cfc2931f61e3357307d513717a5437e84699ce2906b2279e6998e1f"
      },
      "kind": "blob",
      "path": {
        "byte_length": 22,
        "raw_git_bytes_hex": "646f63732f455845435554494f4e5f504c414e2e6d64"
      }
    },
    {
      "content": {
        "git_object_id": "25833afe1dbaf0b9b7b7a0e7e18968986f290b37",
        "sha256": "ff7a542db907f2ff9e2e33ad50a18348c1499d6b11257720ebacf0650887f86d"
      },
      "kind": "blob",
      "path": {
        "byte_length": 25,
        "raw_git_bytes_hex": "646f63732f504c414e4e494e475f5354414e444152442e6d64"
      }
    },
    {
      "content": {
        "git_object_id": "9a3eb04b56ec1b992a91aea4b6c19a693782bad8",
        "sha256": "4adbb6d62c45c2bdfd381091d73708240f5c6521ccedc21affb6d5a722698c24"
      },
      "kind": "blob",
      "path": {
        "byte_length": 14,
        "raw_git_bytes_hex": "646f63732f534348454d412e6d64"
      }
    },
    {
      "content": {
        "git_object_id": "e107727896dbba590cbac286e09646fe99ffa7fb",
        "sha256": "76d8b0b0f14a67ef57c142f256b4bea608949195a7532c4b035b80e3404433a1"
      },
      "kind": "blob",
      "path": {
        "byte_length": 12,
        "raw_git_bytes_hex": "646f63732f535045432e6d64"
      }
    },
    {
      "content": {
        "git_object_id": "55d284c9e62f63079a622cc99aa52b251dbfbaa0",
        "sha256": "b1893cbd613aae5bd0c8955ebad11498b059459ae9f0d9252bb8837312d9d7ad"
      },
      "kind": "blob",
      "path": {
        "byte_length": 16,
        "raw_git_bytes_hex": "646f63732f574f524b464c4f572e6d64"
      }
    },
    {
      "content": {
        "git_object_id": "ab8ff0aacf113c38fda28126ba26a5113c04599e",
        "sha256": "59edd418877d10aeeea5ac61c328e574b21d4c698b1faef5115a110e8524c4f4"
      },
      "kind": "blob",
      "path": {
        "byte_length": 48,
        "raw_git_bytes_hex": "646f63732f6973737565732f4973737565735f50686173655f33312e5461736b5f3136332e676174652d632e6a736f6e"
      }
    },
    {
      "content": {
        "git_object_id": "85936373f727f6f16d99837a3a352157eb21da8c",
        "sha256": "7e98fd670a5da4ecc4c8c206eb656b9791caa01044abb03d74a0e16d8482e1c4"
      },
      "kind": "blob",
      "path": {
        "byte_length": 61,
        "raw_git_bytes_hex": "646f63732f726563697065732f696e626f782d7472696167652d617263686976652d636f6d706c6574696f6e2d76697375616c2d7265636970652e6d64"
      }
    },
    {
      "content": {
        "git_object_id": "174c80e270bb72817306dea03ca2099135fe9cd9",
        "sha256": "fb7f00a871e4e6e378ea59adce0dc7f7194b8afc4a840f78b6b13073c41651c9"
      },
      "kind": "blob",
      "path": {
        "byte_length": 62,
        "raw_git_bytes_hex": "646f63732f726563697065732f696e626f782d7472696167652d627265616b646f776e2d726f772d656d7074792d76697375616c2d7265636970652e6d64"
      }
    },
    {
      "content": {
        "git_object_id": "34a2628537f54791bb6150a53d1c432f317811c2",
        "sha256": "e56801e69807deeb7e64b4e19509b783870b8190b69773b5f6a4a323e9e0f3b4"
      },
      "kind": "blob",
      "path": {
        "byte_length": 56,
        "raw_git_bytes_hex": "646f63732f726563697065732f696e626f782d7472696167652d677269642d6578706c6f7265722d76697375616c2d7265636970652e6d64"
      }
    },
    {
      "content": {
        "git_object_id": "5f480dc095d7060edad38977e7cc3efb23c6ab6c",
        "sha256": "29c21f13b548cc209a8b7c26d6b2a1a03e8863ecac895f359eb7d4b7ee115177"
      },
      "kind": "blob",
      "path": {
        "byte_length": 60,
        "raw_git_bytes_hex": "646f63732f726563697065732f696e626f782d7472696167652d6e65776c792d706c616365642d756e646f2d76697375616c2d7265636970652e6d64"
      }
    },
    {
      "content": {
        "git_object_id": "1cb27781fc855d4670b2b6ef3a1cf72ab09e068a",
        "sha256": "4c97713d7dfba65dc72fe9f21c3c8c89ae0fa6ff6af65e7d1fd8e0c302b6834c"
      },
      "kind": "blob",
      "path": {
        "byte_length": 64,
        "raw_git_bytes_hex": "646f63732f726563697065732f696e626f782d7472696167652d706c6163656d656e742d6166666f7264616e6365732d76697375616c2d7265636970652e6d64"
      }
    },
    {
      "content": {
        "git_object_id": "1ffa72f4b34519c970eefc0d760dec6a83ec11da",
        "sha256": "d07fd11c59ddafd189f8b6752bc899d37af4da7db48210450a005a07456e691d"
      },
      "kind": "blob",
      "path": {
        "byte_length": 55,
        "raw_git_bytes_hex": "646f63732f726563697065732f696e626f782d7472696167652d736372617463682d706f6f6c2d76697375616c2d7265636970652e6d64"
      }
    },
    {
      "content": {
        "git_object_id": "2b2b64cd03ea7c21b8e14aa5da863d19c91a555d",
        "sha256": "43988912fa90c6b84776cd8ba3fab16eee3942d0de6f15884728190eb594e518"
      },
      "kind": "blob",
      "path": {
        "byte_length": 67,
        "raw_git_bytes_hex": "646f63732f726563697065732f696e626f782d7472696167652d73656c65637465642d736372617463682d636f6e746578742d76697375616c2d7265636970652e6d64"
      }
    },
    {
      "content": {
        "git_object_id": "47cc62b20bf101e18ae47ccbc0eb5b49edb3ab58",
        "sha256": "5cc1069a2c72cd4482de0cf17ac033b1b5dc0a0b13fa80606e31ce19a9597add"
      },
      "kind": "blob",
      "path": {
        "byte_length": 63,
        "raw_git_bytes_hex": "646f63732f726563697065732f696e626f782d7472696167652d7368656c6c2d73656374696f6e2d6368726f6d652d76697375616c2d7265636970652e6d64"
      }
    },
    {
      "content": {
        "git_object_id": "04274b3745a4af8b24d8e69739415b65171ce26a",
        "sha256": "17a3b0b2fdd0d305f3b869c5585763d430267f0add1e74ce73b44e6d7f97dc29"
      },
      "kind": "blob",
      "path": {
        "byte_length": 50,
        "raw_git_bytes_hex": "646f63732f726563697065732f696e626f782d7472696167652d73746167696e672d76697375616c2d7265636970652e6d64"
      }
    },
    {
      "content": {
        "git_object_id": "3b79a935ab4e3744f4abcbec265f441b6fcdd43d",
        "sha256": "023b5f24d33ba8431cb2f9b2bd4520849017f945e475b15bf3eafe1eebdb992d"
      },
      "kind": "blob",
      "path": {
        "byte_length": 48,
        "raw_git_bytes_hex": "646f63732f726563697065732f696e626f782d7472696167652d76697375616c2d7265636970652d696e6465782e6d64"
      }
    },
    {
      "content": {
        "git_object_id": "05e726d1b4201bc8c7716d2b058279676582e8c0",
        "sha256": "870f1adccecf3051cbcd9fd307cef51d7633cf510979c181a81f4b1797273493"
      },
      "kind": "blob",
      "path": {
        "byte_length": 17,
        "raw_git_bytes_hex": "65736c696e742e636f6e6669672e6d6a73"
      }
    },
    {
      "content": {
        "git_object_id": "66e156612a02db9f438b3c362c6382009afa42d9",
        "sha256": "58d7f0d9ff632e876f172ea91e3daed804d922494a6a2e7cd312260dfb7973d0"
      },
      "kind": "blob",
      "path": {
        "byte_length": 14,
        "raw_git_bytes_hex": "6e6578742e636f6e6669672e7473"
      }
    },
    {
      "content": {
        "git_object_id": "692d747cda04bbd9600fa3b2e82b187d4bbe2dd9",
        "sha256": "19c329c2282715e0e3b49dc6d4a69b4957e1dee5176f2bb41bb15844722368a9"
      },
      "kind": "blob",
      "path": {
        "byte_length": 12,
        "raw_git_bytes_hex": "7061636b6167652e6a736f6e"
      }
    },
    {
      "content": {
        "git_object_id": "6b375d09d72e462fe23589c0442be7db85b9e91d",
        "sha256": "b665af75bdb0fa966d76091d262d1a6293642956b109ab8fcba717746de8a9b8"
      },
      "kind": "blob",
      "path": {
        "byte_length": 14,
        "raw_git_bytes_hex": "706e706d2d6c6f636b2e79616d6c"
      }
    },
    {
      "content": {
        "git_object_id": "2f22aac5402d90b35d436622e8d3a9f99e1fc16c",
        "sha256": "79b4badd697c369c40634a7d7c12d0fdc8dec2db2386e298efd5599d6a2127b7"
      },
      "kind": "blob",
      "path": {
        "byte_length": 37,
        "raw_git_bytes_hex": "7372632f6170702f2867726964292f677269642f5b6e6f646549645d2f706167652e747378"
      }
    },
    {
      "content": {
        "git_object_id": "979432f5fe6621ebee15bdbc4a62faba93d040c9",
        "sha256": "524cc4d07802cd990b763260fe12f23e991f228d4cb228852d58f62962a8782f"
      },
      "kind": "blob",
      "path": {
        "byte_length": 43,
        "raw_git_bytes_hex": "7372632f636f6d706f6e656e74732f6c61796f75742f677269642d72756e74696d652e746573742e747378"
      }
    },
    {
      "content": {
        "git_object_id": "a3e47606c56a397f533708b60898523d9bdf4821",
        "sha256": "bee585cfa0e2f8ff0dc0a3324c485d80b7e895ca8dfc0b4d13392eacb2ae2291"
      },
      "kind": "blob",
      "path": {
        "byte_length": 38,
        "raw_git_bytes_hex": "7372632f636f6d706f6e656e74732f6c61796f75742f677269642d72756e74696d652e747378"
      }
    },
    {
      "content": {
        "git_object_id": "c270d548d865aa3052c73652a6a611d87a815bcc",
        "sha256": "717665eea44ae1328461c643237a23375e1eddfdf407748fc43bdf0d892116cd"
      },
      "kind": "blob",
      "path": {
        "byte_length": 47,
        "raw_git_bytes_hex": "7372632f636f6d706f6e656e74732f7472696167652f7472696167652d776f726b73706163652e746573742e747378"
      }
    },
    {
      "content": {
        "git_object_id": "f4cbd671abe604b36311609dbec0480d56bb71c7",
        "sha256": "0fcd1c6a4de3894268fa5143549bd48d8627f87945afe3d26c599dfd9f366228"
      },
      "kind": "blob",
      "path": {
        "byte_length": 42,
        "raw_git_bytes_hex": "7372632f636f6d706f6e656e74732f7472696167652f7472696167652d776f726b73706163652e747378"
      }
    },
    {
      "content": {
        "git_object_id": "3bde5512c26d350d9615b96eaca74c5b64cf3827",
        "sha256": "a5330af599ed47f58d0adad6b3b56e45d562c5352b0ffa60171f9f607200002b"
      },
      "kind": "blob",
      "path": {
        "byte_length": 32,
        "raw_git_bytes_hex": "7372632f686f6f6b732f7573652d617263686976652d736372617463682e7473"
      }
    },
    {
      "content": {
        "git_object_id": "5c5336274d0d09f5c17a777d3aeb4dd968fe6f2a",
        "sha256": "768a6dd2e4e659180922026638ef552f3d77e111620439d81c7ead0967dd84c2"
      },
      "kind": "blob",
      "path": {
        "byte_length": 20,
        "raw_git_bytes_hex": "7372632f686f6f6b732f7573652d646e642e7473"
      }
    },
    {
      "content": {
        "git_object_id": "18bbde88719e7176973bc0e8ca01895e8744caf4",
        "sha256": "e9c1caaf8cd83a6be5ea1ec0e1e0fc517d5fc3f5b12b5dd7969de0d24c3752b9"
      },
      "kind": "blob",
      "path": {
        "byte_length": 34,
        "raw_git_bytes_hex": "7372632f686f6f6b732f7573652d7374616765642d63616e646964617465732e7473"
      }
    },
    {
      "content": {
        "git_object_id": "c947f9c50be91ab6fd1c07de5bce4edc82827993",
        "sha256": "063e4c579eaebb365b123c77f517c240995171b89268dfcb5b8498f577de75b3"
      },
      "kind": "blob",
      "path": {
        "byte_length": 32,
        "raw_git_bytes_hex": "7372632f686f6f6b732f7573652d7472696167652d646e642e746573742e7473"
      }
    },
    {
      "content": {
        "git_object_id": "e3efc9a828fdd1ee7778c4a1c3cb294148594171",
        "sha256": "9a9c8c479860643da6537be502db741b1836fe24c289be3c488bafa6098dd880"
      },
      "kind": "blob",
      "path": {
        "byte_length": 33,
        "raw_git_bytes_hex": "7372632f686f6f6b732f7573652d7472696167652d706c6163656d656e742e7473"
      }
    },
    {
      "content": {
        "git_object_id": "ca2650252eee73fb7be02757edec800b8cf1d38a",
        "sha256": "c7549700fe46a3865f782aaf729cbf5c929117655d8424918f342e3c474ee0c3"
      },
      "kind": "blob",
      "path": {
        "byte_length": 31,
        "raw_git_bytes_hex": "7372632f73746f7265732f7472696167652d73746f72652e746573742e7473"
      }
    },
    {
      "content": {
        "git_object_id": "a94b3c67472133357f7ac8423afde6a05e37f35f",
        "sha256": "c50f3d154164174ed56289027cd13d073a7bb7bd88560fc5c9a530e7532b0c40"
      },
      "kind": "blob",
      "path": {
        "byte_length": 26,
        "raw_git_bytes_hex": "7372632f73746f7265732f7472696167652d73746f72652e7473"
      }
    },
    {
      "content": {
        "git_object_id": "cf9c65d3e0676a0169374d827f7abb97497789ef",
        "sha256": "5c51df4c59f4510d8c7dadf07a5c32132228826a3b331da5e286207b4df7ef9c"
      },
      "kind": "blob",
      "path": {
        "byte_length": 13,
        "raw_git_bytes_hex": "7473636f6e6669672e6a736f6e"
      }
    },
    {
      "content": {
        "git_object_id": "2cc44dc5daa5cbab05ac6b125a8137f758ba3268",
        "sha256": "3951a040d757ce341488920605d62412afb20392f129bb498de70227ebf004cf"
      },
      "kind": "blob",
      "path": {
        "byte_length": 16,
        "raw_git_bytes_hex": "7669746573742e636f6e6669672e7473"
      }
    }
  ],
  "provenance_commit": "cbf33cfdddc0cf1bdc0f285f1ebd9acf9780b540",
  "schema_version": "run-task-evidence-fingerprint/v1",
  "toolchain": {
    "node": "v26.0.0",
    "pnpm": "10.22.0"
  }
}
```

</details>

## Commit Contract Audit

| Field | Expected | Actual | Variance / disposition |
| --- | --- | --- | --- |
| Parent | `1ec8b19d0a40b2513ed8b6b32a132f89ba003982` | same | `None` |
| Product/test path set | exact nine Task 163 owners | exact same nine paths; 318 insertions / 442 deletions | `None` |
| Task marker | `Task 163: [ ]` | `Task 163: [ ]` | `None` |
| Approval payload | compatibility receipt commit `1943ada60c406ef86e768bc7dc178e1c8407e01c` | same tracked receipt; resolver ready | `None` |
| Commit message | `refactor(triage): integrate authoritative inbox workspace` | exact same message | `None` |

No rewrite, amend, repin, or commit variance disposition was needed.

## Checkpoint Buckets

- **Visible now:** one canonical Inbox workspace, canonical Archive View, and
  preserved ordinary Grid, Calendar, Trash, Quick Capture, and global Search
  routing/shell behavior.
- **Review now:** Task 163 implementation, route/focus smoke, focused/full
  verification, commit contract, and this evidence checkpoint.
- **Planned later:** only after explicit Task 163 acceptance, the read-only
  visual-fidelity audit may occur; Task 164 and Task 165 remain separately
  held. After Phase 31 Final Close, deferred issues
  `WF-2026-09-07-RUN-PHASE-RUN-TASK-HANDOFF` and
  `WF-2026-09-07-RUN-TASK-PREMATURE-CHECKPOINT-CLOSURE` require the combined
  lifecycle audit described above.
- **Unowned:** None.

Task 164, the intervening visual audit, Task 165, Phase 32+, push, merge,
publication, branch/worktree topology change, and cleanup did not start.
