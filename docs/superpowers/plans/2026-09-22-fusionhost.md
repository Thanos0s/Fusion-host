# FusionHost Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete end-to-end FusionHost Platform-as-a-Service monorepo: deterministic Code Analysis Engine, MCP Server (`agent.md`), Docker/Postgres Control Plane & Ingress Proxy, and Next.js 15 Marketing Hub & Human Console.

**Architecture:** Monorepo using npm workspaces with shared `@fusionhost/types`. Pure deterministic `@fusionhost/engine` scans manifests and ASTs to generate `AppSpec` with exact file citations; `@fusionhost/mcp` provides stdio MCP tools for coding agents; `@fusionhost/control-plane` orchestrates local Docker 29 containers, dynamic Postgres databases, and reverse proxy; `@fusionhost/web` provides the public marketing/docs/pricing/limitations site and the human `/dashboard`.

**Tech Stack:** TypeScript, Node.js v24, Docker 29, Next.js 15 (App Router), Tailwind CSS, Lucide React, Model Context Protocol SDK (`@modelcontextprotocol/sdk`).

## Global Constraints

- Runtimes supported in v1: Node.js and Python.
- Every App Spec decision MUST cite the source file (e.g. `package.json#scripts.start`).
- Published Platform Constraints: 1 instance per app, PostgreSQL only, ephemeral disk, no branch preview environments, limited cron, no free custom domain.
- Zero configuration files added to the user's repository.
- MCP Server must support stdio transport for Claude Code, Cursor, and Windsurf.
- Working name: FusionHost.

---

### Task 1: Monorepo Root & Workspace Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `agent.md`

**Interfaces:**
- Produces: Root npm workspaces (`packages/*`, `apps/*`), unified build and test scripts.

- [ ] **Step 1: Write root workspace configuration**
Create `package.json` with npm workspaces: `"workspaces": ["packages/*", "apps/*"]` and shared development scripts.

- [ ] **Step 2: Create base TypeScript configuration**
Create `tsconfig.base.json` with strict mode, NodeNext module resolution, and path mappings.

- [ ] **Step 3: Create agent.md specification**
Create `agent.md` providing step-by-step instructions for AI coding agents to connect via MCP, analyze repository, deploy, read logs, and self-heal.

- [ ] **Step 4: Commit**
```bash
git add package.json tsconfig.base.json .gitignore agent.md
git commit -m "chore: setup monorepo root workspaces and agent.md"
```

---

### Task 2: Shared Types Package (`packages/types`)

**Files:**
- Create: `packages/types/package.json`
- Create: `packages/types/tsconfig.json`
- Create: `packages/types/src/index.ts`
- Test: `packages/types/test/types.test.ts`

**Interfaces:**
- Produces: `AppSpec`, `Hazard`, `Deployment`, `AppRecord`, `DeploymentStatus`, `DatabaseBinding`, `ServiceConfig`.

- [ ] **Step 1: Write types package.json and tsconfig**
Configure `@fusionhost/types` with TypeScript compilation.

- [ ] **Step 2: Write canonical type definitions in `src/index.ts`**
Export `AppSpec`, `Hazard`, `Deployment`, `AppRecord`, `DeployOptions`, `DeploymentStatus`.

- [ ] **Step 3: Write types verification test**
Create `packages/types/test/types.test.ts` to assert type integrity and dummy instantiations.

- [ ] **Step 4: Run test to verify**
Run: `npm --workspace=@fusionhost/types run build && node --test packages/types/test/types.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add packages/types
git commit -m "feat(types): implement canonical shared data models"
```

---

### Task 3: Deterministic Code Analysis Engine (`packages/engine`)

**Files:**
- Create: `packages/engine/package.json`
- Create: `packages/engine/tsconfig.json`
- Create: `packages/engine/src/index.ts`
- Create: `packages/engine/src/analyzer.ts`
- Create: `packages/engine/src/parsers/node.ts`
- Create: `packages/engine/src/parsers/python.ts`
- Create: `packages/engine/src/hazards.ts`
- Create: `packages/engine/src/dockerfile.ts`
- Test: `packages/engine/test/analyzer.test.ts`

**Interfaces:**
- Consumes: `@fusionhost/types`
- Produces: `analyzeProject(projectPath: string): Promise<AppSpec>`, `generateSyntheticDockerfile(spec: AppSpec): string`, `detectHazards(projectPath: string, spec: Partial<AppSpec>): Promise<Hazard[]>`.

- [ ] **Step 1: Write failing engine analyzer test with fixtures**
Create tests for:
1. Node.js project with `package.json` (Express, `pg` database, start script, port 3000 citation).
2. Python project with `requirements.txt` (FastAPI, `psycopg2`, `uvicorn` entrypoint).
3. Hazard detection (local SQLite write `db.sqlite3` warning, unconfigured Redis reference).

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test packages/engine/test/analyzer.test.ts`
Expected: FAIL (modules not implemented)

- [ ] **Step 3: Implement Node.js parser (`parsers/node.ts`)**
Reads `package.json`, lockfiles, `tsconfig.json`. Infers framework, commands, port, and postgres client (`pg`, `@prisma/client`, `drizzle-orm`) with source citations.

- [ ] **Step 4: Implement Python parser (`parsers/python.ts`)**
Reads `requirements.txt`, `pyproject.toml`, `Pipfile`. Infers framework (FastAPI, Flask, Django), entrypoint, and postgres client (`psycopg2`, `asyncpg`, `sqlalchemy`).

- [ ] **Step 5: Implement Hazard detection (`hazards.ts`)**
Detects ephemeral disk writes (`fs.writeFile`, `open(..., 'w')`, SQLite), missing `.env` variables, and unsupported external dependencies (Redis, MongoDB).

- [ ] **Step 6: Implement Synthetic Multi-Stage Dockerfile Generator (`dockerfile.ts`)**
Generates optimized non-root Dockerfile for Node.js (`node:22-bookworm-slim`) or Python (`python:3.12-slim`).

- [ ] **Step 7: Run test to verify it passes**
Run: `npm --workspace=@fusionhost/engine run test`
Expected: PASS

- [ ] **Step 8: Commit**
```bash
git add packages/engine
git commit -m "feat(engine): implement deterministic code analyzer and synthetic container builder"
```

---

### Task 4: Model Context Protocol (MCP) Server & CLI (`packages/mcp`)

**Files:**
- Create: `packages/mcp/package.json`
- Create: `packages/mcp/tsconfig.json`
- Create: `packages/mcp/src/index.ts`
- Create: `packages/mcp/src/server.ts`
- Create: `packages/mcp/bin/fusionhost-mcp.ts`
- Test: `packages/mcp/test/mcp.test.ts`

**Interfaces:**
- Consumes: `@fusionhost/engine`, `@fusionhost/types`
- Produces: MCP server exposing `analyze_repository`, `deploy_app`, `get_deployment_status`, `get_deployment_logs`, `rollback_app`, `list_apps`, and `fusionhost mcp` CLI.

- [ ] **Step 1: Write MCP server tool definitions and stdio server**
Set up `@modelcontextprotocol/sdk` with tools:
- `analyze_repository(path)`
- `deploy_app(path, app_name, env_vars)`
- `get_deployment_status(deployment_id)`
- `get_deployment_logs(deployment_id, limit)`
- `rollback_app(app_name, target_deployment_id)`
- `list_apps()`

- [ ] **Step 2: Implement CLI executable `bin/fusionhost-mcp.ts`**
Enables running `npx fusionhost-mcp` or `node ./packages/mcp/bin/fusionhost-mcp.js`.

- [ ] **Step 3: Write MCP tool test**
Call `analyze_repository` and assert valid JSON-RPC response with `AppSpec`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm --workspace=@fusionhost/mcp run test`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add packages/mcp
git commit -m "feat(mcp): implement MCP server and CLI for coding agents"
```

---

### Task 5: Control Plane API, Docker Orchestrator & Ingress Proxy (`apps/control-plane`)

**Files:**
- Create: `apps/control-plane/package.json`
- Create: `apps/control-plane/tsconfig.json`
- Create: `apps/control-plane/src/index.ts`
- Create: `apps/control-plane/src/server.ts`
- Create: `apps/control-plane/src/orchestrator/docker.ts`
- Create: `apps/control-plane/src/postgres/provisioner.ts`
- Create: `apps/control-plane/src/proxy/router.ts`
- Create: `apps/control-plane/src/store/memory.ts`
- Test: `apps/control-plane/test/api.test.ts`

**Interfaces:**
- Consumes: `@fusionhost/engine`, `@fusionhost/types`
- Produces: Control Plane daemon on port 4000 with REST API, Docker container lifecycle, PostgreSQL database provisioning, reverse proxy, and log streaming.

- [ ] **Step 1: Implement App Store & State Machine (`store/memory.ts`)**
In-memory/persistent store for applications, deployments, and logs with ring-buffers.

- [ ] **Step 2: Implement Docker Orchestrator (`orchestrator/docker.ts`)**
Uses Docker CLI or Docker daemon to build images, create `fusionhost-net`, run containers, and manage scale-to-zero.

- [ ] **Step 3: Implement PostgreSQL Dynamic Provisioner (`postgres/provisioner.ts`)**
Ensures `fusionhost-postgres` is active, executes dynamic database creation, and generates `DATABASE_URL`.

- [ ] **Step 4: Implement Ingress Reverse Proxy (`proxy/router.ts`)**
Routes requests from `http://<app>.localhost:4000` or `/live/<app>` to the active container port.

- [ ] **Step 5: Implement Express/Node REST & WebSocket Server (`server.ts`)**
Endpoints for `/api/apps`, `/api/deploy`, `/api/status/:id`, `/api/logs/:id`, `/api/rollback`.

- [ ] **Step 6: Write API test**
Verify app registration, deployment triggering, and status polling.

- [ ] **Step 7: Run test to verify**
Run: `npm --workspace=@fusionhost/control-plane run test`
Expected: PASS

- [ ] **Step 8: Commit**
```bash
git add apps/control-plane
git commit -m "feat(control-plane): implement Docker orchestrator, Postgres provisioner, and ingress proxy"
```

---

### Task 6: Web Marketing Hub, Documentation, Comparisons & Honest Limitations (`apps/web`)

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/globals.css`
- Create: `apps/web/app/page.tsx` (Hero + Interactive App Spec Sandbox)
- Create: `apps/web/app/limitations/page.tsx` (Transparent constraints)
- Create: `apps/web/app/pricing/page.tsx` (Plan matrix & limits FAQ)
- Create: `apps/web/app/compare/page.tsx` (Competitor breakdowns)
- Create: `apps/web/app/docs/page.tsx` (Zero-config guide & MCP setup)
- Create: `apps/web/app/api/agent-md/route.ts` (Serves agent.md)
- Create: `apps/web/components/Navbar.tsx`
- Create: `apps/web/components/Footer.tsx`
- Create: `apps/web/components/AppSpecSandbox.tsx`

**Interfaces:**
- Produces: Public web experience with live App Spec analysis demo, honest limitations page, pricing, docs, and competitor comparisons.

- [ ] **Step 1: Set up Next.js 15 and Tailwind CSS configuration**
Create `package.json`, `next.config.ts`, `postcss.config.mjs`, and Tailwind CSS dark-theme styling.

- [ ] **Step 2: Create Layout, Navbar, and Footer**
Header with Navigation (Features, Sandbox, Limitations, Pricing, Compare, Docs, Console) and Status indicator.

- [ ] **Step 3: Implement Landing Page with Interactive App Spec Sandbox (`page.tsx`)**
Hero: "Tell your agent once, ship your app".
Interactive Sandbox allows users to toggle sample projects (Next.js + Prisma, FastAPI + PostgreSQL, Express + SQLite hazard) or paste their own manifest to see instant, deterministic App Spec with file citations and hazards.

- [ ] **Step 4: Implement Honest Limitations Page (`limitations/page.tsx`)**
Surfaces the 6 explicit constraints prominently: 1 instance per app, Postgres only, ephemeral disk, no branch preview environments, limited cron, no free custom domain.

- [ ] **Step 5: Implement Pricing Page (`pricing/page.tsx`)**
Free ($0), Pro ($20/mo), and Enterprise tier comparison table with limits FAQ.

- [ ] **Step 6: Implement Competitor Comparisons (`compare/page.tsx`)**
Detailed matrix vs Vercel, Railway, Render, Heroku, and Cloudflare Pages—openly stating when competitors are the better choice.

- [ ] **Step 7: Implement Docs (`docs/page.tsx`) & `api/agent-md/route.ts`**
Quickstart instructions, agent prompt examples, MCP config JSON, and HTTP endpoint serving `agent.md`.

- [ ] **Step 8: Build and verify Next.js pages**
Run: `npm --workspace=@fusionhost/web run build`
Expected: PASS

- [ ] **Step 9: Commit**
```bash
git add apps/web
git commit -m "feat(web): implement marketing site, interactive sandbox, limitations, and docs"
```

---

### Task 7: Human Management Console / Dashboard (`apps/web/app/dashboard`)

**Files:**
- Create: `apps/web/app/dashboard/page.tsx`
- Create: `apps/web/app/dashboard/apps/[id]/page.tsx`
- Create: `apps/web/components/dashboard/AppOverviewCard.tsx`
- Create: `apps/web/components/dashboard/LivePreviewIframe.tsx`
- Create: `apps/web/components/dashboard/TerminalLogViewer.tsx`
- Create: `apps/web/components/dashboard/AppSpecCard.tsx`
- Create: `apps/web/components/dashboard/SecretsManager.tsx`
- Create: `apps/web/components/dashboard/DeployHistoryList.tsx`
- Create: `apps/web/components/dashboard/FolderDeployModal.tsx`

**Interfaces:**
- Produces: Complete human management console for viewing apps, live preview, terminal logs, secrets, deploy history with one-click rollback, and folder deploys.

- [ ] **Step 1: Implement Dashboard Home (`dashboard/page.tsx`)**
Lists active applications with status pills, live URLs, resource metrics, and "New Deploy" action modal.

- [ ] **Step 2: Implement Folder Deploy Modal (`FolderDeployModal.tsx`)**
Allows selecting or dragging a local folder path, triggers analysis, shows hazards and App Spec preview, and initiates deploy.

- [ ] **Step 3: Implement App Detail View with Tabs (`dashboard/apps/[id]/page.tsx`)**
Header with App Name, Live URL, Status pill, and tab navigation: Overview, Logs, Deployments, Secrets, Database.

- [ ] **Step 4: Implement Terminal Log Viewer (`TerminalLogViewer.tsx`)**
Simulates or streams live container and build logs with auto-scroll and filter by stdout/stderr.

- [ ] **Step 5: Implement Deployments List & One-Click Rollback (`DeployHistoryList.tsx`)**
Displays build history with timestamps, commit/folder tags, duration, and one-click rollback button.

- [ ] **Step 6: Implement Secrets & Database Inspector (`SecretsManager.tsx`)**
Add/edit environment variables, view provisioned PostgreSQL connection string and credentials.

- [ ] **Step 7: Build and verify Dashboard**
Run: `npm --workspace=@fusionhost/web run build`
Expected: PASS

- [ ] **Step 8: Commit**
```bash
git add apps/web/app/dashboard apps/web/components/dashboard
git commit -m "feat(dashboard): implement human management console with live preview, logs, and rollback"
```

---

### Task 8: End-to-End Verification & Demonstration

**Files:**
- Create: `examples/sample-node-app/package.json`
- Create: `examples/sample-node-app/server.js`
- Create: `examples/sample-python-app/requirements.txt`
- Create: `examples/sample-python-app/main.py`
- Test: `test/e2e.test.ts`

**Interfaces:**
- Produces: End-to-end integration tests verifying deterministic analysis, MCP tool interaction, container deployment flow, and rollback.

- [ ] **Step 1: Create sample fixture applications**
1. Node.js Express app with `/health` and `/` endpoints.
2. Python FastAPI app with `/health` and `/` endpoints.

- [ ] **Step 2: Write end-to-end test script (`test/e2e.test.ts`)**
Automates:
1. `analyzeProject()` asserting accurate AppSpec and file citations.
2. Deploying the app via the Control Plane / MCP interface.
3. Querying deployment status and streaming logs.
4. Verifying rollback endpoint.

- [ ] **Step 3: Run end-to-end verification**
Run: `npm run test`
Expected: ALL TESTS PASS

- [ ] **Step 4: Commit**
```bash
git add examples test
git commit -m "test: add fixture sample apps and e2e platform verification tests"
```
