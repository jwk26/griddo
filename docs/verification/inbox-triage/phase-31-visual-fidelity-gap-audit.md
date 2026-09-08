# Phase 31 Pre-Task-164 Visual-Fidelity Gap Audit

## Status and authority boundary

- Work order: user-approved 2026-09-08 ad-hoc `Task 164 이전 visual-audit reference-evidence repair`.
- Working session: `phase-31-visual-audit-reference-evidence-repair-01`, `active / awaiting user disposition` at this checkpoint.
- This record is not Task 164, creates no Task number or compatibility receipt, and does not start Task 164 or Task 165.
- Production evidence identity: branch `phase-31/integration-conformance-full-gate`, entry HEAD `fe43907a4efd8082ec8c7c17d132eed77ab0d7a7`, tree `2faf6b0555a6e38d71ec5c8a885c0c667ed1b714`, `src` tree `fe810793e64da8c1e8783315906d1815e4fc982e`.
- Prototype evidence identity: branch `griddo2-claude-themes2-3`, HEAD `4f39709688ceb4cac5e15d4e3502186b1f1c801b`, tree `7b8eb8766a9b57fe2174a948de09cfb7646cf7de`, clean and read-only throughout.
- The nine approved recipes are interaction/state authority. Prototype bytes are visual evidence only; absence in the prototype does not remove canonical production behavior.
- Relevant-input fingerprint: RFC 8785 JCS SHA-256 `4039f9df60f153bcf48674b89965f0e92fd4991a5d6d6192b2ab732ba747fe29`; exact manifest is `phase-31-visual-audit-assets/evidence-fingerprint.json`.

## Capture identity and readiness

All checked reference captures used a fresh Chrome profile and fresh runtime from the pinned identities. No prior `/tmp` capture or browser process was reused. Prototype bytes were exported to a temporary runtime; the pinned worktree was not served from a modified checkout.

| Field | Value |
| --- | --- |
| Browser | Google Chrome `152.0.7977.82`, DevTools protocol `1.3` |
| Viewport / DPR / zoom | `1600 × 1000` / `1` / `1` |
| Scheme | light |
| Base route pattern | `http://localhost:3101/prototype/inbox-triage-{theme}` |
| Production route | mounted `/grid/086c0083-4424-4d2e-b902-111ac098e222` in the fresh evidence profile |
| Ready predicate | `document.readyState=complete`; `document.fonts.status=loaded`; expected `data-color-theme`; stable computed background, geometry, and scroll extent for at least five samples; no running animation at the capture boundary |
| Normalization | Persistent prototype animations were paused only after theme/font/background/layout stability; infinite animations were reset to deterministic time `0`. This is capture normalization, not adoption of repeated motion. |
| Console | All eight prototype base captures: zero entries. Production development runtime: React/Next informational logs and font-preload warnings are retained verbatim in manifests; no page exception was observed. |

### Settled base references

| Theme | Computed body background | Readiness / capture ID | Replacement SHA-256 |
| --- | --- | --- | --- |
| GridDO | `rgb(238, 234, 226)` | stable, no normalization / `p31-va-base-griddo-20260908` | `aa48f12682a2e1fa476b3041e67a361ac5478e246de29e1fe7a6ad804158304f` |
| Tiny Desk | `rgb(245, 232, 214)` | stable, no normalization / `p31-va-base-tiny-desk-20260908` | `c0898d63c13ab1b63f73276cbd569b45117f37874c1c30c1b55a86f80d5add17` |
| Neumorphism | `rgb(224, 230, 235)` | stable; one persistent pulse frozen / `p31-va-base-neumorphism-20260908` | `ad2d9562fbfc77154eb446406d0101980acacff176fbbe6adfb7e03d04e2640b` |
| Claymorphism | `rgb(246, 238, 241)` | stable, no normalization / `p31-va-base-claymorphism-20260908` | `3195efc42e70c3c1b43bb51d1ea781410d5377f8bbf81434a0617482dd1eabcc` |
| Origami | `rgb(245, 243, 240)` | stable; persistent pulse/ping frozen / `p31-va-base-origami-20260908` | `b459aa80b023d95d4df717dd814d27ce31b7b56cda79731b459f348df9c8b459` |
| Terminal | `rgb(13, 13, 13)` | stable; persistent pulse/flicker frozen / `p31-va-base-terminal-20260908` | `4e5e143996a91e0a080e40e1894449aa85dfe08b9cd8682e543e56d35677a651` |
| Retro Mac | `rgb(230, 230, 230)` | stable, no normalization / `p31-va-base-retro-mac-20260908` | `a2bd3c8c70ccd26384c68b80674974d1b8681aeb43804b9ea549a2985b07a34f` |
| Graphite | `rgb(255, 255, 255)` | stable, no normalization / `p31-va-base-graphite-20260908` | `cec241bdee608b3efd39612a86b1a296bfde6640a938cdfd0beb0894284e7af4` |

All eight replacement hashes differ from the entry assets. The corrected captures confirm `P31-VA-01`: the prior evidence could be taken before the selected theme/background and motion state had settled. The known Claymorphism, Neumorphism, Terminal, and Origami cases are corrected; the same readiness contract was applied to all eight rather than preserving mixed capture conditions. Exact observations, fonts, geometry samples, routes, datasets, console arrays, byte counts, and file hashes are in `prototype-base-manifest.json`.

## Native and derived Explorer evidence

| Theme | Deepest native path | Populated native Level 3 | Native capture SHA-256 |
| --- | --- | ---: | --- |
| GridDO | Home → Work → Meetings → Weekly Sync | yes | `6d9dbe4f4457adc8ab9a153065f34c9ed3d12e127373c563b1f86e9d285ab19a` |
| Tiny Desk | Home → Work → Meetings → Weekly Sync | yes | `8dde5b168f96c044fed461bdda0e20d859f42df3945d5baa9f4d426aece667e3` |
| Neumorphism | Home → Work → Meetings → Weekly Sync | yes | `e862d420059a446eeacabee762d111375d9221fc79aae383abc07d5923138d52` |
| Claymorphism | Home → Projects → GridDO Development | **no** | `f6549d3c2770f8d7225e593112e9f163f616eb02c50253bcc57768f963d45de1` |
| Origami | Home → Work → Meetings → Weekly Sync | yes | `8a521b09d8d4e65c163665a10fbe14f5d5e077d6b4d4ec8d011ca03e4fffdecf` |
| Terminal | Home → Work → Meetings → Weekly Sync | yes | `f832f59ffafeb90cb9df4ab7da752ba057bd51b2b64606fc5b7c82e5894300e3` |
| Retro Mac | Home → System Folder → Extensions | **no** | `2d3a48c8b7a43f7f93d6d4c6f3f344084f95f708aa4956b93e390437a0e413df` |
| Graphite | Home → Work Workspace → Meetings → Weekly Sync | yes | `44347ef9c30b5df29c5cd0013577e0b0dea714894eb5ed20dada95060dee6276` |

`P31-VA-02` is confirmed and bounded: native Claymorphism and Retro Mac do not prove populated Level 3. Their native screenshots remain visibly separate from these two approved capture-only assets:

- `derived-conformance-fixture-claymorphism-level3-1600x1000.png`, SHA-256 `7055959ff7b36e16014e82cbefe6ed8dd29191517285ff85ef00cd41770eed3f`;
- `derived-conformance-fixture-retro-mac-level3-1600x1000.png`, SHA-256 `fe2833e46c1a58f79e8bcd2204158ab5c873fefa7b0c89ca8d5bb6c10e395b17`.

Each carries an on-image `DERIVED CONFORMANCE FIXTURE — NOT NATIVE PROTOTYPE DATA` banner. The exact delta is one capture-only synthetic Node `derived-level-3-parent` beneath native parent `griddo` or `extensions`, selection of that node into Level 3, and two capture-only synthetic Bits `derived-bit-a` and `derived-bit-b` titled `Derived conformance child A/B`. No prototype file, production file, or durable application data was changed. Exact click and mutation records are in the native and derived manifests.

## Interaction-state evidence

`P31-VA-03` is confirmed: one frame cannot prove an interaction contract. The supplemental sequence supplies the following bounded evidence.

| Contract | Fresh evidence | Result |
| --- | --- | --- |
| Hover and focus-visible | prototype before/focus-hover pair; production before/focus-hover pair | Prototype staging candidate exposes a focus-visible ring plus hover change. The production Scratch row pair was pixel-identical and the probed target reported `focusVisible=false` after mouse activation; keyboard-focus coverage remains a Task 164 conformance check, not a pass claim here. |
| DnD source | `prototype-griddo-dnd-source-active.png` | Source payload `id=nc1`, `type=node-candidate` and active source state recorded. |
| Invalid / eligible target | `prototype-griddo-dnd-invalid-target.png`, `prototype-griddo-dnd-eligible-target.png` | Level 3 invalid and Level 2 eligible target states are distinct. |
| Active drop / result | `prototype-griddo-dnd-active-drop.png`, `prototype-griddo-dnd-result-newly.png` | Pending confirmation, then result state with attached `NEW` and Undo. |
| Newly / Undo | result and `prototype-griddo-dnd-after-undo.png` | Undo removes the new marker and Undo control in the prototype fixture. Prototype behavior is comparison evidence, not production authority. |
| Edit → Save | production edit-active/result pair | Real mounted route retained the editor, saved the changed title, and exposed polite local `Saved.`. The title was restored to the matched comparison value afterward. |
| Edit → Cancel | production cancel-active/result pair | Draft `— cancel proof` disappeared; last saved title remained. The July prototype Edit control was inert and exposed neither Save nor Cancel, so it cannot override the adopted DP/recipe contract. |
| Local success/status | production Breakdown add-active/result pair | Three matched Breakdown titles were created through the UI; the newest row carried attached polite `✓ Added.`. |
| Animation interruption | production Quick Capture active/interrupted pair | Ten running entrance animations were observed during activation; immediate Escape removed the modal and left zero running animations. |
| Reduced motion | prototype and production reduced-motion captures/manifests | Both reported the media query active, maximum transition/animation duration `0.01ms`, and zero running animation at the observation boundary. |

Explicit omissions:

- No synthetic repository failure was injected. Therefore unknown/offline/conflict/error variants are evaluated from their accepted recipe and task-local evidence, not claimed as freshly rendered error proof here. New failure-injection harness work needs its owning task or separate authority.
- Production DnD/Newly/Undo was not re-executed with a fabricated hierarchy. The prototype sequence establishes visual comparison states; accepted production behavior remains governed by Tasks 129–163 and must be included in Task 164's aggregate matrix. An empty/fabricated production result is not presented as matched evidence.
- Archive dispatch/recovery was not executed because it would require a separate destructive/recovery seed. The accepted Archive recipe/task evidence remains authority; Task 164 must aggregate it without altering behavior.
- This repair ran eight themes only at light, 1600×1000. It did not execute or claim Task 164's full 16 theme/mode × 1024/1920 matrix.

## Matched production comparison

Production base captures cover all eight themes at 1600×1000/light using the same Scratch title and three Breakdown titles as the corrected prototype base. Production Staging and Explorer were native-empty, so populated comparisons are not claimed for those regions. Computed page backgrounds matched the corresponding prototype values for all eight themes. The captures show that theme identity/background works, while the production realization is materially flatter and less theme-specific than the reference in most section surfaces.

| Canonical recipe | Comparison result | Exact bucket |
| --- | --- | --- |
| Shell and section chrome | Four-area placement and headings are present; theme background is correct. Section framing, depth, dividers, header identity, and theme grammar are materially weaker than the settled reference. | **3 — Task 164 `src/app/globals.css` conformance scope** |
| Scratch Pool | Count, search, selected row, and collapsed ownership exist. Wood/paper, inset/raised, clay, fold, console, Finder, and editorial row/tool treatments are flattened. | **3 — Task 164 `src/app/globals.css` conformance scope** |
| Selected Scratch Context | Production preserves canonical Edit/Save/Cancel and `Saved.` behavior missing from the prototype. Base Context depth, signature treatment, action hierarchy, and per-theme realization remain visually weak. | **3 — Task 164 `src/app/globals.css` conformance scope** |
| Breakdown rows and empty states | Matched three-row content, Add, row actions, and attached `✓ Added.` work. Row objects, grips/actions, Add composition, empty/completion grammar, and theme depth need semantic CSS conformance. | **3 — Task 164 `src/app/globals.css` conformance scope** |
| Staging | Native empty production columns preserve Nodes/Bits semantics; the captured prototype has populated candidates. Chrome, wells, quiet-empty treatment, invalid/drop-back state roles are Task 164 CSS work. Actual Node/Bit card internals are excluded below as `D-CARD`. | **3 — Task 164 `src/app/globals.css` conformance scope** |
| Grid Explorer | Four columns, full labels, Home path, and search entry are present. Column chrome/path/target/status styling is flat. Populated native Level 3 is proven for six prototype themes; derived-only evidence is separated for two. | **3 — Task 164 `src/app/globals.css` conformance scope** |
| Placement affordances | Prototype sequence proves source, invalid/eligible target, drop confirmation, and result visuals. Production behavior is not removed or redefined; target/status/non-color/focus/reduced-motion styling is an aggregate conformance obligation. | **3 — Task 164 `src/app/globals.css` conformance scope** |
| Newly placed and Undo | Attached marker/Undo semantics remain canonical and are visible in the prototype sequence. Common actual-card visual internals are the existing Phase 29 deferral; Task 164 may style only its semantic marker/rail/action envelope. | **1 — Phase 29 `P29-01` / `D-CARD` for card internals** |
| Archive completion | No fresh destructive transition was run. The accepted Breakdown-scoped card/status/recovery semantics remain authoritative; their theme role bindings and static/reduced-motion CSS are Task 164-owned when aggregated from accepted task evidence. | **3 — Task 164 `src/app/globals.css` conformance scope** |

Additional exact findings, each assigned once:

| Finding | Evidence-derived disposition | Exact bucket |
| --- | --- | --- |
| Eight themes share an overly flat production geometry despite correct datasets/backgrounds | This is the broad debt observed in the eight production base captures. Its CSS-addressable subset is enumerated below; any required component structure must stop and reopen its owner. | **2 — broader eight-theme visual-fidelity debt** |
| Common Explorer/Staging/newly Node/Bit-card internal layout and visual language | Preserve `P29-01` terminal deferral and `D-CARD`; do not fold it into Task 164. | **1 — Phase 29 `P29-01` / `D-CARD`** |
| Production Scratch Save/Cancel, attached Add success, modal interruption, and reduced-motion behavior | Fresh sequence shows the adopted behavior; prototype absence does not authorize removal. | **5 — no material gap** |
| Production Scratch-row focus/hover capture produced no pixel change and `focusVisible=false` after pointer activation | Task 164 must run a true keyboard focus-visible check and may repair semantic CSS only. If the target is not keyboard reachable or markup must change, reopen its owning earlier task. | **3 — Task 164 `src/app/globals.css` conformance scope**, with a stop condition for component ownership |
| Native Claymorphism/Retro Mac cannot populate Level 3 | Keep native and derived evidence separate; do not change prototype or production fixtures in Task 164. | **4 — separate fixture/product-evidence authority** |
| Fresh native error/fault and Archive recovery render not produced by this repair | Do not claim coverage. A new fault/Archive capture harness or seed is separate owner authority; Task 164 may only aggregate already-accepted records. | **4 — separate harness/owner authority** |

## `P31-VA` issue disposition

| ID | State at checkpoint | Disposition |
| --- | --- | --- |
| `P31-VA-01` | Confirmed, evidence repaired | Eight settled PNGs replaced under one readiness contract; at least the known Claymorphism, Neumorphism, Terminal, and Origami cases are corrected. |
| `P31-VA-02` | Confirmed, evidence repaired without pretending native proof | Eight native deepest paths retained; Claymorphism/Retro Mac are explicitly not populated Level 3; two derived conformance fixtures are separately labeled and delta-recorded. |
| `P31-VA-03` | Confirmed, evidence repaired within bounded scope | Before/active/after interaction assets and manifests added; omissions above remain explicit and are not represented as passes. |
| `P31-VA-04` | Confirmed, deferred as prototype-only evidence | Prototype source contains non-generated utility candidates such as `text-red-605`, `text-red-650`, `z-15`, `z-25`, and `scale-102`, plus repeated `pulse`, `ping`, `bounce`, terminal flicker/blink, and graphite rotation declarations. They produced no base-page console entry but include invalid/unsupported or recipe-excluded motion candidates. They grant no production-code repair authority. |

## Exact proposed Task 164-owned CSS scope

Task 164 may modify only `src/app/globals.css` for this visual subset:

1. Bind the existing semantic tree and `data-triage-role`/state attributes to recipe roles for shell, Pool, Context, Breakdown/Add, Staging, Explorer, placement, newly/Undo envelope, and Archive/completion.
2. Add eight-theme light/dark surface, border/rule, depth/shadow, typography, shape, spacing, and section-chrome realization without theme-ID component branches.
3. Add semantic hover, true keyboard `:focus-visible`, focus-within, non-color selected/eligible/invalid/pending/success/failure cues, and minimum touch-target bindings.
4. Preserve the adopted static/one-shot motion contract; remove conformance-scope repeated motion and ensure reduced-motion equivalence and interruption-safe CSS.
5. Style existing status/action regions, including Pool/Staging/Explorer statuses, Breakdown attached success/reliability, placement target/reason, newly marker/Undo rail, and Archive card/recovery envelope.

It must not redesign Node/Bit card internals (`P29-01`/`D-CARD`), change JSX/behavior/copy/data, introduce prototype literal classes, remove Save/Cancel/Newly/Undo/status behavior, create new product direction, or hide an owning-task failure. Any requirement for component, hook, store, recipe, token, schema, spec, or plan changes is a zero-write reopen/authority request.

## Separate user authority required

- Any correction to prototype source or native fixture data, including populated Claymorphism/Retro Mac Level 3.
- Any production component/behavior/test change outside Task 164's already-declared conformance test and CSS scope.
- Any common Node/Bit-card redesign under `P29-01` / `D-CARD`.
- Any new fault-injection or destructive Archive/recovery capture harness/seed beyond aggregation of accepted evidence.
- Any recipe, `DESIGN_TOKENS.md`, `SCHEMA.md`, `SPEC.md`, plan, workflow skill/resolver/contract/test, lifecycle, branch/worktree, publication, integration, or cleanup change.

## Checkpoint lenses

- **Visible now:** corrected eight-theme prototype references; eight matched production theme captures; native deepest Explorer evidence; visibly separated derived Level-3 fixtures; prototype DnD/Newly/Undo; production Save/Cancel/Add/status/motion sequences.
- **Review now:** asset inventory and manifests, nine-recipe table, five-bucket classification, `P31-VA-01`–`04` dispositions, and proposed Task 164 CSS boundary.
- **Planned later:** only after user disposition, Control Tower may schedule Task 164's full 16 theme/mode × 1024/1920 matrix and conformance work through its own Gate C/receipt.
- **Unowned:** prototype/native fixture repair, `P29-01`/`D-CARD`, component-level visual reconstruction, and new failure/Archive harness work. Each needs separate user authority; none was silently assigned to Task 164.

## Inventory and reproducibility

- `phase-31-visual-audit-assets/asset-inventory.sha256` lists every replacement and supplemental evidence file except itself; its SHA-256 is `a6367eaef5cae6b417db88c1da4c7f1199af8d4ac4baac993457f2ab0356eab6` at document creation.
- All PNGs are 1600×1000. Manifests preserve route, dataset, background, readiness samples, browser, viewport, DPR, scheme, capture ID, file hash, interaction probes, and console output.
- Asset count before adding this audit document: eight settled replacements plus 47 supplemental files, including 39 PNGs, six capture/interaction manifests, the relevant-input fingerprint, and the checksum inventory.

## Verification at checkpoint candidate

The adapter-declared full gate ran serially after capture runtime shutdown:

| Command | Exit | Result |
| --- | ---: | --- |
| `pnpm test` | 0 | 100 files and 1,267 tests passed; Vitest duration `22.23s` |
| `pnpm lint` | 0 | 0 errors; 11 pre-existing warnings |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed |
| `pnpm build` | 0 | Next.js 16.2.1 Turbopack production build compiled; TypeScript completed; seven routes generated |
| `git diff --check` | 0 | empty output |
| checksum/JSON/PNG/scope checks | 0 | every inventory entry verified; all JSON parsed; all 39 supplemental PNGs and eight settled PNGs were 1600×1000; no path outside the approved boundary was found |

The full gate emitted only the existing Node `module.register()` deprecation,
worker `localStorage` experimental warnings, and the same 11 lint warnings.
