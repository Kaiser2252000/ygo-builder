# Story 1.1: Search Cards by Name or Description

Status: done

## Story

As a Yu-Gi-Oh! player,
I want to type a card name or description term and see matching cards instantly,
So that I can find cards in my collection without browsing the entire CSV.

## Acceptance Criteria

1. **Given** the backend has loaded all_cards.csv into memory, **When** a user types "Blue-Eyes" in the search input, **Then** the frontend sends GET /api/cards?q=Blue-Eyes to the backend after 300ms debounce, **And** the backend returns all cards whose name contains "Blue-Eyes" (case-insensitive partial match).

2. **Given** the search input is empty, **When** no query text is entered, **Then** no API call is made and no results are shown.

3. **Given** a user types "destroy" in the search input, **When** the debounce timer expires, **Then** the API searches all_cards.csv description column for "destroy" (case-insensitive full-text), **And** returns all matching results with card name, type, and frameType.

4. **Given** a search is in progress, **When** results are loading, **Then** Search Result area shows shadcn Skeleton placeholders (4 result skeletons).

5. **Given** a search returns zero matches, **When** no cards match the query, **Then** the result area displays muted text: "No cards match your search."

6. **Given** the backend is unreachable or returns an error, **When** an API call fails, **Then** a destructive Toast appears: "Search failed. Check server connection."

7. **Given** a search completes successfully, **When** results are returned, **Then** each search result shows the card name and type in a Search Result row component, **And** results are rendered in a scrollable list.

## Tasks / Subtasks

### Scaffolding (shared project setup)

- [x] **Frontend scaffold** (AC: 1)
  - [x] Run `npm create vite@latest frontend -- --template react-ts` in project root
  - [x] Run `npx shadcn@latest init` inside frontend/ (defaults, use TypeScript, Tailwind, CSS variables)
  - [x] Add shadcn components: `npx shadcn@latest add button input skeleton toast`
  - [x] Install DnD deps: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
  - [x] Set Vite proxy in `vite.config.ts`: server.proxy `/api` → `http://localhost:8000`
  - [x] Fix Vite port to 3000 in `vite.config.ts`
  - [x] Verify frontend runs: `npm run dev` starts on :3000

- [x] **Backend scaffold** (AC: 1)
  - [x] Create `backend/` directory with `requirements.txt` (fastapi, uvicorn, python-multipart, python-dotenv)
  - [x] Create `backend/main.py`: FastAPI app, CORS (allow `http://localhost:3000`), static mounts, include routers
  - [x] Create `backend/config.py`: load IMAGE_PATH from `.env`, DB paths
  - [x] Create `backend/db/` directory with `all_cards.csv` placeholder note, `decks.json` (`[]`)
  - [x] Create `backend/uploads/covers/` directory with `.gitkeep`
  - [x] Create `.env.example` and `.gitignore` at project root

### Story 1.1 — Card Search

- [x] **Backend: card model + service** (AC: 1, 3)
  - [x] Create `backend/models/card.py`: dataclass `Card` with fields: id, name, type, frameType, description, level, atk, def, race, attribute, archetype
  - [x] Create `backend/services/card_service.py`: load CSV on module init, cache in memory, `search_cards(query: str) -> list[Card]` — matches name (partial, case-insensitive) OR description (full-text, case-insensitive), returns max 200 results
  - [x] Create `backend/services/__init__.py`

- [x] **Backend: card routes** (AC: 1, 3, 6)
  - [x] Create `backend/routes/cards.py`: `GET /api/cards?q=` returns `{data: [Card], error: null}`, empty query returns `{data: [], error: null}`
  - [x] Follow NFR5 response envelope: `{data: ..., error: {code, message}}` on failure
  - [x] Wire router into `main.py` with prefix `/api`

- [x] **Frontend: types** (AC: 1)
  - [x] Create `frontend/src/types/card.ts`: `Card` interface matching CSV fields (camelCase: `frameType`, `archetype`)

- [x] **Frontend: API layer** (AC: 1, 6)
  - [x] Create `frontend/src/lib/api.ts`: generic fetch wrapper with `async/await`, return `{data, error}`, base URL via relative `/api/`

- [x] **Frontend: SearchContext + hook** (AC: 1-6)
  - [x] Create `frontend/src/contexts/SearchContext.tsx`: manages `query`, `results`, `isLoading`, `error` state
  - [x] Create `frontend/src/hooks/useCardSearch.ts`: wraps `useContext(SearchContext)` with null guard

- [x] **Frontend: SearchInput component** (AC: 1, 2)
  - [x] Create `frontend/src/components/card-search/SearchInput.tsx`: text input + search icon, 300ms debounce on input change, fires search on Enter, empty input clears results
  - [x] Styling per UX-DR9: `flex gap-2 p-2 rounded-md border bg-background w-full`

- [x] **Frontend: SearchResult component** (AC: 4, 5, 7)
  - [x] Create `frontend/src/components/card-search/SearchResult.tsx`: row showing card name + type, `flex items-center gap-2 p-2 rounded-sm border-b`
  - [x] Loading state: show 4 shadcn `<Skeleton>` placeholders
  - [x] Empty state: muted text "No cards match your search."
  - [x] Error state: destructive Toast via shadcn Toast hook

- [x] **Frontend: CardSearch panel** (AC: 1-7)
  - [x] Create `frontend/src/components/card-search/CardSearch.tsx`: composes SearchInput + SearchResult list in a scrollable wrapper
  - [x] Right panel styling: `w-80 min-w-72`, full height

- [x] **Frontend: Layout + App** (AC: 1)
  - [x] Update `frontend/src/App.tsx`: three-panel flex layout (Left placeholder, Middle placeholder, Right = CardSearch)
  - [x] Create `frontend/src/components/layout/Header.tsx`: app title + theme toggle placeholder
  - [x] Create `frontend/src/components/layout/LeftPanel.tsx`: placeholder "Card Info" panel
  - [x] Create `frontend/src/components/layout/MiddlePanel.tsx`: placeholder "Deck Builder" panel
  - [x] Wrap App in SearchContext.Provider
  - [x] Add shadcn Toaster component

### Review Findings

- [x] [Review][Patch] Older searches can overwrite newer results [frontend/src/contexts/SearchContext.tsx:13]
- [x] [Review][Patch] Search errors are returned without server-side diagnostics [backend/routes/cards.py:13]
- [x] [Review][Defer] Frontend component tests do not cover async search, loading, empty, and toast behavior [tests/backend/test_card_search.py:1] — deferred, frontend test harness/script is not configured in this story

## Dev Notes

- **AC 1:** Backend searches name OR description (union, not intersection). Empty query returns empty array — no API call from frontend.
- **Debounce:** 300ms timer; if user types before timer fires, reset timer. Only fire API call after 300ms of no typing.
- **CSV columns:** id, name, type, frameType, description, level, atk, def, race, attribute, archetype. Level/ATK/DEF may be null for Spell/Trap cards.
- **CSV path:** `db/all_cards.csv` relative to backend/ directory. Load once on startup via module-level code in card_service.py.
- **Search limit:** Max 200 results to avoid rendering lag. Frontend receives array of Card objects.
- **No comments in implementation code** unless genuinely non-obvious.
- **No emoji in code.**

### Source Tree — Files to create/modify

```
yugioh-deck-builder/
├── .env.example                                    # NEW
├── .gitignore                                      # NEW
├── frontend/
│   ├── package.json                                # NEW (Vite init)
│   ├── vite.config.ts                              # NEW (proxy /api → :8000, port :3000)
│   ├── tsconfig.json                               # NEW (Vite init, strict: true)
│   ├── tailwind.config.ts                          # NEW (shadcn init)
│   ├── index.html                                  # NEW (Vite init)
│   └── src/
│       ├── main.tsx                                # NEW (Vite init)
│       ├── App.tsx                                 # NEW (3-panel layout)
│       ├── index.css                               # NEW (shadcn CSS vars)
│       ├── components/
│       │   ├── ui/                                 # NEW (shadcn: button, input, skeleton, toast)
│       │   ├── layout/
│       │   │   ├── Header.tsx                      # NEW
│       │   │   ├── LeftPanel.tsx                   # NEW
│       │   │   └── MiddlePanel.tsx                  # NEW
│       │   └── card-search/
│       │       ├── CardSearch.tsx                   # NEW
│       │       ├── SearchInput.tsx                  # NEW
│       │       └── SearchResult.tsx                 # NEW
│       ├── contexts/
│       │   └── SearchContext.tsx                    # NEW
│       ├── hooks/
│       │   └── useCardSearch.ts                     # NEW
│       ├── lib/
│       │   └── api.ts                              # NEW
│       └── types/
│           └── card.ts                             # NEW
├── backend/
│   ├── requirements.txt                            # NEW
│   ├── main.py                                     # NEW
│   ├── config.py                                   # NEW
│   ├── models/
│   │   └── card.py                                 # NEW
│   ├── routes/
│   │   └── cards.py                                # NEW
│   ├── services/
│   │   ├── __init__.py                             # NEW
│   │   └── card_service.py                         # NEW
│   ├── db/
│   │   └── all_cards.csv                           # (pre-existing, use as-is)
│   └── uploads/
│       └── covers/
│           └── .gitkeep                            # NEW
```

### Naming Conventions

| Domain | Convention | Examples |
|--------|-----------|---------|
| API endpoints | snake_case, plural | `/api/cards?q=`, `/api/cards/{id}` |
| Python files | snake_case | `card_service.py`, `cards.py` |
| Python classes | PascalCase | `CardService` |
| Python functions/vars | snake_case | `search_cards()`, `card_list` |
| React components | PascalCase, matching filename | `SearchInput.tsx`, `CardSearch.tsx` |
| React hooks | camelCase, `use` prefix | `useCardSearch` |
| Frontend files | PascalCase for components | `SearchInput.tsx` |
| Frontend vars/funcs | camelCase | `searchQuery`, `handleInputChange` |
| JSON API fields | snake_case | `frame_type`, `archetype` |

### API Contract

- **GET /api/cards?q={query}**
  - `q` is required; empty → `{data: [], error: null}`
  - Response: `{data: Card[], error: null}` on success
  - Error: `{data: null, error: {code: "SEARCH_ERROR", message: "..."}}`
  - Status: 200 (success), 500 (server error)

### State Management

- `SearchContext` owns: `query` (string), `results` (Card[]), `isLoading` (boolean), `error` (string | null)
- `SearchContext` exposes: `searchCards(query)` that calls `api.get("/api/cards", {q: query})`
- `SearchInput` updates `query` via context, debounces, then calls `searchCards`
- `SearchResult` reads `results`, `isLoading`, `error` from context

### Testing (future — no test setup for Story 1.1)

Story 1.1 is the project scaffold. Tests will be introduced in later stories. The dev agent should not write tests unless explicitly asked.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `python -m pytest tests/backend/test_card_search.py` - 5 passed.
- `python -m pytest` - 6 passed.
- `npm run build` - passed.
- `npm run lint` - passed.

### Completion Notes List

- Implemented backend card response serialization so API payloads use the CSV-facing `def` field instead of Python's internal `def_`.
- Added backend error envelope handling for card search failures with `SEARCH_ERROR`.
- Fixed empty search rendering so no result area is shown before the user enters a query.
- Split React context/hook exports for Search and Toast modules to satisfy Fast Refresh lint rules.
- Added backend pytest coverage for name search, description search, empty query behavior, route serialization, and route error envelope behavior.
- Resolved review finding: stale search responses are ignored when a newer request has started.
- Resolved review finding: backend search failures are logged with stack traces before returning the API error envelope.

### File List

- `backend/routes/cards.py`
- `frontend/src/components/card-search/CardSearch.tsx`
- `frontend/src/components/card-search/SearchResult.tsx`
- `frontend/src/components/ui/toast.tsx`
- `frontend/src/components/ui/toastContext.ts`
- `frontend/src/components/ui/useToast.ts`
- `frontend/src/contexts/SearchContext.tsx`
- `frontend/src/contexts/searchContextValue.ts`
- `frontend/src/hooks/useCardSearch.ts`
- `frontend/src/types/card.ts`
- `tests/backend/test_card_search.py`
- `_bmad-output/implementation-artifacts/1-1-search-cards-by-name-or-description.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-06-03: Completed Story 1.1 card search implementation fixes, tests, lint cleanup, and marked story ready for review.
- 2026-06-03: Addressed code review findings and marked Story 1.1 done.

## References

- FR1, FR2 — [Source: epics.md:117-159]
- NFR2 (CSV caching), NFR5 (API envelope) — [Source: epics.md:157-158]
- UX-DR7, UX-DR9, UX-DR10, UX-DR11, UX-DR12, UX-DR14, UX-DR17 — [Source: epics.md:158]
- Project structure — [Source: architecture.md:194-236]
- Naming conventions — [Source: architecture.md:152-163]
- API envelope — [Source: architecture.md:165-180]
- State management — [Source: architecture.md:182-186]
- Project context rules — [Source: project-context.md:48-93]
- THREE-WORD SUM: scaffold-card-search
