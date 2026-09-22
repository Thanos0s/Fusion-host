'use client';

import { useState, useEffect, useRef } from 'react';
import { Terminal, Search, ArrowDown } from 'lucide-react';

interface TerminalLogViewerProps {
  logs: string[];
  deploymentId?: string;
  isLive?: boolean;
}

export default function TerminalLogViewer({
  logs = [],
  deploymentId,
  isLive = true,
}: TerminalLogViewerProps) {
  const [filter, setFilter] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter((l) =>
    l.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    if (autoScroll) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  return (
    <div
      style={{
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.08)',
        background: '#050505',
        display: 'flex',
        flexDirection: 'column',
        height: 480,
        overflow: 'hidden',
        fontFamily: 'monospace',
        fontSize: 12,
      }}
    >
      {/* Terminal Header */}
      <div
        style={{
          padding: '10px 16px',
          background: '#0d0d0d',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'inline-block', opacity: 0.8 }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#eab308', display: 'inline-block', opacity: 0.8 }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', display: 'inline-block', opacity: 0.8 }} />
          </div>
          <Terminal style={{ width: 14, height: 14, color: '#8b5cf6' }} />
          <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 11.5 }}>
            Live Container &amp; Build Logs {deploymentId ? `(${deploymentId})` : ''}
          </span>
          {isLive && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 10,
                color: '#22c55e',
                fontWeight: 700,
                background: 'rgba(34,197,94,0.1)',
                padding: '2px 8px',
                borderRadius: 4,
                border: '1px solid rgba(34,197,94,0.25)',
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              STREAMING
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search style={{ width: 12, height: 12, position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter logs..."
              style={{
                background: '#000',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 4,
                padding: '4px 8px 4px 26px',
                fontSize: 11,
                color: '#fff',
                outline: 'none',
                width: 150,
              }}
            />
          </div>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            style={{
              padding: '5px 8px',
              borderRadius: 4,
              border: autoScroll ? '1px solid #7c3aed' : '1px solid rgba(255,255,255,0.1)',
              background: autoScroll ? 'rgba(124,58,237,0.15)' : 'transparent',
              color: autoScroll ? '#8b5cf6' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title={autoScroll ? 'Auto-scroll enabled' : 'Auto-scroll paused'}
          >
            <ArrowDown style={{ width: 12, height: 12 }} />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, userSelect: 'text' }}>
        {filteredLogs.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
            Waiting for deployment logs...
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            let color = 'rgba(255,255,255,0.7)';
            if (log.includes('[Fatal Error]') || log.includes('[Docker Error]') || log.includes('[CRASHED]') || log.includes('stderr')) {
              color = '#f43f5e';
            } else if (log.includes('[Hazard') || log.includes('[Warning]')) {
              color = '#fbbf24';
            } else if (log.includes('[Health Check]') || log.includes('[Release Ready]') || log.includes('HEALTHY')) {
              color = '#22c55e';
            } else if (log.includes('[Build]') || log.includes('[Docker Build]')) {
              color = '#8b5cf6';
            } else if (log.includes('[Provisioning]')) {
              color = '#a78bfa';
            }

            return (
              <div key={index} style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all', color }}>
                {log}
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
