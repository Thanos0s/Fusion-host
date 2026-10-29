# FusionHost Agent Guide (`agent.md`)

> **For AI Coding Agents (Claude Code, Cursor, Windsurf, Codex, etc.)**  
> **Tagline:** "Tell your agent once, ship your app"

FusionHost is a Platform-as-a-Service (PaaS) built for autonomous AI coding agents. With FusionHost, you can deploy applications without writing a Dockerfile, without configuring CI/CD YAML, and without asking a human to click through a cloud console.

---

## 1. Connecting to FusionHost

Add FusionHost to your agent's MCP client configuration:

```json
{
  "mcpServers": {
    "fusionhost": {
      "command": "node",
      "args": ["<path-to-fusionhost>/packages/mcp/dist/bin/fusionhost-mcp.js"]
    }
  }
}
```

Or via npx when published:
```bash
npx @fusionhost/mcp
```

---

## 2. Autonomous Deploy Loop

Always follow this autonomous workflow:

```
[Local Workspace]                   [Remote GitHub Repository]
+------------------------+          +------------------------------------+
| 1. analyze_repository  |          | 0. import_github_repository        |
+-----------+------------+          +-----------------+------------------+
            |                                         | (clones & analyzes)
            |                                         v
            +---------------------> +-----------------+------------------+
                                    | 2. Resolve Hazards & Secrets       |
                                    +-----------------+------------------+
                                                      |
                                                      v
                                    +-----------------+------------------+
                                    | 3. deploy_app (path = localPath)   |
                                    +-----------------+------------------+
                                                      |
                                    +-----------------+------------------+
                                    |                                    |
                               [Success]                              [Failure]
                                    |                                    |
                                    v                                    v
                        +------------------------+           +------------------------+
                        | App is live at URL!    |           | 4. get_deployment_logs |
                        | No human relay needed. |           +-----------+------------+
                        +------------------------+                       |
                                                                         v
                                                             +------------------------+
                                                             | Auto-patch code error  |
                                                             | and call deploy_app    |
                                                             +------------------------+
```

### Step 0: Import from GitHub (Remote Workspaces)
When working with remote repositories, import the repository into your local FusionHost workspace first:
```typescript
const result = await import_github_repository({
  repo_url: "https://github.com/octocat/my-service",
  branch: "main"
});
```
The returned `result` provides:
- `localPath`: Path to the cloned workspace ready for deployment
- `appName`: Extracted or specified application identifier
- `spec`: Full deterministic `AppSpec` with citations and hazards

You can then pass `result.localPath` directly to `deploy_app`:
```typescript
await deploy_app({
  path: result.localPath,
  app_name: result.appName
});
```

### Step 1: Analyze First
Before building or shipping, inspect the repository:
```typescript
analyze_repository({ path: "." })
```
The response returns:
- `runtime`: e.g. `'node' | 'python'`
- `framework`: e.g. `'Next.js' | 'FastAPI' | 'Express'`
- `startCommand`: Cited with exact file (e.g. `package.json#scripts.start`)
- `port`: Inferred listening port
- `needsPostgres`: True if Postgres dependencies or queries are detected
- `hazards`: Warnings about ephemeral disk writes (`fs.writeFile`), unconfigured external services, or missing env vars.

### Step 2: Handle Hazards & Env Vars
If `hazards` reports missing environment variables, prompt the human only for those secrets or inject them in `deploy_app({ path: ".", env_vars: { ... } })`. If `hazards` warns of local SQLite/file writes, inform the user that local disk is ephemeral and recommend PostgreSQL.

### Step 3: Deploy
```typescript
deploy_app({
  path: ".",
  app_name: "my-service",
  env_vars: {
    API_KEY: "secret_value"
  }
})
```
FusionHost automatically:
- Synthesizes a secure multi-stage container image.
- Provisions a dedicated PostgreSQL database if `needsPostgres` is true and injects `DATABASE_URL`.
- Routes incoming traffic at `http://my-service.localhost:4000` (or `http://localhost:4000/live/my-service`).

### Step 4: Autonomous Failure Diagnosis & Self-Healing
If the deployment state transitions to `FAILED` or `CRASHED`:
1. Call `get_deployment_logs({ deployment_id: "...", limit: 50 })`.
2. Locate the compilation error or runtime traceback.
3. Edit the offending code file directly in the workspace.
4. Call `deploy_app` again.
**Do not ask the user to copy-paste error logs back and forth.**

---

## 3. Available MCP Tools

| Tool Name | Parameters | Description |
|---|---|---|
| `analyze_repository` | `{ path: string }` | Deterministic inspection producing `AppSpec` with citations and hazards. |
| `import_github_repository` | `{ repo_url: string, branch?: string, app_name?: string, token?: string }` | Clones and analyzes a GitHub repo into local workspace, returning `AppSpec` and `localPath` for `deploy_app`. |
| `deploy_app` | `{ path: string, app_name?: string, env_vars?: Record<string, string> }` | Packages, builds, provisions, and deploys the app. |
| `get_deployment_status` | `{ deployment_id: string }` | Returns status (`BUILDING`, `HEALTHY`, `FAILED`, `CRASHED`). |
| `get_deployment_logs` | `{ deployment_id: string, limit?: number }` | Streams build and container stdout/stderr. |
| `rollback_app` | `{ app_name: string, target_deployment_id: string }` | Instant rollback to a previous release tag. |
| `list_apps` | `{}` | Lists all registered apps, active URLs, and database bindings. |

---

## 4. Platform Constraints ("Where It Stops")
Keep these design constraints in mind:
1. **Single Instance**: FusionHost runs 1 container per app (no distributed horizontal clustering in v1).
2. **PostgreSQL Only**: Only PostgreSQL is auto-provisioned. External Redis, MongoDB, or MySQL requires user-provided connection strings.
3. **Ephemeral Filesystem**: Any file written to local disk inside the container will be discarded on restart or redeploy. Use database or object storage for persistence.
4. **Scale-to-Zero**: Inactive applications sleep after idle periods and automatically wake upon incoming HTTP traffic.
