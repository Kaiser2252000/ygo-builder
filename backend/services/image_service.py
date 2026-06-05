from pathlib import Path
from urllib.parse import quote

from config import IMAGE_PATH

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
_image_index: dict[str, str] | None = None


def _normalize_name(name: str) -> str:
    return name.replace(": ", " - ").replace('"', "").casefold()


def find_card_image_url(card_name: str) -> str | None:
    image_index = _get_image_index()
    if image_index is None:
        return None
    return image_index.get(_normalize_name(card_name))


def _get_image_index() -> dict[str, str] | None:
    global _image_index
    if _image_index is not None:
        return _image_index

    image_dir = Path(IMAGE_PATH)
    if not image_dir.is_dir():
        return None

    image_index: dict[str, str] = {}
    try:
        for candidate in image_dir.iterdir():
            if not candidate.is_file():
                continue
            if candidate.suffix.casefold() not in SUPPORTED_EXTENSIONS:
                continue
            image_index[candidate.stem.casefold()] = f"/images/{quote(candidate.name)}"
    except OSError:
        return None

    _image_index = image_index
    return _image_index
