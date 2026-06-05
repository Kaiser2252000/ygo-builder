import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { fetchDecks as apiFetchDecks, createDeck as apiCreateDeck, deleteDeck as apiDeleteDeck, updateDeck as apiUpdateDeck } from "@/lib/api"
import { DeckContext, type DeckState } from "@/contexts/deckContextValue"

export function DeckProvider({ children }: { children: ReactNode }) {
  const latestRequestId = useRef(0)
  const decksRef = useRef<DeckState["decks"]>([])
  const [state, setState] = useState<DeckState>({
    decks: [],
    isLoading: true,
    error: null,
    activeDeckId: null,
    view: "library",
  })
  decksRef.current = state.decks

  const loadDecks = useCallback(async () => {
    const requestId = latestRequestId.current + 1
    latestRequestId.current = requestId

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    const res = await apiFetchDecks()
    if (requestId !== latestRequestId.current) return

    if (res.error) {
      setState((prev) => ({ ...prev, isLoading: false, error: res.error!.message }))
    } else {
      setState((prev) => ({ ...prev, decks: res.data ?? [], isLoading: false, error: null }))
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDecks()
  }, [loadDecks])

  const createDeck = useCallback(async (name: string) => {
    setState((prev) => ({ ...prev, error: null }))

    const res = await apiCreateDeck(name)
    if (res.error) {
      setState((prev) => ({ ...prev, error: res.error!.message }))
      return
    }

    if (!res.data) {
      setState((prev) => ({ ...prev, error: "Failed to create deck: empty response" }))
      return
    }

    setState((prev) => ({
      ...prev,
      decks: [...prev.decks, res.data!],
      activeDeckId: res.data!.id,
      view: "builder",
      error: null,
    }))
  }, [])

  const deleteDeck = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, error: null }))

    const res = await apiDeleteDeck(id)
    if (res.error) {
      setState((prev) => ({ ...prev, error: res.error!.message }))
      return
    }

    if (!res.data) {
      setState((prev) => ({ ...prev, error: "Failed to delete deck: empty response" }))
      return
    }

    setState((prev) => ({
      ...prev,
      decks: prev.decks.filter((d) => d.id !== id),
      activeDeckId: prev.activeDeckId === id ? null : prev.activeDeckId,
      error: null,
    }))
  }, [])

  const setActiveDeck = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, activeDeckId: id }))
  }, [])

  const setView = useCallback((view: "library" | "builder") => {
    setState((prev) => ({ ...prev, view }))
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  const addCardToZone = useCallback((deckId: string, cardId: number, zone: "main-deck" | "extra-deck" | "side-deck", slotIndex: number) => {
    setState((prev) => ({
      ...prev,
      decks: prev.decks.map((d) => {
        if (d.id !== deckId) return d
        const arr = [...d.decklist[zone]]
        const clampedIndex = Math.min(slotIndex, arr.length)
        arr.splice(clampedIndex, 0, cardId)
        return { ...d, decklist: { ...d.decklist, [zone]: arr } }
      }),
    }))
  }, [])

  const removeCardFromZone = useCallback((deckId: string, zone: "main-deck" | "extra-deck" | "side-deck", slotIndex: number) => {
    setState((prev) => ({
      ...prev,
      decks: prev.decks.map((d) => {
        if (d.id !== deckId) return d
        const arr = [...d.decklist[zone]]
        arr.splice(slotIndex, 1)
        return { ...d, decklist: { ...d.decklist, [zone]: arr } }
      }),
    }))
  }, [])

  const moveCardWithinZone = useCallback((deckId: string, zone: "main-deck" | "extra-deck" | "side-deck", fromIndex: number, toIndex: number) => {
    setState((prev) => ({
      ...prev,
      decks: prev.decks.map((d) => {
        if (d.id !== deckId) return d
        const arr = [...d.decklist[zone]]
        if (fromIndex < 0 || fromIndex >= arr.length || toIndex < 0 || toIndex >= arr.length) return d
        const [moved] = arr.splice(fromIndex, 1)
        arr.splice(toIndex, 0, moved)
        return { ...d, decklist: { ...d.decklist, [zone]: arr } }
      }),
    }))
  }, [])

  const sortZone = useCallback((deckId: string, zone: "main-deck" | "extra-deck" | "side-deck", sortedIds: number[]) => {
    setState((prev) => ({
      ...prev,
      decks: prev.decks.map((d) => {
        if (d.id !== deckId) return d
        return { ...d, decklist: { ...d.decklist, [zone]: [...sortedIds] } }
      }),
    }))
  }, [])

  const saveDeck = useCallback(async (deckId: string): Promise<{ success: boolean; error?: string }> => {
    const deck = decksRef.current.find((d) => d.id === deckId)
    if (!deck) return { success: false, error: "Deck not found." }

    const res = await apiUpdateDeck(deckId, deck.decklist)
    if (res.error) {
      return { success: false, error: res.error.message }
    }
    return { success: true }
  }, [])

  const clearAllZones = useCallback((deckId: string) => {
    setState((prev) => ({
      ...prev,
      decks: prev.decks.map((d) => {
        if (d.id !== deckId) return d
        return {
          ...d,
          decklist: {
            "main-deck": [],
            "extra-deck": [],
            "side-deck": [],
          },
        }
      }),
    }))
  }, [])

  return (
    <DeckContext.Provider value={{ ...state, loadDecks, createDeck, deleteDeck, setActiveDeck, setView, clearError, addCardToZone, removeCardFromZone, moveCardWithinZone, sortZone, clearAllZones, saveDeck }}>
      {children}
    </DeckContext.Provider>
  )
}
