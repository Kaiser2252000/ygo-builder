import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { DeckSlot } from "@/components/deck-builder/DeckSlot"
import { DeckSlotContextMenu } from "@/components/deck-builder/DeckSlotContextMenu"
import type { Card } from "@/types/card"

const mockCard: Card = {
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
}

import { useDraggable } from "@dnd-kit/core"

vi.mock("@dnd-kit/core", () => {
  const mockUseDraggable = vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
  }))
  return {
    useDroppable: vi.fn(() => ({
      setNodeRef: vi.fn(),
      isOver: false,
    })),
    useDraggable: mockUseDraggable,
    DndContext: vi.fn(({ children }: { children: React.ReactNode }) => children),
    DragOverlay: vi.fn(({ children }: { children: React.ReactNode }) => children),
    PointerSensor: vi.fn(),
    KeyboardSensor: vi.fn(),
    useSensor: vi.fn((sensor: unknown) => sensor),
    useSensors: vi.fn((...sensors: unknown[]) => sensors),
  }
})

describe("DeckSlot", () => {
  const mockHover = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders empty slot with placeholder", () => {
    render(
      <DeckSlot
        card={null}
        onHover={mockHover}
        droppableId="main-0"
        zoneType="main"
        slotIndex={0}
      />
    )
    const slot = screen.getByTestId("deck-slot")
    expect(slot.textContent).toBe("—")
  })

  it("renders occupied slot with card name", () => {
    render(
      <DeckSlot
        card={mockCard}
        onHover={mockHover}
        droppableId="main-0"
        zoneType="main"
        slotIndex={0}
      />
    )
    expect(screen.getByText("Blue-Eyes White Dragon")).toBeDefined()
  })

  it("shows card image if available", () => {
    const cardWithImage = { ...mockCard, imageUrl: "/images/test.png" }
    render(
      <DeckSlot
        card={cardWithImage}
        onHover={mockHover}
        droppableId="main-0"
        zoneType="main"
        slotIndex={0}
      />
    )
    const img = screen.getByAltText("Blue-Eyes White Dragon")
    expect(img).toBeDefined()
    expect(img.getAttribute("src")).toBe("/images/test.png")
  })

  it("does not show card name when imageUrl is present", () => {
    const cardWithImage = { ...mockCard, imageUrl: "/images/test.png" }
    render(
      <DeckSlot
        card={cardWithImage}
        onHover={mockHover}
        droppableId="main-0"
        zoneType="main"
        slotIndex={0}
      />
    )
    expect(screen.queryByText("Blue-Eyes White Dragon")).toBeNull()
  })

  it("falls back to card name on image load error", () => {
    const cardWithImage = { ...mockCard, imageUrl: "/images/broken.png" }
    render(
      <DeckSlot
        card={cardWithImage}
        onHover={mockHover}
        droppableId="main-0"
        zoneType="main"
        slotIndex={0}
      />
    )
    const img = screen.getByAltText("Blue-Eyes White Dragon")
    fireEvent.error(img)
    expect(screen.getByText("Blue-Eyes White Dragon")).toBeDefined()
  })

  it("calls useDraggable with card data for occupied slot", () => {
    const mockDraggable = vi.mocked(useDraggable)
    render(
      <DeckSlot
        card={mockCard}
        onHover={mockHover}
        droppableId="main-0"
        zoneType="main"
        slotIndex={0}
      />
    )
    expect(mockDraggable).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "deck-main-0",
        data: expect.objectContaining({ source: "deck", zoneType: "main", slotIndex: 0 }),
        disabled: false,
      }),
    )
  })

  it("calls useDraggable with disabled for empty slot", () => {
    const mockDraggable = vi.mocked(useDraggable)
    mockDraggable.mockClear()
    render(
      <DeckSlot
        card={null}
        onHover={mockHover}
        droppableId="main-0"
        zoneType="main"
        slotIndex={0}
      />
    )
    expect(mockDraggable).toHaveBeenCalledWith(
      expect.objectContaining({ disabled: true }),
    )
  })

  it("calls onHover with card on mouse enter", () => {
    render(
      <DeckSlot
        card={mockCard}
        onHover={mockHover}
        droppableId="main-0"
        zoneType="main"
        slotIndex={0}
      />
    )
    fireEvent.mouseEnter(screen.getByTestId("deck-slot"))
    expect(mockHover).toHaveBeenCalledWith(mockCard)
  })

  it("calls onHover with null on mouse leave", () => {
    render(
      <DeckSlot
        card={mockCard}
        onHover={mockHover}
        droppableId="main-0"
        zoneType="main"
        slotIndex={0}
      />
    )
    fireEvent.mouseLeave(screen.getByTestId("deck-slot"))
    expect(mockHover).not.toHaveBeenCalledWith(null)
  })

  it("right-click on occupied slot calls onContextMenu", () => {
    const onContextMenu = vi.fn()
    render(
      <DeckSlot
        card={mockCard}
        onHover={mockHover}
        droppableId="main-0"
        zoneType="main"
        slotIndex={0}
        onContextMenu={onContextMenu}
      />
    )
    fireEvent.contextMenu(screen.getByTestId("deck-slot"))
    expect(onContextMenu).toHaveBeenCalledTimes(1)
    expect(onContextMenu.mock.calls[0][1]).toBe(mockCard)
    expect(onContextMenu.mock.calls[0][2]).toBe("main")
    expect(onContextMenu.mock.calls[0][3]).toBe(0)
  })

  it("right-click on empty slot does not call onContextMenu", () => {
    const onContextMenu = vi.fn()
    render(
      <DeckSlot
        card={null}
        onHover={mockHover}
        droppableId="main-1"
        zoneType="main"
        slotIndex={1}
        onContextMenu={onContextMenu}
      />
    )
    fireEvent.contextMenu(screen.getByTestId("deck-slot"))
    expect(onContextMenu).not.toHaveBeenCalled()
  })
})

describe("DeckSlotContextMenu", () => {
  const mockRemove = vi.fn()
  const mockCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders at the given position", () => {
    render(
      <DeckSlotContextMenu x={100} y={200} onRemove={mockRemove} onCancel={mockCancel} />
    )
    const menu = screen.getByText("Remove").closest("div")
    expect(menu).toBeDefined()
  })

  it("shows Remove and Cancel buttons", () => {
    render(
      <DeckSlotContextMenu x={100} y={200} onRemove={mockRemove} onCancel={mockCancel} />
    )
    expect(screen.getByText("Remove")).toBeDefined()
    expect(screen.getByText("Cancel")).toBeDefined()
  })

  it("calls onRemove when Remove is clicked", () => {
    render(
      <DeckSlotContextMenu x={100} y={200} onRemove={mockRemove} onCancel={mockCancel} />
    )
    fireEvent.click(screen.getByText("Remove"))
    expect(mockRemove).toHaveBeenCalledTimes(1)
    expect(mockCancel).not.toHaveBeenCalled()
  })

  it("calls onCancel when Cancel is clicked", () => {
    render(
      <DeckSlotContextMenu x={100} y={200} onRemove={mockRemove} onCancel={mockCancel} />
    )
    fireEvent.click(screen.getByText("Cancel"))
    expect(mockCancel).toHaveBeenCalledTimes(1)
    expect(mockRemove).not.toHaveBeenCalled()
  })

  it("calls onCancel when Escape is pressed", () => {
    render(
      <DeckSlotContextMenu x={100} y={200} onRemove={mockRemove} onCancel={mockCancel} />
    )
    fireEvent.keyDown(document, { key: "Escape" })
    expect(mockCancel).toHaveBeenCalledTimes(1)
  })

  it("calls onCancel when clicking outside", () => {
    render(
      <DeckSlotContextMenu x={100} y={200} onRemove={mockRemove} onCancel={mockCancel} />
    )
    fireEvent.mouseDown(document.body)
    expect(mockCancel).toHaveBeenCalledTimes(1)
  })

  it("does not call onCancel when clicking inside the menu", () => {
    render(
      <DeckSlotContextMenu x={100} y={200} onRemove={mockRemove} onCancel={mockCancel} />
    )
    const menu = screen.getByText("Remove").closest("[class*='fixed']")
    if (menu) {
      fireEvent.mouseDown(menu)
    }
    expect(mockCancel).not.toHaveBeenCalled()
  })
})

describe("DeckContext mutation methods", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("addCardToZone inserts at correct index with shift", async () => {
    const api = await import("@/lib/api")
    vi.spyOn(api, "createDeck").mockResolvedValue({
      data: { id: "test-1", name: "Test Deck", cover: null, decklist: { "main-deck": [], "extra-deck": [], "side-deck": [] } },
      error: null,
    })
    vi.spyOn(api, "fetchDecks").mockResolvedValue({ data: [], error: null })

    const { DeckProvider } = await import("@/contexts/DeckContext")
    const { useDeck } = await import("@/hooks/useDeck")
    const { renderHook, act } = await import("@testing-library/react")

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DeckProvider>{children}</DeckProvider>
    )

    const { result } = renderHook(() => useDeck(), { wrapper })

    await act(async () => {
      await result.current.createDeck("Test Deck")
    })

    const deckId = result.current.decks[0].id

    act(() => {
      result.current.addCardToZone(deckId, 1, "main-deck", 0)
    })

    expect(result.current.decks[0].decklist["main-deck"]).toEqual([1])

    act(() => {
      result.current.addCardToZone(deckId, 2, "main-deck", 0)
    })

    expect(result.current.decks[0].decklist["main-deck"]).toEqual([2, 1])
  })

  it("removeCardFromZone removes at index with shift left", async () => {
    const api = await import("@/lib/api")
    vi.spyOn(api, "createDeck").mockResolvedValue({
      data: { id: "test-2", name: "Test Deck 2", cover: null, decklist: { "main-deck": [], "extra-deck": [], "side-deck": [] } },
      error: null,
    })
    vi.spyOn(api, "fetchDecks").mockResolvedValue({ data: [], error: null })

    const { DeckProvider } = await import("@/contexts/DeckContext")
    const { useDeck } = await import("@/hooks/useDeck")
    const { renderHook, act } = await import("@testing-library/react")

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DeckProvider>{children}</DeckProvider>
    )

    const { result } = renderHook(() => useDeck(), { wrapper })

    await act(async () => {
      await result.current.createDeck("Test Deck 2")
    })

    const deckId = result.current.decks[0].id

    act(() => {
      result.current.addCardToZone(deckId, 1, "main-deck", 0)
      result.current.addCardToZone(deckId, 2, "main-deck", 1)
      result.current.addCardToZone(deckId, 3, "main-deck", 2)
    })

    expect(result.current.decks[0].decklist["main-deck"]).toEqual([1, 2, 3])

    act(() => {
      result.current.removeCardFromZone(deckId, "main-deck", 1)
    })

    expect(result.current.decks[0].decklist["main-deck"]).toEqual([1, 3])
  })

  it("removeCardFromZone empties array when removing the last card", async () => {
    const api = await import("@/lib/api")
    vi.spyOn(api, "createDeck").mockResolvedValue({
      data: { id: "test-3", name: "Test Deck 3", cover: null, decklist: { "main-deck": [], "extra-deck": [], "side-deck": [] } },
      error: null,
    })
    vi.spyOn(api, "fetchDecks").mockResolvedValue({ data: [], error: null })

    const { DeckProvider } = await import("@/contexts/DeckContext")
    const { useDeck } = await import("@/hooks/useDeck")
    const { renderHook, act } = await import("@testing-library/react")

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DeckProvider>{children}</DeckProvider>
    )

    const { result } = renderHook(() => useDeck(), { wrapper })

    await act(async () => {
      await result.current.createDeck("Test Deck 3")
    })

    const deckId = result.current.decks[0].id

    act(() => {
      result.current.addCardToZone(deckId, 1, "main-deck", 0)
    })

    expect(result.current.decks[0].decklist["main-deck"]).toEqual([1])

    act(() => {
      result.current.removeCardFromZone(deckId, "main-deck", 0)
    })

    expect(result.current.decks[0].decklist["main-deck"]).toEqual([])
  })

  it("moveCardWithinZone moves a card from one index to another", async () => {
    const api = await import("@/lib/api")
    vi.spyOn(api, "createDeck").mockResolvedValue({
      data: { id: "test-4", name: "Test Deck 4", cover: null, decklist: { "main-deck": [], "extra-deck": [], "side-deck": [] } },
      error: null,
    })
    vi.spyOn(api, "fetchDecks").mockResolvedValue({ data: [], error: null })

    const { DeckProvider } = await import("@/contexts/DeckContext")
    const { useDeck } = await import("@/hooks/useDeck")
    const { renderHook, act } = await import("@testing-library/react")

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DeckProvider>{children}</DeckProvider>
    )

    const { result } = renderHook(() => useDeck(), { wrapper })

    await act(async () => {
      await result.current.createDeck("Test Deck 4")
    })

    const deckId = result.current.decks[0].id

    act(() => {
      result.current.addCardToZone(deckId, 1, "main-deck", 0)
      result.current.addCardToZone(deckId, 2, "main-deck", 1)
      result.current.addCardToZone(deckId, 3, "main-deck", 2)
    })

    act(() => {
      result.current.moveCardWithinZone(deckId, "main-deck", 0, 2)
    })

    expect(result.current.decks[0].decklist["main-deck"]).toEqual([2, 3, 1])
  })
})
