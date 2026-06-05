---
baseline_commit: NO_VCS
---

# Story 2.1: Deck CRUD Backend

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Yu-Gi-Oh! player,
I want the backend to store, retrieve, create, update, and delete my decks,
so that my deck collection persists between sessions and can be managed programmatically.

## Acceptance Criteria

1. **Given** `db/decks.json` exists, or is created if missing, as an empty array, **When** the backend starts, **Then** `decks.json` is loaded into memory, **And** `GET /api/decks` returns an empty array when no decks exist.

2. **Given** a `POST /api/decks` request with body `{"name": "Dragon Beatdown"}`, **When** the deck is created, **Then** the response returns `{data: {id: "<uuid>", name: "Dragon Beatdown", cover: null, decklist: {"main-deck": [], "extra-deck": [], "side-deck": []}}, error: null}`, **And** the deck is persisted to `decks.json`, **And** `GET /api/decks` now includes the new deck.

3. **Given** a `PUT /api/decks/{id}` request with an updated decklist, **When** the decklist has 42 main-deck cards, 8 extra-deck cards, and 0 side-deck cards, **Then** the deck is validated for Main 40-60, Extra 0-15, Side 0-15, and max 3 copies per card name, **And** the updated decklist is saved to `decks.json`, **And** the response returns the updated deck object.

4. **Given** a `PUT /api/decks/{id}` request with 61 main-deck cards, **When** validation fails, **Then** the response returns `{data: null, error: {code: "VALIDATION_ERROR", message: "Main deck must have 40-60 cards."}}`, **And** `decks.json` is not modified.

5. **Given** a `PUT /api/decks/{id}` request with 4 copies of the same card name, **When** validation fails, **Then** the response returns `{data: null, error: {code: "VALIDATION_ERROR", message: "<message indicating max 3 copies per card name>"}}`, **And** `decks.json` is not modified.

6. **Given** a `DELETE /api/decks/{id}` request for an existing deck, **When** the deck is deleted, **Then** the deck is removed from `decks.json`, **And** `GET /api/decks` no longer includes it.

7. **Given** any request for a non-existent deck ID, **When** the deck is not found, **Then** the response returns `{data: null, error: {code: "NOT_FOUND", message: "Deck not found."}}` with HTTP 404.

## Tasks / Subtasks

- [x] Backend deck model and data contract (AC: 1-7)
  - [x] Create `backend/models/deck.py` with dataclasses for `Deck` and `Decklist`.
  - [x] Use JSON zone keys exactly as required: `main-deck`, `extra-deck`, `side-deck`.
  - [x] Keep `cover` nullable and default it to `None`.
  - [x] Represent deck card entries as card IDs in persisted JSON arrays.

- [x] Deck persistence service (AC: 1, 2, 3, 4, 5, 6)
  - [x] Create `backend/services/deck_service.py`.
  - [x] Use `DECKS_PATH` from `backend/config.py`; do not hardcode data paths.
  - [x] If `db/decks.json` is missing, create parent directories as needed and write `[]`.
  - [x] Load decks into an in-memory cache on first access or service initialization.
  - [x] Persist changes back to `db/decks.json` after create, update, and delete.
  - [x] On validation failure, leave the existing file contents unchanged.
  - [x] No file locking is required; this is a single-user local app.

- [x] Deck validation (AC: 3, 4, 5)
  - [x] Validate Main Deck count is 40-60 for updates.
  - [x] Validate Extra Deck count is 0-15.
  - [x] Validate Side Deck count is 0-15.
  - [x] Validate max 3 copies per card name across the entire deck.
  - [x] Resolve card names from `card_service` cache/CSV by card ID; do not duplicate CSV parsing logic in `deck_service.py`.
  - [x] Treat unknown card IDs as validation errors with `{code: "VALIDATION_ERROR"}`.
  - [x] Keep create deck allowed with empty zones; deck-size validation applies when saving/updating a decklist.

- [x] Deck API routes (AC: 1-7)
  - [x] Create `backend/routes/decks.py` with `APIRouter(tags=["decks"])`.
  - [x] Add `GET /decks`, `POST /decks`, `PUT /decks/{id}`, and `DELETE /decks/{id}`.
  - [x] Wire the deck router into `backend/main.py` with prefix `/api`.
  - [x] Use Pydantic request models for create and update bodies.
  - [x] Return the existing API envelope style: `{data: ..., error: null}` or `{data: null, error: {code, message}}`.
  - [x] Return HTTP 201 for successful create, HTTP 200 for successful get/update/delete, HTTP 404 for not found, and HTTP 400 or 422 for validation failures.
  - [x] Log unexpected backend failures before returning a 500 envelope.

- [x] Backend tests and validation (AC: 1-7)
  - [x] Add `tests/backend/test_deck_service.py` for missing-file bootstrap, create persistence, update persistence, invalid counts, max copies, unknown IDs, delete persistence, and not-found behavior.
  - [x] Add `tests/backend/test_deck_routes.py` or route coverage in the service test file using `fastapi.testclient.TestClient`.
  - [x] Use temp file fixtures and monkeypatch `deck_service.DECKS_PATH` or config/service path values so tests never write to the real `db/decks.json`.
  - [x] Monkeypatch card lookup/cache with sample cards to test max-copy validation by card name.
  - [x] Run `python -m pytest`.
  - [x] Run `npm run build` and `npm run lint` only if frontend files are touched; this story should not require frontend edits.

### Review Findings

- [x] [Review][Patch] Malformed request validation returns FastAPI's default response instead of the project `{data,error}` envelope [backend/routes/decks.py:19]
- [x] [Review][Patch] Partial or mistyped decklist payloads can silently erase omitted zones during update [backend/models/deck.py:13]
- [x] [Review][Patch] Persistence failures can leave the in-memory deck cache diverged from disk, and direct writes can partially corrupt `decks.json` [backend/services/deck_service.py:43]
- [x] [Review][Patch] Blank or whitespace-only deck names can be persisted [backend/routes/decks.py:19]
- [x] [Review][Patch] Route tests do not cover successful PUT/DELETE envelopes or malformed request envelopes [tests/backend/test_deck_routes.py:43]
- [x] [Review][Patch] Extra Deck and Side Deck overflow validation lacks explicit test coverage [tests/backend/test_deck_service.py:79]
- [x] [Review][Defer] Malformed existing `decks.json` recovery policy is unspecified [backend/services/deck_service.py:61] - deferred, pre-existing hardening outside Story 2.1 acceptance criteria

## Dev Notes

### Current State to Preserve

- `backend/main.py` already creates the FastAPI app, configures CORS for `http://localhost:3000` and `http://localhost:5173`, mounts `/images` and `/uploads/covers`, and includes the cards router with `/api`.
- `backend/config.py` already defines `DECKS_PATH = os.path.join(DB_DIR, "decks.json")`, where `DB_DIR` points at the project-level `db/` directory.
- `db/decks.json` is currently missing. This story must handle that by creating `db/decks.json` as `[]` instead of failing on startup or first request.
- `backend/routes/cards.py` is the response-envelope pattern to preserve: routes delegate to services, catch/log unexpected failures, and return `JSONResponse` for error envelopes.
- `backend/services/card_service.py` already owns CSV loading and card caching. Reuse it for card ID/name lookup rather than reading `all_cards.csv` again in deck code.
- Existing card API behavior and tests must continue to pass.

### Data Contract

Persist decks as an array in `db/decks.json`:

```json
[
  {
    "id": "<uuid>",
    "name": "Dragon Beatdown",
    "cover": null,
    "decklist": {
      "main-deck": [123],
      "extra-deck": [],
      "side-deck": []
    }
  }
]
```

Required response envelope examples:

```json
{"data": [], "error": null}
{"data": null, "error": {"code": "NOT_FOUND", "message": "Deck not found."}}
{"data": null, "error": {"code": "VALIDATION_ERROR", "message": "Main deck must have 40-60 cards."}}
```

### Architecture Requirements

- Backend routes live in `backend/routes/` by domain; create `backend/routes/decks.py`.
- Business logic lives in `backend/services/`; create `backend/services/deck_service.py`.
- Backend models live in `backend/models/`; create `backend/models/deck.py`.
- Use Python 3.12+ type hints and dataclasses for domain models.
- Use Pydantic models for request/response validation at the route boundary.
- API endpoint names are plural and snake_case where applicable; use `/api/decks`.
- Keep the app local-only: no auth, accounts, cloud sync, or multi-user concurrency handling.
- Preserve the monorepo structure; no new backend framework or storage library is needed.

### Validation Details

- Main deck update must reject fewer than 40 or more than 60 cards.
- Extra deck update must reject more than 15 cards.
- Side deck update must reject more than 15 cards.
- Max-copy validation is by card name, not card ID, across all zones combined.
- Unknown card IDs should fail validation so import/save behavior in later stories cannot persist invalid card references.
- Create deck should generate a UUID and initialize empty deck zones; do not require 40 Main Deck cards at create time.
- Delete may return `{data: {"id": "<deleted-id>"}, error: null}` or the deleted deck object, but it must use a normal success envelope and persist removal.

### Epic 1 Retrospective Intelligence

- Reuse backend response envelope, diagnostics, and service delegation patterns from the card routes.
- Add backend tests with temp data before marking the story complete; Epic 1 quality improved when route/service behavior was covered directly.
- Avoid repeated file/CSV work in request loops. Card lookup for validation should build on `card_service` cache behavior.
- FR3 is intentionally deferred to Story 2.4. Do not implement drag/right-click card management in this backend CRUD story.
- Frontend component test debt exists, but this story is backend-only; do not add frontend test harness work unless the implementation unexpectedly touches frontend code.

### Project Structure Notes

Expected new files:

- `backend/models/deck.py`
- `backend/routes/decks.py`
- `backend/services/deck_service.py`
- `tests/backend/test_deck_service.py`
- `tests/backend/test_deck_routes.py` or equivalent route tests

Expected modified files:

- `backend/main.py`
- `db/decks.json` if bootstrapping or seed data is added

Do not modify frontend files for this story unless a later implementation discovery makes it strictly necessary.

### References

- Story 2.1 requirements and ACs: `_bmad-output/planning-artifacts/epics.md`, Story 2.1.
- Epic 2 scope: `_bmad-output/planning-artifacts/epics.md`, Epic 2.
- FR9, FR10, FR16 and deck persistence: `_bmad-output/planning-artifacts/prds/prd-yugioh-deck-builder-2026-06-03/prd.md`, Sections 4.3 and 4.4.
- Backend endpoint list and `decks.json` shape: `_bmad-output/planning-artifacts/prds/prd-yugioh-deck-builder-2026-06-03/addendum.md`, Backend and Data sections.
- Architecture route/service/model structure and API envelope: `_bmad-output/planning-artifacts/architecture.md`, Implementation Patterns and Project Structure sections.
- Project rules: `_bmad-output/project-context.md`.
- Epic 1 lessons: `_bmad-output/implementation-artifacts/epic-1-retro-2026-06-03.md`.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `git rev-parse HEAD` - unavailable; workspace is not a Git repository, baseline recorded as `NO_VCS`.
- `python -m pytest tests/backend/test_deck_service.py tests/backend/test_deck_routes.py` - red phase failed before implementation because deck service/router modules were missing and `httpx` was absent.
- `python -m pip install -r backend/requirements.txt` - installed importable `httpx` package but pip reported a Windows console executable rename warning for `httpx.exe`.
- `python -c "import httpx; print(httpx.__version__)"` - confirmed `httpx` 0.28.1 importable.
- `python -m pytest tests/backend/test_deck_service.py tests/backend/test_deck_routes.py` - 12 passed.
- `python -m pytest` - 23 passed.
- `npm run build` - passed.
- `npm run lint` - passed.
- `python -m pytest tests/backend/test_deck_service.py tests/backend/test_deck_routes.py` - 21 passed after review patches.
- `python -m pytest` - 32 passed after review patches.
- `npm run build` - passed after review patches.
- `npm run lint` - passed after review patches.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Implemented deck dataclasses with exact persisted zone keys and nullable cover support.
- Implemented deck service with missing-file bootstrap, in-memory cache, create/list/update/delete persistence, validation, and not-found/validation exceptions.
- Added card ID lookup helper to `card_service` so deck validation reuses the CSV card cache instead of reparsing the CSV.
- Added deck API routes with response envelopes, HTTP status mapping, Pydantic request models, and unexpected-failure logging.
- Added backend service and route tests using temp deck files and FastAPI `TestClient`.
- Added `httpx` to backend requirements because FastAPI/Starlette `TestClient` requires it.
- Resolved review findings: malformed request errors now use the project envelope, deck create rejects blank names, update bodies require all exact decklist zone keys, persistence writes atomically and updates cache only after successful disk replace, and tests cover successful route update/delete plus malformed body and extra/side bounds.

### File List

- `backend/main.py`
- `backend/models/deck.py`
- `backend/requirements.txt`
- `backend/routes/decks.py`
- `backend/services/card_service.py`
- `backend/services/deck_service.py`
- `tests/backend/test_deck_routes.py`
- `tests/backend/test_deck_service.py`
- `_bmad-output/implementation-artifacts/2-1-deck-crud-backend.md`
- `_bmad-output/implementation-artifacts/deferred-work.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-06-03: Implemented Story 2.1 deck CRUD backend, validation, route wiring, tests, and marked ready for review.
- 2026-06-03: Addressed code review findings and marked Story 2.1 done.
