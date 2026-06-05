import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DeckLibrary } from "../../../frontend/src/components/deck-library/DeckLibrary"
import { DeckProvider } from "../../../frontend/src/contexts/DeckContext"
import { ToastProvider } from "../../../frontend/src/components/ui/toast"
import type { Deck } from "../../../frontend/src/types/deck"

const mockDecks: Deck[] = [
  {
    id: "1",
    name: "Dragon Beatdown",
    cover: null,
    decklist: { "main-deck": [1, 2, 3], "extra-deck": [4], "side-deck": [] },
  },
  {
    id: "2",
    name: "Spellbook Control",
    cover: "cover.jpg",
    decklist: { "main-deck": [5, 6], "extra-deck": [], "side-deck": [7] },
  },
]

const mockApi = {
  fetchDecks: vi.fn(),
  createDeck: vi.fn(),
  deleteDeck: vi.fn(),
}

vi.mock("../../../frontend/src/lib/api", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiDelete: vi.fn(),
  searchCards: vi.fn(),
  fetchDecks: () => mockApi.fetchDecks(),
  createDeck: (name: string) => mockApi.createDeck(name),
  deleteDeck: (id: string) => mockApi.deleteDeck(id),
}))

function renderDeckLibrary() {
  return render(
    <ToastProvider>
      <DeckProvider>
        <DeckLibrary />
      </DeckProvider>
    </ToastProvider>
  )
}

describe("DeckLibrary", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows loading skeletons while fetching decks", () => {
    mockApi.fetchDecks.mockReturnValue(new Promise(() => {}))
    renderDeckLibrary()
    const skeletons = document.querySelectorAll(".animate-pulse")
    expect(skeletons.length).toBeGreaterThanOrEqual(3)
  })

  it("shows empty state when no decks exist", async () => {
    mockApi.fetchDecks.mockResolvedValue({ data: [], error: null })
    renderDeckLibrary()
    await waitFor(() => {
      expect(screen.getByText("No decks yet. Create your first deck to get started.")).toBeDefined()
    })
  })

  it("shows deck cards when decks exist", async () => {
    mockApi.fetchDecks.mockResolvedValue({ data: mockDecks, error: null })
    renderDeckLibrary()
    await waitFor(() => {
      expect(screen.getByText("Dragon Beatdown")).toBeDefined()
      expect(screen.getByText("Spellbook Control")).toBeDefined()
    })
  })

  it("shows zone counts correctly", async () => {
    mockApi.fetchDecks.mockResolvedValue({ data: mockDecks, error: null })
    renderDeckLibrary()
    await waitFor(() => {
      expect(screen.getByText("Main 3 / Extra 1 / Side 0")).toBeDefined()
      expect(screen.getByText("Main 2 / Extra 0 / Side 1")).toBeDefined()
    })
  })

  it("shows cover placeholder for decks without cover", async () => {
    mockApi.fetchDecks.mockResolvedValue({ data: [mockDecks[0]], error: null })
    renderDeckLibrary()
    await waitFor(() => {
      expect(screen.getByText("No Cover")).toBeDefined()
    })
  })

  it("filters decks by search query", async () => {
    mockApi.fetchDecks.mockResolvedValue({ data: mockDecks, error: null })
    renderDeckLibrary()
    await waitFor(() => {
      expect(screen.getByText("Dragon Beatdown")).toBeDefined()
    })

    const searchInput = screen.getByPlaceholderText("Search decks...")
    await userEvent.type(searchInput, "Dragon")

    expect(screen.getByText("Dragon Beatdown")).toBeDefined()
    expect(screen.queryByText("Spellbook Control")).toBeNull()
  })

  it("shows create deck dialog when clicking create button", async () => {
    mockApi.fetchDecks.mockResolvedValue({ data: [], error: null })
    renderDeckLibrary()
    await waitFor(() => {
      expect(screen.getByText("No decks yet. Create your first deck to get started.")).toBeDefined()
    })

    const createButtons = screen.getAllByText("+ Create New Deck")
    await userEvent.click(createButtons[0])

    expect(screen.getByText("Create New Deck")).toBeDefined()
  })

  it("calls createDeck API when confirming create dialog", async () => {
    mockApi.fetchDecks.mockResolvedValue({ data: [], error: null })
    mockApi.createDeck.mockResolvedValue({
      data: { id: "3", name: "Test Deck", cover: null, decklist: { "main-deck": [], "extra-deck": [], "side-deck": [] } },
      error: null,
    })
    renderDeckLibrary()
    await waitFor(() => {
      expect(screen.getByText("No decks yet. Create your first deck to get started.")).toBeDefined()
    })

    const createButtons = screen.getAllByText("+ Create New Deck")
    await userEvent.click(createButtons[0])

    const nameInput = screen.getByPlaceholderText("Enter deck name...")
    await userEvent.type(nameInput, "Test Deck")
    await userEvent.click(screen.getByText("Create"))

    await waitFor(() => {
      expect(mockApi.createDeck).toHaveBeenCalledWith("Test Deck")
    })
  })

  it("shows delete confirmation dialog", async () => {
    mockApi.fetchDecks.mockResolvedValue({ data: mockDecks, error: null })
    renderDeckLibrary()
    await waitFor(() => {
      expect(screen.getByText("Dragon Beatdown")).toBeDefined()
    })

    const deleteButtons = screen.getAllByText("Delete")
    await userEvent.click(deleteButtons[0])

    expect(screen.getByText("Delete Dragon Beatdown?")).toBeDefined()
  })

  it("calls deleteDeck API when confirming delete", async () => {
    mockApi.fetchDecks.mockResolvedValue({ data: mockDecks, error: null })
    mockApi.deleteDeck.mockResolvedValue({ data: { id: "1" }, error: null })
    renderDeckLibrary()
    await waitFor(() => {
      expect(screen.getByText("Dragon Beatdown")).toBeDefined()
    })

    const deleteButtons = screen.getAllByText("Delete")
    await userEvent.click(deleteButtons[0])

    const confirmButton = screen.getByText("Delete")
    await userEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockApi.deleteDeck).toHaveBeenCalledWith("1")
    })
  })
})
