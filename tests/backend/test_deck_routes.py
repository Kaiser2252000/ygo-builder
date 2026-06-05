import sys
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_ROOT))

from models.deck import Deck, Decklist
from routes import decks as decks_route
from services import deck_service


@pytest.fixture
def client():
    app = FastAPI()
    app.add_exception_handler(
        RequestValidationError, decks_route.request_validation_exception_handler
    )
    app.include_router(decks_route.router, prefix="/api")
    return TestClient(app)


def test_get_decks_returns_envelope(client, monkeypatch):
    monkeypatch.setattr(decks_route, "list_decks", lambda: [])

    response = client.get("/api/decks")

    assert response.status_code == 200
    assert response.json() == {"data": [], "error": None}


def test_post_decks_returns_created_envelope(client, monkeypatch):
    deck = Deck(id="deck-1", name="Dragon Beatdown", decklist=Decklist())
    monkeypatch.setattr(decks_route, "create_deck", lambda name: deck)

    response = client.post("/api/decks", json={"name": "Dragon Beatdown"})

    assert response.status_code == 201
    assert response.json() == {"data": deck.to_dict(), "error": None}


def test_post_decks_rejects_blank_name_with_envelope(client):
    response = client.post("/api/decks", json={"name": "   "})

    assert response.status_code == 422
    assert response.json() == {
        "data": None,
        "error": {"code": "VALIDATION_ERROR", "message": "Invalid request body."},
    }


def test_post_decks_rejects_missing_name_with_envelope(client):
    response = client.post("/api/decks", json={})

    assert response.status_code == 422
    assert response.json() == {
        "data": None,
        "error": {"code": "VALIDATION_ERROR", "message": "Invalid request body."},
    }


def test_put_deck_returns_updated_envelope(client, monkeypatch):
    deck = Deck(
        id="deck-1",
        name="Dragon Beatdown",
        decklist=Decklist(main_deck=list(range(1, 43))),
    )
    monkeypatch.setattr(decks_route, "update_deck", lambda deck_id, decklist: deck)

    response = client.put(
        "/api/decks/deck-1",
        json={
            "decklist": {
                "main-deck": list(range(1, 43)),
                "extra-deck": [],
                "side-deck": [],
            }
        },
    )

    assert response.status_code == 200
    assert response.json() == {"data": deck.to_dict(), "error": None}


def test_put_deck_rejects_partial_decklist_with_envelope(client):
    response = client.put(
        "/api/decks/deck-1",
        json={"decklist": {"main-deck": list(range(1, 41))}},
    )

    assert response.status_code == 422
    assert response.json() == {
        "data": None,
        "error": {"code": "VALIDATION_ERROR", "message": "Invalid request body."},
    }


def test_put_deck_rejects_mistyped_decklist_key_with_envelope(client):
    response = client.put(
        "/api/decks/deck-1",
        json={
            "decklist": {
                "main-deck": list(range(1, 41)),
                "extra_deck": [],
                "side-deck": [],
            }
        },
    )

    assert response.status_code == 422
    assert response.json() == {
        "data": None,
        "error": {"code": "VALIDATION_ERROR", "message": "Invalid request body."},
    }


def test_put_deck_returns_validation_error(client, monkeypatch):
    def raise_validation(deck_id, decklist):
        raise deck_service.DeckValidationError("Main deck must have 40-60 cards.")

    monkeypatch.setattr(decks_route, "update_deck", raise_validation)

    response = client.put(
        "/api/decks/deck-1",
        json={"decklist": {"main-deck": [], "extra-deck": [], "side-deck": []}},
    )

    assert response.status_code == 400
    assert response.json() == {
        "data": None,
        "error": {
            "code": "VALIDATION_ERROR",
            "message": "Main deck must have 40-60 cards.",
        },
    }


def test_delete_missing_deck_returns_not_found(client, monkeypatch):
    def raise_not_found(deck_id):
        raise deck_service.DeckNotFoundError("Deck not found.")

    monkeypatch.setattr(decks_route, "delete_deck", raise_not_found)

    response = client.delete("/api/decks/missing")

    assert response.status_code == 404
    assert response.json() == {
        "data": None,
        "error": {"code": "NOT_FOUND", "message": "Deck not found."},
    }


def test_delete_deck_returns_deleted_envelope(client, monkeypatch):
    deck = Deck(id="deck-1", name="Dragon Beatdown", decklist=Decklist())
    monkeypatch.setattr(decks_route, "delete_deck", lambda deck_id: deck)

    response = client.delete("/api/decks/deck-1")

    assert response.status_code == 200
    assert response.json() == {"data": deck.to_dict(), "error": None}
