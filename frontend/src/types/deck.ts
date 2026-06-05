export interface Decklist {
  "main-deck": number[]
  "extra-deck": number[]
  "side-deck": number[]
}

export const ZONE_TO_KEY: Record<"main" | "extra" | "side", keyof Decklist> = {
  main: "main-deck",
  extra: "extra-deck",
  side: "side-deck",
}

export interface Deck {
  id: string
  name: string
  cover: string | null
  decklist: Decklist
}
