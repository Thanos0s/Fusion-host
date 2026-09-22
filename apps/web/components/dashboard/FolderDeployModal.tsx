'use client';

import { useState } from 'react';
import type { AppSpec } from '@fusionhost/types';

interface FolderDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (folderPath: string, appName: string) => void;
}

export default function FolderDeployModal({ isOpen, onClose, onDeploy }: FolderDeployModalProps) {
  const [folderPath, setFolderPath] = useState('examples/sample-node-app');
  const [appName, setAppName] = useState('sample-node-app');
  const [analyzing, setAnalyzing] = useState(false);
  const [previewSpec, setPreviewSpec] = useState<AppSpec | null>(null);

  if (!isOpen) return null;

  const handleSimulateAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setPreviewSpec({
        appName: appName || 'sample-node-app',
        runtime: 'node',
        version: '22',
        framework: 'Express',
        startCommand: 'node server.js',
        port: 3000,
        needsPostgres: true,
        hasExistingDockerfile: false,
        requiredEnvVars: [
          { name: 'DATABASE_URL', required: true, citedIn: 'package.json#dependencies.pg', description: 'Auto-provisioned by FusionHost' },
        ],
        citations: {
          framework: 'package.json#dependencies.express',
          startCommand: 'package.json#scripts.start',
          port: 'server.js#listen(3000)',
          needsPostgres: 'package.json#dependencies.pg',
        },
        hazards: [],
      });
    }, 600);
  };

  const handleConfirmDeploy = () => {
    onDeploy(folderPath, appName);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, maxWidth: 520, width: '100%', padding: 28, position: 'relative', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" fill="none" stroke="#8b5cf6" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#fff' }}>Deploy from Local Folder</h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', margin: '2px 0 0' }}>No Git commit or Dockerfile required.</p>
          </div>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 10.5, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', marginBottom: 6, fontWeight: 600 }}>
              Folder Path
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={folderPath}
                onChange={e => setFolderPath(e.target.value)}
                placeholder="/path/to/my-project"
                style={{ flex: 1, background: '#000', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '9px 12px', fontSize: 12.5, fontFamily: 'monospace', color: '#fff', outline: 'none' }}
              />
              <button
                onClick={handleSimulateAnalysis}
                disabled={analyzing || !folderPath}
                style={{ background: analyzing ? 'rgba(124,58,237,0.3)' : 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: 6, padding: '9px 14px', fontSize: 12.5, color: '#8b5cf6', fontWeight: 600, cursor: analyzing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
              >
                {analyzing ? (
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                ) : (
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                )}
                Analyze
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10.5, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', marginBottom: 6, fontWeight: 600 }}>
              Application Name
            </label>
            <input
              type="text"
              value={appName}
              onChange={e => setAppName(e.target.value)}
              placeholder="my-cool-service"
              style={{ width: '100%', background: '#000', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '9px 12px', fontSize: 12.5, fontFamily: 'monospace', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {previewSpec && (
            <div style={{ background: '#000', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="#22c55e"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  App Spec Verified
                </span>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#8b5cf6', background: 'rgba(139,92,246,0.12)', padding: '2px 8px', borderRadius: 4 }}>
                  {previewSpec.framework} ({previewSpec.runtime})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
                <span>Port: <strong style={{ color: '#fff' }}>:{previewSpec.port}</strong></span>
                <span>Postgres: <strong style={{ color: '#22c55e' }}>{previewSpec.needsPostgres ? 'Auto-Provision' : 'None'}</strong></span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 500, padding: '8px 12px' }}>
              Cancel
            </button>
            <button
              onClick={handleConfirmDeploy}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#7c3aed', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 13.5, fontWeight: 600, color: '#fff', cursor: 'pointer' }}
            >
              Deploy Now
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
