# PM-005 Frontend Tasks


## Phase 1: Alinhar componentes existentes e preparar a prévia

- [x] F-001: Verificar `src/components/ui/input.tsx` contra o Figma (Style Guide → Componentes → Input): confirmar visualmente os 6 estados (vazio, ativo, preenchido, erro via `aria-invalid`, desabilitado) batem com o protótipo. Ajustar classes Tailwind inline no arquivo apenas se houver divergência real encontrada durante a Fase 4 (prévia visual) — não são esperadas mudanças estruturais.
- [x] F-002: Verificar `src/components/ui/button.tsx` contra o Figma (Style Guide → Componentes → Label Button): confirmar visualmente Md/Sm × Default/Hover/Disabled batem com o protótipo. Mesmo critério de ajuste da F-001.
- [x] F-003: Criar `src/components/components-preview.tsx` (`ComponentsPreview`, sem props) com a estrutura de seções vazias (títulos: Input, Button, Select, IconButton, Link, Pagination, Tag, TransactionTypeIndicator) — o conteúdo de cada seção é preenchido nas fases seguintes, à medida que cada componente é criado.

## Phase 2: Select, IconButton, Link

- [x] F-004: Gerar `src/components/ui/select.tsx` via `pnpm dlx shadcn@latest add select` (ou porte manual dos primitivos `Select.*` de `radix-ui` seguindo a convenção `data-slot` + `cn()` já usada em `label.tsx`, caso a CLI não esteja disponível no ambiente de execução).
- [x] F-005: Testes para `Select` em `src/components/ui/__tests__/select.test.tsx`: renderiza placeholder quando vazio; abre a lista de opções ao clicar no trigger; seleciona uma opção e reflete no trigger; não abre quando `disabled`.
- [x] F-006: Criar `src/components/ui/icon-button.tsx` (`IconButton`, props conforme blueprint acima) — wrapper de `Button` forçando `size` a um dos variantes `icon*`, `icon` renderizado como filho, `aria-label` obrigatório no tipo.
- [x] F-007: Testes para `IconButton` em `src/components/ui/__tests__/icon-button.test.tsx`: renderiza o ícone passado; aplica o `aria-label` recebido; fica `disabled` quando a prop é passada; erro de tipo (não em runtime) se `aria-label` for omitido — validar isso como comentário no teste, já que TS pega em compile-time.
- [x] F-008: Criar `src/components/ui/link.tsx` (`Link`, props conforme blueprint acima) — renderiza `<a>` reaproveitando `buttonVariants({ variant: "link", size, className })`.
- [x] F-009: Testes para `Link` em `src/components/ui/__tests__/link.test.tsx`: renderiza como `<a>` com o `href` recebido; aplica as classes de `buttonVariants({variant: "link"})`; repassa `target`/`rel` quando fornecidos.
- [x] F-010: Preencher as seções "Select", "Icon Button" e "Link" em `src/components/components-preview.tsx` com os estados de cada um (Select: vazio/aberto/selecionado/desabilitado; IconButton: default/disabled com um ícone de exemplo do `lucide-react`; Link: default, e um exemplo com `target="_blank"`).

## Phase 3: Pagination, Tag, TransactionTypeIndicator

- [x] F-011: Criar `src/components/ui/pagination.tsx` (`Pagination`, props conforme blueprint acima) — usa `IconButton` para prev/next (`ChevronLeft`/`ChevronRight` do `lucide-react`) e `Button` (`variant="default"` na página atual, `variant="ghost"` nas demais) para os números 1..`totalPages`.
- [x] F-012: Testes para `Pagination` em `src/components/ui/__tests__/pagination.test.tsx`: renderiza um botão por página; chama `onPageChange` com o número correto ao clicar; desabilita "anterior" quando `page === 1`; desabilita "próximo" quando `page === totalPages`; desabilita tudo quando `disabled` é `true`; marca a página atual com `variant="default"`.
- [x] F-013: Criar `src/components/ui/tag.tsx` (`Tag`, props conforme blueprint acima) — mapeia `color` para as classes `bg-{color}-light text-{color}-dark` já existentes em `src/index.css`.
- [x] F-014: Testes para `Tag` em `src/components/ui/__tests__/tag.test.tsx`: renderiza o texto filho; aplica as classes corretas para cada uma das 7 cores; aplica o tamanho correto (`sm`/`md`); usa `color="blue"` e `size="md"` como default quando omitidos.
- [x] F-015: Criar `src/components/transaction-type-indicator.tsx` (`TransactionTypeIndicator`, props conforme blueprint acima) — ícone `CircleArrowUp`/`text-success` para `type="income"`, `CircleArrowDown`/`text-destructive` para `type="expense"`, label "Entrada"/"Saída" respectivamente.
- [x] F-016: Testes para `TransactionTypeIndicator` em `src/components/__tests__/transaction-type-indicator.test.tsx`: renderiza "Entrada" com o ícone e a cor corretos para `type="income"`; renderiza "Saída" com o ícone e a cor corretos para `type="expense"`.
- [x] F-017: Preencher as seções "Pagination", "Tag" e "TransactionTypeIndicator" em `src/components/components-preview.tsx` com os estados de cada um (Pagination: controle interativo com `useState` local; Tag: grid com as 7 cores × 2 tamanhos; TransactionTypeIndicator: os dois tipos lado a lado).

## Phase 4: Integração da prévia e verificação final

- [x] F-018: Montar `<ComponentsPreview />` em `src/App.tsx`, como uma nova seção abaixo do conteúdo existente (exemplo GraphQL + formulário), sob um heading `Prévia de Componentes (temporário)` — não remove nem altera o conteúdo já existente no arquivo.
- [x] F-019: Rodar `pnpm build`, `pnpm lint` e `pnpm test` — todos devem passar. Revisar visualmente `pnpm dev` com a prévia montada contra os frames do Figma (Style Guide → Componentes) e aplicar qualquer ajuste fino de classe Tailwind encontrado (incluindo eventuais ajustes pendentes de F-001/F-002).
