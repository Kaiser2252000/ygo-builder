---
stepsCompleted: [1, 2, 3, 4]
status: complete
inputDocuments:
  - prds/prd-yugioh-deck-builder-2026-06-03/prd.md
  - prds/prd-yugioh-deck-builder-2026-06-03/addendum.md
  - architecture.md
  - ux-designs/ux-yugioh-deck-builder-2026-06-03/DESIGN.md
  - ux-designs/ux-yugioh-deck-builder-2026-06-03/EXPERIENCE.md
---

# yugioh-deck-builder - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for yugioh-deck-builder, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Search cards by text (partial match on name, full-text on description)
FR2: Display search results (scrollable list with card name and type)
FR3: Add card to deck from search (left-drag to slot or right-click to Main Deck)
FR4: Display deck zones as grids (Main 6×10, Extra 10+5, Side 10+5)
FR5: Drag-and-drop card insertion (drop onto any slot, shift subsequent cards right)
FR6: Right-click card removal (remove card, shift subsequent cards left)
FR7: Clear deck content (button with confirmation prompt)
FR8: Sort decklist (monsters by frameType→level→ATK→DEF→name, then Spells, then Traps)
FR9: List all decks (from decks.json with name, cover, counts, Edit/Delete buttons)
FR10: Create and delete decks (UUID generation, named creation, deletion with confirmation)
FR11: Search decks by name (partial match filter on deck list)
FR12: Upload cover image (multipart upload, save to uploads/covers/, path in decks.json)
FR13: Display cover image in deck list (show uploaded image or default placeholder)
FR14: Export deck to .txt (#main, #extra, !side format with card IDs)
FR15: Import deck from .txt (parse format, validate card IDs, report errors)
FR16: Save deck (POST/PUT decklist to backend, persist to decks.json)
FR17: Display card image (case-insensitive filename match from local image folder)
FR18: Display card data (all CSV fields in Card Info panel on hover)

### Non-Functional Requirements

NFR1: Sort must complete in under 500ms for a full 60-card Main Deck (client-side in-memory)
NFR2: CSV loaded on backend start and cached in memory
NFR3: Card images served as static files from fixed local path via FastAPI
NFR4: No auth, no accounts, no cloud sync, single-user only
NFR5: API response envelope: {data, error} with error shape {code, message}
NFR6: Deck validation must enforce bounds (40-60 Main, 0-15 Extra, 0-15 Side, max 3 per card name)

### Additional Requirements

- Starter template: Vite + React + TypeScript (frontend), FastAPI from scratch (backend)
- Vite proxy: /api → localhost:8000
- FastAPI CORS: allow localhost:3000 (or localhost:5173 Vite default)
- Card image matching: case-insensitive filename match by card name
- Cover image upload via python-multipart (restrict to jpg/png/webp, max 5MB)
- Deck validation on save: Main 40-60, Extra 0-15, Side 0-15, max 3 copies per card name
- YDK import/export: #main, #extra, !side headers, card IDs as lines
- Three-panel layout with React Context per domain (DeckContext, SearchContext, CardInfoContext)
- Drag-and-drop via @dnd-kit/core (+ sortable, utilities)
- State coupling: hover updates CardInfoContext, click-add updates DeckContext
- Project structure: frontend/ and backend/ monorepo
- snake_case for backend APIs/routes, camelCase for frontend JS/TS, PascalCase for components
- Python dataclasses for models, Pydantic for request/response validation
- TypeScript strict mode, no `any`

### UX Design Requirements

UX-DR1: Implement shadcn/ui CSS variable theming system with light/dark mode tokens (background, foreground, card, muted, border, primary, accent, destructive — with zone-specific tints for Main/Extra/Side)
UX-DR2: Three-panel flex layout (Left w-72 min-w-64, Middle flex-1 min-w-[400px], Right w-80 min-w-72) with border separators
UX-DR3: App header h-12 with title + Theme Toggle dropdown (Light/Dark/System, persist to localStorage)
UX-DR4: Deck Slot component (h-14 w-full, rounded-sm, bg-muted, border) — hover→card info, drag-target, right-click→remove, empty slot shows dashed border + placeholder
UX-DR5: Deck Zone component (border-2 border-dashed, rounded-md, p-2, tinted background per zone type) — header with zone name + count badge "Main Deck (23/60)", zones stack with gap-4
UX-DR6: Deck Card (Library) component (flex gap-3 p-3 rounded-md border bg-card) — cover thumb 48x48 rounded, deck name semibold, zone counts, Edit/Delete buttons right-aligned
UX-DR7: Search Result component (flex gap-2 p-2 rounded-sm border-b) — hover updates Card Info, draggable, right-click adds to Main Deck
UX-DR8: Card Info Panel (flex flex-col gap-3 p-4) — card image max w-full h-auto, field rows for all CSV data, "No image" placeholder fallback
UX-DR9: Search Input (flex gap-2 p-2 rounded-md border bg-background w-full) — text input + search icon, 300ms debounce, Enter fires search
UX-DR10: Loading states — shadcn Skeleton placeholders on all 3 panels during cold load (3-4 deck card skeletons, 4 search result skeletons, card info skeleton)
UX-DR11: Empty states — "No decks yet" with Create button (library), "No cards match your search" (search), dashed empty slots (zones)
UX-DR12: Toast notifications — shadcn Toast (default for success, destructive for error), auto-dismiss 3s for success, manual dismiss for errors
UX-DR13: AlertDialog for destructive confirmations — delete deck, clear deck, import parse errors, import invalid IDs
UX-DR14: Button states — spinner/disabled during save, upload, delete operations
UX-DR15: Cover upload flow — Button → native file picker (PNG/JPG/WEBP) → spinner during upload → preview updates
UX-DR16: Drag ghost styling — shadow-md, rotate-2, opacity-90 during drag operations
UX-DR17: WCAG 2.1 AA compliance — keyboard-accessible buttons/inputs/dialogs, focus trapping in modals, Esc closes topmost dialog
UX-DR18: Interaction patterns — no animations/transitions (instant state changes), no hover-only affordances on critical actions, no infinite scroll
UX-DR19: Sort button with loading state if sort > 200ms
UX-DR20: Zone header updates in real-time as cards are added/removed
UX-DR21: FrameType left-border color indicators (Spell=green, Trap=purple, Monster=default)

### FR Coverage Map

FR1: Epic 1 - Search cards by text
FR2: Epic 1 - Display search results
FR3: Epic 1 - Add card to deck from search
FR4: Epic 2 - Display deck zones as grids
FR5: Epic 2 - Drag-and-drop card insertion
FR6: Epic 2 - Right-click card removal
FR7: Epic 2 - Clear deck content
FR8: Epic 2 - Sort decklist
FR9: Epic 2 - List all decks
FR10: Epic 2 - Create and delete decks
FR11: Epic 2 - Search decks by name
FR12: Epic 2 - Upload cover image
FR13: Epic 2 - Display cover image in deck list
FR14: Epic 2 - Export deck to .txt
FR15: Epic 2 - Import deck from .txt
FR16: Epic 2 - Save deck
FR17: Epic 1 - Display card image
FR18: Epic 1 - Display card data
FR19: Epic 3 - Middle panel constrained width
FR20: Epic 3 - Deck slots show card image only (no text)
FR21: Epic 3 - Reorder cards within zones via drag
FR22: Epic 3 - Remove card by dragging out of zone
FR23: Epic 3 - Fusion/Synchro/Xyz/Link → Extra/Side only
FR24: Epic 3 - Remove max-3-copies and 40-60 validation

## Epic List

### Epic 1: Card Search and Info
Users can search their card collection by name or description (FR1-2), add cards to the active deck from search results (FR3), and view full card details including image and CSV data on hover (FR17-18).
**FRs covered:** FR1, FR2, FR3, FR17, FR18

### Story 1.1: Search Cards by Name or Description

As a Yu-Gi-Oh! player,
I want to type a card name or description term and see matching cards instantly,
So that I can find cards in my collection without browsing the entire CSV.

**Acceptance Criteria:**

**Given** the backend has loaded all_cards.csv into memory
**When** a user types "Blue-Eyes" in the search input
**Then** the frontend sends GET /api/cards?q=Blue-Eyes to the backend after 300ms debounce
**And** the backend returns all cards whose name contains "Blue-Eyes" (case-insensitive partial match)

**Given** the search input is empty
**When** no query text is entered
**Then** no API call is made and no results are shown

**Given** a user types "destroy" in the search input
**When** the debounce timer expires
**Then** the API searches all_cards.csv description column for "destroy" (case-insensitive full-text)
**And** returns all matching results with card name, type, and frameType

**Given** a search is in progress
**When** results are loading
**Then** Search Result area shows shadcn Skeleton placeholders (4 result skeletons)

**Given** a search returns zero matches
**When** no cards match the query
**Then** the result area displays muted text: "No cards match your search."

**Given** the backend is unreachable or returns an error
**When** an API call fails
**Then** a destructive Toast appears: "Search failed. Check server connection."

**Given** a search completes successfully
**When** results are returned
**Then** each search result shows the card name and type in a Search Result row component
**And** results are rendered in a scrollable list

**FRs covered:** FR1, FR2
**NFRs covered:** NFR2 (CSV caching), NFR5 (API envelope)
**UX-DRs covered:** UX-DR7, UX-DR9, UX-DR10, UX-DR11, UX-DR12, UX-DR14, UX-DR17
**Requirements:** Backend GET /api/cards?q=, frontend SearchInput with 300ms debounce, Vite proxy /api → :8000, FastAPI CORS, project scaffolding (Vite + React + TS + shadcn/ui + Tailwind, FastAPI + uvicorn)

### Story 1.2: View Card Details and Image on Hover

As a Yu-Gi-Oh! player,
I want to hover over a search result and see the full card details and image,
So that I can inspect a card's stats, description, and artwork without opening another tool.

**Acceptance Criteria:**

**Given** no card is currently hovered
**When** the Card Info panel is idle
**Then** it shows a muted placeholder: "Hover a card to view details."

**Given** a search result is hovered
**When** the card name is "Dark Magician"
**Then** the Card Info panel displays the card image loaded from the local image folder via `/images/` route
**And** the system matches the filename case-insensitively (e.g., "dark magician.jpg", "DARK MAGICIAN.PNG")

**Given** a card is hovered
**When** it has CSV data
**Then** the Card Info panel shows: name, type, frameType, description, level, ATK, DEF, race, attribute, archetype

**Given** a Spell or Trap card is hovered
**When** ATK, DEF, or level fields are not applicable
**Then** those fields show "—" instead of numeric values

**Given** a card is hovered but no matching image file exists in the local folder
**When** the image lookup returns no match
**Then** the Card Info panel shows a "No image" placeholder (card back silhouette)
**And** the text data from CSV is still fully displayed

**Given** the card image is loading
**When** the image has not yet loaded
**Then** a shadcn Skeleton placeholder is shown in the image area

**FRs covered:** FR17, FR18
**NFRs covered:** NFR3 (static image serving)
**UX-DRs covered:** UX-DR2 (left panel w-72), UX-DR8 (Card Info Panel), UX-DR10 (skeleton), UX-DR11 (empty state), UX-DR17 (WCAG)
**Requirements:** FastAPI static mount for card images folder, CardInfoContext, CardInfoPanel component, CardImage component with fallback

### Epic 2: Deck Management
Users can list all decks with cover images and zone counts (FR9, FR13), create named decks (FR10), search decks by name (FR11), upload cover images (FR12), delete decks (FR10), build and modify decks with drag-and-drop zones (FR4-6), sort and clear deck contents (FR7-8), save decklists (FR16), and import/export decks in YDK text format (FR14-15).
**FRs covered:** FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16

### Story 2.1: Deck CRUD Backend

As a Yu-Gi-Oh! player,
I want the backend to store, retrieve, create, update, and delete my decks,
So that my deck collection persists between sessions and can be managed programmatically.

**Acceptance Criteria:**

**Given** decks.json exists (or is created if missing) as an empty array
**When** the backend starts
**Then** decks.json is loaded into memory
**And** GET /api/decks returns an empty array when no decks exist

**Given** a POST /api/decks request with body `{"name": "Dragon Beatdown"}`
**When** the deck is created
**Then** the response returns `{data: {id: "<uuid>", name: "Dragon Beatdown", cover: null, decklist: {"main-deck": [], "extra-deck": [], "side-deck": []}}}`
**And** the deck is persisted to decks.json
**And** GET /api/decks now includes the new deck

**Given** a PUT /api/decks/{id} request with an updated decklist
**When** the decklist has 42 main-deck cards, 8 extra-deck cards, 0 side-deck cards
**Then** the deck is validated: main-deck count 40-60 ✅, extra-deck count 0-15 ✅, side-deck count 0-15 ✅, max 3 copies per card name ✅
**And** the updated decklist is saved to decks.json
**And** the response returns the updated deck object

**Given** a PUT /api/decks/{id} request with 61 main-deck cards
**When** validation fails
**Then** the response returns `{error: {code: "VALIDATION_ERROR", message: "Main deck must have 40-60 cards."}}`
**And** decks.json is NOT modified

**Given** a PUT /api/decks/{id} request with 4 copies of the same card name
**When** validation fails
**Then** the response returns an error indicating max 3 copies per card name
**And** decks.json is NOT modified

**Given** a DELETE /api/decks/{id} for an existing deck
**When** the deck is deleted
**Then** the deck is removed from decks.json
**And** GET /api/decks no longer includes it

**Given** any request for a non-existent deck ID
**When** the deck is not found
**Then** the response returns `{error: {code: "NOT_FOUND", message: "Deck not found."}}` with status 404

**FRs covered:** FR9, FR10, FR16
**NFRs covered:** NFR4 (no auth), NFR5 (API envelope), NFR6 (validation bounds)
**UX-DRs covered:** none (backend only)
**Requirements:** routes/decks.py, services/deck_service.py, models/deck.py, Pydantic request/response models, deck validation logic, decks.json file I/O

### Story 2.2: Deck Library UI

As a Yu-Gi-Oh! player,
I want to see all my saved decks in a list, create new ones, and delete old ones,
So that I can manage my deck collection from one place.

**Acceptance Criteria:**

**Given** the app loads and no deck is selected
**When** the middle panel renders
**Then** the Deck Library view is shown as the default
**And** a GET /api/decks request is sent to fetch all decks

**Given** decks are loading from the API
**When** data has not yet arrived
**Then** the Deck Library shows 3-4 shadcn Skeleton placeholders

**Given** decks.json is empty (no decks exist)
**When** the API returns an empty array
**Then** the Deck Library shows muted text: "No decks yet. Create your first deck to get started."
**And** a "Create New Deck" primary button is displayed below the message

**Given** decks exist in the collection
**When** the API returns deck data
**Then** each deck renders as a Deck Card component showing: cover thumbnail (48×48 rounded), deck name (semibold), zone counts ("Main 42 / Extra 8 / Side 0"), Edit button (icon), Delete button (destructive icon)

**Given** a deck has no cover image
**When** the Deck Card renders
**Then** a muted card-back icon placeholder is shown instead of a cover thumbnail

**Given** a user clicks "Create New Deck"
**When** the create flow starts
**Then** a small dialog or inline prompt asks for a deck name
**And** a POST /api/decks request is sent with the entered name
**And** the button shows a spinner while the request is in flight
**And** on success, the middle panel switches to Deck Builder view with the new deck

**Given** a user clicks the Delete button on a deck
**When** the delete flow starts
**Then** an AlertDialog confirms: "Delete [deck name]?"
**And** the button shows a spinner during the DELETE /api/decks/{id} request
**And** on success, the deck is removed from the list
**And** on failure, a destructive Toast shows the error

**Given** a user types in a deck search input
**When** the query is "Dragon"
**Then** the deck list filters to show only decks whose name contains "Dragon" (client-side filter)
**And** decks that don't match are hidden

**Given** a user clicks a deck row (not on Edit or Delete buttons)
**When** the deck is selected
**Then** the middle panel switches to Deck Builder view with that deck loaded

**FRs covered:** FR9, FR10, FR11, FR13
**NFRs covered:** NFR4 (no auth), NFR5 (API envelope)
**UX-DRs covered:** UX-DR1, UX-DR2 (middle panel flex-1), UX-DR3 (header), UX-DR6 (Deck Card), UX-DR10 (skeletons), UX-DR11 (empty state), UX-DR12 (toast), UX-DR13 (AlertDialog), UX-DR14 (spinner buttons), UX-DR17 (WCAG)
**Requirements:** DeckLibrary component, DeckCard component, CreateDeckDialog, DeckContext provider, deck search filter, lib/api.ts fetch wrapper + useDeck hook

### Story 2.3: Deck Builder Layout and Zone Grids

As a Yu-Gi-Oh! player,
I want to see my deck's cards organized into Main, Extra, and Side zones,
So that I can visually understand my deck composition at a glance.

**Acceptance Criteria:**

**Given** a deck is open in Deck Builder view
**When** the middle panel renders
**Then** three zones are stacked vertically with gap-4: Main Deck, Extra Deck, Side Deck
**And** a breadcrumb/label at the top shows the deck name (e.g., "Deck: Dragon Beatdown")

**Given** the Main Deck zone is rendered
**When** no cards are in the deck
**Then** the zone header shows "Main Deck (0/60)"
**And** a 6×10 grid of 60 empty Deck Slot components is displayed

**Given** the Extra Deck zone is rendered
**When** no cards are in the deck
**Then** the zone header shows "Extra Deck (0/15)"
**And** a grid with 10 slots in the first row and 5 in the second row is displayed (15 total)

**Given** the Side Deck zone is rendered
**When** no cards are in the deck
**Then** the zone header shows "Side Deck (0/15)"
**And** a grid with 10 slots in the first row and 5 in the second row is displayed (15 total)

**Given** an empty Deck Slot
**When** no card occupies it
**Then** the slot shows a dashed border, muted background, and "—" placeholder text
**And** the slot is styled as h-14 w-full rounded-sm bg-muted with border

**Given** a Deck Slot contains a card
**When** the slot renders
**Then** it displays the card name (truncated if long) and ATK/DEF text if applicable (Monster cards)
**And** the slot has a solid border and card-colored background

**Given** a Monster card in a slot
**When** it has a frameType
**Then** a thin left-border color indicator is shown: Spell = green tint, Trap = purple tint, Monster = default (no tint)

**Given** a zone has cards
**When** the zone header renders
**Then** the count updates in real-time (e.g., "Main Deck (23/60)")
**And** each zone has a tinted background gradient: Main = neutral (`#F1F3F5` light / `#343434` dark), Extra = blue tint (`#E8F0FE` light / `#2A3A5C` dark), Side = warm tint (`#FFF3E0` light / `#3D3528` dark)

**Given** the deck is loading
**When** data has not yet arrived
**Then** zone areas show Skeleton placeholders

**Given** a user hovers over an occupied slot
**When** the mouse enters the slot
**Then** the Card Info panel (left) updates with that card's image and full data
**And** the slot gets a ring-1 ring-primary highlight

**Given** a user hovers over an empty slot
**When** the mouse enters the slot
**Then** the Card Info panel shows the empty placeholder state
**And** the slot gets a subtle hover highlight

**FRs covered:** FR4
**NFRs covered:** (none specific)
**UX-DRs covered:** UX-DR2 (middle panel), UX-DR4 (Deck Slot), UX-DR5 (Deck Zone), UX-DR8 (hover→Card Info), UX-DR10 (skeletons), UX-DR17 (WCAG), UX-DR20 (real-time counts), UX-DR21 (frameType colors)
**Requirements:** DeckBuilder component, DeckZone component, DeckSlot component, MiddlePanel view toggle (Library ↔ Builder), DeckContext state for zone data

### Story 2.4: Drag-and-Drop and Right-Click Card Management

As a Yu-Gi-Oh! player,
I want to add cards to my deck by dragging from search or right-clicking, and remove cards by right-clicking,
So that I can quickly build and adjust my deck without manual ID entry.

**Acceptance Criteria:**

**Given** a search result is visible
**When** the user left-clicks and begins dragging a card
**Then** a drag ghost appears following the cursor with shadow-md, rotate-2, opacity-90
**And** all Deck Zone containers highlight as drop targets (ring-1 ring-primary)

**Given** a card is being dragged over a Deck Zone
**When** the cursor enters a slot
**Then** that slot highlights with ring-1 ring-primary and a subtle background change
**And** other zones remain highlighted but the targeted slot is visually distinct

**Given** a card is dragged and dropped onto an empty slot in the Main Deck
**When** the drop completes
**Then** the card appears in that slot
**And** the zone count updates (e.g., "Main Deck (1/60)")
**And** the drag ghost disappears

**Given** a card is dragged and dropped onto an occupied slot at position 3
**When** the drop completes
**Then** the existing card at slot 3 shifts to slot 4
**And** all subsequent cards shift right by one position
**And** the new card occupies slot 3

**Given** a card is dragged and dropped onto a full zone
**When** the zone has no empty slots
**Then** the drop is rejected (card returns to search results, no state change)

**Given** a drag operation begins but the card is dropped outside any valid zone
**When** the drop target is not a Deck Slot
**Then** the drag ghost disappears
**And** no deck state change occurs

**Given** a search result is visible
**When** the user right-clicks on it
**Then** the card is added to the first empty slot in the Main Deck
**And** the zone count updates
**And** if the Main Deck is full, the right-click does nothing

**Given** an occupied Deck Slot
**When** the user right-clicks on it
**Then** the card is removed from the slot
**And** all cards to the right shift left by one position
**And** the zone count updates (e.g., "Main Deck (23/42)")

**Given** the last card in a zone is removed via right-click
**When** the zone had exactly one card
**Then** all slots become empty
**And** the zone header shows "Main Deck (0/60)"

**FRs covered:** FR3, FR5, FR6
**NFRs covered:** (none specific)
**UX-DRs covered:** UX-DR4 (slot as drag target), UX-DR7 (search result draggable), UX-DR16 (drag ghost styling), UX-DR17 (WCAG — right-click supplements drag), UX-DR18 (instant state changes, no animations), UX-DR20 (count updates)
**Requirements:** @dnd-kit/core + sortable + utilities, DndContext in Deck Builder, SearchResult draggable wrapper, DeckSlot droppable wrapper, DeckContext dispatch actions (addCard, removeCard, shiftRight, shiftLeft)

### Story 2.5: Sort and Clear Deck

As a Yu-Gi-Oh! player,
I want to sort my deck by game-logic priority or clear it to start over,
So that I can keep my deck organized or quickly rebuild from scratch.

**Acceptance Criteria:**

**Given** a zone has unsorted cards
**When** the user clicks the Sort button above the zone
**Then** monsters are grouped first by frameType order: normal → effect → ritual → fusion → synchro → xyz → link
**And** within the same frameType, cards are sorted by level descending, then ATK descending, then DEF descending, then name alphabetically (A-Z)
**And** Spell cards follow monsters, sorted by race alphabetically, then name alphabetically
**And** Trap cards follow spells, sorted by race alphabetically, then name alphabetically
**And** any remaining frameTypes appear after traps

**Given** a Sort is triggered on a 60-card Main Deck
**When** sorting begins
**Then** the sort completes in under 500ms (client-side in-memory sort)
**And** if sort takes longer than 200ms, the Sort button shows a brief loading state

**Given** the user clicks the Clear button
**When** the clear flow starts
**Then** a shadcn AlertDialog appears: "Clear all cards from this deck?"
**And** the dialog has Confirm (destructive) and Cancel buttons

**Given** the user confirms the clear dialog
**When** Confirm is clicked
**Then** all zones (Main, Extra, Side) are emptied
**And** zone headers reset to "Main Deck (0/60)", "Extra Deck (0/15)", "Side Deck (0/15)"

**Given** the user cancels the clear dialog
**When** Cancel or Esc is pressed
**Then** the dialog closes
**And** no deck state changes occur

**FRs covered:** FR7, FR8
**NFRs covered:** NFR1 (sort < 500ms)
**UX-DRs covered:** UX-DR13 (AlertDialog), UX-DR19 (sort loading state), UX-DR17 (WCAG — Esc closes dialog, focus trapping), UX-DR18 (instant state changes)
**Requirements:** Sort button per zone, Clear button, client-side sort function in utils.ts, AlertDialog for clear confirmation, DeckContext dispatch actions (sortZone, clearAll)

### Story 2.6: Save, Cover Upload, Import, and Export

As a Yu-Gi-Oh! player,
I want to save my deck, set a cover image, and share or restore decks via text files,
So that my work is persisted, visually recognizable, and portable.

**Acceptance Criteria:**

**Given** the Deck Builder has unsaved changes
**When** the user clicks the Save button
**Then** the button shows a spinner and is disabled
**And** a PUT /api/decks/{id} request is sent with the current decklist
**And** on success, a default Toast appears: "Deck saved." (auto-dismiss 3s)
**And** on failure, a destructive Toast appears: "Couldn't save. Check server connection." (manual dismiss)

**Given** the user clicks "Upload Cover" in the Deck Builder
**When** the upload flow starts
**Then** a native file picker opens filtered to PNG, JPG, JPEG, WEBP
**And** after selecting a file, the button shows a spinner and is disabled during upload
**And** a POST /api/decks/{id}/cover (multipart) request is sent
**And** on success, the cover preview updates immediately
**And** on failure (unsupported format or network error), a destructive Toast appears: "Couldn't upload cover. Supported formats: PNG, JPG, WEBP."

**Given** the user clicks Export
**When** the deck has cards
**Then** a GET /api/decks/{id}/export request is made
**And** a .txt file downloads containing:
```
#main
<card-id>
<card-id>
#extra
<card-id>
!side
```
**And** empty zones are omitted from the file

**Given** the user clicks Import
**When** the import flow starts
**Then** a native file picker opens filtered to .txt files
**And** after selecting a file, its content is sent to POST /api/decks/import
**And** the backend parses the YDK format (#main, #extra, !side headers with card IDs)

**Given** an imported file has valid card IDs
**When** parsing succeeds
**Then** the Deck Builder populates with the imported cards in their respective zones
**And** the zone counts update accordingly

**Given** an imported file contains unknown card IDs (e.g., 999999)
**When** parsing detects invalid IDs
**Then** an AlertDialog appears: "Unknown card IDs: 999999. These cards were skipped."
**And** valid cards are still loaded into the builder

**Given** an imported file has a malformed format (missing headers, scrambled content)
**When** parsing fails
**Then** an AlertDialog appears: "Couldn't parse file. Expected format: #main, #extra, !side sections with card IDs."
**And** no changes are made to the current deck

**FRs covered:** FR12, FR14, FR15, FR16
**NFRs covered:** NFR4 (no auth), NFR5 (API envelope)
**UX-DRs covered:** UX-DR12 (toast), UX-DR13 (AlertDialog for import errors), UX-DR14 (button spinners), UX-DR15 (cover upload flow), UX-DR17 (WCAG)
**Requirements:** Save button, Cover upload button + input, Export button → download, Import button → file picker + parse, backend POST /api/decks/{id}/cover, GET /api/decks/{id}/export, POST /api/decks/import, YDK parser in deck_service.py

### Epic 3: Deck Builder Polish & Quality of Life
Users can build decks with full card images filling each slot, reorder cards by dragging within zones, remove cards by dragging to a trash zone, enforce Extra Deck zone-appropriate placement (Fusion/Synchro/Xyz/Link → Extra/Side only), build freely without max-3-copy or 40-60-card validation rules, and experience faster re-renders when modifying deck contents.
**FRs covered:** FR19, FR20, FR21, FR22, FR23, FR24
**NFRs covered:** NFR7 (stable rendering — prevent unnecessary DeckSlot re-renders)

### Story 3.1: Card-Focused Deck Slots

As a Yu-Gi-Oh! player,
I want deck slots to show the full card image (not just a name + ATK/DEF),
So that I can visually identify cards in my deck at a glance.

**Acceptance Criteria:**

**Given** an occupied Deck Slot in any zone
**When** the slot renders
**Then** it shows the card image filling the slot area (no card name text displayed)

**Given** a Deck Slot has a card with an available imageUrl
**When** the slot renders
**Then** the image loads from `/images/` and fills the slot using object-cover or object-contain

**Given** a Deck Slot has a card with no available image (imageUrl is null/undefined)
**When** the slot renders
**Then** it shows a muted placeholder with the card name as fallback

**Given** the Main Deck zone has 60 slots
**When** slots are rendered with images
**Then** the zone grid maintains 10 columns and each slot height accommodates the card image

**Given** the user hovers over an occupied slot
**When** the image renders
**Then** the Card Info panel (left) still updates with the full card data and larger image

**FRs covered:** FR20
**Files touched:** DeckSlot.tsx, DeckZone.tsx

### Story 3.2: Repair Right-Click Remove

As a Yu-Gi-Oh! player,
I want to right-click a card in my deck and remove it,
So that I can remove individual cards without dragging.

**Acceptance Criteria:**

**Given** an occupied Deck Slot
**When** the user right-clicks the slot
**Then** a context menu appears at the cursor position with "Remove" and "Cancel" options

**Given** the context menu is shown
**When** the user clicks "Remove"
**Then** the card is removed from the slot
**And** subsequent cards shift left to fill the gap
**And** the zone count updates

**Given** the context menu is shown
**When** the user clicks "Cancel" or presses Escape or clicks outside the menu
**Then** the menu closes
**And** no deck state changes occur

**FRs covered:** FR6 (fix)
**Files touched:** DeckBuilder.tsx

### Story 3.3: Drag Reorder & Drag to Remove

As a Yu-Gi-Oh! player,
I want to reorder cards within a zone by dragging them, and remove a card by dragging it outside the deck,
So that I can organize cards intuitively without right-clicking each one.

**Acceptance Criteria — Reorder:**

**Given** a zone has 2+ occupied slots
**When** the user drags a card from slot 3 and drops it onto slot 1
**Then** the card from slot 3 moves to slot 1
**And** cards at slots 1-2 shift right by one position
**And** the zone count remains unchanged

**Given** a zone has 2+ occupied slots
**When** the user drags a card and drops it onto the same slot it came from
**Then** no reorder occurs (no state change)

**Acceptance Criteria — Drag to Remove:**

**Given** the user is dragging a card from a Deck Slot
**When** the drop target is not a valid Deck Slot or removal zone
**Then** the card returns to its original slot
**And** no state change occurs

**Given** the user is dragging a card
**When** the card is dropped outside any Deck Zone
**Then** the card is removed from its slot
**And** subsequent cards shift left to fill the gap

**FRs covered:** FR21, FR22
**Files touched:** App.tsx, DeckContext.tsx, DeckBuilder.tsx

### Story 3.4: Extra Deck Zone Validation

As a Yu-Gi-Oh! player,
I want Fusion, Synchro, Xyz, and Link monsters to only be placeable in the Extra Deck or Side Deck,
So that deck-building follows the official TCG rules.

**Acceptance Criteria:**

**Given** a card with frameType "fusion", "synchro", "xyz", or "link"
**When** the user drags it from search results onto a Main Deck slot
**Then** the drop is rejected (no state change)

**Given** a card with frameType "fusion", "synchro", "xyz", or "link"
**When** the user right-clicks it in search results
**Then** nothing happens (card is not added to Main Deck)

**Given** a card with frameType "fusion", "synchro", "xyz", or "link"
**When** the user drags it onto an Extra Deck or Side Deck slot
**Then** the card is added normally

**Given** a card with frameType "normal", "effect", "ritual", "spell", or "trap"
**When** the user drags it onto an Extra Deck slot
**Then** the drop is rejected (only fusion/synchro/xyz/link in Extra Deck)

**FRs covered:** FR23
**Files touched:** App.tsx, DeckBuilder.tsx

### Story 3.5: Remove Validation Rules

As a Yu-Gi-Oh! player,
I want to add as many cards as I want without hitting max-3-copy or 40-60 limits,
So that I can freely build experimental/test decks.

**Acceptance Criteria:**

**Given** a PUT /api/decks/{id} request with 4 copies of the same card
**When** the backend validates the decklist
**Then** the decklist is accepted and saved (no max-3-copy error)

**Given** a PUT /api/decks/{id} request with 10 cards in Main Deck (below 40)
**When** the backend validates the decklist
**Then** the decklist is accepted and saved (no minimum-40 error)

**Given** a PUT /api/decks/{id} request with 80 cards in Main Deck (above 60)
**When** the backend validates the decklist
**Then** the decklist is accepted and saved (no maximum-60 error)

**FRs covered:** FR24
**Files touched:** backend/services/deck_service.py

### Story 3.6: Prevent Unnecessary Re-renders

As a Yu-Gi-Oh! player,
I want the deck builder to only re-render changed slots when I add or remove cards,
So that interactions feel snappy even with 90+ slots.

**Acceptance Criteria:**

**Given** the Deck Builder has 90+ slots rendered across Main, Extra, and Side zones
**When** a card is added to slot 5 of Main Deck
**Then** only the affected slots re-render (not all 90 slots)

**Given** the Deck Builder has slots rendered
**When** a card is removed from a slot
**Then** only the affected slots re-render (not all 90 slots)

**FRs covered:** NFR7 (stable rendering)
**Files touched:** DeckSlot.tsx (React.memo), DeckZone.tsx
