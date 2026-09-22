# DeployPilot System Design Specification
**Date:** September 22, 2026  
**Status:** Approved  
**Topic:** DeployPilot Platform-as-a-Service for AI Coding Agents and Humans  

---

## 1. Executive Summary & Vision
DeployPilot is a zero-configuration Platform-as-a-Service (PaaS) designed specifically for the era of AI coding agents (Claude Code, Cursor, Windsurf, Codex) and solo developers. With zero Dockerfiles, zero CI/CD YAML files, and zero manual cloud consoles, DeployPilot inspects the source code, deterministically infers the required runtime, commands, ports, and databases (citing the exact file for every decision), builds and isolates a container, automatically provisions PostgreSQL when needed, and serves the application behind a local reverse proxy with scale-to-zero capabilities.

DeployPilot exposes two primary interfaces:
1. **Agent-First Interface**: An official Model Context Protocol (MCP) server and `agent.md` autonomous instruction set, allowing coding agents to analyze, deploy, inspect logs, and self-heal without a human relay.
2. **Human Management Console & Marketing Hub**: A Next.js 15 web application featuring the marketing site, interactive App Spec playground, documentation, radically honest limitations, and an intuitive dashboard with live logs, secrets, and instant rollbacks.

---

## 2. Architecture & Monorepo Structure
DeployPilot is organized as a unified TypeScript monorepo using npm workspaces:

```
DeployPilot/
├── package.json                 # Workspace root (scripts: dev, build, test, mcp)
├── agent.md                     # Agent autonomous instructions
├── docs/                        # Specifications and documentation
├── packages/
│   ├── types/                   # @deploypilot/types (Shared canonical interfaces)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/index.ts
│   │
│   ├── engine/                  # @deploypilot/engine (Deterministic AST & manifest analyzer)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── analyzer.ts
│   │   │   ├── parsers/
│   │   │   │   ├── node.ts
│   │   │   │   └── python.ts
│   │   │   ├── hazards.ts
│   │   │   └── dockerfile.ts
│   │   └── test/
│   │
│   └── mcp/                     # @deploypilot/mcp (Model Context Protocol server)
│       ├── package.json
│       ├── tsconfig.json
│       ├── bin/deploypilot-mcp.ts
│       └── src/
│           ├── index.ts
│           └── tools/
│
└── apps/
    ├── control-plane/           # @deploypilot/control-plane (Docker orchestration daemon)
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts
    │       ├── server.ts
    │       ├── orchestrator/
    │       ├── postgres/
    │       ├── proxy/
    │       └── store/
    │
    └── web/                     # @deploypilot/web (Next.js 15 + Tailwind CSS)
        ├── package.json
        ├── tsconfig.json
        ├── next.config.ts
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx         # Landing page + live App Spec sandbox
        │   ├── pricing/page.tsx # Plan matrix & limits FAQ
        │   ├── limitations/page.tsx # Transparent "Where It Stops" constraints
        │   ├── compare/page.tsx # Sourced competitor comparisons
        │   ├── docs/page.tsx    # Technical guides & MCP setup
        │   ├── api/agent-md/route.ts # Serves agent.md
        │   └── dashboard/       # Human management console
        └── components/
```

---

## 3. Component Specifications

### 3.1 Shared Types (`@deploypilot/types`)
Defines canonical schemas:
- `AppSpec`: Inferred runtime, version, framework, build/start commands, port, database needs, citations, and hazards.
- `Hazard`: Severity (`warning`, `danger`), rule ID (`ephemeral-disk-write`, `missing-env-var`, `unsupported-service`), description, and file citation.
- `Deployment`: Deployment ID, app name, status (`QUEUED`, `ANALYZING`, `PROVISIONING`, `BUILDING`, `STARTING`, `HEALTHY`, `FAILED`, `CRASHED`), container image tag, port, database binding, created timestamp.
- `AppRecord`: ID, name, repo path, active deployment ID, live URL, created/updated timestamps.

### 3.2 Code Analysis Engine (`@deploypilot/engine`)
- **Deterministic Node.js Parser**: Inspects `package.json`, lockfiles, and `tsconfig.json`. Detects scripts (`build`, `start`), framework presets (Next.js, Express, Fastify, Nest, Vite), port conventions, and postgres dependencies (`pg`, `@prisma/client`, `drizzle-orm`, `typeorm`).
- **Deterministic Python Parser**: Inspects `requirements.txt`, `pyproject.toml`, and `Pipfile`. Detects frameworks (FastAPI, Flask, Django), entrypoints (`uvicorn main:app`, `python app.py`), default ports, and postgres packages (`psycopg2`, `asyncpg`, `sqlalchemy`).
- **Hazard Scanner**:
  - Detects ephemeral disk writes (e.g. `fs.writeFileSync`, `open(..., 'w')`, local SQLite usage).
  - Detects referenced `process.env` / `os.environ` keys not present in `.env.example`.
  - Flags unsupported services (Redis, MongoDB, Kafka, Celery) where user must bring their own credentials.
- **Synthetic Container Builder**: Emits optimized multi-stage Docker build files targeting slim distributions (`node:22-bookworm-slim`, `python:3.12-slim`), non-root execution, caching, and health check definitions. Respects existing `Dockerfile` if present.

### 3.3 MCP Server (`@deploypilot/mcp`)
Implements the Model Context Protocol over stdio for direct agent integration:
- `analyze_repository(path)`: Returns parsed `AppSpec` with exact file citations and hazards.
- `deploy_app(path, app_name, env_vars)`: Triggers build & provisioning, returns deployment status and live URL.
- `get_deployment_status(deployment_id)`: Returns current status, container ID, and health check logs.
- `get_deployment_logs(deployment_id, limit)`: Returns recent build and container stdout/stderr.
- `rollback_app(app_name, target_deployment_id)`: Reverts app immediately to a prior release.
- `list_apps()`: Returns all active apps and endpoints.

### 3.4 Control Plane & Orchestrator (`@deploypilot/control-plane`)
- **Docker Orchestrator**: Interacts with local Docker daemon to build images (`deploypilot/<app>:<deployId>`), run isolated containers on `deploypilot-net`, assign dynamic host ports, and monitor health.
- **Postgres Provisioner**: If `needsPostgres: true`, auto-spins a shared `deploypilot-postgres` container, executes dynamic database provisioning (`CREATE DATABASE "deploypilot_<app>";`), and auto-injects `DATABASE_URL`.
- **Local Ingress Reverse Proxy**: Handles subdomain (`<app>.localhost`) and path (`/live/<app>`) routing, buffer-queues requests during cold starts, and wakes sleeping containers.
- **Log Ring-Buffer & WebSockets**: Captures and broadcasts stdout/stderr streams to connected clients.

### 3.5 Web Application & Console (`@deploypilot/web`)
- **Marketing Landing Page**: Hero, live interactive App Spec playground with real-time parser visualization, architectural flow, and feature breakdown.
- **Limitations Page**: Prominently highlights non-goals (1 instance per app, Postgres only, ephemeral disk, no branch preview URLs, limited cron, no free custom domain).
- **Pricing & FAQ**: Full plan matrix (Free, Pro, Enterprise) with transparent limit descriptions.
- **Competitor Comparisons**: Detailed breakdowns vs Vercel, Railway, Render, Heroku, and Cloudflare.
- **Documentation**: Zero-config guide, agent MCP setup, and troubleshooting.
- **Console Dashboard (`/dashboard`)**:
  - Application cards with live URLs and container statuses.
  - App detail view with embedded live preview iframe, real-time log terminal, App Spec inspector, environment variable editor, and rollback triggers.
  - Local folder drag-and-drop uploader.

---

## 4. Verification & Testing Strategy
1. **Engine Unit Tests**: Test fixtures for sample Node.js (Next.js, Express) and Python (FastAPI, Flask) projects, asserting deterministic citations, port inference, and hazard flagging.
2. **MCP Tool Tests**: Verify that `analyze_repository` and `list_apps` return valid schemas over JSON-RPC.
3. **Control Plane API Tests**: Verify health check endpoints, app creation, and deploy status state transitions.
4. **End-to-End Build & Run**: Test deploying a sample web app, verifying live container response and log capture.
