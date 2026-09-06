# Financy — Web

Frontend do Financy: React + Vite + TypeScript, GraphQL (Apollo Client), React Query, React Hook Form + Zod, Tailwind CSS + shadcn/ui.

O backend GraphQL vive em `../server` (repositório/projeto separado).

## Stack

- **React 19** + **Vite** + **TypeScript**
- **Apollo Client v4** para GraphQL
- **TanStack React Query** para estado assíncrono fora do GraphQL
- **React Hook Form** + **Zod** para formulários e validação
- **Tailwind CSS v4** + **shadcn/ui** (style `radix-nova`) para UI
- **Lucide** como biblioteca de ícones
- **pnpm** como gerenciador de pacotes

## Setup

```bash
pnpm install
cp .env.example .env   # ajuste VITE_BACKEND_URL se necessário
pnpm dev
```

## Scripts

| Comando        | Descrição                                              |
| -------------- | -------------------------------------------------------|
| `pnpm dev`     | Sobe o servidor de desenvolvimento (Vite)               |
| `pnpm build`   | Type-check (`tsc -b`) e build de produção (`vite build`)|
| `pnpm lint`    | Lint com oxlint                                         |
| `pnpm preview` | Serve o build de produção localmente                    |

## Variáveis de ambiente

| Variável            | Descrição                                  |
| ------------------- | ------------------------------------------- |
| `VITE_BACKEND_URL`  | Endpoint da API GraphQL usado pelo Apollo Client |

## Design system

O design system (cores, tipografia, ícones, logo) segue o Figma **"Financy (Community)"** (página Style Guide):

- **Fonte**: Inter (`@fontsource-variable/inter`)
- **Ícones**: Lucide (`lucide-react`) — nomes dos ícones no Figma batem com os exports do pacote
- **Logo**: `src/assets/logo.svg`
- **Cores**: paleta da marca (brand, gray, blue, purple, pink, red, orange, yellow, green) definida em `src/index.css` como CSS variables e exposta como utilities do Tailwind (`bg-blue-base`, `text-purple-dark`, etc.)

Mais detalhes de arquitetura para desenvolvimento assistido por IA estão em [`CLAUDE.md`](./CLAUDE.md).
