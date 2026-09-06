# dashboard - PM-009

## Design

Figma: https://www.figma.com/design/ZF0QlJlYLMEUz6DH93SwbK/Financy--Community-?node-id=3103-2033&t=knFQQPqdFUndj2pA-4

## Description

Header de navegação exibido no topo das telas autenticadas (dashboard, transações, categorias): logo, links de navegação entre essas seções e avatar do usuário logado. Esta feature cobre **apenas o header** — o conteúdo das telas (dashboard, transações, categorias) fica fora de escopo.

## Users

Usuários autenticados navegando entre as seções principais da aplicação

## Acceptance Criteria

* [ ] Header exibe a logo Financy à esquerda
* [ ] Header exibe navegação central com os itens "Dashboard", "Transações" e "Categorias", cada um levando a uma rota real (`/dashboard`, `/transacoes`, `/categorias`)
* [ ] O item de navegação correspondente à rota atual é destacado visualmente como ativo
* [ ] Clicar em um item de navegação leva à rota correspondente
* [ ] Header exibe um avatar com as iniciais do usuário logado à direita, derivadas do nome retornado pelo login (via store de sessão)
* [ ] Após um login bem-sucedido, o usuário é redirecionado para `/dashboard` (não mais para `/`, que hoje redireciona de volta ao login)

## Out of Scope

- Conteúdo real das telas Dashboard, Transações e Categorias (apenas o header é implementado nesta feature; as 3 rotas recebem páginas placeholder só para o header funcionar de verdade)
- Menu/dropdown ao clicar no avatar
- Estado responsivo/mobile do header
- Persistir a sessão do usuário entre reloads de página (a store de usuário é apenas em memória; sobrevive à navegação SPA, mas não a um refresh — requer uma query `whoami`, já sinalizada como fora de escopo desde o PM-007)
- Rotas protegidas / redirecionamento de usuários não autenticados
