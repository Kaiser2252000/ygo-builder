import { useState } from "react"
import { Input } from "@/components/ui/input"
import { AlertDialog } from "@/components/ui/alert-dialog"

interface CreateDeckDialogProps {
  open: boolean
  onClose: () => void
  onCreate: (name: string) => Promise<void>
}

export function CreateDeckDialog({ open, onClose, onCreate }: CreateDeckDialogProps) {
  const [name, setName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError("Deck name cannot be empty")
      return
    }
    setError(null)
    setIsCreating(true)
    try {
      await onCreate(trimmed)
      setName("")
      onClose()
    } catch {
      setError("Failed to create deck")
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancel = () => {
    if (!isCreating) {
      setName("")
      setError(null)
      onClose()
    }
  }

  return (
    <AlertDialog
      open={open}
      title="Create New Deck"
      confirmLabel={isCreating ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Creating...
        </span>
      ) : "Create"}
      confirmDisabled={isCreating}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm text-muted-foreground">Deck Name</label>
        <Input
          value={name}
          onChange={(e) => { setName(e.target.value); setError(null) }}
          placeholder="Enter deck name..."
          disabled={isCreating}
          autoFocus
          onKeyDown={(e) => { if (e.key === "Enter") handleConfirm() }}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </AlertDialog>
  )
}
