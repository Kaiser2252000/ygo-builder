import { useContext } from "react"
import { CardInfoContext } from "@/contexts/cardInfoContextValue"

export function useCardInfo() {
  const ctx = useContext(CardInfoContext)
  if (!ctx) throw new Error("useCardInfo must be used within CardInfoProvider")
  return ctx
}
