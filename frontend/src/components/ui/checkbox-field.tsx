import * as React from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

type CheckboxFieldProps = React.ComponentProps<typeof Checkbox> & {
  label: string
}

function CheckboxField({ id, label, ...props }: CheckboxFieldProps) {
  return (
    <Label htmlFor={id} className="font-normal text-gray-700">
      <Checkbox id={id} {...props} />
      {label}
    </Label>
  )
}

export { CheckboxField }
export type { CheckboxFieldProps }
