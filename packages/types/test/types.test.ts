import test from 'node:test';
import assert from 'node:assert/strict';
import type { AppSpec, Hazard, Deployment } from '../dist/index.js';

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
