---
title: 'Repair Right-Click Remove'
type: 'feature'
created: '2026-06-03'
status: 'done'
baseline_commit: 'NO_VCS'
context: []
---

<frozen-after-approval>

## Intent

**Problem:** User reports right-clicking an occupied deck slot shows the Remove/Cancel context menu, but clicking Remove doesn't actually remove the card. No end-to-end test exists to catch regression.

**Approach:** Write an end-to-end test that right-clicks an occupied slot, clicks Remove, and verifies the card is removed via state. Fix the mock gap in DeckBuilder test that lacks `removeCardFromZone`. If the test reveals real bug in production handler wiring, fix it.

## Boundaries & Constraints

**Always:**
- Context menu appears on right-click of any occupied Deck Slot
- Right-click on empty slot does nothing
- Clicking Remove removes the card and shifts remaining cards left
- Clicking Cancel, Escape, or clicking outside closes menu without changes
- Existing DeckSlotContextMenu tests remain passing
- `removeCardFromZone` mock added to DeckBuilder test mock

**Never:**
- Do not change the DeckSlotContextMenu component behavior
- Do not change the DeckBuilder's handleSlotContextMenu signature
- Do not remove existing context menu tests

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Right-click occupied slot | Right-click on slot with card | Context menu appears at cursor with Remove/Cancel | N/A |
| Click Remove | Click "Remove" button | Card removed from slot, backfill shift left, menu closes | N/A |
| Click Cancel | Click "Cancel" button | Context menu closes, no state change | N/A |
| Press Escape | Press Escape key | Context menu closes | N/A |
| Click outside menu | Click on document body outside menu | Context menu closes | N/A |

</frozen-after-approval>

## Code Map

- `frontend/src/__tests__/DeckBuilder.test.tsx` — DeckBuilder integration test; add end-to-end context menu test
- `frontend/src/components/deck-builder/DeckBuilder.tsx` — handleRemoveCard / context menu wiring (may need fix)

## Tasks & Acceptance

**Execution:**
- [x] `frontend/src/__tests__/DeckBuilder.test.tsx` — Add `removeCardFromZone: vi.fn()` to the `useDeck` mock. Add test: right-click occupied slot → context menu appears → click Remove → verify `removeCardFromZone` called with correct args and card count decreases. Add test: right-click occupied slot → click Cancel → menu closes, card count unchanged. — End-to-end coverage for right-click removal flow.

**Acceptance Criteria:**
- Given an occupied deck slot, when right-clicked, then a context menu with Remove/Cancel appears
- Given the context menu is visible, when Remove is clicked, then `removeCardFromZone` is called with the correct deck ID, zone, and slot index
- Given the context menu is visible, when Cancel is clicked, then the menu closes and no card removal occurs

## Verification

**Commands:**
- `cd frontend; npx vitest run DeckBuilder` — expected: all DeckBuilder tests pass
- `cd frontend; npx vitest run` — expected: full suite passes
- `cd frontend; npx tsc -b` — expected: no TypeScript errors

## Suggested Review Order

- Mock restructured from static object to `let` function pattern for test-time assertions
  [`DeckBuilder.test.tsx:62`](../../frontend/src/__tests__/DeckBuilder.test.tsx#L62)

- Test: right-click opens context menu with Remove/Cancel
  [`DeckBuilder.test.tsx:183`](../../frontend/src/__tests__/DeckBuilder.test.tsx#L183)

- Test: Remove calls `removeCardFromZone` with correct deck ID, zone, and slot index
  [`DeckBuilder.test.tsx:199`](../../frontend/src/__tests__/DeckBuilder.test.tsx#L199)

- Test: Cancel closes menu without calling removal
  [`DeckBuilder.test.tsx:216`](../../frontend/src/__tests__/DeckBuilder.test.tsx#L216)
