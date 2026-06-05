from dataclasses import dataclass


@dataclass
class Card:
    id: int
    name: str
    type: str
    frameType: str
    description: str
    level: int | None = None
    atk: int | None = None
    def_: int | None = None
    race: str = ""
    attribute: str = ""
    archetype: str = ""
