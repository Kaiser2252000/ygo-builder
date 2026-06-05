import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { DeckBuilder } from "@/components/deck-builder/DeckBuilder"
import { ToastProvider } from "@/components/ui/toast"
import type { Card } from "@/types/card"
import type { Deck } from "@/types/deck"

const mockCards: Card[] = [
  { id: 1, name: "Blue-Eyes White Dragon", type: "Monster", frameType: "normal", description: "", level: 8, atk: 3000, def: 2500, race: "Dragon", attribute: "LIGHT", archetype: "" },
  { id: 2, name: "Mystical Space Typhoon", type: "Spell", frameType: "spell", description: "", level: null, atk: null, def: null, race: "Quick-Play", attribute: "", archetype: "" },
  { id: 3, name: "Mirror Force", type: "Trap", frameType: "trap", description: "", level: null, atk: null, def: null, race: "Normal", attribute: "", archetype: "" },
]

const mockDeck: Deck = {
  id: "1",
  name: "Test Deck",
  cover: null,
  decklist: { "main-deck": [1, 2], "extra-deck": [3], "side-deck": [] },
}

let mockUseDeck: () => Record<string, unknown>

vi.mock("@/hooks/useDeck", () => ({
  useDeck: () => mockUseDeck(),
}))

vi.mock("@/hooks/useCardInfo", () => ({
  useCardInfo: () => ({
    hoveredCard: null,
    setHoveredCard: vi.fn(),
  }),
}))

const mockFetchCardsByIds = vi.fn()
const mockUploadCover = vi.fn()
const mockExportDeck = vi.fn()
const mockImportDeck = vi.fn()
const mockSaveDeck = vi.fn()
const mockClearAllZones = vi.fn()
const mockSortZone = vi.fn()

vi.mock("@/lib/api", () => ({
  fetchCardsByIds: (...args: unknown[]) => mockFetchCardsByIds(...args),
  updateDeck: vi.fn(),
  uploadCover: (...args: unknown[]) => mockUploadCover(...args),
  exportDeck: (...args: unknown[]) => mockExportDeck(...args),
  importDeck: (...args: unknown[]) => mockImportDeck(...args),
}))

function renderDeckBuilder() {
  return render(
    <ToastProvider>
      <DeckBuilder />
    </ToastProvider>
  )
}

describe("DeckBuilder save/import/export", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchCardsByIds.mockResolvedValue({ data: mockCards, error: null })
    mockUseDeck = () => ({
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
      saveDeck: mockSaveDeck,
    })
  })

  it("renders Save button in DeckBuilder header", async () => {
    renderDeckBuilder()
    await waitFor(() => {
      expect(screen.getByText("Save")).toBeDefined()
    })
  })

  it("renders Upload Cover button", async () => {
    renderDeckBuilder()
    await waitFor(() => {
      expect(screen.getByText("Upload Cover")).toBeDefined()
    })
  })

  it("renders Export button", async () => {
    renderDeckBuilder()
    await waitFor(() => {
      expect(screen.getByText("Export")).toBeDefined()
    })
  })

  it("renders Import button", async () => {
    renderDeckBuilder()
    await waitFor(() => {
      expect(screen.getByText("Import")).toBeDefined()
    })
  })

  it("Save button calls saveDeck with current deckId", async () => {
    mockSaveDeck.mockResolvedValue({ success: true })
    renderDeckBuilder()
    await waitFor(() => {
      expect(screen.getByText("Save")).toBeDefined()
    })
    fireEvent.click(screen.getByText("Save"))
    await waitFor(() => {
      expect(mockSaveDeck).toHaveBeenCalledWith("1")
    })
  })

  it("Save shows success Toast on success", async () => {
    mockSaveDeck.mockResolvedValue({ success: true })
    renderDeckBuilder()
    await waitFor(() => {
      expect(screen.getByText("Save")).toBeDefined()
    })
    fireEvent.click(screen.getByText("Save"))
    await waitFor(() => {
      expect(screen.getByText("Deck saved.")).toBeDefined()
    })
  })

  it("Save shows destructive Toast on failure", async () => {
    mockSaveDeck.mockResolvedValue({ success: false, error: "Server error" })
    renderDeckBuilder()
    await waitFor(() => {
      expect(screen.getByText("Save")).toBeDefined()
    })
    fireEvent.click(screen.getByText("Save"))
    await waitFor(() => {
      expect(screen.getByText("Couldn't save. Check server connection.")).toBeDefined()
    })
  })

  it("Save button shows Saving... during save", async () => {
    mockSaveDeck.mockImplementation(() => new Promise(() => {}))
    renderDeckBuilder()
    await waitFor(() => {
      expect(screen.getByText("Save")).toBeDefined()
    })
    fireEvent.click(screen.getByText("Save"))
    await waitFor(() => {
      expect(screen.getByText("Saving...")).toBeDefined()
    })
  })

  it("Upload Cover calls uploadCover API", async () => {
    mockUploadCover.mockResolvedValue({ data: mockDeck, error: null })
    renderDeckBuilder()
    await waitFor(() => {
      expect(screen.getByText("Upload Cover")).toBeDefined()
    })

    const fileInput = document.querySelector('input[type="file"][accept=".png,.jpg,.jpeg,.webp"]') as HTMLInputElement
    expect(fileInput).not.toBeNull()

    const file = new File(["dummy"], "cover.png", { type: "image/png" })
    fireEvent.change(fileInput, { target: { files: [file] } })
    await waitFor(() => {
      expect(mockUploadCover).toHaveBeenCalled()
    })
  })

  it("Export button triggers file download", async () => {
    mockExportDeck.mockResolvedValue({ data: { content: "#main\n1\n2\n#extra\n3" }, error: null })
    const createObjectURL = vi.fn(() => "blob:test")
    const revokeObjectURL = vi.fn()
    window.URL.createObjectURL = createObjectURL
    window.URL.revokeObjectURL = revokeObjectURL

    renderDeckBuilder()
    await waitFor(() => {
      expect(screen.getByText("Export")).toBeDefined()
    })

    fireEvent.click(screen.getByText("Export"))
    await waitFor(() => {
      expect(createObjectURL).toHaveBeenCalled()
    })
  })

  it("Export disabled when deck empty", async () => {
    mockUseDeck = () => ({
      decks: [{ ...mockDeck, decklist: { "main-deck": [], "extra-deck": [], "side-deck": [] } }],
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
      saveDeck: mockSaveDeck,
    })
    renderDeckBuilder()
    await waitFor(() => {
      const exportBtn = screen.getByText("Export").closest("button")
      expect(exportBtn?.hasAttribute("disabled")).toBe(true)
    })
  })

  it("Import button opens file picker", async () => {
    renderDeckBuilder()
    await waitFor(() => {
      expect(screen.getByText("Import")).toBeDefined()
    })

    const fileInput = document.querySelector('input[type="file"][accept=".txt"]') as HTMLInputElement
    expect(fileInput).not.toBeNull()
  })

  it("Import calls importDeck API with file content", async () => {
    mockImportDeck.mockResolvedValue({
      data: { decklist: { "main-deck": [1], "extra-deck": [], "side-deck": [] }, invalid_ids: [] },
      error: null,
    })

    renderDeckBuilder()
    await waitFor(() => {
      expect(screen.getByText("Import")).toBeDefined()
    })

    const fileInput = document.querySelector('input[type="file"][accept=".txt"]') as HTMLInputElement
    const file = new File(["#main\n1"], "deck.txt", { type: "text/plain" })
    file.text = () => Promise.resolve("#main\n1")
    fireEvent.change(fileInput!, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockImportDeck).toHaveBeenCalled()
    })
  })

  it("Import with invalid IDs shows AlertDialog", async () => {
    mockImportDeck.mockResolvedValue({
      data: { decklist: { "main-deck": [1], "extra-deck": [], "side-deck": [] }, invalid_ids: [999999] },
      error: null,
    })

    renderDeckBuilder()
    await waitFor(() => {
      expect(screen.getByText("Import")).toBeDefined()
    })

    const fileInput = document.querySelector('input[type="file"][accept=".txt"]') as HTMLInputElement
    const file = new File(["#main\n1"], "deck.txt", { type: "text/plain" })
    file.text = () => Promise.resolve("#main\n1")
    fireEvent.change(fileInput!, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText("Unknown Card IDs")).toBeDefined()
    })
  })

  it("Import with parse error shows AlertDialog", async () => {
    mockImportDeck.mockResolvedValue({
      data: null,
      error: { code: "PARSE_ERROR", message: "Parse failed." },
    })

    renderDeckBuilder()
    await waitFor(() => {
      expect(screen.getByText("Import")).toBeDefined()
    })

    const fileInput = document.querySelector('input[type="file"][accept=".txt"]') as HTMLInputElement
    const file = new File(["invalid"], "deck.txt", { type: "text/plain" })
    file.text = () => Promise.resolve("invalid")
    fireEvent.change(fileInput!, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText("Parse Error")).toBeDefined()
    })
  })

  it("Import success populates deck zones", async () => {
    mockImportDeck.mockResolvedValue({
      data: { decklist: { "main-deck": [1, 2], "extra-deck": [3], "side-deck": [] }, invalid_ids: [] },
      error: null,
    })

    renderDeckBuilder()
    await waitFor(() => {
      expect(screen.getByText("Import")).toBeDefined()
    })

    const fileInput = document.querySelector('input[type="file"][accept=".txt"]') as HTMLInputElement
    const file = new File(["#main\n1\n#extra\n!side"], "deck.txt", { type: "text/plain" })
    file.text = () => Promise.resolve("#main\n1\n#extra\n!side")
    fireEvent.change(fileInput!, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockImportDeck).toHaveBeenCalledWith("#main\n1\n#extra\n!side")
    })
  })

  it("Import network failure shows destructive Toast", async () => {
    mockImportDeck.mockResolvedValue({
      data: null,
      error: { code: "NETWORK_ERROR", message: "Request failed." },
    })

    renderDeckBuilder()
    await waitFor(() => {
      expect(screen.getByText("Import")).toBeDefined()
    })

    const fileInput = document.querySelector('input[type="file"][accept=".txt"]') as HTMLInputElement
    const file = new File(["#main\n1"], "deck.txt", { type: "text/plain" })
    file.text = () => Promise.resolve("#main\n1")
    fireEvent.change(fileInput!, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText("Couldn't import deck. Check server connection.")).toBeDefined()
    })
  })
})
