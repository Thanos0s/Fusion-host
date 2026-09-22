'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  RotateCcw,
  Terminal,
  FileCheck,
  KeyRound,
  Database,
  Globe,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import type { AppRecord, Deployment, AppSpec } from '@fusionhost/types';
import LivePreviewIframe from '@/components/dashboard/LivePreviewIframe';
import TerminalLogViewer from '@/components/dashboard/TerminalLogViewer';
import AppSpecCard from '@/components/dashboard/AppSpecCard';
import DeployHistoryList from '@/components/dashboard/DeployHistoryList';
import SecretsManager from '@/components/dashboard/SecretsManager';

export default function AppDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const appId = resolvedParams.id;

  const [activeTab, setActiveTab] = useState<
    'preview' | 'logs' | 'spec' | 'deployments' | 'secrets'
  >('preview');

  // App state
  const [app, setApp] = useState<AppRecord>({
    id: appId,
    name: appId.replace('app-', ''),
    sourcePath: 'examples/sample-node-app',
    activeDeploymentId: 'dep-98a12b',
    status: 'HEALTHY',
    liveUrl: `http://localhost:4000/live/${appId.replace('app-', '')}`,
    port: 3000,
    needsPostgres: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [spec, setSpec] = useState<AppSpec>({
    appName: app.name,
    runtime: 'node',
    version: '22',
    framework: 'Next.js 15',
    buildCommand: 'npm run build',
    startCommand: 'npm start',
    port: 3000,
    needsPostgres: true,
    hasExistingDockerfile: false,
    requiredEnvVars: [
      {
        name: 'DATABASE_URL',
        required: true,
        citedIn: 'package.json#dependencies.pg',
      },
    ],
    citations: {
      framework: 'package.json#dependencies.next',
      startCommand: 'package.json#scripts.start',
      port: 'Next.js standard (:3000)',
      needsPostgres: 'package.json#dependencies.pg',
    },
    hazards: [],
  });

  const [deployments, setDeployments] = useState<Deployment[]>([
    {
      id: 'dep-98a12b',
      appId: app.id,
      appName: app.name,
      status: 'HEALTHY',
      imageTag: `fusionhost/${app.name}:dep-98a12b`,
      port: 3000,
      internalPort: 3000,
      databaseUrl: `postgresql://postgres:secret@fusionhost-postgres:5432/fusionhost_${app.name}`,
      envVars: { NODE_ENV: 'production' },
      appSpec: spec,
      logs: [
        '[10:00:01] [Analysis] Runtime: node | Framework: Next.js 15 | Port: 3000',
        '[10:00:02] [Provisioning] PostgreSQL database ready! Binding DATABASE_URL to container.',
        '[10:00:03] [Build] Synthesized zero-config multi-stage Dockerfile.',
        '[10:00:08] [Build] Docker build complete. Tagged: fusionhost/acme-saas-web:dep-98a12b',
        '[10:00:10] [Health Check] Polling http://127.0.0.1:5142...',
        '[10:00:12] [Health Check] Application is HEALTHY and listening on port 5142!',
        `[10:00:12] [Release Ready] Live URL: http://localhost:4000/live/${app.name}`,
      ],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'dep-77f41a',
      appId: app.id,
      appName: app.name,
      status: 'HEALTHY',
      imageTag: `fusionhost/${app.name}:dep-77f41a`,
      port: 3000,
      internalPort: 3000,
      databaseUrl: `postgresql://postgres:secret@fusionhost-postgres:5432/fusionhost_${app.name}`,
      envVars: { NODE_ENV: 'production' },
      appSpec: spec,
      logs: ['[09:00:00] [Build] Previous stable release'],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const [logs, setLogs] = useState<string[]>(deployments[0]?.logs || []);

  const handleRollback = async (targetDeployId: string) => {
    // Revert active release
    const target = deployments.find((d) => d.id === targetDeployId);
    if (!target) return;

    setDeployments([
      {
        ...target,
        id: `dep-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
      },
      ...deployments,
    ]);

    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [Rollback] Restored build image tag: ${target.imageTag}`,
      `[${new Date().toLocaleTimeString()}] [Rollback] Active route switched in 1.4s! Application is live.`,
    ]);
  };

  const handleSaveSecrets = async (updated: Record<string, string>) => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [Secrets] Injected ${Object.keys(updated).length} environment variables.`,
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button & App Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Applications
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-primary/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">{app.name}</h1>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {app.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{app.sourcePath}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={app.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 bg-surface-elevated hover:bg-slate-700 text-slate-200 border border-border px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-primary" />
              Open Live App
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-border/70 mb-8 space-x-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'preview'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Live Preview
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'logs'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          Terminal Logs
        </button>
        <button
          onClick={() => setActiveTab('spec')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'spec'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          App Spec &amp; Citations
        </button>
        <button
          onClick={() => setActiveTab('deployments')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'deployments'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Deployments &amp; Rollback ({deployments.length})
        </button>
        <button
          onClick={() => setActiveTab('secrets')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'secrets'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          Secrets &amp; Postgres
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'preview' && (
          <LivePreviewIframe
            appName={app.name}
            liveUrl={app.liveUrl}
            status={app.status}
          />
        )}

        {activeTab === 'logs' && (
          <TerminalLogViewer
            logs={logs}
            deploymentId={app.activeDeploymentId}
            isLive={true}
          />
        )}

        {activeTab === 'spec' && <AppSpecCard spec={spec} />}

        {activeTab === 'deployments' && (
          <DeployHistoryList
            deployments={deployments}
            appName={app.name}
            onRollback={handleRollback}
          />
        )}

        {activeTab === 'secrets' && (
          <SecretsManager
            appId={app.id}
            appName={app.name}
            databaseUrl={deployments[0]?.databaseUrl}
            envVars={deployments[0]?.envVars || {}}
            onSaveSecrets={handleSaveSecrets}
          />
        )}
      </div>
    </div>
  );
}
