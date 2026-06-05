from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import IMAGE_PATH, UPLOADS_PATH
from fastapi.exceptions import RequestValidationError
from routes.cards import router as cards_router
from routes.decks import (
    request_validation_exception_handler,
    router as decks_router,
)

app = FastAPI(title="Yu-Gi-Oh! Deck Builder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/images", StaticFiles(directory=IMAGE_PATH), name="images")
app.mount("/uploads/covers", StaticFiles(directory=UPLOADS_PATH), name="covers")

app.add_exception_handler(RequestValidationError, request_validation_exception_handler)

app.include_router(cards_router, prefix="/api")
app.include_router(decks_router, prefix="/api")
