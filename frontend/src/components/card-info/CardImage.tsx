import { useEffect, useRef, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function CardImage({ imageUrl, name }: { imageUrl?: string | null; name: string }) {
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [fullSize, setFullSize] = useState(false)
  const isLoading = Boolean(imageUrl) && loadedUrl !== imageUrl && failedUrl !== imageUrl
  const hasError = Boolean(imageUrl) && failedUrl === imageUrl
  const overlayRef = useRef<HTMLDivElement>(null)

  const close = () => {
    setPreviewOpen(false)
    setFullSize(false)
  }

  useEffect(() => {
    if (!previewOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [previewOpen])

  if (!imageUrl || hasError) {
    return (
      <div className="flex aspect-[3/4] w-full items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
        No image
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {isLoading && <Skeleton className="aspect-[3/4] w-full rounded-md" />}
      <button
        onClick={() => setPreviewOpen(true)}
        className={isLoading ? "hidden" : "block w-full cursor-pointer text-left"}
      >
        <img
          src={imageUrl}
          alt={name}
          className="w-full max-h-[calc(100vh-12rem)] object-contain rounded-md border"
          onLoad={() => setLoadedUrl(imageUrl)}
          onError={() => setFailedUrl(imageUrl)}
        />
      </button>

      {previewOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={close}
        >
          <div
            className={fullSize ? "overflow-auto max-h-screen max-w-screen p-8" : "flex items-center justify-center"}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageUrl}
              alt={name}
              className={
                fullSize
                  ? "max-w-none"
                  : "max-h-[90vh] max-w-[90vw] object-contain"
              }
            />
          </div>
          <button
            onClick={() => setFullSize((v) => !v)}
            className="absolute right-16 top-4 flex size-9 items-center justify-center rounded-full bg-black/50 text-white text-sm hover:bg-black/70"
          >
            {fullSize ? "Fit" : "Zoom"}
          </button>
          <button
            onClick={close}
            className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-black/50 text-white text-xl hover:bg-black/70"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
