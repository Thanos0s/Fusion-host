import * as http from 'node:http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import type { AppRecord, Deployment } from '@fusionhost/types';
import { analyzeProject } from '@fusionhost/engine';
import { store } from './store/memory.js';
import { orchestrator } from './orchestrator/docker.js';
import { handleProxyRequest } from './proxy/router.js';

export function createServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Proxy interceptor for subdomain routing: <app>.localhost:4000
  app.use((req, res, next) => {
    const host = req.headers.host || '';
    const match = host.match(/^([a-z0-9-_]+)\.localhost(?::\d+)?$/i);
    if (match && !req.path.startsWith('/api') && !req.path.startsWith('/ws')) {
      const appName = match[1];
      return handleProxyRequest(req, res, appName, req.url);
    }
    next();
  });

  // Path-based proxy router: /live/:appName/*
  app.use('/live/:appName', (req, res) => {
    const appName = req.params.appName;
    const stripped = req.url === '/' ? '/' : req.url;
    handleProxyRequest(req, res, appName, stripped);
  });

  // Root endpoint
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      service: 'fusionhost-control-plane',
      status: 'operational',
      version: '1.0.0',
      dashboard: 'http://localhost:3000/dashboard',
      docs: 'http://localhost:3000/docs',
      activeRoutes: store.getAllRoutes().map(r => ({
        appName: r.appName,
        liveUrl: `http://localhost:4000/live/${r.appName}`,
        targetPort: r.targetPort,
        status: r.status,
      }))
    });
  });

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'fusionhost-control-plane', timestamp: new Date().toISOString() });
  });

  // 1. Analyze repository endpoint
  app.post('/api/analyze', async (req: Request, res: Response) => {
    try {
      const { path: projectPath, envVars } = req.body;
      if (!projectPath) {
        return res.status(400).json({ error: 'Missing path parameter' });
      }
      const spec = await analyzeProject(projectPath, { suppliedEnvVars: envVars });
      res.json(spec);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Deploy application endpoint
  app.post('/api/deploy', async (req: Request, res: Response) => {
    try {
      const { path: sourcePath, appName: customName, envVars = {} } = req.body;
      if (!sourcePath) {
        return res.status(400).json({ error: 'Missing source path' });
      }

      // Analyze project
      const spec = await analyzeProject(sourcePath, { suppliedEnvVars: envVars });
      const appName = customName || spec.appName || 'my-app';
      const safeAppName = appName.toLowerCase().replace(/[^a-z0-9-_]/g, '-');

      // Find or create AppRecord
      let appRecord = store.getAppByName(safeAppName);
      if (!appRecord) {
        appRecord = {
          id: crypto.randomUUID(),
          name: safeAppName,
          sourcePath: path.resolve(sourcePath),
          status: 'QUEUED',
          liveUrl: `http://localhost:4000/live/${safeAppName}`,
          port: spec.port,
          needsPostgres: spec.needsPostgres,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      // Create Deployment
      const deployId = crypto.randomUUID().slice(0, 8);
      const deployment: Deployment = {
        id: deployId,
        appId: appRecord.id,
        appName: safeAppName,
        status: 'QUEUED',
        imageTag: `fusionhost/${safeAppName}:${deployId}`,
        port: spec.port,
        internalPort: spec.port,
        envVars,
        appSpec: spec,
        logs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      appRecord.activeDeploymentId = deployId;
      appRecord.status = 'BUILDING';
      appRecord.sourcePath = path.resolve(sourcePath);
      appRecord.updatedAt = new Date().toISOString();

      store.saveApp(appRecord);
      store.saveDeployment(deployment);

      // Trigger asynchronous orchestrator deployment
      orchestrator.deploy(deployment, spec, path.resolve(sourcePath)).catch((err) => {
        store.appendLog(deployId, `[Fatal Error] Deploy failed: ${err.message}`);
        store.updateDeploymentStatus(deployId, 'FAILED');
      });

      res.status(202).json({
        success: true,
        deploymentId: deployId,
        appId: appRecord.id,
        appName: safeAppName,
        liveUrl: appRecord.liveUrl,
        status: 'BUILDING',
        appSpec: spec,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. List applications
  app.get('/api/apps', (_req: Request, res: Response) => {
    res.json({ apps: store.listApps() });
  });

  // 4. Get application details
  app.get('/api/apps/:id', (req: Request, res: Response) => {
    const appRecord = store.getApp(req.params.id) || store.getAppByName(req.params.id);
    if (!appRecord) return res.status(404).json({ error: 'App not found' });
    const deployments = store.getDeploymentsByApp(appRecord.id);
    res.json({ app: appRecord, deployments });
  });

  // 5. Get deployment details
  app.get('/api/deployments/:id', (req: Request, res: Response) => {
    const deployment = store.getDeployment(req.params.id);
    if (!deployment) return res.status(404).json({ error: 'Deployment not found' });
    res.json(deployment);
  });

  // 6. Get deployment logs
  app.get('/api/deployments/:id/logs', (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 100;
    const logs = store.getLogs(req.params.id, limit);
    res.json({ deploymentId: req.params.id, logs });
  });

  // 7. Rollback endpoint
  app.post('/api/rollback', async (req: Request, res: Response) => {
    const { appName, targetDeploymentId } = req.body;
    if (!appName || !targetDeploymentId) {
      return res.status(400).json({ error: 'Missing appName or targetDeploymentId' });
    }
    const rolledBack = await orchestrator.rollback(appName, targetDeploymentId);
    if (!rolledBack) {
      return res.status(404).json({ error: 'Target deployment not found' });
    }
    res.json({ success: true, rolledBack });
  });

  // 8. Update environment variables
  app.post('/api/apps/:id/secrets', (req: Request, res: Response) => {
    const appRecord = store.getApp(req.params.id);
    if (!appRecord) return res.status(404).json({ error: 'App not found' });
    const { envVars = {} } = req.body;

    if (appRecord.activeDeploymentId) {
      const active = store.getDeployment(appRecord.activeDeploymentId);
      if (active) {
        active.envVars = { ...active.envVars, ...envVars };
        store.saveDeployment(active);
      }
    }
    res.json({ success: true, message: 'Secrets updated. Redeploy to apply changes to container.' });
  });

  const httpServer = http.createServer(app);

  // WebSocket Server for live terminal logs
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    const pathname = request.url ? new URL(request.url, 'http://localhost').pathname : '';
    if (pathname.startsWith('/ws/logs/')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
    const pathname = req.url ? new URL(req.url, 'http://localhost').pathname : '';
    const deployId = pathname.replace('/ws/logs/', '').trim();

    // Stream initial logs
    const initialLogs = store.getLogs(deployId);
    for (const line of initialLogs) {
      ws.send(JSON.stringify({ type: 'log', line }));
    }

    // Interval to poll newly added logs
    let sentCount = initialLogs.length;
    const interval = setInterval(() => {
      const allLogs = store.getLogs(deployId, 1000);
      if (allLogs.length > sentCount) {
        const newLines = allLogs.slice(sentCount);
        sentCount = allLogs.length;
        for (const line of newLines) {
          ws.send(JSON.stringify({ type: 'log', line }));
        }
      }
    }, 500);

    ws.on('close', () => clearInterval(interval));
  });

  return { app, httpServer };
}
