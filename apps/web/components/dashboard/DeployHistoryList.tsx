'use client';

import { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import type { Deployment } from '@fusionhost/types';

interface DeployHistoryListProps {
  deployments: Deployment[];
  appName: string;
  onRollback: (deploymentId: string) => Promise<void>;
}

export default function DeployHistoryList({
  deployments = [],
  appName,
  onRollback,
}: DeployHistoryListProps) {
  const [rollingBackId, setRollingBackId] = useState<string | null>(null);

  const handleTriggerRollback = async (id: string) => {
    setRollingBackId(id);
    try {
      await onRollback(id);
    } finally {
      setRollingBackId(null);
    }
  };

  if (deployments.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)', background: '#0d0d0d', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
        No deployments found for this application yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {deployments.map((deploy, index) => {
        const isLatest = index === 0;
        const isHealthy = deploy.status === 'HEALTHY';

        return (
          <div
            key={deploy.id}
            style={{
              padding: '16px 20px',
              borderRadius: 10,
              border: isLatest ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
              background: isLatest ? '#0e0a1a' : '#0d0d0d',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              transition: 'border-color 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: isHealthy ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,94,0.1)',
                  border: isHealthy ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(244,63,94,0.3)',
                  color: isHealthy ? '#22c55e' : '#f43f5e',
                }}
              >
                {isHealthy ? <CheckCircle2 style={{ width: 16, height: 16 }} /> : <XCircle style={{ width: 16, height: 16 }} />}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: 13, fontFamily: 'monospace' }}>
                    Build #{deploy.id.slice(0, 7)}
                  </span>
                  {isLatest && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: '#7c3aed', color: '#fff', padding: '2px 8px', borderRadius: 4, letterSpacing: '0.05em' }}>
                      CURRENT ACTIVE RELEASE
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>
                    {deploy.imageTag}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock style={{ width: 12, height: 12 }} />
                    {new Date(deploy.createdAt).toLocaleString()}
                  </span>
                  <span>Port: :{deploy.port}</span>
                  {deploy.databaseUrl && (
                    <span style={{ color: '#22c55e', fontWeight: 600 }}>Postgres Bound</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {!isLatest && isHealthy && (
                <button
                  onClick={() => handleTriggerRollback(deploy.id)}
                  disabled={rollingBackId !== null}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#161616',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.14)',
                    padding: '6px 14px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: rollingBackId !== null ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)')}
                  title="Instantly revert to this pre-built image"
                >
                  {rollingBackId === deploy.id ? (
                    <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite', color: '#8b5cf6' }} />
                  ) : (
                    <RotateCcw style={{ width: 13, height: 13, color: '#8b5cf6' }} />
                  )}
                  Rollback to this build
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
