import { CardInfoPanel } from "@/components/card-info/CardInfoPanel"

export function LeftPanel() {
  return (
    <aside className="w-72 min-w-64 h-full flex flex-col gap-3 p-4 border-r">
      <CardInfoPanel />
    </aside>
  )
}
