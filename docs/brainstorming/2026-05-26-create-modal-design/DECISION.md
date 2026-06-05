# Node/Bit Create Modal — Future Redesign

## Metadata

- Created: 2026-05-26
- Readiness: draft
- Category: feature reference
- Source project: griddo2-claude
- Source topic: out_of_phase planning amendment
- Source prototype: n/a
- Tags: create modal, node, bit, progressive steps, themed variants

## Summary

Future design work for the Node/Bit Create modals. The current qc prototype
contains rough modal code, but that code is not adopted as an implementation
source. This future idea tracks the need to design a better modal structure and
visual treatment before promotion.

## Implementation Source Note

The Node/Bit Create modal code currently present in the `griddo2-claude-qc`
prototype is NOT the implementation source for future redesign. Neither its
structure nor its visual design is considered satisfactory.

This future idea needs independent design work. Do not treat the qc prototype
Create modal code as adopted implementation source.

The Quick Capture entry surface (`2026-04-28-quick-capture-entry-surface`) is a
separate concern — that entry surface does have a useful qc prototype source.

## Potential Enhancements

- Progressive step interaction (title first, details second, context-aware rules
  per Quick Capture behavior contract)
- Themed modal variants matching Inbox/Triage surface styles (neumorphism,
  tiny-desk)
- Richer parent selector UI (hierarchy explorer instead of simple dropdown)
- Modal visual style evolution beyond the basic observed patterns

## Current State

No adopted implementation source exists yet for the future redesign. The qc
prototype modal code may be useful as negative reference for what not to carry
forward, but the next design pass should start from the product constraints:
progressive creation, context-aware parent selection, and a visual treatment
that fits the selected GridDO theme direction.
