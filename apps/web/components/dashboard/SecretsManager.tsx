'use client';

import { useState } from 'react';
import {
  KeyRound,
  Plus,
  Trash2,
  Database,
  Lock,
  Copy,
  Check,
  Save,
  AlertCircle,
} from 'lucide-react';

interface SecretsManagerProps {
  appId: string;
  appName: string;
  databaseUrl?: string;
  envVars: Record<string, string>;
  onSaveSecrets: (updated: Record<string, string>) => Promise<void>;
}

export default function SecretsManager({
  appId,
  appName,
  databaseUrl,
  envVars = {},
  onSaveSecrets,
}: SecretsManagerProps) {
  const [vars, setVars] = useState<Array<{ key: string; value: string }>>(
    Object.entries(envVars).map(([key, value]) => ({ key, value }))
  );
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [copiedDb, setCopiedDb] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAdd = () => {
    if (!newKey.trim()) return;
    setVars([...vars, { key: newKey.trim(), value: newValue.trim() }]);
    setNewKey('');
    setNewValue('');
  };

  const handleRemove = (index: number) => {
    setVars(vars.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    const map: Record<string, string> = {};
    vars.forEach((v) => {
      if (v.key) map[v.key] = v.value;
    });
    try {
      await onSaveSecrets(map);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyDatabaseUrl = () => {
    if (databaseUrl) {
      navigator.clipboard.writeText(databaseUrl);
      setCopiedDb(true);
      setTimeout(() => setCopiedDb(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Database Provisioning Banner */}
      {databaseUrl && (
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">
                Auto-Provisioned PostgreSQL Database
              </h4>
              <p className="text-[11px] text-slate-300 font-mono mt-0.5 truncate max-w-md">
                {databaseUrl}
              </p>
            </div>
          </div>
          <button
            onClick={handleCopyDatabaseUrl}
            className="inline-flex items-center gap-1.5 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0"
          >
            {copiedDb ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedDb ? 'Copied' : 'Copy Connection URL'}
          </button>
        </div>
      )}

      {/* Secrets Card */}
      <div className="p-6 rounded-xl bg-surface border border-border/70 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-white">
              Environment Variables &amp; Secrets
            </h3>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 bg-primary text-slate-950 text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Secrets'}
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4" />
            Secrets updated successfully! Redeploy your application to apply changes.
          </div>
        )}

        <div className="space-y-3">
          {vars.map((v, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={v.key}
                onChange={(e) => {
                  const copy = [...vars];
                  copy[idx].key = e.target.value;
                  setVars(copy);
                }}
                className="w-1/3 bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-primary"
              />
              <input
                type="password"
                value={v.value}
                onChange={(e) => {
                  const copy = [...vars];
                  copy[idx].value = e.target.value;
                  setVars(copy);
                }}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => handleRemove(idx)}
                className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                title="Remove variable"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add New Var */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              placeholder="VARIABLE_NAME"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="w-1/3 bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-primary"
            />
            <input
              type="text"
              placeholder="value or secret token"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleAdd}
              disabled={!newKey}
              className="bg-surface-elevated hover:bg-slate-700 text-slate-200 border border-border px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
