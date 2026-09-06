# Categorias no Dashboard - PM-024

## Description

Implementar o conteúdo real do card "Categorias" no Dashboard (hoje um placeholder "Em construção" em `src/modules/dashboard/components/dashboard-categories-card.tsx`), exibindo o consumo do mês atual por categoria — nome, tag colorida, quantidade de itens/transações e valor total — com um link "Gerenciar" no cabeçalho do card que navega para a tela de Categorias (`/categorias`).

Referência de design: Figma "Financy (Community)" → página Projeto → frame destacado em
https://www.figma.com/design/ZF0QlJlYLMEUz6DH93SwbK/Financy--Community-?node-id=3103-2350
(card "CATEGORIAS" com cabeçalho + link "Gerenciar >" e lista de badges por categoria com "N itens" e valor em R$).

O card já é renderizado dentro de `DashboardHighlights` (coluna 1 de 3, ao lado do `RecentTransactionsCard` — este último é escopo de outra feature, PM-023, e não deve ser alterado aqui).

## Backend / GraphQL

A API GraphQL (`../server`) já expõe os dados necessários — não é esperado trabalho de backend:

```graphql
query GetDashboard {
  dashboard {
    movement { income expense totalBalance }
    balanceByCategory {
      categoryId
      title
      color   # hex, ex: "#16A34A" — mapear para TagColor via COLOR_OPTIONS (src/modules/categories/components/color-picker.tsx)
      transactionCount
      totalValue  # em centavos; despesas negativas, receitas positivas (ver get-dashboard.use-case.ts)
    }
  }
}
```

A query do frontend em `src/modules/dashboard/graphql/queries.ts` (`GET_DASHBOARD`) hoje só busca `movement` — precisa ser estendida para incluir `balanceByCategory`, e `useGetDashboard` (`src/modules/dashboard/hooks/use-get-dashboard.ts`) precisa expor esses dados ao `DashboardCategoriesCard`.

## Users

Usuários autenticados do Financy visualizando o Dashboard para entender rapidamente onde estão gastando no mês corrente.

## Acceptance Criteria

* [ ] O card "Categorias" exibe, para cada categoria com movimentação no mês corrente, retornada por `balanceByCategory`: uma tag colorida com o nome da categoria (cor mapeada do hex via `COLOR_OPTIONS`/`Tag` de `src/components/ui/tag.tsx`), a quantidade de transações ("N itens") e o valor total formatado com `formatCurrencyValue`
* [ ] O cabeçalho do card tem o título "CATEGORIAS" e um link "Gerenciar" com ícone de seta (chevron-right) que navega para `/categorias`
* [ ] Estados de carregamento e erro são tratados de forma consistente com os demais blocos do dashboard (`DashboardSummary`/`dashboard-page.tsx`)
* [ ] Estado vazio: quando não há categorias com movimentação no mês, o card exibe uma mensagem apropriada (não a lista vazia nem o placeholder "Em construção")
* [ ] A navegação de topo (`Header`, `src/components/header.tsx`) já possui o item "Categorias" apontando para `/categorias` — confirmar que continua funcionando, sem necessidade de alteração
* [ ] Cobertura de testes (Vitest) para o componente e para a extensão do hook/query, seguindo o padrão de `__tests__` já usado no módulo dashboard

## Out of Scope

- Alterações no `RecentTransactionsCard` / bloco de Transações Recentes (PM-023)
- Alterações no backend/GraphQL (schema já existe e é suficiente)
- Alterações na navegação global do `Header`
