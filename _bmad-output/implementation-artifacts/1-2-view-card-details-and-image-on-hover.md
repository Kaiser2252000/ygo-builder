# Story 1.2: View Card Details and Image on Hover

Status: done

## Story

As a Yu-Gi-Oh! player,
I want to hover over a search result and see the full card details and image,
So that I can inspect a card's stats, description, and artwork without opening another tool.

## Acceptance Criteria

1. **Given** no card is currently hovered, **When** the Card Info panel is idle, **Then** it shows muted placeholder text: "Hover a card to view details."

2. **Given** a search result is hovered, **When** the card name is "Dark Magician", **Then** the Card Info panel displays the card image loaded from the local image folder via the `/images/` static route, **And** the system matches the filename case-insensitively, including examples like `dark magician.jpg` and `DARK MAGICIAN.PNG`.

3. **Given** a card is hovered, **When** it has CSV data, **Then** the Card Info panel shows: name, type, frameType, description, level, ATK, DEF, race, attribute, archetype.

4. **Given** a Spell or Trap card is hovered, **When** ATK, DEF, or level fields are not applicable, **Then** those fields show "-" instead of numeric values.

5. **Given** a card is hovered but no matching image file exists in the local folder, **When** image lookup returns no match, **Then** the Card Info panel shows a "No image" placeholder, **And** the text data from CSV is still fully displayed.

6. **Given** the card image is loading, **When** the image has not yet loaded, **Then** a shadcn Skeleton placeholder is shown in the image area.

## Tasks / Subtasks

- [x] **Backend: image filename resolution** (AC: 2, 5)
  - [x] Create `backend/services/image_service.py` with `find_card_image_url(card_name: str) -> str | None`.
  - [x] Scan `IMAGE_PATH` from `backend/config.py`; match candidate files by case-insensitive filename stem against `card_name`.
  - [x] Support common image extensions at minimum: `.jpg`, `.jpeg`, `.png`, `.webp`.
  - [x] Return a browser-safe `/images/<url-encoded-filename>` path for the actual matched filename.
  - [x] Return `None` if `IMAGE_PATH` does not exist, is not readable, or no matching file exists.

- [x] **Backend: include image URL in card API payloads** (AC: 2, 5)
  - [x] Update `backend/routes/cards.py` serialization to include `imageUrl` for each card using `find_card_image_url(card.name)`.
  - [x] Preserve the existing API envelope `{data, error}` and existing CSV-facing fields.
  - [x] Keep `def` in the response payload, not Python's internal `def_`.
  - [x] Do not hardcode the local image folder anywhere except `backend/config.py`.

- [x] **Frontend: CardInfoContext and hook** (AC: 1-6)
  - [x] Create `frontend/src/contexts/cardInfoContextValue.ts` exporting `CardInfoContext` and types.
  - [x] Create `frontend/src/contexts/CardInfoContext.tsx` with selected hovered card state and `setHoveredCard(card: Card | null)`.
  - [x] Create `frontend/src/hooks/useCardInfo.ts` with the same null-guard pattern as `useCardSearch`.
  - [x] Wrap the app in `CardInfoProvider` alongside the existing `SearchProvider`.

- [x] **Frontend: card type update** (AC: 2, 3, 5)
  - [x] Update `frontend/src/types/card.ts` to include optional `imageUrl: string | null`.
  - [x] Keep all existing Story 1.1 fields intact: id, name, type, frameType, description, level, atk, def, race, attribute, archetype.

- [x] **Frontend: hover wiring from search results** (AC: 1-3)
  - [x] Update `frontend/src/components/card-search/SearchResult.tsx` so each result row calls `setHoveredCard(card)` on `onMouseEnter`.
  - [x] Clear the card info with `setHoveredCard(null)` on `onMouseLeave` from a result row.
  - [x] Preserve existing result rendering, loading state, empty state, and scrollable list behavior from Story 1.1.

- [x] **Frontend: Card Info panel components** (AC: 1, 3-6)
  - [x] Create `frontend/src/components/card-info/CardInfoPanel.tsx`.
  - [x] Create `frontend/src/components/card-info/CardImage.tsx`.
  - [x] Update `frontend/src/components/layout/LeftPanel.tsx` to render `CardInfoPanel` instead of the placeholder-only content.
  - [x] Idle state must show only the muted placeholder: "Hover a card to view details."
  - [x] Card detail state must show image area first, then field rows for name, type, frameType, description, level, ATK, DEF, race, attribute, archetype.
  - [x] Use "-" for null/undefined/empty level, ATK, or DEF values.
  - [x] Use "No image" placeholder when `imageUrl` is null or image load fails.
  - [x] Show the existing shadcn `Skeleton` while the image is loading.

- [x] **Tests and validation** (AC: 1-6)
  - [x] Add backend pytest coverage for `find_card_image_url`: exact/case-insensitive stem match, supported extension match, no match, missing directory.
  - [x] Update backend route tests to assert `imageUrl` is present and nullable.
  - [x] If frontend test harness is available, add component tests for idle, hovered card fields, no-image fallback, image skeleton, and hover wiring. If not available, document the gap in Dev Agent Record and validate with `npm run build` and `npm run lint`.
  - [x] Run `python -m pytest`, `npm run build`, and `npm run lint`.

### Review Findings

- [x] [Review][Patch] Image lookup performs a full directory scan per card [backend/services/image_service.py:10]
- [x] [Review][Patch] Search result preview is hover-only and lacks keyboard focus support [frontend/src/components/card-search/SearchResult.tsx:7]
- [x] [Review][Defer] Frontend component tests do not cover CardInfo hover/loading/fallback behavior [tests/backend/test_image_service.py:1] — deferred, frontend test harness/script is not configured in this story

## Dev Notes

### Current State to Preserve

- Story 1.1 is `done`; card search already works and must not regress.
- `frontend/src/components/card-search/SearchResult.tsx` currently renders name/type rows, 4 skeletons while loading, muted zero-result text, and no output before an empty query. Preserve all of that while adding hover handlers.
- `frontend/src/contexts/SearchContext.tsx` already protects against stale async search responses with `latestRequestId`. Do not remove that guard.
- `backend/routes/cards.py` already serializes `def` from `Card.def_`, wraps responses in `{data, error}`, and logs search failures. Preserve that behavior.
- `frontend/src/components/layout/LeftPanel.tsx` currently owns the left panel dimensions: `w-72 min-w-64 h-full flex flex-col gap-3 p-4 border-r`. Keep those layout constraints.

### Architecture Requirements

- Backend image lookup belongs in `backend/services/image_service.py`; routes delegate to services.
- Card images are served through FastAPI static mount `/images`, already configured in `backend/main.py`.
- Case-insensitive matching must happen server-side by scanning `IMAGE_PATH`; browser URL guesses cannot reliably handle casing or extension differences.
- Use `urllib.parse.quote` or equivalent safe URL encoding for returned `/images/<filename>` values.
- Keep the app single-user/local. No cloud calls, no image uploads, no external image APIs.
- Frontend state must follow the existing React Context pattern: one domain context plus paired hook with null guard.
- Components should stay pure; side effects are limited to image load state inside `CardImage`.

### UX Requirements

- Card Info panel visual pattern: `flex flex-col gap-3 p-4`; image max `w-full h-auto`; field rows below.
- Placeholder text: `Hover a card to view details.`
- Missing image placeholder text: `No image`.
- Description must remain readable and not be truncated; use a scrollable panel area if vertical space is constrained.
- Do not add animations or transitions. Instant state changes only.
- Keep the neutral, utility-focused UI. No decorative card art placeholders beyond the text fallback unless already available locally.

### Data Contract

Existing `Card` frontend fields:

```ts
id: number
name: string
type: string
frameType: string
description: string
level: number | null
atk: number | null
def: number | null
race: string
attribute: string
archetype: string
imageUrl?: string | null
```

Backend response must keep the existing field names exactly. Add `imageUrl`; do not rename `frameType` or `def`.

### Previous Story Intelligence

- Story 1.1 added backend pytest tests under `tests/backend/test_card_search.py`. Reuse its import/path pattern for new backend tests.
- Story 1.1 deferred frontend component tests because no frontend test script/harness is currently configured. Do not add new frontend dependencies without user approval; if no harness exists, validate with build/lint and leave a clear Dev Agent Record note.
- Code review for Story 1.1 found stale async response handling and missing backend diagnostics; both were fixed. Preserve both fixes.

### File Structure Requirements

New files expected:

- `backend/services/image_service.py`
- `tests/backend/test_image_service.py`
- `frontend/src/contexts/cardInfoContextValue.ts`
- `frontend/src/contexts/CardInfoContext.tsx`
- `frontend/src/hooks/useCardInfo.ts`
- `frontend/src/components/card-info/CardInfoPanel.tsx`
- `frontend/src/components/card-info/CardImage.tsx`

Files expected to update:

- `backend/routes/cards.py`
- `frontend/src/App.tsx`
- `frontend/src/types/card.ts`
- `frontend/src/components/card-search/SearchResult.tsx`
- `frontend/src/components/layout/LeftPanel.tsx`
- `tests/backend/test_card_search.py`

### Testing Requirements

- Backend: pytest service tests for image lookup and route serialization.
- Frontend: `npm run build` and `npm run lint` are required. Frontend component tests are desirable but currently blocked unless the dev first adds a frontend test setup with approval.
- Regression: existing Story 1.1 search behavior must still pass.

### References

- Story 1.2 ACs and requirements: `_bmad-output/planning-artifacts/epics.md`, Story 1.2.
- FR17/FR18 card info requirements: `_bmad-output/planning-artifacts/prds/prd-yugioh-deck-builder-2026-06-03/prd.md`, section 4.5.
- Static `/images` and image path constraints: `_bmad-output/planning-artifacts/architecture.md`, Technical Constraints and API & Communication.
- UX Card Info behavior: `_bmad-output/planning-artifacts/ux-designs/ux-yugioh-deck-builder-2026-06-03/EXPERIENCE.md`, Component Patterns and Flow 2.
- Visual Card Info pattern: `_bmad-output/planning-artifacts/ux-designs/ux-yugioh-deck-builder-2026-06-03/DESIGN.md`, Components.
- Project rules: `_bmad-output/project-context.md`.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `python -m pytest tests/backend/test_image_service.py` - 4 passed.
- `python -m pytest tests/backend/test_card_search.py` - 5 passed.
- `python -m pytest` - 10 passed.
- `npm run build` - passed.
- `npm run lint` - passed.
- `npm test` - not available; frontend package has no `test` script.

### Completion Notes List

- Added backend image filename resolution with case-insensitive stem matching, supported image extensions, URL encoding, and missing-directory/no-match fallbacks.
- Added `imageUrl` to card API payloads while preserving existing Story 1.1 response fields and error envelope behavior.
- Added CardInfo context/hook and wrapped the app with `CardInfoProvider`.
- Added Card Info panel and image component with idle placeholder, image loading skeleton, no-image fallback, and all required CSV fields.
- Wired search-result hover enter/leave to update and clear the Card Info panel.
- Frontend component tests remain blocked by the missing frontend test script/harness; validated with TypeScript build and ESLint instead.
- Resolved review finding: image filename lookup now builds and reuses an in-memory index instead of scanning the image directory once per card.
- Resolved review finding: search result rows now support keyboard focus/blur for Card Info preview.

### File List

- `backend/routes/cards.py`
- `backend/services/image_service.py`
- `frontend/src/App.tsx`
- `frontend/src/components/card-info/CardImage.tsx`
- `frontend/src/components/card-info/CardInfoPanel.tsx`
- `frontend/src/components/card-search/SearchResult.tsx`
- `frontend/src/components/layout/LeftPanel.tsx`
- `frontend/src/contexts/CardInfoContext.tsx`
- `frontend/src/contexts/cardInfoContextValue.ts`
- `frontend/src/hooks/useCardInfo.ts`
- `frontend/src/types/card.ts`
- `tests/backend/test_card_search.py`
- `tests/backend/test_image_service.py`
- `_bmad-output/implementation-artifacts/1-2-view-card-details-and-image-on-hover.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-06-03: Implemented Story 1.2 card info hover panel, image URL resolution, backend tests, and validation; marked ready for review.
- 2026-06-03: Addressed code review findings and marked Story 1.2 done.
