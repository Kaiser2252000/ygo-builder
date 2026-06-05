import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { ToastProvider } from "@/components/ui/toast"
import { DeckBuilder } from "@/components/deck-builder/DeckBuilder"
import type { Card } from "@/types/card"
import type { Deck } from "@/types/deck"

const mockCards: Card[] = [
  {
    id: 1,
    name: "Blue-Eyes White Dragon",
    type: "Monster",
    frameType: "normal",
    description: "",
    level: 8,
    atk: 3000,
    def: 2500,
    race: "Dragon",
    attribute: "LIGHT",
    archetype: "",
  },
  {
    id: 2,
    name: "Mystical Space Typhoon",
    type: "Spell",
    frameType: "spell",
    description: "",
    level: null,
    atk: null,
    def: null,
    race: "",
    attribute: "",
    archetype: "",
  },
  {
    id: 3,
    name: "Mirror Force",
    type: "Trap",
    frameType: "trap",
    description: "",
    level: null,
    atk: null,
    def: null,
    race: "",
    attribute: "",
    archetype: "",
  },
]

const mockDeck: Deck = {
  id: "1",
  name: "Test Deck",
  cover: null,
  decklist: {
    "main-deck": [1, 2],
    "extra-deck": [3],
    "side-deck": [],
  },
}

const mockSetHoveredCard = vi.fn()
let mockUseDeckFn: () => Record<string, unknown>

vi.mock("@/hooks/useDeck", () => ({
  useDeck: () => mockUseDeckFn(),
}))

vi.mock("@/hooks/useCardInfo", () => ({
  useCardInfo: () => ({
    hoveredCard: null,
    setHoveredCard: mockSetHoveredCard,
  }),
}))

vi.mock("@/lib/api", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiDelete: vi.fn(),
  searchCards: vi.fn(),
  fetchDecks: vi.fn(),
  createDeck: vi.fn(),
  deleteDeck: vi.fn(),
  fetchCardsByIds: vi.fn(),
}))

describe("DeckBuilder", () => {
  let mockRemoveCardFromZone: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockRemoveCardFromZone = vi.fn()
    mockUseDeckFn = () => ({
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
      removeCardFromZone: mockRemoveCardFromZone,
      moveCardWithinZone: vi.fn(),
      sortZone: vi.fn(),
      clearAllZones: vi.fn(),
      saveDeck: vi.fn(),
    })
  })

  async function mockFetchCards() {
    const api = vi.mocked(await import("@/lib/api"))
    api.fetchCardsByIds.mockResolvedValue({ data: mockCards, error: null })
  }

  it("shows deck name breadcrumb", async () => {
    await mockFetchCards()
    render(<ToastProvider><DeckBuilder /></ToastProvider>)

    await waitFor(() => {
      expect(screen.getByText("Test Deck")).toBeDefined()
    })
  })

  it("renders all three zones with correct headers and max counts", async () => {
    await mockFetchCards()
    render(<ToastProvider><DeckBuilder /></ToastProvider>)

    await waitFor(() => {
      expect(screen.getByText("Main Deck (2/60)")).toBeDefined()
      expect(screen.getByText("Extra Deck (1/15)")).toBeDefined()
      expect(screen.getByText("Side Deck (0/15)")).toBeDefined()
    })
  })

  it("shows empty slot placeholders", async () => {
    await mockFetchCards()
    render(<ToastProvider><DeckBuilder /></ToastProvider>)

    await waitFor(() => {
      const slots = screen.getAllByTestId("deck-slot")
      const emptySlots = slots.filter((s) => s.textContent === "—")
      expect(emptySlots.length).toBe(87)
    })
  })

  it("shows occupied slot card names", async () => {
    await mockFetchCards()
    render(<ToastProvider><DeckBuilder /></ToastProvider>)

    await waitFor(() => {
      expect(screen.getByText("Blue-Eyes White Dragon")).toBeDefined()
    })
  })

  it("calls setHoveredCard with card on slot hover", async () => {
    await mockFetchCards()
    render(<ToastProvider><DeckBuilder /></ToastProvider>)

    await waitFor(() => {
      expect(screen.getByText("Blue-Eyes White Dragon")).toBeDefined()
    })

    const slots = screen.getAllByTestId("deck-slot")
    const occupiedSlot = slots.find((s) => s.textContent?.includes("Blue-Eyes White Dragon"))
    expect(occupiedSlot).not.toBeUndefined()

    fireEvent.mouseEnter(occupiedSlot!)

    await waitFor(() => {
      expect(mockSetHoveredCard).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, name: "Blue-Eyes White Dragon" }),
      )
    })
  })

  it("applies frameType left-border classes", async () => {
    await mockFetchCards()
    render(<ToastProvider><DeckBuilder /></ToastProvider>)

    await waitFor(() => {
      expect(screen.getByText("Mystical Space Typhoon")).toBeDefined()
      expect(screen.getByText("Mirror Force")).toBeDefined()
    })

    const slots = screen.getAllByTestId("deck-slot")
    const spellSlot = slots.find((s) => s.textContent?.includes("Mystical Space Typhoon"))
    const trapSlot = slots.find((s) => s.textContent?.includes("Mirror Force"))

    expect(spellSlot?.className).toContain("border-l-green-500")
    expect(trapSlot?.className).toContain("border-l-purple-500")
  })

  it("removes card on right-click of occupied slot", async () => {
    await mockFetchCards()
    render(<ToastProvider><DeckBuilder /></ToastProvider>)

    await waitFor(() => {
      expect(screen.getByText("Blue-Eyes White Dragon")).toBeDefined()
    })

    const slots = screen.getAllByTestId("deck-slot")
    const occupiedSlot = slots.find((s) => s.textContent?.includes("Blue-Eyes White Dragon"))
    expect(occupiedSlot).not.toBeUndefined()

    fireEvent.contextMenu(occupiedSlot!)

    expect(mockRemoveCardFromZone).toHaveBeenCalledWith("1", "main-deck", 0)
  })
})
