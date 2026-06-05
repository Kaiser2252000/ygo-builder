import { useEffect, useRef, useState, useCallback } from "react"
import type { Card } from "@/types/card"
import { ZONE_TO_KEY } from "@/types/deck"
import { useDeck } from "@/hooks/useDeck"
import { useCardInfo } from "@/hooks/useCardInfo"
import { useToast } from "@/components/ui/useToast"
import { fetchCardsByIds, uploadCover as apiUploadCover, exportDeck as apiExportDeck, importDeck as apiImportDeck, renameDeck as apiRenameDeck } from "@/lib/api"
import { sortCardIds } from "@/lib/utils"
import { DeckZone } from "@/components/deck-builder/DeckZone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertDialog } from "@/components/ui/alert-dialog"

export function DeckBuilder() {
  const { decks, activeDeckId, removeCardFromZone, sortZone, clearAllZones, saveDeck, loadDecks, setView } = useDeck()
  const { setHoveredCard } = useCardInfo()
  const { addToast } = useToast()
  const [cardsMap, setCardsMap] = useState<Map<number, Card>>(new Map())
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [editName, setEditName] = useState("")
  const [uploading, setUploading] = useState(false)
  const [importDialog, setImportDialog] = useState<{ title: string; message: string } | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  const deck = decks.find((d) => d.id === activeDeckId)

  const deckId = deck?.id
  const decklistKey = deck && JSON.stringify([deck.decklist["main-deck"], deck.decklist["extra-deck"], deck.decklist["side-deck"]])

  useEffect(() => {
    if (!deck) return

    const allIds = [
      ...deck.decklist["main-deck"],
      ...deck.decklist["extra-deck"],
      ...deck.decklist["side-deck"],
    ]

    if (allIds.length === 0) {
      setCardsMap(new Map())
      return
    }

    let ignore = false
    fetchCardsByIds(allIds).then((res) => {
      if (ignore) return
      const data = res.data
      if (!data) return
      setCardsMap((prev) => {
        const merged = new Map(prev)
        for (const card of data) {
          merged.set(card.id, card)
        }
        return merged
      })
    })
    return () => { ignore = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId, decklistKey])

  const handleSlotContextMenu = useCallback(({ e, zoneType, slotIndex }: { e: React.MouseEvent; card: Card; zoneType: "main" | "extra" | "side"; slotIndex: number }) => {
    e.preventDefault()
    if (!activeDeckId) return
    removeCardFromZone(activeDeckId, ZONE_TO_KEY[zoneType], slotIndex)
  }, [activeDeckId, removeCardFromZone])

  const handleRename = async () => {
    const trimmed = editName.trim()
    if (!trimmed || !activeDeckId) return
    await apiRenameDeck(activeDeckId, trimmed)
    loadDecks()
    setEditingName(false)
  }

  const handleSortAll = () => {
    if (!deck || !activeDeckId) return
    const doSort = (zoneType: "main" | "extra" | "side") => {
      const zoneKey = ZONE_TO_KEY[zoneType]
      const ids = deck.decklist[zoneKey]
      if (ids.length) {
        sortZone(activeDeckId, zoneKey, sortCardIds(ids, cardsMap))
      }
    }
    doSort("main")
    doSort("extra")
    doSort("side")
  }

  const handleClearConfirm = () => {
    if (!activeDeckId) return
    clearAllZones(activeDeckId)
    setClearDialogOpen(false)
  }

  const handleSave = async () => {
    if (!activeDeckId || saving) return
    setSaving(true)
    const result = await saveDeck(activeDeckId)
    if (result.success) {
      addToast("Deck saved.", "default")
    } else {
      addToast("Couldn't save. Check server connection.", "destructive")
    }
    setSaving(false)
  }

  const handleCoverClick = () => {
    coverInputRef.current?.click()
  }

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeDeckId) return
    setUploading(true)
    const res = await apiUploadCover(activeDeckId, file)
    if (res.data) {
      loadDecks()
    } else if (res.error) {
      const msg = res.error.code === "NETWORK_ERROR"
        ? "Couldn't upload cover. Check server connection."
        : "Couldn't upload cover. Supported formats: PNG, JPG, WEBP."
      addToast(msg, "destructive")
    }
    setUploading(false)
    if (coverInputRef.current) coverInputRef.current.value = ""
  }

  const isDeckEmpty = deck && deck.decklist["main-deck"].length === 0 && deck.decklist["extra-deck"].length === 0 && deck.decklist["side-deck"].length === 0

  const handleExport = async () => {
    if (!activeDeckId) return
    const res = await apiExportDeck(activeDeckId)
    if (res.data?.content) {
      const safeName = deck?.name.replace(/[^a-zA-Z0-9_-]/g, "_") || "deck"
      const blob = new Blob([res.data.content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${safeName}.txt`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 100)
    } else {
      addToast("Couldn't export deck.", "destructive")
    }
  }

  const handleImportClick = () => {
    importInputRef.current?.click()
  }

  const handleImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeDeckId) return

    try {
      const content = await file.text()
      if (!content.trim()) {
        setImportDialog({ title: "Parse Error", message: "Couldn't parse file. Expected format: #main, #extra, !side sections with card IDs." })
        return
      }

      const res = await apiImportDeck(content)
      if (res.data) {
        const { decklist, invalid_ids } = res.data
        if (invalid_ids.length > 0) {
          setImportDialog({
            title: "Unknown Card IDs",
            message: `Unknown card IDs: ${invalid_ids.join(", ")}. These cards were skipped.`,
          })
        }
        clearAllZones(activeDeckId)
        sortZone(activeDeckId, "main-deck", decklist["main-deck"])
        sortZone(activeDeckId, "extra-deck", decklist["extra-deck"])
        sortZone(activeDeckId, "side-deck", decklist["side-deck"])
      } else if (res.error) {
        if (res.error.code === "PARSE_ERROR") {
          setImportDialog({
            title: "Parse Error",
            message: "Couldn't parse file. Expected format: #main, #extra, !side sections with card IDs.",
          })
        } else {
          addToast("Couldn't import deck. Check server connection.", "destructive")
        }
      }
    } catch {
      addToast("Couldn't import deck. Check server connection.", "destructive")
    }

    if (importInputRef.current) importInputRef.current.value = ""
  }

  if (!deck) {
    return null
  }

  const buildSlots = (ids: number[] | undefined, maxCount: number): (Card | null)[] => {
    const safe = ids ?? []
    const slots: (Card | null)[] = safe.slice(0, maxCount).map((id) => cardsMap.get(id) ?? null)
    while (slots.length < maxCount) {
      slots.push(null)
    }
    return slots
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        {editingName ? (
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setEditingName(false) }}
            onBlur={handleRename}
            autoFocus
            className="text-base font-semibold max-w-[300px]"
          />
        ) : (
          <>
            <h2 className="font-semibold text-base">{deck.name}</h2>
            <button
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => { setEditName(deck.name); setEditingName(true) }}
              title="Rename deck"
            >
              ✏
            </button>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 justify-end flex-wrap">
        <Button variant="ghost" onClick={() => setView("library")}>
          ← Back to Library
        </Button>
        <Button variant="default" onClick={handleSortAll}>
          Sort
        </Button>
        <Button variant="default" disabled={saving} onClick={handleSave}>
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button variant="default" disabled={uploading} onClick={handleCoverClick}>
          {uploading ? "Uploading..." : "Upload Cover"}
        </Button>
        <input
            ref={coverInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={handleCoverChange}
          />
          <Button variant="default" disabled={isDeckEmpty} onClick={handleExport}>
            Export
          </Button>
          <Button variant="default" onClick={handleImportClick}>
            Import
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept=".txt"
            className="hidden"
            onChange={handleImportChange}
          />
          <Button variant="destructive" onClick={() => setClearDialogOpen(true)}>
            Clear
          </Button>
        </div>
      <DeckZone
        name="Main Deck"
        slots={buildSlots(deck.decklist["main-deck"], 60)}
        maxCount={60}
        zoneType="main"
        onSlotHover={setHoveredCard}
        onSlotContextMenu={handleSlotContextMenu}
      />
      <DeckZone
        name="Extra Deck"
        slots={buildSlots(deck.decklist["extra-deck"], 15)}
        maxCount={15}
        zoneType="extra"
        onSlotHover={setHoveredCard}
        onSlotContextMenu={handleSlotContextMenu}
      />
      <DeckZone
        name="Side Deck"
        slots={buildSlots(deck.decklist["side-deck"], 15)}
        maxCount={15}
        zoneType="side"
        onSlotHover={setHoveredCard}
        onSlotContextMenu={handleSlotContextMenu}
      />
      <AlertDialog
        open={clearDialogOpen}
        title="Clear all cards from this deck?"
        onConfirm={handleClearConfirm}
        onCancel={() => setClearDialogOpen(false)}
        confirmLabel="Clear"
        destructive
      >
        This will remove all cards from Main Deck, Extra Deck, and Side Deck.
      </AlertDialog>
      {importDialog && (
        <AlertDialog
          open
          title={importDialog.title}
          onConfirm={() => setImportDialog(null)}
          onCancel={() => setImportDialog(null)}
          confirmLabel="OK"
        >
          {importDialog.message}
        </AlertDialog>
      )}
    </div>
  )
}
