# lista de categorias - PM-011

## Design

Figma: https://www.figma.com/design/ZF0QlJlYLMEUz6DH93SwbK/Financy--Community-?node-id=3104-2627&t=knFQQPqdFUndj2pA-0

## Description

Substitui o placeholder "Lista de categorias em breve" (criado no PM-010) por uma grade de cards na tela `/categorias`, um por categoria cadastrada: ícone colorido, título, descrição, um badge com o nome da categoria (tingido na cor da categoria) e ações de editar/excluir. Consome a query `listCategories` já existente no servidor (`../server/src/modules/category`).

## Users

Usuários autenticados revisando/gerenciando as categorias que cadastraram

## Acceptance Criteria

* [ ] A tela `/categorias` exibe uma grade de cards, um por categoria retornada por `listCategories`
* [ ] Cada card exibe: ícone da categoria (com fundo tingido na cor da categoria), título, descrição, um badge com o nome da categoria (texto e fundo na cor da categoria) e botões de editar/excluir
* [ ] Estado vazio (nenhuma categoria cadastrada): mensagem apropriada no lugar da grade
* [ ] Excluir uma categoria chama `deleteCategory` e a remove da grade em caso de sucesso
* [ ] Editar uma categoria abre um formulário pré-preenchido e chama `updateCategory` em caso de sucesso
* [ ] Cada card exibe "N itens"/"N item" (singular quando 1) com a quantidade de transações da categoria

## Out of Scope

- Busca, filtro ou ordenação customizada da lista (o servidor não oferece — `listCategories` retorna tudo, sem argumentos, ordenado por `createdAt`)
- Paginação (mesmo motivo — sem suporte no servidor; volume esperado é baixo, dezenas por usuário)
- Uso de categorias em outras telas (ex. seletor de categoria no formulário de transação)

## Server Dependency — `transactionQuantity`

O Figma mostra um contador **"N itens"** em cada card — a quantidade de transações associadas à categoria. **Isso não existe no servidor hoje** (`CategoryType` não tem campo de contagem, `listTransactions` não filtra por `categoryId`, `TransactionConnection` não expõe `totalCount`, e não há menção a isso nos docs do PM-003 no servidor).

Decisão (2026-09-03): o usuário vai implementar esse campo em `../server` (repositório separado) como **`transactionQuantity`** em `CategoryType`. Este plano assume que `listCategories` passará a retornar `CategoryType { id, title, description, icon, color, transactionQuantity }` — `transactionQuantity: number` (inteiro, contagem de transações vinculadas). Dependência externa a este repositório; acompanhar antes de implementar F-itens relacionados ao contador.
