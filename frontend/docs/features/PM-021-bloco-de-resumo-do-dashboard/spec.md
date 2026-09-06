# Bloco de Resumo do Dashboard - PM-021

## Design

Referência visual: `.workspace/image copy 8.png` (sem link do Figma fornecido para esta feature).

## Description

Adiciona o bloco inicial da tela `/dashboard`: uma linha de 3 cards de resumo (saldo total, receitas do mês, despesas do mês), lado a lado, no topo da tela. Esta feature cobre **apenas esse bloco de cards** — o restante do conteúdo do dashboard (transações recentes, saldo por categoria, gráficos) fica fora de escopo.

Os valores vêm da query `dashboard` já existente no backend (`../server/src/modules/dashboard`), campo `movement`:
- `movement.totalBalance` → card "Saldo Total"
- `movement.income` → card "Receitas do Mês"
- `movement.expense` → card "Despesas do Mês"

Os 3 valores são `Int` (centavos) e já vêm calculados para o mês corrente (`getCurrentMonthRange`) — `totalBalance` é `income - expense` do mês, não um saldo histórico acumulado.

## Users

Usuários autenticados revisando um panorama rápido das suas finanças ao abrir o dashboard.

## Acceptance Criteria

* [ ] A tela `/dashboard` exibe 3 cards de resumo lado a lado, no topo da tela
* [ ] Card 1 — "Saldo Total": ícone `Wallet` (lucide-react) em `purple-base`, valor de `movement.totalBalance`
* [ ] Card 2 — "Receitas do Mês": ícone `CircleArrowUp` em `green-dark` (mesmo ícone/cor já usados em `transaction-type-indicator.tsx` para `income`), valor de `movement.income`
* [ ] Card 3 — "Despesas do Mês": ícone `CircleArrowDown` em `red-dark` (mesmo ícone/cor já usados em `transaction-type-indicator.tsx` para `expense`), valor de `movement.expense`
* [ ] Título de cada card em `gray-500` (`#6B7280`), uppercase
* [ ] Valor de cada card em `gray-800`, bold, mascarado em Real (BRL) — reaproveitar o padrão de formatação já usado em `format-transaction.ts` (`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`, valor em centavos)
* [ ] Os 3 cards são renderizados a partir do mesmo componente reutilizável, parametrizado por `mode` (`"income" | "expense" | "balance"` — ver Decisão abaixo), `title` e `value`

## Out of Scope

- Demais blocos da tela `/dashboard` (transações recentes, saldo por categoria, gráficos) — features futuras
- Período/filtro de data para os valores (sempre o mês corrente, sem seletor de intervalo, conforme já calculado pelo backend)
- Loading/error/skeleton state da query `dashboard` (detalhar em `plan.md`)
- Responsivo/mobile do bloco de cards
- Clique nos cards levar a algum lugar (apenas informativos)

## Decisão — nome da prop `mode`

Pedido original sugeria `mode: "income" | "expense" | "total"`, com nota para "pensar em algo melhor" para o terceiro valor. Decisão: usar `"balance"` em vez de `"total"`, alinhado ao nome do campo já retornado pelo backend (`movement.totalBalance`) e para não colidir semanticamente com "total de X" usado em outras telas (ex. PM-013, "Total de categorias").
