---
baseline_commit: NO_VCS
---

# Story 2.3: Deck Builder Layout and Zone Grids

Status: done

## Story

As a Yu-Gi-Oh! player,
I want to see my deck's cards organized into Main, Extra, and Side zones,
so that I can visually understand my deck composition at a glance.

## Acceptance Criteria

1. **Given** a deck is open in Deck Builder view, **When** the middle panel renders, **Then** three zones are stacked vertically with `gap-4`: Main Deck, Extra Deck, Side Deck, **And** a breadcrumb/label at the top shows the deck name (e.g., "Deck: Dragon Beatdown").

2. **Given** the Main Deck zone is rendered, **When** no cards are in the deck, **Then** the zone header shows "Main Deck (0/60)" **And** a 6×10 grid of 60 empty Deck Slot components is displayed.

3. **Given** the Extra Deck zone is rendered, **When** no cards are in the deck, **Then** the zone header shows "Extra Deck (0/15)" **And** a grid with 10 slots in the first row and 5 in the second row is displayed (15 total).

4. **Given** the Side Deck zone is rendered, **When** no cards are in the deck, **Then** the zone header shows "Side Deck (0/15)" **And** a grid with 10 slots in the first row and 5 in the second row is displayed (15 total).

5. **Given** an empty Deck Slot, **When** no card occupies it, **Then** the slot shows a dashed border, muted background, and "—" placeholder text, **And** the slot is styled as `h-14 w-full rounded-sm bg-muted border border-dashed`.

6. **Given** a Deck Slot contains a card, **When** the slot renders, **Then** it displays the card name (truncated if long) and ATK/DEF text if applicable (Monster cards), **And** the slot has a solid border and filled background.

7. **Given** a Monster card in a slot, **When** it has a frameType, **Then** a thin left-border color indicator is shown: Spell = green tint (`border-l-2 border-l-green-500`), Trap = purple tint (`border-l-2 border-l-purple-500`), Monster = default (no tint).

8. **Given** a zone has cards, **When** the zone header renders, **Then** the count updates in real-time (e.g., "Main Deck (23/60)") **And** each zone has a tinted background: Main = `bg-muted`, Extra = `bg-blue-50/50 dark:bg-blue-950/20`, Side = `bg-orange-50/50 dark:bg-orange-950/20`.

9. **Given** the deck is loading, **When** data has not yet arrived, **Then** zone areas show Skeleton placeholders matching zone dimensions.

10. **Given** a user hovers over an occupied slot, **When** the mouse enters the slot, **Then** the Card Info panel (left) updates with that card's image and full data, **And** the slot gets a `ring-1 ring-primary` highlight.

11. **Given** a user hovers over an empty slot, **When** the mouse enters the slot, **Then** the Card Info panel shows the empty placeholder state, **And** the slot gets a subtle hover highlight.

## Tasks / Subtasks

- [x] Create DeckBuilder component (AC: 1, 9)
  - [x] Create `frontend/src/components/deck-builder/DeckBuilder.tsx`.
  - [x] On mount, read `activeDeckId` from `useDeck()`, find the deck from `decks` array.
  - [x] Fetch card data for all card IDs in the deck (see Dev Notes for batch endpoint approach).
  - [x] Show a breadcrumb header: "Deck: {deck.name}" at the top.
  - [x] Render three `<DeckZone>` components stacked with `gap-4`.
  - [x] Pass structured slot data (card or null per slot) to each zone.
  - [x] While card data is loading, show Skeleton placeholders (3 skeletons matching zone height).
  - [x] Pass `setHoveredCard` from `useCardInfo()` down to slot level.

- [x] Create DeckZone component (AC: 2, 3, 4, 8)
  - [x] Create `frontend/src/components/deck-builder/DeckZone.tsx`.
  - [x] Props: `name: string`, `slots: (Card | null)[]`, `maxCount: number`, `zoneType: 'main' | 'extra' | 'side'`, `onSlotHover: (card: Card | null) => void`.
  - [x] Header: zone name + count badge e.g. "Main Deck (23/60)" — uses `font-semibold text-sm`.
  - [x] Tinted background per zoneType: main = `bg-muted/50`, extra = `bg-blue-50/50 dark:bg-blue-950/20`, side = `bg-orange-50/50 dark:bg-orange-950/20`.
  - [x] Container: `border-2 border-dashed rounded-md p-2`.
  - [x] Grid layout: Main = `grid grid-cols-10 gap-1` (10 cols = 6 rows of 10), Extra/Side = first 10 in a row, then 5 (use flex wrap or two explicit rows).
  - [x] Render a `DeckSlot` for each position.
  - [x] Empty slots beyond the current decklist length still render (full grid of maxCount).

- [x] Create DeckSlot component (AC: 5, 6, 7, 10, 11)
  - [x] Create `frontend/src/components/deck-builder/DeckSlot.tsx`.
  - [x] Props: `card: Card | null`, `onHover: (card: Card | null) => void`.
  - [x] Empty slot: `h-14 w-full rounded-sm bg-muted border border-dashed text-muted-foreground flex items-center justify-center text-xs` with "—" content.
  - [x] Occupied slot: `h-14 w-full rounded-sm bg-card border text-sm flex flex-col justify-center px-2 overflow-hidden`.
  - [x] Inside occupied slot: card name (truncate with `truncate` class), ATK/DEF text below in `text-xs text-muted-foreground font-mono` (only for Monster cards — check `frameType !== "spell" && frameType !== "trap"`).
  - [x] FrameType left-border: if `frameType === "spell"` → `border-l-2 border-l-green-500`, if `frameType === "trap"` → `border-l-2 border-l-purple-500`, else no border-l.
  - [x] On `onMouseEnter`: call `onHover(card)`. On `onMouseLeave`: call `onHover(null)`.
  - [x] Occupied slot hover: `hover:ring-1 hover:ring-primary` via Tailwind classes.
  - [x] Empty slot hover: `hover:bg-accent/50` for subtle highlight.

- [x] Update MiddlePanel to render DeckBuilder (AC: 1)
  - [x] In `frontend/src/components/layout/MiddlePanel.tsx`, when `view === "builder"`, render `<DeckBuilder />` instead of the placeholder text.

- [x] Add batch card fetch API function (AC: all)
  - [x] Add `fetchCardsByIds(ids: number[]): Promise<ApiResponse<Card[]>>` to `frontend/src/lib/api.ts`.
  - [x] Call `GET /api/cards/batch?ids=1,2,3` (batch query param).
  - [x] Update the backend's `routes/cards.py` to add a `GET /api/cards/batch` endpoint that accepts `?ids=1,2,3` and returns matching cards from the cached CSV.
  - [x] Map IDs to cards on the backend using the in-memory CSV index (use a dict for O(1) lookup by card ID).

- [x] Frontend component tests
  - [x] Create `frontend/src/__tests__/DeckBuilder.test.tsx` using Vitest + @testing-library/react.
  - [x] Mock `lib/api.ts` and `DeckContext`.
  - [x] Test: DeckBuilder shows deck name breadcrumb.
  - [x] Test: all three zones render with correct headers and max counts.
  - [x] Test: empty slots show "—" placeholder.
  - [x] Test: occupied slots show card name.
  - [x] Test: slot hover calls setHoveredCard with the card.
  - [x] Test: frameType left-border classes applied correctly.

## Dev Notes

### Current State to Preserve

- `frontend/src/components/layout/MiddlePanel.tsx` already conditionally renders based on `view` from `useDeck()`. Replace the builder placeholder `<p>Deck Builder — coming soon</p>` with `<DeckBuilder />`.
- `frontend/src/contexts/DeckContext.tsx` has `activeDeckId`, `decks`, `setActiveDeck`, `setView` — ready to consume.
- `frontend/src/contexts/CardInfoContext.tsx` has `setHoveredCard(card: Card | null)` — ready to consume.
- `frontend/src/types/card.ts` defines `Card` with all fields (`id`, `name`, `type`, `frameType`, `description`, `level`, `atk`, `def`, `race`, `attribute`, `archetype`).
- `frontend/src/lib/api.ts` already has `apiGet<T>(path)` — add `fetchCardsByIds` using it.
- Existing UI primitives: `Button`, `Input`, `Skeleton` in `components/ui/`.
- `Card` type uses `atk`, `def` (lowercase), `frameType` — use these directly in slot display.

### Card Data Resolution Strategy

The deck stores card IDs (`number[]`). To display card names/ATK/DEF in slots, the frontend needs card data. Options:

**Approach: Add batch endpoint (RECOMMENDED):**
- Add `GET /api/cards/batch?ids=1,2,3` to `backend/routes/cards.py`.
- Backend looks up each ID from the in-memory cached CSV (use a dict `{id: Card}`). Pipeline is O(n) where n = number of requested IDs.
- Frontend calls once when opening a deck, caches the result in component state.
- If the deck is large (60 cards), this is a single request vs 60 individual requests.

**Backend implementation notes:**
- The `card_service.py` should already load all cards into a list on startup. Convert to a dict keyed by card ID for O(1) lookup.
- The batch endpoint parses `?ids=1,2,3`, splits by comma, maps to ints, looks up each, returns `{data: Card[]}`.
- Cards not found are silently omitted from the response (the frontend shows "Unknown" for missing IDs — handle gracefully).

### Component Tree

```
MiddlePanel (view === "builder")
 └── DeckBuilder
      ├── breadcrumb "Deck: Dragon Beatdown"
      ├── DeckZone (Main, maxCount=60, zoneType="main")
      │    ├── header "Main Deck (0/60)"
      │    └── grid 10 cols × 6 rows of DeckSlot
      ├── DeckZone (Extra, maxCount=15, zoneType="extra")
      │    ├── header "Extra Deck (0/15)"
      │    └── grid 10 cols (row 1) + 5 cols (row 2) of DeckSlot
      └── DeckZone (Side, maxCount=15, zoneType="side")
           ├── header "Side Deck (0/15)"
           └── grid 10 cols (row 1) + 5 cols (row 2) of DeckSlot
```

### State Flow

```
DeckBuilder mounts
  → reads activeDeckId from DeckContext
  → finds deck from decks array
  → collects all card IDs from all 3 zones
  → calls fetchCardsByIds(ids) → resolves Card[]
  → builds slots array per zone: (Card | null)[] of length maxCount
  → renders zones with slot data
  → on hover: calls setHoveredCard(card) → CardInfoContext updates left panel
```

### Grid Layout

**Main Deck (60 slots):** Use `grid grid-cols-10 gap-1` — creates exactly 6 rows of 10 automatically.
**Extra / Side Deck (15 slots):** Use `grid grid-cols-10 gap-1` — fills first 10 in row 1, remaining 5 wrap to row 2 automatically. This matches the spec (10 in first row, 5 in second).

### Zone Background Colors

| Zone | Light | Dark | Tailwind |
|------|-------|------|----------|
| Main | #F1F3F5 | #343434 | `bg-muted/50` (already tokens) |
| Extra | #E8F0FE | #2A3A5C | `bg-blue-50/50 dark:bg-blue-950/20` |
| Side | #FFF3E0 | #3D3528 | `bg-orange-50/50 dark:bg-orange-950/20` |

### Zone Header Format

"Main Deck (23/60)" — count is number of slots with non-null card. Use `filter(Boolean).length`.

### FrameType Color Rules

| frameType | Visual |
|-----------|--------|
| `"spell"` | `border-l-2 border-l-green-500` |
| `"trap"` | `border-l-2 border-l-purple-500` |
| everything else (normal, effect, ritual, fusion, synchro, xyz, link, etc.) | No border |

### Empty Slots

Always render `maxCount` slots per zone. The first `N` slots are filled with card data (where N = decklist array length), remaining slots are empty. This keeps the grid consistent regardless of how many cards are in the deck.

### Data Contracts

```typescript
interface DeckZoneProps {
  name: string           // "Main Deck"
  slots: (Card | null)[] // length = maxCount, first N filled
  maxCount: number       // 60 | 15
  zoneType: "main" | "extra" | "side"
  onSlotHover: (card: Card | null) => void
}

interface DeckSlotProps {
  card: Card | null
  onHover: (card: Card | null) => void
}
```

Backend `GET /api/cards/batch?ids=1,2,3` returns:
```json
{"data": [{"id": 1, "name": "Blue-Eyes White Dragon", ...}], "error": null}
```

### Files to Create

- `frontend/src/components/deck-builder/DeckBuilder.tsx` — NEW
- `frontend/src/components/deck-builder/DeckZone.tsx` — NEW
- `frontend/src/components/deck-builder/DeckSlot.tsx` — NEW
- `frontend/src/__tests__/DeckBuilder.test.tsx` — NEW

### Files to Modify

- `frontend/src/components/layout/MiddlePanel.tsx` — replace builder placeholder with `<DeckBuilder />`
- `frontend/src/lib/api.ts` — add `fetchCardsByIds(ids: number[])`
- `backend/routes/cards.py` — add `GET /api/cards/batch` endpoint
- `backend/services/card_service.py` — add batch lookup method (dict-based O(1))

### Do NOT Touch

- `frontend/src/contexts/DeckContext.tsx` — already works, no changes needed
- `frontend/src/contexts/CardInfoContext.tsx` — already works
- `frontend/src/contexts/SearchContext.tsx` / `searchContextValue.ts` — untouched
- `frontend/src/components/card-search/` — untouched
- `frontend/src/components/card-info/` — untouched
- `frontend/src/components/deck-library/` — untouched
- `frontend/src/components/ui/alert-dialog.tsx` — untouched (used by later stories)
- `frontend/src/types/` — untouched
- `backend/routes/decks.py` — untouched
- `backend/services/deck_service.py` — untouched
- `backend/models/` — untouched
- `db/` — untouched

### Testing Standards

- Vitest + @testing-library/react for frontend.
- Mock `lib/api.ts` using `vi.mock` — do not make real HTTP calls.
- Mock `useDeck()` return value for controlled test state.
- Test behavior: rendering states, hover interactions, zone counts, frameType styling.
- Run `npm run build` and `npm run lint` from `frontend/` after implementation.
- Run backend tests with `pytest` from `backend/`.

### References

- Story 2.3 requirements and ACs: `_bmad-output/planning-artifacts/epics.md:311-375`
- Deck Slot component design: `_bmad-output/planning-artifacts/ux-designs/ux-yugioh-deck-builder-2026-06-03/DESIGN.md:158`
- Deck Zone component design: `_bmad-output/planning-artifacts/ux-designs/ux-yugioh-deck-builder-2026-06-03/DESIGN.md:159`
- Zone colors and tokens: `_bmad-output/planning-artifacts/ux-designs/ux-yugioh-deck-builder-2026-06-03/DESIGN.md:101-107`
- Experience flows for builder zone states: `_bmad-output/planning-artifacts/ux-designs/ux-yugioh-deck-builder-2026-06-03/EXPERIENCE.md:61-62,72-92`
- Architecture project structure: `_bmad-output/planning-artifacts/architecture.md:196-236`
- CardInfoContext existing pattern: `frontend/src/contexts/CardInfoContext.tsx`
- DeckContext existing pattern: `frontend/src/contexts/DeckContext.tsx`
- Existing MiddlePanel with view toggle: `frontend/src/components/layout/MiddlePanel.tsx`
- Card type definition: `frontend/src/types/card.ts`

## Dev Agent Record

### Agent Model Used

big-pickle (opencode/big-pickle)

### Debug Log References

### Completion Notes List

- Created DeckSlot component with empty/occupied states, frameType left-border colors, hover behavior
- Created DeckZone component with tinted backgrounds per zone type, grid layout, live count display
- Created DeckBuilder component with batch card fetch, skeleton loading state, breadcrumb header
- Updated MiddlePanel to render DeckBuilder when view === "builder"
- Added fetchCardsByIds to frontend api.ts
- Added GET /api/cards/batch endpoint to backend routes/cards.py with dict-based O(1) lookup
- Added get_cards_by_ids to backend card_service.py with _card_cache_dict
- All 16 tests pass (10 existing + 6 new), build succeeds, lint clean

### File List

- `frontend/src/components/deck-builder/DeckBuilder.tsx` — NEW
- `frontend/src/components/deck-builder/DeckZone.tsx` — NEW
- `frontend/src/components/deck-builder/DeckSlot.tsx` — NEW
- `frontend/src/__tests__/DeckBuilder.test.tsx` — NEW
- `frontend/src/components/layout/MiddlePanel.tsx` — MODIFIED
- `frontend/src/lib/api.ts` — MODIFIED
- `backend/routes/cards.py` — MODIFIED
- `backend/services/card_service.py` — MODIFIED

### Senior Developer Review (AI)

**Review Date:** 2026-06-03

**Review Outcome:** Changes Requested

**Summary:** 12 patch findings, 4 deferred, 7 dismissed. All 11 acceptance criteria satisfied — no spec violations. Findings focus on correctness (race hazard), robustness (undefined guards, edge cases), and test quality (fragile selectors, loose assertions).

**Action Items:**

- [x] [Review][Patch] Race hazard in useEffect — no cleanup on unmount/dependency change [DeckBuilder.tsx:17-37]
- [x] [Review][Patch] zoneBg[zoneType] returns `undefined` for unknown zoneType [DeckZone.tsx:20]
- [x] [Review][Patch] buildSlots silently truncates cards beyond maxCount [DeckBuilder.tsx:54-58]
- [x] [Review][Patch] Test selector uses fragile className match [DeckBuilder.test.tsx:80-81]
- [x] [Review][Patch] Monster identification uses negation instead of positive allowlist [DeckSlot.tsx:18]
- [x] [Review][Patch] Link monsters show "DEF/?" when def is null [DeckSlot.tsx:31]
- [x] [Review][Patch] Empty ID list triggers unnecessary API call [DeckBuilder.tsx:23-24]
- [x] [Review][Patch] Placeholder count assertion is imprecise [DeckBuilder.test.tsx:71]
- [x] [Review][Patch] No null/undefined guard on ids parameter [api.ts:61]
- [x] [Review][Patch] Duplicate IDs in batch query produce duplicate results [cards.py:18]
- [x] [Review][Patch] Cache failure poisons _card_cache_dict permanently [card_service.py:31]
- [x] [Review][Patch] `as any` cast bypasses type safety in tests [DeckBuilder.test.tsx]

- [x] [Review][Defer] deck not found returns null silently — pre-existing pattern
- [x] [Review][Defer] No loading state for initial deck data — pre-existing, handled by useDeck
- [x] [Review][Defer] No fallback for unknown view values — pre-existing pattern
- [x] [Review][Defer] Stale card cache never invalidates — pre-existing design (list cache was also unbounded)

**Dismissed:** 7 findings (noise, false positives, or handled by type system/architecture)
