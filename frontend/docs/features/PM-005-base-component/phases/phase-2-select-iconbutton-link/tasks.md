## Phase 2: Select, IconButton, Link

- [x] F-004: Gerar `src/components/ui/select.tsx` via `pnpm dlx shadcn@latest add select` (ou porte manual dos primitivos `Select.*` de `radix-ui` seguindo a convenção `data-slot` + `cn()` já usada em `label.tsx`, caso a CLI não esteja disponível no ambiente de execução).
- [x] F-005: Testes para `Select` em `src/components/ui/__tests__/select.test.tsx`: renderiza placeholder quando vazio; abre a lista de opções ao clicar no trigger; seleciona uma opção e reflete no trigger; não abre quando `disabled`.
- [x] F-006: Criar `src/components/ui/icon-button.tsx` (`IconButton`, props conforme blueprint acima) — wrapper de `Button` forçando `size` a um dos variantes `icon*`, `icon` renderizado como filho, `aria-label` obrigatório no tipo.
- [x] F-007: Testes para `IconButton` em `src/components/ui/__tests__/icon-button.test.tsx`: renderiza o ícone passado; aplica o `aria-label` recebido; fica `disabled` quando a prop é passada; erro de tipo (não em runtime) se `aria-label` for omitido — validar isso como comentário no teste, já que TS pega em compile-time.
- [x] F-008: Criar `src/components/ui/link.tsx` (`Link`, props conforme blueprint acima) — renderiza `<a>` reaproveitando `buttonVariants({ variant: "link", size, className })`.
- [x] F-009: Testes para `Link` em `src/components/ui/__tests__/link.test.tsx`: renderiza como `<a>` com o `href` recebido; aplica as classes de `buttonVariants({variant: "link"})`; repassa `target`/`rel` quando fornecidos.
- [x] F-010: Preencher as seções "Select", "Icon Button" e "Link" em `src/components/components-preview.tsx` com os estados de cada um (Select: vazio/aberto/selecionado/desabilitado; IconButton: default/disabled com um ícone de exemplo do `lucide-react`; Link: default, e um exemplo com `target="_blank"`).

