import test from 'node:test';
import assert from 'node:assert/strict';
import * as path from 'node:path';
import { analyzeProject, generateDockerfile } from '../packages/engine/dist/index.js';

test('E2E Verification: Analyze Node.js Sample App', async () => {
  const nodeAppPath = path.resolve('examples/sample-node-app');
  const spec = await analyzeProject(nodeAppPath);

  assert.equal(spec.appName, 'sample-node-service');
  assert.equal(spec.runtime, 'node');
  assert.equal(spec.needsPostgres, true);
  assert.equal(spec.port, 3000);
  assert.ok(spec.citations['needsPostgres']?.includes('pg'));

  const { dockerfileContent } = generateDockerfile(nodeAppPath, spec);
  assert.ok(dockerfileContent.includes('FROM node:22-bookworm-slim'));
  assert.ok(dockerfileContent.includes('USER node'));
});

test('E2E Verification: Analyze Python Sample App', async () => {
  const pyAppPath = path.resolve('examples/sample-python-app');
  const spec = await analyzeProject(pyAppPath);

  assert.equal(spec.runtime, 'python');
  assert.equal(spec.framework, 'FastAPI');
  assert.equal(spec.needsPostgres, true);
  assert.equal(spec.port, 8000);
  assert.ok(spec.startCommand.includes('uvicorn'));

  const { dockerfileContent } = generateDockerfile(pyAppPath, spec);
  assert.ok(dockerfileContent.includes('FROM python:3.12-slim'));
});
