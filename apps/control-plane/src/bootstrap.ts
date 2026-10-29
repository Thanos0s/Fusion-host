import * as path from 'node:path';
import * as fs from 'node:fs';
import { spawn } from 'node:child_process';
import { store } from './store/memory.js';
import { getAvailablePort } from './orchestrator/docker.js';

let sampleProcess: any = null;

export async function bootstrapDemoApps(): Promise<void> {
  const sampleNodeAppPath = path.resolve(process.cwd(), 'examples/sample-node-app');

  if (!fs.existsSync(sampleNodeAppPath)) {
    console.log('[Bootstrap] Sample node app directory not found at', sampleNodeAppPath);
    return;
  }

  // 1. Seed store with demo apps so dashboard /api/apps has them
  const acmeApp = store.getAppByName('acme-saas-web') || store.getAppByName('acme-saas');
  const now = new Date().toISOString();

  if (!acmeApp) {
    store.saveApp({
      id: 'app-acme-saas',
      name: 'acme-saas-web',
      sourcePath: sampleNodeAppPath,
      activeDeploymentId: 'dep-98a12b',
      status: 'HEALTHY',
      liveUrl: 'http://localhost:4000/live/acme-saas-web',
      port: 3000,
      needsPostgres: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  // 1b. Seed initial deployment records for acme-saas
  if (!store.getDeployment('dep-98a12b')) {
    store.saveDeployment({
      id: 'dep-98a12b',
      appId: 'app-acme-saas',
      appName: 'acme-saas-web',
      status: 'HEALTHY',
      imageTag: 'fusionhost/acme-saas-web:dep-98a12b',
      port: 3000,
      internalPort: 3000,
      databaseUrl: 'postgresql://postgres:secret@fusionhost-postgres:5432/fusionhost_acme-saas-web',
      envVars: { NODE_ENV: 'production' },
      appSpec: {
        appName: 'acme-saas-web',
        runtime: 'node',
        version: '22',
        framework: 'Next.js 15',
        buildCommand: 'npm run build',
        startCommand: 'npm start',
        port: 3000,
        needsPostgres: true,
        hasExistingDockerfile: false,
        requiredEnvVars: [
          { name: 'DATABASE_URL', required: true, citedIn: 'package.json#dependencies.pg', description: 'Auto-provisioned by FusionHost' }
        ],
        citations: {
          framework: 'package.json#dependencies.next',
          startCommand: 'package.json#scripts.start',
          port: 'Next.js standard (:3000)',
          needsPostgres: 'package.json#dependencies.pg',
        },
        hazards: [],
      },
      logs: [
        `[${now}] [Analysis] Runtime: node | Framework: Next.js 15 | Port: 3000`,
        `[${now}] [Provisioning] PostgreSQL database ready! Binding DATABASE_URL to container.`,
        `[${now}] [Build] Synthesized zero-config multi-stage Dockerfile.`,
        `[${now}] [Build] Container build complete. Tagged: fusionhost/acme-saas-web:dep-98a12b`,
        `[${now}] [Health Check] Application is HEALTHY and listening!`,
        `[${now}] [Release Ready] Live URL: http://localhost:4000/live/acme-saas-web`,
      ],
      createdAt: now,
      updatedAt: now,
    });
    for (const log of [
      `[Analysis] Runtime: node | Framework: Next.js 15 | Port: 3000`,
      `[Provisioning] PostgreSQL database ready! Binding DATABASE_URL to container.`,
      `[Build] Synthesized zero-config multi-stage Dockerfile.`,
      `[Build] Container build complete. Tagged: fusionhost/acme-saas-web:dep-98a12b`,
      `[Health Check] Application is HEALTHY and listening!`,
      `[Release Ready] Live URL: http://localhost:4000/live/acme-saas-web`,
    ]) {
      store.appendLog('dep-98a12b', log);
    }
  }

  if (!store.getDeployment('dep-77f41a')) {
    const prevDate = new Date(Date.now() - 86400000).toISOString();
    store.saveDeployment({
      id: 'dep-77f41a',
      appId: 'app-acme-saas',
      appName: 'acme-saas-web',
      status: 'HEALTHY',
      imageTag: 'fusionhost/acme-saas-web:dep-77f41a',
      port: 3000,
      internalPort: 3000,
      databaseUrl: 'postgresql://postgres:secret@fusionhost-postgres:5432/fusionhost_acme-saas-web',
      envVars: { NODE_ENV: 'production' },
      appSpec: {
        appName: 'acme-saas-web',
        runtime: 'node',
        version: '22',
        framework: 'Next.js 15',
        startCommand: 'npm start',
        port: 3000,
        needsPostgres: true,
        hasExistingDockerfile: false,
        requiredEnvVars: [],
        citations: {},
        hazards: [],
      },
      logs: [
        `[${prevDate}] [Build] Previous stable release`
      ],
      createdAt: prevDate,
      updatedAt: prevDate,
    });
  }

  // 2. Launch sample node server on a dedicated internal port
  try {
    const targetPort = await getAvailablePort(5200);

    sampleProcess = spawn('node', ['server.js'], {
      cwd: sampleNodeAppPath,
      env: { ...process.env, PORT: String(targetPort) },
      shell: true,
    });

    sampleProcess.stdout.on('data', (d: Buffer) => {
      // console.log(`[acme-saas] ${d.toString().trim()}`);
    });

    sampleProcess.stderr.on('data', (d: Buffer) => {
      console.error(`[acme-saas:err] ${d.toString().trim()}`);
    });

    // Wait a brief moment to ensure socket is open
    await new Promise((r) => setTimeout(r, 600));

    // Register routes for both 'acme-saas-web' and 'acme-saas'
    store.setRoute('acme-saas-web', targetPort, undefined, 'HEALTHY');
    store.setRoute('acme-saas', targetPort, undefined, 'HEALTHY');

    console.log(`[Bootstrap] Sample app 'acme-saas-web' / 'acme-saas' live on internal port ${targetPort}`);
    console.log(`[Bootstrap] Route active: http://localhost:4000/live/acme-saas`);
    console.log(`[Bootstrap] Route active: http://localhost:4000/live/acme-saas-web`);
  } catch (err: any) {
    console.error('[Bootstrap] Failed to launch sample app:', err.message);
  }
}

// Clean up child process on exit
process.on('exit', () => {
  if (sampleProcess) {
    try { sampleProcess.kill(); } catch {}
  }
});
