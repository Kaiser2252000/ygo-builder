import { createContext } from "react"
import type { Card } from "@/types/card"

export interface SearchState {
  query: string
  results: Card[]
  isLoading: boolean
  error: string | null
}

export interface SearchContextType extends SearchState {
  setQuery: (q: string) => void
  searchCards: (q: string) => void
}

export const SearchContext = createContext<SearchContextType | null>(null)
