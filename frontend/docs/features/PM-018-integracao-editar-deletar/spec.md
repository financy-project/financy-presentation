# integracao-editar-deletar - PM-018

## Description

Liga os botões de ação "Editar" e "Excluir" já presentes (mas sem `onClick`) em cada linha de `transactions-table.tsx`: "Editar" abre um modal de edição de transação e "Excluir" abre um modal de confirmação de exclusão. O modal de edição **reaproveita o mesmo `TransactionForm`** usado pelo `NewTransactionDialog` (PM-014) — sem recriar formulário/campos do zero — apenas passando valores iniciais (a transação selecionada) e trocando a chamada de `createTransaction` por `updateTransaction`.

## Users

Usuários autenticados gerenciando (corrigindo ou removendo) transações já cadastradas na tela `/transacoes`

## Acceptance Criteria

* [ ] Clicar no ícone "Editar" (`SquarePen`) de uma linha da tabela abre um modal "Editar transação", reaproveitando o `TransactionForm` (`src/modules/transactions/components/transaction-form.tsx`) já usado por `NewTransactionDialog` — não recriar campos/validação/layout do formulário
* [ ] Para reaproveitar o `TransactionForm` em modo edição, ele passa a aceitar valores iniciais (tipo, descrição, data, valor, categoria) pré-preenchidos com os dados da transação clicada, em vez de sempre partir dos defaults de criação
* [ ] O botão de submit do modal de edição chama `updateTransaction(id, input)` (mutation já existente no servidor, `../server/src/modules/transaction/resolvers/transaction.resolver.ts`) em vez de `createTransaction` — `UpdateTransactionInput` tem todos os campos opcionais (partial update), mas o form sempre envia os 5 campos preenchidos
* [ ] Ao salvar a edição com sucesso: fecha o modal, mostra toast de sucesso e atualiza a lista (mesmo padrão de `useCreateTransaction`: `refetchQueries`/atualização do cache de `LIST_TRANSACTIONS`)
* [ ] Erros de validação do servidor no modal de edição são exibidos nos mesmos campos do `TransactionForm` (reaproveitando `fieldErrors`/`formError`, mesmo padrão de `useCreateTransaction`)
* [ ] Clicar no ícone "Excluir" (`Trash`) de uma linha da tabela abre um modal de confirmação de exclusão (título/mensagem confirmando a intenção, botão destrutivo "Excluir" e botão "Cancelar")
* [ ] Confirmar a exclusão chama `deleteTransaction(id)` (mutation já existente no servidor); ao concluir com sucesso, fecha o modal, mostra toast de sucesso e atualiza a lista de transações
* [ ] Cancelar em qualquer um dos dois modais (ou fechar pelo X/clique fora) não realiza nenhuma alteração
* [ ] Estado de carregamento: os botões "Salvar"/"Excluir" ficam desabilitados e indicam loading enquanto a mutation está em andamento (mesmo padrão já usado em `TransactionForm`/`NewTransactionDialog`)

## Out of Scope

- Edição/exclusão em lote (múltiplas transações selecionadas de uma vez)
- Alterações no modal de criação de transação além do necessário para compartilhar o `TransactionForm` (ex: novos campos)
- Alterações no layout/colunas da `transactions-table.tsx` além de ligar os `onClick` dos botões já existentes

## Notas técnicas (servidor já implementado, ver `../server`)

- `updateTransaction(id: ID!, input: UpdateTransactionInput!): TransactionType!` — todos os campos de `input` são opcionais (partial update); este form sempre manda os 5 preenchidos
- `deleteTransaction(id: ID!): Boolean!`
- Componentes/hooks já existentes a reaproveitar: `TransactionForm` (`components/transaction-form.tsx`), `DialogHeaderWithClose` (`src/components/dialog-header-with-close.tsx`), `Dialog`/`DialogContent` (`src/components/ui/dialog.tsx`); `useCreateTransaction` (`hooks/use-create-transaction.ts`) serve de modelo direto para o novo `useUpdateTransaction`/`useDeleteTransaction`
- Botões de ação já renderizados sem `onClick` em `transactions-table.tsx` (`IconButton` com ícones `Trash` e `SquarePen`) — só falta conectar o estado/handlers
