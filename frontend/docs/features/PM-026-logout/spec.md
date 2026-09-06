# Logout - PM-026

## Design

Sem link do Figma para esta feature. Referência visual: o avatar já existente no `Header` (`data-testid="header-avatar"`, círculo com as iniciais do usuário, canto superior direito) — hoje é só estático, sem interação.

## Description

Adiciona o fluxo de logout: ao clicar no card de avatar do `Header`, aparece uma opção "Sair". Ao confirmar, a sessão é encerrada e o usuário volta para a tela de login.

## Notas técnicas

- **Backend já pronto, sem trabalho necessário**: `../server/src/modules/auth/resolvers/auth.resolver.ts` já expõe `mutation Logout { logout }` — limpa o cookie `access_token` (`Max-Age=0`) e sempre retorna `true`, mesmo sem sessão ativa (idempotente, já coberto por `logout-describe.test.ts` no backend).
- **Frontend precisa**:
  - `LOGOUT` mutation em `src/modules/auth/graphql/mutations.ts` (mesmo padrão de `LOGIN`/`REGISTER_USER`).
  - Hook `useLogout` (`src/modules/auth/hooks/use-logout.ts`) chamando a mutation e, no sucesso, limpando o estado local.
  - `useAuthStore` (`src/modules/auth/stores/use-auth-store.ts`) só tem `setUser`, não tem como limpar o usuário — precisa de uma ação `clearUser`/`logout` (o `user` é persistido no `localStorage` via zustand `persist`, então também precisa ser limpo de lá, não só da memória).
  - Resetar o cache do Apollo Client (`client.clearStore()` ou `resetStore()`) para não vazar dado da sessão anterior em cache pro próximo usuário que logar na mesma aba/navegador.
  - Redirecionar para `/login` após o logout.
  - `Header` (`src/components/header.tsx`) precisa de uma forma de revelar a opção "Sair" ao clicar no avatar — hoje não existe nenhum componente de menu/dropdown no DS (`src/components/ui/`), só `Popover`. Decidir em `plan.md`: reaproveitar `Popover` (padrão já usado em `period-select.tsx`/`date-picker-field.tsx`) ou adicionar o primitivo `DropdownMenu` via shadcn CLI (mais correto semanticamente pra um menu de ações, mas exige instalar um componente novo).

## Users

Qualquer usuário autenticado, em qualquer tela do app (o `Header`, e portanto o avatar, aparece em todas as telas logadas).

## Acceptance Criteria

* [ ] Clicar no avatar do `Header` revela uma opção "Sair"
* [ ] Clicar em "Sair" chama a mutation `logout` do backend
* [ ] Após o logout (sucesso ou erro — a mutation é sempre `true`, mas a limpeza local deve acontecer de qualquer forma já que o cookie é `httpOnly` e não há como o front verificar seu estado), o `useAuthStore` é limpo (`user: null`, inclusive no `localStorage`)
* [ ] Após o logout, o cache do Apollo Client é resetado
* [ ] Após o logout, o usuário é redirecionado para `/login`

## Out of Scope

- Logout automático por expiração do token (sem endpoint/mecanismo de "sessão expirada" hoje)
- Qualquer outra opção no menu do avatar além de "Sair" (ex.: "Meu perfil", "Configurações") — não pedido, não há tela pra isso ainda
- Proteção de rota client-side (redirecionar automaticamente quem não está logado para `/login`) — já é uma lacuna conhecida do app (mencionada no PM-021), não é escopo desta feature
