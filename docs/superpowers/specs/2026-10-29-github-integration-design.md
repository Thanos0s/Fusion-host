# GitHub Account Integration & Repository Importer Design Specification

**Status:** Approved  
**Date:** 2026-10-29  
**Scope:** `@fusionhost/control-plane`, `@fusionhost/web`, `@fusionhost/mcp`

---

## 1. Overview & Objective

FusionHost enables zero-config deployment for AI agents and human developers. Currently, deployments can be initiated via local folder path or direct MCP commands. This feature introduces native GitHub account integration using Personal Access Tokens (PAT), allowing users to:
1. Connect their GitHub account securely.
2. Search, browse, and pick from their public and private repositories.
3. Select specific branches.
4. Deterministically inspect and analyze repository manifests before deployment with file citations and hazard alerts.
5. Deploy repositories in one click with automated PostgreSQL provisioning and ingress routing.
6. Provide an MCP tool (`import_github_repository`) allowing AI coding agents to clone and ship from GitHub repositories autonomously.

---

## 2. Architecture & Data Flow

```
[ User Browser / Web UI ]
           │
           │ 1. POST /api/github/connect (PAT)
           ▼
[ Control Plane GitHub Service ] ─── 2. GET https://api.github.com/user
           │
           │ 3. Stores verified session & profile in MemoryStore
           ▼
[ User selects repo & branch in UI ]
           │
           │ 4. POST /api/github/import { repoUrl, branch }
           ▼
[ Git Cloner / Tarball Extractor ] ─── clones into .fusionhost/repos/<owner>/<repo>
           │
           │ 5. analyzeProject(clonedPath)
           ▼
[ @fusionhost/engine ] ─── produces AppSpec (citations, hazards, postgres requirement)
           │
           │ 6. Returns AppSpec preview to User
           ▼
[ User clicks Deploy ]
           │
           │ 7. POST /api/deploy { path: clonedPath, appName }
           ▼
[ Docker / Process Orchestrator ] ─── Provisions DB, launches container/process, binds ingress
```

---

## 3. API Specification (`apps/control-plane`)

### 3.1 `POST /api/github/connect`
- **Request Body:**
  ```json
  {
    "token": "ghp_..."
  }
  ```
- **Behavior:**
  - Validates token against `https://api.github.com/user` with `User-Agent: FusionHost-Control-Plane`.
  - Checks rate-limits and token scopes (`repo`, `read:user`).
  - Stores encrypted or masked token and authenticated profile:
    `{ login, name, avatarUrl, htmlUrl, publicRepos, totalPrivateRepos }`.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "login": "octocat",
      "name": "The Octocat",
      "avatarUrl": "https://avatars.githubusercontent.com/u/583231?v=4",
      "publicRepos": 8,
      "totalPrivateRepos": 4
    }
  }
  ```

### 3.2 `GET /api/github/status`
- **Response (200 OK):**
  ```json
  {
    "connected": true,
    "user": {
      "login": "octocat",
      "avatarUrl": "https://avatars.githubusercontent.com/u/583231?v=4"
    }
  }
  ```

### 3.3 `GET /api/github/repos`
- **Query Parameters:** `page`, `per_page` (default 30), `search` (optional string filter).
- **Behavior:** Fetches `https://api.github.com/user/repos?sort=updated&per_page=100`.
- **Response (200 OK):**
  ```json
  {
    "repos": [
      {
        "id": 1296269,
        "name": "hello-world",
        "fullName": "octocat/hello-world",
        "private": false,
        "htmlUrl": "https://github.com/octocat/hello-world",
        "cloneUrl": "https://github.com/octocat/hello-world.git",
        "description": "My first repository on GitHub!",
        "defaultBranch": "main",
        "language": "TypeScript",
        "stars": 42,
        "updatedAt": "2026-10-28T14:20:00Z"
      }
    ]
  }
  ```

### 3.4 `GET /api/github/repos/:owner/:repo/branches`
- **Response (200 OK):**
  ```json
  {
    "branches": ["main", "dev", "v1-release"]
  }
  ```

### 3.5 `POST /api/github/import`
- **Request Body:**
  ```json
  {
    "repoUrl": "https://github.com/octocat/hello-world",
    "branch": "main",
    "appName": "hello-world"
  }
  ```
- **Behavior:**
  - Clones (shallow clone `git clone --depth 1 -b <branch>`) or downloads repo archive into `.fusionhost/repos/<owner>/<repo>`.
  - Runs `@fusionhost/engine` `analyzeProject(targetPath)` to produce deterministic `AppSpec`.
  - Returns `localPath` and `spec`.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "localPath": "/abs/path/.fusionhost/repos/octocat/hello-world",
    "appName": "hello-world",
    "spec": { ... }
  }
  ```

### 3.6 `POST /api/github/disconnect`
- **Response (200 OK):** Clears stored token and profile.

---

## 4. MCP Agent Tool Specification (`packages/mcp`)

Add new tool to `fusionhost-mcp`:
```typescript
{
  name: "import_github_repository",
  description: "Clones and inspects a GitHub repository to prepare it for deployment on FusionHost",
  inputSchema: {
    type: "object",
    properties: {
      repo_url: { type: "string", description: "GitHub repository HTTPS URL" },
      branch: { type: "string", description: "Branch or tag name (default: main)" },
      app_name: { type: "string", description: "Optional override for application name" }
    },
    required: ["repo_url"]
  }
}
```

---

## 5. Frontend Console UI (`apps/web`)

1. **Deploy Modal Overhaul**:
   - Tab header: **"Local Folder"** and **"GitHub Repositories"**.
   - If GitHub is disconnected: Display input field for GitHub Personal Access Token with instructions on scopes (`repo`, `read:user`), a link to GitHub PAT creation, and "Connect GitHub" button.
   - If GitHub is connected:
     - Profile badge with user avatar, name, and "Disconnect" button.
     - Search input to filter repositories in real time.
     - List of repository cards showing:
       - Repo name + lock icon for private repos.
       - Description and primary language badge.
       - Branch selector dropdown.
       - "Analyze & Deploy" button.
   - Pre-Deploy Analysis Card:
     - Displays detected runtime, framework, port, start command, and postgres requirement.
     - Displays citations and any detected hazards.
     - "Confirm Deploy" button to launch deployment.

---

## 6. Testing & Quality Verification

1. **Unit Tests**:
   - `apps/control-plane/test/github.test.ts`: Verify GitHub endpoints with mock tokens and import logic.
   - `packages/mcp/test/mcp.test.ts`: Verify `import_github_repository` tool execution.
2. **End-to-End Build**:
   - Run `npm run build` across all workspaces.
   - Verify TypeScript compliance and Next.js static page generation.
