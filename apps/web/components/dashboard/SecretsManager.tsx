'use client';

import { useState } from 'react';
import {
  KeyRound,
  Plus,
  Trash2,
  Database,
  Copy,
  Check,
  Save,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Database Provisioning Banner */}
      {databaseUrl && (
        <div
          style={{
            padding: 16,
            borderRadius: 10,
            background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.25)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(124,58,237,0.18)',
                color: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Database style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>
                Auto-Provisioned PostgreSQL Database
              </h4>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', margin: '3px 0 0', maxWidth: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {databaseUrl}
              </p>
            </div>
          </div>
          <button
            onClick={handleCopyDatabaseUrl}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              background: 'rgba(124,58,237,0.15)',
              color: '#8b5cf6',
              border: '1px solid rgba(124,58,237,0.35)',
              padding: '6px 12px',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {copiedDb ? <Check style={{ width: 13, height: 13 }} /> : <Copy style={{ width: 13, height: 13 }} />}
            {copiedDb ? 'Copied' : 'Copy Connection URL'}
          </button>
        </div>
      )}

      {/* Secrets Card */}
      <div style={{ padding: 24, borderRadius: 12, background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <KeyRound style={{ width: 16, height: 16, color: '#8b5cf6' }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>
              Environment Variables &amp; Secrets
            </h3>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#7c3aed',
              color: '#fff',
              fontSize: 12.5,
              fontWeight: 600,
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            <Save style={{ width: 14, height: 14 }} />
            {saving ? 'Saving...' : 'Save Secrets'}
          </button>
        </div>

        {savedSuccess && (
          <div style={{ padding: 12, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e', fontSize: 12.5, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Check style={{ width: 14, height: 14 }} />
            Secrets updated successfully! Redeploy your application to apply changes.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {vars.map((v, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="text"
                value={v.key}
                onChange={(e) => {
                  const copy = [...vars];
                  copy[idx].key = e.target.value;
                  setVars(copy);
                }}
                style={{ width: '35%', background: '#000', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '7px 12px', fontSize: 12, fontFamily: 'monospace', color: '#fff', outline: 'none' }}
              />
              <input
                type="password"
                value={v.value}
                onChange={(e) => {
                  const copy = [...vars];
                  copy[idx].value = e.target.value;
                  setVars(copy);
                }}
                style={{ flex: 1, background: '#000', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '7px 12px', fontSize: 12, fontFamily: 'monospace', color: '#fff', outline: 'none' }}
              />
              <button
                onClick={() => handleRemove(idx)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 6, display: 'flex' }}
                onMouseOver={(e) => (e.currentTarget.style.color = '#f43f5e')}
                onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                title="Remove variable"
              >
                <Trash2 style={{ width: 15, height: 15 }} />
              </button>
            </div>
          ))}

          {/* Add New Var */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 6 }}>
            <input
              type="text"
              placeholder="VARIABLE_NAME"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              style={{ width: '35%', background: '#000', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '7px 12px', fontSize: 12, fontFamily: 'monospace', color: '#fff', outline: 'none' }}
            />
            <input
              type="text"
              placeholder="value or secret token"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              style={{ flex: 1, background: '#000', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '7px 12px', fontSize: 12, fontFamily: 'monospace', color: '#fff', outline: 'none' }}
            />
            <button
              onClick={handleAdd}
              disabled={!newKey}
              style={{
                background: '#161616',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.14)',
                padding: '7px 14px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                cursor: !newKey ? 'not-allowed' : 'pointer',
                opacity: !newKey ? 0.5 : 1,
              }}
            >
              <Plus style={{ width: 14, height: 14 }} />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
