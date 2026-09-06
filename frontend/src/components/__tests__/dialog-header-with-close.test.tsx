import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { DialogHeaderWithClose } from '@/components/dialog-header-with-close'

describe('DialogHeaderWithClose', () => {
  it('renders the title, subtitle, and a close button', () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogHeaderWithClose title="Nova categoria" subtitle="Organize suas transações" />
        </DialogContent>
      </Dialog>,
    )

    expect(screen.getByRole('heading', { name: 'Nova categoria' })).toBeInTheDocument()
    expect(screen.getByText('Organize suas transações')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument()
  })
})
