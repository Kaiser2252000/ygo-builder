import { useCardSearch } from "@/hooks/useCardSearch"
import { useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"

export function SearchInput() {
  const { query, searchCards, setQuery } = useCardSearch()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setQuery(val)

      if (timer.current) clearTimeout(timer.current)

      if (!val.trim()) {
        searchCards("")
        return
      }

      timer.current = setTimeout(() => {
        searchCards(val)
      }, 300)
    },
    [setQuery, searchCards]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && query.trim()) {
        if (timer.current) clearTimeout(timer.current)
        searchCards(query)
      }
    },
    [query, searchCards]
  )

  return (
    <div className="flex items-center gap-2 rounded-md border bg-background p-2 w-full">
      <svg
        className="h-4 w-4 text-muted-foreground shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
        />
      </svg>
      <Input
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search cards..."
        className="border-0 p-0 h-auto shadow-none focus:ring-0"
      />
    </div>
  )
}
