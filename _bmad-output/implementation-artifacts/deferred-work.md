## Deferred from: code review of 1-1-search-cards-by-name-or-description (2026-06-03)

- Frontend component tests do not cover async search, loading, empty, and toast behavior. Deferred because the frontend test harness/script is not configured in this story; add Vitest + Testing Library coverage when frontend test setup is introduced.

## Deferred from: code review of 1-2-view-card-details-and-image-on-hover (2026-06-03)

- Frontend component tests do not cover CardInfo hover/loading/fallback behavior. Deferred because the frontend test harness/script is not configured in this story; add Vitest + Testing Library coverage when frontend test setup is introduced.

## Deferred from: code review of 2-1-deck-crud-backend (2026-06-03)

- Malformed existing `decks.json` recovery policy is unspecified. Current code can fail with a generic 500 if the persisted file is corrupt or structurally invalid; decide later whether to fail closed, repair from backup, or reset only with explicit user approval.

## Deferred from: code review of 2-2-deck-library-ui (2026-06-03)

- No runtime API response validation — broader architectural scope, TypeScript types assumed at runtime
- loadDecks useEffect no abort mechanism — component mounts once, low impact
- API error message "Search failed" for non-search calls — pre-existing pattern in apiGet

## Deferred from: code review of 2-3-deck-builder-layout-and-zone-grids (2026-06-03)

- Deck not found (undefined after filter) returns null silently — pre-existing pattern, no user-facing feedback
- No loading state for initial deck data — useDeck handles loading, component defers to parent
- No fallback for unknown view values — pre-existing pattern in MiddlePanel
- Stale card cache never invalidates — pre-existing design (list cache also unbounded)

## Deferred from: code review of 2-4-drag-and-drop-and-right-click-card-management (2026-06-03)

- No visual feedback when right-click add to full deck silently no-ops [SearchResult.tsx:41] — UX enhancement
- apiGet/apiPost lacks Content-Type check before res.json() [api.ts:15] — pre-existing pattern
- No per-card copy limit enforcement (3-copy rule) [DeckContext.tsx:93-103] — out of scope
- Context menu can appear during active drag operation [App.tsx, DeckSlot.tsx:45-48] — low-severity edge case
- No frontend validation for empty deck name [api.ts:74] — pre-existing
- DeckSlot lacks keyboard focus/accessibility for hover state [DeckSlot.tsx:23-66] — pre-existing from story 2.3
- Transient isLoading flash on concurrent loadDecks calls [DeckContext.tsx:15-29] — pre-existing
- Oversized decklist (>maxCount) cards silently truncated on display [DeckBuilder.tsx:76-82] — pre-existing defensive gap

## Deferred from: code review of 2-5-sort-and-clear-deck (2026-06-03)

- Clear can confirm against wrong deck if user switches decks while dialog open — pre-existing dialog pattern, scope-limited fix
- Case-sensitive frameType check could fail on API casing variance — API contract assumption, no evidence of mismatch
- Sort button not disabled during active drag — enhancement, low severity

## Deferred from: code review of 3-1-card-focused-deck-slots (2026-06-03)

- No loading placeholder during image fetch — empty 112px slot visible while card image loads. Add skeleton/spinner in future UX polish cycle.
