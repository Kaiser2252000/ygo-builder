import { useCallback, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { ToastContext, type Toast } from "@/components/ui/toastContext"

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, variant: "default" | "destructive" = "default") => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, message, variant }])
    if (variant === "default") {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 3000)
    }
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            className={cn(
              "cursor-pointer rounded-md border px-4 py-3 text-sm shadow-md",
              t.variant === "default" && "bg-card text-card-foreground",
              t.variant === "destructive" && "bg-destructive text-destructive-foreground"
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
