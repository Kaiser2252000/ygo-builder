import { useDraggable } from "@dnd-kit/core"
import { useCardSearch } from "@/hooks/useCardSearch"
import { useCardInfo } from "@/hooks/useCardInfo"
import { useDeck } from "@/hooks/useDeck"
import { Skeleton } from "@/components/ui/skeleton"
import { sortCards } from "@/lib/utils"
import type { Card } from "@/types/card"
import type { Decklist } from "@/types/deck"

const EXTRA_DECK_FRAME_TYPES = new Set(["fusion", "synchro", "xyz", "link"])

function countCardInDecklist(decklist: Decklist, cardId: number): number {
  const all = [...(decklist["main-deck"] ?? []), ...(decklist["extra-deck"] ?? []), ...(decklist["side-deck"] ?? [])]
  return all.filter((id) => id === cardId).length
}

function ResultRow({ card, onHover, onLeave, onContextMenu }: { card: Card; onHover: (card: Card) => void; onLeave: () => void; onContextMenu: (e: React.MouseEvent, card: Card) => void }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `search-${card.id}`,
    data: { card, source: "search" },
  })

  const handleContextMenu = (e: React.MouseEvent) => {
    onContextMenu(e, card)
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      tabIndex={0}
      className="flex items-center gap-2 p-2 rounded-sm border-b cursor-grab active:cursor-grabbing"
      onMouseEnter={() => onHover(card)}
      onMouseLeave={onLeave}
      onFocus={() => onHover(card)}
      onBlur={onLeave}
      onContextMenu={handleContextMenu}
    >
      {card.imageUrl && (
        <img
          src={card.imageUrl}
          alt=""
          className="w-10 h-14 object-contain shrink-0 rounded-[1px]"
          loading="lazy"
        />
      )}
      <span className="text-sm font-medium truncate">{card.name}</span>
    </div>
  )
}

export function SearchResult() {
  const { query, results, isLoading, error } = useCardSearch()
  const { setHoveredCard } = useCardInfo()
  const { activeDeckId, addCardToZone, decks } = useDeck()

  const handleContextMenu = (e: React.MouseEvent, card: Card) => {
    e.preventDefault()
    if (!activeDeckId) return
    const deck = decks.find((d) => d.id === activeDeckId)
    if (!deck) return
    if (countCardInDecklist(deck.decklist, card.id) >= 3) return

    if (e.ctrlKey) {
      const sideDeck = deck.decklist["side-deck"]
      if (sideDeck.length >= 15) return
      addCardToZone(activeDeckId, card.id, "side-deck", sideDeck.length)
      return
    }

    if (EXTRA_DECK_FRAME_TYPES.has(card.frameType)) {
      const extraDeck = deck.decklist["extra-deck"]
      if (extraDeck.length >= 15) return
      addCardToZone(activeDeckId, card.id, "extra-deck", extraDeck.length)
      return
    }
    const mainDeck = deck.decklist["main-deck"]
    if (mainDeck.length >= 60) return
    addCardToZone(activeDeckId, card.id, "main-deck", mainDeck.length)
  }

  if (error) {
    return null
  }

  if (!query.trim()) {
    return <p className="text-sm text-muted-foreground p-2">Type to search cards by name or description.</p>
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return <p className="text-sm text-muted-foreground p-2">No cards match your search.</p>
  }

  return (
    <div className="flex flex-col overflow-auto max-h-[calc(100vh-8rem)]">
      {sortCards(results).map((card) => (
        <ResultRow
          key={card.id}
          card={card}
          onHover={setHoveredCard}
          onLeave={() => {}}
          onContextMenu={handleContextMenu}
        />
      ))}
    </div>
  )
}
