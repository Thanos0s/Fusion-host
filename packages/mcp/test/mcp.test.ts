import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { createFusionHostMcpServer } from '../dist/server.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

test('MCP Server: exposes all 6 core tools and handles analyze_repository', async () => {
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
  assert.ok(toolNames.includes('deploy_app'));
  assert.ok(toolNames.includes('get_deployment_status'));
  assert.ok(toolNames.includes('get_deployment_logs'));
  assert.ok(toolNames.includes('rollback_app'));
  assert.ok(toolNames.includes('list_apps'));

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
