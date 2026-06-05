import { useContext } from "react"
import { SearchContext } from "@/contexts/searchContextValue"

export function useCardSearch() {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error("useCardSearch must be used within SearchProvider")
  return ctx
}
