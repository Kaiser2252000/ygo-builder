---
title: 'Card-Focused Deck Slots'
type: 'feature'
created: '2026-06-03'
status: 'done'
baseline_commit: 'NO_VCS'
context: []
---

<frozen-after-approval>

## Intent

**Problem:** Deck slots currently display a tiny 18x25px thumbnail + card name. Players must read names to identify cards in a 60-slot grid — slow and visually noisy.

**Approach:** Replace thumbnail+text with the card image filling the slot. Enlarge slot height for recognizable card artwork. Fall back to card name text only when no imageUrl is available or the image fails to load.

## Boundaries & Constraints

**Always:**
- Occupied slots with valid imageUrl display the image filling the slot (object-cover); no card name text visible
- Occupied slots with no imageUrl or broken image show card name as text fallback
- Empty slots unchanged: dashed border, h-14, "—" placeholder
- FrameType left-border indicators preserved (spell=green, trap=purple)
- Hover still updates CardInfo panel; droppable still functions via @dnd-kit
- 10-column grid in DeckZone unchanged; gap-1 maintained

**Ask First:**
- None

**Never:**
- Do not change empty slot styling or height
- Do not remove frameType border indicators
- Do not break hover-to-inspect or drag-and-drop behavior
- Do not change DeckZone grid layout (grid-cols-10, gap-1)

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Occupied slot with imageUrl | card.imageUrl = "/images/BEWD.png" | Image fills slot with object-cover, no card name text shown | onError → fall back to name text |
| Occupied slot without imageUrl | card.imageUrl = null | Card name displayed as text fallback inside slot | N/A |
| Image load error | img onError fires | Show card name text fallback | onError → replace img with name |
| Empty slot | card = null | Dashed border, "—" placeholder, h-14 height | N/A |
| Spell card slot | frameType = "spell" | Green left-border indicator visible regardless of image/text | N/A |
| Trap card slot | frameType = "trap" | Purple left-border indicator visible regardless of image/text | N/A |

</frozen-after-approval>

## Code Map

- `frontend/src/components/deck-builder/DeckSlot.tsx` — Card slot rendering; primary change target
- `frontend/src/components/deck-builder/DeckZone.tsx` — 10-column grid container; no change needed but verify compatibility
- `frontend/src/__tests__/DeckSlotDnD.test.tsx` — Slot render tests; update for new image-first layout

## Tasks & Acceptance

**Execution:**
- [x] `frontend/src/components/deck-builder/DeckSlot.tsx` — Restructure occupied-slot render: increase height from h-14 to h-28 (112px). When card.imageUrl is set, render img with object-cover filling entire slot; use onError handler to switch to text fallback. When card.imageUrl is null/undefined, render card name text fallback. Remove MONSTER_FRAME_TYPES (no longer used since ATK/DEF text is gone). Keep frameBorder logic for spell/trap indicators. Keep hover, context menu, droppable ref intact. — Visual redesign to image-first slots.
- [x] `frontend/src/__tests__/DeckSlotDnD.test.tsx` — Add test: occupied slot with imageUrl does NOT show card name text. Add test: occupied slot with imageUrl that errors falls back to card name. Verify existing tests still pass: "renders occupied slot with card name" (mockCard has no imageUrl, so text fallback), "shows card image if available" (image renders). — Tests cover both image and fallback paths.

**Acceptance Criteria:**
- Given an occupied slot with card.imageUrl set, when rendered, then the image fills the slot with object-cover and no card name text is found in the slot DOM
- Given an occupied slot with card.imageUrl = null, when rendered, then the card name is displayed as text
- Given an occupied slot with card.imageUrl that returns a 404/image error, when the onError handler fires, then the card name is displayed as text fallback
- Given an empty slot (card = null), when rendered, then dashed border and "—" placeholder remain with h-14 height
- Given a spell card slot, when rendered, then the green left-border indicator is preserved
- Given a trap card slot, when rendered, then the purple left-border indicator is preserved

## Spec Change Log


## Verification

**Commands:**
- `cd frontend; npx vitest run DeckSlotDnD` — expected: all DeckSlot tests pass
- `cd frontend; npx vitest run` — expected: full suite passes (66+ tests)
- `cd frontend; npx tsc -b` — expected: no TypeScript errors

## Suggested Review Order

- Entry point — slot rendering logic refactored to image-first with error fallback
  [`DeckSlot.tsx:15`](../../frontend/src/components/deck-builder/DeckSlot.tsx#L15)

- imageFailed state reset on card swap prevents stale error persisting across slot reuse
  [`DeckSlot.tsx:21`](../../frontend/src/components/deck-builder/DeckSlot.tsx#L21)

- showImage condition gates between image and text fallback paths
  [`DeckSlot.tsx:50`](../../frontend/src/components/deck-builder/DeckSlot.tsx#L50)

- absolute-positioned image fills slot with object-cover; onError switches to text
  [`DeckSlot.tsx:59`](../../frontend/src/components/deck-builder/DeckSlot.tsx#L59)

- New test: card name hidden when imageUrl present
  [`DeckSlotDnD.test.tsx:89`](../../frontend/src/__tests__/DeckSlotDnD.test.tsx#L89)

- New test: onError falls back to card name text
  [`DeckSlotDnD.test.tsx:103`](../../frontend/src/__tests__/DeckSlotDnD.test.tsx#L103)
