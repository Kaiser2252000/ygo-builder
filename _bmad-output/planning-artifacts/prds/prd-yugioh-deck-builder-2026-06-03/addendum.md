# Addendum — Yu-Gi-Oh! Deck Builder

## Architecture Sketch

### System Layout

```
React SPA (localhost:3000)  ←→  FastAPI REST API (localhost:8000)
                                       │
                            ┌──────────┼──────────┐
                            │          │          │
                     db/all_cards.csv   │    Image Folder
                            │          │   (fixed local path)
                     db/decks.json     │
```

### Backend (FastAPI)

- **`GET /api/cards?q={query}`** — Search cards by name or description from `all_cards.csv`.
- **`GET /api/cards/{id}`** — Get single card by ID.
- **`GET /api/cards/{id}/image`** — Serve card image from the local image folder (matched by card name).
- **`GET /api/decks`** — List all decks from `decks.json`.
- **`POST /api/decks`** — Create new deck.
- **`PUT /api/decks/{id}`** — Update deck (save decklist).
- **`DELETE /api/decks/{id}`** — Delete deck.
- **`POST /api/decks/import`** — Import deck from `.txt` content.
- **`GET /api/decks/{id}/export`** — Export deck as `.txt`.
- **`POST /api/decks/{id}/cover`** — Upload cover image (multipart form). Saved to `uploads/covers/{id}.{ext}`. Path stored in deck's `cover` field.

### Data

- `db/all_cards.csv` — Read-only CSV loaded into memory on server start. Columns: id, name, type, frameType, description, level, atk, def, race, attribute, archetype.
- `db/decks.json` — Read/write JSON file. Array of deck objects: `{id, name, cover, decklist: {main-deck: [int], extra-deck: [int], side-deck: [int]}}`.
- `uploads/covers/` — Directory for uploaded deck cover images. Named as `{deck-uuid}.{ext}`.
- Card images — Served as static files from `C:\Users\Legion\Documents\MEGA\EN Series 9 Card Library`. Filename matched to card name (case-insensitive).

### Frontend (React)

- Three-panel layout: Left (Card Info), Middle (Deck Library / Deck Builder), Right (Search).
- Client-side sort for decklist sorting (in-memory).
- Drag-and-drop via HTML5 Drag and Drop API or a library (e.g. react-beautiful-dnd / dnd-kit).
