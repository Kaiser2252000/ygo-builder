---
title: 'Extra Deck Zone Validation'
type: 'feature'
created: '2026-06-03'
status: 'done'
baseline_commit: 'NO_VCS'
context: []
---

<frozen-after-approval>

## Intent

**Problem:** Fusion, Synchro, Xyz, and Link monsters can be dropped into the Main Deck, and non-Extra-Deck cards can be placed in the Extra Deck — violating TCG zone rules.

**Approach:** Add zone validation function `canPlaceInZone(frameType, zoneKey)` that checks: Extra Deck only accepts fusion/synchro/xyz/link; Main Deck rejects those frameTypes; Side Deck accepts everything. Apply validation in `handleDragEnd` (search→deck and deck→deck paths) and `SearchResult right-click` handler.

## Boundaries & Constraints

**Always:**
- fusion/synchro/xyz/link → only Extra Deck or Side Deck
- All other frameTypes → only Main Deck or Side Deck (never Extra Deck)
- Side Deck accepts all frameTypes
- Reorder within same zone: no validation needed (card already in zone)
- Drag-to-remove: no validation needed

**Never:**
- No toast/alert on rejected drop — card simply returns to source
- No changes to DeckContext's addCardToZone/removeCardFromZone — validation is UI-layer only

## Code Map

- `frontend/src/App.tsx` — Add `EXTRA_DECK_FRAME_TYPES` set and `canPlaceInZone` helper. Apply validation in both search→deck and deck→deck (cross-zone) drag paths.
- `frontend/src/components/card-search/SearchResult.tsx` — Add `EXTRA_DECK_FRAME_TYPES` and skip right-click add for extra-deck-only cards.

## Tasks & Acceptance

**Execution:**
- [x] `frontend/src/App.tsx` — Define `EXTRA_DECK_FRAME_TYPES = new Set(["fusion", "synchro", "xyz", "link"])` and `canPlaceInZone(frameType, zoneKey)`. Add validation check before `addCardToZone` in both search→deck and deck→deck cross-zone branches. Rejected drops silently no-op. — Enforces TCG zone rules on all drag paths.
- [x] `frontend/src/components/card-search/SearchResult.tsx` — Define same `EXTRA_DECK_FRAME_TYPES`. In `handleContextMenu`, return early if card's frameType is an extra-deck-only type. — Prevents right-click from adding extra deck monsters to Main Deck.

**Acceptance Criteria:**
- Given a fusion/synchro/xyz/link card is dragged from search to a Main Deck slot, when the drop completes, then the card returns to search results (no state change)
- Given a fusion/synchro/xyz/link card is right-clicked in search results, when the context menu fires, then nothing happens (card not added to Main Deck)
- Given a fusion/synchro/xyz/link card is dragged to an Extra Deck or Side Deck slot, when the drop completes, then the card is added normally
- Given a normal/effect/spell/trap card is dragged to an Extra Deck slot, when the drop completes, then the card returns to search results (no state change)
- Given a card is dragged from Side Deck to Main Deck (cross-zone), when the card is extra-deck-only, then the move is rejected

## Verification

**Commands:**
- `cd frontend; npx vitest run` — expected: 73+ tests pass
- `cd frontend; npx tsc -b` — expected: no TypeScript errors
