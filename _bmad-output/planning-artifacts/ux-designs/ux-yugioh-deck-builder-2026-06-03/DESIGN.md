---
name: Yu-Gi-Oh! Deck Builder
status: final
sources:
  - ../../prds/prd-yugioh-deck-builder-2026-06-03/prd.md
updated: 2026-06-03
colors:
  background-light: '#FFFFFF'
  background-dark: '#1A1A1A'
  foreground-light: '#1A1A1A'
  foreground-dark: '#E9ECEF'
  card-light: '#F8F9FA'
  card-dark: '#2D2D2D'
  card-foreground-light: '#1A1A1A'
  card-foreground-dark: '#E9ECEF'
  muted-light: '#F1F3F5'
  muted-dark: '#343434'
  muted-foreground-light: '#6C757D'
  muted-foreground-dark: '#ADB5BD'
  border-light: '#DEE2E6'
  border-dark: '#404040'
  primary-light: '#1A73E8'
  primary-dark: '#4DA3FF'
  primary-foreground-light: '#FFFFFF'
  primary-foreground-dark: '#1A1A1A'
  accent-light: '#E8F0FE'
  accent-dark: '#2A3A5C'
  accent-foreground-light: '#1A73E8'
  accent-foreground-dark: '#4DA3FF'
  destructive-light: '#DC3545'
  destructive-dark: '#F87171'
  destructive-foreground-light: '#FFFFFF'
  destructive-foreground-dark: '#1A1A1A'
  zone-main-light: '#F1F3F5'
  zone-main-dark: '#343434'
  zone-extra-light: '#E8F0FE'
  zone-extra-dark: '#2A3A5C'
  zone-side-light: '#FFF3E0'
  zone-side-dark: '#3D3528'
typography:
  font-family: Inter
  font-mono: JetBrains Mono
  scale: Tailwind default
rounded:
  default: 0.5rem
  slot: 0.25rem
spacing:
  panel-gap: 1rem
  panel-padding: 1rem
  header-height: 3rem
---

# DESIGN.md — Yu-Gi-Oh! Deck Builder

> Desktop web app (React + FastAPI). shadcn/ui on Tailwind CSS. Inherits all shadcn component defaults; this document names the brand overrides. → Wireframes in `imports/`: Screen_1.jpg (three-panel layout), Screen_2.jpg (deck builder detail). Spine wins on conflict.

## Brand & Style

Utility-first deck builder for personal card collection management. The visual identity is **neutral, utilitarian, data-dense** — the cards are the stars, not the UI. No decorative chrome, no gamified flourishes. The interface recedes so the card information is the focal point at all times.

## Colors

Inherits shadcn/ui's CSS variable system for light/dark mode. The semantic token layer (`--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, etc.) uses shadcn's defaults with the following overrides:

### Light Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#FFFFFF` | Page background |
| `--foreground` | `#1A1A1A` | Primary text |
| `--card` | `#F8F9FA` | Deck library cards, search result cards |
| `--card-foreground` | `#1A1A1A` | Card text |
| `--muted` | `#F1F3F5` | Deck slot backgrounds, empty states |
| `--muted-foreground` | `#6C757D` | Slot placeholder text, secondary labels |
| `--border` | `#DEE2E6` | Zone grid borders, card outlines |
| `--primary` | `#1A73E8` | Buttons, interactive accents |
| `--primary-foreground` | `#FFFFFF` | Text on primary backgrounds |
| `--accent` | `#E8F0FE` | Hover states on cards, selected slot highlight |
| `--accent-foreground` | `#1A73E8` | Accent text |
| `--destructive` | `#DC3545` | Delete buttons, remove-from-slot indicators |
| `--destructive-foreground` | `#FFFFFF` | Text on destructive backgrounds |

### Dark Mode

| Token | Value |
|-------|-------|
| `--background` | `#1A1A1A` |
| `--foreground` | `#E9ECEF` |
| `--card` | `#2D2D2D` |
| `--card-foreground` | `#E9ECEF` |
| `--muted` | `#343434` |
| `--muted-foreground` | `#ADB5BD` |
| `--border` | `#404040` |
| `--primary` | `#4DA3FF` |
| `--primary-foreground` | `#1A1A1A` |
| `--accent` | `#2A3A5C` |
| `--accent-foreground` | `#4DA3FF` |
| `--destructive` | `#F87171` |
| `--destructive-foreground` | `#1A1A1A` |

### Zone-Specific Colors

| Zone | Token | Light | Dark |
|------|-------|-------|------|
| Main Deck | `{colors.zone-main-light}` / `{colors.zone-main-dark}` | `#F1F3F5` | `#343434` |
| Extra Deck | `{colors.zone-extra-light}` / `{colors.zone-extra-dark}` | `#E8F0FE` | `#2A3A5C` |
| Side Deck | `{colors.zone-side-light}` / `{colors.zone-side-dark}` | `#FFF3E0` | `#3D3528` |

Color coding for card frameTypes uses the existing shadcn palette. `[ASSUMPTION: FrameType colors (Spell = green tint, Trap = purple tint, Monster = default) applied as thin left-border indicators on cards, not full backgrounds.]`

## Typography

Inherits shadcn/ui's Inter font stack (Inter for UI, JetBrains Mono for card IDs/monospaced data). Uses Tailwind's default type scale (`text-sm`, `text-base`, etc.).

### Scale

| Usage | Token | Weight |
|-------|-------|--------|
| Deck name, section titles | `text-lg` / `text-xl` | `font-semibold` |
| Card name in slot / search result | `text-sm` | `font-medium` |
| Card attribute labels (ATK, DEF, level) | `text-xs` | `font-normal` |
| Slot coordinates, counts | `text-xs` | `font-mono` |
| Description text | `text-sm` | `font-normal` `leading-relaxed` |

## Layout & Spacing

Three-panel layout with responsive flex: Left (Card Info) — **Middle (Deck Library / Deck Builder, wider)** — Right (Search). See `imports/Screen_1.jpg` for the layout sketch.

| Panel | Width | Min |
|-------|-------|-----|
| Left (Card Info) | `w-72` (288px) | `w-64` |
| Middle (Deck Library / Builder) | `flex-1` | `w-[400px]` |
| Right (Search) | `w-80` (320px) | `w-72` |

App header: `h-12` with app title and theme toggle. No sidebar, no navigation chrome — the panels are the navigation.

Spacing: Tailwind's default spacing scale (`gap-2`, `gap-4`, `p-4`, etc.). Panel separator: `border-r` on left panel, `border-l` on right panel.

## Elevation & Depth

Inherits shadcn's shadow scale. Minimal use of elevation — cards and decks sit flat on the surface. Elevated elements:

- **Modals** (confirm delete, import dialog): `shadow-lg`
- **Drag ghost** (card being dragged): `shadow-md` with `rotate-2` and `opacity-90`
- **Hovered slot**: `ring-1 ring-primary` (no elevation, just highlight)
- **Dropdown menus**: `shadow-md`

## Shapes

`--radius`: shadcn default (`0.5rem` / 8px) for cards, buttons, dialogs. Deck zone grid slots: `rounded-sm` (4px). Avatar / app icon: `rounded-full`.

## Components

Inherits shadcn/ui defaults for all base components. Overrides and additions:

| Component | Visual | Behavioral (in EXPERIENCE.md) |
|-----------|--------|-------------------------------|
| Deck Slot | `h-14 w-full`, `rounded-sm`, `bg-muted`, `border` | Hover shows card info. Drag target. Right-click removes. |
| Deck Zone | `border-2 border-dashed`, `rounded-md`, `p-2` | Contains slots. Labeled header (Main / Extra / Side) with count badge. |
| Deck Card (Library) | `flex items-center gap-3 p-3 rounded-md border bg-card` | Shows cover image (48x48 rounded), name, zone counts. Edit/Delete buttons on right. |
| Search Result | `flex items-center gap-2 p-2 rounded-sm border-b` | Hover → Card Info panel updates. Draggable. Right-click to add. |
| Card Info Panel | `flex flex-col gap-3 p-4` | Card image (max `w-full h-auto`), field rows below. |
| Theme Toggle | shadcn `DropdownMenu` with sun/moon icons | Light / Dark / System. Persists to localStorage. |
| Search Input | `flex items-center gap-2 p-2 rounded-md border bg-background w-full` | Text input with search icon. 300ms debounce. Enter also fires. |
| Create Deck Button | shadcn `Button` variant `default`, `gap-2` with plus icon | Opens inline name dialog. On confirm → deck created, Deck Builder opens. |
| Cover Image Upload | shadcn `Button` variant `outline`, file input hidden | Native file picker. Supported: PNG, JPG, JPEG, WEBP. Shows spinner during upload. |
| Save Button | shadcn `Button` variant `default`, `gap-2` with save icon | Sends decklist to backend. Shows spinner during save. Toast on result. |
| Clear Button | shadcn `Button` variant `destructive`, `gap-2` | Opens `AlertDialog` confirmation. On confirm empties all zones. |
| Sort Button | shadcn `Button` variant `outline`, `gap-2` | Sorts current zone's cards in-memory. Target: < 500ms for 60 cards. |
| Delete Button | shadcn `Button` variant `destructive`, icon-only, `gap-2` | Opens `AlertDialog` confirmation. On confirm removes deck from `decks.json`. |

## Glossary

See PRD §3. Terms used verbatim across both spines:

- **Card** — A single Yu-Gi-Oh! card identified by numeric `id`. Each card has a name, type, frameType, description, level, ATK, DEF, race, attribute, and archetype.
- **Deck** — A named collection of cards organized into three zones: Main Deck, Extra Deck, and Side Deck.
- **Main Deck** — 0–60 card slots. Contains Monster, Spell, and Trap cards.
- **Extra Deck** — 0–15 card slots. Contains Fusion, Synchro, Xyz, and Link monsters.
- **Side Deck** — 0–15 card slots. Contains cards that can be swapped in between matches.
- **Slot** — A single position in a Deck zone that holds exactly one card.
- **Decklist** — The full contents of a Deck, stored as arrays of card IDs per zone.
- **FrameType** — Card category: normal, effect, ritual, fusion, synchro, xyz, link, spell, trap.

## Do's and Don'ts

- **Do** keep the UI sparse — empty space around zones is better than crowded panels.
- **Do** let card images breathe — the Card Info panel is primarily about showing the card art at readable size.
- **Don't** use decorative illustrations or branded graphics — this is a utility tool.
- **Don't** animate transitions between panels — instant swap, no fade/slide.
- **Do** show zone counts prominently in zone headers (e.g., "Main Deck (23/60)").
- **Don't** truncate card descriptions — use a scrollable area in the Card Info panel.
