# cadastro-de-categorias - PM-010

## Design

Figma:
- Tela (header da página "Categorias"): https://www.figma.com/design/ZF0QlJlYLMEUz6DH93SwbK/Financy--Community-?node-id=3104-2181&t=knFQQPqdFUndj2pA-0
- Modal "Nova categoria": https://www.figma.com/design/ZF0QlJlYLMEUz6DH93SwbK/Financy--Community-?node-id=3107-4607&t=knFQQPqdFUndj2pA-0

## Description

Fluxo de criação de categorias na tela `/categorias` (hoje um placeholder "Categorias em breve", criado no PM-009): um cabeçalho de página ("Categorias" + subtítulo + botão "Nova categoria") que abre um modal com um formulário (título, descrição opcional, seletor de ícone e seletor de cor) para cadastrar uma nova categoria, via a mutation `createCategory` já implementada no servidor (`../server/src/modules/category`).

## Users

Usuários autenticados organizando suas transações por categoria

## Acceptance Criteria

* [ ] A tela `/categorias` exibe o cabeçalho: título "Categorias", subtítulo "Organize suas transações por categorias" e botão "+ Nova categoria"
* [ ] Clicar em "Nova categoria" abre um modal com o formulário de criação
* [ ] O modal exibe: título "Nova categoria", subtítulo, botão de fechar, campo "Título" (obrigatório), campo "Descrição" (opcional), um seletor de ícone (grade de opções, seleção única) e um seletor de cor (paleta de opções, seleção única)
* [ ] Submeter o formulário sem "Título" exibe erro de validação e não envia a mutation
* [ ] Submeter o formulário válido chama a mutation `createCategory` do servidor com `{ title, description, icon, color }`
* [ ] Em caso de sucesso: feedback de sucesso ao usuário e o modal fecha
* [ ] Em caso de erro do servidor: mensagem de erro exibida, modal permanece aberto com os dados preenchidos

## Out of Scope

- Listagem/exibição das categorias já cadastradas na tela `/categorias` (fica como placeholder/futuro; esta feature cobre apenas o cabeçalho + criação)
- Edição e exclusão de categorias (mutations `updateCategory`/`deleteCategory` já existem no servidor, mas ficam para uma feature futura)
- Uso de categorias em outras telas (ex. seletor de categoria ao criar uma transação)
