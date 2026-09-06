# Dev Container Setup

This project includes a dev container configuration for consistent development environments.

## Requirements

- Docker Desktop (or Docker Engine + Docker Compose)
- VS Code with "Dev Containers" extension
- OR: Any editor/IDE that supports dev containers

## Quick Start

### VS Code

1. Install the "Dev Containers" extension
2. Open the project folder in VS Code
3. Press `Cmd/Ctrl + Shift + P` and run: **Dev Containers: Reopen in Container**
4. Wait for the container to build and dependencies to install

### Command Line

```bash
# Build and run the container
docker compose -f .devcontainer/docker-compose.yml up -d

# Access the container
docker exec -it financy-web-dev bash
```

## What's Included

- **Node.js 22**
- **pnpm** — via corepack
- **TypeScript** — full type checking support
- **Git** + **GitHub CLI (`gh`)**
- **Python 3** — required by the `.claude/skills/commit` script
- **Claude Code CLI** — pre-installed globally

## Available Commands

```bash
pnpm dev         # Start Vite dev server (http://localhost:5173)
pnpm build       # Type-check and build for production
pnpm lint        # Lint with oxlint
pnpm preview     # Serve the production build locally
pnpm test        # Run Vitest unit/component tests
pnpm test:watch  # Vitest in watch mode
```

## GraphQL API (server)

This container only runs the `app` (frontend) service — it does not run the sibling `../server` GraphQL API. Start that separately (either on the host or in its own dev container, see `../server/.devcontainer`) and point `VITE_BACKEND_URL` at it in `.env`.

If the API is running on the host and this container can't reach `localhost:4000`, use `host.docker.internal` instead of `localhost` in `VITE_BACKEND_URL` (common on native Linux Docker Engine — Docker Desktop resolves this automatically).

## Port Forwarding

- **5173** — Vite dev server (auto-forwarded to host)

## SSH & Git Config

SSH keys, `.gitconfig`, `.git-credentials`, and `~/.claude` are mounted from your host machine so Git, GitHub, and Claude Code work the same as outside the container.

## Troubleshooting

**Container won't start?**

```bash
docker system prune -a  # Clean up old images
```

**Dependencies not installing?**

```bash
# Rebuild without cache
docker build --no-cache -f .devcontainer/Dockerfile -t financy-web-dev .
```

**Need to reset everything?**

```bash
docker compose -f .devcontainer/docker-compose.yml down -v
```
