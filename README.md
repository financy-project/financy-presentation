# Financy

Financy é uma aplicação de finanças pessoais que permite a usuários autenticados controlar suas categorias e transações financeiras.

Este repositório reúne os dois projetos que compõem a aplicação:

| Projeto | Descrição | Stack |
| --- | --- | --- |
| [`backend/`](backend/README.md) | API GraphQL | Apollo Server + TypeGraphQL, Prisma, PostgreSQL |
| [`frontend/`](frontend/README.md) | Aplicação web | React 19, Vite, Apollo Client, Tailwind CSS + shadcn/ui |

## Estrutura

```
financy-presentation/
├── backend/     # API GraphQL (ver backend/README.md)
└── frontend/    # SPA React (ver frontend/README.md)
```

Cada projeto é independente (dependências, testes e build próprios) e possui seu próprio `README.md` e `CLAUDE.md` com o guia operacional detalhado.

## Rodando o projeto completo

```bash
# Backend
cd backend
pnpm install
pnpm dev                # sobe Postgres via Docker + Apollo Server em http://localhost:4000

# Frontend (em outro terminal)
cd frontend
pnpm install
cp .env.example .env    # ajuste VITE_BACKEND_URL se necessário
pnpm dev                # http://localhost:5173
```

## Metodologia

O backend segue **Function-First DDD** e **Spec Driven Development** — cada funcionalidade nasce de uma especificação em [`backend/docs/features/`](backend/docs/features) antes de qualquer código. Veja [`backend/constitution.md`](backend/constitution.md) para os princípios de arquitetura.
