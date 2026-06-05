---
title: Yu-Gi-Oh! Deck Builder
status: final
created: 2026-06-03
updated: 2026-06-03
---

# PRD: Yu-Gi-Oh! Deck Builder
*Working title — confirm.*

## 0. Document Purpose

This PRD defines the Yu-Gi-Oh! Deck Builder — an offline-first desktop application for managing a personal Yu-Gi-Oh! card collection and building decks. The project is a hobby/personal tool; this document serves as the single source of truth for implementation. Downstream consumers: developer (implementation) and the builder (you). Architecture decisions and technical details are captured in `addendum.md`.

## 1. Vision

A fast, local Yu-Gi-Oh! deck builder that lets you search your personal card collection by name or description, visually build decks by dragging cards into a game-accurate grid layout (Main/Extra/Side), and save/export decks as text files. No cloud, no accounts, no online services — just your local card library and image collection, served through a clean React frontend backed by a Python REST API.

## 2. Target User

### 2.1 Jobs To Be Done

- **Functional:** Build legal Yu-Gi-Oh! decks from my local card collection without manually counting slots or looking up card text.
- **Organizational:** Browse, search, and manage my entire card library in one place.
- **Portability:** Export decks as plain-text files I can share or archive.

### 2.2 Key User Journeys

- **UJ-1. Legion builds a new deck from search.**
  - **Persona + context:** Legion, a Yu-Gi-Oh! player with a local collection of scanned cards on their Windows machine.
  - **Entry state:** App is running. No deck is open.
  - **Path:** Clicks "Create New Deck" in the Deck Library panel → names the deck → opens the Deck Builder view → uses the Search panel to find cards by name/description → drags a card from search results into the Main Deck zone → the card appears in the first empty slot → repeats until the deck is built → clicks Save.
  - **Climax:** The deck persists to `db/decks.json` and appears in the Deck Library list with correct counts (Main/Extra/Side).
  - **Resolution:** Back on the Deck Library view, the new deck is listed with its card counts.

- **UJ-2. Legion inspects a card mid-build.**
  - **Persona + context:** Same Legion, mid-deck-build.
  - **Entry state:** Deck Builder is open with cards in the Main Deck.
  - **Path:** Hovers over a card in a Deck Slot → the Card Information panel (left) updates instantly showing the card's image from the local folder and its CSV data (name, type, ATK/DEF, description, etc.).
  - **Climax:** Full card info displayed without clicking away.
  - **Resolution:** Continues building.

- **UJ-3. Legion exports a deck to share.**
  - **Entry state:** A completed deck is open in the Deck Builder.
  - **Path:** Clicks "Export" → a `.txt` file downloads with the `#main`, `#extra`, `!side` format, each section listing card IDs.
  - **Climax:** The file is saved to the user's chosen location.
  - **Resolution:** The file can be shared or re-imported later.

- **UJ-4. Legion sets a cover image for a deck.**
  - **Persona + context:** Legion wants to visually differentiate decks in the library.
  - **Entry state:** Deck Library view is open. A deck exists.
  - **Path:** Clicks "Edit" on a deck → in the deck properties, clicks "Upload Cover" → browses and selects an image file → the image uploads and the deck's cover updates in the library.
  - **Climax:** The deck now shows the custom cover image in the library list.
  - **Resolution:** Returns to the Deck Library with the new cover visible.

## 3. Glossary

- **Card** — A single Yu-Gi-Oh! card identified by numeric `id`. Each card has a name, type, frameType, description, level, ATK, DEF, race, attribute, and archetype (from `all_cards.csv`).
- **Deck** — A named collection of cards organized into three zones: Main Deck, Extra Deck, and Side Deck. Persisted to `db/decks.json`.
- **Main Deck** — 0–60 card slots. Contains Monster, Spell, and Trap cards.
- **Extra Deck** — 0–15 card slots. Contains Fusion, Synchro, Xyz, and Link monsters.
- **Side Deck** — 0–15 card slots. Contains cards that can be swapped in between matches.
- **Slot** — A single position in a Deck zone that holds exactly one card.
- **Decklist** — The full contents of a Deck, stored as arrays of card IDs per zone.
- **FrameType** — Card category: normal, effect, ritual, fusion, synchro, xyz, link, spell, trap.

## 4. Features

### 4.1 Card Search

**Description:** The right panel provides a search interface over the local card database. The user can search by card name or card description (full-text). Results display as a list of cards. Hovering a result updates the Card Information panel (left) with that card's full data and image. Cards can be added to the active deck from the search results via left-mouse drag-and-drop or right-click. Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-1: Search cards by text

User can search cards by name (partial match) or description (full-text). Results are returned from the FastAPI backend which reads `db/all_cards.csv`.

**Consequences (testable):**
- Typing "Blue-Eyes" returns all cards whose name contains "Blue-Eyes".
- Typing "destroy" returns all cards whose description contains "destroy".
- Empty query returns no results.

#### FR-2: Display search results

Search results render as a scrollable list of card entries showing card name and type.

**Consequences (testable):**
- Each result entry shows at minimum the card name and type.
- Results update as the user types (debounced).

#### FR-3: Add card to deck from search

User can add a card to the active deck by: (a) left-mouse dragging from search results to a Deck Zone, or (b) right-clicking a search result to add to the first available slot in the Main Deck.

**Consequences (testable):**
- Drag onto Main Deck zone adds to first empty Main Deck slot.
- Right-click adds to first empty Main Deck slot.
- Adding a 61st card to Main Deck is blocked.

**Out of Scope:**
- Adding to Extra or Side Deck via right-click — v1 defaults to Main Deck on right-click.

### 4.2 Deck Builder

**Description:** The middle panel displays the active deck as three grid zones: Main Deck (6 rows × 10 slots), Extra Deck (row 1: 10, row 2: 5), Side Deck (row 1: 10, row 2: 5). Each slot can hold one card. Hovering a slot shows the card's full information in the Card Information panel. Cards can be inserted into any slot — subsequent slots auto-shift. Right-click removes a card and shifts remaining cards to fill gaps. A Sort button reorders the decklist by game-logic priority. Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-4: Display deck zones as grids

Two visible grid zones (Main, Extra, Side) with correct slot counts. Slots are empty or occupied.

**Consequences (testable):**
- Main Deck zone renders 60 slots (6×10).
- Extra Deck zone renders 15 slots (10 + 5).
- Side Deck zone renders 15 slots (10 + 5).
- Occupied slots show the card's name/thumbnail.

#### FR-5: Drag-and-drop card insertion

A card dragged from Search Results can be dropped onto any empty or occupied slot. If the slot is occupied, cards from that position onward shift right by one. If the zone is full, the drop is rejected.

**Consequences (testable):**
- Dropping card C into slot 3 of Main Deck shifts slot 3's existing card to slot 4, and so on.
- Dropping onto a full zone does nothing.

#### FR-6: Right-click card removal

Right-clicking an occupied slot removes that card. All cards to the right shift left by one position to fill the gap.

**Consequences (testable):**
- Removing card at slot 5 shifts former slot 6 → slot 5, slot 7 → slot 6, etc.
- Removing the last card leaves an empty slot at the end.

#### FR-7: Clear deck content

Button clears all cards from the current deck after a confirmation prompt.

**Consequences (testable):**
- All Main, Extra, and Side Deck slots become empty.
- A confirmation dialog is shown before clearing.

#### FR-8: Sort decklist

Sort button reorders the current zone's cards by priority: Monster (normal → effect → ritual → fusion → synchro → xyz → link, then by level descending, then ATK descending, then DEF descending, then name alphabetically), Spell (alphabetical by race, then by name), Trap (alphabetical by race, then by name), then other frameTypes.

**Consequences (testable):**
- Monsters are grouped by frameType in the specified order.
- Equal-frameType monsters are ordered by level, then ATK, then DEF, then name.

**Feature-specific NFRs:**
- Sort must complete in under 500ms for a full 60-card Main Deck.

### 4.3 Deck Library

**Description:** The middle panel's default view shows all saved decks from `db/decks.json`. Each deck entry displays name, cover image, and card counts per zone. The user can search decks by name, create new decks, edit existing ones, or delete them. The user can also upload a custom cover image for each deck — images are stored in a project folder and the path is saved in `decks.json`. Realizes UJ-1.

**Functional Requirements:**

#### FR-9: List all decks

Fetch and display all decks from `db/decks.json`. Each deck card shows: deck name, cover image (if set), Main/Extra/Side deck counts, Edit button, Delete button.

**Consequences (testable):**
- An empty `decks.json` shows "No decks yet" message.
- Deck counts update when the deck is modified.

#### FR-10: Create and delete decks

User can create a new named deck (opens in Deck Builder view). User can delete a deck (with confirmation prompt).

**Consequences (testable):**
- Creating a deck generates a UUID and persists an empty decklist to `decks.json`.
- Deleting a deck removes it from `decks.json`.

#### FR-11: Search decks by name

Text search filters the deck list by deck name (partial match).

**Consequences (testable):**
- Typing "Dragon" shows only decks whose name contains "Dragon".

#### FR-12: Upload cover image

User can browse and select an image file to set as a deck's cover. The image is uploaded to the backend, saved to a `uploads/covers/` directory (relative to the project root), and the path is stored in the deck's entry in `decks.json`.

**Consequences (testable):**
- Selecting an image file uploads it and the deck's cover updates immediately.
- Supported formats: PNG, JPG, JPEG, WEBP.
- The stored path in `decks.json` points to `uploads/covers/{deck-uuid}.{ext}`.

#### FR-13: Display cover image in deck list

Each deck card in the library displays its cover image. If no cover is set, a default placeholder is shown.

**Consequences (testable):**
- A deck with a cover image shows the uploaded image in the deck list card.
- A deck without a cover shows a default "No Cover" placeholder.

### 4.4 Import / Export

**Description:** Decks can be exported to a `.txt` file or imported from one. The format uses section headers `#main`, `#extra`, `!side` with card IDs listed below each header. Realizes UJ-3.

**Functional Requirements:**

#### FR-14: Export deck to .txt

Export the active deck to a `.txt` file with the format:
```
#main
<card-id>
<card-id>
#extra
<card-id>
<card-id>
!side
<card-id>
<card-id>
```

**Consequences (testable):**
- Exported file contains every card in the decklist grouped by zone.
- Empty zones are omitted.

#### FR-15: Import deck from .txt

User can select a `.txt` file in the same format and load it into the Deck Builder. Invalid card IDs are reported.

**Consequences (testable):**
- Valid file populates the deck builder with the correct cards.
- File with unknown card ID shows an error message listing invalid IDs.
- Malformed file (missing headers) shows a parse error.

#### FR-16: Save deck

Save the current decklist to `db/decks.json` via POST/PUT to the FastAPI backend. The deck is stored with its UUID, name, cover image path, and decklist (arrays of card IDs per zone).

**Consequences (testable):**
- Saving overwrites the existing deck entry in `decks.json`.
- Saved deck appears with correct counts on reload.

### 4.5 Card Information Panel

**Description:** The left panel displays the image and full data of the hovered/inspected card. The image is loaded from the local folder `C:\Users\Legion\Documents\MEGA\EN Series 9 Card Library` by matching the card name to a filename in that directory. Card data (name, type, frameType, description, level, ATK, DEF, race, attribute, archetype) is read from `db/all_cards.csv`. Realizes UJ-2.

**Functional Requirements:**

#### FR-17: Display card image

When a card is hovered (in Deck Builder slots or Search Results), the Card Information Panel shows the card image from the local folder. The system looks up the card's name, matches it to a filename in the image directory, and renders it.

**Consequences (testable):**
- Hovering card "Dark Magician" shows the image file matching "Dark Magician" in the image folder.
- If no matching image file is found, a placeholder or "No image" message is shown.

#### FR-18: Display card data

When a card is hovered, the panel shows all fields from the CSV: name, type, frameType, description, level, ATK, DEF, race, attribute, archetype.

**Consequences (testable):**
- All fields are displayed.
- Numeric fields (ATK, DEF, level) not applicable to Spell/Trap cards show "—" or are hidden.

## 5. Non-Goals (Explicit)

- This is NOT an online/multiplayer platform. No matchmaking, no duels, no cloud sync.
- This is NOT a card price tracker or marketplace.
- This is NOT a banlist validator — deck legality is not enforced.
- This is NOT a card database editor — `all_cards.csv` is read-only.

## 6. MVP Scope

### 6.1 In Scope

- Card search by name and description
- Deck Builder with Main/Extra/Side zone grids
- Drag-and-drop and right-click card management
- Deck Library (list, create, delete, edit)
- Import/Export to `.txt` format
- Save/load decklists to `db/decks.json`
- Card Information Panel (image + CSV data on hover)
- Sort decklist
- Clear deck content
- Cover image upload and display

### 6.2 Out of Scope for MVP

- Image caching strategy — `[ASSUMPTION: Images load from disk on each hover; will optimize later if performance is an issue.]`
- Concurrent access to `decks.json` — `[ASSUMPTION: Single-user, no lock contention.]`
- Card image upload/management for card library images — the card image folder is managed externally.

## 7. Success Metrics

**Primary**
- **SM-1**: I use this tool weekly to build or edit decks without frustration.

**Counter-metrics (do not optimize)**
- Feature count — this is a focused tool, not a platform.

## 8. Open Questions

1. Image matching strategy — exact filename match on card name? Case-insensitive? What naming convention do the existing image files use?
2. Should the `all_cards.csv` ship with the repo, or is it user-provided?
3. Cards with the same name but different printings — does `all_cards.csv` deduplicate by ID, and does the image folder handle multiple prints?

## 9. Assumptions Index

- From §4.2 FR-8 — Sort must complete in under 500ms for a full 60-card Main Deck. `[ASSUMPTION: In-memory sort on the frontend is fast enough; no backend sort needed.]`
- From §4.4 FR-15 — Import validates card IDs against the CSV. `[ASSUMPTION: The CSV is loaded on backend start and cached in memory.]`
- From §4.1 FR-3 — Right-click adds to Main Deck only. `[ASSUMPTION: The user will sort cards into Extra/Side decks manually via drag-and-drop after adding.]`
- From §6.2 — No image caching. `[ASSUMPTION: Images load from disk on each hover; will optimize later if performance is an issue.]`
- From §6.2 — No concurrent access. `[ASSUMPTION: Single-user, no lock contention needed for decks.json.]`
- From §4.5 FR-17 — Image filename matches card name. `[ASSUMPTION: The image folder uses card names as filenames (case-insensitive match).]`
