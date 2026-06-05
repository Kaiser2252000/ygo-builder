import { createContext } from "react"

export interface Toast {
  id: number
  message: string
  variant: "default" | "destructive"
}

export interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, variant?: "default" | "destructive") => void
}

export const ToastContext = createContext<ToastContextType | null>(null)
