import json
import os
from dataclasses import replace
from uuid import uuid4

from config import DECKS_PATH
from models.card import Card
from models.deck import Deck, Decklist
from services.card_service import get_card_by_id

_deck_cache: list[Deck] | None = None


class DeckNotFoundError(Exception):
    def __init__(self, message: str = "Deck not found."):
        self.message = message
        super().__init__(message)


class DeckValidationError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


def list_decks() -> list[Deck]:
    return list(_load_decks())


def create_deck(name: str) -> Deck:
    decks = _load_decks()
    deck = Deck(id=str(uuid4()), name=name, cover=None, decklist=Decklist())
    _replace_deck_cache([*decks, deck])
    return deck


def update_deck(deck_id: str, decklist_data: dict) -> Deck:
    decks = _load_decks()
    deck_index, deck = _find_deck_with_index(decks, deck_id)
    decklist = Decklist.from_dict(decklist_data)
    _validate_decklist(decklist)
    updated_deck = replace(deck, decklist=decklist)
    updated_decks = [*decks]
    updated_decks[deck_index] = updated_deck
    _replace_deck_cache(updated_decks)
    return updated_deck


def delete_deck(deck_id: str) -> Deck:
    decks = _load_decks()
    deck_index, deck = _find_deck_with_index(decks, deck_id)
    updated_decks = [*decks]
    del updated_decks[deck_index]
    _replace_deck_cache(updated_decks)
    return deck


def _load_decks() -> list[Deck]:
    global _deck_cache
    if _deck_cache is None:
        _ensure_decks_file()
        with open(DECKS_PATH, mode="r", encoding="utf-8") as f:
            raw_decks = json.load(f)
        _deck_cache = [Deck.from_dict(deck) for deck in raw_decks]
    return _deck_cache


def _ensure_decks_file() -> None:
    os.makedirs(os.path.dirname(DECKS_PATH), exist_ok=True)
    if not os.path.exists(DECKS_PATH):
        with open(DECKS_PATH, mode="w", encoding="utf-8") as f:
            f.write("[]")


def _persist_decks(decks: list[Deck]) -> None:
    os.makedirs(os.path.dirname(DECKS_PATH), exist_ok=True)
    temp_path = f"{DECKS_PATH}.tmp"
    with open(temp_path, mode="w", encoding="utf-8") as f:
        json.dump([deck.to_dict() for deck in decks], f, indent=2)
    os.replace(temp_path, DECKS_PATH)


def _replace_deck_cache(decks: list[Deck]) -> None:
    global _deck_cache
    _persist_decks(decks)
    _deck_cache = decks


def _find_deck(decks: list[Deck], deck_id: str) -> Deck:
    return _find_deck_with_index(decks, deck_id)[1]


def _find_deck_with_index(decks: list[Deck], deck_id: str) -> tuple[int, Deck]:
    for index, deck in enumerate(decks):
        if deck.id == deck_id:
            return index, deck
    raise DeckNotFoundError()


def _validate_decklist(decklist: Decklist) -> None:
    if len(decklist.extra_deck) > 15:
        raise DeckValidationError("Extra deck must have 0-15 cards.")
    if len(decklist.side_deck) > 15:
        raise DeckValidationError("Side deck must have 0-15 cards.")


def _resolve_card(card_id: int) -> Card:
    card = get_card_by_id(card_id)
    if card is None:
        raise DeckValidationError(f"Unknown card ID: {card_id}.")
    return card


def export_deck(deck_id: str) -> str:
    decks = _load_decks()
    deck = _find_deck(decks, deck_id)
    lines: list[str] = []

    if deck.decklist.main_deck:
        lines.append("#main")
        lines.extend(str(cid) for cid in deck.decklist.main_deck)

    if deck.decklist.extra_deck:
        lines.append("#extra")
        lines.extend(str(cid) for cid in deck.decklist.extra_deck)

    if deck.decklist.side_deck:
        lines.append("!side")
        lines.extend(str(cid) for cid in deck.decklist.side_deck)

    return "\n".join(lines)


def import_deck_ydk(content: str) -> tuple[Decklist, list[int]]:
    decklist = Decklist()
    invalid_ids: list[int] = []
    current_zone: str | None = None

    for line in content.splitlines():
        stripped = line.strip()

        if not stripped:
            continue

        if stripped == "#main":
            current_zone = "main-deck"
            continue
        if stripped == "#extra":
            current_zone = "extra-deck"
            continue
        if stripped == "!side":
            current_zone = "side-deck"
            continue

        if stripped.startswith("#"):
            continue

        if not stripped.isdigit():
            continue

        card_id = int(stripped)
        card = get_card_by_id(card_id)
        if card is None:
            invalid_ids.append(card_id)
            continue

        if current_zone == "main-deck":
            decklist.main_deck.append(card_id)
        elif current_zone == "extra-deck":
            decklist.extra_deck.append(card_id)
        elif current_zone == "side-deck":
            decklist.side_deck.append(card_id)
        else:
            decklist.main_deck.append(card_id)

    _validate_decklist(decklist)
    return decklist, invalid_ids


def rename_deck(deck_id: str, new_name: str) -> Deck:
    decks = _load_decks()
    deck_index, deck = _find_deck_with_index(decks, deck_id)
    updated_deck = replace(deck, name=new_name)
    updated_decks = [*decks]
    updated_decks[deck_index] = updated_deck
    _replace_deck_cache(updated_decks)
    return updated_deck


def update_cover(deck_id: str, cover_path: str) -> Deck:
    decks = _load_decks()
    deck_index, deck = _find_deck_with_index(decks, deck_id)
    updated_deck = replace(deck, cover=cover_path)
    updated_decks = [*decks]
    updated_decks[deck_index] = updated_deck
    _replace_deck_cache(updated_decks)
    return updated_deck
