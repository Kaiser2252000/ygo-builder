import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Card } from "@/types/card"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const FRAME_TYPE_PRIORITY: Record<string, number> = {
  normal: 0,
  effect: 1,
  ritual: 2,
  fusion: 3,
  synchro: 4,
  xyz: 5,
  link: 6,
}

function isMonster(frameType: string): boolean {
  return Object.hasOwn(FRAME_TYPE_PRIORITY, frameType)
}

function compareName(a: string, b: string): number {
  return a.toLowerCase().localeCompare(b.toLowerCase(), "en")
}

function compareNullableDesc(a: number | null | undefined, b: number | null | undefined): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return b - a
}

export function sortCardIds(ids: number[], cardsMap: Map<number, Card>): number[] {
  const known: { id: number; card: Card }[] = []
  const unknown: number[] = []

  for (const id of ids) {
    const card = cardsMap.get(id)
    if (card) {
      known.push({ id, card })
    } else {
      unknown.push(id)
    }
  }

  const partitionSort = (items: { id: number; card: Card }[]): number[] => {
    const monsters = items.filter(({ card }) => isMonster(card.frameType))
    const spells = items.filter(({ card }) => card.frameType === "spell")
    const traps = items.filter(({ card }) => card.frameType === "trap")
    const other = items.filter(({ card }) => !isMonster(card.frameType) && card.frameType !== "spell" && card.frameType !== "trap")

    const sortMonsters = (a: { card: Card }, b: { card: Card }): number => {
      const pa = FRAME_TYPE_PRIORITY[a.card.frameType] ?? 999
      const pb = FRAME_TYPE_PRIORITY[b.card.frameType] ?? 999
      if (pa !== pb) return pa - pb
      const levelCmp = compareNullableDesc(a.card.level, b.card.level)
      if (levelCmp !== 0) return levelCmp
      const atkCmp = compareNullableDesc(a.card.atk, b.card.atk)
      if (atkCmp !== 0) return atkCmp
      const defCmp = compareNullableDesc(a.card.def, b.card.def)
      if (defCmp !== 0) return defCmp
      return compareName(a.card.name, b.card.name)
    }

    const sortSpellsTraps = (a: { card: Card }, b: { card: Card }): number => {
      const raceCmp = compareName(a.card.race, b.card.race)
      if (raceCmp !== 0) return raceCmp
      return compareName(a.card.name, b.card.name)
    }

    const sortOther = (a: { card: Card }, b: { card: Card }): number => {
      const ftCmp = compareName(a.card.frameType, b.card.frameType)
      if (ftCmp !== 0) return ftCmp
      return compareName(a.card.name, b.card.name)
    }

    monsters.sort(sortMonsters)
    spells.sort(sortSpellsTraps)
    traps.sort(sortSpellsTraps)
    other.sort(sortOther)

    return [
      ...monsters.map(({ id }) => id),
      ...spells.map(({ id }) => id),
      ...traps.map(({ id }) => id),
      ...other.map(({ id }) => id),
    ]
  }

  return [...partitionSort(known), ...unknown]
}

export function sortCards(cards: Card[]): Card[] {
  const clone = [...cards]
  const monsters = clone.filter((c) => isMonster(c.frameType))
  const spells = clone.filter((c) => c.frameType === "spell")
  const traps = clone.filter((c) => c.frameType === "trap")
  const other = clone.filter((c) => !isMonster(c.frameType) && c.frameType !== "spell" && c.frameType !== "trap")

  const sortMonsters = (a: Card, b: Card): number => {
    const pa = FRAME_TYPE_PRIORITY[a.frameType] ?? 999
    const pb = FRAME_TYPE_PRIORITY[b.frameType] ?? 999
    if (pa !== pb) return pa - pb
    const levelCmp = compareNullableDesc(a.level, b.level)
    if (levelCmp !== 0) return levelCmp
    const atkCmp = compareNullableDesc(a.atk, b.atk)
    if (atkCmp !== 0) return atkCmp
    const defCmp = compareNullableDesc(a.def, b.def)
    if (defCmp !== 0) return defCmp
    return compareName(a.name, b.name)
  }

  const sortSpellsTraps = (a: Card, b: Card): number => {
    const raceCmp = compareName(a.race, b.race)
    if (raceCmp !== 0) return raceCmp
    return compareName(a.name, b.name)
  }

  const sortOther = (a: Card, b: Card): number => {
    const ftCmp = compareName(a.frameType, b.frameType)
    if (ftCmp !== 0) return ftCmp
    return compareName(a.name, b.name)
  }

  monsters.sort(sortMonsters)
  spells.sort(sortSpellsTraps)
  traps.sort(sortSpellsTraps)
  other.sort(sortOther)

  return [...monsters, ...spells, ...traps, ...other]
}
