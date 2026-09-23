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
