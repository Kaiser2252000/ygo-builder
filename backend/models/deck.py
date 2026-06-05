from dataclasses import dataclass, field


@dataclass
class Decklist:
    main_deck: list[int] = field(default_factory=list)
    extra_deck: list[int] = field(default_factory=list)
    side_deck: list[int] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> "Decklist":
        return cls(
            main_deck=list(data.get("main-deck", [])),
            extra_deck=list(data.get("extra-deck", [])),
            side_deck=list(data.get("side-deck", [])),
        )

    def to_dict(self) -> dict[str, list[int]]:
        return {
            "main-deck": self.main_deck,
            "extra-deck": self.extra_deck,
            "side-deck": self.side_deck,
        }

    def all_card_ids(self) -> list[int]:
        return [*self.main_deck, *self.extra_deck, *self.side_deck]


@dataclass
class Deck:
    id: str
    name: str
    decklist: Decklist
    cover: str | None = None

    @classmethod
    def from_dict(cls, data: dict) -> "Deck":
        return cls(
            id=data["id"],
            name=data["name"],
            cover=data.get("cover"),
            decklist=Decklist.from_dict(data.get("decklist", {})),
        )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "cover": self.cover,
            "decklist": self.decklist.to_dict(),
        }
