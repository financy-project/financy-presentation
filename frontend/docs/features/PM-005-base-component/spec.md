# Base Component - PM-005

## Descrição

Construir a biblioteca de componentes de UI base do Financy a partir do catálogo definido no Figma ("Financy (Community)" — página Style Guide, frame "Componentes"): alinhar os componentes que já existem no projeto ao padrão visual do protótipo, e criar os que ainda faltam. Essa é a base de UI reutilizável sobre a qual as telas de features futuras serão construídas.

## Usuários-alvo

- Time de desenvolvimento do Financy — consome esses componentes ao construir telas de features.

## Requisitos Funcionais (RF)

- [ ] **RF-001**: Alinhar `Input` ao protótipo - O componente `Input` já existente deve suportar visualmente os estados definidos no Figma: vazio (placeholder), ativo (foco), preenchido, erro, desabilitado. Ajustar o que estiver divergente do protótipo (cores, bordas, espaçamento).
- [ ] **RF-002**: Alinhar `Button` (Label Button) ao protótipo - O componente `Button` já existente deve suportar visualmente as variantes Md/Sm, cada uma com estado Default/Hover/Disabled, conforme o Figma. Ajustar o que estiver divergente.
- [ ] **RF-003**: Criar `Select` - Novo componente de seleção (dropdown), com lista de opções, opção selecionada destacada, e visual alinhado ao estado "Select" mostrado no bloco de Input do Figma.
- [ ] **RF-004**: Criar `IconButton` - Novo componente de botão contendo apenas um ícone (sem texto), com estados Default/Hover/Disabled conforme o Figma.
- [ ] **RF-005**: Criar `Link` - Novo componente de texto estilizado como link, com estados Default/Hover conforme o Figma.
- [ ] **RF-006**: Criar `Pagination` - Novo componente de controles de paginação, com estados Default/Hover/Active/Disabled por item, conforme o Figma.
- [ ] **RF-007**: Criar `Tag` - Novo componente de badge/etiqueta, nos tamanhos Md/Sm, suportando as cores da paleta já definida em `src/index.css` (blue, purple, pink, red, orange, yellow, green), conforme o Figma.
- [ ] **RF-008**: Criar `TransactionTypeIndicator` (ou nome equivalente a definir no `/feature-plan`) - Novo componente que indica o tipo de uma transação: "Entrada" (ícone de seta para cima, verde) ou "Saída" (ícone de seta para baixo, vermelho), conforme a seção "Type" do Figma.

## Critérios de Aceitação

- [ ] Os 6 componentes novos (RF-003 a RF-008) existem em `src/components/ui/`, renderizam e cobrem visualmente todos os estados/variantes listados no Figma para cada um.
- [ ] `Input` e `Button` (RF-001, RF-002) têm seus estados/variantes já existentes conferidos e ajustados para bater com o protótipo do Figma.
- [ ] Nenhum componente precisa estar necessariamente em uso em nenhuma tela da aplicação ainda — o critério é o componente existir e renderizar os estados corretamente (ex: via Storybook-like preview ou teste de componente), não a integração em um fluxo de usuário.
- [ ] Todos os componentes usam a paleta de cores e a fonte já configuradas em `src/index.css` (nenhuma cor hardcoded fora do design system).

## Fora de Escopo

- Integração desses componentes em telas/fluxos reais da aplicação — fica para features futuras que as consumirem.
- `Card` — já existe e já está alinhado ao uso atual; não faz parte do catálogo "Componentes" do Figma revisado nesta feature.
- Qualquer componente do Figma fora do frame "Componentes" da página Style Guide (ex: componentes específicos de telas que ainda não foram desenhadas).

## Análise de Complexidade & Segregação

- **Complexidade**: Média
- **Recomendação de Divisão**: Não é necessário dividir em specs separadas — é um lote coeso de componentes de design system, sem integrações de API ou fluxos de usuário multi-tela. O `/feature-plan` pode organizar a implementação em fases (ex: alinhar existentes primeiro, depois criar os novos) dentro deste mesmo `plan.md`.
