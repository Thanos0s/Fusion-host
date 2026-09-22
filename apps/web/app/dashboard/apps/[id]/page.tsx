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
  Globe,
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

  const tabs = [
    { id: 'preview', label: 'Live Preview', icon: Globe },
    { id: 'logs', label: 'Terminal Logs', icon: Terminal },
    { id: 'spec', label: 'App Spec & Citations', icon: FileCheck },
    { id: 'deployments', label: `Deployments (${deployments.length})`, icon: RotateCcw },
    { id: 'secrets', label: 'Secrets & Postgres', icon: KeyRound },
  ] as const;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 20px' }}>
      {/* Back button & App Header */}
      <div style={{ marginBottom: 28 }}>
        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: 'rgba(255,255,255,0.45)',
            textDecoration: 'none',
            marginBottom: 16,
            transition: 'color 0.15s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          Back to Applications
        </Link>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                background: 'rgba(124,58,237,0.15)',
                border: '1px solid rgba(124,58,237,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8b5cf6',
              }}
            >
              <Layers style={{ width: 24, height: 24 }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#fff', letterSpacing: '-0.02em' }}>
                  {app.name}
                </h1>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 99,
                    background: 'rgba(34,197,94,0.1)',
                    color: '#22c55e',
                    border: '1px solid rgba(34,197,94,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                  {app.status}
                </span>
              </div>
              <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', margin: '4px 0 0' }}>
                {app.sourcePath}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a
              href={app.liveUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#111',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.14)',
                padding: '8px 14px',
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)')}
            >
              <Globe style={{ width: 14, height: 14, color: '#8b5cf6' }} />
              Open Live App
              <ExternalLink style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.4)' }} />
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          marginBottom: 32,
          gap: 6,
          overflowX: 'auto',
        }}
      >
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                padding: '10px 16px',
                fontSize: 12.5,
                fontWeight: 600,
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid #7c3aed' : '2px solid transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'color 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseOver={(e) => {
                if (!isActive) e.currentTarget.style.color = '#fff';
              }}
              onMouseOut={(e) => {
                if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
              }}
            >
              <Icon style={{ width: 14, height: 14, color: isActive ? '#8b5cf6' : 'currentColor' }} />
              {t.label}
            </button>
          );
        })}
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
