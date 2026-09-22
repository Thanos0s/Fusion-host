'use client';

import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Database,
} from 'lucide-react';
import type { AppSpec } from '@fusionhost/types';

interface AppSpecCardProps {
  spec: AppSpec;
}

export default function AppSpecCard({ spec }: AppSpecCardProps) {
  if (!spec) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Spec Overview */}
      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <FileCheck style={{ width: 16, height: 16, color: '#8b5cf6' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#fff' }}>Inferred Application Spec</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          <div style={{ padding: 14, background: '#000', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>Framework</span>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: '#fff', margin: '4px 0 0' }}>{spec.framework}</p>
          </div>
          <div style={{ padding: 14, background: '#000', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>Runtime</span>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: '#fff', margin: '4px 0 0', textTransform: 'capitalize' }}>{spec.runtime} v{spec.version}</p>
          </div>
          <div style={{ padding: 14, background: '#000', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>Port</span>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: '#8b5cf6', fontFamily: 'monospace', margin: '4px 0 0' }}>:{spec.port}</p>
          </div>
          <div style={{ padding: 14, background: '#000', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>Database</span>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: '#22c55e', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Database style={{ width: 14, height: 14 }} />
              {spec.needsPostgres ? 'PostgreSQL' : 'None'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, background: '#000', padding: 16, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>Start Command:</span>
            <code style={{ color: '#22c55e', fontFamily: 'monospace' }}>{spec.startCommand}</code>
          </div>
          {spec.buildCommand && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.45)' }}>Build Command:</span>
              <code style={{ color: '#8b5cf6', fontFamily: 'monospace' }}>{spec.buildCommand}</code>
            </div>
          )}
        </div>
      </div>

      {/* Citations */}
      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 style={{ width: 16, height: 16, color: '#22c55e' }} />
          Deterministic Manifest Citations
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries(spec.citations || {}).map(([key, source]) => (
            <div
              key={key}
              style={{
                padding: '10px 14px',
                borderRadius: 6,
                background: '#000',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 12,
                fontFamily: 'monospace',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.45)', textTransform: 'capitalize' }}>{key}</span>
              <span style={{ color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>
                {source}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hazards */}
      {spec.hazards && spec.hazards.length > 0 && (
        <div style={{ background: '#0d0d0d', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 12, padding: 24 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle style={{ width: 16, height: 16 }} />
            Detected Hazards ({spec.hazards.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {spec.hazards.map((h, i) => (
              <div key={i} style={{ padding: 12, background: 'rgba(251,191,36,0.06)', borderRadius: 8, border: '1px solid rgba(251,191,36,0.18)', fontSize: 12 }}>
                <div style={{ fontWeight: 600, color: '#fbbf24' }}>{h.message}</div>
                {h.fileCitation && <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{h.fileCitation}</div>}
                {h.suggestion && <div style={{ fontSize: 11, color: 'rgba(251,191,36,0.8)', marginTop: 4, fontStyle: 'italic' }}>Tip: {h.suggestion}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
