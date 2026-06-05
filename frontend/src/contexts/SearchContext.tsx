import { useCallback, useRef, useState, type ReactNode } from "react"
import { searchCards as apiSearchCards } from "@/lib/api"
import { SearchContext, type SearchState } from "@/contexts/searchContextValue"

export function SearchProvider({ children }: { children: ReactNode }) {
  const latestRequestId = useRef(0)
  const [state, setState] = useState<SearchState>({
    query: "",
    results: [],
    isLoading: false,
    error: null,
  })

  const searchCards = useCallback(async (q: string) => {
    const requestId = latestRequestId.current + 1
    latestRequestId.current = requestId
    const trimmed = q.trim()
    if (!trimmed) {
      setState({ query: q, results: [], isLoading: false, error: null })
      return
    }

    setState((prev) => ({ ...prev, query: q, isLoading: true, error: null }))

    const res = await apiSearchCards(trimmed)
    if (requestId !== latestRequestId.current) {
      return
    }

    if (res.error) {
      setState((prev) => ({ ...prev, isLoading: false, error: res.error!.message }))
    } else {
      setState((prev) => ({ ...prev, results: res.data ?? [], isLoading: false, error: null }))
    }
  }, [])

  const setQuery = useCallback((q: string) => {
    setState((prev) => ({ ...prev, query: q }))
  }, [])

  return (
    <SearchContext.Provider value={{ ...state, setQuery, searchCards }}>
      {children}
    </SearchContext.Provider>
  )
}
