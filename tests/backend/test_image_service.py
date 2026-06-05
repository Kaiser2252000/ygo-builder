import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_ROOT))

from services import image_service


def reset_image_index():
    image_service._image_index = None


def test_find_card_image_url_matches_case_insensitive_stem(monkeypatch, tmp_path):
    reset_image_index()
    image_file = tmp_path / "dark magician.jpg"
    image_file.write_bytes(b"image")
    monkeypatch.setattr(image_service, "IMAGE_PATH", str(tmp_path))

    assert image_service.find_card_image_url("Dark Magician") == "/images/dark%20magician.jpg"


def test_find_card_image_url_supports_uppercase_supported_extension(monkeypatch, tmp_path):
    reset_image_index()
    image_file = tmp_path / "DARK MAGICIAN.PNG"
    image_file.write_bytes(b"image")
    monkeypatch.setattr(image_service, "IMAGE_PATH", str(tmp_path))

    assert image_service.find_card_image_url("dark magician") == "/images/DARK%20MAGICIAN.PNG"


def test_find_card_image_url_ignores_unsupported_extension(monkeypatch, tmp_path):
    reset_image_index()
    image_file = tmp_path / "Dark Magician.gif"
    image_file.write_bytes(b"image")
    monkeypatch.setattr(image_service, "IMAGE_PATH", str(tmp_path))

    assert image_service.find_card_image_url("Dark Magician") is None


def test_find_card_image_url_returns_none_for_missing_directory(monkeypatch, tmp_path):
    reset_image_index()
    monkeypatch.setattr(image_service, "IMAGE_PATH", str(tmp_path / "missing"))

    assert image_service.find_card_image_url("Dark Magician") is None


def test_find_card_image_url_reuses_index_for_multiple_lookups(monkeypatch, tmp_path):
    reset_image_index()
    (tmp_path / "Dark Magician.jpg").write_bytes(b"image")
    monkeypatch.setattr(image_service, "IMAGE_PATH", str(tmp_path))

    assert image_service.find_card_image_url("Dark Magician") == "/images/Dark%20Magician.jpg"

    (tmp_path / "Blue-Eyes White Dragon.jpg").write_bytes(b"image")

    assert image_service.find_card_image_url("Blue-Eyes White Dragon") is None
