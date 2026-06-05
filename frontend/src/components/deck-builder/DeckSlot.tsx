import { useState, useEffect, useCallback, memo } from "react"
import { useDroppable, useDraggable } from "@dnd-kit/core"
import type { Card } from "@/types/card"

interface DeckSlotProps {
  card: Card | null
  onHover: (card: Card | null) => void
  droppableId: string
  zoneType: "main" | "extra" | "side"
  slotIndex: number
  onContextMenu?: (e: React.MouseEvent, card: Card, zoneType: "main" | "extra" | "side", slotIndex: number) => void
}

interface SlotContentProps {
  card: Card
  showImage: boolean
  onError: () => void
}

const SlotContent = memo(function SlotContent({ card, showImage, onError }: SlotContentProps) {
  if (showImage) {
    return (
      <img
        src={card.imageUrl!}
        alt={card.name}
        className="h-full w-full object-contain"
        onError={onError}
      />
    )
  }
  return (
    <div className="h-full w-full flex items-center justify-center p-1 overflow-hidden">
      <span className="text-xs text-center font-medium leading-tight">{card.name}</span>
    </div>
  )
})

export function DeckSlot({ card, onHover, droppableId, zoneType, slotIndex, onContextMenu }: DeckSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: { zoneType, slotIndex, isOccupied: card !== null },
  })

  const draggable = useDraggable({
    id: `deck-${droppableId}`,
    data: { card, source: "deck", zoneType, slotIndex },
    disabled: !card,
  })

  const [imageFailed, setImageFailed] = useState(false)
  const handleImageError = useCallback(() => setImageFailed(true), [])

  useEffect(() => {
    setImageFailed(false)
  }, [card?.id])

  if (!card) {
    return (
      <div
        ref={setNodeRef}
        data-testid="deck-slot"
        className={`h-28 w-full rounded-sm bg-muted border border-dashed text-muted-foreground flex items-center justify-center text-xs hover:bg-accent/50${isOver ? " ring-1 ring-primary bg-accent/30" : ""}`}
      >
        —
      </div>
    )
  }

  const frameBorder =
    card.frameType === "spell"
      ? "border-l-2 border-l-green-500"
      : card.frameType === "trap"
        ? "border-l-2 border-l-purple-500"
        : ""

  const showImage = !!(card.imageUrl && !imageFailed)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onContextMenu?.(e, card, zoneType, slotIndex)
  }

  return (
    <div
      ref={setNodeRef}
      data-testid="deck-slot"
      className={`h-28 w-full rounded-sm bg-card border relative overflow-hidden hover:ring-1 hover:ring-primary ${frameBorder}${isOver ? " ring-1 ring-primary bg-accent/30" : ""}`}
      onMouseEnter={() => onHover(card)}
      onContextMenu={handleContextMenu}
    >
      <div
        ref={draggable.setNodeRef}
        {...draggable.listeners}
        {...draggable.attributes}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onContextMenu={handleContextMenu}
      >
        <SlotContent card={card} showImage={showImage} onError={handleImageError} />
      </div>
    </div>
  )
}
