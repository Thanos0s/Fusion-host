'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  ExternalLink,
  FolderUp,
  Server,
  Database,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Terminal,
  Zap,
} from 'lucide-react';
import type { AppRecord } from '@fusionhost/types';
import FolderDeployModal from '@/components/dashboard/FolderDeployModal';

const INITIAL_DEMO_APPS: AppRecord[] = [
  {
    id: 'app-acme-saas',
    name: 'acme-saas-web',
    sourcePath: 'examples/sample-node-app',
    activeDeploymentId: 'dep-98a12b',
    status: 'HEALTHY',
    liveUrl: 'http://localhost:4000/live/acme-saas-web',
    port: 3000,
    needsPostgres: true,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'app-orders-api',
    name: 'orders-fastapi',
    sourcePath: 'examples/sample-python-app',
    activeDeploymentId: 'dep-44c78e',
    status: 'HEALTHY',
    liveUrl: 'http://localhost:4000/live/orders-fastapi',
    port: 8000,
    needsPostgres: true,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'app-docs-portal',
    name: 'marketing-portal',
    sourcePath: 'examples/sample-static-app',
    activeDeploymentId: 'dep-11d99a',
    status: 'SLEEPING',
    liveUrl: 'http://localhost:4000/live/marketing-portal',
    port: 80,
    needsPostgres: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export default function DashboardPage() {
  const [apps, setApps] = useState<AppRecord[]>(INITIAL_DEMO_APPS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [liveControlPlane, setLiveControlPlane] = useState(false);

  useEffect(() => {
    // Try fetching live apps from control plane if running
    fetch('http://localhost:4000/api/apps')
      .then((res) => res.json())
      .then((data) => {
        if (data.apps && data.apps.length > 0) {
          setApps(data.apps);
          setLiveControlPlane(true);
        }
      })
      .catch(() => {
        // Fall back to demo apps
      });
  }, []);

  const handleDeployFromFolder = async (folderPath: string, appName: string) => {
    const newApp: AppRecord = {
      id: `app-${Date.now().toString().slice(-6)}`,
      name: appName.toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
      sourcePath: folderPath,
      activeDeploymentId: `dep-${Date.now().toString().slice(-6)}`,
      status: 'HEALTHY',
      liveUrl: `http://localhost:4000/live/${appName}`,
      port: 3000,
      needsPostgres: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setApps([newApp, ...apps]);

    // Also notify control plane if online
    try {
      await fetch('http://localhost:4000/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: folderPath, appName }),
      });
    } catch {
      // simulated
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
              Management Console
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Applications &amp; Services
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your live containers, inspect generated App Specs, stream logs, and trigger instant rollbacks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent-cyan hover:from-primary-hover text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md"
          >
            <FolderUp className="w-4 h-4" />
            Deploy Local Folder
          </button>
        </div>
      </div>

      {/* Usage Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
        <div className="p-4 rounded-xl bg-surface border border-border/60">
          <span className="text-[11px] font-mono text-slate-500 uppercase">Active Apps</span>
          <p className="text-2xl font-bold text-white mt-1">{apps.length} / 15</p>
          <span className="text-[11px] text-emerald-400">Pro Plan</span>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border/60">
          <span className="text-[11px] font-mono text-slate-500 uppercase">Managed Databases</span>
          <p className="text-2xl font-bold text-cyan-400 mt-1">
            {apps.filter((a) => a.needsPostgres).length} Postgres
          </p>
          <span className="text-[11px] text-slate-400">Auto-Provisioned</span>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border/60">
          <span className="text-[11px] font-mono text-slate-500 uppercase">Scale-to-Zero</span>
          <p className="text-2xl font-bold text-purple-400 mt-1">
            {apps.filter((a) => a.status === 'SLEEPING').length} Sleeping
          </p>
          <span className="text-[11px] text-slate-400">~1.8s Cold-start</span>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border/60">
          <span className="text-[11px] font-mono text-slate-500 uppercase">Agent Protocol</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">MCP Live</p>
          <span className="text-[11px] text-slate-400">Stdio / SSE</span>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">
          Deployed Applications ({apps.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => {
            const isHealthy = app.status === 'HEALTHY';
            const isSleeping = app.status === 'SLEEPING';

            return (
              <div
                key={app.id}
                className="p-6 rounded-2xl bg-surface border border-border/70 hover:border-primary/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-lg hover:shadow-primary/5"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                        isHealthy
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : isSleeping
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isHealthy
                            ? 'bg-emerald-400'
                            : isSleeping
                            ? 'bg-purple-400'
                            : 'bg-amber-400'
                        }`}
                      />
                      {app.status}
                    </span>

                    {app.needsPostgres && (
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        Postgres
                      </span>
                    )}
                  </div>

                  <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                    {app.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-1 truncate">
                    {app.sourcePath}
                  </p>

                  <div className="mt-4 p-2.5 rounded-lg bg-background border border-border/40 text-xs font-mono flex items-center justify-between text-slate-300">
                    <span className="truncate">{app.liveUrl}</span>
                    <a
                      href={app.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:text-primary-hover ml-2"
                      title="Open endpoint"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border/40 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" />
                    {new Date(app.updatedAt).toLocaleDateString()}
                  </span>

                  <Link
                    href={`/dashboard/apps/${app.id}`}
                    className="inline-flex items-center gap-1 text-primary font-semibold hover:underline text-xs"
                  >
                    Manage App
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <FolderDeployModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDeploy={handleDeployFromFolder}
      />
    </div>
  );
}
