# create-transaction - PM-014

## Design

Referência: screenshots fornecidos pelo usuário (sem link do Figma ainda) — `.workspace/image copy 2.png` (cabeçalho da tela `/transacoes`), `.workspace/image copy 3.png` (modal "Nova transação"), `.workspace/image copy 4.png` (comportamento genérico do `Select`/dropdown já existente em `src/components/ui/select.tsx`).

## Description

Adiciona o fluxo de criação de transações: o cabeçalho da tela `/transacoes` (título + subtítulo + botão "Nova transação") e o modal de criação, com tipo (despesa/receita), descrição, data, valor e categoria.

## Users

Usuários autenticados registrando uma nova transação financeira

## Acceptance Criteria

* [ ] A tela `/transacoes` exibe um cabeçalho com título "Transações", subtítulo "Gerencie todas as suas transações financeiras" e botão primário "+ Nova transação" (`image copy 2.png`)
* [ ] Esse cabeçalho (título + subtítulo + botão de ação) é extraído para um componente compartilhado reutilizado tanto em `/categorias` quanto em `/transacoes` — hoje esse mesmo layout está hardcoded em `categories-page.tsx` (título "Categorias" / subtítulo "Organize suas transações por categorias" / botão "+ Nova categoria")
* [ ] O botão "+ Nova transação" abre um modal "Nova transação" com subtítulo "Registre sua despesa ou receita" e botão de fechar (X) (`image copy 3.png`)
* [ ] O modal tem um toggle de tipo com duas opções lado a lado: "Despesa" (ícone seta para baixo, cor destrutiva/vermelha quando selecionada) e "Receita" (ícone seta para cima) — mapeia para `TransactionKind.EXPENSE`/`TransactionKind.INCOME` no servidor
* [ ] Campo "Descrição": texto livre, placeholder "Ex. Almoço no restaurante" (mapeia para `CreateTransactionInput.description`)
* [ ] Campos "Data" e "Valor" lado a lado: Data com placeholder "Selecione" (mapeia para `CreateTransactionInput.date`); Valor com prefixo "R$" e placeholder "0,00" (mapeia para `CreateTransactionInput.value`, `Int` em centavos no servidor — confirmar formatação/máscara em `/feature-plan`)
* [ ] Campo "Categoria": dropdown (`Select` já existente em `src/components/ui/select.tsx`) com placeholder "Selecione", populado a partir de `listCategories`, mapeia para `CreateTransactionInput.categoryId`
* [ ] A query usada para popular o dropdown de categoria busca **apenas `id` e `title`** de cada categoria (não o objeto completo com `description`/`icon`/`color`/`transactionsQuantity` retornado por `listCategories` na tela `/categorias`) — decisão confirmada com o usuário (2026-09-04)
* [ ] Botão "Salvar" (largura total, cor primária) submete o formulário e cria a transação via `createTransaction`

## Out of Scope

- Edição e exclusão de transações (fica para uma feature futura)
- A listagem/grade de transações da tela `/transacoes` em si (fica para uma feature futura — esta feature cobre o cabeçalho + o modal de criação)
- Paginação/filtros de `listTransactions` (a mutation `createTransaction` já é suficiente para este escopo)

## Notas técnicas (servidor já implementado, ver `../server`)

- `createTransaction(input: CreateTransactionInput): TransactionType` já existe — `type: TransactionKind`, `description: string`, `date: Date`, `value: Int` (positivo, `Min(1)`), `categoryId: ID`
- `TransactionKind` enum: `EXPENSE` | `INCOME`
- Nomenclatura divergente já existente no app: `TransactionTypeIndicator` (`src/components/transaction-type-indicator.tsx`) rotula os mesmos dois tipos como "Entrada"/"Saída", enquanto este modal (Figma) usa "Receita"/"Despesa" — confirmar em `/feature-plan` se os rótulos devem ser unificados
