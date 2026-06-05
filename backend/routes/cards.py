import logging

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from models.card import Card
from services.card_service import get_cards_by_ids, search_cards
from services.image_service import find_card_image_url

router = APIRouter(tags=["cards"])
logger = logging.getLogger(__name__)


@router.get("/cards/batch")
def get_cards_batch(ids: str = Query("")):
    try:
        if not ids.strip():
            return {"data": [], "error": None}
        parsed_ids = list({int(x) for x in ids.split(",") if x.strip()})
        results = get_cards_by_ids(parsed_ids)
    except ValueError:
        return JSONResponse(
            status_code=400,
            content={
                "data": None,
                "error": {"code": "INVALID_IDS", "message": "ids must be a comma-separated list of integers"},
            },
        )
    except Exception:
        logger.exception("Batch card lookup failed")
        return JSONResponse(
            status_code=500,
            content={
                "data": None,
                "error": {"code": "BATCH_ERROR", "message": "Batch lookup failed. Check server connection."},
            },
        )
    return {"data": [_serialize_card(card) for card in results], "error": None}


@router.get("/cards")
def get_cards(q: str = Query("", min_length=0)):
    try:
        results = search_cards(q)
    except Exception:
        logger.exception("Card search failed")
        return JSONResponse(
            status_code=500,
            content={
                "data": None,
                "error": {
                    "code": "SEARCH_ERROR",
                    "message": "Search failed. Check server connection.",
                },
            },
        )
    return {"data": [_serialize_card(card) for card in results], "error": None}


def _serialize_card(card: Card) -> dict[str, int | str | None]:
    return {
        "id": card.id,
        "name": card.name,
        "type": card.type,
        "frameType": card.frameType,
        "description": card.description,
        "level": card.level,
        "atk": card.atk,
        "def": card.def_,
        "race": card.race,
        "attribute": card.attribute,
        "archetype": card.archetype,
        "imageUrl": find_card_image_url(card.name),
    }
