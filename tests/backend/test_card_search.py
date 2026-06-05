import sys
from pathlib import Path

import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_ROOT))

from models.card import Card
from routes import cards as cards_route
from services import card_service


@pytest.fixture(autouse=True)
def reset_card_cache():
    original_cache = card_service._card_cache
    card_service._card_cache = [
        Card(
            id=1,
            name="Blue-Eyes White Dragon",
            type="Normal Monster",
            frameType="normal",
            description="This legendary dragon can destroy any foe.",
            level=8,
            atk=3000,
            def_=2500,
            race="Dragon",
            attribute="LIGHT",
            archetype="Blue-Eyes",
        ),
        Card(
            id=2,
            name="Mystical Space Typhoon",
            type="Spell Card",
            frameType="spell",
            description="Target 1 Spell/Trap on the field; destroy that target.",
            race="Quick-Play",
        ),
    ]
    yield
    card_service._card_cache = original_cache


def test_search_cards_matches_name_case_insensitive():
    results = card_service.search_cards("blue-eyes")

    assert [card.name for card in results] == ["Blue-Eyes White Dragon"]


def test_search_cards_matches_description_case_insensitive():
    results = card_service.search_cards("DESTROY")

    assert [card.name for card in results] == [
        "Blue-Eyes White Dragon",
        "Mystical Space Typhoon",
    ]


def test_search_cards_empty_query_returns_no_results():
    assert card_service.search_cards("") == []


def test_get_cards_returns_response_envelope_with_csv_field_names(monkeypatch):
    monkeypatch.setattr(cards_route, "find_card_image_url", lambda name: "/images/Blue-Eyes.jpg")
    monkeypatch.setattr(
        cards_route,
        "search_cards",
        lambda q: [
            Card(
                id=1,
                name="Blue-Eyes White Dragon",
                type="Normal Monster",
                frameType="normal",
                description="Legendary dragon.",
                level=8,
                atk=3000,
                def_=2500,
                race="Dragon",
                attribute="LIGHT",
                archetype="Blue-Eyes",
            )
        ],
    )

    response = cards_route.get_cards("Blue-Eyes")

    assert response == {
        "data": [
            {
                "id": 1,
                "name": "Blue-Eyes White Dragon",
                "type": "Normal Monster",
                "frameType": "normal",
                "description": "Legendary dragon.",
                "level": 8,
                "atk": 3000,
                "def": 2500,
                "race": "Dragon",
                "attribute": "LIGHT",
                "archetype": "Blue-Eyes",
                "imageUrl": "/images/Blue-Eyes.jpg",
            }
        ],
        "error": None,
    }


def test_get_cards_returns_error_envelope_on_search_failure(monkeypatch, caplog):
    def raise_error(q):
        raise RuntimeError("csv unavailable")

    monkeypatch.setattr(cards_route, "search_cards", raise_error)

    response = cards_route.get_cards("Blue-Eyes")

    assert response.status_code == 500
    assert "Card search failed" in caplog.text
    assert response.body == (
        b'{"data":null,"error":{"code":"SEARCH_ERROR",'
        b'"message":"Search failed. Check server connection."}}'
    )
