'use client';

import { useState } from 'react';
import {
  UploadCloud,
  Folder,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowRight,
  Loader2,
  Database,
} from 'lucide-react';
import type { AppSpec } from '@fusionhost/types';

interface FolderDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (folderPath: string, appName: string) => void;
}

export default function FolderDeployModal({
  isOpen,
  onClose,
  onDeploy,
}: FolderDeployModalProps) {
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
          {
            name: 'DATABASE_URL',
            required: true,
            citedIn: 'package.json#dependencies.pg',
            description: 'Auto-provisioned by FusionHost',
          },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-border/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Deploy from Local Folder</h3>
            <p className="text-xs text-slate-400">
              No Git commit or Dockerfile required. Point to a folder to analyze and ship.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Folder Path
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                placeholder="/path/to/my-project"
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleSimulateAnalysis}
                disabled={analyzing || !folderPath}
                className="bg-surface-elevated hover:bg-slate-700 text-slate-200 border border-border px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {analyzing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileCode className="w-3.5 h-3.5 text-primary" />
                )}
                Analyze
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Application Name
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="my-cool-service"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-primary"
            />
          </div>

          {previewSpec && (
            <div className="p-3.5 rounded-xl bg-background border border-border/70 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  App Spec Verified
                </span>
                <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {previewSpec.framework} ({previewSpec.runtime})
                </span>
              </div>
              <div className="text-slate-400 flex items-center justify-between text-[11px]">
                <span>Inferred Port: <strong className="text-slate-200">:{previewSpec.port}</strong></span>
                <span>Postgres: <strong className="text-emerald-400">{previewSpec.needsPostgres ? 'Auto-Provision' : 'None'}</strong></span>
              </div>
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-border/40">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDeploy}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent-cyan hover:from-primary-hover text-slate-950 font-bold px-5 py-2 rounded-lg text-xs transition-all shadow-md"
            >
              Deploy Now
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
