import json
import sys
from pathlib import Path

import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_ROOT))

from models.card import Card
from services import deck_service


@pytest.fixture(autouse=True)
def reset_deck_service(tmp_path, monkeypatch):
    decks_path = tmp_path / "db" / "decks.json"
    monkeypatch.setattr(deck_service, "DECKS_PATH", str(decks_path))
    monkeypatch.setattr(
        deck_service,
        "get_card_by_id",
        lambda card_id: Card(
            id=card_id,
            name=f"Card {card_id}",
            type="Normal Monster",
            frameType="normal",
            description="",
        )
        if card_id != 999999
        else None,
    )
    deck_service._deck_cache = None
    yield decks_path
    deck_service._deck_cache = None


def test_list_decks_bootstraps_missing_file(reset_deck_service):
    decks = deck_service.list_decks()

    assert decks == []
    assert reset_deck_service.read_text(encoding="utf-8") == "[]"


def test_create_deck_persists_empty_deck(reset_deck_service):
    deck = deck_service.create_deck("Dragon Beatdown")

    assert deck.name == "Dragon Beatdown"
    assert deck.cover is None
    assert deck.decklist.to_dict() == {
        "main-deck": [],
        "extra-deck": [],
        "side-deck": [],
    }
    persisted = json.loads(reset_deck_service.read_text(encoding="utf-8"))
    assert persisted == [deck.to_dict()]
    assert deck_service.list_decks()[0].id == deck.id


def test_update_deck_persists_valid_decklist(reset_deck_service):
    deck = deck_service.create_deck("Dragon Beatdown")
    main_deck = list(range(1, 43))
    extra_deck = list(range(101, 109))

    updated = deck_service.update_deck(
        deck.id,
        {
            "main-deck": main_deck,
            "extra-deck": extra_deck,
            "side-deck": [],
        },
    )

    assert updated.decklist.main_deck == main_deck
    persisted = json.loads(reset_deck_service.read_text(encoding="utf-8"))
    assert persisted[0]["decklist"]["main-deck"] == main_deck
    assert persisted[0]["decklist"]["extra-deck"] == extra_deck


def test_update_rejects_invalid_main_deck_count_without_persisting(reset_deck_service):
    deck = deck_service.create_deck("Dragon Beatdown")
    before = reset_deck_service.read_text(encoding="utf-8")

    with pytest.raises(deck_service.DeckValidationError) as exc:
        deck_service.update_deck(
            deck.id,
            {
                "main-deck": list(range(1, 62)),
                "extra-deck": [],
                "side-deck": [],
            },
        )

    assert exc.value.message == "Main deck must have 40-60 cards."
    assert reset_deck_service.read_text(encoding="utf-8") == before


def test_update_rejects_invalid_extra_deck_count_without_persisting(reset_deck_service):
    deck = deck_service.create_deck("Dragon Beatdown")
    before = reset_deck_service.read_text(encoding="utf-8")

    with pytest.raises(deck_service.DeckValidationError) as exc:
        deck_service.update_deck(
            deck.id,
            {
                "main-deck": list(range(1, 41)),
                "extra-deck": list(range(101, 117)),
                "side-deck": [],
            },
        )

    assert exc.value.message == "Extra deck must have 0-15 cards."
    assert reset_deck_service.read_text(encoding="utf-8") == before


def test_update_rejects_invalid_side_deck_count_without_persisting(reset_deck_service):
    deck = deck_service.create_deck("Dragon Beatdown")
    before = reset_deck_service.read_text(encoding="utf-8")

    with pytest.raises(deck_service.DeckValidationError) as exc:
        deck_service.update_deck(
            deck.id,
            {
                "main-deck": list(range(1, 41)),
                "extra-deck": [],
                "side-deck": list(range(201, 217)),
            },
        )

    assert exc.value.message == "Side deck must have 0-15 cards."
    assert reset_deck_service.read_text(encoding="utf-8") == before


def test_update_rejects_more_than_three_copies_by_card_name(reset_deck_service, monkeypatch):
    deck = deck_service.create_deck("Dragon Beatdown")
    before = reset_deck_service.read_text(encoding="utf-8")

    monkeypatch.setattr(
        deck_service,
        "get_card_by_id",
        lambda card_id: Card(
            id=card_id,
            name="Blue-Eyes White Dragon" if card_id in {1, 2, 3, 4} else f"Card {card_id}",
            type="Normal Monster",
            frameType="normal",
            description="",
        ),
    )

    with pytest.raises(deck_service.DeckValidationError) as exc:
        deck_service.update_deck(
            deck.id,
            {
                "main-deck": list(range(1, 41)),
                "extra-deck": [],
                "side-deck": [],
            },
        )

    assert "Max 3 copies per card name" in exc.value.message
    assert reset_deck_service.read_text(encoding="utf-8") == before


def test_update_rejects_unknown_card_id(reset_deck_service):
    deck = deck_service.create_deck("Dragon Beatdown")

    with pytest.raises(deck_service.DeckValidationError) as exc:
        deck_service.update_deck(
            deck.id,
            {
                "main-deck": [999999] + list(range(1, 40)),
                "extra-deck": [],
                "side-deck": [],
            },
        )

    assert exc.value.message == "Unknown card ID: 999999."


def test_delete_deck_persists_removal(reset_deck_service):
    deck = deck_service.create_deck("Dragon Beatdown")

    deleted = deck_service.delete_deck(deck.id)

    assert deleted.id == deck.id
    assert deck_service.list_decks() == []
    assert json.loads(reset_deck_service.read_text(encoding="utf-8")) == []


def test_missing_deck_raises_not_found(reset_deck_service):
    with pytest.raises(deck_service.DeckNotFoundError):
        deck_service.delete_deck("missing")


def test_create_deck_does_not_update_cache_when_persist_fails(
    reset_deck_service, monkeypatch
):
    existing = deck_service.create_deck("Existing Deck")

    def raise_persist(decks):
        raise OSError("disk unavailable")

    monkeypatch.setattr(deck_service, "_persist_decks", raise_persist)

    with pytest.raises(OSError):
        deck_service.create_deck("Failed Deck")

    assert [deck.name for deck in deck_service.list_decks()] == [existing.name]
