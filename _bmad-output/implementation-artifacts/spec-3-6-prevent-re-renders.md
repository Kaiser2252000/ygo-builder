---
title: 'Prevent Unnecessary Re-renders'
type: 'feature'
created: '2026-06-03'
status: 'done'
baseline_commit: 'NO_VCS'
context: []
---

<frozen-after-approval>

## Intent

**Problem:** Adding or removing a single card triggers a full re-render of all 90+ DeckSlot components, because each slot re-receives its `card` prop from a new `slots` array reference.

**Approach:** Extract the card image/text content into a `React.memo`-wrapped `SlotContent` component defined at module level. This way, `DeckSlot` still re-renders for droppable hover-state updates (isOver), but the inner card content only re-renders when its specific card data actually changes. Stabilize the `onError` handler with `useCallback` so it doesn't break memoization.

## Boundaries & Constraints

**Always:**
- Slot visual feedback during drag (ring highlight, isOver) must still work
- Card content (image/name) must only re-render when the actual card data changes
- Empty slot rendering is unchanged

**Never:**
- Do not memoize the entire DeckSlot (would break isOver highlight during drag)

## Code Map

- `frontend/src/components/deck-builder/DeckSlot.tsx` — Define `SlotContent` as module-level `React.memo` component. Replace inline img/span with `<SlotContent>`. Use `useCallback` to stabilize `handleImageError`. Convert `showImage` to strict boolean with `!!`.

## Tasks & Acceptance

**Execution:**
- [x] `frontend/src/components/deck-builder/DeckSlot.tsx` — Create `SlotContent` memo component (render img or span based on `showImage`). Use `React.memo` with default shallow comparison. Apply `useCallback` to `handleImageError`. Use `!!` for `showImage` to get strict boolean. — Prevents card content re-render when card data hasn't changed.

**Acceptance Criteria:**
- Given 90+ slots rendered, when a card is added to one slot, then the card content of unaffected slots does not re-render
- Given 90+ slots rendered, when a card is removed from one slot, then the card content of unaffected slots does not re-render
- Given a drag operation is in progress, when the cursor enters a slot, then the slot's ring highlight updates (isOver still works)

## Verification

**Commands:**
- `cd frontend; npx vitest run` — expected: 73 tests pass
- `cd frontend; npx tsc -b` — expected: no TypeScript errors
