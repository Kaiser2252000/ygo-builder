export interface Card {
  id: number
  name: string
  type: string
  frameType: string
  description: string
  level: number | null
  atk: number | null
  def: number | null
  race: string
  attribute: string
  archetype: string
  imageUrl?: string | null
}
