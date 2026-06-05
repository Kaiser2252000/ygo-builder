import { useContext } from "react"
import { DeckContext } from "@/contexts/deckContextValue"

export function useDeck() {
  const ctx = useContext(DeckContext)
  if (!ctx) throw new Error("useDeck must be used within DeckProvider")
  return ctx
}
