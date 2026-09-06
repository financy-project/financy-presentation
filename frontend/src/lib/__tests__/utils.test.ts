import { describe, expect, it } from 'vitest'
import { cn, getInitials } from '@/lib/utils'

describe('cn', () => {
  it('joins truthy class values and drops falsy ones', () => {
    const showB = false
    expect(cn('a', showB && 'b', 'c')).toBe('a c')
  })

  it('resolves conflicting Tailwind utilities by keeping the last one', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })
})

describe('getInitials', () => {
  it('returns the uppercased first and last initials for a two-word name', () => {
    expect(getInitials('Carlos Teixeira')).toBe('CT')
  })

  it('returns one uppercased initial for a single-word name', () => {
    expect(getInitials('Carlos')).toBe('C')
  })

  it('returns an empty string for an empty/whitespace-only name', () => {
    expect(getInitials('')).toBe('')
    expect(getInitials('   ')).toBe('')
  })
})
