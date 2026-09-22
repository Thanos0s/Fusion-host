'use client';

import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Database,
  Terminal,
  ShieldCheck,
} from 'lucide-react';
import type { AppSpec } from '@fusionhost/types';

interface AppSpecCardProps {
  spec: AppSpec;
}

export default function AppSpecCard({ spec }: AppSpecCardProps) {
  if (!spec) return null;

  return (
    <div className="space-y-6">
      {/* Spec Overview */}
      <div className="p-6 rounded-xl bg-surface border border-border/70">
        <div className="flex items-center gap-2 mb-4">
          <FileCheck className="w-4 h-4 text-primary" />
          <h3 className="text-base font-bold text-white">Inferred Application Spec</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-3 bg-background rounded-lg border border-border/40">
            <span className="text-[10px] uppercase font-mono text-slate-500">Framework</span>
            <p className="text-sm font-semibold text-white mt-0.5">{spec.framework}</p>
          </div>
          <div className="p-3 bg-background rounded-lg border border-border/40">
            <span className="text-[10px] uppercase font-mono text-slate-500">Runtime</span>
            <p className="text-sm font-semibold text-white mt-0.5 capitalize">{spec.runtime} v{spec.version}</p>
          </div>
          <div className="p-3 bg-background rounded-lg border border-border/40">
            <span className="text-[10px] uppercase font-mono text-slate-500">Port</span>
            <p className="text-sm font-semibold text-primary font-mono mt-0.5">:{spec.port}</p>
          </div>
          <div className="p-3 bg-background rounded-lg border border-border/40">
            <span className="text-[10px] uppercase font-mono text-slate-500">Database</span>
            <p className="text-sm font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              {spec.needsPostgres ? 'PostgreSQL' : 'None'}
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs bg-background p-4 rounded-lg border border-border/40">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Start Command:</span>
            <code className="text-emerald-400 font-mono">{spec.startCommand}</code>
          </div>
          {spec.buildCommand && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Build Command:</span>
              <code className="text-cyan-400 font-mono">{spec.buildCommand}</code>
            </div>
          )}
        </div>
      </div>

      {/* Citations */}
      <div className="p-6 rounded-xl bg-surface border border-border/70">
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Deterministic Manifest Citations
        </h4>
        <div className="space-y-2">
          {Object.entries(spec.citations || {}).map(([key, source]) => (
            <div
              key={key}
              className="p-2.5 rounded-lg bg-background border border-border/40 flex items-center justify-between text-xs font-mono"
            >
              <span className="text-slate-400 capitalize">{key}</span>
              <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-[11px]">
                {source}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hazards */}
      {spec.hazards && spec.hazards.length > 0 && (
        <div className="p-6 rounded-xl bg-surface border border-amber-500/30 space-y-3">
          <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Detected Hazards ({spec.hazards.length})
          </h4>
          {spec.hazards.map((h, i) => (
            <div key={i} className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-xs">
              <div className="font-semibold text-amber-300">{h.message}</div>
              {h.fileCitation && <div className="text-[11px] font-mono text-slate-400 mt-1">{h.fileCitation}</div>}
              {h.suggestion && <div className="text-[11px] text-amber-200/80 mt-1 italic">Tip: {h.suggestion}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
