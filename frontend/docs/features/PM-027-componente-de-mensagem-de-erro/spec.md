# Componente de mensagem de erro - PM-027

## Design

Sem Figma — refactor puro, sem mudança visual. Todo o visual já existe hoje, espalhado, e permanece o mesmo.

## Description

Extrai um componente compartilhado `ErrorMessage` pro padrão de mensagem de erro repetido 11 vezes no código (`role="alert"`, `text-destructive text-sm`), hoje sempre com o pai fazendo a renderização condicional (`{error && <p role="alert" ...>{error}</p>}`).

Ocorrências atuais (todas com a mesma config visual):
- `src/modules/auth/components/login-form.tsx`
- `src/modules/auth/components/register-form.tsx`
- `src/modules/categories/components/delete-category-alert.tsx`
- `src/modules/categories/components/category-form.tsx`
- `src/modules/categories/pages/categories-page.tsx` (`mt-6` extra)
- `src/modules/dashboard/components/dashboard-categories-card.tsx`
- `src/modules/dashboard/components/recent-transactions-card.tsx`
- `src/modules/dashboard/pages/dashboard-page.tsx`
- `src/modules/transactions/components/delete-transaction-alert.tsx`
- `src/modules/transactions/components/transaction-form.tsx`
- `src/modules/transactions/components/transactions-table.tsx` (aceita `className` externo hoje)

**Contrato do componente** (definido pelo usuário): recebe `error: string | null`. Se `null`, retorna um Fragment (`<></>`) — **o próprio componente decide não renderizar nada**, o pai não faz mais `{error && ...}`, só chama `<ErrorMessage error={error} />` incondicionalmente.

## Users

Desenvolvedores do projeto (refactor interno, sem impacto pro usuário final além de manter o visual idêntico).

## Acceptance Criteria

* [ ] Novo componente `ErrorMessage` em `src/components/` (compartilhado, fora de qualquer módulo — mesmo precedente de `transaction-type-indicator.tsx`), props `{ error: string | null; className?: string }`
* [ ] `error === null` → renderiza `<></>` (Fragment vazio), sem `role="alert"` nem nenhum elemento no DOM
* [ ] `error` truthy → renderiza `<p role="alert" className="text-destructive text-sm">{error}</p>` (mais `className` extra mesclado via `cn`, quando passado)
* [ ] Todas as 11 ocorrências atuais substituídas por `<ErrorMessage error={...} />`, removendo o `{error && (...)}`/`{formError && (...)}` do pai em cada uma
* [ ] `transactions-table.tsx` (único caso com `className` externo hoje, `mt-6` em `categories-page.tsx`) preserva o className extra via a prop `className` do novo componente
* [ ] Nenhuma mudança de comportamento visual — mesmo texto, mesma classe, mesmo `role="alert"`, só muda onde a decisão de renderizar mora

## Out of Scope

- Mudar o visual/estilo da mensagem de erro (é puramente extrair o padrão já existente)
- Padronizar outras mensagens não-erro que usam `role="alert"` de forma diferente (não encontrada nenhuma neste levantamento — todas as 11 ocorrências já usam a mesma config)
- Criar um componente genérico de "mensagem" (sucesso, aviso, etc.) — só erro, que é o que existe hoje
