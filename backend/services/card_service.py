import logging
import csv
from models.card import Card
from config import CSV_PATH

_card_cache: list[Card] | None = None
_card_cache_dict: dict[int, Card] | None = None


def _load_all_cards() -> list[Card]:
    cards: list[Card] = []
    with open(CSV_PATH, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            card = Card(
                id=int(row["id"]),
                name=row["name"],
                type=row["type"],
                frameType=row["frameType"],
                description=row["description"],
                level=_int_or_none(row.get("level")),
                atk=_int_or_none(row.get("atk")),
                def_=_int_or_none(row.get("def")),
                race=row.get("race", ""),
                attribute=row.get("attribute", ""),
                archetype=row.get("archetype", ""),
            )
            cards.append(card)
    return cards


def _build_cache_dict() -> dict[int, Card]:
    try:
        return {card.id: card for card in get_all_cards()}
    except Exception:
        logger = logging.getLogger(__name__)
        logger.exception("Failed to build card cache dict")
        return {}


def get_cards_by_ids(ids: list[int]) -> list[Card]:
    global _card_cache_dict
    if _card_cache_dict is None:
        _card_cache_dict = _build_cache_dict()
    return [_card_cache_dict[card_id] for card_id in ids if card_id in _card_cache_dict]


def _int_or_none(val: str | None) -> int | None:
    if val is None or val.strip() == "":
        return None
    try:
        return int(val)
    except ValueError:
        return None


def search_cards(query: str) -> list[Card]:
    q = query.lower().strip()
    if not q:
        return []

    results: list[Card] = []
    for card in get_all_cards():
        if q in card.name.lower() or q in card.description.lower():
            results.append(card)
            if len(results) >= 200:
                break
    return results


def get_all_cards() -> list[Card]:
    global _card_cache
    if _card_cache is None:
        _card_cache = _load_all_cards()
    return _card_cache


def get_card_by_id(card_id: int) -> Card | None:
    for card in get_all_cards():
        if card.id == card_id:
            return card
    return None
