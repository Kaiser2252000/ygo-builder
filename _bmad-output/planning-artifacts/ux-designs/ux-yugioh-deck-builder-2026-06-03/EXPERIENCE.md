---
name: Yu-Gi-Oh! Deck Builder
status: final
sources:
  - ../../prds/prd-yugioh-deck-builder-2026-06-03/prd.md
updated: 2026-06-03
---

# EXPERIENCE.md — Yu-Gi-Oh! Deck Builder

> Desktop web app. shadcn/ui on Tailwind CSS. `DESIGN.md` is the visual identity reference; this spine governs behavior. → Wireframes in `imports/`: Screen_1.jpg, Screen_2.jpg. Spine wins on conflict.

## Foundation

**Form-factor:** Desktop web application served locally (React SPA ↔ FastAPI REST API). Single-user, no authentication, no accounts. Runs on Windows via local dev server (`localhost:3000` SPA, `localhost:8000` API). Not responsive — designed for a minimum width of 1200px; no mobile or tablet layout.

**UI system:** shadcn/ui on Tailwind CSS. Visual identity overrides in `DESIGN.md`. Component behaviors documented below; anything not listed here inherits shadcn defaults.

## Information Architecture

| Surface | Reached from | Purpose |
|---------|-------------|---------|
| **Deck Library** | App start (default middle panel) | List all saved decks, create new, search by name |
| **Deck Builder** | Deck Library → Edit / Create | Build and modify a single deck's card list |
| **Card Search** | Right panel (always visible) | Search all cards by name or description |
| **Card Info** | Left panel (always visible) | Show hovered card's image and full data |

The three panels are always present. The middle panel toggles between Deck Library and Deck Builder views. A tab or breadcrumb label at the top of the middle panel shows the current view (e.g., "Library" vs "Deck: Dragon Beatdown").

## Glossary

Terms used verbatim from PRD §3. See PRD for full definitions.

- **Card** — A single Yu-Gi-Oh! card identified by numeric `id`.
- **Deck** — A named collection of cards organized into three zones: Main Deck, Extra Deck, and Side Deck.
- **Main Deck** — 0–60 card slots. Contains Monster, Spell, and Trap cards.
- **Extra Deck** — 0–15 card slots. Contains Fusion, Synchro, Xyz, and Link monsters.
- **Side Deck** — 0–15 card slots.
- **Slot** — A single position in a Deck zone that holds exactly one card.
- **Decklist** — The full contents of a Deck, stored as arrays of card IDs per zone.
- **FrameType** — Card category: normal, effect, ritual, fusion, synchro, xyz, link, spell, trap.

## Voice and Tone

Functional and direct. The tool speaks in card-game vocabulary. No personality, no gamification, no congratulations.

| Do | Don't |
|----|-------|
| "Main Deck (23/60)" | "You've added 23 cards to your Main Deck!" |
| "3 decks" | "You have 3 awesome decks!" |
| "Delete deck?" | "Are you sure you want to permanently delete this deck? This action cannot be undone." → use standard shadcn confirmation |
| "No cards match your search." | "Oops, couldn't find anything!" |
| "Invalid card ID: 999999" | "Card 999999 doesn't exist in your collection." |

## Component Patterns

| Component | Surface | Behavioral rules |
|-----------|---------|-----------------|
| **Search Input** | Card Search | Text input with search icon. Fires search on debounced input (300ms). `Enter` also fires search. Results update below. Empty input clears results. |
| **Search Result** | Card Search results | Standard row showing card name + type. On **hover** → Card Info panel updates with full data + image. On **left-mouse drag-start** → drag ghost appears, slot zones become drop targets. On **right-click** → card added to first empty Main Deck slot. |
| **Deck Slot** | Deck Builder zones | Shows card name (truncated) and small ATK/DEF if available. **Hover** → Card Info panel updates. **Drag-enter** → slot highlights with `ring-1 ring-primary`. **Drop** → card inserted at this position, subsequent slots shift right. **Right-click** → card removed, subsequent slots shift left. Empty slot shows dashed border and muted placeholder text. |
| **Deck Zone** | Deck Builder | Bordered container with header showing zone name + count badge (e.g., "Main Deck 23/60"). Gradient background tint per zone type (Main = neutral, Extra = blue tint, Side = warm tint). Zones stack vertically with `gap-4` between them. |
| **Deck Card (library)** | Deck Library | Horizontal card: cover thumbnail (48×48, rounded), deck name (semibold), zone counts below, Edit and Delete buttons right-aligned. Clicking the row (not buttons) opens the deck in Deck Builder. |
| **Create Deck Button** | Deck Library | Primary button at top of deck list. Click → prompt for deck name (inline or small dialog). On confirm → UUID generated, empty decklist saved, Deck Builder opens. |
| **Cover Image Upload** | Deck Builder (deck properties) | Button labeled "Upload Cover". Click → native file picker (PNG/JPG/JPEG/WEBP). On select → image uploads to server, preview appears, path saved on next Save. |
| **Save Button** | Deck Builder | Primary button. Click → sends current decklist to backend. On success → shadcn `Toast` "Deck saved." On failure → destructive Toast with retry option. |
| **Clear Button** | Deck Builder | Destructive-styled button. Click → shadcn `AlertDialog`: "Clear all cards from this deck?" Confirm → empties all zones. Cancel → noop. |
| **Sort Button** | Deck Builder | Default button. Click → sorts current zone's cards by game-logic priority (monster frameType → level → ATK → DEF → name; then spells by race → name; then traps by race → name). Shows loading state if sort takes > 200ms. |
| **Delete Button** | Deck Library (per deck) | Destructive-styled icon button. Click → `AlertDialog`: "Delete [deck name]?" Confirm → deck removed from list and `decks.json`. |
| **Theme Toggle** | App header | shadcn `DropdownMenu`: Light / Dark / System. Selection persists in localStorage. |

## State Patterns

| State | Surface | Treatment |
|-------|---------|-----------|
| **Cold app load** | All panels | shadcn `Skeleton` placeholders: 3-4 deck card skeletons in middle, 4 search result skeletons in right, card info skeleton in left. |
| **Data loaded** | All panels | Skeletons replaced with real content. No transition animation. |
| **Empty library** | Deck Library | Muted text: "No decks yet. Create your first deck to get started." Create Deck button below. |
| **Empty search** | Card Search | Muted text: "No cards match your search." |
| **Empty zone** | Deck Builder zone | Zone shows dashed slots with no content. Placeholder text inside each slot: faint card back or "—". |
| **Zone full** | Deck Builder | Drop rejected. No visual feedback currently. `[ASSUMPTION: Future improvement — subtle border flash on the zone to indicate full state.]` |
| **Uploading cover** | Deck Builder | Button shows spinner. Disabled during upload. After upload completes, preview updates. |
| **Save in progress** | Deck Builder | Save button shows spinner. Disabled. |
| **Save success** | Deck Builder | shadcn `Toast` (default): "Deck saved." Auto-dismiss after 3s. |
| **Save failure** | Deck Builder | shadcn `Toast` (destructive): "Couldn't save. Check server connection." Manual dismiss. |
| **Import parse error** | Deck Builder (import) | shadcn `AlertDialog`: "Couldn't parse file. Expected format: #main, #extra, !side sections with card IDs." Lists line number of error if available. |
| **Import invalid IDs** | Deck Builder (import) | `AlertDialog`: "Unknown card IDs: 999999, 888888. These cards were skipped." |
| **Card image missing** | Card Info | Placeholder: "No image" with card back silhouette. Card data (text fields) still shown. |
| **Cover missing** | Deck Library | Deck card shows a muted card-back icon as fallback cover. |
| **Deleting deck** | Deck Library | Button replaced with spinner during API call. On success, deck removed from list. On failure, Toast with error. |
| **Search error** | Card Search | shadcn `Toast` (destructive): "Search failed. Check server connection." Manual dismiss. |
| **Library load error** | Deck Library | Inline error banner: "Couldn't load decks." Retry button next to message. |

## Interaction Primitives

**Mouse-primary.** All interactions are mouse-driven. Keyboard shortcuts are not required for any operation.

| Action | Input | Surface |
|--------|-------|---------|
| Add card to deck | Left drag from search → drop on slot | Card Search → Deck Builder |
| Add card to deck (quick) | Right-click on search result | Card Search |
| Remove card from deck | Right-click on occupied slot | Deck Builder |
| Inspect card | Hover over slot or search result | Card Info panel updates |
| Edit deck | Left-click on deck row (not buttons) | Deck Library → Deck Builder |
| Create deck | Click button, name dialog | Deck Library |
| Delete deck | Click delete icon, confirm dialog | Deck Library |

**Banned:** hover-only affordances on critical actions (all interactive elements must be clickable). Right-click is not the only way to add a card (drag-and-drop is available). Infinite scroll (pagination not needed at this scale). Animations and transitions (instant state changes).

## Accessibility Floor

Behavioral. Visual contrast in `DESIGN.md`.

- WCAG 2.1 AA minimum. shadcn defaults are AA-compliant; brand overrides in `DESIGN.md` maintain ratios.
- All interactive elements are keyboard-accessible (buttons, inputs, dialogs). Tabbing order follows visual panel order: Left → Middle → Right.
- Drag-and-drop is supplemented by right-click add (FR-3) for users who cannot drag.
- Right-click removal (FR-6) is the primary removal path; no alternative drag-out gesture. `[ASSUMPTION: Single-user hobby tool; no keyboard-only removal gesture planned.]`
- All dialogs are modal with focus trapping (shadcn default behavior).
- `Esc` closes the topmost dialog, dropdown, or popover.
- Screen readers: deck zone headers announce zone name and count. Slots are not individually focusable (they are containers, not interactive elements).

## Key Flows

### Flow 1 — Build a new deck (UJ-1)

1. Legion opens the app. Middle panel shows Deck Library with a "Create New Deck" button.
2. He clicks "Create New Deck" → a small dialog prompts for a deck name. He types "Dragon Beatdown" and confirms.
3. The middle panel switches to Deck Builder view. All zones are empty. The zone header reads "Main Deck (0/60)".
4. Legion types "Blue-Eyes" in the Search panel (right). Results appear after 300ms debounce, showing "Blue-Eyes White Dragon", "Blue-Eyes Alternative White Dragon", etc.
5. He hovers over "Blue-Eyes White Dragon". The Card Info panel (left) shows the card image from the local folder, plus all CSV fields: ATK 3000, DEF 2500, level 8, etc.
6. He left-drags "Blue-Eyes White Dragon" from the search results and drops it onto the first Main Deck slot. The slot fills with the card name "Blue-Eyes White Dragon". The zone header updates to "Main Deck (1/60)".
7. He continues dragging cards from search results into various slot positions. When he drops onto slot 3 (which already has a card), that card shifts to slot 4 and everything after shifts right.
8. He right-clicks a card he placed in the Extra Deck zone by mistake → it's removed, and remaining cards shift left.
9. **Climax:** He clicks Save. A Toast appears: "Deck saved." He clicks the Library breadcrumb and sees "Dragon Beatdown" listed with correct counts: Main Deck 42, Extra Deck 8, Side Deck 0.

Failure: Save fails due to server error → destructive Toast: "Couldn't save. Check server connection." The deck builder stays open with all cards intact; retrying Save works after the server recovers.

### Flow 2 — Inspect a card mid-build (UJ-2)

1. Legion has "Dragon Beatdown" open in Deck Builder.
2. He hovers over a card in the Main Deck zone — the Card Info panel (left) updates instantly to show "Blue-Eyes White Dragon" with its image and full CSV data.
3. He moves his mouse to another slot — the Card Info panel swaps to the new card's data.
4. **Climax:** Full card information is visible without clicking away from the deck builder. He can verify card details while the deck remains in view.

Failure: No matching image found in the local folder → Card Info panel still shows all text data from CSV but displays a "No image" placeholder where the card art would be. Card data remains fully readable.

### Flow 3 — Export a deck (UJ-3)

1. With "Dragon Beatdown" open, Legion clicks the Export button.
2. A `.txt` file downloads containing:
   ```
   #main
   89631139
   38572737
   ...
   #extra
   54007299
   ...
   !side
   ```
3. **Climax:** The file is saved locally and can be shared, archived, or re-imported later.

Failure: Backend generates the file but the browser's download dialog is dismissed or fails → No feedback currently. `[ASSUMPTION: Browser handles download failures natively; no custom error state needed.]`

### Flow 4 — Set a cover image (UJ-4)

1. In Deck Library, Legion clicks Edit on "Dragon Beatdown".
2. In the Deck Builder view, he clicks "Upload Cover" in the deck properties area.
3. A native file picker opens. He selects `dragon-cover.png`.
4. The cover preview updates immediately. He clicks Save.
5. **Climax:** Back in Deck Library, "Dragon Beatdown" now shows the dragon cover image. The deck stands out visually from others in the list.

Failure: Upload fails due to unsupported format or network error → destructive Toast: "Couldn't upload cover. Supported formats: PNG, JPG, WEBP."

### Flow 5 — Import a deck from file

1. In Deck Builder, Legion clicks Import.
2. A native file picker opens. He selects `friends-deck.txt`.
3. The backend parses the file. One card ID (999999) doesn't exist in his collection — an `AlertDialog` reports: "Unknown card IDs: 999999. These cards were skipped."
4. He clicks OK. The Deck Builder populates with all valid cards.
5. **Climax:** The imported deck is now fully editable in the Deck Builder. He clicks Save to persist it.

Failure: The file has a malformed format (missing headers or scrambled content) → AlertDialog: "Couldn't parse file. Expected format: #main, #extra, !side sections with card IDs." No changes are made to the deck.

### Flow 6 — Sort a deck

1. Legion has been adding cards to his Main Deck in random order. He has monsters, spells, and traps scattered throughout.
2. He clicks the Sort button above the Main Deck zone.
3. The cards reorder instantly: all normal monsters first, then effect, then ritual, fusion, synchro, xyz, link — each group sorted by level descending, then ATK descending. Spells follow, sorted alphabetically by race. Traps follow similarly.
4. **Climax:** The deck is now ordered by game-logic convention, ready for print or review.

Failure: Sort takes longer than 500ms on a very large deck → Button shows a loading state while processing. Sort still completes; the user may experience a brief wait. `[ASSUMPTION: 60-card Main Deck sort is fast enough; longer sorts only occur with edge-case data.]`

### Flow 7 — Clear a deck and start over

1. Legion's "Dragon Beatdown" has 42 cards but he wants to rebuild from scratch.
2. He clicks Clear. An `AlertDialog` asks: "Clear all cards from this deck?"
3. He confirms. All zones empty. Zone headers reset to "Main Deck (0/60)".
4. **Climax:** The deck is blank. He starts adding cards from search without having to delete each one individually.

Failure: User accidentally clicks Clear, then clicks Cancel on the confirmation dialog → Dialog closes. Deck is unchanged. No action taken.
