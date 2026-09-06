## Phase 3: Pagination, Tag, TransactionTypeIndicator

- [x] T-014: `Pagination` renderiza um botão para cada página de 1 a `totalPages`
- [x] T-015: `Pagination` chama `onPageChange` com o número correto ao clicar em uma página
- [x] T-016: `Pagination` desabilita o botão "anterior" quando `page === 1`
- [x] T-017: `Pagination` desabilita o botão "próximo" quando `page === totalPages`
- [x] T-018: `Pagination` desabilita todos os controles quando `disabled` é `true`
- [x] T-019: `Pagination` marca a página atual com `variant="default"` e as demais com `variant="ghost"`
- [x] T-020: `Tag` renderiza o texto filho passado
- [x] T-021: `Tag` aplica as classes de background/texto corretas para cada uma das 7 cores
- [x] T-022: `Tag` aplica o tamanho correto (`sm`/`md`) e usa `color="blue"`/`size="md"` como default
- [x] T-023: `TransactionTypeIndicator` renderiza "Entrada" com ícone `CircleArrowUp` e classe `text-success` para `type="income"`
- [x] T-024: `TransactionTypeIndicator` renderiza "Saída" com ícone `CircleArrowDown` e classe `text-destructive` para `type="expense"`

