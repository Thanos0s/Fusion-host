# GitHub Account Integration & Repository Importer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement native GitHub Personal Access Token (PAT) account connection, repository and branch exploration, pre-deploy manifest analysis with file citations, 1-click deployment, and an MCP agent tool for autonomous repository import.

**Architecture:** Extend `@fusionhost/types` with GitHub data structures; build a modular `GitHubService` in `apps/control-plane/src/github/service.ts` that talks to the GitHub REST API and manages shallow git cloning/tarballs; expose `/api/github/*` REST endpoints on the control plane; add `import_github_repository` to `packages/mcp`; and build an interactive GitHub tab in the Web Console (`apps/web`).

**Tech Stack:** TypeScript, Node.js v24, Express, Next.js 15, Tailwind CSS, Lucide React, Model Context Protocol SDK.

## Global Constraints

- Authentication uses GitHub Personal Access Tokens (PAT) supporting both fine-grained and classic tokens (`repo`, `read:user`).
- Cloned repositories are stored in `.fusionhost/repos/<owner>/<repo>` with deterministic shallow clones (`--depth 1`).
- All code analysis on imported repositories must run through `@fusionhost/engine`'s `analyzeProject`.
- The MCP server must support `import_github_repository` with full stdio compatibility.
- Zero extra dependencies where standard `fetch` and built-in Node modules suffice.

---

### Task 1: Shared GitHub Types (`packages/types`)

**Files:**
- Modify: `packages/types/src/index.ts`
- Modify: `packages/types/test/types.test.ts`

**Interfaces:**
- Produces: `GitHubUser`, `GitHubRepo`, `GitHubBranch`, `GitHubImportResult`

- [ ] **Step 1: Write failing type assertion test in `packages/types/test/types.test.ts`**

```typescript
import test from 'node:test';
import assert from 'node:assert/strict';
import type { GitHubUser, GitHubRepo, GitHubBranch, GitHubImportResult } from '../src/index.js';

test('GitHub type definitions conform to spec', () => {
  const user: GitHubUser = {
    login: 'octocat',
    name: 'The Octocat',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231',
    htmlUrl: 'https://github.com/octocat',
    publicRepos: 8,
    totalPrivateRepos: 4,
  };
  assert.equal(user.login, 'octocat');

  const repo: GitHubRepo = {
    id: 12345,
    name: 'sample-repo',
    fullName: 'octocat/sample-repo',
    private: false,
    htmlUrl: 'https://github.com/octocat/sample-repo',
    cloneUrl: 'https://github.com/octocat/sample-repo.git',
    description: 'A sample repository',
    defaultBranch: 'main',
    language: 'TypeScript',
    stars: 12,
    updatedAt: new Date().toISOString(),
  };
  assert.equal(repo.name, 'sample-repo');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test packages/types/test/types.test.ts`  
Expected: FAIL (types not exported)

- [ ] **Step 3: Export GitHub types in `packages/types/src/index.ts`**

```typescript
export interface GitHubUser {
  login: string;
  name?: string;
  avatarUrl: string;
  htmlUrl: string;
  publicRepos: number;
  totalPrivateRepos?: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  htmlUrl: string;
  cloneUrl: string;
  description?: string;
  defaultBranch: string;
  language?: string;
  stars: number;
  updatedAt: string;
}

export interface GitHubBranch {
  name: string;
  protected?: boolean;
}

export interface GitHubImportResult {
  success: boolean;
  localPath: string;
  appName: string;
  spec: AppSpec;
}
```

- [ ] **Step 4: Build types package and run test**

Run: `npm --workspace=@fusionhost/types run build; node --test packages/types/test/types.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/types
git commit -m "feat(types): add GitHub data models for account integration and repos"
```

---

### Task 2: Control Plane GitHub Service & Endpoints (`apps/control-plane`)

**Files:**
- Create: `apps/control-plane/src/github/service.ts`
- Modify: `apps/control-plane/src/server.ts`
- Test: `apps/control-plane/test/github.test.ts`

**Interfaces:**
- Consumes: `@fusionhost/types`, `@fusionhost/engine`
- Produces: `githubService` instance, `/api/github/*` REST routes

- [ ] **Step 1: Write test for GitHub Service in `apps/control-plane/test/github.test.ts`**

```typescript
import test from 'node:test';
import assert from 'node:assert/strict';
import { GitHubService } from '../dist/github/service.js';

test('GitHubService manages credentials and validation', async () => {
  const service = new GitHubService();
  assert.equal(service.isConnected(), false);
  
  // Test mock connection
  service.setMockUser({
    login: 'testuser',
    name: 'Test User',
    avatarUrl: 'https://github.com/testuser.png',
    htmlUrl: 'https://github.com/testuser',
    publicRepos: 5,
  });
  
  assert.equal(service.isConnected(), true);
  assert.equal(service.getUser()?.login, 'testuser');
  
  service.disconnect();
  assert.equal(service.isConnected(), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test apps/control-plane/test/github.test.ts`  
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `apps/control-plane/src/github/service.ts`**

Implement `GitHubService` with:
- `connect(token: string): Promise<GitHubUser>`
- `isConnected(): boolean`
- `getUser(): GitHubUser | null`
- `disconnect(): void`
- `listRepositories(search?: string): Promise<GitHubRepo[]>`
- `listBranches(owner: string, repo: string): Promise<string[]>`
- `importRepository(repoUrl: string, branch?: string, appName?: string): Promise<GitHubImportResult>`
- Uses `git clone --depth 1 -b <branch> <url> <dest>` or tarball download
- Calls `analyzeProject(targetPath)` from `@fusionhost/engine`

- [ ] **Step 4: Register `/api/github/*` endpoints in `apps/control-plane/src/server.ts`**

Endpoints:
- `POST /api/github/connect`
- `GET /api/github/status`
- `GET /api/github/repos`
- `GET /api/github/repos/:owner/:repo/branches`
- `POST /api/github/import`
- `POST /api/github/disconnect`

- [ ] **Step 5: Run tests to verify**

Run: `npm --workspace=@fusionhost/control-plane run build; node --test apps/control-plane/test/github.test.ts`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/control-plane
git commit -m "feat(control-plane): implement GitHub integration service and endpoints"
```

---

### Task 3: MCP Agent Tool for GitHub Repositories (`packages/mcp`)

**Files:**
- Modify: `packages/mcp/src/server.ts`
- Modify: `packages/mcp/test/mcp.test.ts`

**Interfaces:**
- Consumes: `@fusionhost/types`, `@fusionhost/engine`
- Produces: MCP Tool `import_github_repository`

- [ ] **Step 1: Write MCP test asserting `import_github_repository` is exposed in `packages/mcp/test/mcp.test.ts`**

Assert that tool definitions include `import_github_repository`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test packages/mcp/test/mcp.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement `import_github_repository` in `packages/mcp/src/server.ts`**

Register tool `import_github_repository` in `server.ts` handling `repo_url`, `branch`, and `app_name`.

- [ ] **Step 4: Run MCP test to verify**

Run: `npm --workspace=@fusionhost/mcp run build; node --test packages/mcp/test/mcp.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/mcp
git commit -m "feat(mcp): add import_github_repository tool for autonomous coding agents"
```

---

### Task 4: Web Console GitHub Deploy UI (`apps/web`)

**Files:**
- Create: `apps/web/components/dashboard/GitHubDeployModal.tsx`
- Modify: `apps/web/app/dashboard/page.tsx`

**Interfaces:**
- Consumes: `/api/github/*`, `/api/deploy`
- Produces: Unified Deploy Modal with "Local Folder" & "GitHub" tabs, PAT authentication, live repository search, branch picker, pre-deploy AppSpec preview, and 1-click deploy

- [ ] **Step 1: Create `apps/web/components/dashboard/GitHubDeployModal.tsx`**

Build:
- Tab switch between "Local Folder" and "GitHub".
- If not connected: Token input with guide on creating GitHub PAT (`repo`, `read:user` permissions) and "Connect GitHub" button.
- If connected: Authenticated GitHub header card with user avatar, name, and "Disconnect" button.
- Repository search bar filtering repos live.
- Repository cards with privacy badge (lock for private), language tag, star count, and branch selector dropdown.
- "Analyze" button triggering real-time code analysis and displaying `AppSpecCard` with citations and hazards.
- "Deploy Application" button triggering `onDeploy(localClonedPath, appName)`.

- [ ] **Step 2: Update `apps/web/app/dashboard/page.tsx` to use the new modal**

Wire modal open/close states and pass live deployment triggers.

- [ ] **Step 3: Run Next.js build to verify zero compile or type errors**

Run: `npm --workspace=@fusionhost/web run build`  
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web
git commit -m "feat(web): implement GitHub repository explorer and 1-click deploy modal"
```

---

### Task 5: End-to-End Verification & Documentation

**Files:**
- Create: `test/github-e2e.test.ts`
- Modify: `docs/walkthrough.md`
- Modify: `agent.md`

- [ ] **Step 1: Write integration test in `test/github-e2e.test.ts`**

Test:
1. Connecting GitHub PAT
2. Listing repositories and branches
3. Importing and analyzing repository into AppSpec
4. Deploying imported repository into live container/process

- [ ] **Step 2: Run all test suites**

Run: `npm test`  
Expected: 100% Passed

- [ ] **Step 3: Run full workspace build**

Run: `npm run build`  
Expected: 100% Passed

- [ ] **Step 4: Commit**

```bash
git add test docs agent.md
git commit -m "test: add GitHub import e2e verification and updated documentation"
```
