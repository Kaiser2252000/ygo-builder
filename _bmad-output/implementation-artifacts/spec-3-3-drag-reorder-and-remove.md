---
title: 'Drag Reorder & Drag to Remove'
type: 'feature'
created: '2026-06-03'
status: 'done'
baseline_commit: 'NO_VCS'
context: []
---

<frozen-after-approval>

## Intent

**Problem:** Cards in deck slots can't be reordered by dragging within a zone, and there's no drag-to-remove gesture. Users must rely on right-click + re-add to reposition cards.

**Approach:** Add `useDraggable` to occupied deck slots. In `handleDragEnd`, detect deck-source drags and either reorder (same zone drop) or remove (drop outside zone). Cross-zone drops remove from source zone and add to target zone. Update DragOverlay to show card image.

## Boundaries & Constraints

**Always:**
- Occupied slots are both draggable (source="deck") and droppable
- Empty slots are only droppable, not draggable
- Drag within same zone → moveCardWithinZone
- Drag to different zone → remove from source, add to target
- Drop outside any slot → remove card from zone
- Search-to-deck drag remains unchanged (source="search")
- DragOverlay shows card image or name at slot size (w-20 h-28)

**Never:**
- Do not break existing search→deck drag flow
- Do not change empty slot behavior
- Keep existing handleDragCancel behavior

</frozen-after-approval>

## Code Map

- `frontend/src/components/deck-builder/DeckSlot.tsx` — Add useDraggable for occupied slots; wrap content in draggable div; add cursor-grab classes
- `frontend/src/App.tsx` — Update handleDragEnd to handle deck-source drags (reorder, cross-zone, drag-to-remove); destructure removeCardFromZone + moveCardWithinZone; update DragOverlay
- `frontend/src/__tests__/DeckSlotDnD.test.tsx` — Add tests verifying useDraggable call with correct data for occupied/empty slots

## Tasks & Acceptance

**Execution:**
- [x] `frontend/src/components/deck-builder/DeckSlot.tsx` — Import useDraggable, create draggable instance for occupied slots with source:"deck", card data, zoneType, slotIndex. Wrap card content in div with ref, listeners, attributes. Add cursor-grab/grabbing. — Enables drag-to-reorder and drag-to-remove.
- [x] `frontend/src/App.tsx` — Update handleDragEnd: detect source="deck" → if !event.over, remove from zone; if same-zone drop, moveCardWithinZone; if cross-zone, remove+add. Guard same-index reorder to avoid no-op. Destructure removeCardFromZone + moveCardWithinZone from useDeck. Update DragOverlay to show card-sized preview. — Handles all deck drag scenarios.
- [x] `frontend/src/__tests__/DeckSlotDnD.test.tsx` — Add test verifying useDraggable called with id:"deck-main-0", data:{source:"deck"}, disabled:false for occupied slot. Add test verifying disabled:true for empty slot. Restructure mock to expose useDraggable for assertions. — Coverage for new draggable wiring.

**Acceptance Criteria:**
- Given an occupied deck slot, when a drag starts, then useDraggable is called with source:"deck" and the correct card, zoneType, and slotIndex in the drag data
- Given an empty deck slot, when rendered, then useDraggable has disabled:true
- Given a card is dragged and dropped on a different slot in the same zone, when the drop completes, then moveCardWithinZone is called with the correct from/to indices
- Given a card is dragged and dropped outside any deck slot, when the drop completes, then removeCardFromZone is called with the correct zone and slot
- Given a card is dragged from search results and dropped on a deck slot, when the drop completes, then the existing addCardToZone flow works unchanged

## Verification

**Commands:**
- `cd frontend; npx vitest run` — expected: 73+ tests pass
- `cd frontend; npx tsc -b` — expected: no TypeScript errors
