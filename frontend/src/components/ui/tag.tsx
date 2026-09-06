import * as React from "react"

import { cn } from "@/lib/utils"

type TagColor = "blue" | "purple" | "pink" | "red" | "orange" | "yellow" | "green"

// Written out in full (not `bg-${color}-light`) so Tailwind's class
// scanner can statically find every class — template-interpolated
// class names are invisible to it and would be silently dropped.
const colorClasses: Record<TagColor, string> = {
  blue: "bg-blue-light text-blue-dark",
  purple: "bg-purple-light text-purple-dark",
  pink: "bg-pink-light text-pink-dark",
  red: "bg-red-light text-red-dark",
  orange: "bg-orange-light text-orange-dark",
  yellow: "bg-yellow-light text-yellow-dark",
  green: "bg-green-light text-green-dark",
}

type TagProps = React.ComponentProps<"span"> & {
  color?: TagColor
  size?: "sm" | "md"
}

function Tag({ className, color = "blue", size = "md", ...props }: TagProps) {
  return (
    <span
      data-slot="tag"
      data-size={size}
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "md" ? "h-6 px-2.5 text-xs" : "h-5 px-2 text-[0.7rem]",
        colorClasses[color],
        className
      )}
      {...props}
    />
  )
}

export { Tag }
export type { TagColor, TagProps }
