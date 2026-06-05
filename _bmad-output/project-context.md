---
project_name: 'yugioh-deck-builder'
user_name: 'Legion'
date: '2026-06-03'
sections_completed:
  - technology_stack
  - language_rules
  - framework_rules
  - testing_rules
  - code_quality
  - dont_miss_rules
status: 'complete'
rule_count: 32
optimized_for_llm: true
existing_patterns_found: 0
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

**Frontend:**
- TypeScript 5.x (strict mode)
- React 19
- Vite (dev server :3000)
- Tailwind CSS (via shadcn/ui tokens)
- shadcn/ui (init with `npx shadcn@latest init`)
- @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- Vitest + @testing-library/react

**Backend:**
- Python 3.12+
- FastAPI + uvicorn (dev server :8000)
- python-multipart (for cover uploads)
- python-dotenv
- pytest

**Data:**
- `db/all_cards.csv` — card database, read-only
- `db/decks.json` — deck persistence, read/write
- `C:\Users\Legion\Documents\MEGA\EN Series 9 Card Library` — card images (static mount at `/images/`)
- `uploads/covers/` — cover images (served at `/uploads/covers/`)

## Critical Implementation Rules

### Language-Specific Rules

- Backend: snake_case for APIs, routes, files, and variables. Python 3.12+ dataclasses for models. Type hints on all function signatures.
- Frontend: camelCase for JS/TS variables and functions. PascalCase for React components and their files.
- TypeScript strict mode enabled. Avoid `any` — use `unknown` if type is truly dynamic.
- API response envelope: every endpoint returns `{data: ..., error: ...}`. Error shape: `{code: string, message: string}`.
- `async/await` throughout both frontend and backend. No raw `.then()` chains.

### Framework-Specific Rules

- **React Context:** One context per domain — DeckContext, SearchContext, CardInfoContext. Each context has a paired hook (useDeck, useCardSearch, useCardInfo) that wraps `useContext` with null checks.
- **Components are pure** — all side effects and data fetching live in hooks, not components.
- **No prop drilling beyond 1 level.** Use Context for cross-component state, local state for component-internal concerns.
- **DnD:** `@dnd-kit/core` for reordering cards within deck zones. Adding cards from Search panel uses click-to-add (not cross-panel drag).
- **FastAPI structure:** Routes in `routes/` by domain (cards, decks, covers). Business logic in `services/`. Pydantic models for request/response validation.
- **Card image matching:** Case-insensitive filename match by card name against the local image folder. Serve via FastAPI static mount at `/images/`.
- **Cover images:** Upload via POST multipart to `/api/decks/{id}/cover`. Saved to `uploads/covers/`. Serve via `/uploads/covers/` static mount.
- **Vite proxy:** In `vite.config.ts`, proxy `/api` → `http://localhost:8000`.
- **FastAPI CORS:** Allow origin `http://localhost:5173` (Vite default) or `http://localhost:3000`.

### Testing Rules

- **Frontend:** Vitest config in `vite.config.ts`. Component tests in `tests/frontend/components/*.test.tsx` using `@testing-library/react`. Mock API calls by wrapping `lib/api.ts`. Focus on behavior, not implementation details.
- **Backend:** pytest. Test services with fixtures for sample CSV rows and deck JSON. Test routes with `from fastapi.testclient import TestClient`.
- **Naming conventions:** Frontend tests: `*.test.tsx`. Backend tests: `test_*.py`.

### Code Quality & Style Rules

- **No comments in implementation code** unless the logic is genuinely non-obvious. Let the code speak.
- **No emoji in code or comments** unless the user explicitly requests them.
- **Directory structure:** Feature folders (card-search/, deck-builder/, deck-library/, card-info/). Shared primitives in components/ui/. Layout components in components/layout/.
- **File naming:** React components: PascalCase. Utilities/hooks: camelCase. Types: kebab-case (card.ts, deck.ts).
- **Linting:** Prettier defaults for frontend formatting. Ruff defaults for backend.

### Critical Don't-Miss Rules

- **Never read/write CSV from the frontend** — all card data must go through `/api/cards`.
- **Never hardcode the card image path** — always use the `/images/` route served by FastAPI.
- **Always use relative `/api/` URLs in frontend code** — Vite proxy handles the forwarding to `:8000`.
- **Cover uploads:** Restrict accepted file types to jpg, png, webp. Enforce max 5MB file size.
- **YDK import/export format:** Lines starting with `#main`, `#extra`, `!side` denote zone boundaries. Everything else is either a card ID (numeric) or an empty line to skip.
- **Deck validation:** Main deck 40–60 cards. Extra deck 0–15. Side deck 0–15. Max 3 copies per card name across the entire deck.
- **State coupling:** Hovering a card in Search results or a Deck slot updates CardInfoContext (right panel). Clicking "Add to Deck" in Search dispatches to DeckContext (middle panel). Contexts are independent but panel-orchestrated.
- **No authentication, no accounts, no cloud sync, no mobile layout.**

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-06-03
