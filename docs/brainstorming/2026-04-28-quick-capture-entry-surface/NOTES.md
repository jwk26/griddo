# Quick Capture Entry Surface — Notes

## Resolved Questions

### OQ #3 — Exact Entry Surface Interaction (Resolved 2026-05-29)

The `+` surface slides/fades in anchored to the sidebar `+` button. It is not a
centered modal. The grouped Ideas/Create hierarchy is presented in place without
blocking the grid. Visual recipe source: `surface(main)` from `griddo2-claude-qc`.

### OQ #4 — Keyboard Shortcut (Resolved 2026-05-29)

`Cmd+K` opens a Command Palette (1=Scratch, 2=Search). The key mapping is a
product interaction decision. The Command Palette visual/interaction design is
sourced from `2026-05-18-quick-capture-palette` (Batch 1 partial adoption —
recipe source only). The `+` entry surface direction (`surface(main)`) is
unchanged.

Scope guard: `quick-capture-palette` is a recipe source for the Command Palette
only. It does not replace or merge with the `+` surface(main) direction.

### OQ #12 — Scratch Default Icon (Resolved 2026-05-29)

Scratch items use `"sparkles"` as the system default icon. Defined in
`2026-04-28-lifecycle-system-foundation` as the Scratch Bit system default.

## Discarded / Not Promoted from Source

- **Flat Scratch/Node/Bit chooser with no intent grouping:** Dropped because it
  makes capture and structured creation feel equivalent. The current direction
  keeps Scratch, Node, and Bit in one entry surface, but separates them under
  `Ideas` and `Create` groups so Scratch is visually and semantically primary.
- **Use `Draft` as product language:** Replaced by `Scratch`. Draft implies a
  schema type; Scratch better describes pre-structure material.

## Ideation History

The Quick Capture direction settled over several sessions:

1. Capture vs Create intent separation (2026-04-28)
2. Product language: Scratch not Draft (2026-04-28)
3. `+` entry surface behavior — grouped Ideas/Create surface (2026-05-14)
4. Context behavior: L0/global requires parent selector for Bit (2026-05-15)
5. Progressive Create modals: title first, details second (2026-05-15)
6. Visual recipe source confirmed: surface(main) from qc prototype (2026-05-18)
7. Command Palette via Cmd+K; quick-capture-palette as recipe source (2026-05-29)
8. Entry surface animation: slide/fade anchored to sidebar `+` button (2026-05-29)
9. Scratch default icon: `"sparkles"` (2026-05-29)
