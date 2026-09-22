import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { analyzeProject, generateDockerfile } from '../dist/index.js';

test('analyzeProject: accurately analyzes Node.js Next.js app with PostgreSQL', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fusionhost-test-node-'));

  try {
    const pkg = {
      name: 'my-next-app',
      version: '1.0.0',
      engines: { node: '>=20' },
      scripts: {
        build: 'next build',
        start: 'next start'
      },
      dependencies: {
        next: '^15.0.0',
        react: '^19.0.0',
        pg: '^8.13.0'
      }
    };
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(pkg, null, 2));

    const spec = await analyzeProject(tmpDir);

    assert.equal(spec.appName, 'my-next-app');
    assert.equal(spec.runtime, 'node');
    assert.equal(spec.framework, 'Next.js');
    assert.equal(spec.port, 3000);
    assert.equal(spec.needsPostgres, true);
    assert.equal(spec.buildCommand, 'npm run build');
    assert.equal(spec.startCommand, 'npm start');
    assert.ok(spec.citations['needsPostgres']?.includes('pg'));

    const { dockerfileContent } = generateDockerfile(tmpDir, spec);
    assert.ok(dockerfileContent.includes('FROM node:22-bookworm-slim'));
    assert.ok(dockerfileContent.includes('USER node'));
    assert.ok(dockerfileContent.includes('EXPOSE 3000'));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('analyzeProject: accurately analyzes Python FastAPI app with PostgreSQL and hazards', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fusionhost-test-py-'));

  try {
    fs.writeFileSync(
      path.join(tmpDir, 'requirements.txt'),
      'fastapi==0.115.0\nuvicorn==0.32.0\npsycopg2-binary==2.9.10\n'
    );
    fs.writeFileSync(
      path.join(tmpDir, 'main.py'),
      `from fastapi import FastAPI\nimport os\n\napp = FastAPI()\n\nwith open('cache.txt', 'w') as f:\n    f.write('test')\n`
    );

    const spec = await analyzeProject(tmpDir);

    assert.equal(spec.runtime, 'python');
    assert.equal(spec.framework, 'FastAPI');
    assert.equal(spec.port, 8000);
    assert.equal(spec.needsPostgres, true);
    assert.ok(spec.startCommand.includes('uvicorn'));

    // Verify hazard detection
    const diskWriteHazard = spec.hazards.find(h => h.ruleId === 'ephemeral-disk-write');
    assert.ok(diskWriteHazard, 'Expected ephemeral disk write hazard to be detected');
    assert.ok(diskWriteHazard?.fileCitation?.includes('main.py'));

    const { dockerfileContent } = generateDockerfile(tmpDir, spec);
    assert.ok(dockerfileContent.includes('FROM python:3.12-slim'));
    assert.ok(dockerfileContent.includes('pip install --no-cache-dir'));
    assert.ok(dockerfileContent.includes('EXPOSE 8000'));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
