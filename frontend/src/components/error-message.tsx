import type { JSX } from 'react'

import { cn } from '@/lib/utils'

export interface ErrorMessageProps {
  error: string | null
  className?: string
}

// Shared across the app for the one recurring error-display pattern
// (role="alert", text-destructive text-sm) — the caller no longer guards
// with `{error && <ErrorMessage .../>}`: this component itself renders
// nothing (a Fragment) when there's no error to show.
export function ErrorMessage({ error, className }: ErrorMessageProps): JSX.Element {
  if (!error) return <></>

  return (
    <p role="alert" className={cn('text-destructive text-sm', className)}>
      {error}
    </p>
  )
}
