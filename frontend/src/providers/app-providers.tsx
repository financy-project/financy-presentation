import { ApolloProvider } from '@apollo/client/react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { apolloClient } from '@/lib/apollo-client'
import { queryClient } from '@/lib/query-client'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApolloProvider>
  )
}
