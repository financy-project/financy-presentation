import * as React from "react"
import type { VariantProps } from "class-variance-authority"

import { Button, buttonVariants } from "@/components/ui/button"

type IconButtonProps = Omit<React.ComponentProps<"button">, "size"> &
  Pick<VariantProps<typeof buttonVariants>, "variant"> & {
    size?: "icon-xs" | "icon-sm" | "icon" | "icon-lg"
    icon: React.ReactNode
    "aria-label": string
  }

function IconButton({ icon, size = "icon", variant, ...props }: IconButtonProps) {
  return (
    <Button data-slot="icon-button" variant={variant} size={size} {...props}>
      {icon}
    </Button>
  )
}

export { IconButton }
export type { IconButtonProps }
