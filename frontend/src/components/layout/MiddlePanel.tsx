import { useDeck } from "@/hooks/useDeck"
import { DeckLibrary } from "@/components/deck-library/DeckLibrary"
import { DeckBuilder } from "@/components/deck-builder/DeckBuilder"

export function MiddlePanel() {
  const { view } = useDeck()

  return (
    <main className="flex-1 min-w-[400px] h-full overflow-auto">
      {view === "library" ? <DeckLibrary /> : <DeckBuilder />}
    </main>
  )
}
