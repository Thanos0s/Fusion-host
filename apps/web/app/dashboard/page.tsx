'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

const statusColor = (s: string) =>
  s === 'HEALTHY' ? '#22c55e' : s === 'SLEEPING' ? '#8b5cf6' : '#fbbf24';
const statusBg = (s: string) =>
  s === 'HEALTHY' ? 'rgba(34,197,94,0.1)' : s === 'SLEEPING' ? 'rgba(139,92,246,0.1)' : 'rgba(251,191,36,0.1)';
const statusBorder = (s: string) =>
  s === 'HEALTHY' ? 'rgba(34,197,94,0.28)' : s === 'SLEEPING' ? 'rgba(139,92,246,0.28)' : 'rgba(251,191,36,0.28)';

export default function DashboardPage() {
  const [apps, setApps] = useState<AppRecord[]>(INITIAL_DEMO_APPS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [liveControlPlane, setLiveControlPlane] = useState(false);

  useEffect(() => {
    fetch('http://localhost:4000/api/apps')
      .then(res => res.json())
      .then(data => {
        if (data.apps && data.apps.length > 0) {
          setApps(data.apps);
          setLiveControlPlane(true);
        }
      })
      .catch(() => {});
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
    try {
      await fetch('http://localhost:4000/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: folderPath, appName }),
      });
    } catch {}
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 20px' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingBottom: 28, marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            <span style={{ fontSize: 10.5, fontFamily: 'monospace', color: '#22c55e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              Management Console{liveControlPlane ? ' · Live' : ' · Demo'}
            </span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 6px', color: '#fff' }}>
            Applications &amp; Services
          </h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.42)', margin: 0 }}>
            Manage your live containers, inspect generated App Specs, stream logs, and trigger instant rollbacks.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#7c3aed', color: '#fff', fontSize: 13.5, fontWeight: 600, padding: '9px 18px', borderRadius: 6, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
          Deploy Local Folder
        </button>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 36 }}>
        {[
          { label: 'Active Apps', value: `${apps.length} / 15`, sub: 'Pro Plan', color: '#fff' },
          { label: 'Managed Databases', value: `${apps.filter(a => a.needsPostgres).length} Postgres`, sub: 'Auto-Provisioned', color: '#60a5fa' },
          { label: 'Scale-to-Zero', value: `${apps.filter(a => a.status === 'SLEEPING').length} Sleeping`, sub: '~1.8s Cold-start', color: '#8b5cf6' },
          { label: 'Agent Protocol', value: 'MCP Live', sub: 'Stdio / SSE', color: '#22c55e' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '16px 20px' }}>
            <span style={{ fontSize: 10.5, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</span>
            <p style={{ fontSize: 22, fontWeight: 700, color: stat.color, margin: '4px 0 2px' }}>{stat.value}</p>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>{stat.sub}</span>
          </div>
        ))}
      </div>

      {/* Apps */}
      <div>
        <h3 style={{ fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.32)', marginBottom: 16, fontWeight: 600 }}>
          Deployed Applications ({apps.length})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {apps.map(app => (
            <div
              key={app.id}
              style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'border-color 0.15s' }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)')}
              onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', color: statusColor(app.status), background: statusBg(app.status), border: `1px solid ${statusBorder(app.status)}`, borderRadius: 99, padding: '3px 8px' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusColor(app.status), display: 'inline-block' }} />
                    {app.status}
                  </span>
                  {app.needsPostgres && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontFamily: 'monospace', color: '#60a5fa', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', borderRadius: 4, padding: '3px 7px' }}>
                      <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                      Postgres
                    </span>
                  )}
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: '#fff' }}>{app.name}</h4>
                <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.32)', margin: '0 0 14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.sourcePath}</p>
                <div style={{ background: '#000', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: '8px 12px', fontSize: 11, fontFamily: 'monospace', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.liveUrl}</span>
                  <a href={app.liveUrl} target="_blank" rel="noreferrer" style={{ color: '#8b5cf6', marginLeft: 8, flexShrink: 0 }}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                </div>
              </div>
              <div style={{ paddingTop: 14, marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {new Date(app.updatedAt).toLocaleDateString()}
                </span>
                <Link href={`/dashboard/apps/${app.id}`} style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Manage App
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FolderDeployModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onDeploy={handleDeployFromFolder} />
    </div>
  );
}
