## Phase 1: Alinhar componentes existentes e preparar a prévia

- [x] F-001: Verificar `src/components/ui/input.tsx` contra o Figma (Style Guide → Componentes → Input): confirmar visualmente os 6 estados (vazio, ativo, preenchido, erro via `aria-invalid`, desabilitado) batem com o protótipo. Ajustar classes Tailwind inline no arquivo apenas se houver divergência real encontrada durante a Fase 4 (prévia visual) — não são esperadas mudanças estruturais.
- [x] F-002: Verificar `src/components/ui/button.tsx` contra o Figma (Style Guide → Componentes → Label Button): confirmar visualmente Md/Sm × Default/Hover/Disabled batem com o protótipo. Mesmo critério de ajuste da F-001.
- [x] F-003: Criar `src/components/components-preview.tsx` (`ComponentsPreview`, sem props) com a estrutura de seções vazias (títulos: Input, Button, Select, IconButton, Link, Pagination, Tag, TransactionTypeIndicator) — o conteúdo de cada seção é preenchido nas fases seguintes, à medida que cada componente é criado.

