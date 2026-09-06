import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: import.meta.env.VITE_BACKEND_URL, credentials: 'include' }),
  cache: new InMemoryCache(),
})
