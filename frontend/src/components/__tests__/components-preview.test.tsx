import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ComponentsPreview } from '@/components/components-preview'

describe('ComponentsPreview', () => {
  it('renders without errors with all sections present', () => {
    render(<ComponentsPreview />)

    for (const section of [
      'Input',
      'Button',
      'Select',
      'IconButton',
      'Link',
      'Pagination',
      'Tag',
      'TransactionTypeIndicator',
    ]) {
      expect(screen.getByRole('heading', { name: section })).toBeInTheDocument()
    }
  })
})
