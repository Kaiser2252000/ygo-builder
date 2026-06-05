import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ToastProvider } from "@/components/ui/toast"
import { sortCardIds } from "@/lib/utils"
import { DeckBuilder } from "@/components/deck-builder/DeckBuilder"
import type { Card } from "@/types/card"
import type { Deck } from "@/types/deck"

// ─── sortCardIds pure function tests ────────────────────────────────────────

const normCard: Card = { id: 1, name: "Alpha Warrior", type: "Monster", frameType: "normal", description: "", level: 4, atk: 1500, def: 1000, race: "Warrior", attribute: "EARTH", archetype: "" }
const effCard: Card = { id: 2, name: "Beta Sorcerer", type: "Monster", frameType: "effect", description: "", level: 6, atk: 2000, def: 1500, race: "Spellcaster", attribute: "DARK", archetype: "" }
const ritCard: Card = { id: 3, name: "Gamma Ritual", type: "Monster", frameType: "ritual", description: "", level: 8, atk: 3000, def: 2500, race: "Dragon", attribute: "LIGHT", archetype: "" }
const fusCard: Card = { id: 4, name: "Delta Fusion", type: "Monster", frameType: "fusion", description: "", level: 7, atk: 2500, def: 2000, race: "Beast", attribute: "WIND", archetype: "" }
const synCard: Card = { id: 5, name: "Epsilon Synchro", type: "Monster", frameType: "synchro", description: "", level: 5, atk: 1800, def: 1200, race: "Machine", attribute: "FIRE", archetype: "" }
const xyzCard: Card = { id: 6, name: "Zeta Xyz", type: "Monster", frameType: "xyz", description: "", level: 4, atk: 2100, def: 1600, race: "Fiend", attribute: "DARK", archetype: "" }
const linCard: Card = { id: 7, name: "Eta Link", type: "Monster", frameType: "link", description: "", level: null, atk: 2300, def: null, race: "Cyberse", attribute: "LIGHT", archetype: "" }
const spellCard: Card = { id: 8, name: "Mystical Space Typhoon", type: "Spell", frameType: "spell", description: "", level: null, atk: null, def: null, race: "Quick-Play", attribute: "", archetype: "" }
const trapCard: Card = { id: 9, name: "Mirror Force", type: "Trap", frameType: "trap", description: "", level: null, atk: null, def: null, race: "Normal", attribute: "", archetype: "" }
const pendCard: Card = { id: 10, name: "Pendulum Monster", type: "Monster", frameType: "pendulum", description: "", level: 3, atk: 1200, def: 800, race: "Spellcaster", attribute: "DARK", archetype: "" }

function makeMap(cards: Card[]): Map<number, Card> {
  return new Map(cards.map((c) => [c.id, c]))
}

describe("sortCardIds", () => {
  it("returns empty array for empty input", () => {
    expect(sortCardIds([], new Map())).toEqual([])
  })

  it("appends unknown card IDs at end in original order", () => {
    const map = makeMap([normCard])
    const result = sortCardIds([99, 1, 88], map)
    expect(result).toEqual([1, 99, 88])
  })

  it("sorts monsters by frameType priority: normal → effect → ritual → fusion → synchro → xyz → link", () => {
    const map = makeMap([linCard, normCard, effCard, ritCard, fusCard, synCard, xyzCard])
    const ids = [linCard.id, normCard.id, effCard.id, ritCard.id, fusCard.id, synCard.id, xyzCard.id]
    const result = sortCardIds(ids, map)
    expect(result).toEqual([
      normCard.id,
      effCard.id,
      ritCard.id,
      fusCard.id,
      synCard.id,
      xyzCard.id,
      linCard.id,
    ])
  })

  it("within same frameType sorts by level desc → ATK desc → DEF desc → name asc", () => {
    const a: Card = { ...normCard, id: 11, name: "A", level: 5, atk: 2000, def: 1500 }
    const b: Card = { ...normCard, id: 12, name: "B", level: 5, atk: 2000, def: 1000 }
    const c: Card = { ...normCard, id: 13, name: "C", level: 5, atk: 1800, def: 1500 }
    const d: Card = { ...normCard, id: 14, name: "D", level: 4, atk: 2000, def: 1500 }
    const map = makeMap([b, d, c, a])
    const result = sortCardIds([b.id, d.id, c.id, a.id], map)
    expect(result).toEqual([a.id, b.id, c.id, d.id])
  })

  it("sorts same frameType with null level/ATK/DEF last", () => {
    const withNull: Card = { ...normCard, id: 21, name: "Null Card", level: null, atk: null, def: null }
    const withVals: Card = { ...normCard, id: 22, name: "Val Card", level: 4, atk: 1500, def: 1000 }
    const map = makeMap([withNull, withVals])
    const result = sortCardIds([withNull.id, withVals.id], map)
    expect(result).toEqual([withVals.id, withNull.id])
  })

  it("places spells after monsters sorted by race → name", () => {
    const spellB: Card = { ...spellCard, id: 31, name: "B Spell", race: "Quick-Play" }
    const spellA: Card = { ...spellCard, id: 32, name: "A Spell", race: "Normal" }
    const norm: Card = { ...normCard, id: 33, name: "Monster" }
    const map = makeMap([spellB, spellA, norm])
    const result = sortCardIds([spellB.id, spellA.id, norm.id], map)
    expect(result).toEqual([norm.id, spellA.id, spellB.id])
  })

  it("places traps after spells sorted by race → name", () => {
    const trapA: Card = { ...trapCard, id: 41, name: "A Trap", race: "Counter" }
    const trapB: Card = { ...trapCard, id: 42, name: "B Trap", race: "Normal" }
    const spell: Card = { ...spellCard, id: 43, name: "Spell" }
    const map = makeMap([trapB, trapA, spell])
    const result = sortCardIds([trapB.id, trapA.id, spell.id], map)
    expect(result).toEqual([spell.id, trapA.id, trapB.id])
  })

  it("places other frameTypes (pendulum, token) after traps", () => {
    const map = makeMap([spellCard, normCard, trapCard, pendCard])
    const result = sortCardIds([spellCard.id, normCard.id, trapCard.id, pendCard.id], map)
    expect(result).toEqual([normCard.id, spellCard.id, trapCard.id, pendCard.id])
  })

  it("handles full mixed deck end-to-end", () => {
    const cards = [normCard, effCard, ritCard, fusCard, synCard, xyzCard, linCard, spellCard, trapCard, pendCard]
    const map = makeMap(cards)
    const ids = cards.map((c) => c.id)
    const result = sortCardIds(ids, map)
    expect(result).toEqual([
      normCard.id,
      effCard.id,
      ritCard.id,
      fusCard.id,
      synCard.id,
      xyzCard.id,
      linCard.id,
      spellCard.id,
      trapCard.id,
      pendCard.id,
    ])
  })
})

// ─── Sort and Clear integration tests ────────────────────────────────────────

const mockSortZone = vi.fn()
const mockClearAllZones = vi.fn()

const mockDeck: Deck = {
  id: "1",
  name: "Sortable Deck",
  cover: null,
  decklist: {
    "main-deck": [8, 9, 1],
    "extra-deck": [],
    "side-deck": [],
  },
}

const mockCards: Card[] = [normCard, spellCard, trapCard]

vi.mock("@/hooks/useDeck", () => ({
  useDeck: () => ({
    decks: [mockDeck],
    activeDeckId: "1",
    isLoading: false,
    error: null,
    view: "builder",
    loadDecks: vi.fn(),
    createDeck: vi.fn(),
    deleteDeck: vi.fn(),
    setActiveDeck: vi.fn(),
    setView: vi.fn(),
    clearError: vi.fn(),
    addCardToZone: vi.fn(),
    removeCardFromZone: vi.fn(),
    moveCardWithinZone: vi.fn(),
    sortZone: mockSortZone,
    clearAllZones: mockClearAllZones,
    saveDeck: vi.fn(),
  }),
}))

vi.mock("@/hooks/useCardInfo", () => ({
  useCardInfo: () => ({
    hoveredCard: null,
    setHoveredCard: vi.fn(),
  }),
}))

vi.mock("@/lib/api", () => ({
  fetchCardsByIds: vi.fn(),
}))

describe("DeckBuilder sort and clear", () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const api = vi.mocked(await import("@/lib/api"))
    api.fetchCardsByIds.mockResolvedValue({ data: mockCards, error: null })
  })

  it("renders Sort button once in the header", async () => {
    render(<ToastProvider><DeckBuilder /></ToastProvider>)
    await waitFor(() => {
      const sortButtons = screen.getAllByText("Sort")
      expect(sortButtons.length).toBe(1)
    })
  })

  it("renders Clear button", async () => {
    render(<ToastProvider><DeckBuilder /></ToastProvider>)
    await waitFor(() => {
      expect(screen.getByText("Clear")).toBeDefined()
    })
  })

  it("Sort button sorts all zones", async () => {
    render(<ToastProvider><DeckBuilder /></ToastProvider>)
    await waitFor(() => {
      expect(screen.getByText("Main Deck (3/60)")).toBeDefined()
    })

    fireEvent.click(screen.getByText("Sort"))

    await waitFor(() => {
      expect(mockSortZone).toHaveBeenCalledWith("1", "main-deck", [1, 8, 9])
    })
  })

  it("Clear button opens AlertDialog", async () => {
    render(<ToastProvider><DeckBuilder /></ToastProvider>)
    await waitFor(() => {
      expect(screen.getByText("Clear")).toBeDefined()
    })

    fireEvent.click(screen.getByText("Clear"))
    await waitFor(() => {
      expect(screen.getByText("Clear all cards from this deck?")).toBeDefined()
      expect(screen.getByText("This will remove all cards from Main Deck, Extra Deck, and Side Deck.")).toBeDefined()
    })
  })

  it("Clear confirm calls clearAllZones and closes dialog", async () => {
    render(<ToastProvider><DeckBuilder /></ToastProvider>)
    await waitFor(() => {
      expect(screen.getByText("Clear")).toBeDefined()
    })

    const clearButtons = screen.getAllByText("Clear")
    fireEvent.click(clearButtons[0])
    await waitFor(() => {
      expect(screen.getByText("Clear all cards from this deck?")).toBeDefined()
    })

    const confirmButtons = screen.getAllByText("Clear")
    fireEvent.click(confirmButtons[1])
    await waitFor(() => {
      expect(mockClearAllZones).toHaveBeenCalledWith("1")
      expect(screen.queryByText("Clear all cards from this deck?")).toBeNull()
    })
  })

  it("Clear cancel does not call clearAllZones", async () => {
    render(<ToastProvider><DeckBuilder /></ToastProvider>)
    await waitFor(() => {
      expect(screen.getByText("Clear")).toBeDefined()
    })

    fireEvent.click(screen.getByText("Clear"))
    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeDefined()
    })

    fireEvent.click(screen.getByText("Cancel"))
    expect(mockClearAllZones).not.toHaveBeenCalled()
  })
})
