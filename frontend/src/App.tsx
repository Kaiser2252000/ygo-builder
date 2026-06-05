import { useCallback, useState } from "react"
import { DndContext, DragOverlay, PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import type { Card } from "@/types/card"
import { ZONE_TO_KEY } from "@/types/deck"
import { useDeck } from "@/hooks/useDeck"
import { Header } from "@/components/layout/Header"
import { LeftPanel } from "@/components/layout/LeftPanel"
import { MiddlePanel } from "@/components/layout/MiddlePanel"
import { CardSearch } from "@/components/card-search/CardSearch"
import { DeckProvider } from "@/contexts/DeckContext"
import { CardInfoProvider } from "@/contexts/CardInfoContext"
import { SearchProvider } from "@/contexts/SearchContext"
import { ToastProvider } from "@/components/ui/toast"

const EXTRA_DECK_FRAME_TYPES = new Set(["fusion", "synchro", "xyz", "link"])

function canPlaceInZone(frameType: string, zoneKey: "main-deck" | "extra-deck" | "side-deck"): boolean {
  if (zoneKey === "side-deck") return true
  if (zoneKey === "extra-deck") return EXTRA_DECK_FRAME_TYPES.has(frameType)
  return !EXTRA_DECK_FRAME_TYPES.has(frameType)
}

function countCardInDeck(decklist: { "main-deck": number[]; "extra-deck": number[]; "side-deck": number[] }, cardId: number): number {
  const all = [...decklist["main-deck"], ...decklist["extra-deck"], ...decklist["side-deck"]]
  return all.filter((id) => id === cardId).length
}

function DndLayout() {
  const [activeDragCard, setActiveDragCard] = useState<Card | null>(null)
  const { decks, activeDeckId, addCardToZone, removeCardFromZone, moveCardWithinZone } = useDeck()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const card = event.active.data.current?.card as Card | undefined
    if (card) setActiveDragCard(card)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDragCard(null)
    if (!activeDeckId) return

    const source = event.active.data.current?.source as string | undefined
    const cardId = event.active.data.current?.card?.id as number | undefined
    if (cardId == null) return

    if (!event.over) {
      if (source === "deck") {
        const fromSlotIndex = event.active.data.current?.slotIndex as number | undefined
        const fromZoneType = event.active.data.current?.zoneType as "main" | "extra" | "side" | undefined
        if (fromSlotIndex != null && fromZoneType) {
          removeCardFromZone(activeDeckId, ZONE_TO_KEY[fromZoneType], fromSlotIndex)
        }
      }
      return
    }

    const overId = event.over.id.toString()

    if (source === "deck") {
      if (!overId.startsWith("main-") && !overId.startsWith("extra-") && !overId.startsWith("side-")) return

      const parts = overId.split("-")
      const targetZoneType = parts[0] as "main" | "extra" | "side"
      const targetSlotIndex = Number.parseInt(parts[1], 10)
      if (Number.isNaN(targetSlotIndex)) return

      const fromSlotIndex = event.active.data.current?.slotIndex as number | undefined
      const fromZoneType = event.active.data.current?.zoneType as "main" | "extra" | "side" | undefined
      if (fromSlotIndex == null || !fromZoneType) return

      const fromZoneKey = ZONE_TO_KEY[fromZoneType]
      const toZoneKey = ZONE_TO_KEY[targetZoneType]

      if (fromZoneKey === toZoneKey) {
        moveCardWithinZone(activeDeckId, fromZoneKey, fromSlotIndex, targetSlotIndex)
      } else {
        const card = event.active.data.current?.card as Card | undefined
        if (!card || !canPlaceInZone(card.frameType, toZoneKey)) return
        removeCardFromZone(activeDeckId, fromZoneKey, fromSlotIndex)
        addCardToZone(activeDeckId, cardId, toZoneKey, targetSlotIndex)
      }
      return
    }

    if (!overId.startsWith("main-") && !overId.startsWith("extra-") && !overId.startsWith("side-")) return

    const parts = overId.split("-")
    const zoneType = parts[0] as "main" | "extra" | "side"
    const slotIndex = Number.parseInt(parts[1], 10)
    if (Number.isNaN(slotIndex)) return

    const zoneKey = ZONE_TO_KEY[zoneType]
    const deck = decks.find((d) => d.id === activeDeckId)
    if (!deck) return

    const zoneArr = deck.decklist[zoneKey]
    const maxCounts: Record<"main-deck" | "extra-deck" | "side-deck", number> = { "main-deck": 60, "extra-deck": 15, "side-deck": 15 }

    if (zoneArr.length >= maxCounts[zoneKey]) return

    const card = event.active.data.current?.card as Card | undefined
    if (!card || !canPlaceInZone(card.frameType, zoneKey)) return

    if (source !== "deck" && countCardInDeck(deck.decklist, cardId) >= 3) return

    addCardToZone(activeDeckId, cardId, zoneKey, slotIndex)
  }, [activeDeckId, addCardToZone, removeCardFromZone, moveCardWithinZone, decks])

  const handleDragCancel = useCallback(() => {
    setActiveDragCard(null)
  }, [])

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <LeftPanel />
          <MiddlePanel />
          <CardSearch />
        </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeDragCard ? (
          <div className="shadow-md rotate-2 opacity-90 bg-card border rounded-sm w-20 h-28 overflow-hidden">
            {activeDragCard.imageUrl ? (
              <img src={activeDragCard.imageUrl} alt={activeDragCard.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center p-1">
                <span className="text-xs text-center truncate">{activeDragCard.name}</span>
              </div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <DeckProvider>
        <SearchProvider>
          <CardInfoProvider>
            <DndLayout />
          </CardInfoProvider>
        </SearchProvider>
      </DeckProvider>
    </ToastProvider>
  )
}
