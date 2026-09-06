import { useQuery } from '@apollo/client/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GET_COUNTRIES } from '@/graphql/queries'

interface Country {
  code: string
  name: string
  emoji: string
}

interface GetCountriesData {
  countries: Country[]
}

export function CountriesList() {
  const { data, loading, error } = useQuery<GetCountriesData>(GET_COUNTRIES)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exemplo GraphQL (Apollo Client)</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-muted-foreground text-sm">Carregando países…</p>}
        {error && (
          <p className="text-destructive text-sm">Erro ao buscar dados: {error.message}</p>
        )}
        {data && (
          <ul className="grid max-h-48 grid-cols-2 gap-1 overflow-y-auto text-sm sm:grid-cols-3">
            {data.countries.slice(0, 30).map((country) => (
              <li key={country.code}>
                {country.emoji} {country.name}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
