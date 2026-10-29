# ⚡ FusionHost

> **"Tell your agent once, ship your app"**  
> *Autonomous Platform-as-a-Service (PaaS) built for AI coding agents and human developers.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-purple)](https://modelcontextprotocol.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 🚀 Overview

**FusionHost** eliminates Dockerfile authoring, YAML CI/CD pipelines, and cloud console friction. Whether you're driving development via an AI coding agent (Claude Code, Cursor, Windsurf, Codex) or shipping from the browser, FusionHost analyzes your code deterministically, provisions dedicated databases, generates multi-stage containers, and configures ingress routes automatically.

---

## ✨ Key Features

- **🤖 Autonomous AI Agent Ready**: Official Model Context Protocol (MCP) server enables coding agents to analyze, deploy, read live logs, and self-heal applications over `stdio`.
- **🐙 Native GitHub Account Integration**: Connect via Personal Access Token (PAT), browse public/private repositories, switch branches, inspect pre-deploy manifests, and ship in 1-click.
- **🔍 Deterministic Code Analysis**: Scans project files and ASTs (Node.js and Python) to infer frameworks, entrypoints, start commands, and ports with exact manifest line citations.
- **🛡️ Pre-Deploy Hazard Scanning**: Warns against ephemeral disk writes (`fs.writeFile`, SQLite) and missing environment variables before containers are built.
- **🐘 Automatic PostgreSQL Provisioning**: Detects database dependencies (`pg`, `@prisma/client`, `drizzle-orm`, `psycopg2`, `asyncpg`) and automatically provisions isolated databases with injected `DATABASE_URL`.
- **⚡ Ingress Reverse Proxy & Subdomain Routing**: Dynamic routing at `http://<app>.localhost:4000` and `http://localhost:4000/live/<app>` with WebSocket terminal log streaming.
- **🖥️ Human Management Console**: Beautiful Next.js 15 dashboard styled in Render.com black/purple aesthetic with live iframe viewport, device preview, secrets manager, and 1-click rollbacks.
- **💤 Scale-to-Zero Compute**: Inactive apps sleep automatically and wake on incoming HTTP requests in ~1.8s.

---

## 📂 Monorepo Architecture

```
fusionhost/
├── apps/
│   ├── control-plane/       # Express daemon, Docker/Process orchestrator, Postgres provisioner, Ingress proxy
│   └── web/                 # Next.js 15 App Router marketing hub, AppSpec sandbox, and /dashboard console
├── packages/
│   ├── engine/              # Deterministic AST & manifest parser, hazard detector, synthetic Dockerfile generator
│   ├── mcp/                 # Official Model Context Protocol (MCP) server & CLI for AI coding agents
│   └── types/               # Canonical shared TypeScript models (AppSpec, Deployment, GitHub models)
├── examples/
│   ├── sample-node-app/     # Sample Express + PostgreSQL service fixture
│   └── sample-python-app/   # Sample FastAPI + PostgreSQL service fixture
├── docs/                    # Specifications, implementation plans, and architecture walkthroughs
├── agent.md                 # Agent instructions and MCP connection manual
└── scripts/
    └── dev.js               # Unified dev orchestrator running control-plane (4000) and web (3000)
```

---

## 🛠️ Quickstart

### Prerequisites
- **Node.js**: v20+ (v22 or v24 recommended)
- **npm**: v10+
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/Thanos0s/Fusion-host.git
cd Fusion-host

# Install dependencies across all workspaces
npm install

# Build all packages
npm run build
```

### Running FusionHost

Launch both the **Control Plane** (`:4000`) and the **Web Console** (`:3000`) in one command:

```bash
npm run dev
```

- **Web Dashboard & Marketing:** [http://localhost:3000](http://localhost:3000)
- **Control Plane & Ingress Proxy:** [http://localhost:4000](http://localhost:4000)
- **Live Bootstrap Demo App:** [http://localhost:4000/live/acme-saas](http://localhost:4000/live/acme-saas)

---

## 🤖 Connecting AI Coding Agents (MCP)

Add FusionHost to your agent configuration (`claude_desktop_config.json`, Cursor, or Windsurf):

```json
{
  "mcpServers": {
    "fusionhost": {
      "command": "node",
      "args": ["<path-to-repo>/packages/mcp/dist/bin/fusionhost-mcp.js"]
    }
  }
}
```

### Available MCP Tools

| Tool | Parameters | Description |
|---|---|---|
| `analyze_repository` | `{ path: string }` | Deterministic inspection producing `AppSpec` with citations and hazards. |
| `import_github_repository` | `{ repo_url: string, branch?: string, token?: string }` | Clones, inspects, and stages GitHub repository for instant deploy. |
| `deploy_app` | `{ path: string, app_name?: string, env_vars?: Record<string, string> }` | Packages, provisions DB, and deploys the app to a live URL. |
| `get_deployment_status` | `{ deployment_id: string }` | Returns deployment state (`BUILDING`, `HEALTHY`, `FAILED`, `CRASHED`). |
| `get_deployment_logs` | `{ deployment_id: string, limit?: number }` | Streams build and container stdout/stderr. |
| `rollback_app` | `{ app_name: string, target_deployment_id: string }` | Instant rollback to any previous release. |
| `list_apps` | `{}` | Lists all registered apps, active URLs, and database bindings. |

---

## 🧪 Testing

Run comprehensive unit and integration test suites:

```bash
npm test
```

Run end-to-end integration tests:

```bash
node --test test/e2e.test.ts
node --test test/github-e2e.test.ts
```

---

## 📜 Documentation

- [`agent.md`](./agent.md): Autonomous agent deployment handbook.
- [`docs/walkthrough.md`](./docs/walkthrough.md): Comprehensive system walkthrough and feature verification.
- [`FEEDBACK_HUB.md`](./FEEDBACK_HUB.md): Midnight preprod auction feedback dataset and Google Sheets tracker.

---

## 📄 License

MIT © [FusionHost Team](https://github.com/Thanos0s/Fusion-host)
