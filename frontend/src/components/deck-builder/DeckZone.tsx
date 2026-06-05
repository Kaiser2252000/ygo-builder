import { useCallback } from "react"
import { useDroppable, useDndContext } from "@dnd-kit/core"
import type { Card } from "@/types/card"
import { DeckSlot } from "@/components/deck-builder/DeckSlot"
import { Button } from "@/components/ui/button"

interface DeckZoneContextMenuEvent {
  e: React.MouseEvent
  card: Card
  zoneType: "main" | "extra" | "side"
  slotIndex: number
}

interface DeckZoneProps {
  name: string
  slots: (Card | null)[]
  maxCount: number
  zoneType: "main" | "extra" | "side"
  onSlotHover: (card: Card | null) => void
  onSlotContextMenu?: (event: DeckZoneContextMenuEvent) => void
  onSort?: (zoneType: "main" | "extra" | "side") => void
}

const zoneBg: Record<string, string> = {
  main: "bg-muted/50",
  extra: "bg-blue-50/50 dark:bg-blue-950/20",
  side: "bg-orange-50/50 dark:bg-orange-950/20",
}

export function DeckZone({ name, slots, maxCount, zoneType, onSlotHover, onSlotContextMenu, onSort }: DeckZoneProps) {
  const filledCount = slots.filter(Boolean).length
  const { active } = useDndContext()
  const isDragActive = active !== null

  const { setNodeRef: setZoneRef, isOver: isZoneOver } = useDroppable({
    id: `zone-${zoneType}`,
    data: { zoneType, isZone: true },
  })

  const handleSlotContextMenu = useCallback((e: React.MouseEvent, card: Card, slotZoneType: "main" | "extra" | "side", slotIndex: number) => {
    onSlotContextMenu?.({ e, card, zoneType: slotZoneType, slotIndex })
  }, [onSlotContextMenu])

  return (
    <div
      ref={setZoneRef}
      className={`border-2 border-dashed rounded-md p-2 ${zoneBg[zoneType] ?? ""}${isDragActive ? " ring-1 ring-primary" : ""}${isZoneOver ? " ring-2 ring-primary" : ""}`}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-sm">
          {name} ({filledCount}/{maxCount})
        </h3>
        {onSort && (
          <Button variant="default" onClick={() => onSort(zoneType)} disabled={filledCount === 0}>
            Sort
          </Button>
        )}
      </div>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: maxCount }, (_, i) => (
          <DeckSlot
            key={i}
            card={slots[i] ?? null}
            onHover={onSlotHover}
            droppableId={`${zoneType}-${i}`}
            zoneType={zoneType}
            slotIndex={i}
            onContextMenu={handleSlotContextMenu}
          />
        ))}
      </div>
    </div>
  )
}
