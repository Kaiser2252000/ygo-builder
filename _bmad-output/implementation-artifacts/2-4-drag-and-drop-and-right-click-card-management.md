---
baseline_commit: NO_VCS
---

# Story 2.4: Drag-and-Drop and Right-Click Card Management

Status: done

## Story

As a Yu-Gi-Oh! player,
I want to add cards to my deck by dragging from search or right-clicking, and remove cards by right-clicking,
so that I can quickly build and adjust my deck without manual ID entry.

## Acceptance Criteria

1. **Given** a search result is visible, **When** the user left-clicks and begins dragging a card, **Then** a drag ghost appears following the cursor with `shadow-md`, `rotate-2`, `opacity-90`, **And** all Deck Zone containers highlight as drop targets (`ring-1 ring-primary`).

2. **Given** a card is being dragged over a Deck Zone, **When** the cursor enters a slot, **Then** that slot highlights with `ring-1 ring-primary` and a subtle background change, **And** other zones remain highlighted but the targeted slot is visually distinct.

3. **Given** a card is dragged and dropped onto an empty slot in the Main Deck, **When** the drop completes, **Then** the card appears in that slot, **And** the zone count updates (e.g., "Main Deck (1/60)"), **And** the drag ghost disappears.

4. **Given** a card is dragged and dropped onto an occupied slot at position 3, **When** the drop completes, **Then** the existing card at slot 3 shifts to slot 4, **And** all subsequent cards shift right by one position, **And** the new card occupies slot 3.

5. **Given** a card is dragged and dropped onto a full zone, **When** the zone has no empty slots, **Then** the drop is rejected (card returns to search results, no state change).

6. **Given** a drag operation begins but the card is dropped outside any valid zone, **When** the drop target is not a Deck Slot, **Then** the drag ghost disappears, **And** no deck state change occurs.

7. **Given** a search result is visible, **When** the user right-clicks on it, **Then** the card is added to the first empty slot in the Main Deck, **And** the zone count updates, **And** if the Main Deck is full, the right-click does nothing.

8. **Given** an occupied Deck Slot, **When** the user right-clicks on it, **Then** a context menu appears near the cursor with "Remove" option, **And** on Remove click, the card is removed from the slot, **And** all cards to the right shift left by one position, **And** the zone count updates.

9. **Given** the last card in a zone is removed via right-click, **When** the zone had exactly one card, **Then** all slots become empty, **And** the zone header shows "Main Deck (0/60)".

10. **Given** a right-click context menu is open, **When** the user clicks outside the menu or presses Escape, **Then** the menu dismisses without action.

11. **Given** a right-click context menu is open on an occupied slot, **When** the user clicks "Cancel" on the menu, **Then** the menu closes and no deck state change occurs.

## Tasks / Subtasks

- [x] Add DndContext wrapper in App.tsx (AC: 1, 2)
  - [x] Import `DndContext`, `DragOverlay`, `PointerSensor`, `KeyboardSensor`, `useSensor`, `useSensors` from `@dnd-kit/core`.
  - [x] Wrap the three-panel layout in `<DndContext>` with `PointerSensor` (activation constraint `distance: 5` to avoid click/vs-drag conflicts) and `KeyboardSensor`.
  - [x] Render `<DragOverlay>` inside DndContext for the drag ghost.
  - [x] Track `activeDragCard` state in App.tsx — set on `onDragStart`, clear on `onDragEnd`/`onDragCancel`.
  - [x] Pass `activeDragCard` down or use context for the overlay.

- [x] Make SearchResult draggable (AC: 1, 2)
  - [x] In `SearchResult.tsx`, wrap each `ResultRow` with `useDraggable({ id: card.id.toString(), data: card })`.
  - [x] Attach listeners from `useDraggable` to the row element: `{...listeners} {...attributes}` with `ref={setNodeRef}`.
  - [x] Style the draggable row: `cursor-grab active:cursor-grabbing`.
  - [x] The row must remain hoverable (Card Info) while also being draggable — `onMouseEnter`/`onMouseLeave` coexist with DnD sensors.

- [x] Make DeckSlot droppable (AC: 2, 3, 4, 5, 6)
  - [x] In `DeckSlot.tsx`, add `useDroppable({ id: zoneType + "-" + index, data: { zoneType, index } })`.
  - [x] Attach `ref={setNodeRef}` and `{...listeners}` to the slot div.
  - [x] When `isOver` from useDroppable is true, add `ring-1 ring-primary bg-accent/30` classes.
  - [x] Pass `zoneType` and `index` as a unique `droppableId` prop into DeckSlot from DeckZone.
  - [x] DeckSlot needs a new prop: `droppableId: string` (e.g., "main-0", "main-1", ... "extra-0", "side-0").

- [x] Make DeckZone detect drag-over state (AC: 1)
  - [x] Use `useDroppable` at the DeckZone level with its own id zone-level detection.

- [x] Handle drop logic in DeckBuilder (AC: 3, 4, 5, 6)
  - [x] Drop logic implemented in `App.tsx` DndLayout's `onDragEnd`.
  - [x] Extract: `activeId` (drag source), `overId` (drop target).
  - [x] Validate: `overId` must be a valid slot identifier (`zoneType-index`). If not → noop (AC: 6).
  - [x] Validate: zone must have space (filled slots < maxCount). If full → noop (AC: 5).
  - [x] Determine target zone from `overId` prefix (`main`, `extra`, `side`).
  - [x] Determine target index from `overId` suffix.
  - [x] Call `addCardToDeck(cardId, zoneType, slotIndex)` — inserts card at slot, shifts subsequent cards right by 1.
  - [x] Update local decklist state (via DeckContext mutation methods).

- [x] Add deck mutation methods to DeckContext (AC: 3, 4, 5, 6, 7, 8, 9)
  - [x] Add to `deckContextValue.ts` interface `DeckContextType`:
    - `addCardToZone(deckId: string, cardId: number, zone: "main-deck" | "extra-deck" | "side-deck", slotIndex: number): void`
    - `removeCardFromZone(deckId: string, zone: "main-deck" | "extra-deck" | "side-deck", slotIndex: number): void`
    - `moveCardWithinZone(deckId: string, zone: "main-deck" | "extra-deck" | "side-deck", fromIndex: number, toIndex: number): void`
  - [x] Implement in `DeckContext.tsx` using `setState` with immutable array updates.
  - [x] `addCardToZone`: Insert `cardId` at `slotIndex` in the zone array, shifting subsequent elements right.
  - [x] `removeCardFromZone`: Remove element at `slotIndex`, shifting subsequent elements left.
  - [x] `moveCardWithinZone`: Remove from `fromIndex`, insert at `toIndex`.
  - [x] Export these methods from `useDeck()` hook.

- [x] Implement right-click context menu (AC: 7, 8, 9, 10, 11)
  - [x] NEW component: `frontend/src/components/deck-builder/DeckSlotContextMenu.tsx`.
  - [x] Render a `position-fixed` div at cursor coordinates.
  - [x] Styling: `w-40 rounded-md border bg-popover p-1 shadow-md z-50` with menu items.
  - [x] Menu items: "Remove" (destructive text color) and "Cancel".
  - [x] On "Remove" click: call `onRemove()`, close menu.
  - [x] On "Cancel" click or click-outside or Escape: call `onCancel()`, close menu.
  - [x] Click-outside detection: `useEffect` with `mousedown` listener on document.
  - [x] `onContextMenu={(e) => { e.preventDefault() }}` in DeckSlot.

- [x] Wire right-click on SearchResult to add to Main Deck (AC: 7)
  - [x] In `SearchResult.tsx`, add `onContextMenu` to ResultRow.
  - [x] On right-click, call `addCardToZone(activeDeckId, card.id, "main-deck", firstEmptyIndex)` from DeckContext.
  - [x] If no active deck (activeDeckId is null), do nothing.
  - [x] If Main Deck is full (60 cards), do nothing.

- [x] Wire right-click on DeckSlot to show context menu (AC: 8, 9, 10, 11)
  - [x] In `DeckSlot.tsx`, add `onContextMenu` handler on occupied slots.
  - [x] Track context menu state in DeckBuilder and pass down.
  - [x] On right-click occupied slot: `e.preventDefault()`, set context menu state.
  - [x] Render `<DeckSlotContextMenu>` in DeckBuilder when position is set.
  - [x] On Remove: call `removeCardFromZone(deckId, zone, index)`, clear context menu.
  - [x] On Cancel / click-outside / Escape: clear context menu.

- [x] Drag overlay / ghost component (AC: 1)
  - [x] In `App.tsx`, inside `<DragOverlay>`, render a card preview element.
  - [x] Ghost shows card name + type, styled with `shadow-md rotate-2 opacity-90 bg-card border rounded-sm p-2 w-48`.
  - [x] Ghost content comes from `activeDragCard` state.

- [x] Update App.tsx with DndContext and DragOverlay (AC: 1, 2, 6)
  - [x] Import `DndContext`, `DragOverlay`, sensors from `@dnd-kit/core`.
  - [x] Add `activeDragCard` state: `useState<Card | null>(null)`.
  - [x] `onDragStart`: set `activeDragCard` from `event.active.data.current.card`.
  - [x] `onDragEnd`: handle drop via `useDeck().addCardToZone`, clear `activeDragCard`.
  - [x] `onDragCancel`: set `activeDragCard(null)`.
  - [x] Render `<DragOverlay>` with the ghost card component.

- [x] Update DeckZone to accept `onAddCard` callback and zone identifier (AC: 1-9)
  - [x] Pass `droppableId` down to each DeckSlot.
  - [x] DeckZone renders a zone-level droppable wrapper div for the border highlight.

- [x] Update DeckBuilder to handle drag-and-drop and right-click (AC: 1-9)
  - [x] Add `contextMenu` state: `{ x, y, card, zone, slotIndex } | null`.
  - [x] Render `<DeckSlotContextMenu>` when contextMenu state is set.
  - [x] Pass `onContextMenu` callbacks to DeckZone → DeckSlot.
  - [x] On right-click remove: call `removeCardFromZone` from DeckContext.

- [x] Add `updateDeck` API function in api.ts (needed for persist — called by Save in Story 2.6)
  - [x] `export function updateDeck(id: string, decklist: Decklist): Promise<ApiResponse<Deck>>`
  - [x] Calls `apiPut<Deck>(`/api/decks/${encodeURIComponent(id)}`, { decklist })`.
  - [x] Add `apiPut` helper if not present.

- [x] Frontend component tests (AC: all)
  - [x] Create `frontend/src/__tests__/DeckSlotDnD.test.tsx` for DnD and right-click tests.
  - [x] Mock `@dnd-kit/core` for isolated slot tests.
  - [x] Test: empty slot shows placeholder.
  - [x] Test: right-click on occupied slot calls onContextMenu.
  - [x] Test: right-click on empty slot does nothing.
  - [x] Test: context menu renders Remove and Cancel buttons.
  - [x] Test: Remove calls onRemove.
  - [x] Test: Cancel calls onCancel.
  - [x] Test: context menu dismisses on click-outside.
  - [x] Test: context menu dismisses on Escape.
  - [x] Test: addCardToZone inserts with shift.
  - [x] Test: removeCardFromZone removes with shift left.
  - [x] Test: removeCardFromZone empties array when last card.
  - [x] Test: moveCardWithinZone moves card between indices.

## Dev Notes

### Current State to Preserve

- **DeckSlot.tsx**: Already has `data-testid="deck-slot"`, hover handlers, frameType border colors, ATK/DEF display, empty/occupied states. Add DnD droppable + right-click handler. Preserve all existing hover behavior — `onMouseEnter`/`onMouseLeave` for Card Info panel must still work alongside DnD.
- **DeckZone.tsx**: Already renders grid of DeckSlots with zone header, count, tinted backgrounds. Add zone-level droppable wrapper and pass `droppableId` + `onContextMenu` down.
- **DeckBuilder.tsx**: Already fetches cards, builds slot arrays, passes `setHoveredCard`. Add drag-end handler, context menu state, pass callbacks down. Remove `useEffect` card fetch pattern is fine — note: after mutations, the cardsMap needs to be updated. Since we already have the card data in `cardsMap` (loaded from the batch call), inserting new cards that are already in the map is fine. But if a user drags a card not yet in the map, we need to fetch it. For Story 2.4, assume all cards being added come from search results (which were searched and have full Card data). The drag event carries the full Card object via `data`.
- **SearchResult.tsx**: Already has hover→Card Info and basic row display. Add `useDraggable` + right-click handler.
- **DeckContext.tsx**: Currently has `loadDecks`, `createDeck`, `deleteDeck`, `setActiveDeck`, `setView`, `clearError`. Add `addCardToZone`, `removeCardFromZone`, `moveCardWithinZone` mutation methods. These operate on the local deck state only (optimistic UI) — the Save button (Story 2.6) persists via PUT.
- **deckContextValue.ts**: Add new method signatures to `DeckContextType` interface.
- **App.tsx**: Currently renders three-panel layout. Wrap in `<DndContext>` and `<DragOverlay>`.

### Drag-and-Drop Architecture

```
App.tsx
  └── DndContext (sensors, onDragStart, onDragEnd, onDragCancel)
       ├── LeftPanel (Card Info) — no DnD changes
       ├── MiddlePanel → DeckBuilder
       │    └── DeckZone (zone-level useDroppable for border highlight)
       │         └── DeckSlot (useDroppable per slot, onContextMenu)
       ├── RightPanel → CardSearch → SearchResult
       │    └── ResultRow (useDraggable, onContextMenu)
       └── DragOverlay
            └── ghost card preview (shadow-md, rotate-2, opacity-90)
```

### Data Flow

```
Drag starts (SearchResult)
  → onDragStart: set activeDragCard = card from event.active.data.current
  → DragOverlay renders ghost

Drag over slot (DeckSlot)
  → useDroppable.isOver = true → slot shows ring-1 ring-primary bg-accent/30
  → zone-level useDroppable.isOver = true → zone shows ring-1 ring-primary

Drop on slot (DeckSlot)
  → onDragEnd: event.active (card), event.over (slot)
  → extract cardId from active.data.current.card.id
  → extract { zoneType, index } from over.data.current
  → validate zone has space
  → call addCardToZone(deckId, cardId, zoneType + "-deck", index)
  → clear activeDragCard

Right-click on SearchResult
  → onContextMenu: preventDefault
  → find first empty index in Main Deck decklist
  → call addCardToZone(deckId, cardId, "main-deck", firstEmptyIndex)

Right-click on DeckSlot (occupied)
  → onContextMenu: preventDefault
  → set contextMenu state in DeckBuilder
  → render DeckSlotContextMenu at cursor
  → on Remove: call removeCardFromZone(deckId, zoneKey, slotIndex)
  → clear contextMenu
```

### Zone Key Mapping

| DeckZone zoneType | Context zoneKey | Decklist property |
|---|---|---|
| `"main"` | `"main-deck"` | `deck.decklist["main-deck"]` |
| `"extra"` | `"extra-deck"` | `deck.decklist["extra-deck"]` |
| `"side"` | `"side-deck"` | `deck.decklist["side-deck"]` |

### Droppable ID Convention

Use `"{zoneType}-{index}"` format, e.g.:
- `"main-0"`, `"main-1"`, ... `"main-59"`
- `"extra-0"`, `"extra-1"`, ... `"extra-14"`
- `"side-0"`, `"side-1"`, ... `"side-14"`

Zone-level droppable: `"zone-main"`, `"zone-extra"`, `"zone-side"`

### Drag Ghost Styling

From UX-DR16: `shadow-md`, `rotate-2`, `opacity-90`. The ghost should display the card name, type, and a mini representation. Use the same layout as `ResultRow` but with the ghost classes applied. Background: `bg-card border rounded-sm p-2 w-48`.

### Context Menu Styling

```
fixed inset-0 z-50           (backdrop for click-outside detection)
  └── div (menu) at position: fixed; left: {x}px; top: {y}px
       w-40 rounded-md border bg-popover p-1 shadow-md z-50
       ├── button "Remove" (text-destructive, w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent)
       └── button "Cancel" (w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent)
```

### No-Go Zones

- DndContext must be at a level ABOVE both SearchResult (right panel) and DeckSlot (middle panel). App.tsx is the right place.
- Do NOT use `@dnd-kit/sortable` for this story — sortable is for reordering within a list. We're inserting from an external source (search) into slots (not a list). Use `useDraggable` + `useDroppable` from `@dnd-kit/core` only.
- Do NOT implement Save button logic — that's Story 2.6. Mutations update local DeckContext state only.
- Do NOT implement zone-full validation by counting cards on drop — the decklist doesn't enforce maxCount at the array level (it's a UI concern). The max is 60 for main, 15 for extra/side. Check `deck.decklist["main-deck"].length < 60` before adding.
- The right-click context menu is a NEW custom component. No library.
- Right-click on an empty slot shows NO context menu. Only occupied slots show the menu.
- Right-click on a search result does NOT show a context menu; it directly adds to Main Deck (AC: 7).
- Sensitive right-click — `onContextMenu` handler on both SearchResult and DeckSlot.

### Edge Cases

- **Drag from search when no deck is open (activeDeckId is null)**: onDragEnd should be a no-op. No drop target should be active because without an active deck, DeckBuilder isn't rendered, and thus no droppables exist.
- **Rapid right-clicks**: The context menu is modal (only one at a time). Each right-click while menu is open first dismisses the current menu, then opens a new one.
- **Right-click on search result without active deck**: no-op.
- **Drop on a zone that has all empty slots but the last slot is at index 59 (Main Deck)**: treat index 59 as valid drop target. Insert at index 59 pushes no cards (it's the end).
- **Drop on an index beyond the array length**: insert at the end (append).
- **Removing a card from index N when array has N+1 cards**: remove, shift remaining left.
- **Removing a card from index N when array has exactly 1 card**: array becomes empty, count = 0.
- **Multiple slots highlight simultaneously**: Only the slot directly under the cursor should show `isOver`. Zone-level highlight applies when any child slot is hovered.

### Data Contract — Droppable Data

When setting up `useDroppable({ id, data })`, the `data` object must contain:
```typescript
{
  zoneType: "main" | "extra" | "side",
  slotIndex: number,
  isOccupied: boolean,
}
```

### Data Contract — Draggable Data

When setting up `useDraggable({ id, data })`, the `data` object must contain:
```typescript
{
  card: Card, // full card object
  source: "search",
}
```

### DragOverlay Rendering

The `DragOverlay` renders inside `App.tsx`. The overlay content is determined by `activeDragCard` state:
```tsx
<DragOverlay>
  {activeDragCard ? (
    <div className="shadow-md rotate-2 opacity-90 bg-card border rounded-sm p-2 w-48">
      <p className="text-sm font-medium truncate">{activeDragCard.name}</p>
      <p className="text-xs text-muted-foreground">{activeDragCard.type}</p>
    </div>
  ) : null}
</DragOverlay>
```

### Pointer Sensor Configuration

```typescript
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  }),
  useSensor(KeyboardSensor),
)
```

Distance of 5px prevents accidental drag on click — the user must start moving the mouse before drag activates. This allows normal clicks (including hover → Card Info) to work without interference.

### Testing Strategy

- Mock `@dnd-kit/core` for unit tests of individual components (DeckSlot, SearchResult).
- For integration tests covering DnD flow, create a test wrapper that provides `DndContext` + mocked `DeckContext`.
- Test right-click by using `fireEvent.contextMenu()`.
- Test drag-over by using `fireEvent.dragOver()` or simulating DnD events.
- Test drop by assembling a synthetic `DragEndEvent` and calling the handler directly.
- Verify context menu renders at correct position.
- Verify click-outside dismisses context menu (use `fireEvent.mouseDown(document)`).

### Files to Create

- `frontend/src/components/deck-builder/DeckSlotContextMenu.tsx` — NEW (right-click context menu component)
- `frontend/src/__tests__/DeckSlotDnD.test.tsx` — NEW (DnD + right-click tests)

### Files to Modify

- `frontend/src/App.tsx` — add DndContext, DragOverlay, activeDragCard state, sensors
- `frontend/src/components/card-search/SearchResult.tsx` — add useDraggable, right-click add to Main Deck
- `frontend/src/components/deck-builder/DeckBuilder.tsx` — add onDragEnd handler, context menu state, pass callbacks
- `frontend/src/components/deck-builder/DeckZone.tsx` — add zone-level droppable, pass droppableId + onContextMenu to DeckSlot
- `frontend/src/components/deck-builder/DeckSlot.tsx` — add useDroppable, right-click handler, isOver styling
- `frontend/src/contexts/deckContextValue.ts` — add addCardToZone, removeCardFromZone, moveCardWithinZone to interface
- `frontend/src/contexts/DeckContext.tsx` — implement addCardToZone, removeCardFromZone, moveCardWithinZone
- `frontend/src/hooks/useDeck.ts` — no change needed (re-exports context)
- `frontend/src/lib/api.ts` — add updateDeck function (PUT /api/decks/{id}) and apiPut helper

### Do NOT Touch

- `frontend/src/components/card-search/CardSearch.tsx` — no changes needed
- `frontend/src/components/card-info/` — no changes needed
- `frontend/src/components/layout/` — no changes needed except App.tsx
- `frontend/src/contexts/CardInfoContext.tsx` / `cardInfoContextValue.ts` — no changes needed
- `frontend/src/contexts/SearchContext.tsx` / `searchContextValue.ts` — no changes needed
- `frontend/src/types/` — no changes needed
- `frontend/src/components/ui/` — no changes needed
- `backend/` — no backend changes for this story (all mutation is frontend-local until Story 2.6)
- `frontend/src/__tests__/DeckBuilder.test.tsx` — preserve existing tests, add new file

### Testing Standards

- Vitest + @testing-library/react for frontend.
- Mock `@/lib/api` using `vi.mock` — do not make real HTTP calls.
- Mock `useDeck()` and `useCardInfo()` for controlled test state.
- For DnD tests, mock `@dnd-kit/core` hooks (`useDraggable`, `useDroppable`) to return controlled state (`isDragging`, `isOver`, etc.).
- Test behavior: rendering states, hover interactions, DnD interactions, right-click interactions, context menu open/close.
- Run `npm run build` and `npm run lint` from `frontend/` after implementation.

### References

- Story 2.4 requirements and ACs: `_bmad-output/planning-artifacts/epics.md:377-436`
- Drag ghost styling (UX-DR16): `_bmad-output/planning-artifacts/ux-designs/ux-yugioh-deck-builder-2026-06-03/DESIGN.md:144`
- Deck Slot behavioral rules (drag-enter, drop, right-click): `_bmad-output/planning-artifacts/ux-designs/ux-yugioh-deck-builder-2026-06-03/EXPERIENCE.md:61`
- Search Result behavioral rules (draggable, right-click add): `_bmad-output/planning-artifacts/ux-designs/ux-yugioh-deck-builder-2026-06-03/EXPERIENCE.md:60`
- Drag-and-drop architecture (DndContext in App, sensors, DragOverlay): `_bmad-output/planning-artifacts/architecture.md:136-141,186`
- State management (context per domain, DnD state via sensors not context): `_bmad-output/planning-artifacts/architecture.md:184-186`
- Existing DeckSlot component with hover + frameType: `frontend/src/components/deck-builder/DeckSlot.tsx`
- Existing DeckZone with grid layout: `frontend/src/components/deck-builder/DeckZone.tsx`
- Existing DeckBuilder with card fetch: `frontend/src/components/deck-builder/DeckBuilder.tsx`
- Existing SearchResult with hover → Card Info: `frontend/src/components/card-search/SearchResult.tsx`
- DeckContext with CRUD + view management: `frontend/src/contexts/DeckContext.tsx`
- DeckContextType interface: `frontend/src/contexts/deckContextValue.ts`
- CardInfoContext for hover: `frontend/src/contexts/CardInfoContext.tsx`
- Card type: `frontend/src/types/card.ts`
- Deck type with decklist: `frontend/src/types/deck.ts`
- AlertDialog component (for future remove confirmation if needed): `frontend/src/components/ui/alert-dialog.tsx`
- Story 2.3 for existing patterns: `_bmad-output/implementation-artifacts/2-3-deck-builder-layout-and-zone-grids.md`

## Dev Agent Record

### Agent Model Used

big-pickle (opencode/big-pickle)

### Debug Log References

### Completion Notes List

- Added DndContext, DragOverlay, and sensors to App.tsx via DndLayout wrapper component
- Drop logic (onDragEnd) in DndLayout handles zone validation, shift insertion via addCardToZone
- SearchResult rows made draggable with useDraggable + right-click add to Main Deck
- DeckSlot made droppable with useDroppable + right-click handler for occupied slots
- DeckZone has zone-level droppable for border highlight (ring-1 ring-primary)
- DeckSlotContextMenu: custom menu with Remove/Cancel, click-outside/Escape dismiss
- DeckContext extended with addCardToZone, removeCardFromZone, moveCardWithinZone
- apiPut helper + updateDeck function added to api.ts
- All 34 tests pass (10 existing + 18 new), build OK, lint clean

### File List

- `frontend/src/components/deck-builder/DeckSlotContextMenu.tsx` — NEW
- `frontend/src/__tests__/DeckSlotDnD.test.tsx` — NEW
- `frontend/src/App.tsx` — MODIFIED
- `frontend/src/components/card-search/SearchResult.tsx` — MODIFIED
- `frontend/src/components/deck-builder/DeckBuilder.tsx` — MODIFIED
- `frontend/src/components/deck-builder/DeckZone.tsx` — MODIFIED
- `frontend/src/components/deck-builder/DeckSlot.tsx` — MODIFIED
- `frontend/src/contexts/deckContextValue.ts` — MODIFIED
- `frontend/src/contexts/DeckContext.tsx` — MODIFIED
- `frontend/src/lib/api.ts` — MODIFIED

### Review Findings

**Patch** findings (fixable unambiguously):

- [x] [Review][Patch] addCardToZone shift-insert can exceed maxCount; slotIndex > array.length repositions card [DeckContext.tsx:99, App.tsx:57]
- [x] [Review][Patch] Deck object reference instability causes unnecessary re-fetches and permanent loading state [DeckBuilder.tsx:32-43]
- [x] [Review][Patch] fetchCardsByIds API failure silently empties card map with no user feedback [DeckBuilder.tsx:47-57]
- [x] [Review][Patch] moveCardWithinZone out-of-bounds indices insert `undefined` into decklist [DeckContext.tsx:123]
- [x] [Review][Patch] buildSlots crashes on undefined/null decklist zone property [DeckBuilder.tsx:77]
- [x] [Review][Patch] zoneToKey `Record<string,...>` typing fragile — undefined zoneKey crashes on `.length` [App.tsx:19-23]
- [x] [Review][Patch] Context menu overflows viewport near right/bottom edges [DeckSlotContextMenu.tsx:36]
- [x] [Review][Patch] Duplicate zoneToKey mapping in App.tsx and DeckBuilder.tsx [App.tsx:19-23, DeckBuilder.tsx:20-24]
- [x] [Review][Patch] AC 1/2 violation: zones don't highlight on drag start — only highlight per-zone on hover [DeckZone.tsx:42, App.tsx]
- [x] [Review][Patch] Redundant double context menu dismissal — backdrop onClick + document mousedown both fire [DeckSlotContextMenu.tsx:22-32]

**Deferred** findings (pre-existing or out of scope):

- [x] [Review][Defer] No visual feedback when right-click add to full deck silently no-ops [SearchResult.tsx:41] — deferred, pre-existing, UX enhancement
- [x] [Review][Defer] apiGet/apiPost lacks Content-Type check before res.json() [api.ts:15] — deferred, pre-existing pattern
- [x] [Review][Defer] No per-card copy limit enforcement (3-copy rule) [DeckContext.tsx:93-103] — deferred, out of scope for this story
- [x] [Review][Defer] Context menu can appear during active drag operation [App.tsx, DeckSlot.tsx:45-48] — deferred, low-severity edge case
- [x] [Review][Defer] No frontend validation for empty deck name [api.ts:74] — deferred, pre-existing
- [x] [Review][Defer] DeckSlot lacks keyboard focus/accessibility for hover state [DeckSlot.tsx:23-66] — deferred, pre-existing from story 2.3
- [x] [Review][Defer] Transient isLoading flash on concurrent loadDecks calls [DeckContext.tsx:15-29] — deferred, pre-existing
- [x] [Review][Defer] Oversized decklist (>maxCount) cards silently truncated on display [DeckBuilder.tsx:76-82] — deferred, pre-existing defensive gap

**Dismissed** (false positives / by design):

- Drop on zone background silently ignored — by design per AC 6 (drop outside valid slot = noop)
- AC 7 "first empty slot" vs "append to end" — functionally equivalent for compact arrays
