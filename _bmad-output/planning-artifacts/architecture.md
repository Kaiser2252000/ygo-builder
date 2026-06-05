---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-06-03'
inputDocuments:
  - prds/prd-yugioh-deck-builder-2026-06-03/prd.md
  - prds/prd-yugioh-deck-builder-2026-06-03/addendum.md
  - ux-designs/ux-yugioh-deck-builder-2026-06-03/DESIGN.md
  - ux-designs/ux-yugioh-deck-builder-2026-06-03/EXPERIENCE.md
workflowType: 'architecture'
project_name: 'yugioh-deck-builder'
user_name: 'Legion'
date: '2026-06-03'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:** 18 FRs across 5 feature areas — Card Search (3), Deck Builder (5), Deck Library (5), Import/Export (3), Card Info Panel (2).

**Non-Functional Requirements:**
- Sort < 500ms for 60 cards (in-memory, client-side)
- CSV loaded on backend start and cached in memory
- Card images served as static files from fixed local path
- No auth, no concurrency, no offline sync

**Scale & Complexity:**
- Complexity: Low — single-user hobby tool, no real-time, no multi-tenancy, no compliance
- Primary domain: Full-stack web (React SPA + REST API)
- Key challenge: Image matching from local folder by card name

### Technical Constraints & Dependencies

- Fixed card image path: `C:\Users\Legion\Documents\MEGA\EN Series 9 Card Library`
- `db/all_cards.csv` as read-only card database
- `db/decks.json` for deck persistence
- Cover images stored in `uploads/covers/`
- Single-user file access — no locks needed
- React dev server on :3000, FastAPI on :8000

### Cross-Cutting Concerns

1. Image resolution — card images from local folder + cover uploads = two serving mechanisms
2. File I/O — CSV read-once-cached, JSON read/write per operation
3. DnD state management — shared state between Search and Deck Builder
4. Panel orchestration — hover in Search/Builder → Card Info update

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web (React SPA + FastAPI REST API) based on project requirements.

### Selected Starter: Vite + React + TypeScript (frontend) / FastAPI from scratch (backend)

**Rationale:** The stack is pre-decided. Vite is the standard React starter in 2026 — fast dev server, built-in TypeScript, Tailwind support. FastAPI doesn't need a starter; it's a pip install away.

**Frontend Initialization:**
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npx shadcn@latest init
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Backend Initialization:**
```bash
mkdir backend && cd backend
python -m venv venv
pip install fastapi uvicorn python-multipart python-dotenv
```

**Architectural Decisions Provided:**

**Language & Runtime:**
- Frontend: TypeScript 5.x (strict mode), Node.js 20+
- Backend: Python 3.12+, FastAPI on uvicorn

**Styling Solution:**
- Tailwind CSS via shadcn/ui tokens. Light/dark via CSS variables

**Build Tooling:**
- Vite (dev server + optimized builds for frontend)
- Uvicorn (dev server for backend)

**Testing Framework:**
- Vitest (frontend, aligned with Vite)
- pytest (backend)

**Code Organization:**
- Monorepo with `frontend/` and `backend/` directories
- API routes in `backend/routes/` by domain (cards, decks)

**Development Experience:**
- Concurrent dev servers: Vite on :3000, FastAPI on :8000
- Vite proxy `/api` → `localhost:8000`

## Core Architectural Decisions

### Data Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Card database | `db/all_cards.csv` (read-only) | Pre-existing format, no DB server needed |
| Deck persistence | `db/decks.json` (read/write) | Single-user, no concurrency, no schema migrations |
| CSV parsing | Python built-in `csv` module | No Pandas dependency for a single CSV |
| Caching | CSV loaded on backend start, cached in memory | Fast search without re-reading disk per request |
| Image matching | Case-insensitive filename match by card name | Unknown naming convention, safe default |

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth | None | Single-user local tool, no accounts |
| CORS | FastAPI `CORSMiddleware` allow `localhost:3000` | Required for Vite dev server cross-origin requests |

### API & Communication

| Decision | Choice | Rationale |
|----------|--------|-----------|
| API pattern | REST | Already decided in PRD |
| File uploads | `python-multipart` (via FastAPI) | Required for cover image upload |
| Image serving | Static file mount in FastAPI | Serves card images + covers without extra tooling |

### Frontend Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | React Context | 3-panel single-user app, no deep state tree needed |
| Drag-and-drop | `@dnd-kit/core` | Most maintained, flexible DnD library |
| Routing | None needed | Single-page app, panels toggle conditionally |
| Build | Vite | Already decided in starter evaluation |
| Styling | Tailwind + shadcn/ui | Already decided in UX |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Deployment | None (local dev only) | Hobby project, runs on localhost |
| Environment config | `.env` file via `python-dotenv` | Image path config |
| Version control | Git | Standard VCS |

## Implementation Patterns & Consistency Rules

### Naming Patterns

| Domain | Convention | Example |
|--------|-----------|---------|
| API endpoints | Plural, snake_case | `/api/cards`, `/api/decks`, `/api/decks/{id}/cover` |
| JSON fields | snake_case | `main_deck`, `extra_deck`, `frame_type` |
| Python functions/vars | snake_case (PEP 8) | `search_cards()`, `deck_list` |
| Python classes | PascalCase | `CardService`, `DeckRepository` |
| React components | PascalCase | `DeckBuilder.tsx`, `CardInfoPanel.tsx` |
| React hooks | camelCase, `use` prefix | `useDeck()`, `useCardSearch()` |
| Files (backend) | snake_case | `card_routes.py`, `deck_service.py` |
| Files (frontend) | PascalCase for components | `DeckSlot.tsx`, `SearchResult.tsx` |

### API Patterns

**Response envelope:**
```json
{"data": ..., "error": null}       // success
{"data": null, "error": {"code": "...", "message": "..."}}   // error
```

**HTTP status codes:**
- `200` — GET/PUT success
- `201` — POST create
- `204` — DELETE success
- `400` — bad request / invalid input
- `404` — not found
- `422` — validation error
- `500` — server error

### State Management

- React Context per domain: `DeckContext`, `SearchContext`, `CardInfoContext`
- Each panel owns its data; no global store
- Drag-and-drop state managed via `@dnd-kit` sensors, not context

### Error Handling

- Backend: FastAPI exception handlers → consistent `{error: {code, message}}`
- Frontend: shadcn `Toast` (transient), `AlertDialog` (blocking)

## Project Structure & Boundaries

### Complete Project Directory Structure

```
yugioh-deck-builder/
├── README.md
├── .gitignore
├── .env.example
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── index.html
│   ├── .env.local
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── components/
│       │   ├── ui/                   # shadcn/ui primitives
│       │   ├── layout/               # Header, Left/Middle/RightPanel
│       │   ├── deck-library/         # DeckLibrary, DeckCard, CreateDeckDialog
│       │   ├── deck-builder/         # DeckBuilder, DeckZone, DeckSlot
│       │   ├── card-search/          # CardSearch, SearchInput, SearchResult
│       │   └── card-info/            # CardInfoPanel, CardImage
│       ├── hooks/                    # useDeck, useCardSearch, useCardInfo, useTheme
│       ├── lib/                      # api.ts (fetch wrapper), utils.ts
│       ├── types/                    # card.ts, deck.ts
│       └── contexts/                 # DeckContext, SearchContext, CardInfoContext
├── backend/
│   ├── requirements.txt
│   ├── main.py
│   ├── config.py
│   ├── models/                       # card.py, deck.py
│   ├── routes/                       # cards.py, decks.py, covers.py
│   ├── services/                     # card_service.py, deck_service.py, image_service.py
│   ├── db/                           # all_cards.csv, decks.json
│   └── uploads/covers/
└── tests/
    ├── backend/                      # test_card_service.py, test_deck_service.py
    └── frontend/                     # components/ (DeckSlot.test.tsx, etc.)
```

### FR to File Mapping

| Feature | Frontend | Backend |
|---------|----------|---------|
| Card Search (FR-1–3) | `card-search/` + `SearchContext` | `routes/cards.py` + `services/card_service.py` |
| Deck Builder (FR-4–8) | `deck-builder/` + `DeckContext` | `routes/decks.py` + `services/deck_service.py` |
| Deck Library (FR-9–13) | `deck-library/` + `DeckContext` | `routes/decks.py` |
| Import/Export (FR-14–16) | `deck-builder/` | `routes/decks.py` |
| Card Info (FR-17–18) | `card-info/` + `CardInfoContext` | `services/image_service.py` |

### Data Flow

1. React panels call `lib/api.ts` → `localhost:3000/api/*` (Vite proxy) → `localhost:8000/api/*`
2. FastAPI routes delegate to services → services read CSV or JSON from `db/`
3. Card images served as static files from local folder via FastAPI mount
4. Cover images uploaded via multipart → saved to `uploads/covers/`

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices work together without conflicts — Vite proxies `/api` to FastAPI, shadcn/ui runs on Tailwind CSS (Tailwind runs on Vite), file-based storage aligns with single-user offline-first scope.

**Pattern Consistency:**
All implementation patterns (naming: `snake_case` backend, `camelCase` frontend; API: `{data, error}` envelope; state: React Context per domain) are consistent with chosen technologies and applied uniformly across components.

**Structure Alignment:**
Project structure cleanly supports all architectural decisions — boundaries between frontend/backend are clearly delineated, component hierarchy reflects the 3-panel layout, and feature directories map directly to FR categories.

### Requirements Coverage Validation ✅

**Feature Coverage:**
All 5 features (Card Search, Deck Builder, Deck Library, Import/Export, Card Info) have dedicated frontend components and backend routes/services mapped in the FR-to-file table.

**Functional Requirements Coverage:**
All 18 FRs are architecturally supported — search (FR-1–3) via `SearchContext` + `/api/cards`; builder (FR-4–8) via `DeckContext` + DnD + CRUD; library (FR-9–13) via deck listing/CRUD; import/export (FR-14–16) via YDK format parsing; card info (FR-17–18) via `CardInfoContext` + image service.

**Non-Functional Requirements Coverage:**
All 5 NFRs addressed — sort performance (client-side sort), CSV caching (in-memory on first read), image serving (FastAPI static mount), no auth (single-user assumption documented), no concurrency (file-based storage adequate).

### Implementation Readiness Validation ✅

**Decision Completeness:**
All critical decisions documented with specific versions (React, shadcn/ui, Tailwind CSS, @dnd-kit/core, FastAPI, Vite, TypeScript).

**Structure Completeness:**
Complete project directory tree defined with all files and directories, integration points (Vite proxy, FastAPI CORS) explicitly specified, and component boundaries established.

**Pattern Completeness:**
Naming conventions, communication patterns (Context → hook → component), API response envelope, error handling patterns, and data flow are fully specified across both frontend and backend.

### Gap Analysis Results

**Minor Gaps (non-blocking):**
- No linting/formatting config specified (recommend: Prettier for frontend, Ruff for backend)
- No test runner command specified (recommend: Vitest for frontend, pytest for backend)
- No recommended dev workflow sequence (e.g., `frontend: npm run dev` + `backend: uvicorn main.py --reload`)

These are standard tooling choices that implementors will resolve naturally and do not affect architectural coherence.

### Validation Issues Addressed

No critical or blocking issues found. The minor gaps noted above are standard tooling defaults that don't require architectural change.

### Architecture Completeness Checklist

**Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**

- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** high

**Key Strengths:**
- Clear separation of concerns with 3-panel layout reflected in component hierarchy
- Complete FR-to-file mapping ensures no ambiguity during implementation
- Lightweight, single-user architecture avoids overengineering while remaining fully functional
- Consistent error handling and API conventions across all endpoints

**Areas for Future Enhancement:**
- Add linting/formatting configuration (Prettier + Ruff)
- Document dev workflow sequences for parallel frontend/backend development
- Consider adding integration tests bridging frontend + backend

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Priority:**
Set up project scaffolding — initialize frontend (Vite + React + TypeScript + Tailwind) and backend (FastAPI project structure), then implement the Card Search feature as the foundational dependency for all other features.
