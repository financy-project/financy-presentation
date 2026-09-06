import type { JSX } from 'react'

import { Plus } from 'lucide-react'
import { Subtitle } from '@/components/subtitle'
import { Button } from '@/components/ui/button'

interface PageHeaderProps {
  title: string
  subtitle: string
  actionLabel: string
  onAction: () => void
}

export function PageHeader({ title, subtitle, actionLabel, onAction }: PageHeaderProps): JSX.Element {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <Subtitle className="text-base">{subtitle}</Subtitle>
      </div>
      <Button size="xl" className="gap-2 px-3" onClick={onAction}>
        <Plus className="size-4" />
        {actionLabel}
      </Button>
    </div>
  )
}
