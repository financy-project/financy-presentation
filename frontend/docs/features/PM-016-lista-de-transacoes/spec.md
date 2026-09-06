# Lista de Transações - PM-016

## Design

Figma: https://www.figma.com/design/ZF0QlJlYLMEUz6DH93SwbK/Financy--Community-?node-id=3104-401&t=PyKTWJeDynk9cmPR-4 (tabela completa)

É uma **tabela paginada**, com os seguintes nós:
- Header (cabeçalho de colunas): https://www.figma.com/design/ZF0QlJlYLMEUz6DH93SwbK/Financy--Community-?node-id=3104-798&t=PyKTWJeDynk9cmPR-4
- Body (linhas): https://www.figma.com/design/ZF0QlJlYLMEUz6DH93SwbK/Financy--Community-?node-id=3104-1498&t=PyKTWJeDynk9cmPR-4
- Footer (paginação): https://www.figma.com/design/ZF0QlJlYLMEUz6DH93SwbK/Financy--Community-?node-id=3104-1823&t=PyKTWJeDynk9cmPR-4

## Description

Adiciona a listagem de transações na tela `/transacoes`. Hoje a tela só tem o cabeçalho (título "Transações", subtítulo, botão "+ Nova transação") e o modal de criação, entregues no PM-014 — que explicitamente deixou "a listagem/grade de transações da tela `/transacoes`" fora de escopo para uma feature futura. Esta é essa feature. Consome a query `listTransactions` já existente no servidor (`../server/src/modules/transaction`), que retorna uma `TransactionConnection` (edges + `pageInfo`) com paginação por cursor (`first`/`after`) e suporta filtros (`startDate`, `endDate`, `month`, `year`, `description`, `type`, `categoryIds`) — não usados nesta feature, ver Out of Scope.

## Users

Usuários autenticados revisando as transações que cadastraram

## Acceptance Criteria

* [ ] A tela `/transacoes` exibe uma **tabela** de transações do usuário, abaixo do cabeçalho já existente, consumindo `listTransactions` (header de colunas + body de linhas + footer de paginação, conforme os 3 nós do Figma)
* [ ] Cada linha exibe: descrição, data, categoria (quando houver — `category` é nullable em `TransactionType`), tipo (despesa/receita) e valor formatado em R$ (o servidor retorna `value` como `Int` em centavos)
* [ ] O tipo (despesa/receita) é indicado visualmente — reaproveitar `TransactionTypeIndicator` (`src/components/transaction-type-indicator.tsx`) se o rótulo/estilo servir para a tabela, ou confirmar em `/feature-plan`/`/figma-fidelity` se o Figma pede algo diferente
* [ ] Cada linha exibe a **coluna/célula de ações** conforme o Figma (ex. ícones de editar/excluir) — renderizada visualmente, mas **sem funcionalidade**: os botões não disparam `updateTransaction`/`deleteTransaction` nem abrem nenhum formulário/confirmação nesta feature (ver Out of Scope)
* [ ] Estado vazio (nenhuma transação cadastrada): mensagem apropriada no lugar da tabela
* [ ] Paginação via footer, usando `first`/`after` de `listTransactions` e `pageInfo` (`TransactionConnection`) — layout/comportamento exato conforme o nó de footer do Figma

## Out of Scope

- **Funcionalidade** dos botões de ação (editar/excluir) — os elementos visuais são criados nesta feature (instrução explícita do usuário: "crie todos os itens até as ações, mas não implemente as funcionalidades de delete e update"), mas `updateTransaction`/`deleteTransaction` não são chamados, e nenhum modal/confirmação é implementado
- A barra de filtros (Buscar/Tipo/Categoria/Período) visível acima da tabela no Figma **não é um dos 4 nós fornecidos** para esta feature (nem faz parte do container `3104:401`) — não implementada aqui
- Ordenação customizada (a ordem retornada pelo servidor é a assumida)
- Resumo/totais agregados da lista (ex. total de despesas/receitas do período) — potencial feature futura, análoga ao PM-013 (`resumo-da-lista-de-categorias`)

## Server Dependency — `icon` em `TransactionCategoryType` e `totalRecord` em `TransactionConnection`

O Figma mostra, em cada linha, um quadrado 40×40 tingido na cor da categoria com o **ícone da categoria** (ex. `Icon/utensils`, `Blue/blue-light` de fundo — mesmo padrão do `CategoryCard`), e no footer uma **paginação numerada completa** ("1 2 3", botão ativo em `Brand/brand-base`) junto de **"1 a 10 | 27 resultados"** (contagem total).

**Isso não existe no servidor hoje:**
- `TransactionCategoryType` (`../server/src/modules/transaction/graphql/object-types/transaction-category.object-type.ts`) só tem `{ id, title, color }` — sem `icon`
- `TransactionConnection` (`transaction-connection.object-type.ts`) só tem `{ edges, pageInfo }`, e `PageInfo` só tem `{ hasNextPage, endCursor }` — sem contagem total, sem `hasPreviousPage`

Decisão (2026-09-04): assumir que o usuário vai implementar isso em `../server` (repositório separado) — **`icon: string`** em `TransactionCategoryType` (mesma convenção de nome de ícone usada em `CategoryType.icon`/`ICON_OPTIONS`) e **`totalRecord: Int`** em `TransactionConnection`. Este plano assume que `listTransactions` retornará `TransactionConnection { edges, pageInfo { hasNextPage, endCursor }, totalRecord }` e `TransactionType.category` retornará `TransactionCategoryType { id, title, color, icon }`. Dependência externa a este repositório; acompanhar antes/durante a implementação das partes que dependem disso (quadrado de ícone por linha, "N resultados" e numeração completa de páginas no footer).
