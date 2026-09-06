import type { JSX } from 'react'

export function AuthDivider(): JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <hr className="flex-1 border-gray-300" />
      <span className="text-muted-foreground text-sm">ou</span>
      <hr className="flex-1 border-gray-300" />
    </div>
  )
}
