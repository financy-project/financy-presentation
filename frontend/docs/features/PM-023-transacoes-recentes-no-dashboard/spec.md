# Transações Recentes no Dashboard - PM-023

## Design

Referência: [Figma - Financy (Community)](https://www.figma.com/design/ZF0QlJlYLMEUz6DH93SwbK/Financy--Community-?node-id=3103-2246), card "TRANSAÇÕES RECENTES" — mesmo modelo visual de linha usado na tela `/transacoes` (ícone da categoria, descrição, data, tag de categoria, valor), mas num layout compacto (sem colunas de tabela, sem ações de editar/excluir).

## Description

Substitui o placeholder de `src/modules/dashboard/components/recent-transactions-card.tsx` (criado no PM-022) pelo conteúdo real:

- **Cabeçalho**: título "TRANSAÇÕES RECENTES" + link "Ver todas" navegando para `/transacoes` (sem parâmetros/filtros).
- **Lista**: até 5 transações recentes (mesmo limite já usado no backend, ver Notas técnicas), cada linha com:
  - ícone quadrado da categoria + descrição + data, à esquerda ("Receita" no Figma é uma categoria normal como qualquer outra — verde, ícone maleta —, não um caso especial de "sem categoria");
  - tag de categoria + valor formatado + ícone colorido do tipo (seta verde pra cima = receita, seta vermelha pra baixo = despesa — mesmos `CircleArrowUp`/`CircleArrowDown` já usados em `transaction-type-indicator.tsx`), à direita.
- **Rodapé**: botão "+ Nova transação" que **abre o `NewTransactionDialog` diretamente na tela do dashboard, sem navegar** para `/transacoes`. Ao criar a transação com sucesso, a **query do dashboard (`GET_DASHBOARD`) deve ser refeita** — não a `LIST_TRANSACTIONS` (que não está ativa nesta tela) — para que a lista e os cards de resumo reflitam a nova transação.

## Notas técnicas (para detalhar em `plan.md`)

- O backend (`../server/src/modules/dashboard`) **já retorna** `dashboard.recentTransactions: [TransactionType]` (5 mais recentes, mesmo shape de `TransactionListItem` usado em `LIST_TRANSACTIONS`) — não é necessário nenhum trabalho de backend, só estender a query `GET_DASHBOARD` do frontend (`src/modules/dashboard/graphql/queries.ts`) para pedir esse campo.
- `useCreateTransaction` hoje faz `refetchQueries: [LIST_TRANSACTIONS]` de forma fixa (`src/modules/transactions/hooks/use-create-transaction.ts`). Para o fluxo "Nova transação" a partir do dashboard funcionar, esse hook precisa também disparar o refetch de `GET_DASHBOARD` quando usado a partir daqui — detalhado em `plan.md` (hook passa a aceitar uma lista opcional de refetch adicionais).
- Confirmado via `/figma-fidelity`: o ícone colorido ao lado do valor não é um componente novo — a camada do Figma se chama `icon/circle-arrow-up`/`circle-arrow-down`, ou seja, é literalmente `CircleArrowUp`/`CircleArrowDown` (lucide-react) já usados em `transaction-type-indicator.tsx` e `summary-card.tsx`.
- O módulo `dashboard` não importa de `@/modules/transactions` hoje (mesma convenção de isolamento entre módulos já usada no backend e espelhada em `transaction-category-cell.tsx`, que duplica os `ICON_OPTIONS`/`COLOR_OPTIONS` em vez de importar de `@/modules/categories`). `plan.md` detalha onde reaproveitar (o modal/hook de criar transação, por serem um fluxo grande demais pra duplicar) e onde duplicar (ícone/cor da categoria, formatação de data/valor — pequeno o bastante pra seguir o mesmo padrão já estabelecido).

## Users

Usuários autenticados vendo a tela `/dashboard`, querendo um atalho rápido pras últimas movimentações e para registrar uma nova transação sem sair da tela.

## Acceptance Criteria

* [ ] O cabeçalho do card mostra "TRANSAÇÕES RECENTES" e um link "Ver todas" que navega para `/transacoes`
* [ ] A lista mostra as transações recentes vindas de `dashboard.recentTransactions` (via `GET_DASHBOARD` estendida)
* [ ] Cada linha segue o modelo visual do Figma: ícone + descrição + data à esquerda; tag de categoria + valor + indicador circular do tipo à direita
* [ ] O botão "+ Nova transação" abre o `NewTransactionDialog` sem navegar para `/transacoes`
* [ ] Ao criar a transação com sucesso pelo modal aberto no dashboard, a query `GET_DASHBOARD` é refeita (lista e cards de resumo atualizam)
* [ ] Estado vazio (sem transações no mês) tratado de forma equivalente ao já usado em `transactions-table.tsx` ("Nenhuma transação cadastrada ainda.")

## Out of Scope

- Paginação/scroll da lista de recentes (sempre as últimas 5, sem "carregar mais")
- Editar/excluir transações a partir desta lista (ações não aparecem no Figma para este card)
- Conteúdo real de `dashboard-categories-card.tsx` (`balanceByCategory`) — feature futura separada
- Loading/skeleton específico deste bloco (pode reaproveitar o loading já existente de `useGetDashboard`, detalhar em `plan.md`)
