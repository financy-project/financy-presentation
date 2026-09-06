# filtro-de-transactions - PM-019

## Description

Adicionar uma barra de filtros à listagem de transações (`TransactionsPage`), permitindo buscar por
descrição, filtrar por tipo (entrada/saída), por categoria e por período (mês/ano). O componente de
seleção de categoria usado no filtro deve ser compartilhado com o modal de criar/editar transação
(`NewTransactionDialog` / `TransactionForm`), e a lista de categorias deve ser buscada uma única vez
na página de transações e armazenada em uma store Zustand, consumida tanto pelo filtro quanto pelos
modais (hoje `useCategoriesForSelect` busca de forma independente em cada lugar que o usa).

Referência visual: `.workspace/image copy 7.png` (arquivo local, fora do Figma — não há créditos
disponíveis no momento). O layout é um card com 4 campos lado a lado:

1. **Buscar** — input de texto com ícone de lupa, placeholder "Buscar por descrição"
2. **Tipo** — select, opções: "Todos" (default/sem filtro), "Entrada", "Saída"
3. **Categoria** — select, opções: "Todas" (default/sem filtro) + lista de categorias (id/título)
4. **Período** — dropdown de mês/ano, exibe algo como "Novembro / 2025"

## Users

Usuários finais do app gerenciando suas próprias transações financeiras (mesmo público de PM-016
lista-de-transações).

## Backend contract (`../server`, `listTransactions` query)

Args relevantes em `ListTransactionsArgs` (`server/src/modules/transaction/graphql/args/list-transactions.args.ts`),
enviados como argumentos soltos na query (não um único input `filter`):

- `description?: string` — filtro por descrição, aplicado no backend como `contains` + `insensitive`
  (case-insensitive substring). Não precisa de tratamento especial no client além de debounce.
- `type?: TransactionKind` — enum `EXPENSE | INCOME`, valor único (não array).
- `categoryIds?: [ID!]` — **array** de UUIDs mesmo havendo apenas uma categoria selecionada no filtro
  (select único na UI, mas deve ser enviado como array de 1 elemento: `categoryIds: [id]`).
- `month?: number` (1-12) e `year?: number` (2000-2100) — **devem ser enviados juntos**; o backend
  valida que ambos estejam presentes ou ambos ausentes (`transaction_period_incomplete` se só um for
  enviado).
- `startDate?: Date` / `endDate?: Date` — filtro alternativo por intervalo de datas, **mutuamente
  exclusivo** com `month`/`year` (erro `transaction_period_conflicts_with_date_range` se os dois
  forem enviados). Fora de escopo desta feature — o filtro de período só usa `month`/`year`.
- `first`/`after` — paginação por cursor, já implementada em `useListTransactions`.

Categorias para os selects vêm de `listCategories { id title }` (mesma query já usada por
`LIST_CATEGORIES_FOR_SELECT`).

## Acceptance Criteria

- [ ] A página de transações exibe uma barra de filtros acima da tabela, com os 4 campos do design:
      Buscar (descrição), Tipo, Categoria, Período.
- [ ] Buscar por descrição filtra a lista via `description` (debounced, para não disparar uma query
      GraphQL a cada tecla).
- [ ] Tipo tem as opções "Todos" (sem filtro / não envia `type`), "Entrada" (`INCOME`), "Saída"
      (`EXPENSE`).
- [ ] Categoria tem "Todas" (sem filtro / não envia `categoryIds`) + uma opção por categoria do
      usuário; ao selecionar uma categoria, envia `categoryIds: [categoryId]`.
- [ ] Período é um dropdown de mês/ano; ao selecionar um período, envia `month` e `year` juntos;
      "sem período selecionado" não envia nem `month` nem `year` (nunca envia só um dos dois).
- [ ] Alterar qualquer filtro reseta a paginação para a página 1.
- [ ] Existe um componente de seleção de categoria compartilhado, usado tanto no filtro da listagem
      quanto no `TransactionForm` (modal de criar/editar transação).
- [ ] A lista de categorias é buscada uma única vez (na `TransactionsPage`) e fica disponível via uma
      store Zustand; o filtro e os modais de criar/editar transação consomem essa store em vez de
      cada um fazer sua própria query `listCategories`.
- [ ] Estados de loading/erro da listagem seguem o padrão já existente em `useListTransactions`
      (skeleton/mensagem de erro), agora também cobrindo o carregamento inicial da lista de
      categorias usada nos filtros.
- [ ] Combinações de filtros funcionam em conjunto (ex.: tipo + categoria + período + busca ao mesmo
      tempo).

## Out of Scope

- Filtro por intervalo de datas livre (`startDate`/`endDate`) — o dropdown de período só cobre
  mês/ano.
- Seleção de múltiplas categorias no filtro (a UI expõe um único select, ainda que o backend aceite
  array).
- Salvar/persistir filtros entre sessões (ex.: na URL ou em localStorage).
- Alterações no modal de criar/editar transação além de passar a consumir a store compartilhada de
  categorias (nenhuma mudança visual ou de comportamento nesse modal).
