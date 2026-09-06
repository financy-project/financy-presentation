import * as React from "react"
import type { VariantProps } from "class-variance-authority"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type LinkProps = React.ComponentProps<"a"> &
  Pick<VariantProps<typeof buttonVariants>, "size">

function Link({ className, size, ...props }: LinkProps) {
  return (
    <a
      data-slot="link"
      className={cn(buttonVariants({ variant: "link", size, className }))}
      {...props}
    />
  )
}

export { Link }
export type { LinkProps }
