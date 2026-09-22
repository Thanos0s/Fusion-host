'use client';

import { useState, useEffect, useRef } from 'react';
import { Terminal, Play, Pause, Trash2, Search, ArrowDown } from 'lucide-react';

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
    <div className="rounded-xl border border-border/70 bg-background flex flex-col h-[460px] overflow-hidden shadow-inner font-mono text-xs">
      {/* Terminal Header */}
      <div className="px-4 py-2.5 bg-surface-elevated/80 border-b border-border/50 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <Terminal className="w-3.5 h-3.5 text-primary" />
          <span className="text-slate-300 font-semibold text-[11px]">
            Live Container &amp; Build Logs {deploymentId ? `(${deploymentId})` : ''}
          </span>
          {isLive && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              STREAMING
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter logs..."
              className="bg-surface border border-border/60 rounded px-2 pl-6 py-1 text-[11px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary w-32 sm:w-44"
            />
          </div>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded border transition-colors ${
              autoScroll
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-surface border-border text-slate-400 hover:text-white'
            }`}
            title={autoScroll ? 'Auto-scroll enabled' : 'Auto-scroll paused'}
          >
            <ArrowDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-1 select-text">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 italic">
            Waiting for deployment logs...
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            let color = 'text-slate-300';
            if (log.includes('[Fatal Error]') || log.includes('[Docker Error]') || log.includes('[CRASHED]') || log.includes('stderr')) {
              color = 'text-rose-400';
            } else if (log.includes('[Hazard') || log.includes('[Warning]')) {
              color = 'text-amber-400';
            } else if (log.includes('[Health Check]') || log.includes('[Release Ready]') || log.includes('HEALTHY')) {
              color = 'text-emerald-400';
            } else if (log.includes('[Build]') || log.includes('[Docker Build]')) {
              color = 'text-cyan-300';
            } else if (log.includes('[Provisioning]')) {
              color = 'text-purple-300';
            }

            return (
              <div key={index} className={`leading-relaxed whitespace-pre-wrap break-all ${color}`}>
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
