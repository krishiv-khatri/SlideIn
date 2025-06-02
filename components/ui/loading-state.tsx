import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  text?: string
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "minimal"
}

export function LoadingState({ 
  text = "Loading", 
  className,
  size = "md",
  variant = "default"
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  }

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center justify-center gap-2", className)}>
        <Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size])} />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    )
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[200px] w-full p-6",
      className
    )}>
      <div className="relative">
        <Loader2 
          className={cn(
            "animate-spin text-primary", 
            sizeClasses[size]
          )} 
        />
      </div>
      {text && (
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          {text}
        </p>
      )}
    </div>
  )
} 