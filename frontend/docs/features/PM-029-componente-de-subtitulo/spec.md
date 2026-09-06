# Componente de subtítulo - PM-029

## Design

Sem Figma — refactor puro, sem mudança visual, baseado no mesmo padrão do PM-027 (`ErrorMessage`).

## Description

Extrai um componente compartilhado `Subtitle` pro texto de subtítulo repetido em `PageHeader` e `DialogHeaderWithClose`, hoje cada um com seu próprio `<p className="text-{sm|base} text-gray-600">{subtitle}</p>`.

Diferente do `ErrorMessage` (config idêntica em todo lugar), aqui só a **cor** (`text-gray-600`) é igual nos dois — o **tamanho** varia (`text-sm` no diálogo, `text-base` na página). Mesmo approach do `ErrorMessage`: classes base fixas + `className` mesclado via `cn` pra cobrir a diferença de tamanho.

## Users

Desenvolvedores do projeto (refactor interno, sem impacto visual pro usuário final).

## Acceptance Criteria

* [ ] Novo componente `Subtitle` em `src/components/` (compartilhado, mesmo lugar de `ErrorMessage`/`transaction-type-indicator.tsx`), props `{ children: ReactNode; className?: string }`
* [ ] Classe base fixa: `text-gray-600`
* [ ] `PageHeader` usa `<Subtitle className="text-base">{subtitle}</Subtitle>` no lugar do `<p>` atual
* [ ] `DialogHeaderWithClose` usa `<Subtitle className="text-sm">{subtitle}</Subtitle>` no lugar do `<p>` atual
* [ ] Nenhuma mudança de comportamento visual — mesmo texto, mesmas classes finais

## Out of Scope

- Mudar o visual/tamanho/cor do subtítulo em qualquer tela
- Unificar `PageHeader`/`DialogHeaderWithClose` em um componente só (são estruturalmente diferentes — um tem botão de ação, outro tem botão de fechar)
