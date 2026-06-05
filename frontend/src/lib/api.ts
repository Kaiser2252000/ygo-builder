import type { Card } from "@/types/card"
import type { Deck, Decklist } from "@/types/deck"

interface ApiResponse<T> {
  data: T | null
  error: { code: string; message: string } | null
}

export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(path)
    if (!res.ok) {
      return { data: null, error: { code: "HTTP_ERROR", message: `Status ${res.status}` } }
    }
    return await res.json()
  } catch {
    return { data: null, error: { code: "NETWORK_ERROR", message: "Search failed. Check server connection." } }
  }
}

async function apiPost<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      return { data: null, error: { code: "HTTP_ERROR", message: `Status ${res.status}` } }
    }
    return await res.json()
  } catch {
    return { data: null, error: { code: "NETWORK_ERROR", message: "Request failed. Check server connection." } }
  }
}

async function apiPut<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      return { data: null, error: { code: "HTTP_ERROR", message: `Status ${res.status}` } }
    }
    return await res.json()
  } catch {
    return { data: null, error: { code: "NETWORK_ERROR", message: "Request failed. Check server connection." } }
  }
}

async function apiPatch<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      return { data: null, error: { code: "HTTP_ERROR", message: `Status ${res.status}` } }
    }
    return await res.json()
  } catch {
    return { data: null, error: { code: "NETWORK_ERROR", message: "Request failed. Check server connection." } }
  }
}

async function apiDelete<T>(path: string): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(path, { method: "DELETE" })
    if (!res.ok) {
      return { data: null, error: { code: "HTTP_ERROR", message: `Status ${res.status}` } }
    }
    return await res.json()
  } catch {
    return { data: null, error: { code: "NETWORK_ERROR", message: "Request failed. Check server connection." } }
  }
}

export function searchCards(query: string): Promise<ApiResponse<Card[]>> {
  return apiGet<Card[]>(`/api/cards?q=${encodeURIComponent(query)}`)
}

export function fetchDecks(): Promise<ApiResponse<Deck[]>> {
  return apiGet<Deck[]>("/api/decks")
}

export function createDeck(name: string): Promise<ApiResponse<Deck>> {
  return apiPost<Deck>("/api/decks", { name })
}

export function fetchCardsByIds(ids: number[]): Promise<ApiResponse<Card[]>> {
  if (!Array.isArray(ids) || ids.length === 0) {
    return Promise.resolve({ data: [], error: null })
  }
  return apiGet<Card[]>(`/api/cards/batch?ids=${ids.join(",")}`)
}

export function deleteDeck(id: string): Promise<ApiResponse<{ id: string }>> {
  return apiDelete<{ id: string }>(`/api/decks/${encodeURIComponent(id)}`)
}

export function updateDeck(id: string, decklist: Decklist): Promise<ApiResponse<Deck>> {
  return apiPut<Deck>(`/api/decks/${encodeURIComponent(id)}`, { decklist })
}

export function renameDeck(id: string, name: string): Promise<ApiResponse<Deck>> {
  return apiPatch<Deck>(`/api/decks/${encodeURIComponent(id)}/rename`, { name })
}

export function uploadCover(deckId: string, file: File): Promise<ApiResponse<Deck>> {
  const formData = new FormData()
  formData.append("file", file)
  return apiPostForm<Deck>(`/api/decks/${encodeURIComponent(deckId)}/cover`, formData)
}

export function exportDeck(deckId: string): Promise<ApiResponse<{ content: string }>> {
  return apiGet<{ content: string }>(`/api/decks/${encodeURIComponent(deckId)}/export`)
}

export function importDeck(content: string): Promise<ApiResponse<{ decklist: Decklist; invalid_ids: number[] }>> {
  return apiPost<{ decklist: Decklist; invalid_ids: number[] }>("/api/decks/import", { content })
}

async function apiPostForm<T>(path: string, formData: FormData): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(path, {
      method: "POST",
      body: formData,
    })
    if (!res.ok) {
      return { data: null, error: { code: "HTTP_ERROR", message: `Status ${res.status}` } }
    }
    return await res.json()
  } catch {
    return { data: null, error: { code: "NETWORK_ERROR", message: "Request failed. Check server connection." } }
  }
}
