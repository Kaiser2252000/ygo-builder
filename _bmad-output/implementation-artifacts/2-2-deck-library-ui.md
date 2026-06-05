---
baseline_commit: NO_VCS
---

# Story 2.2: Deck Library UI

Status: done

### Review Findings

- [x] [Review][Decision] Edit/Delete buttons use text, not icons — AC 4 — fixed: replaced with inline SVG icons + aria-labels
- [x] [Review][Decision] Cover placeholder shows "No Cover" text, not card-back icon — AC 5 — fixed: replaced with document SVG icon
- [x] [Review][Decision] Create dialog confirm button shows text label, not spinner — AC 6 — fixed: CSS spinner + "Creating..." text
- [x] [Review][Decision] Delete button shows "...", not spinner — AC 7 — fixed: CSS spinner + aria-label
- [x] [Review][Patch] No try-catch in DeckCard.handleDelete — fixed: wrapped in try/finally [DeckCard.tsx:22]
- [x] [Review][Patch] No try-catch in CreateDeckDialog.handleConfirm — fixed: wrapped in try/catch/finally [CreateDeckDialog.tsx:19]
- [x] [Review][Patch] CreateDeckDialog confirm button not disabled during creation — fixed: added confirmDisabled prop
- [x] [Review][Patch] createDeck silent when API returns data:null AND error:null — fixed: added error message
- [x] [Review][Patch] deleteDeck removes deck without checking res.data — fixed: guard with res.data check
- [x] [Review][Patch] Empty/whitespace deck name silently blocked — fixed: inline error message
- [x] [Review][Patch] Stale error re-triggers toast on DeckLibrary remount — fixed: clearError after showing toast
- [x] [Review][Patch] onCancel inline callback causes keydown effect re-registration — dismissed: cleanup properly handles re-render
- [x] [Review][Patch] Stale setState after unmount in DeckCard — fixed: removed setState after onDelete (try/finally)
- [x] [Review][Patch] Test file at wrong location — dismissed: vitest config targets src/**/*.test.*, location works
- [x] [Review][Defer] No runtime API response validation — deferred, pre-existing scope concern
- [x] [Review][Defer] loadDecks useEffect no abort mechanism — deferred, component mounts once
- [x] [Review][Defer] API error message "Search failed" for non-search calls — deferred, pre-existing pattern

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Yu-Gi-Oh! player,
I want to see all my saved decks in a list, create new ones, and delete old ones,
so that I can manage my deck collection from one place.

## Acceptance Criteria

1. **Given** the app loads and no deck is selected, **When** the middle panel renders, **Then** the Deck Library view is shown as the default, **And** a `GET /api/decks` request is sent to fetch all decks.

2. **Given** decks are loading from the API, **When** data has not yet arrived, **Then** the Deck Library shows 3-4 shadcn Skeleton placeholders.

3. **Given** `decks.json` is empty (no decks exist), **When** the API returns an empty array, **Then** the Deck Library shows muted text: "No decks yet. Create your first deck to get started.", **And** a "Create New Deck" primary button is displayed below the message.

4. **Given** decks exist in the collection, **When** the API returns deck data, **Then** each deck renders as a Deck Card component showing: cover thumbnail (48×48 rounded), deck name (semibold), zone counts ("Main 42 / Extra 8 / Side 0"), Edit button (icon), Delete button (destructive icon).

5. **Given** a deck has no cover image, **When** the Deck Card renders, **Then** a muted card-back icon placeholder is shown instead of a cover thumbnail.

6. **Given** a user clicks "Create New Deck", **When** the create flow starts, **Then** a small dialog or inline prompt asks for a deck name, **And** a `POST /api/decks` request is sent with the entered name, **And** the button shows a spinner while the request is in flight, **And** on success, the middle panel switches to Deck Builder view with the new deck.

7. **Given** a user clicks the Delete button on a deck, **When** the delete flow starts, **Then** an AlertDialog confirms: "Delete [deck name]?", **And** the button shows a spinner during the `DELETE /api/decks/{id}` request, **And** on success, the deck is removed from the list, **And** on failure, a destructive Toast shows the error.

8. **Given** a user types in a deck search input, **When** the query is "Dragon", **Then** the deck list filters to show only decks whose name contains "Dragon" (client-side filter), **And** decks that don't match are hidden.

9. **Given** a user clicks a deck row (not on Edit or Delete buttons), **When** the deck is selected, **Then** the middle panel switches to Deck Builder view with that deck loaded.

## Tasks / Subtasks

- [ ] Create deck data types (AC: 1, 4, 5, 6, 7, 9)
  - [ ] Create `frontend/src/types/deck.ts` with `Deck` and `Decklist` interfaces matching the backend's `decks.json` shape.
  - [ ] `Deck` must have: `id: string`, `name: string`, `cover: string | null`, `decklist: Decklist`.
  - [ ] `Decklist` must have: `main-deck: number[]`, `extra-deck: number[]`, `side-deck: number[]`.

- [ ] Create DeckContext provider and hook (AC: 1, 3, 4, 6, 7, 9)
  - [ ] Create `frontend/src/contexts/DeckContext.tsx` (provider) following the same pattern as CardInfoContext/SearchContext.
  - [ ] Create `frontend/src/contexts/deckContextValue.ts` with `DeckState`, `DeckContextType`, and `createContext`.
  - [ ] Create `frontend/src/hooks/useDeck.ts` following same pattern as `useCardInfo.ts`.
  - [ ] State must include: `decks: Deck[]`, `isLoading: boolean`, `error: string | null`, `activeDeckId: string | null`, `view: 'library' | 'builder'`.
  - [ ] Actions must include: `loadDecks`, `createDeck(name)`, `deleteDeck(id)`, `setActiveDeck(id)`, `setView(view)`.
  - [ ] `loadDecks` must be called on mount and call `GET /api/decks`.
  - [ ] `createDeck` must POST to `/api/decks`, on success set the new deck as active and switch to builder view.
  - [ ] `deleteDeck` must DELETE `/api/decks/{id}`, on success remove from local state.
  - [ ] Use `useCallback` and avoid stale closures with latest-request-id pattern as SearchProvider does.
  - [ ] All API errors surface via the context's `error` field so consumers can show toasts.

- [ ] Add deck API functions to lib/api.ts (AC: 1, 6, 7)
  - [ ] Add `fetchDecks()`: `GET /api/decks` → `ApiResponse<Deck[]>`.
  - [ ] Add `createDeck(name: string)`: `POST /api/decks` with `{"name": name}` → `ApiResponse<Deck>`.
  - [ ] Add `deleteDeck(id: string)`: `DELETE /api/decks/{id}` → `ApiResponse<{id: string}>`.

- [ ] Create DeckLibrary component (AC: 1, 2, 3, 4, 5, 6, 7, 8, 9)
  - [ ] Create `frontend/src/components/deck-library/DeckLibrary.tsx`.
  - [ ] On mount, call `loadDecks` from `useDeck()`.
  - [ ] While `isLoading`, render 3-4 Skeleton placeholders (h-20 w-full).
  - [ ] When `decks` is empty and not loading, show empty state: muted text + "Create New Deck" button.
  - [ ] When decks exist, render a list of `DeckCard` components.
  - [ ] Add a search input at the top (client-side filter by deck name, no API call).
  - [ ] "Create New Deck" at the top (primary button) → create flow.

- [ ] Create DeckCard component (AC: 4, 5, 7, 9)
  - [ ] Create `frontend/src/components/deck-library/DeckCard.tsx`.
  - [ ] Visual: flex row with cover thumbnail (48×48, rounded), deck name (semibold), zone counts text, Edit button, Delete button.
  - [ ] Cover: if `deck.cover` is set, show `<img>` with `/uploads/covers/` URL; if null, show a muted placeholder icon/div.
  - [ ] Zone count format: "Main {count} / Extra {count} / Side {count}" — extract from decklist arrays.
  - [ ] Click on the row body (not Edit/Delete) → `setActiveDeck(id)` + `setView('builder')`.
  - [ ] Edit button → `setActiveDeck(id)` + `setView('builder')` (same as row click).
  - [ ] Delete button → open AlertDialog confirmation → on confirm call `deleteDeck(id)`.

- [ ] Create CreateDeckDialog component (AC: 6)
  - [ ] Create `frontend/src/components/deck-library/CreateDeckDialog.tsx`.
  - [ ] Small dialog/modal with a text input for deck name and Confirm/Cancel buttons.
  - [ ] On confirm: call `createDeck(name)` from `useDeck()`.
  - [ ] Show spinner on the confirm button during the API call.

- [ ] Wrap App with DeckProvider and update MiddlePanel (AC: 1, 9)
  - [ ] In `App.tsx`, wrap with `<DeckProvider>` inside `<CardInfoProvider>`.
  - [ ] Replace `MiddlePanel.tsx` content: when `view === 'library'` render `<DeckLibrary>`, when `view === 'builder'` render placeholder text or the existing placeholder.
  - [ ] Preserve the three-panel layout and all existing providers.

- [ ] Frontend component tests (AC: 1-9)
  - [ ] Create `tests/frontend/components/DeckLibrary.test.tsx` using Vitest + @testing-library/react.
  - [ ] Mock `lib/api.ts` so tests don't hit a real backend.
  - [ ] Test: loading state shows skeletons, empty state shows "No decks yet", populated state shows deck cards.
  - [ ] Test: create deck dialog opens, name input works, confirm calls API.
  - [ ] Test: delete button opens AlertDialog, confirm calls delete API.
  - [ ] Test: deck search input filters by name.
  - [ ] Test: clicking a deck row calls setActiveDeck + setView('builder').

## Dev Notes

### Current State to Preserve

- `frontend/src/App.tsx` already has three providers in this order: `ToastProvider` → `SearchProvider` → `CardInfoProvider`. Add `DeckProvider` as the outermost wrapper (before SearchProvider) since Deck state is independent.
- `frontend/src/components/layout/MiddlePanel.tsx` currently renders a placeholder `<p>Deck Builder — coming soon</p>`. Replace with conditional rendering based on `view` from `useDeck()`.
- `frontend/src/lib/api.ts` already has `apiGet<T>(path)` and `searchCards`. Add deck-specific functions reusing the same `ApiResponse<T>` pattern.
- `frontend/src/types/card.ts` already exists. Create a new `frontend/src/types/deck.ts`.
- Existing UI primitives in `frontend/src/components/ui/`: `Button`, `Input`, `Skeleton`, `ToastProvider`/`useToast`/`toastContext`.
- Backend routes `GET /api/decks`, `POST /api/decks`, `DELETE /api/decks/{id}` are implemented in Story 2.1 and ready to consume.
- Backend serves uploaded covers at `/uploads/covers/` via static mount.
- Toast pattern from Epic 1: `useToast().addToast(msg, 'default'|'destructive')`.
- DeckContext must never do raw `.then()` — use `async/await` throughout.
- No `any` type — use `unknown` for truly dynamic values if needed.

### State Machine

```
view: 'library' ── click deck row/setActiveDeck ──→ view: 'builder'
        ↑                                                │
        └────── createDeck success ──────────────────────┘
```

DeckContext provides a single source of truth for the deck list. It is not the same as the active deck's card state (that comes in Story 2.3/2.4). For now, `activeDeckId` is enough to know which deck to load in builder view.

### Data Contracts

```typescript
// frontend/src/types/deck.ts
export interface Decklist {
  "main-deck": number[]
  "extra-deck": number[]
  "side-deck": number[]
}

export interface Deck {
  id: string
  name: string
  cover: string | null
  decklist: Decklist
}
```

Backend `GET /api/decks` returns: `{data: Deck[], error: null}` or `{data: null, error: {code: string, message: string}}`.
Backend `POST /api/decks` with body `{"name": "..."}` returns: `{data: Deck, error: null}`.
Backend `DELETE /api/decks/{id}` returns: `{data: {id: string}, error: null}`. HTTP 404 for unknown ID.

### Architecture Requirements

- Follow the established React Context pattern: context value in a separate file (`deckContextValue.ts`), provider in `DeckContext.tsx`, hook in `useDeck.ts`.
- API calls go through `lib/api.ts` — do not use raw `fetch` in components or hooks.
- Components live in `components/deck-library/` per architecture.
- TypeScript strict mode — avoid `any`.
- snake_case for API JSON fields (`main-deck`, not `mainDeck`).
- camelCase for JS/TS variables, PascalCase for components and files.
- No comments in implementation code unless genuinely non-obvious.
- No emoji in code.

### Expected Files to Create

- `frontend/src/types/deck.ts` — NEW
- `frontend/src/contexts/deckContextValue.ts` — NEW
- `frontend/src/contexts/DeckContext.tsx` — NEW
- `frontend/src/hooks/useDeck.ts` — NEW
- `frontend/src/components/deck-library/DeckLibrary.tsx` — NEW
- `frontend/src/components/deck-library/DeckCard.tsx` — NEW
- `frontend/src/components/deck-library/CreateDeckDialog.tsx` — NEW
- `tests/frontend/components/DeckLibrary.test.tsx` — NEW

### Expected Files to Modify

- `frontend/src/lib/api.ts` — add deck API functions
- `frontend/src/App.tsx` — add DeckProvider wrapper
- `frontend/src/components/layout/MiddlePanel.tsx` — replace placeholder with conditional DeckLibrary/Builder

### Do NOT Touch

- `frontend/src/components/card-search/` — existing search implementation
- `frontend/src/components/card-info/` — existing card info implementation
- `frontend/src/contexts/SearchContext.tsx`, `searchContextValue.ts` — search state
- `frontend/src/contexts/CardInfoContext.tsx`, `cardInfoContextValue.ts` — card info state
- `backend/` — all backend files (Story 2.1 is already done)
- `db/` — data files
- `tests/backend/` — backend tests

### Testing Standards

- Vitest + @testing-library/react for frontend component tests.
- Mock `lib/api.ts` using `vi.mock` — do not make real HTTP calls.
- Test behavior, not implementation details.
- Focus on: loading states, empty states, populated list, create flow, delete flow, search filter.
- Test file at `tests/frontend/components/DeckLibrary.test.tsx`.
- After implementation, run `npm run build` and `npm run lint` from `frontend/`.

### References

- Story 2.2 requirements and ACs: `_bmad-output/planning-artifacts/epics.md:254-309`
- Deck data shape and backend endpoints: `_bmad-output/planning-artifacts/prds/prd-yugioh-deck-builder-2026-06-03/addendum.md:22-28`
- Deck Card component visual spec: `_bmad-output/planning-artifacts/ux-designs/ux-yugioh-deck-builder-2026-06-03/DESIGN.md:160`
- Experience flows for library/creation/deletion: `_bmad-output/planning-artifacts/ux-designs/ux-yugioh-deck-builder-2026-06-03/EXPERIENCE.md:23-28,63-64,69-70,124-136`
- Architecture project structure and naming: `_bmad-output/planning-artifacts/architecture.md:196-236`
- Existing context/hook patterns in Epic 1: `frontend/src/contexts/SearchContext.tsx`, `frontend/src/contexts/CardInfoContext.tsx`
- Story 2.1 backend implementation (deck CRUD): `_bmad-output/implementation-artifacts/2-1-deck-crud-backend.md`
- Project rules: `_bmad-output/project-context.md`

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
