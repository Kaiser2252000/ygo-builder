# Epic 3 Context: Deck Builder Polish & Quality of Life

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Transform the deck builder from a functional prototype into a polished, visually-driven building experience. Deck slots display card images instead of text, making it easy to recognize cards at a glance. Drag interactions gain reorder-within-zone and drag-out-to-remove capabilities, while right-click removal is fixed with a proper context menu. Extra Deck zone validation enforces TCG legality (Fusion/Synchro/Xyz/Link only), and restrictive validation rules (max-3-copies, 40-60 Main Deck bounds) are removed to support experimental deck building. Performance optimizations via React.memo prevent unnecessary re-renders across 90+ slots.

## Stories

- Story 3.1: Card-Focused Deck Slots
- Story 3.2: Repair Right-Click Remove
- Story 3.3: Drag Reorder & Drag to Remove
- Story 3.4: Extra Deck Zone Validation
- Story 3.5: Remove Validation Rules
- Story 3.6: Prevent Unnecessary Re-renders

## Requirements & Constraints

- Deck slots render full card images (via /images/ route) instead of card name text; image fills the slot with object-cover or object-contain
- Occupied slots with no available image fall back to muted placeholder with card name
- Right-click on a Deck Slot opens a context menu (Remove/Cancel) instead of immediate removal
- Cards can be reordered within a zone by dragging to a new slot position; dropping on same slot is a no-op
- Dragging a card outside any valid Deck Zone removes it from the deck
- Extra Deck only accepts frameTypes fusion, synchro, xyz, link; other frameTypes rejected
- Side Deck accepts all frameTypes (no restriction on Extra-only cards entering Side)
- Main Deck rejects fusion/synchro/xyz/link frameTypes
- Backend deck validation removes max-3-copy-per-card-name check and Main Deck 40-60 bounds (any count accepted)
- DeckSlot must use React.memo to prevent re-renders of unaffected slots on add/remove
- Existing three-panel layout (Left w-72, Middle flex-1 min-w-[400px], Right w-80) with zone grids (Main 6x10, Extra 10+5, Side 10+5) is the foundation
- Drag ghost: shadow-md, rotate-2, opacity-90
- Zone tint backgrounds: Main neutral, Extra blue, Side warm
- No animations or transitions on state changes

## Technical Decisions

- @dnd-kit/core + @dnd-kit/sortable for within-zone reorder and drag-to-remove; DndContext manages drag state via sensors, not React Context
- React.memo on DeckSlot component with shallow comparison of card data to prevent cascade re-renders
- Right-click context menu: custom component or shadcn ContextMenu positioned at cursor; Escape/outside-click dismisses
- Zone validation logic lives in DeckContext dispatch (addCard action checks frameType vs target zone)
- Backend validation removed from deck_service.py PUT endpoint — no bounds/enforcement checks on save
- DeckSlot image loading uses same /images/ static mount and case-insensitive filename matching from image_service.py
- Files touched: DeckSlot.tsx, DeckZone.tsx, DeckContext.tsx, DeckBuilder.tsx, App.tsx, deck_service.py

## UX & Interaction Patterns

- Drag-to-remove replaces the previous "drag outside = return to original" behavior with actual removal; this is an intentional change from Epic 2's drag behavior
- Right-click removal is the primary removal path; context menu replaces the raw removal for safety (prevents accidental removal)
- Drag reorder within zones is the primary organization gesture alongside the Sort button
- Zone validation is silent (drop rejected, no toast/alert) — the card simply snaps back to search results
- Image-first slots make the deck visually dense; card identification shifts from reading names to recognizing artwork
- Performance: React.memo ensures only visually changed slots re-render, maintaining snappy feel across all interactions
