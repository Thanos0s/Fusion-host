import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  AppSpec,
  Hazard,
  Deployment,
  GitHubUser,
  GitHubRepo,
  GitHubBranch,
  GitHubImportResult
} from '../dist/index.js';

test('AppSpec type structure conforms to specification', () => {
  const sampleHazard: Hazard = {
    ruleId: 'ephemeral-disk-write',
    severity: 'warning',
    message: 'Local disk writes to db.sqlite3 will be lost upon container restart',
    fileCitation: 'server.js#line:42',
    suggestion: 'Use provisioned PostgreSQL instead of local SQLite'
  };

  const sampleSpec: AppSpec = {
    appName: 'sample-service',
    runtime: 'node',
    version: '22',
    framework: 'Express',
    startCommand: 'node server.js',
    port: 3000,
    needsPostgres: true,
    hasExistingDockerfile: false,
    requiredEnvVars: [
      { name: 'PORT', required: false, citedIn: 'server.js' },
      { name: 'DATABASE_URL', required: true, citedIn: 'package.json#dependencies.pg' }
    ],
    citations: {
      runtime: 'package.json#engines.node',
      startCommand: 'package.json#scripts.start',
      port: 'server.js#listen',
      needsPostgres: 'package.json#dependencies.pg'
    },
    hazards: [sampleHazard]
  };

  assert.equal(sampleSpec.appName, 'sample-service');
  assert.equal(sampleSpec.needsPostgres, true);
  assert.equal(sampleSpec.hazards.length, 1);
  assert.equal(sampleSpec.hazards[0].ruleId, 'ephemeral-disk-write');
});

test('GitHub types conform to specification', () => {
  const sampleUser: GitHubUser = {
    login: 'octocat',
    name: 'The Octocat',
    avatarUrl: 'https://github.com/images/error/octocat_happy.gif',
    htmlUrl: 'https://github.com/octocat',
    publicRepos: 8,
    totalPrivateRepos: 12
  };

  const sampleRepo: GitHubRepo = {
    id: 1296269,
    name: 'Hello-World',
    fullName: 'octocat/Hello-World',
    private: false,
    htmlUrl: 'https://github.com/octocat/Hello-World',
    cloneUrl: 'https://github.com/octocat/Hello-World.git',
    description: 'This is your first repo!',
    defaultBranch: 'main',
    language: 'JavaScript',
    stars: 80,
    updatedAt: '2026-10-29T00:00:00Z'
  };

  const sampleBranch: GitHubBranch = {
    name: 'main',
    protected: true
  };

  const sampleResult: GitHubImportResult = {
    success: true,
    localPath: '/tmp/repos/Hello-World',
    appName: 'hello-world',
    spec: {
      appName: 'hello-world',
      runtime: 'node',
      version: '22',
      framework: 'Express',
      startCommand: 'node server.js',
      port: 3000,
      needsPostgres: false,
      hasExistingDockerfile: false,
      requiredEnvVars: [],
      citations: {},
      hazards: []
    }
  };

  assert.equal(sampleUser.login, 'octocat');
  assert.equal(sampleUser.publicRepos, 8);
  assert.equal(sampleRepo.name, 'Hello-World');
  assert.equal(sampleRepo.defaultBranch, 'main');
  assert.equal(sampleBranch.name, 'main');
  assert.equal(sampleBranch.protected, true);
  assert.equal(sampleResult.success, true);
  assert.equal(sampleResult.appName, 'hello-world');
  assert.equal(sampleResult.spec.runtime, 'node');
});

test('GitHub type definitions are exported in dist/index.d.ts', () => {
  const dtsPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist/index.d.ts');
  const dtsContent = fs.readFileSync(dtsPath, 'utf8');
  assert.match(dtsContent, /export interface GitHubUser/);
  assert.match(dtsContent, /export interface GitHubRepo/);
  assert.match(dtsContent, /export interface GitHubBranch/);
  assert.match(dtsContent, /export interface GitHubImportResult/);
});
