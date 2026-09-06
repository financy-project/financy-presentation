import * as React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type TextInputProps = React.ComponentProps<"input"> & {
  label: string
  errorMessage?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

function TextInput({
  id,
  label,
  errorMessage,
  leftIcon,
  rightIcon,
  className,
  ...props
}: TextInputProps) {
  return (
    <div className="grid gap-2" data-slot="text-input">
      <Label htmlFor={id} className="text-gray-700">
        {label}
      </Label>
      <div className="relative">
        {leftIcon && (
          <span className="text-gray-400 pointer-events-none absolute inset-y-0 left-3 my-auto flex items-center [&_svg]:size-4">
            {leftIcon}
          </span>
        )}
        <Input
          id={id}
          aria-invalid={!!errorMessage}
          className={cn(
            "h-12 text-base md:text-base placeholder:text-gray-400",
            leftIcon && "pl-10",
            rightIcon && "pr-9",
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute inset-y-0 right-1 my-auto flex items-center">
            {rightIcon}
          </span>
        )}
      </div>
      {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}
    </div>
  )
}

export { TextInput }
export type { TextInputProps }
