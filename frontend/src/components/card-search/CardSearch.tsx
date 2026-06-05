import { useEffect } from "react"
import { SearchInput } from "@/components/card-search/SearchInput"
import { SearchResult } from "@/components/card-search/SearchResult"
import { useCardSearch } from "@/hooks/useCardSearch"
import { useToast } from "@/components/ui/useToast"

export function CardSearch() {
  const { error } = useCardSearch()
  const { addToast } = useToast()

  useEffect(() => {
    if (error) {
      addToast("Search failed. Check server connection.", "destructive")
    }
  }, [error, addToast])

  return (
    <div className="w-80 min-w-72 h-full flex flex-col gap-3 p-4 border-l">
      <SearchInput />
      <SearchResult />
    </div>
  )
}
