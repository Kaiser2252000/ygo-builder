---
title: 'Remove Validation Rules'
type: 'feature'
created: '2026-06-03'
status: 'done'
baseline_commit: 'NO_VCS'
context: []
---

<frozen-after-approval>

## Intent

**Problem:** Backend enforces 40-60 card limit on Main Deck and max 3 copies per card name. These restrictions block experimental deck building.

**Approach:** Remove main-deck min/max validation and max-3-copy validation from `deck_service.py`. Keep Extra Deck and Side Deck 15-card structural limits (required by UI grid layout).

## Boundaries & Constraints

**Always:**
- Main Deck accepts any number of cards (0+)
- Any number of copies per card name accepted
- Extra Deck still limited to 0-15 (structural UI constraint)
- Side Deck still limited to 0-15 (structural UI constraint)
- Unknown card IDs still rejected

**Never:**
- Do not remove Extra/Side Deck 15-card limits (frontend renders exactly 15 slots)
- Do not change frontend validation UI or error handling

## Code Map

- `backend/services/deck_service.py` — Remove `Counter` import. Remove main deck 40-60 and max-3-copy checks from `_validate_decklist`. Keep extra/side deck 15 limits.

## Tasks & Acceptance

**Execution:**
- [x] `backend/services/deck_service.py` — Remove `from collections import Counter`. Remove `len(main_deck) < 40 or > 60` check. Remove max-3-copy per-name loop. — Freely build experimental decks.

**Acceptance Criteria:**
- Given a PUT /api/decks/{id} with 10 Main Deck cards, when saved, then accepted (no minimum-40 error)
- Given a PUT /api/decks/{id} with 80 Main Deck cards, when saved, then accepted (no maximum-60 error)
- Given a PUT /api/decks/{id} with 4 copies of the same card, when saved, then accepted (no max-3 error)
- Given a PUT /api/decks/{id} with 16 Extra Deck cards, when saved, then rejected (structural limit)

## Verification

**Commands:**
- `python -m py_compile backend/services/deck_service.py` — expected: no compile errors
- `cd frontend; npx vitest run` — expected: 73 tests pass
