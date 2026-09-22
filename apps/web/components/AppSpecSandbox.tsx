'use client';

import { useState } from 'react';
import {
  Database,
  Terminal,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Zap,
} from 'lucide-react';
import type { AppSpec } from '@fusionhost/types';

interface Preset {
  id: string;
  name: string;
  runtime: 'node' | 'python';
  framework: string;
  files: Record<string, string>;
  spec: AppSpec;
  dockerfile: string;
}

const PRESETS: Preset[] = [
  {
    id: 'nextjs-prisma',
    name: 'Next.js 15 + Prisma (PostgreSQL)',
    runtime: 'node',
    framework: 'Next.js',
    files: {
      'package.json': JSON.stringify(
        {
          name: 'acme-saas-web',
          version: '0.1.0',
          scripts: {
            build: 'next build',
            start: 'next start',
          },
          dependencies: {
            next: '^15.1.0',
            react: '^19.0.0',
            '@prisma/client': '^6.2.0',
          },
        },
        null,
        2
      ),
      'prisma/schema.prisma': `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`,
    },
    spec: {
      appName: 'acme-saas-web',
      runtime: 'node',
      version: '22',
      framework: 'Next.js',
      buildCommand: 'npm run build',
      startCommand: 'npm start',
      port: 3000,
      needsPostgres: true,
      hasExistingDockerfile: false,
      requiredEnvVars: [
        {
          name: 'DATABASE_URL',
          required: true,
          citedIn: 'package.json#dependencies.@prisma/client',
          description: 'Auto-provisioned by FusionHost',
        },
      ],
      citations: {
        runtime: 'package.json#engines.node (default Node 22)',
        framework: 'package.json#dependencies.next',
        buildCommand: 'package.json#scripts.build',
        startCommand: 'package.json#scripts.start',
        port: 'Next.js convention (3000)',
        needsPostgres: 'prisma/schema.prisma#datasource.provider="postgresql"',
      },
      hazards: [],
    },
    dockerfile: `# Synthesized by FusionHost (Deterministic Zero-Config Container)
FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build

EXPOSE 3000
USER node
CMD ["npm", "start"]`,
  },
  {
    id: 'fastapi-postgres',
    name: 'FastAPI + asyncpg (PostgreSQL)',
    runtime: 'python',
    framework: 'FastAPI',
    files: {
      'requirements.txt': `fastapi==0.115.0
uvicorn[standard]==0.32.0
asyncpg==0.30.0
pydantic==2.10.0`,
      'main.py': `from fastapi import FastAPI
import os

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "healthy", "service": "orders-api"}`,
    },
    spec: {
      appName: 'orders-api',
      runtime: 'python',
      version: '3.12',
      framework: 'FastAPI',
      startCommand: 'uvicorn main:app --host 0.0.0.0 --port 8000',
      port: 8000,
      needsPostgres: true,
      hasExistingDockerfile: false,
      requiredEnvVars: [
        {
          name: 'DATABASE_URL',
          required: true,
          citedIn: 'requirements.txt (asyncpg)',
          description: 'Auto-provisioned by FusionHost',
        },
      ],
      citations: {
        runtime: 'Python 3.12 default runner',
        framework: 'requirements.txt (fastapi)',
        startCommand: 'inferred FastAPI entrypoint (uvicorn main:app)',
        port: 'FastAPI convention (8000)',
        needsPostgres: 'requirements.txt contains asyncpg',
      },
      hazards: [],
    },
    dockerfile: `# Synthesized by FusionHost (Deterministic Zero-Config Container)
FROM python:3.12-slim AS base
WORKDIR /app
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

COPY requirements.txt* ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
  },
  {
    id: 'express-sqlite-hazard',
    name: 'Express + SQLite (Hazard Warning)',
    runtime: 'node',
    framework: 'Express',
    files: {
      'package.json': JSON.stringify(
        {
          name: 'legacy-catalog-api',
          scripts: { start: 'node server.js' },
          dependencies: { express: '^4.21.0', sqlite3: '^5.1.7' },
        },
        null,
        2
      ),
      'server.js': `const express = require('express');
const fs = require('fs');
const app = express();

app.post('/log', (req, res) => {
  fs.writeFileSync('audit.log', 'transaction data');
  res.send('logged');
});
app.listen(3000);`,
    },
    spec: {
      appName: 'legacy-catalog-api',
      runtime: 'node',
      version: '22',
      framework: 'Express',
      startCommand: 'npm start',
      port: 3000,
      needsPostgres: false,
      hasExistingDockerfile: false,
      requiredEnvVars: [],
      citations: {
        framework: 'package.json#dependencies.express',
        startCommand: 'package.json#scripts.start',
        port: 'server.js#app.listen(3000)',
      },
      hazards: [
        {
          ruleId: 'ephemeral-disk-write',
          severity: 'warning',
          message:
            'Local filesystem write detected: fs.writeFileSync("audit.log"). Changes to local disk will be wiped on redeploy.',
          fileCitation: 'server.js#L6',
          suggestion:
            'Use FusionHost auto-provisioned PostgreSQL or external storage instead of local disk writes.',
        },
        {
          ruleId: 'ephemeral-disk-write',
          severity: 'warning',
          message:
            'SQLite dependency detected (sqlite3). Container disk is ephemeral by design.',
          fileCitation: 'package.json#dependencies.sqlite3',
          suggestion: 'Switch to PostgreSQL to prevent loss of database records.',
        },
      ],
    },
    dockerfile: `# Synthesized by FusionHost (Deterministic Zero-Config Container)
FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
EXPOSE 3000
USER node
CMD ["node", "server.js"]`,
  },
];

export default function AppSpecSandbox() {
  const [selectedPreset, setSelectedPreset] = useState<Preset>(PRESETS[0]);
  const [activeTab, setActiveTab] = useState<'spec' | 'citations' | 'hazards' | 'dockerfile'>('spec');

  return (
    <div style={{ width: '100%', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 28 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }} />
            <span style={{ fontSize: 10.5, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#8b5cf6', fontWeight: 600 }}>
              Live Code Analysis Engine Demo
            </span>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            Deterministic App Spec Inspector
          </h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '4px 0 0' }}>
            Every conclusion traces directly to a specific line in your repository. No guessing.
          </p>
        </div>

        {/* Preset Selector */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          {PRESETS.map((p) => {
            const isSelected = selectedPreset.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPreset(p)}
                style={{
                  fontSize: 12,
                  padding: '7px 12px',
                  borderRadius: 6,
                  border: isSelected ? '1px solid #7c3aed' : '1px solid rgba(255,255,255,0.1)',
                  background: isSelected ? 'rgba(124,58,237,0.15)' : '#000',
                  color: isSelected ? '#fff' : 'rgba(255,255,255,0.5)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Code input view vs Inferred Spec */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 20, marginTop: 24 }}>
        {/* Left Column: Source Manifest */}
        <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileCode style={{ width: 14, height: 14, color: '#8b5cf6' }} />
              Source Manifest in Repo
            </span>
            <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
              Zero Dockerfile Required
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(selectedPreset.files).map(([filename, content]) => (
              <div
                key={filename}
                style={{ background: '#000', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}
              >
                <div style={{ padding: '6px 12px', background: '#111', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.45)' }}>
                  <span>{filename}</span>
                  <span style={{ color: '#22c55e' }}>Scanned</span>
                </div>
                <pre style={{ padding: 12, fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)', overflowX: 'auto', lineHeight: 1.6, margin: 0, maxHeight: 180 }}>
                  <code>{content}</code>
                </pre>
              </div>
            ))}
          </div>

          <div style={{ padding: 12, borderRadius: 8, background: '#111', border: '1px solid rgba(255,255,255,0.06)', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              <Zap style={{ width: 14, height: 14, color: '#8b5cf6' }} />
              Engine Analysis Time: <span style={{ color: '#22c55e', fontFamily: 'monospace' }}>1.2ms</span>
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '4px 0 0' }}>
              Static analysis runs directly in the MCP tool or CLI without uploading code to any cloud service.
            </p>
          </div>
        </div>

        {/* Right Column: Inferred App Spec and Tabs */}
        <div style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', background: '#000', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0d0d0d', padding: '0 8px', overflowX: 'auto' }}>
            {[
              { id: 'spec', label: 'App Spec', icon: FileCheck },
              { id: 'citations', label: `File Citations (${Object.keys(selectedPreset.spec.citations).length})`, icon: CheckCircle2 },
              { id: 'hazards', label: `Hazards (${selectedPreset.spec.hazards.length})`, icon: AlertTriangle },
              { id: 'dockerfile', label: 'Synthetic Container', icon: Terminal },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  style={{
                    padding: '10px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? '2px solid #7c3aed' : '2px solid transparent',
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon style={{ width: 13, height: 13, color: isActive ? '#8b5cf6' : 'currentColor' }} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          <div style={{ padding: 16, flex: 1, overflowY: 'auto', maxHeight: 380 }}>
            {activeTab === 'spec' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  <div style={{ padding: 12, background: '#0d0d0d', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 10, textTransform: 'uppercase', fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>Framework</span>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: '4px 0 0' }}>
                      {selectedPreset.spec.framework}
                    </p>
                  </div>
                  <div style={{ padding: 12, background: '#0d0d0d', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 10, textTransform: 'uppercase', fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>Runtime</span>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: '4px 0 0', textTransform: 'capitalize' }}>
                      {selectedPreset.spec.runtime} v{selectedPreset.spec.version}
                    </p>
                  </div>
                  <div style={{ padding: 12, background: '#0d0d0d', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 10, textTransform: 'uppercase', fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>Port Inferred</span>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#8b5cf6', fontFamily: 'monospace', margin: '4px 0 0' }}>
                      :{selectedPreset.spec.port}
                    </p>
                  </div>
                </div>

                <div style={{ padding: 14, background: '#0d0d0d', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.45)' }}>Start Command:</span>
                    <code style={{ background: '#000', padding: '2px 8px', borderRadius: 4, color: '#22c55e', fontFamily: 'monospace' }}>
                      {selectedPreset.spec.startCommand}
                    </code>
                  </div>
                  {selectedPreset.spec.buildCommand && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'rgba(255,255,255,0.45)' }}>Build Command:</span>
                      <code style={{ background: '#000', padding: '2px 8px', borderRadius: 4, color: '#8b5cf6', fontFamily: 'monospace' }}>
                        {selectedPreset.spec.buildCommand}
                      </code>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.45)' }}>Auto PostgreSQL Provisioning:</span>
                    <span
                      style={{
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        color: selectedPreset.spec.needsPostgres ? '#22c55e' : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      <Database style={{ width: 14, height: 14 }} />
                      {selectedPreset.spec.needsPostgres ? 'YES (Auto-created)' : 'NO'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'citations' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>
                  FusionHost deterministically grounds every infrastructure setting in code:
                </p>
                {Object.entries(selectedPreset.spec.citations).map(([key, source]) => (
                  <div
                    key={key}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 6,
                      background: '#0d0d0d',
                      border: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 12,
                    }}
                  >
                    <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>{key}</span>
                    <span style={{ fontFamily: 'monospace', color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>
                      {source}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'hazards' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedPreset.spec.hazards.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    <CheckCircle2 style={{ width: 32, height: 32, color: '#22c55e', margin: '0 auto 8px', opacity: 0.8 }} />
                    <p style={{ color: '#fff', fontWeight: 600, margin: '0 0 4px' }}>No Infrastructure Hazards Detected</p>
                    <p style={{ color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                      This repository has zero ephemeral disk writes and zero missing secrets. Safe to ship!
                    </p>
                  </div>
                ) : (
                  selectedPreset.spec.hazards.map((h, i) => (
                    <div
                      key={i}
                      style={{ padding: 12, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 8, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <AlertTriangle style={{ width: 14, height: 14 }} />
                          {h.ruleId}
                        </span>
                        {h.fileCitation && (
                          <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                            {h.fileCitation}
                          </span>
                        )}
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>{h.message}</p>
                      {h.suggestion && (
                        <p style={{ color: 'rgba(251,191,36,0.8)', fontSize: 11, fontStyle: 'italic', margin: 0 }}>
                          Tip: {h.suggestion}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'dockerfile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>
                  <span>Generated by FusionHost Build Service</span>
                  <span style={{ color: '#8b5cf6' }}>Multi-Stage Non-Root</span>
                </div>
                <pre style={{ padding: 12, background: '#0d0d0d', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', fontSize: 11, fontFamily: 'monospace', color: '#8b5cf6', overflowX: 'auto', lineHeight: 1.6, margin: 0 }}>
                  <code>{selectedPreset.dockerfile}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
