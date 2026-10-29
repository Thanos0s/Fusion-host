import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { createServer } from '../dist/server.js';
import { GitHubService, githubService } from '../dist/github/service.js';
import type { GitHubUser, GitHubRepo } from '@fusionhost/types';

test('GitHubService unit tests: connection lifecycle & mock user', async () => {
  const service = new GitHubService();

  assert.equal(service.isConnected(), false);
  assert.equal(service.getUser(), null);

  const mockUser: GitHubUser = {
    login: 'octocat',
    name: 'The Octocat',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231',
    htmlUrl: 'https://github.com/octocat',
    publicRepos: 8,
    totalPrivateRepos: 2
  };

  service.setMockUser(mockUser, 'test-token-123');
  assert.equal(service.isConnected(), true);
  assert.deepEqual(service.getUser(), mockUser);

  service.disconnect();
  assert.equal(service.isConnected(), false);
  assert.equal(service.getUser(), null);
});

test('GitHubService repository listing and filtering', async () => {
  const service = new GitHubService();
  const mockUser: GitHubUser = {
    login: 'octocat',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231',
    htmlUrl: 'https://github.com/octocat',
    publicRepos: 2
  };
  service.setMockUser(mockUser, 'test-token');

  const mockRepos: GitHubRepo[] = [
    {
      id: 1,
      name: 'fusion-web',
      fullName: 'octocat/fusion-web',
      private: false,
      htmlUrl: 'https://github.com/octocat/fusion-web',
      cloneUrl: 'https://github.com/octocat/fusion-web.git',
      description: 'Web dashboard for FusionHost',
      defaultBranch: 'main',
      stars: 42,
      updatedAt: '2026-10-29T10:00:00Z'
    },
    {
      id: 2,
      name: 'api-service',
      fullName: 'octocat/api-service',
      private: true,
      htmlUrl: 'https://github.com/octocat/api-service',
      cloneUrl: 'https://github.com/octocat/api-service.git',
      description: 'Backend REST API',
      defaultBranch: 'master',
      stars: 12,
      updatedAt: '2026-10-28T10:00:00Z'
    }
  ];

  service.setMockRepos(mockRepos);

  const allRepos = await service.listRepositories();
  assert.equal(allRepos.length, 2);

  const filtered = await service.listRepositories('web');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].name, 'fusion-web');

  const emptyFilter = await service.listRepositories('non-existent');
  assert.equal(emptyFilter.length, 0);
});

test('GitHubService branch listing with mock branches', async () => {
  const service = new GitHubService();
  service.setMockUser({
    login: 'octocat',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231',
    htmlUrl: 'https://github.com/octocat',
    publicRepos: 1
  });

  service.setMockBranches({
    'octocat/fusion-web': ['main', 'feat/dark-mode', 'fix/nav']
  });

  const branches = await service.listBranches('octocat', 'fusion-web');
  assert.deepEqual(branches, ['main', 'feat/dark-mode', 'fix/nav']);
});

test('GitHubService importRepository with local simulated project', async () => {
  const service = new GitHubService();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fusionhost-repo-import-'));

  try {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({
        name: 'imported-node-app',
        version: '1.0.0',
        scripts: { start: 'node server.js' }
      })
    );
    fs.writeFileSync(
      path.join(tmpDir, 'server.js'),
      `const http = require('http'); http.createServer().listen(3000);`
    );

    const result = await service.importRepository(tmpDir, 'main', 'my-imported-app');

    assert.equal(result.success, true);
    assert.equal(result.appName, 'my-imported-app');
    assert.ok(result.localPath);
    assert.equal(result.spec.runtime, 'node');
    assert.equal(result.spec.startCommand, 'npm start');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    if (fs.existsSync(path.resolve(process.cwd(), '.fusionhost/repos'))) {
      fs.rmSync(path.resolve(process.cwd(), '.fusionhost/repos'), { recursive: true, force: true });
    }
  }
});

test('Control Plane REST API: /api/github/* endpoints', async () => {
  const { httpServer } = createServer();
  const testPort = 4059;

  await new Promise<void>((resolve) => {
    httpServer.listen(testPort, () => resolve());
  });

  const baseUrl = `http://127.0.0.1:${testPort}`;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fusionhost-gh-api-test-'));

  try {
    // 1. Initial status -> disconnected
    githubService.disconnect();
    const statusRes1 = await fetch(`${baseUrl}/api/github/status`);
    assert.equal(statusRes1.status, 200);
    const statusData1 = await statusRes1.json();
    assert.equal(statusData1.connected, false);
    assert.equal(statusData1.user, null);

    // 2. Connect failure with empty token -> 400 or 401
    const badConnectRes = await fetch(`${baseUrl}/api/github/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: '' })
    });
    assert.ok(badConnectRes.status === 400 || badConnectRes.status === 401);

    // 3. Set mock user & test status
    const mockUser: GitHubUser = {
      login: 'fusion-dev',
      name: 'Fusion Developer',
      avatarUrl: 'https://avatars.githubusercontent.com/u/999999',
      htmlUrl: 'https://github.com/fusion-dev',
      publicRepos: 15
    };
    githubService.setMockUser(mockUser, 'test-token');

    const statusRes2 = await fetch(`${baseUrl}/api/github/status`);
    assert.equal(statusRes2.status, 200);
    const statusData2 = await statusRes2.json();
    assert.equal(statusData2.connected, true);
    assert.equal(statusData2.user.login, 'fusion-dev');

    // 4. Repositories endpoint
    githubService.setMockRepos([
      {
        id: 101,
        name: 'demo-service',
        fullName: 'fusion-dev/demo-service',
        private: false,
        htmlUrl: 'https://github.com/fusion-dev/demo-service',
        cloneUrl: 'https://github.com/fusion-dev/demo-service.git',
        defaultBranch: 'main',
        stars: 5,
        updatedAt: '2026-10-29T12:00:00Z'
      }
    ]);
    const reposRes = await fetch(`${baseUrl}/api/github/repos`);
    assert.equal(reposRes.status, 200);
    const reposData = await reposRes.json();
    assert.equal(reposData.repos.length, 1);
    assert.equal(reposData.repos[0].name, 'demo-service');

    // 5. Branches endpoint
    githubService.setMockBranches({
      'fusion-dev/demo-service': ['main', 'develop']
    });
    const branchesRes = await fetch(`${baseUrl}/api/github/repos/fusion-dev/demo-service/branches`);
    assert.equal(branchesRes.status, 200);
    const branchesData = await branchesRes.json();
    assert.deepEqual(branchesData.branches, ['main', 'develop']);

    // 6. Import endpoint
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({
        name: 'github-imported-service',
        scripts: { start: 'node index.js' }
      })
    );
    fs.writeFileSync(path.join(tmpDir, 'index.js'), `console.log('started');`);

    const importRes = await fetch(`${baseUrl}/api/github/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoUrl: tmpDir,
        branch: 'main',
        appName: 'my-github-app'
      })
    });
    assert.equal(importRes.status, 200);
    const importData = await importRes.json();
    assert.equal(importData.success, true);
    assert.equal(importData.appName, 'my-github-app');
    assert.equal(importData.spec.runtime, 'node');

    // 7. Disconnect endpoint
    const disconnectRes = await fetch(`${baseUrl}/api/github/disconnect`, {
      method: 'POST'
    });
    assert.equal(disconnectRes.status, 200);
    const disconnectData = await disconnectRes.json();
    assert.equal(disconnectData.success, true);

    const statusRes3 = await fetch(`${baseUrl}/api/github/status`);
    const statusData3 = await statusRes3.json();
    assert.equal(statusData3.connected, false);

  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    if (fs.existsSync(path.resolve(process.cwd(), '.fusionhost/repos'))) {
      fs.rmSync(path.resolve(process.cwd(), '.fusionhost/repos'), { recursive: true, force: true });
    }
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
  }
});
