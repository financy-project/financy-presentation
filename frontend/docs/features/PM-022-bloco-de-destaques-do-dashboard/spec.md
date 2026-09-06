# Bloco de Destaques do Dashboard - PM-022

## Design

Referência: [Figma - Financy (Community)](https://www.figma.com/design/ZF0QlJlYLMEUz6DH93SwbK/Financy--Community-?node-id=3103-1988), frame da tela `/dashboard`, segunda linha (logo abaixo dos 3 cards de resumo do PM-021) — os blocos "TRANSAÇÕES RECENTES" (esquerda) e "CATEGORIAS" (direita).

## Description

Adiciona a **estrutura** (layout) da segunda linha da tela `/dashboard`, explicitamente fora de escopo do PM-021: uma `section` com dois itens lado a lado, alinhados em grid com os 3 cards de resumo já existentes (`DashboardSummary`):

- **Item esquerdo**: ocupa 2/3 da largura, alinhado com os cards "Saldo Total" e "Receitas do Mês" (as duas primeiras colunas do grid de 3 colunas).
- **Item direito**: ocupa 1/3 da largura, alinhado com o card "Despesas do Mês" (a terceira coluna).

Reaproveita o mesmo grid de 3 colunas/gap 24px (`grid-cols-3 gap-6`) já usado em `dashboard-summary.tsx`, com o item esquerdo em `col-span-2` e o direito em `col-span-1`.

**Esta feature entrega apenas o placeholder dos dois componentes** (título de cada bloco + um espaço reservado no lugar do conteúdo) — o conteúdo real de cada item (lista de transações recentes à esquerda, resumo de categorias à direita, ambos visíveis no Figma) fica para uma feature futura.

## Users

Usuários autenticados vendo a tela `/dashboard` — por enquanto, apenas o layout/esqueleto da seção, sem dado real.

## Acceptance Criteria

* [ ] A tela `/dashboard` exibe uma nova seção logo abaixo do `DashboardSummary`
* [ ] A seção usa grid de 3 colunas com gap 24px, mesmo padrão do `DashboardSummary`
* [ ] Item esquerdo ocupa 2 colunas (`col-span-2`), alinhado sob "Saldo Total" + "Receitas do Mês"
* [ ] Item direito ocupa 1 coluna (`col-span-1`), alinhado sob "Despesas do Mês"
* [ ] Cada item é um componente próprio (para receber o conteúdo real depois), renderizando por enquanto apenas placeholder (título do bloco + estado vazio/"em construção")

## Out of Scope

- Conteúdo real do item esquerdo (lista de transações recentes, link "Ver todas") — feature futura
- Conteúdo real do item direito (resumo de categorias, link "Gerenciar") — feature futura
- Responsivo/mobile da seção
- Loading/error state (não há dado real ainda nesta feature)
