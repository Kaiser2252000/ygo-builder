import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "destructive"
}

const variantStyles: Record<string, string> = {
  default: "bg-primary text-primary-foreground hover:opacity-90",
  ghost: "bg-transparent hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
        "disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
)
Button.displayName = "Button"
