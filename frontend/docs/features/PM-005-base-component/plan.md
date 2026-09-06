# Base Component - PM-005 - Implementation Plan

## Definition of Ready (DoR) Blueprints

### 1. Component Blueprint

Eight components total: two existing components verified/aligned (no structural changes expected — see rationale below), six new components, plus one temporary preview surface for manual visual QA (per grill-me decision — no Storybook/router in this project yet).

#### `Input` (align — RF-001)

- **File**: `src/components/ui/input.tsx` (existing, no path change)
- **Verification, not rewrite**: the component already exposes every state the Figma catalog requires via native HTML/ARIA + the brand palette wired in `src/index.css`:
  - Empty → `placeholder:text-muted-foreground`
  - Active (focus) → `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50`
  - Filled → native value, no extra styling needed
  - Error → `aria-invalid="true"` triggers `aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20`
  - Disabled → native `disabled` triggers `disabled:opacity-50 disabled:bg-input/50`
  - "Select" state in the Figma Input block is the standalone `Select` component below (RF-003), not a mode of `Input` itself — no overlap.
- **No code change to `input.tsx`** — confirmed via the preview page (below) and existing test coverage is sufficient; if the preview surfaces a real visual mismatch against Figma, fix inline as part of F-001, not a separate task.

#### `Button` (align — RF-002)

- **File**: `src/components/ui/button.tsx` (existing, no path change)
- **Verification, not rewrite**: `buttonVariants` already has `size: "default" | "sm" | ...` (Figma's Md/Sm) crossed with native `hover:bg-primary/80` and `disabled:opacity-50 disabled:pointer-events-none` (Figma's Default/Hover/Disabled) for the `default` variant, which is what the Figma "Label Button" block documents.
- **No code change to `button.tsx`** — same rationale as `Input`. Confirmed via the preview page.

#### `Select` (new — RF-003)

- **File**: `src/components/ui/select.tsx`
- **Source**: generated via `pnpm dlx shadcn@latest add select` (matches `components.json`'s existing `style: radix-nova`, `iconLibrary: lucide` — same path `button.tsx`/`input.tsx`/`label.tsx`/`card.tsx` were added through). Do not hand-write — if the CLI is unavailable in the execution environment, hand-port the standard shadcn `select.tsx` (Radix `Select.*` primitives from the already-installed `radix-ui` package) matching this project's existing `data-slot` + `cn()` conventions.
- **Exports**: `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel` (standard shadcn composition — controlled or uncontrolled via Radix's own `value`/`onValueChange`/`defaultValue`).
- **States to render**: empty (placeholder in trigger), open (content visible with `Option 1/2/3`, matching the Figma sample), selected (chosen value shown in trigger), disabled.

#### `IconButton` (new — RF-004)

- **File**: `src/components/ui/icon-button.tsx`
- **Props type**:
  ```ts
  type IconButtonProps = React.ComponentProps<"button"> &
    Pick<VariantProps<typeof buttonVariants>, "variant"> & {
      size?: "icon-xs" | "icon-sm" | "icon" | "icon-lg"
      icon: React.ReactNode
      "aria-label": string // required, not optional — icon-only control needs an accessible name
    }
  ```
- **Composition**: thin wrapper around `Button` (`src/components/ui/button.tsx`), forcing one of the existing `icon*` size variants from `buttonVariants` — no new CSS, reuses what `Button` already has.
- **States to render**: Default/Hover (native `:hover`, already in `buttonVariants`)/Disabled (native `disabled`).

#### `Link` (new — RF-005)

- **File**: `src/components/ui/link.tsx`
- **Props type**:
  ```ts
  type LinkProps = React.ComponentProps<"a"> &
    Pick<VariantProps<typeof buttonVariants>, "size">
  ```
- **Composition**: renders a real `<a>` (not a `<button>` — needs `href`, right-click "open in new tab", correct semantics/accessibility), styled with `buttonVariants({ variant: "link", size, className })` reused from `Button` for visual consistency with the existing `variant="link"` — no separate color/underline CSS duplicated.
- **States to render**: Default/Hover (native `:hover`, inherited from the reused `link` variant classes, includes `hover:underline`).

#### `Pagination` (new — RF-006)

- **File**: `src/components/ui/pagination.tsx`
- **Props type**:
  ```ts
  type PaginationProps = {
    page: number // 1-indexed current page
    totalPages: number
    onPageChange: (page: number) => void
    disabled?: boolean
  }
  ```
- **Composition**: previous/next controls via `IconButton` (`ChevronLeft`/`ChevronRight` from `lucide-react`), one `Button` per page number (1..`totalPages`, no ellipsis truncation — out of scope, see below). Current page rendered with `variant="default"`, others `variant="ghost"`. Previous auto-disabled when `page === 1`, next auto-disabled when `page === totalPages`, both force-disabled when `disabled` is `true`.
- **States to render**: Default, Hover (native), Active (current page — `variant="default"` vs `variant="ghost"` for the rest), Disabled (boundary + explicit `disabled` prop).
- **Explicitly out of scope for this component**: page-count truncation/ellipsis for large `totalPages` — the Figma sample shows a short, fixed set of pages; add truncation in a follow-up if a real screen needs it.

#### `Tag` (new — RF-007)

- **File**: `src/components/ui/tag.tsx`
- **Props type**:
  ```ts
  type TagColor = "blue" | "purple" | "pink" | "red" | "orange" | "yellow" | "green"
  type TagProps = React.ComponentProps<"span"> & {
    color?: TagColor // default "blue"
    size?: "sm" | "md" // default "md"
  }
  ```
- **Composition**: plain `<span>`, rounded-full pill. Background/text classes are computed from the `color` prop against the `-light`/`-dark` pair already defined per color in `src/index.css` (e.g. `color="blue"` → `bg-blue-light text-blue-dark`). No new color tokens — reuses the existing palette exactly.
- **States to render**: all 7 colors × both sizes (14 static combinations — no interactive states, it's a display-only element).

#### `TransactionTypeIndicator` (new — RF-008)

- **File**: `src/components/transaction-type-indicator.tsx` (app component, not a `ui/` primitive — this is Financy-domain-specific, not a generic design-system piece the shadcn CLI would generate; follows the existing `src/components/*.tsx` convention like `contact-form.tsx`)
- **Props type**:
  ```ts
  type TransactionType = "income" | "expense"
  type TransactionTypeIndicatorProps = {
    type: TransactionType
  }
  ```
- **Composition**: `CircleArrowUp` (income) / `CircleArrowDown` (expense) from `lucide-react` — same icon names already used in the exported `Icon/circle-arrow-up.svg` / `Icon/circle-arrow-down.svg` reference assets — plus a hardcoded Portuguese label ("Entrada" / "Saída", no i18n library in this project). Income uses `text-success` (`#19ad70`), expense uses `text-destructive` (maps to `--danger`, `#ef4444`) — both already-defined semantic tokens in `src/index.css`, not the generic `green`/`red` palette entries, since this is a feedback-style indicator, not a decorative tag.
- **States to render**: `type="income"`, `type="expense"` — two static variants, no interactive states.

#### `ComponentsPreview` (temporary — supports the grill-me decision to visually QA states, not a Figma catalog item)

- **File**: `src/components/components-preview.tsx`
- **Props type**: none (`type ComponentsPreviewProps = Record<string, never>` — no props, self-contained demo data)
- **Composition**: renders every state/variant of all 8 components above in labeled sections (e.g. "Input", "Button", "Select", ...), each state visually next to its label. Owns local `useState` only for the two interactive demos (`Select`'s selected value, `Pagination`'s current page) — this state is private to the preview and irrelevant outside it.
- **Mounted from**: `src/App.tsx` — added as a new section below the existing GraphQL/form demo content (not replacing it), under a heading clearly marked `Prévia de Componentes (temporário)` so it reads as scaffolding, not a real screen.
- **States to render**: N/A (this component's job is rendering other components' states, not having states of its own).

### 2. GraphQL/API Blueprint

**Omitted:** this feature only adds presentational UI components (design-system primitives + one static domain-display component) — no GraphQL query, mutation, or REST call is involved anywhere in scope.

### 3. Form & Validation Blueprint

**Omitted:** none of the 8 components collect or validate user input as a form (`Select`/`Pagination` change a value but have no submit/validation step) — no Zod schema or `react-hook-form` wiring applies.

### 4. State Blueprint

**Omitted:** every component is either stateless (`Tag`, `Link`, `TransactionTypeIndicator`) or exposes controlled state to its caller via props (`Select` via Radix's own `value`/`onValueChange`, `Pagination` via `page`/`onPageChange`) rather than owning it internally. The only actual `useState` in this feature's scope lives in `ComponentsPreview`, and it is component-local to that temporary file — no context, no new React Query key, nothing shared across components.

## Implementation Phases

### Phase 1: Alinhar componentes existentes e preparar a prévia

- [ ] Verificar `src/components/ui/input.tsx` contra o Figma (Style Guide → Componentes → Input): confirmar visualmente os 6 estados (vazio, ativo, preenchido, erro via `aria-invalid`, desabilitado) batem com o protótipo. Ajustar classes Tailwind inline no arquivo apenas se houver divergência real encontrada durante a Fase 4 (prévia visual) — não são esperadas mudanças estruturais.
- [ ] Verificar `src/components/ui/button.tsx` contra o Figma (Style Guide → Componentes → Label Button): confirmar visualmente Md/Sm × Default/Hover/Disabled batem com o protótipo. Mesmo critério de ajuste da F-001.
- [ ] Criar `src/components/components-preview.tsx` (`ComponentsPreview`, sem props) com a estrutura de seções vazias (títulos: Input, Button, Select, IconButton, Link, Pagination, Tag, TransactionTypeIndicator) — o conteúdo de cada seção é preenchido nas fases seguintes, à medida que cada componente é criado.

### Phase 2: Select, IconButton, Link

- [ ] Gerar `src/components/ui/select.tsx` via `pnpm dlx shadcn@latest add select` (ou porte manual dos primitivos `Select.*` de `radix-ui` seguindo a convenção `data-slot` + `cn()` já usada em `label.tsx`, caso a CLI não esteja disponível no ambiente de execução).
- [ ] Testes para `Select` em `src/components/ui/__tests__/select.test.tsx`: renderiza placeholder quando vazio; abre a lista de opções ao clicar no trigger; seleciona uma opção e reflete no trigger; não abre quando `disabled`.
- [ ] Criar `src/components/ui/icon-button.tsx` (`IconButton`, props conforme blueprint acima) — wrapper de `Button` forçando `size` a um dos variantes `icon*`, `icon` renderizado como filho, `aria-label` obrigatório no tipo.
- [ ] Testes para `IconButton` em `src/components/ui/__tests__/icon-button.test.tsx`: renderiza o ícone passado; aplica o `aria-label` recebido; fica `disabled` quando a prop é passada; erro de tipo (não em runtime) se `aria-label` for omitido — validar isso como comentário no teste, já que TS pega em compile-time.
- [ ] Criar `src/components/ui/link.tsx` (`Link`, props conforme blueprint acima) — renderiza `<a>` reaproveitando `buttonVariants({ variant: "link", size, className })`.
- [ ] Testes para `Link` em `src/components/ui/__tests__/link.test.tsx`: renderiza como `<a>` com o `href` recebido; aplica as classes de `buttonVariants({variant: "link"})`; repassa `target`/`rel` quando fornecidos.
- [ ] Preencher as seções "Select", "Icon Button" e "Link" em `src/components/components-preview.tsx` com os estados de cada um (Select: vazio/aberto/selecionado/desabilitado; IconButton: default/disabled com um ícone de exemplo do `lucide-react`; Link: default, e um exemplo com `target="_blank"`).

### Phase 3: Pagination, Tag, TransactionTypeIndicator

- [ ] Criar `src/components/ui/pagination.tsx` (`Pagination`, props conforme blueprint acima) — usa `IconButton` para prev/next (`ChevronLeft`/`ChevronRight` do `lucide-react`) e `Button` (`variant="default"` na página atual, `variant="ghost"` nas demais) para os números 1..`totalPages`.
- [ ] Testes para `Pagination` em `src/components/ui/__tests__/pagination.test.tsx`: renderiza um botão por página; chama `onPageChange` com o número correto ao clicar; desabilita "anterior" quando `page === 1`; desabilita "próximo" quando `page === totalPages`; desabilita tudo quando `disabled` é `true`; marca a página atual com `variant="default"`.
- [ ] Criar `src/components/ui/tag.tsx` (`Tag`, props conforme blueprint acima) — mapeia `color` para as classes `bg-{color}-light text-{color}-dark` já existentes em `src/index.css`.
- [ ] Testes para `Tag` em `src/components/ui/__tests__/tag.test.tsx`: renderiza o texto filho; aplica as classes corretas para cada uma das 7 cores; aplica o tamanho correto (`sm`/`md`); usa `color="blue"` e `size="md"` como default quando omitidos.
- [ ] Criar `src/components/transaction-type-indicator.tsx` (`TransactionTypeIndicator`, props conforme blueprint acima) — ícone `CircleArrowUp`/`text-success` para `type="income"`, `CircleArrowDown`/`text-destructive` para `type="expense"`, label "Entrada"/"Saída" respectivamente.
- [ ] Testes para `TransactionTypeIndicator` em `src/components/__tests__/transaction-type-indicator.test.tsx`: renderiza "Entrada" com o ícone e a cor corretos para `type="income"`; renderiza "Saída" com o ícone e a cor corretos para `type="expense"`.
- [ ] Preencher as seções "Pagination", "Tag" e "TransactionTypeIndicator" em `src/components/components-preview.tsx` com os estados de cada um (Pagination: controle interativo com `useState` local; Tag: grid com as 7 cores × 2 tamanhos; TransactionTypeIndicator: os dois tipos lado a lado).

### Phase 4: Integração da prévia e verificação final

- [ ] Montar `<ComponentsPreview />` em `src/App.tsx`, como uma nova seção abaixo do conteúdo existente (exemplo GraphQL + formulário), sob um heading `Prévia de Componentes (temporário)` — não remove nem altera o conteúdo já existente no arquivo.
- [ ] Rodar `pnpm build`, `pnpm lint` e `pnpm test` — todos devem passar. Revisar visualmente `pnpm dev` com a prévia montada contra os frames do Figma (Style Guide → Componentes) e aplicar qualquer ajuste fino de classe Tailwind encontrado (incluindo eventuais ajustes pendentes de F-001/F-002).

## Test Cases

### Phase 1: Alinhar componentes existentes e preparar a prévia

- [ ] `Input` renderiza corretamente com `aria-invalid` (estado de erro) — cobertura já implícita nos testes existentes/manuais; nenhum teste novo obrigatório nesta fase além da confirmação visual.
- [ ] `Button` renderiza corretamente nos tamanhos `default`/`sm` com `disabled` — mesma observação acima.
- [ ] `ComponentsPreview` renderiza sem erros com todas as seções (mesmo vazias) presentes.

### Phase 2: Select, IconButton, Link

- [ ] `Select` renderiza o placeholder quando nenhum valor está selecionado
- [ ] `Select` abre a lista de opções ao clicar no trigger
- [ ] `Select` reflete a opção escolhida no trigger após seleção
- [ ] `Select` não abre a lista quando `disabled`
- [ ] `IconButton` renderiza o ícone recebido via prop `icon`
- [ ] `IconButton` aplica o `aria-label` recebido no elemento renderizado
- [ ] `IconButton` fica desabilitado quando `disabled` é passado
- [ ] `Link` renderiza um elemento `<a>` com o `href` recebido
- [ ] `Link` aplica as classes de `buttonVariants({ variant: "link" })`
- [ ] `Link` repassa `target`/`rel` quando fornecidos

### Phase 3: Pagination, Tag, TransactionTypeIndicator

- [ ] `Pagination` renderiza um botão para cada página de 1 a `totalPages`
- [ ] `Pagination` chama `onPageChange` com o número correto ao clicar em uma página
- [ ] `Pagination` desabilita o botão "anterior" quando `page === 1`
- [ ] `Pagination` desabilita o botão "próximo" quando `page === totalPages`
- [ ] `Pagination` desabilita todos os controles quando `disabled` é `true`
- [ ] `Pagination` marca a página atual com `variant="default"` e as demais com `variant="ghost"`
- [ ] `Tag` renderiza o texto filho passado
- [ ] `Tag` aplica as classes de background/texto corretas para cada uma das 7 cores
- [ ] `Tag` aplica o tamanho correto (`sm`/`md`) e usa `color="blue"`/`size="md"` como default
- [ ] `TransactionTypeIndicator` renderiza "Entrada" com ícone `CircleArrowUp` e classe `text-success` para `type="income"`
- [ ] `TransactionTypeIndicator` renderiza "Saída" com ícone `CircleArrowDown` e classe `text-destructive` para `type="expense"`

### Phase 4: Integração da prévia e verificação final

- [ ] `pnpm build`, `pnpm lint` e `pnpm test` passam sem erros após a integração em `App.tsx`
- [ ] Revisão visual manual confirma que todos os 8 componentes/estados batem com o Figma (Style Guide → Componentes)
