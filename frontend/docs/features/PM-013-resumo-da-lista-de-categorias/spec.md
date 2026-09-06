# resumo da lista de categorias - PM-013

## Design

Figma: https://www.figma.com/design/ZF0QlJlYLMEUz6DH93SwbK/Financy--Community-?node-id=3104-2499&t=JrKK1943mkSgXy2P-0

## Description

Adiciona uma linha de 3 cards de resumo no topo da tela `/categorias` (entre o cabeçalho "Categorias" e a grade de cards, feita no PM-011): total de categorias, total de transações, e a categoria mais utilizada.

## Users

Usuários autenticados revisando um panorama rápido de suas categorias

## Acceptance Criteria

* [ ] A tela `/categorias` exibe 3 cards de resumo lado a lado, acima da grade de categorias
* [ ] Card 1: número total de categorias cadastradas + rótulo "Total de categorias" (ícone de tag)
* [ ] Card 2: soma de `transactionsQuantity` de todas as categorias + rótulo "Total de transações" (ícone de setas ↕)
* [ ] Card 3: nome e ícone da categoria com mais transações + rótulo "Categoria mais utilizada" — o ícone (sem fundo colorido, diferente do card de categoria do PM-011) é tingido na cor da própria categoria (`category.color`), igual aos ícones dos cards 1/2, que usam cor fixa (gray-700 e purple-base respectivamente)
* [ ] Card 3, quando não há nenhuma categoria com transações, mostra a categoria criada mais recentemente (última retornada por `listCategories`, que já vem ordenada por `createdAt asc`) com o rótulo "Categoria mais recente" em vez de "Categoria mais utilizada"

## Out of Scope

- Período/filtro de data para os totais (sempre totais gerais, sem seletor de intervalo)
- Clique nos cards levar a algum lugar (são apenas informativos, sem navegação/interação além de exibir o dado)
- Empate na "categoria mais utilizada" (comportamento ao empatar fica a critério da implementação, não especificado no Figma)

## Decisão — total de transações

O Figma mostra "27" como total de transações do usuário. `listTransactions` não expõe um `totalCount` no servidor — decisão (2026-09-04): calcular no cliente como o **somatório de `transactionsQuantity` de todas as categorias** retornadas por `listCategories` (já disponível via `useListCategories`, PM-011). Sem nova dependência de servidor. Nota: isso conta apenas transações categorizadas — transações sem categoria não entram no total (comportamento aceito, não é um problema a resolver aqui).
