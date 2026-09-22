import * as fs from 'node:fs';
import * as path from 'node:path';
import type { AppRecord, Deployment, AppSpec, DeploymentStatus } from '@fusionhost/types';

export interface RouteBinding {
  appName: string;
  targetPort: number;
  containerId?: string;
  status: DeploymentStatus;
  lastActiveAt: number;
}

export class MemoryStore {
  private apps: Map<string, AppRecord> = new Map();
  private deployments: Map<string, Deployment> = new Map();
  private routes: Map<string, RouteBinding> = new Map();
  private logs: Map<string, string[]> = new Map();
  private storageFile: string;

  constructor(storageDir: string = path.join(process.cwd(), '.fusionhost')) {
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    this.storageFile = path.join(storageDir, 'store.json');
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf8');
        const data = JSON.parse(raw);
        if (data.apps) {
          for (const a of data.apps) this.apps.set(a.id, a);
        }
        if (data.deployments) {
          for (const d of data.deployments) this.deployments.set(d.id, d);
        }
      }
    } catch {
      // fresh start
    }
  }

  private save() {
    try {
      const data = {
        apps: Array.from(this.apps.values()),
        deployments: Array.from(this.deployments.values())
      };
      fs.writeFileSync(this.storageFile, JSON.stringify(data, null, 2));
    } catch {
      // ignore
    }
  }

  // App methods
  getApp(id: string): AppRecord | undefined {
    return this.apps.get(id);
  }

  getAppByName(name: string): AppRecord | undefined {
    for (const app of this.apps.values()) {
      if (app.name.toLowerCase() === name.toLowerCase()) return app;
    }
    return undefined;
  }

  listApps(): AppRecord[] {
    return Array.from(this.apps.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  saveApp(app: AppRecord): void {
    this.apps.set(app.id, app);
    this.save();
  }

  // Deployment methods
  getDeployment(id: string): Deployment | undefined {
    return this.deployments.get(id);
  }

  getDeploymentsByApp(appId: string): Deployment[] {
    return Array.from(this.deployments.values())
      .filter(d => d.appId === appId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  saveDeployment(deployment: Deployment): void {
    this.deployments.set(deployment.id, deployment);
    this.save();
  }

  updateDeploymentStatus(id: string, status: DeploymentStatus): void {
    const d = this.deployments.get(id);
    if (d) {
      d.status = status;
      d.updatedAt = new Date().toISOString();
      this.saveDeployment(d);

      // Update app status too
      const app = this.apps.get(d.appId);
      if (app && app.activeDeploymentId === id) {
        app.status = status;
        app.updatedAt = d.updatedAt;
        this.saveApp(app);
      }
    }
  }

  // Logs
  appendLog(deploymentId: string, message: string): void {
    const list = this.logs.get(deploymentId) || [];
    const timestamp = new Date().toLocaleTimeString();
    const entry = `[${timestamp}] ${message}`;
    list.push(entry);
    this.logs.set(deploymentId, list);

    const d = this.deployments.get(deploymentId);
    if (d) {
      d.logs.push(entry);
    }
  }

  getLogs(deploymentId: string, limit: number = 100): string[] {
    const list = this.logs.get(deploymentId) || [];
    return list.slice(-limit);
  }

  // Routes for reverse proxy
  setRoute(appName: string, targetPort: number, containerId?: string, status: DeploymentStatus = 'HEALTHY'): void {
    this.routes.set(appName.toLowerCase(), {
      appName,
      targetPort,
      containerId,
      status,
      lastActiveAt: Date.now()
    });
  }

  getRoute(appName: string): RouteBinding | undefined {
    return this.routes.get(appName.toLowerCase());
  }

  getAllRoutes(): RouteBinding[] {
    return Array.from(this.routes.values());
  }

  removeRoute(appName: string): void {
    this.routes.delete(appName.toLowerCase());
  }
}

export const store = new MemoryStore();
