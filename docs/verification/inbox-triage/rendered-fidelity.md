# Inbox/Triage Rendered Fidelity — Task 164 Stage A

## Checkpoint status

- Iteration: `T164-CA-I01`, first canonical Stage A implementation.
- Scope: Neumorphism and Retro Mac only; all nine canonical Inbox/Triage recipes.
- Working session: `phase-31-task-164-stage-a-run-task-01`, `active / awaiting user disposition`.
- Task markers: Task 164 remains `[ ]`; Task 165 remains `[ ]` and unstarted.
- Start: HEAD `68ea320ed1c12e2edf6d9dd671ac87c48fb13769`, tree `98a4a05edb0caa5f8da14c2bf71959442a213682`.
- Result: the post-implementation checkpoint records the exact implementation SHA; no user acceptance is inferred.

Stage A promotes the pinned theme grammar without replacing canonical behavior. Neumorphism uses raised surfaces, inset wells, rounded depth, and soft relief. Retro Mac uses square 1-bit frames, striped headers, dithered invalid/empty regions, double-line context and Placement surfaces, and hard shadows. Edit→Save/Cancel, Add, staged/direct Placement, Newly/Undo, and Archive remain present.

## Direct visual comparisons

- [Neumorphism prototype ↔ production light](task-164-stage-a-assets/T164-CA-I01-run-10/comparisons/neumorphism-prototype-production-light.png)
- [Retro Mac prototype ↔ production light](task-164-stage-a-assets/T164-CA-I01-run-10/comparisons/retro-mac-prototype-production-light.png)
- [Neumorphism light ↔ dark at 1024](task-164-stage-a-assets/T164-CA-I01-run-10/comparisons/neumorphism-light-dark-1024.png)
- [Retro Mac light ↔ dark at 1024](task-164-stage-a-assets/T164-CA-I01-run-10/comparisons/retro-mac-light-dark-1024.png)
- [Final browser manifest](task-164-stage-a-assets/T164-CA-I01-run-10/browser-evidence-manifest.json)
- [Comparison manifest](task-164-stage-a-assets/T164-CA-I01-run-10/comparisons/comparison-manifest.json)
- [Append-only iteration record](task-164-stage-a-assets/T164-CA-I01-iteration-record.json)
- [Complete asset inventory](task-164-stage-a-assets/asset-inventory.sha256)

The prototype is reference evidence, not a pixel-identical oracle. Production intentionally retains the canonical sidebar, current copy/data, sparse audit fixture, Save/Cancel, Add status, Level 3 content, and non-occluding Placement behavior.

## Coverage

| Dimension | Production evidence |
| --- | --- |
| Theme / mode / viewport | Both themes; light/dark; `1024x768` and `1920x1080` |
| Nine recipes | Shell/chrome, Pool, Context, rows/empty, Staging, Explorer, Placement, Newly/Undo, Archive; numbered `1`–`9` in every combination |
| Explorer | Clicked through Home, Level 1, Level 2, and Level 3 in every combination |
| Hover / focus | Physical pointer hover and actual Tab traversal to `:focus-visible` in every combination |
| DnD | Physical source movement, eligible peers, `valid` active drop, `idle-invalid`, and asserted Escape interruption in every combination |
| Placement | Direct and staged in every combination; remains in-column while existing cards stay visible |
| Canonical controls | Dirty Edit then Save/Cancel restoration, Add active/result, Newly/Undo before/active/after, Archive ready/completion in every combination |
| Motion | Two-point drag-token movement of 400.18–1020.80px, interruption assertions, and zero effective reduced-motion transitions in every combination |
| Touch | Five dynamic coarse-pointer scenarios in every combination; 128 interactive instances sampled per combination, including `[role=button]` and `[role=link]`; zero below `44x44` |

Representative states:

- [Neumorphism dark 1024 Level 3](task-164-stage-a-assets/T164-CA-I01-run-10/neumorphism-dark-1024-01-populated-level3.png)
- [Retro Mac direct Placement](task-164-stage-a-assets/T164-CA-I01-run-10/retro-mac-light-1920-04-direct-placement.png)
- [Neumorphism valid DnD](task-164-stage-a-assets/T164-CA-I01-run-10/neumorphism-light-1920-03-dnd-source-eligible-active.png)
- [Retro Mac invalid DnD](task-164-stage-a-assets/T164-CA-I01-run-10/retro-mac-light-1920-05-dnd-invalid.png)
- [Neumorphism staged Placement](task-164-stage-a-assets/T164-CA-I01-run-10/neumorphism-light-1920-06-staged-placement.png)
- [Retro Mac dirty Edit before Cancel](task-164-stage-a-assets/T164-CA-I01-run-10/retro-mac-light-1920-09-edit-cancel-dirty.png)
- [Neumorphism Newly before](task-164-stage-a-assets/T164-CA-I01-run-10/neumorphism-light-1920-12-newly-undo-before.png)
- [Neumorphism Newly/Undo active](task-164-stage-a-assets/T164-CA-I01-run-10/neumorphism-light-1920-12-newly-undo-active.png)
- [Retro Mac Archive completion](task-164-stage-a-assets/T164-CA-I01-run-10/retro-mac-dark-1024-15-archive-completion.png)
- [Neumorphism touch Placement](task-164-stage-a-assets/T164-CA-I01-run-10/neumorphism-dark-1024-18c-touch-placement.png)

## Actual visible findings

1. `New → Resolved`, cause `implementation`: bounded row tracks and normal-flow text prevent Context/Breakdown squeezing at 1024.
2. `New → Resolved`, cause `implementation`: both themes style the actual incompatible `idle-invalid` state with a non-color pattern.
3. `New / Repeated → Resolved`, cause `browser evidence`: final runs clear non-system fixture rows and use the production build.
4. `New → Resolved`, cause `automated verification`: reduced motion is measured by effective property/duration, accounting for Chrome's clamp.
5. `New / Repeated → Resolved`, cause `browser evidence`: runs 03 and 05–08 exposed live-query, operation-lock, selector, settlement, and reload races; run-10 stabilizes and asserts each result.
6. `New → Resolved`, cause `browser evidence`: Cancel begins from a genuinely dirty title. In all eight combinations the dirty image differs, while the post-Cancel selected-title hash equals the saved-title hash.
7. `New → Resolved`, cause `implementation`: shared Node/Bit cards no longer receive Inbox visual-role attributes globally; `HierarchyExplorer` applies them only inside Inbox.

Direct inspection of run-10 and its four comparison sheets found no material difference hidden by automation. Retro Mac omits prototype-only faux menu copy, and both themes retain canonical controls by design.

## Append-only run history

| Run | Result | Distinct evidence |
| --- | --- | --- |
| `run-01` | Insufficient | 58 PNGs; fixture and reduced-motion findings |
| `run-02` | Insufficient | 66 PNGs; `idle-invalid`, Escape, repeated fixture/dev-overlay finding |
| `run-03` | Failed | 29 PNGs; Archive live-query timeout |
| `run-04` | Insufficient | 68 PNGs/four comparisons; production isolation resolved, matrix incomplete |
| `run-05` | Failed | 8 PNGs; Edit/Placement cancellation lock |
| `run-06` | Failed | 8 PNGs; unrelated inline field match |
| `run-07` | Failed | 14 PNGs; Placement/DnD settlement race |
| `run-08` | Failed | 20 PNGs; document replacement/touch reload race |
| `run-09` | Insufficient | Complete state matrix, but ordinary DnD recorded only one token position |
| `run-10` | Resolved final set | 200 PNGs, 40 interaction records, four comparisons, and two-point token movement; all eight combinations |

No prior result was overwritten. The complete inventory excludes only itself
and hashes all 704 retained artifacts. Its SHA-256 is
`5834345760d722f89ec1157acbe849c34c6f574b6d90603337c99c41fe8137b6`.
Run-10 browser manifest SHA-256 is
`ae5e63813f9ba9c91212455e006c18c543e423c0d663f594bdbdb4d6b44b30ab`;
comparison manifest SHA-256 is
`fa99d99a26ca0ddc6935b500181bb8fe01dbab85f6e9d79255739c00d99e86f2`.

## Automated verification, separate from browser result

| Check | Fresh result |
| --- | --- |
| Full tests | `101 files / 1,273 tests` passed |
| TypeScript | `pnpm typecheck` passed |
| ESLint | exit `0`; 11 pre-existing warnings and no Stage A warning |
| Production build | `pnpm build` passed; seven routes generated |
| Diff hygiene | `git diff --check` passed |
| Lifecycle resolver | exact receipt/gate/action returned `status=ready`, `contract_ready=true` |

Direct-render tests prove semantic role/state bindings; they do not prove
rendered fidelity. Only the production Chrome assets support visible styling,
focus, geometry, non-occlusion, motion, and touch-size claims.

## Omitted or insufficient evidence

- Runs 01–09 are retained history, not final acceptance evidence.
- There is no physical-device or non-Chrome run; touch uses Chrome coarse-pointer emulation at both approved viewports.
- No fresh repository-fault injection was added. Existing canonical tests remain the source for reliability failure behavior.
- User visual disposition is pending. Automation does not accept Stage A, mark Task 164 `[x]`, or authorize six-theme expansion.

Future skill-improvement hypothesis only: a post-Phase-31 audit could evaluate a standard production-browser fixture reset and append-only capture manifest. No installed skill, resolver, shared workflow contract, or workflow test changed.
