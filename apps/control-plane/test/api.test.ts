import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { createServer } from '../dist/server.js';

test('Control Plane API: health, analyze, deploy, and apps lifecycle', async () => {
  const { httpServer } = createServer();
  const testPort = 4055;

  await new Promise<void>((resolve) => {
    httpServer.listen(testPort, () => resolve());
  });

  const baseUrl = `http://127.0.0.1:${testPort}`;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fusionhost-api-test-'));

  try {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({
        name: 'api-test-service',
        version: '1.0.0',
        scripts: { start: 'node index.js' }
      })
    );
    fs.writeFileSync(
      path.join(tmpDir, 'index.js'),
      `const http = require('http');\nconst server = http.createServer((req, res) => res.end('OK'));\nserver.listen(process.env.PORT || 3000);`
    );

    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`);
    assert.equal(healthRes.status, 200);
    const healthData = await healthRes.json();
    assert.equal(healthData.status, 'ok');

    // 2. Analyze API
    const analyzeRes = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: tmpDir })
    });
    assert.equal(analyzeRes.status, 200);
    const spec = await analyzeRes.json();
    assert.equal(spec.appName, 'api-test-service');
    assert.equal(spec.runtime, 'node');

    // 3. Deploy API
    const deployRes = await fetch(`${baseUrl}/api/deploy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: tmpDir, appName: 'api-test-service' })
    });
    assert.equal(deployRes.status, 202);
    const deployData = await deployRes.json();
    assert.equal(deployData.success, true);
    assert.ok(deployData.deploymentId);
    assert.ok(deployData.liveUrl.includes('api-test-service'));

    // 4. Query Deployment Details
    const detailsRes = await fetch(`${baseUrl}/api/deployments/${deployData.deploymentId}`);
    assert.equal(detailsRes.status, 200);
    const details = await detailsRes.json();
    assert.equal(details.id, deployData.deploymentId);

    // 5. Query Apps List
    const appsRes = await fetch(`${baseUrl}/api/apps`);
    assert.equal(appsRes.status, 200);
    const appsData = await appsRes.json();
    assert.ok(appsData.apps.some((a: any) => a.name === 'api-test-service'));

  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
  }
});
