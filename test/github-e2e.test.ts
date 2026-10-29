import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { createServer } from '../apps/control-plane/dist/server.js';
import { githubService } from '../apps/control-plane/dist/github/service.js';
import { orchestrator } from '../apps/control-plane/dist/orchestrator/docker.js';
import type { GitHubUser, GitHubRepo } from '@fusionhost/types';

test('E2E Verification: GitHub connect -> repos -> branches -> import -> deploy -> disconnect flow', async () => {
  const { httpServer } = createServer();
  const testPort = 4088;

  await new Promise<void>((resolve) => {
    httpServer.listen(testPort, () => resolve());
  });

  const baseUrl = `http://127.0.0.1:${testPort}`;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fusionhost-gh-e2e-'));
  const originalFetch = globalThis.fetch;
  const originalDeploy = orchestrator.deploy;

  // Stub orchestrator.deploy to avoid 20s health polling in unit test runner
  orchestrator.deploy = async (deployment, spec, sourcePath) => {
    return Promise.resolve();
  };

  try {
    // 0. Ensure disconnected initial state
    githubService.disconnect();

    // 1. Verify GET /api/github/status -> disconnected
    const initialStatusRes = await fetch(`${baseUrl}/api/github/status`);
    assert.equal(initialStatusRes.status, 200);
    const initialStatus = await initialStatusRes.json();
    assert.equal(initialStatus.connected, false);
    assert.equal(initialStatus.user, null);

    // 2. Mock GitHub API user endpoint for POST /api/github/connect
    const mockUserPayload: GitHubUser = {
      login: 'testuser',
      name: 'Test User',
      avatarUrl: 'https://avatars.githubusercontent.com/u/123456',
      htmlUrl: 'https://github.com/testuser',
      publicRepos: 10,
      totalPrivateRepos: 2,
    };

    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      if (url === 'https://api.github.com/user') {
        return new Response(
          JSON.stringify({
            login: mockUserPayload.login,
            name: mockUserPayload.name,
            avatar_url: mockUserPayload.avatarUrl,
            html_url: mockUserPayload.htmlUrl,
            public_repos: mockUserPayload.publicRepos,
            total_private_repos: mockUserPayload.totalPrivateRepos,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      return originalFetch(input, init);
    };

    const connectRes = await fetch(`${baseUrl}/api/github/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'ghp_mock_token_for_e2e_flow' }),
    });
    assert.equal(connectRes.status, 200);
    const connectData = await connectRes.json();
    assert.equal(connectData.success, true);
    assert.equal(connectData.user.login, 'testuser');
    assert.equal(connectData.user.name, 'Test User');

    // Verify status is now connected
    const connectedStatusRes = await fetch(`${baseUrl}/api/github/status`);
    const connectedStatus = await connectedStatusRes.json();
    assert.equal(connectedStatus.connected, true);
    assert.equal(connectedStatus.user.login, 'testuser');

    // 3. Test GET /api/github/repos -> returns repository list
    const mockRepos: GitHubRepo[] = [
      {
        id: 901,
        name: 'sample-repo',
        fullName: 'testuser/sample-repo',
        private: false,
        htmlUrl: 'https://github.com/testuser/sample-repo',
        cloneUrl: 'https://github.com/testuser/sample-repo.git',
        description: 'Sample repository for e2e test verification',
        defaultBranch: 'main',
        stars: 42,
        updatedAt: '2026-10-29T10:00:00Z',
      },
    ];
    githubService.setMockRepos(mockRepos);

    const reposRes = await fetch(`${baseUrl}/api/github/repos`);
    assert.equal(reposRes.status, 200);
    const reposData = await reposRes.json();
    assert.equal(Array.isArray(reposData.repos), true);
    assert.equal(reposData.repos.length, 1);
    assert.equal(reposData.repos[0].name, 'sample-repo');
    assert.equal(reposData.repos[0].fullName, 'testuser/sample-repo');

    // 4. Test GET /api/github/repos/testuser/sample-repo/branches -> returns branch list
    githubService.setMockBranches({
      'testuser/sample-repo': ['main', 'feature/v1', 'fix/bug'],
    });

    const branchesRes = await fetch(`${baseUrl}/api/github/repos/testuser/sample-repo/branches`);
    assert.equal(branchesRes.status, 200);
    const branchesData = await branchesRes.json();
    assert.deepEqual(branchesData.branches, ['main', 'feature/v1', 'fix/bug']);

    // 5. Test POST /api/github/import with local fixture repo -> returns verified AppSpec
    const fixtureDir = path.join(tmpDir, 'sample-repo-source');
    fs.mkdirSync(fixtureDir, { recursive: true });
    fs.writeFileSync(
      path.join(fixtureDir, 'package.json'),
      JSON.stringify({
        name: 'sample-repo-app',
        version: '1.0.0',
        scripts: { start: 'node server.js' },
        dependencies: {
          express: '^4.18.2',
        },
      })
    );
    fs.writeFileSync(
      path.join(fixtureDir, 'server.js'),
      `const http = require('http');\nconst server = http.createServer((req, res) => res.end('OK'));\nserver.listen(process.env.PORT || 3000);`
    );

    const importRes = await fetch(`${baseUrl}/api/github/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoUrl: fixtureDir,
        branch: 'main',
        appName: 'sample-repo-app',
      }),
    });
    assert.equal(importRes.status, 200);
    const importData = await importRes.json();
    assert.equal(importData.success, true);
    assert.equal(importData.appName, 'sample-repo-app');
    assert.ok(importData.localPath);
    assert.ok(fs.existsSync(importData.localPath));
    assert.equal(importData.spec.runtime, 'node');
    assert.equal(importData.spec.framework, 'Express');
    assert.equal(importData.spec.startCommand, 'npm start');

    // 6. Test POST /api/deploy using imported repo's localPath -> 202 accepted and active deployment created
    const deployRes = await fetch(`${baseUrl}/api/deploy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: importData.localPath,
        appName: importData.appName,
      }),
    });
    assert.equal(deployRes.status, 202);
    const deployData = await deployRes.json();
    assert.equal(deployData.success, true);
    assert.ok(deployData.deploymentId);
    assert.equal(deployData.appName, 'sample-repo-app');
    assert.equal(deployData.status, 'BUILDING');
    assert.ok(deployData.liveUrl.includes('sample-repo-app'));

    // Verify deployment details endpoint
    const deploymentDetailsRes = await fetch(`${baseUrl}/api/deployments/${deployData.deploymentId}`);
    assert.equal(deploymentDetailsRes.status, 200);
    const deploymentDetails = await deploymentDetailsRes.json();
    assert.equal(deploymentDetails.id, deployData.deploymentId);
    assert.equal(deploymentDetails.appName, 'sample-repo-app');

    // Verify apps list endpoint includes deployed app
    const appsListRes = await fetch(`${baseUrl}/api/apps`);
    assert.equal(appsListRes.status, 200);
    const appsListData = await appsListRes.json();
    const matchedApp = appsListData.apps.find((a: any) => a.name === 'sample-repo-app');
    assert.ok(matchedApp, 'sample-repo-app should be registered in store');
    assert.equal(matchedApp.activeDeploymentId, deployData.deploymentId);

    // 7. Test POST /api/github/disconnect -> clears authentication
    const disconnectRes = await fetch(`${baseUrl}/api/github/disconnect`, {
      method: 'POST',
    });
    assert.equal(disconnectRes.status, 200);
    const disconnectData = await disconnectRes.json();
    assert.equal(disconnectData.success, true);

    const postDisconnectStatusRes = await fetch(`${baseUrl}/api/github/status`);
    assert.equal(postDisconnectStatusRes.status, 200);
    const postDisconnectStatus = await postDisconnectStatusRes.json();
    assert.equal(postDisconnectStatus.connected, false);
    assert.equal(postDisconnectStatus.user, null);
  } finally {
    globalThis.fetch = originalFetch;
    orchestrator.deploy = originalDeploy;

    // Terminate any subprocesses started by the orchestrator during deploy
    if ((orchestrator as any).runningSubprocesses) {
      for (const [id, child] of (orchestrator as any).runningSubprocesses.entries()) {
        try {
          child.kill();
        } catch {
          // ignore kill errors
        }
      }
      (orchestrator as any).runningSubprocesses.clear();
    }

    fs.rmSync(tmpDir, { recursive: true, force: true });
    const repoSyncDir = path.resolve(process.cwd(), '.fusionhost/repos');
    if (fs.existsSync(repoSyncDir)) {
      try {
        fs.rmSync(repoSyncDir, { recursive: true, force: true });
      } catch {
        // ignore cleanup error if locked
      }
    }
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
  }
});
