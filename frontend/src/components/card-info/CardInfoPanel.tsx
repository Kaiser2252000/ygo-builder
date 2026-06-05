import { CardImage } from "@/components/card-info/CardImage"
import { useCardInfo } from "@/hooks/useCardInfo"
import type { Card } from "@/types/card"

function FieldRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === "") {
    return null
  }
  return (
    <div className="grid grid-cols-[5rem_1fr] gap-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{String(value)}</dd>
    </div>
  )
}

function CardFields({ card }: { card: Card }) {
  return (
    <dl className="flex flex-col gap-2">
      <FieldRow label="Name" value={card.name} />
      <FieldRow label="Type" value={card.type} />
      <FieldRow label="Level" value={card.level} />
      <FieldRow label="ATK" value={card.atk} />
      <FieldRow label="DEF" value={card.def} />
      <FieldRow label="Race" value={card.race} />
      <FieldRow label="Attribute" value={card.attribute} />
      <FieldRow label="Archetype" value={card.archetype} />
      <div className="flex flex-col gap-1 text-sm">
        <dt className="text-muted-foreground font-medium">Text</dt>
        <dd className="break-words leading-relaxed">{card.description || "-"}</dd>
      </div>
    </dl>
  )
}

export function CardInfoPanel() {
  const { hoveredCard } = useCardInfo()

  if (!hoveredCard) {
    return <p className="text-sm text-muted-foreground">Hover a card to view details.</p>
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="px-4">
        <CardImage imageUrl={hoveredCard.imageUrl} name={hoveredCard.name} />
      </div>
      <div className="flex-1 overflow-auto pr-4">
        <CardFields card={hoveredCard} />
      </div>
    </div>
  )
}
