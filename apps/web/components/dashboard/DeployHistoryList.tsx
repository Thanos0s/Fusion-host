'use client';

import { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  GitCommit,
  ArrowUpRight,
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
      <div className="p-8 text-center text-xs text-slate-500 bg-surface rounded-xl border border-border/60">
        No deployments found for this application yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {deployments.map((deploy, index) => {
        const isLatest = index === 0;
        const isHealthy = deploy.status === 'HEALTHY';

        return (
          <div
            key={deploy.id}
            className={`p-4 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isLatest
                ? 'bg-surface border-primary/50 shadow-sm shadow-primary/10'
                : 'bg-surface/70 border-border/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-start sm:items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isHealthy
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                {isHealthy ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs font-mono">
                    Build #{deploy.id.slice(0, 7)}
                  </span>
                  {isLatest && (
                    <span className="text-[10px] font-semibold bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30">
                      CURRENT ACTIVE RELEASE
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">
                    {deploy.imageTag}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {new Date(deploy.createdAt).toLocaleString()}
                  </span>
                  <span>Port: :{deploy.port}</span>
                  {deploy.databaseUrl && (
                    <span className="text-emerald-400 font-medium">Postgres Bound</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {!isLatest && isHealthy && (
                <button
                  onClick={() => handleTriggerRollback(deploy.id)}
                  disabled={rollingBackId !== null}
                  className="inline-flex items-center gap-1.5 bg-surface-elevated hover:bg-slate-700 text-slate-200 border border-border px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                  title="Instantly revert to this pre-built image"
                >
                  {rollingBackId === deploy.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5 text-primary" />
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
