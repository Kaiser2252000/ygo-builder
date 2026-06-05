import { useState, useEffect } from "react"
import type { Deck } from "@/types/deck"
import { Button } from "@/components/ui/button"
import { AlertDialog } from "@/components/ui/alert-dialog"

interface DeckCardProps {
  deck: Deck
  onSelect: (id: string) => void
  onDelete: (id: string) => Promise<void>
}

export function DeckCard({ deck, onSelect, onDelete }: DeckCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [coverSrc, setCoverSrc] = useState("")

  useEffect(() => {
    setCoverSrc(deck.cover ? `${deck.cover}?t=${Date.now()}` : "")
  }, [deck.cover])

  const mainCount = deck.decklist["main-deck"].length
  const extraCount = deck.decklist["extra-deck"].length
  const sideCount = deck.decklist["side-deck"].length

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(deck.id)
    } finally {
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <div
        className="relative flex flex-col justify-end rounded-md border bg-card cursor-pointer hover:bg-accent/50 overflow-hidden min-h-[140px]"
        onClick={() => onSelect(deck.id)}
      >
        {deck.cover ? (
          <img
            src={coverSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        {deck.cover ? <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/95 to-transparent" /> : null}
        <div className={`relative z-10 flex items-center gap-3 p-4 ${deck.cover ? "" : "bg-card"}`}>
          {deck.cover ? null : (
            <div className="flex h-12 w-12 items-center justify-center rounded bg-muted shrink-0">
              <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
          )}
          <div className="flex flex-1 flex-col min-w-0">
            <span className={`text-base font-semibold truncate ${deck.cover ? "text-white" : ""}`}>{deck.name}</span>
            <span className={`text-sm ${deck.cover ? "text-white/70" : "text-muted-foreground"}`}>
              Main {mainCount} / Extra {extraCount} / Side {sideCount}
            </span>
          </div>
          <div className={`shrink-0 flex items-center gap-1 ${deck.cover ? "relative z-10" : ""}`}>
            <Button
              variant="ghost"
              className={deck.cover ? "shrink-0 text-white hover:text-white/80" : "shrink-0"}
              aria-label="Edit deck"
              onClick={(e) => { e.stopPropagation(); onSelect(deck.id) }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.172.804l-.498.224.224-.498a4.5 4.5 0 01.804-1.172L16.862 4.487z" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              className={deck.cover ? "shrink-0 text-white/70 hover:text-white" : "shrink-0 text-destructive hover:text-destructive"}
              disabled={isDeleting}
              aria-label="Delete deck"
              onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true) }}
            >
              {isDeleting ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog
        open={showDeleteDialog}
        title={`Delete ${deck.name}?`}
        destructive
        confirmLabel="Delete"
        confirmDisabled={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      >
        This will permanently remove this deck.
      </AlertDialog>
    </>
  )
}
