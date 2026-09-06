import type { JSX } from 'react'

import { ComponentsPreview } from '@/components/components-preview'
import { ContactForm } from '@/components/contact-form'
import { CountriesList } from '@/components/countries-list'

export function PreviewPage(): JSX.Element {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Financy</h1>
        <p className="text-muted-foreground text-sm">
          React + Vite + TypeScript + GraphQL (Apollo Client) + React Query + React Hook Form +
          Zod + Tailwind + shadcn/ui
        </p>
      </div>
      <CountriesList />
      <ContactForm />
      <ComponentsPreview />
    </main>
  )
}
