import { useEffect, useRef, type ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface AlertDialogProps {
  open: boolean
  title: string
  children?: ReactNode
  confirmLabel?: ReactNode
  cancelLabel?: ReactNode
  destructive?: boolean
  confirmDisabled?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function AlertDialog({ open, title, children, confirmLabel = "Confirm", cancelLabel = "Cancel", destructive, confirmDisabled, onConfirm, onCancel }: AlertDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCancelRef = useRef(onCancel)
  onCancelRef.current = onCancel

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancelRef.current()
    }
    document.addEventListener("keydown", handleKeyDown)
    dialogRef.current?.focus()
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className="flex flex-col gap-4 rounded-lg border bg-card p-6 shadow-lg min-w-[320px]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        {children && <div className="text-sm text-muted-foreground">{children}</div>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
          <Button
            className={destructive ? "bg-destructive text-destructive-foreground hover:opacity-90" : undefined}
            disabled={confirmDisabled}
            onClick={onConfirm}
          >{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}
