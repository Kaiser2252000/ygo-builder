import logging
import os
from pathlib import Path

from fastapi import APIRouter, File, Request, UploadFile
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, ConfigDict, Field, field_validator
from config import UPLOADS_PATH
from services.deck_service import (
    create_deck,
    list_decks,
    update_deck,
    rename_deck,
    delete_deck,
    import_deck_ydk,
    export_deck,
    update_cover,
    DeckNotFoundError,
    DeckValidationError,
)

router = APIRouter(tags=["decks"])
logger = logging.getLogger(__name__)


class CreateDeckRequest(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        name = value.strip()
        if not name:
            raise ValueError("Deck name is required.")
        return name


class DecklistRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    main_deck: list[int] = Field(alias="main-deck")
    extra_deck: list[int] = Field(alias="extra-deck")
    side_deck: list[int] = Field(alias="side-deck")

    def to_decklist_dict(self) -> dict[str, list[int]]:
        return {
            "main-deck": self.main_deck,
            "extra-deck": self.extra_deck,
            "side-deck": self.side_deck,
        }


class UpdateDeckRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    decklist: DecklistRequest


class RenameDeckRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str


@router.get("/decks")
def get_decks():
    try:
        return {"data": [deck.to_dict() for deck in list_decks()], "error": None}
    except Exception:
        logger.exception("Deck list failed")
        return _error_response(500, "DECK_ERROR", "Deck operation failed.")


@router.post("/decks")
def post_deck(request: CreateDeckRequest):
    try:
        deck = create_deck(request.name)
        return JSONResponse(status_code=201, content={"data": deck.to_dict(), "error": None})
    except Exception:
        logger.exception("Deck create failed")
        return _error_response(500, "DECK_ERROR", "Deck operation failed.")


@router.put("/decks/{deck_id}")
def put_deck(deck_id: str, request: UpdateDeckRequest):
    try:
        deck = update_deck(deck_id, request.decklist.to_decklist_dict())
        return {"data": deck.to_dict(), "error": None}
    except DeckNotFoundError as exc:
        return _error_response(404, "NOT_FOUND", exc.message)
    except DeckValidationError as exc:
        return _error_response(400, "VALIDATION_ERROR", exc.message)
    except Exception:
        logger.exception("Deck update failed")
        return _error_response(500, "DECK_ERROR", "Deck operation failed.")


@router.patch("/decks/{deck_id}/rename")
def patch_deck_rename(deck_id: str, request: RenameDeckRequest):
    try:
        deck = rename_deck(deck_id, request.name)
        return {"data": deck.to_dict(), "error": None}
    except DeckNotFoundError as exc:
        return _error_response(404, "NOT_FOUND", exc.message)
    except Exception:
        logger.exception("Deck rename failed")
        return _error_response(500, "DECK_ERROR", "Deck operation failed.")


@router.delete("/decks/{deck_id}")
def delete_deck_route(deck_id: str):
    try:
        deck = delete_deck(deck_id)
        return {"data": deck.to_dict(), "error": None}
    except DeckNotFoundError as exc:
        return _error_response(404, "NOT_FOUND", exc.message)
    except Exception:
        logger.exception("Deck delete failed")
        return _error_response(500, "DECK_ERROR", "Deck operation failed.")


ALLOWED_COVER_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
MAX_COVER_SIZE = 5 * 1024 * 1024


@router.post("/decks/{deck_id}/cover")
async def post_deck_cover(deck_id: str, file: UploadFile = File(...)):
    try:
        ext = Path(file.filename or "").suffix.casefold()
        if ext not in ALLOWED_COVER_EXTENSIONS:
            return JSONResponse(
                status_code=400,
                content={
                    "data": None,
                    "error": {"code": "INVALID_FORMAT", "message": "Unsupported format. Supported: PNG, JPG, WEBP."},
                },
            )

        content = await file.read()
        if len(content) > MAX_COVER_SIZE:
            return JSONResponse(
                status_code=400,
                content={
                    "data": None,
                    "error": {"code": "FILE_TOO_LARGE", "message": "File exceeds 5MB limit."},
                },
            )

        os.makedirs(UPLOADS_PATH, exist_ok=True)
        cover_filename = f"{deck_id}{ext}"
        cover_path = os.path.join(UPLOADS_PATH, cover_filename)
        with open(cover_path, "wb") as f:
            f.write(content)

        public_path = f"/uploads/covers/{cover_filename}"
        deck = update_cover(deck_id, public_path)
        return {"data": deck.to_dict(), "error": None}
    except DeckNotFoundError as exc:
        return _error_response(404, "NOT_FOUND", exc.message)
    except Exception:
        logger.exception("Cover upload failed")
        return _error_response(500, "COVER_ERROR", "Cover upload failed.")


@router.get("/decks/{deck_id}/export")
def get_deck_export(deck_id: str):
    try:
        ydk_content = export_deck(deck_id)
        return {"data": {"content": ydk_content}, "error": None}
    except DeckNotFoundError as exc:
        return _error_response(404, "NOT_FOUND", exc.message)
    except Exception:
        logger.exception("Deck export failed")
        return _error_response(500, "EXPORT_ERROR", "Deck export failed.")


class ImportDeckRequest(BaseModel):
    content: str


@router.post("/decks/import")
def post_deck_import(body: ImportDeckRequest):
    try:
        decklist, invalid_ids = import_deck_ydk(body.content)
        return {
            "data": {
                "decklist": decklist.to_dict(),
                "invalid_ids": invalid_ids,
            },
            "error": None,
        }
    except DeckValidationError as exc:
        return _error_response(400, "PARSE_ERROR", exc.message)
    except Exception:
        logger.exception("Deck import failed")
        return _error_response(500, "IMPORT_ERROR", "Deck import failed.")


def _error_response(status_code: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"data": None, "error": {"code": code, "message": message}},
    )


def request_validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    return _error_response(422, "VALIDATION_ERROR", "Invalid request body.")
