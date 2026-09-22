'use client';

import { useState } from 'react';
import {
  Globe,
  RefreshCw,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface LivePreviewIframeProps {
  appName: string;
  liveUrl: string;
  status: string;
}

export default function LivePreviewIframe({
  appName,
  liveUrl,
  status,
}: LivePreviewIframeProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);

  const deviceWidths = {
    desktop: { width: '100%' },
    tablet: { width: '100%', maxWidth: 768, margin: '0 auto' },
    mobile: { width: '100%', maxWidth: 390, margin: '0 auto' },
  };

  return (
    <div style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: '#0d0d0d', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Browser Chrome Header */}
      <div style={{ padding: '10px 16px', background: '#111', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        {/* URL Pill */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#000', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)' }}>
          <Globe style={{ width: 14, height: 14, color: '#8b5cf6', flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{liveUrl || `http://${appName}.localhost:4000`}</span>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#22c55e', fontWeight: 700 }}>
            <ShieldCheck style={{ width: 12, height: 12 }} />
            LIVE
          </span>
        </div>

        {/* Device Viewport Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#000', padding: 3, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { id: 'desktop', icon: Laptop, title: 'Desktop view' },
            { id: 'tablet', icon: Tablet, title: 'Tablet view' },
            { id: 'mobile', icon: Smartphone, title: 'Mobile view' },
          ].map((d) => {
            const Icon = d.icon;
            const isSelected = device === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setDevice(d.id as any)}
                style={{
                  padding: 5,
                  borderRadius: 4,
                  background: isSelected ? 'rgba(124,58,237,0.2)' : 'transparent',
                  color: isSelected ? '#8b5cf6' : 'rgba(255,255,255,0.4)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                }}
                title={d.title}
              >
                <Icon style={{ width: 14, height: 14 }} />
              </button>
            );
          })}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            style={{ padding: 6, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', display: 'flex' }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
            title="Refresh preview"
          >
            <RefreshCw style={{ width: 14, height: 14 }} />
          </button>
          <a
            href={liveUrl}
            target="_blank"
            rel="noreferrer"
            style={{ padding: 6, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', display: 'flex' }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
            title="Open in new tab"
          >
            <ExternalLink style={{ width: 14, height: 14 }} />
          </a>
        </div>
      </div>

      {/* Frame Container */}
      <div style={{ padding: 16, background: '#050505', flex: 1, minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
        <div style={{ ...deviceWidths[device], height: 400, background: '#000', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', position: 'relative' }}>
          <iframe
            key={refreshKey}
            src={liveUrl}
            title={`${appName} preview`}
            style={{ width: '100%', height: '100%', border: 0, background: '#fff' }}
            onError={() => {}}
          />
          {/* Fallback Overlay if live service is loading */}
          <div style={{ position: 'absolute', inset: 0, background: '#0d0d0d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', marginBottom: 12 }}>
              <Zap style={{ width: 22, height: 22 }} />
            </div>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{appName} is Ready!</h4>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', maxWidth: 360, margin: '0 0 16px', lineHeight: 1.5 }}>
              Container is active and routed through the reverse proxy at <code style={{ color: '#8b5cf6', fontFamily: 'monospace' }}>{liveUrl}</code>
            </p>
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#7c3aed',
                color: '#fff',
                fontWeight: 600,
                padding: '8px 16px',
                borderRadius: 6,
                fontSize: 12,
                textDecoration: 'none',
              }}
            >
              Open Direct Endpoint
              <ExternalLink style={{ width: 12, height: 12 }} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
