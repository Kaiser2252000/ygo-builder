import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_DIR = os.path.join(BASE_DIR, "..", "db")
UPLOADS_PATH = os.path.join(BASE_DIR, "uploads", "covers")

IMAGE_PATH = os.getenv(
    "IMAGE_PATH",
    r"C:\Users\Legion\Documents\MEGA\EN Series 9 Card Library",
)

CSV_PATH = os.path.join(DB_DIR, "all_cards.csv")
DECKS_PATH = os.path.join(DB_DIR, "decks.json")
