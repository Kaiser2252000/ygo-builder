import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm",
        "placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
)
Input.displayName = "Input"
