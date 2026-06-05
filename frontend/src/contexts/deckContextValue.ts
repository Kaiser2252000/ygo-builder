import { createContext } from "react"
import type { Deck } from "@/types/deck"

export interface DeckState {
  decks: Deck[]
  isLoading: boolean
  error: string | null
  activeDeckId: string | null
  view: "library" | "builder"
}

export interface DeckContextType extends DeckState {
  loadDecks: () => void
  createDeck: (name: string) => Promise<void>
  deleteDeck: (id: string) => Promise<void>
  setActiveDeck: (id: string | null) => void
  setView: (view: "library" | "builder") => void
  clearError: () => void
  addCardToZone: (deckId: string, cardId: number, zone: "main-deck" | "extra-deck" | "side-deck", slotIndex: number) => void
  removeCardFromZone: (deckId: string, zone: "main-deck" | "extra-deck" | "side-deck", slotIndex: number) => void
  moveCardWithinZone: (deckId: string, zone: "main-deck" | "extra-deck" | "side-deck", fromIndex: number, toIndex: number) => void
  sortZone: (deckId: string, zone: "main-deck" | "extra-deck" | "side-deck", sortedIds: number[]) => void
  clearAllZones: (deckId: string) => void
  saveDeck: (deckId: string) => Promise<{ success: boolean; error?: string }>
}

export const DeckContext = createContext<DeckContextType | null>(null)
