---
baseline_commit: NO_VCS
---

# Story 2.6: Save, Cover Upload, Import, and Export

Status: ready-for-dev

## Story

As a Yu-Gi-Oh! player,
I want to save my deck, set a cover image, and share or restore decks via text files,
so that my work is persisted, visually recognizable, and portable.

## Acceptance Criteria

1. **Given** Deck Builder has unsaved changes, **When** the user clicks Save, **Then** button shows spinner + is disabled, PUT /api/decks/{id} is sent with current decklist, on success a default Toast "Deck saved." (auto-dismiss 3s), on failure a destructive Toast "Couldn't save. Check server connection." (manual dismiss).

2. **Given** the user clicks "Upload Cover", **When** flow starts, **Then** native file picker opens (PNG/JPG/JPEG/WEBP), button shows spinner during upload. POST /api/decks/{id}/cover (multipart) request sent. On success, cover preview updates immediately. On failure, destructive Toast: "Couldn't upload cover. Supported formats: PNG, JPG, WEBP."

3. **Given** the user clicks Export, **When** deck has cards, **Then** GET /api/decks/{id}/export returns a .txt file download with `#main` / `#extra` / `!side` format, card IDs as lines. Empty zones omitted.

4. **Given** the user clicks Import, **When** flow starts, **Then** native file picker opens (.txt), file content sent to POST /api/decks/import. Backend parses YDK format.

5. **Given** imported file has valid card IDs, **When** parsing succeeds, **Then** Deck Builder populates with imported cards in correct zones, zone counts update.

6. **Given** imported file contains unknown card IDs (e.g. 999999), **When** parsing detects them, **Then** AlertDialog: "Unknown card IDs: 999999. These cards were skipped." Valid cards still loaded.

7. **Given** imported file is malformed (missing headers, scrambled), **When** parsing fails, **Then** AlertDialog: "Couldn't parse file. Expected format: #main, #extra, !side sections with card IDs." No changes to current deck.

## Tasks / Subtasks

- [ ] Backend: POST /api/decks/{id}/cover endpoint (AC: 2)
  - [ ] Accept multipart file upload, validate format (PNG/JPG/JPEG/WEBP) and size (max 5MB)
  - [ ] Save to `uploads/covers/{deck_id}.{ext}`, update deck's `cover` field in decks.json
  - [ ] Return updated deck object on success, 400 on invalid format/size, 404 on unknown deck

- [ ] Backend: GET /api/decks/{id}/export endpoint (AC: 3)
  - [ ] Build text in YDK format (#main / #extra / !side headers, card IDs as lines)
  - [ ] Omit empty zones
  - [ ] Return as `text/plain` (or JSON envelope with the text content)
  - [ ] 404 on unknown deck

- [ ] Backend: POST /api/decks/import endpoint (AC: 4, 5, 6, 7)
  - [ ] Accept text content (raw body or multipart file)
  - [ ] Parse YDK format: `#main`, `#extra`, `!side` sections with card IDs
  - [ ] Validate each card ID against CSV cache
  - [ ] Return parsed decklist + list of invalid IDs
  - [ ] Return 400 if malformed (missing headers, scrambled content)

- [ ] Frontend: Add Save button to DeckBuilder header (AC: 1)
  - [ ] Button variant `default`, text "Save", disabled + spinner during save
  - [ ] On click: call `updateDeck()` API with current decklist
  - [ ] Show Toast: default on success, destructive on failure
  - [ ] Use `useToast()` hook for toast notifications

- [ ] Frontend: Add Upload Cover button to DeckBuilder (AC: 2)
  - [ ] Button variant `default` (no `outline` available), text "Upload Cover"
  - [ ] Hidden `<input type="file" accept=".png,.jpg,.jpeg,.webp">` triggered by button click
  - [ ] Show spinner + disabled state during upload
  - [ ] POST multipart to /api/decks/{id}/cover using FormData
  - [ ] On success: update deck cover in DeckContext, preview updates
  - [ ] On failure: destructive Toast

- [ ] Frontend: Add Export button to DeckBuilder (AC: 3)
  - [ ] Button variant `ghost`, text "Export"
  - [ ] On click: fetch GET /api/decks/{id}/export
  - [ ] Trigger .txt file download (create blob, createObjectURL, temporary `<a>` click)
  - [ ] Disabled when deck is empty in all zones

- [ ] Frontend: Add Import button to DeckBuilder (AC: 4, 5, 6, 7)
  - [ ] Button variant `ghost`, text "Import"
  - [ ] Hidden `<input type="file" accept=".txt">` triggered by button click
  - [ ] Read file content, POST to /api/decks/import
  - [ ] On success: update deck zones with imported cards (clear + fill)
  - [ ] On invalid IDs: AlertDialog showing invalid IDs, load valid cards
  - [ ] On parse error: AlertDialog with error message, no changes
  - [ ] Show destructive Toast on network failure

- [ ] Frontend: Wire Save button to API (AC: 1)
  - [ ] Update api.ts: `updateDeck()` already exists (PUT /api/decks/{id}), verify it works with current Decklist shape
  - [ ] Add `uploadCover(deckId: string, file: File)` to api.ts
  - [ ] Add `exportDeck(deckId: string)` to api.ts
  - [ ] Add `importDeck(deckId: string, content: string)` to api.ts

- [ ] Frontend tests (AC: all)
  - [ ] Create `frontend/src/__tests__/DeckSaveImportExport.test.tsx`
  - [ ] Test: Save button renders in DeckBuilder header
  - [ ] Test: Save button calls updateDeck API with current decklist
  - [ ] Test: Save shows success Toast on success
  - [ ] Test: Save shows destructive Toast on failure
  - [ ] Test: Save button disabled + shows spinner during save
  - [ ] Test: Upload Cover button opens file picker
  - [ ] Test: Upload Cover calls uploadCover API
  - [ ] Test: Export button triggers file download
  - [ ] Test: Export disabled when deck empty
  - [ ] Test: Import button opens file picker
  - [ ] Test: Import calls importDeck API with file content
  - [ ] Test: Import with invalid IDs shows AlertDialog
  - [ ] Test: Import with parse error shows AlertDialog
  - [ ] Test: Import success populates deck zones
  - [ ] Test: Import network failure shows destructive Toast

- [ ] Backend tests (AC: all)
  - [ ] Create `backend/tests/test_deck_export_import.py`
  - [ ] Test: export returns correct YDK format
  - [ ] Test: export with empty zone omits that section
  - [ ] Test: import valid YDK content
  - [ ] Test: import with unknown card IDs reports them
  - [ ] Test: import with malformed content returns error
  - [ ] Test: cover upload with valid image
  - [ ] Test: cover upload with invalid format rejects
  - [ ] Test: cover upload for non-existent deck returns 404

## Dev Notes

### Current State to Preserve

- **DeckBuilder.tsx**: Currently renders three DeckZones + Clear button + AlertDialog + context menu. Add Save, Upload Cover, Export, Import buttons in the header row. The `deck.decklist` is available at this level for Save/Export. No API persistence currently exists for save — state is in-memory only.
- **DeckContext.tsx**: `updateDeck` is NOT currently implemented in the context (only createDeck, deleteDeck). Need to add `saveDeck(deckId: string)` to DeckContext that calls `updateDeck` API.
- **api.ts**: `updateDeck()` exists as a PUT call. Need to add `uploadCover()`, `exportDeck()`, `importDeck()`.
- **backend/routes/decks.py**: Has GET/POST/PUT/DELETE for decks. PUT /api/decks/{id} already handles save (update_deck). Need to add import/export/cover endpoints.
- **backend/services/deck_service.py**: Has `update_deck()`, `list_decks()`, `create_deck()`, `delete_deck()`. Need to add `export_deck()`, `import_deck_ydk()`, `upload_cover()`.
- **Button component**: Only supports variants `"default" | "ghost" | "destructive"`. No `"outline"` variant — use `"ghost"` for Export/Import, `"default"` for Save and Upload Cover.

### Save Flow

```
Save button clicked
  → setSaving(true)
  → const decklist = deck.decklist
  → api.updateDeck(activeDeckId, decklist)
  → on success: addToast("Deck saved.", "default"), setSaving(false)
  → on failure: addToast("Couldn't save. Check server connection.", "destructive"), setSaving(false)
```

- Save should be available in DeckContext: `saveDeck(deckId: string) => Promise<void>`
- Button shows spinner via `disabled={saving}` + spinner icon or text change
- Spinner can be a simple CSS animation or text indicator (no icon library available)

### Cover Upload Flow

```
Upload Cover button clicked
  → hiddenInputRef.current.click()
  → File selected (change event)
  → setUploading(true)
  → const formData = new FormData()
  → formData.append("file", file)
  → POST /api/decks/{id}/cover with FormData (no Content-Type header — browser sets multipart)
  → on success: update deck.cover in DeckContext with returned path
  → setUploading(false)
  → on failure: addToast("Couldn't upload cover...", "destructive"), setUploading(false)
```

- Backend: `File` type from `fastapi.UploadFile`
- Validate: extension in {.png, .jpg, .jpeg, .webp}, content-type starts with "image/", file size < 5MB
- Save to `uploads/covers/{deck_id}.{ext}`
- Update deck's `cover` field to `"/uploads/covers/{deck_id}.{ext}"`

### Export Flow

```
Export button clicked
  → getDeckExport(activeDeckId) → returns YDK text
  → const blob = new Blob([text], { type: "text/plain" })
  → const url = URL.createObjectURL(blob)
  → const a = document.createElement("a")
  → a.href = url, a.download = `${deck.name}.txt`
  → a.click()
  → URL.revokeObjectURL(url)
```

- Export button disabled when `deck.decklist["main-deck"].length === 0 && deck.decklist["extra-deck"].length === 0 && deck.decklist["side-deck"].length === 0`
- Backend returns the YDK text as plain text or inside JSON envelope `{ data: { ydk: "...", filename: "..." } }` — decide per consistency. Use JSON envelope with `content` field for consistency with other API responses.

### Import Flow

```
Import button clicked
  → hiddenInputRef.current.click()
  → File selected (change event)
  → reader.readAsText(file)
  → on load: POST /api/decks/import with body { content: reader.result }
  → on success: parse response — if invalidIds.length > 0: show AlertDialog, set deck zones to valid cards; else: set deck zones directly
  → on parse error: AlertDialog with error message, no state change
  → on network error: destructive Toast
```

- Import replaces ALL current zones — clear existing zones, then populate with imported valid cards
- Import only works when a deck is open in Deck Builder
- If file is empty (no valid cards after parsing), show AlertDialog: "No valid cards found in the imported file."

### Backend YDK Parser Specification

```
Format:
  #main
  <card-id>
  <card-id>
  #extra
  <card-id>
  !side
  <card-id>

Rules:
  - Lines starting with # are zone headers: #main, #extra, !side
  - Card IDs are numeric lines between headers
  - Blank lines and comments (# prefix on card-ID lines) are ignored
  - Lines before first header are ignored
  - Unknown card IDs are collected separately, not treated as parse errors
  - Missing headers: all card IDs before any header go to main-deck (lenient parsing)
  - Repeated same header: subsequent occurrences append to that zone
  - Empty zones: simply not listed in the file

Response shape:
  {
    "data": {
      "decklist": { "main-deck": [...], "extra-deck": [...], "side-deck": [...] },
      "invalid_ids": [999999, 888888],
      "warning": null  // or "Unknown card IDs: 999999, 888888. These cards were skipped."
    },
    "error": null
  }

Error response (parse failure):
  {
    "data": null,
    "error": { "code": "PARSE_ERROR", "message": "Couldn't parse file. Expected format: #main, #extra, !side sections with card IDs." }
  }
```

### No-Go Zones

- Do NOT add icon libraries — use text labels for all buttons
- Do NOT modify CardInfoContext, SearchContext, or their components
- Do NOT modify DnD logic, DeckSlot, DeckZone, drag-and-drop behavior
- Do NOT modify zone layouts or grid rendering
- Do NOT add animations/transitions — instant state changes per UX-DR18
- Do NOT use `Button` variant `"outline"` — not supported, use `"ghost"` for Export/Import

### Edge Cases

- **Save with empty deck**: Deck validation enforces 40-60 Main Deck — save will fail. Show validation error Toast: "Main deck must have 40-60 cards." (Need to handle this gracefully — catch 400 from API and show validation message, not generic network error)
- **Save with in-progress changes while another operation in flight**: Disable Save button during save; queue is not needed since Save is the only write operation other than cover upload (different endpoints)
- **Export empty deck**: Button disabled when all zones empty
- **Import overwrites unsaved work**: Import replaces all zones — user should save first. Show warning? AC says no confirmation needed — import is a direct action.
- **Cover upload for non-existent deck**: 404 from backend → destructive Toast with generic error
- **Cover upload while other upload in progress**: Button disabled during upload
- **Multiple rapid Save clicks**: Button disabled during save — subsequent clicks are noop
- **Import with empty file**: Show AlertDialog "No valid cards found in the imported file."
- **Import file with only `#main` (no `#extra`/`!side`)**: Extra/Side zones are empty (reset to [])
- **Import with invalid format (binary file, etc.)**: Backend returns PARSE_ERROR
- **Export deck name with special characters**: Use `deck.name` as filename — sanitize: replace non-alphanumeric chars with underscores, or use deck ID as fallback filename

### Backend Routes to Add

In `backend/routes/decks.py`:
- `POST /api/decks/{deck_id}/cover` — multipart file upload
- `GET /api/decks/{deck_id}/export` — export YDK text
- `POST /api/decks/import` — import YDK content

### DeckContext Changes

Add to `DeckContextType` in `deckContextValue.ts`:
```typescript
saveDeck: (deckId: string) => Promise<boolean>
```

Implement in `DeckContext.tsx`:
- `saveDeck` calls `api.updateDeck(deckId, deck.decklist)`, returns success boolean
- On success, optionally reload decks to sync
- On validation error (400), return false and let UI handle the message

### API Functions to Add

In `frontend/src/lib/api.ts`:
```typescript
export function updateDeck(id: string, decklist: Decklist): Promise<ApiResponse<Deck>>  // already exists
export function uploadCover(deckId: string, file: File): Promise<ApiResponse<Deck>>
export function exportDeck(deckId: string): Promise<ApiResponse<{ content: string }>>
export function importDeck(deckId: string, content: string): Promise<ApiResponse<{ decklist: Decklist; invalid_ids: number[] }>>
```

### Testing Strategy

- Backend tests: Use `TestClient` (FastAPI's test client) for endpoint tests
- Frontend tests: Mock api.ts functions, render DeckBuilder, verify button clicks trigger correct API calls
- Use `screen.getByText()` for button discovery
- Use `fireEvent.click()` for button interactions
- Use `waitFor()` for async state changes (save/import/export responses)
- Mock file inputs with `fireEvent.change(input, { target: { files: [mockFile] } })` for upload/import
- Test Toast visibility with `screen.getByText()` on success/failure messages
- Test AlertDialog visibility for import errors

### Files to Modify

- `frontend/src/contexts/deckContextValue.ts` — add `saveDeck` to interface
- `frontend/src/contexts/DeckContext.tsx` — implement `saveDeck`, add `cover` update on upload
- `frontend/src/lib/api.ts` — add `uploadCover`, `exportDeck`, `importDeck`
- `frontend/src/components/deck-builder/DeckBuilder.tsx` — add Save, Upload Cover, Export, Import buttons + handlers
- `backend/routes/decks.py` — add POST cover, GET export, POST import endpoints
- `backend/services/deck_service.py` — add `export_deck`, `import_deck`, `upload_cover` functions

### Files to Create

- `frontend/src/__tests__/DeckSaveImportExport.test.tsx` — frontend integration tests
- `backend/tests/test_deck_export_import.py` — backend endpoint tests

### Files NOT to Touch

- `frontend/src/components/deck-builder/DeckSlot.tsx`
- `frontend/src/components/deck-builder/DeckSlotContextMenu.tsx`
- `frontend/src/components/deck-builder/DeckZone.tsx`
- `frontend/src/components/ui/` (Button, AlertDialog, Toast already exist)
- `frontend/src/hooks/`
- `frontend/src/types/`
- `frontend/src/App.tsx`
- `frontend/src/index.css`
- `frontend/vite.config.ts`
- `backend/main.py`
- `backend/services/card_service.py`
- `backend/services/image_service.py`
- `backend/models/`

### Previous Story Learnings (2-5)

- **Sort order logic pattern**: Pure utility functions work well for presentation logic — test with unit tests, no mocks
- **Button pattern**: Button component only supports `"default" | "destructive" | "ghost"` — no `"outline"`, no `size` prop
- **Toast pattern**: `useToast()` hook returns `addToast(message, variant)` with `"default"` (auto-dismiss 3s) and `"destructive"` (manual dismiss)
- **AlertDialog pattern**: `{ open, title, onConfirm, onCancel, confirmLabel, destructive, children }` — use for import parse errors and invalid IDs
- **Test patterns**: Mock `@/lib/api` functions, mock `useDeck()` / `useCardInfo()` hooks, `waitFor` for async changes
- **Code review findings**: Stale closures in setTimeout (none needed here — all API calls are async/promise-based); defensive copies on state updates (already done with spread operators in DeckContext)
- **Loading state pattern**: Boolean state per operation (`saving`, `uploading`, `importing`) rather than a single enum — keeps each button's disabled state independent

### References

- Save/cover/import/export ACs from epics: `_bmad-output/planning-artifacts/epics.md:479-539`
- API endpoints from addendum: `_bmad-output/planning-artifacts/prds/prd-yugioh-deck-builder-2026-06-03/addendum.md:19-28`
- Save/Cover/Export/Import UX behavioral specs: `_bmad-output/planning-artifacts/ux-designs/ux-yugioh-deck-builder-2026-06-03/EXPERIENCE.md:63-91` (component patterns + state patterns)
- Cover upload flow (UJ-4): `_bmad-output/planning-artifacts/ux-designs/ux-yugioh-deck-builder-2026-06-03/EXPERIENCE.md:165-173`
- Export flow (UJ-3): `_bmad-output/planning-artifacts/ux-designs/ux-yugioh-deck-builder-2026-06-03/EXPERIENCE.md:147-163`
- Import flow (Flow 5): `_bmad-output/planning-artifacts/ux-designs/ux-yugioh-deck-builder-2026-06-03/EXPERIENCE.md:175-183`
- Save behavior: `_bmad-output/planning-artifacts/ux-designs/ux-yugioh-deck-builder-2026-06-03/EXPERIENCE.md:82-85`
- Save/Cover button styling: `_bmad-output/planning-artifacts/ux-designs/ux-yugioh-deck-builder-2026-06-03/DESIGN.md:166-167`
- Button component variants: `frontend/src/components/ui/button.tsx` (only `"default" | "ghost" | "destructive"`)
- Toast/AlertDialog: `frontend/src/components/ui/toast.tsx`, `frontend/src/components/ui/alert-dialog.tsx`
- API response envelope pattern: `backend/routes/decks.py` (JSONResponse with {data, error})
- Deck validation logic: `backend/services/deck_service.py:101-112`
- Previous story patterns: `_bmad-output/implementation-artifacts/2-5-sort-and-clear-deck.md`
- Existing test patterns: `frontend/src/__tests__/DeckLibrary.test.tsx`, `frontend/src/__tests__/DeckBuilder.test.tsx`

## Review Findings

### Patch
- [x] [Review][Patch] Backend returns `IMPORT_ERROR` instead of `PARSE_ERROR` for malformed imports [routes/decks.py:163-176] — Added `except DeckValidationError` before generic `Exception` handler.
- [x] [Review][Patch] Import never validates decklist sizes [deck_service.py:142-184] — Added `_validate_decklist(decklist)` call at end of `import_deck_ydk`.
- [x] [Review][Patch] `saveDeck` uses stale closure capturing `state.decks` [DeckContext.tsx:142-151] — Added `decksRef` to always read latest decks via ref.
- [x] [Review][Patch] Cover upload error message ignores error details [DeckBuilder.tsx:154-157] — Now distinguishes `NETWORK_ERROR` from other errors.
- [x] [Review][Patch] Cover preview not updated on successful upload [DeckBuilder.tsx:154-160] — Calls `loadDecks()` on success.
- [x] [Review][Patch] Save error toast shows backend message instead of spec message [DeckBuilder.tsx:138-142] — Always uses spec message per AC1.
- [x] [Review][Patch] Empty import file shows non-spec dialog message [DeckBuilder.tsx:191-194] — Changed to AC7 "Parse Error" dialog.
- [x] [Review][Patch] `URL.revokeObjectURL` called synchronously after `a.click()` [DeckBuilder.tsx:175] — Wrapped in `setTimeout(() => ..., 100)`.

### Deferred
- [x] [Review][Defer] `_deck_cache` race condition [deck_service.py:17-32] — Module-level singleton cache without write lock. Pre-existing, not introduced by 2.6.
- [x] [Review][Defer] `request_validation_exception_handler` never registered [routes/decks.py:186-189] — Dead handler function. Pre-existing.
- [x] [Review][Defer] Path traversal via deck_id in cover upload [routes/decks.py:121,125] — No deck_id sanitization. Pre-existing pattern across all endpoints.
- [x] [Review][Defer] No URL length protection for `fetchCardsByIds` [api.ts:86] — Comma-joined IDs could exceed URL limits. Pre-existing.
- [x] [Review][Defer] `fetchCardsByIds` called on every decklist reorder [DeckBuilder.tsx:42-73] — `decklistKey` dependency triggers refetch on every sort. Pre-existing.
- [x] [Review][Defer] `update_deck` validates every card individually [deck_service.py:101-112] — Up to 90 lookups per save. Pre-existing.
- [x] [Review][Defer] `addCardToZone` negative slotIndex inserts at wrong position [DeckContext.tsx] — `Math.min` doesn't guard negative. Pre-existing.
- [x] [Review][Defer] `removeCardFromZone` no bounds check on slotIndex [DeckContext.tsx] — Negative index removes last element. Pre-existing.

## Dev Agent Record

### Agent Model Used

big-pickle (opencode/big-pickle)

### Debug Log References

### Completion Notes List

### File List
