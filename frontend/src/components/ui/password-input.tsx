import * as React from "react"
import { Eye, EyeClosed } from "lucide-react"

import { IconButton } from "@/components/ui/icon-button"
import { TextInput, type TextInputProps } from "@/components/ui/text-input"

type PasswordInputProps = Omit<TextInputProps, "type" | "rightIcon">

function PasswordInput(props: PasswordInputProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  return (
    <TextInput
      type={isVisible ? "text" : "password"}
      rightIcon={
        <IconButton
          type="button"
          variant="ghost"
          size="icon-sm"
          icon={isVisible ? <Eye /> : <EyeClosed />}
          aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
          onClick={() => setIsVisible((visible) => !visible)}
        />
      }
      {...props}
    />
  )
}

export { PasswordInput }
export type { PasswordInputProps }
