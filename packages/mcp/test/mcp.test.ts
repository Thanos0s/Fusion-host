import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { createFusionHostMcpServer } from '../dist/server.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

test('MCP Server: exposes core tools including import_github_repository and handles analyze_repository', async () => {
  const server = createFusionHostMcpServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await Promise.all([
    server.connect(serverTransport),
  ]);

  const client = new Client(
    { name: 'test-agent', version: '1.0.0' },
    { capabilities: {} }
  );
  await client.connect(clientTransport);

  // 1. List tools
  const { tools } = await client.listTools();
  const toolNames = tools.map(t => t.name);

  assert.ok(toolNames.includes('analyze_repository'));
  assert.ok(toolNames.includes('import_github_repository'));
  assert.ok(toolNames.includes('deploy_app'));
  assert.ok(toolNames.includes('get_deployment_status'));
  assert.ok(toolNames.includes('get_deployment_logs'));
  assert.ok(toolNames.includes('rollback_app'));
  assert.ok(toolNames.includes('list_apps'));

  // Validate import_github_repository schema
  const importTool = tools.find(t => t.name === 'import_github_repository');
  assert.ok(importTool, 'import_github_repository must exist');
  assert.deepEqual(importTool.inputSchema.required, ['repo_url']);
  const props = importTool.inputSchema.properties as Record<string, any>;
  assert.ok(props.repo_url, 'repo_url property must exist');
  assert.ok(props.branch, 'branch property must exist');
  assert.ok(props.app_name, 'app_name property must exist');
  assert.ok(props.token, 'token property must exist');

  // 2. Test analyze_repository call
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fusionhost-mcp-test-'));
  try {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ name: 'mcp-test-app', scripts: { start: 'node app.js' } })
    );

    const callResult = await client.callTool({
      name: 'analyze_repository',
      arguments: { path: tmpDir }
    });

    assert.equal(callResult.isError, undefined);
    assert.ok(callResult.content && callResult.content.length > 0);
    const parsed = JSON.parse((callResult.content[0] as { text: string }).text);
    assert.equal(parsed.appName, 'mcp-test-app');
    assert.equal(parsed.runtime, 'node');
    assert.equal(parsed.startCommand, 'npm start');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    await client.close();
    await server.close();
  }
});

test('MCP Server: import_github_repository imports and analyzes repository', async () => {
  const server = createFusionHostMcpServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await Promise.all([
    server.connect(serverTransport),
  ]);

  const client = new Client(
    { name: 'test-agent', version: '1.0.0' },
    { capabilities: {} }
  );
  await client.connect(clientTransport);

  const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fusionhost-mcp-import-src-'));
  try {
    fs.writeFileSync(
      path.join(fixtureDir, 'package.json'),
      JSON.stringify({
        name: 'sample-imported-repo',
        scripts: { start: 'node index.js' },
        dependencies: { express: '^4.18.2' },
      })
    );
    fs.writeFileSync(
      path.join(fixtureDir, 'index.js'),
      'const express = require("express");\nconst app = express();\napp.listen(8080);'
    );

    const callResult = await client.callTool({
      name: 'import_github_repository',
      arguments: {
        repo_url: fixtureDir,
        app_name: 'custom-imported-app',
      },
    });

    assert.equal(callResult.isError, undefined);
    assert.ok(callResult.content && callResult.content.length > 0);

    const parsed = JSON.parse((callResult.content[0] as { text: string }).text);
    assert.equal(parsed.success, true);
    assert.equal(parsed.appName, 'custom-imported-app');
    assert.ok(parsed.localPath);
    assert.ok(fs.existsSync(parsed.localPath));
    assert.equal(parsed.spec.runtime, 'node');
    assert.equal(parsed.spec.port, 3000);

    // Re-import without explicit app_name: tests existing directory reuse & default appName fallback
    const callResult2 = await client.callTool({
      name: 'import_github_repository',
      arguments: {
        repo_url: fixtureDir,
      },
    });

    assert.equal(callResult2.isError, undefined);
    const parsed2 = JSON.parse((callResult2.content[0] as { text: string }).text);
    assert.equal(parsed2.success, true);
    assert.equal(parsed2.appName, 'sample-imported-repo');
    assert.equal(parsed2.spec.appName, 'sample-imported-repo');
  } finally {
    fs.rmSync(fixtureDir, { recursive: true, force: true });
    await client.close();
    await server.close();
  }
});

test('MCP Server: import_github_repository reports error on clone failure', async () => {
  const server = createFusionHostMcpServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await Promise.all([
    server.connect(serverTransport),
  ]);

  const client = new Client(
    { name: 'test-agent', version: '1.0.0' },
    { capabilities: {} }
  );
  await client.connect(clientTransport);

  try {
    const callResult = await client.callTool({
      name: 'import_github_repository',
      arguments: {
        repo_url: 'https://github.com/nonexistent-org-12345/nonexistent-repo-98765.git',
      },
    });

    assert.equal(callResult.isError, true);
    assert.ok(callResult.content && callResult.content.length > 0);
    const errorText = (callResult.content[0] as { text: string }).text;
    assert.ok(errorText.includes('Failed to clone repository') || errorText.includes('Error executing import_github_repository'));
  } finally {
    await client.close();
    await server.close();
  }
});
