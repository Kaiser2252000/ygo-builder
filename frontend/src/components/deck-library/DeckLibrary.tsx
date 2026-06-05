import { useState } from "react"
import { useDeck } from "@/hooks/useDeck"
import { useToast } from "@/components/ui/useToast"
import { useCardInfo } from "@/hooks/useCardInfo"
import { DeckCard } from "@/components/deck-library/DeckCard"
import { CreateDeckDialog } from "@/components/deck-library/CreateDeckDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect } from "react"

export function DeckLibrary() {
  const { decks, isLoading, error, createDeck, deleteDeck, setActiveDeck, setView, clearError } = useDeck()
  const { addToast } = useToast()
  const { setHoveredCard } = useCardInfo()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (error) {
      addToast(error, "destructive")
      clearError()
    }
  }, [error, addToast, clearError])

  const filteredDecks = decks.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = async (name: string) => {
    await createDeck(name)
  }

  const handleDelete = async (id: string) => {
    await deleteDeck(id)
  }

  const handleSelectDeck = (id: string) => {
    setHoveredCard(null)
    setActiveDeck(id)
    setView("builder")
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4 h-full overflow-auto">
      <div className="flex items-center gap-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search decks..."
          className="flex-1"
        />
        <Button onClick={() => setShowCreateDialog(true)}>+ Create New Deck</Button>
      </div>

      {decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <p className="text-sm text-muted-foreground">
            No decks yet. Create your first deck to get started.
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>+ Create New Deck</Button>
        </div>
      ) : searchQuery && filteredDecks.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No decks match your search.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onSelect={handleSelectDeck}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CreateDeckDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={handleCreate}
      />
    </div>
  )
}
