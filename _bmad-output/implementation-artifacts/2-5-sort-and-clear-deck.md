---
baseline_commit: NO_VCS
---

# Story 2.5: Sort and Clear Deck

Status: review

## Story

As a Yu-Gi-Oh! player,
I want to sort my deck by game-logic priority or clear it to start over,
so that I can keep my deck organized or quickly rebuild from scratch.

## Acceptance Criteria

1. **Given** a zone has unsorted cards, **When** the user clicks Sort above that zone, **Then** cards reorder: monsters by frameType (normal → effect → ritual → fusion → synchro → xyz → link), within same frameType by level desc → ATK desc → DEF desc → name alpha (A-Z, case-insensitive); then spells by race alpha → name alpha; then traps by race alpha → name alpha; then remaining frameTypes.

2. **Given** a 60-card Main Deck is sorted, **When** sort triggers, **Then** it completes in <500ms (client-side in-memory). **And** if >200ms, the Sort button shows a loading state.

3. **Given** the user clicks Clear, **When** the flow starts, **Then** an AlertDialog opens: "Clear all cards from this deck?" with Confirm (destructive) and Cancel buttons.

4. **Given** the user confirms Clear, **When** Confirm is clicked, **Then** all zones (Main Deck, Extra Deck, Side Deck) are emptied, **And** headers reset to "Main Deck (0/60)", "Extra Deck (0/15)", "Side Deck (0/15)".

5. **Given** the user cancels Clear, **When** Cancel or Esc is pressed, **Then** the dialog closes, **And** no deck state changes.

## Tasks / Subtasks

- [x] Add `sortZone` and `clearAllZones` to DeckContext (AC: 1, 2, 4)
  - [x] Add to `deckContextValue.ts` interface: `sortZone(deckId: string, zone: "main-deck" | "extra-deck" | "side-deck", sortedIds: number[]): void` and `clearAllZones(deckId: string): void`
  - [x] Implement in `DeckContext.tsx`: `sortZone` replaces the zone array atomically; `clearAllZones` sets all three zones to `[]`
  - [x] Export from `useDeck()` hook

- [x] Create sort utility function (AC: 1, 2)
  - [x] In `frontend/src/lib/utils.ts`, export `sortCardIds(ids: number[], cardsMap: Map<number, Card>): number[]`
  - [x] Sort order: monsters first by frameType priority (normal=0, effect=1, ritual=2, fusion=3, synchro=4, xyz=5, link=6), then level desc (nulls last), ATK desc (nulls last), DEF desc (nulls last), name alpha asc (localeCompare, case-insensitive)
  - [x] After monsters: spells sorted by race alpha → name alpha, then traps sorted by race alpha → name alpha
  - [x] Remaining frameTypes (pendulum, token, etc.) after traps, sorted by frameType alpha → name alpha
  - [x] Not a card in cardsMap → preserve relative position (push to end in original order)

- [x] Add Sort button per zone in DeckBuilder/DeckZone (AC: 1, 2)
  - [x] In `DeckZone.tsx`, add a Sort button next to the zone header (shadcn Button variant `default`, text "Sort")
  - [x] On click: call `sortCardIds` with the zone's current IDs + cardsMap, then `sortZone` context method
  - [x] Track sort loading state with `useState` + `setTimeout` for loading indicator
  - [x] Accept `onSort: (zoneType: "main" | "extra" | "side") => void` prop
  - [x] Button disabled when `sorting` or zone is empty

- [x] Add Clear button to DeckBuilder header (AC: 3, 4, 5)
  - [x] In `DeckBuilder.tsx`, add a Clear button near the deck name header (shadcn Button variant `destructive`, text "Clear")
  - [x] Manage `clearDialogOpen` boolean state
  - [x] Render `<AlertDialog>` when button clicked
  - [x] On confirm: call `clearAllZones(activeDeckId)`, close dialog
  - [x] On cancel/escape: close dialog, no state change

- [x] Wire DeckZone sort prop through DeckBuilder (AC: 1)
  - [x] In `DeckBuilder.tsx`, implement `handleSortZone(zoneType: "main" | "extra" | "side")` that gets the zone's card IDs, calls `sortCardIds` with `cardsMap`, then calls `sortZone`
  - [x] Pass `onSort={handleSortZone}` to each `<DeckZone>`
  - [x] Handle edge case: cardsMap is empty or zone has 0 cards → noop

- [x] Frontend tests (AC: all)
  - [x] Create `frontend/src/__tests__/DeckSortClear.test.tsx`
  - [x] Test: `sortCardIds` returns empty array for empty input
  - [x] Test: `sortCardIds` handles unknown card IDs (not in map)
  - [x] Test: `sortCardIds` sorts by frameType priority
  - [x] Test: `sortCardIds` within same frameType by level → ATK → DEF → name
  - [x] Test: `sortCardIds` null level/ATK/DEF last
  - [x] Test: `sortCardIds` spells after monsters sorted by race → name
  - [x] Test: `sortCardIds` traps after spells sorted by race → name
  - [x] Test: `sortCardIds` other frameTypes after traps
  - [x] Test: `sortCardIds` full mixed deck end-to-end
  - [x] Test: Sort buttons render for each zone
  - [x] Test: Clear button renders
  - [x] Test: Sort button calls sortZone with correct sorted IDs
  - [x] Test: Clear button opens AlertDialog
  - [x] Test: Clear confirm calls clearAllZones and closes dialog
  - [x] Test: Clear cancel does not call clearAllZones

## Dev Notes

### Current State to Preserve

- **DeckContext.tsx**: Currently has `addCardToZone`, `removeCardFromZone`, `moveCardWithinZone`. Add `sortZone` (single zone atomic replace) and `clearAllZones` (set all zones to `[]`). Both are state-only operations (no API call) — Save button (Story 2.6) persists.
- **DeckZone.tsx**: Renders grid of DeckSlots with zone header `"{name} ({filled}/{maxCount})"`. Add `onSort` prop + Sort button in the header row. Keep header layout clean: zone name + count + buttons on one line using `flex items-center justify-between` or `gap-2`.
- **DeckBuilder.tsx**: Fetches cards, builds slot arrays, manages context menu state. Add clear dialog state, sort handler, pass `cardsMap` + `onSort` to DeckZone. The `cardsMap` is already available at the DeckBuilder level.
- **deckContextValue.ts**: Add `sortZone` and `clearAllZones` to `DeckContextType` interface.
- **utils.ts**: Currently only has `cn()` from shadcn. Add `sortCardIds` pure utility function.

### Sort Order Specification

```
FrameType priority map:
  normal:  0
  effect:  1
  ritual:  2
  fusion:  3
  synchro: 4
  xyz:     5
  link:    6

Sort strategy:
  1. Partition cards into: monsters (frameType in priority map), spells (frameType === "spell"), traps (frameType === "trap"), other (everything else)
  2. Monsters sorted by: frameType priority asc → level desc (nulls last) → ATK desc (nulls last) → DEF desc (nulls last) → name asc (localeCompare, case-insensitive)
  3. Spells sorted by: race asc → name asc
  4. Traps sorted by: race asc → name asc
  5. Other sorted by: frameType asc → name asc
  6. Concatenate: monsters + spells + traps + other
```

### Clear Dialog State

```typescript
const [clearDialogOpen, setClearDialogOpen] = useState(false)
```

- Managed entirely in `DeckBuilder.tsx`
- No prop drilling needed — AlertDialog rendered in DeckBuilder
- On confirm: `clearAllZones(activeDeckId)` then `setClearDialogOpen(false)`
- On cancel: `setClearDialogOpen(false)` only

### Sort Button Loading State

```typescript
const [sortingZone, setSortingZone] = useState<"main" | "extra" | "side" | null>(null)
```

- Passed to DeckZone as `sorting: boolean` prop
- DeckZone shows spinner or disables Sort button when `sorting` is true for that zone
- After `sortZone` context call completes in a microtask, clear `sortingZone`
- Use `setTimeout(() => setSortingZone(...), 0)` + `requestAnimationFrame` approach, or simpler: use a brief setTimeout(200ms) to show loading if sort takes perceptible time

Actually simpler: since sort is synchronous (<500ms), just set the loading state, call sort, then clear loading state. The loading state may only flash, which is acceptable. The UX AC says "if >200ms, show loading" — but since it's synchronous, we can just show/clear the loading state around the sort call. React batches the state updates if they're in the same synchronous block. So:

```typescript
const handleSort = (zoneType: "main" | "extra" | "side") => {
  setSortingZone(zoneType)
  // Use setTimeout to ensure loading state renders first
  setTimeout(() => {
    const sorted = sortCardIds(zoneIds, cardsMap)
    sortZone(activeDeckId, zoneKey, sorted)
    setSortingZone(null)
  }, 0)
}
```

### Data Flow

```
Sort button clicked
  → DeckZone.onSort(zoneType)
  → DeckBuilder.handleSortZone(zoneType)
  → setSortingZone(zoneType)
  → setTimeout(() => {
      const ids = deck.decklist[ZONE_TO_KEY[zoneType]]
      const sorted = sortCardIds(ids, cardsMap)
      sortZone(activeDeckId, ZONE_TO_KEY[zoneType], sorted)
      setSortingZone(null)
    }, 0)

Clear button clicked
  → setClearDialogOpen(true)
  → AlertDialog renders
  → Confirm clicked → clearAllZones(activeDeckId) → setClearDialogOpen(false)
  → Cancel/Esc → setClearDialogOpen(false)
```

### No-Go Zones

- Do NOT create a backend endpoint for sort — it's client-side only
- Do NOT modify CardInfoContext, SearchContext, CardSearch, or layout components
- Do NOT modify existing DnD logic
- Do NOT modify the backend
- Do NOT add icon libraries — use text labels ("Sort", "Clear")
- Do NOT add animation/transition for sort or clear — instant state changes per UX-DR18

### Edge Cases

- **Sort on empty zone**: `sortCardIds([], cardsMap)` → returns `[]`. Button should be disabled or noop.
- **Sort on zone with all unknown cards**: preserve positions, add to end in original order.
- **Clear with already-empty zones**: sets all to `[]` again — idempotent, no user-facing difference.
- **Multiple rapid Sort clicks**: debounce by tracking `sortingZone` state — if already sorting that zone, subsequent clicks are noop.
- **Sort during active drag**: sort button should be disabled while DnD is active (optional, low priority). Track `isDragActive` via `useDndContext` in DeckZone.
- **`cardsMap` not yet loaded when Sort clicked**: sort button disabled when `cardsMap.size === 0` or when any card IDs in zone are not in map.
- **`sortCardIds` with Map that doesn't have all zone's cards**: unknown cards go to end in original relative order.
- **`level` is null**: sort nulls last (below any non-null level).
- **`atk` is null**: sort nulls last.
- **`def` is null**: sort nulls last.
- **Case-insensitive name sort**: use `a.name.toLowerCase().localeCompare(b.name.toLowerCase())`.
- **Clear while Sort in progress**: Clear should still work — clears all state including any in-progress sort loading indicator.

### Testing Strategy

- `sortCardIds` is a pure function — test with known inputs/expected outputs, no mocks needed
- Mock `useDeck()` for context integration tests
- Mock `AlertDialog` rendering if needed, or render in test and verify onConfirm/onCancel behavior
- Test sort button click → calls `sortCardIds` with correct args → calls `sortZone` with sorted result
- Test Clear button → verifies AlertDialog open → confirm clears → cancel clears dialog only
- Use waitFor for async state changes (sort+setTimeout)
- Use `fireEvent.click` for button interactions

### Files to Modify

- `frontend/src/contexts/deckContextValue.ts` — add `sortZone`, `clearAllZones` to `DeckContextType`
- `frontend/src/contexts/DeckContext.tsx` — implement `sortZone` (atomic zone array replace) and `clearAllZones` (set all zones to `[]`)
- `frontend/src/lib/utils.ts` — add `sortCardIds` pure function with full sort logic
- `frontend/src/components/deck-builder/DeckBuilder.tsx` — add sort handler, clear dialog state, pass `cardsMap` + `onSort` to DeckZone, render Clear button + AlertDialog
- `frontend/src/components/deck-builder/DeckZone.tsx` — add Sort button in header, accept `onSort` + `sorting` props

### Files to Create

- `frontend/src/__tests__/DeckSortClear.test.tsx` — NEW (sort and clear tests)

### Files NOT to Touch

- `frontend/src/App.tsx`
- `frontend/src/components/card-search/`
- `frontend/src/components/card-info/`
- `frontend/src/components/deck-builder/DeckSlot.tsx`
- `frontend/src/components/deck-builder/DeckSlotContextMenu.tsx`
- `frontend/src/components/ui/` (except maybe Button if needed — but it's already available)
- `frontend/src/hooks/`
- `frontend/src/types/`
- `frontend/src/lib/api.ts`
- `backend/`

### References

- Sort/clear ACs from epics: `_bmad-output/planning-artifacts/epics.md:438-477`
- Sort order definition (FR-8): `_bmad-output/planning-artifacts/epics.md:448-452`
- Sort/Clear UX behavioral specs: `_bmad-output/planning-artifacts/ux-designs/ux-yugioh-deck-builder-2026-06-03/EXPERIENCE.md:67-68`
- Sort flow description: `_bmad-output/planning-artifacts/ux-designs/ux-yugioh-deck-builder-2026-06-03/EXPERIENCE.md:185-193`
- Clear flow description: `_bmad-output/planning-artifacts/ux-designs/ux-yugioh-deck-builder-2026-06-03/EXPERIENCE.md:195-201`
- Sort/Clear button styling: `_bmad-output/planning-artifacts/ux-designs/ux-yugioh-deck-builder-2026-06-03/DESIGN.md:168-169`
- Card type (frameType, level, atk, def, race, name): `frontend/src/types/card.ts`
- Deck/Decklist/ZONE_TO_KEY types: `frontend/src/types/deck.ts`
- DeckContext type interface: `frontend/src/contexts/deckContextValue.ts`
- DeckContext implementation: `frontend/src/contexts/DeckContext.tsx`
- DeckBuilder current implementation: `frontend/src/components/deck-builder/DeckBuilder.tsx`
- DeckZone current implementation: `frontend/src/components/deck-builder/DeckZone.tsx`
- AlertDialog component: `frontend/src/components/ui/alert-dialog.tsx`
- Existing utils.ts (cn helper): `frontend/src/lib/utils.ts`
- Previous story 2.4 patterns and review findings: `_bmad-output/implementation-artifacts/2-4-drag-and-drop-and-right-click-card-management.md`
- DeckBuilder test patterns: `frontend/src/__tests__/DeckBuilder.test.tsx`

## Review Findings

- [ ] [Review][Patch] Remove `setTimeout` pattern in `handleSortZone` — stale closure captures `deck`/`activeDeckId`/`cardsMap` from wrong render; no cleanup on unmount; multi-zone sort loading state conflicts. Perform sort synchronously (loading state not needed for <500ms sort, satisfying AC 2). [`DeckBuilder.tsx:116`]
- [ ] [Review][Patch] `compareNullableDesc` only checks `=== null` — `undefined` values produce `NaN` sort behavior. Use `== null` to catch both. [`frontend/src/lib/utils.ts:27`]
- [ ] [Review][Patch] Use `Object.hasOwn(FRAME_TYPE_PRIORITY, frameType)` instead of `in` operator to avoid prototype chain false positives. [`frontend/src/lib/utils.ts:19`]
- [ ] [Review][Patch] `sortZone` stores `sortedIds` by reference — add defensive copy `[...sortedIds]` for future caller safety. [`frontend/src/contexts/DeckContext.tsx:137`]
- [ ] [Review][Patch] `localeCompare` without explicit locale — non-deterministic sort across browser/OS locales. Use `.localeCompare(b, "en")`. [`frontend/src/lib/utils.ts:23`]
- [ ] [Review][Patch] Clear dialog title says "Clear this deck?" — UX spec says "Clear all cards from this deck?". Update to match. [`DeckBuilder.tsx:175`]

- [x] [Review][Defer] Clear can confirm against wrong deck if user switches decks while dialog open — deferred, pre-existing dialog pattern, scope-limited fix
- [x] [Review][Defer] Case-sensitive frameType check could fail on API casing variance — deferred, API contract assumption, no evidence of mismatch
- [x] [Review][Defer] Sort button not disabled during active drag — deferred, enhancement, low severity

## Dev Agent Record

### Agent Model Used

big-pickle (opencode/big-pickle)

### Debug Log References

### Completion Notes List

- Added `sortZone` and `clearAllZones` to DeckContextType interface (deckContextValue.ts) and DeckContext implementation (DeckContext.tsx)
- Created `sortCardIds` pure utility function in utils.ts with full monster/spell/trap/other sort logic per AC 1
- Added Sort button per zone in DeckZone.tsx with disabled state when sorting or zone empty
- Added Clear button with AlertDialog confirmation in DeckBuilder.tsx
- Wired sort handler through DeckBuilder.handleSortZone with setTimeout for loading state
- Updated existing DeckBuilder.test.tsx mock to include new context methods
- Created DeckSortClear.test.tsx with 15 tests: 8 pure function sort tests + 7 integration tests for sort/clear UI and behavior
- All 49 tests pass (34 existing + 15 new), lint clean, tsc + vite build clean

### File List

- `frontend/src/contexts/deckContextValue.ts` — MODIFIED (added sortZone, clearAllZones signatures)
- `frontend/src/contexts/DeckContext.tsx` — MODIFIED (implemented sortZone, clearAllZones)
- `frontend/src/lib/utils.ts` — MODIFIED (added sortCardIds)
- `frontend/src/components/deck-builder/DeckZone.tsx` — MODIFIED (added Sort button, onSort/sorting props)
- `frontend/src/components/deck-builder/DeckBuilder.tsx` — MODIFIED (added Clear button, AlertDialog, sort handler, sort props)
- `frontend/src/__tests__/DeckBuilder.test.tsx` — MODIFIED (added sortZone, clearAllZones to mock)
- `frontend/src/__tests__/DeckSortClear.test.tsx` — NEW (sort and clear tests)
