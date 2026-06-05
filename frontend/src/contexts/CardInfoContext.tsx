import { useCallback, useState, type ReactNode } from "react"
import type { Card } from "@/types/card"
import { CardInfoContext, type CardInfoState } from "@/contexts/cardInfoContextValue"

export function CardInfoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CardInfoState>({
    hoveredCard: null,
  })

  const setHoveredCard = useCallback((card: Card | null) => {
    setState({ hoveredCard: card })
  }, [])

  return (
    <CardInfoContext.Provider value={{ ...state, setHoveredCard }}>
      {children}
    </CardInfoContext.Provider>
  )
}
