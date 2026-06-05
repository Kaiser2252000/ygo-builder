import { useEffect, useRef } from "react"

interface DeckSlotContextMenuProps {
  x: number
  y: number
  onRemove: () => void
  onCancel: () => void
}

export function DeckSlotContextMenu({ x, y, onRemove, onCancel }: DeckSlotContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onCancel])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onCancel()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onCancel])

  const clampedX = Math.min(x, window.innerWidth - 160)
  const clampedY = Math.min(y, window.innerHeight - 80)

  return (
    <div className="fixed inset-0 z-50">
      <div
        ref={menuRef}
        className="fixed w-40 rounded-md border bg-popover p-1 shadow-md"
        style={{ left: clampedX, top: clampedY }}
      >
        <button
          className="w-full text-left px-2 py-1.5 text-sm rounded-sm text-destructive hover:bg-accent"
          onClick={onRemove}
        >
          Remove
        </button>
        <button
          className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
