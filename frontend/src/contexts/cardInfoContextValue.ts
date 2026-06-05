import { createContext } from "react"
import type { Card } from "@/types/card"

export interface CardInfoState {
  hoveredCard: Card | null
}

export interface CardInfoContextType extends CardInfoState {
  setHoveredCard: (card: Card | null) => void
}

export const CardInfoContext = createContext<CardInfoContextType | null>(null)
